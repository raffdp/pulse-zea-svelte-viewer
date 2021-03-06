<script>
  import { onMount } from 'svelte'

  import '../helpers/fps-display'

  import Menu from '../components/ContextMenu/Menu.svelte'
  import MenuOption from '../components/ContextMenu/MenuOption.svelte'
  import Dialog from '../components/Dialog.svelte'
  import ParameterOwnerWidget from './parameters/ParameterOwnerWidget.svelte'
  import Toolbar from '../components/Toolbar/Toolbar.svelte'

  import Drawer from '../components/Drawer.svelte'
  import ProgressBar from '../components/ProgressBar.svelte'
  import Sidebar from '../components/Sidebar.svelte'

  import { auth } from '../helpers/auth'

  import { APP_DATA } from '../stores/appData'
  import { assets } from '../stores/assets.js'
  import { assetLevelItems } from '../stores/assetLevelItems.js'

  import { ui } from '../stores/ui.js'
  import { selectionManager } from '../stores/selectionManager.js'
  import { scene } from '../stores/scene.js'

  import { createClient } from '../ChannelMessenger.js'
  import buildTree from '../helpers/buildTree'

  const {
    Color,
    Vec3,
    Xfo,
    TreeItem,
    GLRenderer,
    Scene,
    resourceLoader,
    SystemDesc,
    EnvMap,
    CameraManipulator,
    NumberParameter,
    ColorParameter,
  } = window.zeaEngine
  const { GLCADPass, CADAsset } = window.zeaCad
  const {
    SelectionManager,
    UndoRedoManager,
    ToolManager,
    SelectionTool,
  } = window.zeaUx

  const { Session, SessionSync } = window.zeaCollab

  let assetUrl
  let canvas
  let fpsContainer
  const urlParams = new URLSearchParams(window.location.search)
  const embeddedMode = urlParams.has('embedded')
  let progress

  const filterItemSelection = (item) => {
    // Propagate selections deep in the tree up to the part body.
    while (
      item.getName().startsWith('Mesh') ||
      item.getName().startsWith('Edge') ||
      item.getName().startsWith('TreeItem')
    )
      item = item.getOwner()
    return item
  }

  onMount(async () => {
    const renderer = new GLRenderer(canvas, {
      debugGeomIds: urlParams.has('debugGeomIds'),
      xrCompatible: false,
    })

    $scene = new Scene()

    // Assigning an Environment Map enables PBR lighting for niceer shiny surfaces.
    if (!SystemDesc.isMobileDevice && SystemDesc.gpuDesc.supportsWebGL2) {
      const envMap = new EnvMap('envMap')
      envMap
        .getParameter('FilePath')
        .setValue(`/data/HDR_029_Sky_Cloudy_Ref.vlenv`)
      envMap.getParameter('HeadLightMode').setValue(true)
      $scene.getSettings().getParameter('EnvMap').setValue(envMap)
    }

    // $scene.setupGrid(10, 10)
    $scene
      .getSettings()
      .getParameter('BackgroundColor')
      .setValue(new Color(0.85, 0.85, 0.85, 1))
    renderer.setScene($scene)
    renderer.getViewport().outlineThickness = 1.25
    renderer
      .getViewport()
      .getCamera()
      .setPositionAndTarget(new Vec3(1, -1, 1), new Vec3(0, 0, 0))

    const appData = {}

    appData.renderer = renderer
    appData.scene = $scene

    $assets = new TreeItem('Assets')
    appData.assets = $assets

    $scene.getRoot().addChild($assets)

    /** UNDO START */
    const undoRedoManager = UndoRedoManager.getInstance()
    appData.undoRedoManager = undoRedoManager
    /** UNDO END */

    /** SELECTION START */
    const cameraManipulator = renderer.getViewport().getManipulator()
    cameraManipulator.setDefaultManipulationMode(
      CameraManipulator.MANIPULATION_MODES.tumbler
    )
    appData.cameraManipulator = cameraManipulator
    const toolManager = new ToolManager(appData)
    $selectionManager = new SelectionManager(appData, {
      enableXfoHandles: true,
    })

    // Users can enable the handles usinga menu or hotkey.
    $selectionManager.showHandles(false)

    appData.selectionManager = $selectionManager

    const selectionTool = new SelectionTool(appData)
    selectionTool.setSelectionFilter(filterItemSelection)
    toolManager.registerTool('SelectionTool', selectionTool)
    toolManager.registerTool('CameraManipulator', cameraManipulator)

    renderer.getViewport().setManipulator(toolManager)
    toolManager.pushTool('CameraManipulator')
    appData.toolManager = toolManager

    // Note: the alpha value determines  the fill of the highlight.
    const selectionColor = new Color('#3871c1')

    selectionColor.a = 0.1
    const subtreeColor = selectionColor //.lerp(new Color(1, 1, 1, 0), 0.5)
    $selectionManager.selectionGroup
      .getParameter('HighlightColor')
      .setValue(selectionColor)
    $selectionManager.selectionGroup
      .getParameter('SubtreeHighlightColor')
      .setValue(subtreeColor)

    // Color the selection rect.
    const selectionRectColor = selectionColor.clone()
    selectionRectColor.a = 1
    selectionTool.rectItem
      .getParameter('Material')
      .getValue()
      .getParameter('BaseColor')
      .setValue(selectionRectColor)

    /** SELECTION END */

    /** UX START */
    renderer.getViewport().on('pointerUp', (event) => {
      // Detect a right click
      if (event.button == 0 && event.intersectionData) {
        const item = filterItemSelection(event.intersectionData.geomItem)
        $selectionManager.toggleItemSelection(item)
      } else if (event.button == 2 && event.intersectionData) {
        const item = filterItemSelection(event.intersectionData.geomItem)
        openMenu(event, item)
        // stop propagation to prevent the camera manipulator from handling the event.
        event.stopPropagation()
      }
    })

    // let highlightedItem
    // renderer.getViewport().on('pointerOverGeom', (event) => {
    //   highlightedItem = filterItemSelection(event.intersectionData.geomItem)
    //   highlightedItem.addHighlight(
    //     'pointerOverGeom',
    //     new Color(1, 1, 1, 0.1),
    //     true
    //   )
    // })
    // renderer.getViewport().on('pointerLeaveGeom', (event) => {
    //   highlightedItem.removeHighlight('pointerOverGeom', true)
    //   highlightedItem = null
    // })
    renderer.getViewport().on('pointerDoublePressed', (event) => {
      console.log(event)
    })
    /** UX END */

    /** PROGRESSBAR START */
    resourceLoader.on('progressIncremented', (event) => {
      progress = event.percent
    })
    /** PROGRESSBAR END */

    /** FPS DISPLAY START */
    const fpsDisplay = document.createElement('fps-display')
    fpsDisplay.renderer = renderer
    fpsContainer.appendChild(fpsDisplay)
    /** FPS DISPLAY END */

    /** CAD START */
    // renderer.addPass(new GLCADPass())

    $assetLevelItems = []

    const loadZCADAsset = (url) => {
      const asset = new CADAsset()

      asset.on('error', (event) => {
        console.warn('Error:', event)
      })

      asset.on('loaded', () => {
        const materials = asset.getMaterialLibrary().getMaterials()
        materials.forEach((material) => {
          const baseColor = material.getParameter('BaseColor')
          if (baseColor) baseColor.setValue(baseColor.getValue().toGamma())
          const shaderName = material.getShaderName()
          if (shaderName == 'SimpleSurfaceShader') {
            material.setShaderName('StandardSurfaceShader')
          }
        })

        const assetChildren = []
        asset.getChildren().forEach((child) => assetChildren.push(child))
        $assetLevelItems = assetChildren
      })

      asset.getGeometryLibrary().on('loaded', () => {
        renderer.frameAll()
      })

      $assets.addChild(asset)
      asset.getParameter('FilePath').setValue(url)

      return asset
    }

    const { GLTFAsset } = gltfLoader
    const loadGLTFAsset = (url) => {
      console.log('test')
      const asset = new GLTFAsset('gltf')
      asset.load(url).then(() => {
        console.log('Loading done')

        const xfo = new Xfo()
        xfo.ori.setFromAxisAndAngle(new Vec3(1, 0, 0), Math.PI * 0.5)
        const box = asset.getParameter('BoundingBox').getValue()
        xfo.tr.z = -box.p0.z
        asset.getParameter('LocalXfo').setValue(xfo)

        const assetChildren = []
        asset.getChildren().forEach((child) => assetChildren.push(child))
        $assetLevelItems = assetChildren

        renderer.frameAll()
      })
      $assets.addChild(asset)
      // asset.getParameter('FilePath').setValue(url)

      return asset
    }

    const loadAsset = (url) => {
      if (url.endsWith('zcad')) return loadZCADAsset(url)
      else if (url.endsWith('gltf') || url.endsWith('glb'))
        return loadGLTFAsset(url)
      // else throw new Exception('Unable to load asset ' + url)
    }

    if (!embeddedMode) {
      assetUrl = urlParams.has('zcad')
        ? urlParams.get('zcad')
        : urlParams.has('gltf')
        ? urlParams.get('gltf')
        : '/data/gear_box_final_asm-visu.zcad'

      loadAsset(assetUrl)
    }
    /** CAD END */

    /** COLLAB START* /
    if (!embeddedMode) {
      const SOCKET_URL = 'https://websocket-staging.zea.live'
      const roomId = assetUrl

      const userData = await auth.getUserData()

      if (!userData) {
        return
      }

      const session = new Session(userData, SOCKET_URL)
      session.joinRoom(roomId)

      const sessionSync = new SessionSync(session, appData, userData, {})

      appData.userData = userData
      appData.session = session
      appData.sessionSync = sessionSync

      APP_DATA.update(() => appData)
    }
    /** COLLAB END */

    /** EMBED MESSAGING START*/
    if (embeddedMode) {
      const client = createClient()

      client.on('takeScreenshot', (data) => {
        console.log('screenshot taken')
        const canvas = renderer.getGLCanvas()
        const dataUrl = canvas.toDataURL('image/png')
        console.log('data id ' + data._id)
        client.send(data._id, { dataUrl })
      })

      client.on('setBackgroundColor', (data) => {
        console.log('color ' + data.color)
        const color = new Color(data.color)
        $scene.getSettings().getParameter('BackgroundColor').setValue(color)

        if (data._id) {
          client.send(data._id, { done: true })
        }
      })

      client.on('loadCADFile', (data) => {
        console.log('loadCADFile', data)
        if (!data.keep) {
          $assets.removeAllChildren()
        }

        const asset = loadAsset(data.zcad)
        asset.once('loaded', () => {
          if (data._id) {
            const tree = buildTree(asset)
            client.send(data._id, { modelStructure: tree })
          }
        })
      })

      client.on('getModelStructure', (data) => {
        if (data._id) {
          const tree = buildTree($assets)
          client.send(data._id, { modelStructure: tree })
        }
      })

      client.on('unloadCADFile', (data) => {
        console.log('unloadCADFile', data)

        $assets.removeChildByName(data.name)

        if (data._id) {
          client.send(data._id, { done: true })
        }
      })

      $selectionManager.on('selectionChanged', (event) => {
        const { selection } = event
        const selectionPaths = []
        selection.forEach((item) =>
          selectionPaths.push(item.getPath().slice(2))
        )
        client.send('selectionChanged', { selection: selectionPaths })
      })
    }
    /** EMBED MESSAGING END */

    /** DYNAMIC SELECTION UI START */
    $selectionManager.on('leadSelectionChanged', (event) => {
      parameterOwner = event.treeItem
      $ui.shouldShowParameterOwnerWidget = parameterOwner
    })
    /** DYNAMIC SELECTION UI END */

    APP_DATA.set(appData)
  })

  let isMenuVisible = false
  let pos = { x: 0, y: 0 }
  let contextItem
  const openMenu = (event, item) => {
    contextItem = item
    pos = { x: event.clientX, y: event.clientY }
    isMenuVisible = true
  }
  const closeMenu = () => {
    isMenuVisible = false
  }
  let isDialogOpen = false
  const closeDialog = () => {
    isDialogOpen = false
  }

  $: parameterOwner = null
</script>

<main class="Main flex-1 relative">
  <canvas bind:this={canvas} class="absolute h-full w-full" />

  <div class="absolute bottom-10 w-full flex justify-center">
    <Toolbar />
  </div>

  <div bind:this={fpsContainer} />

  <Drawer>
    <Sidebar />
  </Drawer>

  {#if $ui.shouldShowParameterOwnerWidget}
    <ParameterOwnerWidget {parameterOwner} />
  {/if}
</main>

{#if progress < 100}
  <div class="fixed bottom-0 w-full">
    <ProgressBar {progress} />
  </div>
{/if}

<Dialog isOpen={isDialogOpen} close={closeDialog} {contextItem} />

{#if isMenuVisible}
  <Menu {...pos} on:click={closeMenu} on:clickoutside={closeMenu}>
    <MenuOption
      text="Hide"
      on:click={() => {
        contextItem.getParameter('Visible').setValue(false)
      }}
    />
    <MenuOption
      text="Properties"
      on:click={() => {
        if (contextItem) {
          isDialogOpen = true
          closeMenu()
        }
      }}
    />
  </Menu>
{/if}

<style>
  canvas {
    touch-action: none;
  }
</style>
