<script>
  import { onMount } from 'svelte'
  import { auth, APP_DATA, setupCollab } from '../helpers'
  import '../helpers/fps-display'
  import Sidebar from '../components/Sidebar.svelte'

  let canvas
  let fpsContainer

  let treeViewItems
  let appData
  let progressBar

  onMount(() => {
    const {
      Color,
      GLRenderer,
      Scene,
      resourceLoader,
      SystemDesc,
      EnvMap,
    } = window.zeaEngine

    const renderer = new GLRenderer(canvas)
    const scene = new Scene()

    // Assigning an Environment Map enables PBR lighting for niceer shiny surfaces.
    if (!SystemDesc.isMobileDevice) {
      const envMap = new EnvMap('envMap')
      envMap
        .getParameter('FilePath')
        .setValue(`/assets/HDR_029_Sky_Cloudy_Ref.vlenv`)
      envMap.getParameter('HeadLightMode').setValue(true)
      scene.getSettings().getParameter('EnvMap').setValue(envMap)
    }

    scene.setupGrid(10, 10)
    renderer.setScene(scene)
    const appData = { renderer, scene }

    treeViewItems = [scene.getRoot()]

    const {
      SelectionManager,
      UndoRedoManager,
      ToolManager,
      SelectionTool,
    } = window.zeaUx

    /** UNDO START */
    const undoRedoManager = UndoRedoManager.getInstance()
    appData.undoRedoManager = undoRedoManager
    /** UNDO END */

    /** SELECTION START */
    const cameraManipulator = renderer.getViewport().getManipulator()
    const toolManager = new ToolManager(appData)
    const selectionManager = new SelectionManager(appData)
    selectionManager.showHandles()
    appData.selectionManager = selectionManager
    const selectionTool = new SelectionTool(appData)
    toolManager.registerTool('SelectionTool', selectionTool)
    toolManager.registerTool('CameraManipulator', cameraManipulator)

    renderer.getViewport().setManipulator(toolManager)
    toolManager.pushTool('CameraManipulator')
    // toolManager.pushTool('SelectionTool')
    appData.toolManager = toolManager

    // // Note: the alpha value determines  the fill of the highlight.
    // const selectionColor = new Color('#00436D')
    // selectionColor.a = 0.1
    // const subtreeColor = selectionColor.lerp(new Color(1, 1, 1, 0), 0.5)
    // selectionManager.selectionGroup
    //   .getParameter('HighlightColor')
    //   .setValue(selectionColor)
    // selectionManager.selectionGroup
    //   .getParameter('SubtreeHighlightColor')
    //   .setValue(subtreeColor)

    /** SELECTION END */

    /** PROGRESSBAR START */
    if (progressBar) {
      progressBar.percent = 0
      resourceLoader.on('progressIncremented', (event) => {
        const { percent } = event
        if (progressBar) progressBar.percent = percent
      })
    }
    /** PROGRESSBAR END */

    /** FPS DISPLAY START */
    {
      const fpsDisplay = document.createElement('fps-display')
      fpsDisplay.renderer = renderer
      fpsContainer.appendChild(fpsDisplay)
    }
    /** FPS DISPLAY END */

    /** COLLAB START */
    auth.getUserData().then((userData) => {
      if (!userData) return
      const { session, sessionSync } = setupCollab(userData, $APP_DATA)
      appData.userData = userData
      appData.session = session
      appData.sessionSync = sessionSync
    })
    /** COLLAB END */

    /** CAD START */
    const { GLCADPass, CADAsset } = window.zeaCad
    renderer.addPass(new GLCADPass())

    const asset = new CADAsset()
    asset.on('loaded', () => {
      const materials = asset.getMaterialLibrary().getMaterials()
      materials.forEach((material) => {
        if (material.getShaderName() == 'SimpleSurfaceShader') {
          material.setShaderName('StandardSurfaceShader')
        }
      })
      renderer.frameAll()
    })
    asset.getGeometryLibrary().on('loaded', () => {
      renderer.frameAll()
    })
    scene.getRoot().addChild(asset)
    asset.getParameter('FilePath').setValue('/assets/HC_SRO4.zcad')
    /** CAD END */

    APP_DATA.set(appData)
  })
</script>

<style>
  #renderer {
    height: 100%;
    width: 100%;
  }
</style>

<zea-layout add-cells="AB" borders cell-a-size="250" show-resize-handles="A">
  <div slot="A" class="h-full w-full">
    <Sidebar rootItems={treeViewItems} {appData} />
  </div>
  <div slot="B" class="h-full w-full">
    <canvas id="renderer" bind:this={canvas} />
    <div class="relative">
      <zea-progress-bar bind:this={progressBar} />
    </div>
    <div bind:this={fpsContainer} />
  </div>
</zea-layout>
