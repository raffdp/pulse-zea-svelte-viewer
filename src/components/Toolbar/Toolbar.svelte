<script>
  export let orientation = 'horizontal'

  import IconEye from '../icons/IconEye.svelte'
  import IconEyeOff from '../icons/IconEyeOff.svelte'
  import ToolbarButton from './ToolbarButton.svelte'

  import IconFrontView from '../icons/IconFrontView.svelte'
  import IconBackView from '../icons/IconBackView.svelte'
  import IconTopView from '../icons/IconTopView.svelte'
  import IconBottomView from '../icons/IconBottomView.svelte'
  import IconLeftView from '../icons/IconLeftView.svelte'
  import IconRightView from '../icons/IconRightView.svelte'
  import IconPerspView from '../icons/IconPerspView.svelte'
  import IconRenderModeWireframe from '../icons/IconRenderModeWireframe.svelte'
  import IconRenderModeFlat from '../icons/IconRenderModeFlat.svelte'
  import IconRenderModeShaded from '../icons/IconRenderModeShaded.svelte'
  import IconRenderModeShadedAndEdges from '../icons/IconRenderModeShadedAndEdges.svelte'
  import IconRenderModePBR from '../icons/IconRenderModePBR.svelte'
  import IconRenderModeHiddenLine from '../icons/IconRenderModeHiddenLine.svelte'

  import { APP_DATA } from '../../stores/appData'

  const {
    Vec3,
    Xfo,
    Mat3,
    GeomItem,
    Mesh,
    MeshProxy,
    Lines,
    LinesProxy,
    Color,
  } = window.zeaEngine

  const setCameraXfo = (camera, dir, up) => {
    const sw = dir.cross(up).normalize()
    const upNormalized = sw.cross(dir).normalize()
    const mat3 = new Mat3(sw, upNormalized, dir.negate())
    const xfo = new Xfo()
    xfo.ori.setFromMat3(mat3)
    const target = camera.getTargetPosition()
    const dist = camera.getFocalDistance()
    xfo.tr = target.subtract(dir.scale(dist))
    camera.getParameter('GlobalXfo').setValue(xfo)
  }

  const handleChangeViewFront = () => {
    const { renderer } = $APP_DATA
    const camera = renderer.getViewport().getCamera()
    setCameraXfo(camera, new Vec3(0, 1, 0), new Vec3(0, 0, 1))
    // camera.setIsOrthographic(1.0)
  }
  const handleChangeViewBack = () => {
    const { renderer } = $APP_DATA
    const camera = renderer.getViewport().getCamera()
    setCameraXfo(camera, new Vec3(0, -1, 0), new Vec3(0, 0, 1))
    // camera.setIsOrthographic(1.0)
  }
  const handleChangeViewTop = () => {
    const { renderer } = $APP_DATA
    const camera = renderer.getViewport().getCamera()
    setCameraXfo(camera, new Vec3(0, 0, -1), new Vec3(0, 1, 0))
    // camera.setIsOrthographic(1.0)
  }
  const handleChangeViewBottom = () => {
    const { renderer } = $APP_DATA
    const camera = renderer.getViewport().getCamera()
    setCameraXfo(camera, new Vec3(0, 0, 1), new Vec3(0, -1, 0))
    // camera.setIsOrthographic(1.0)
  }
  const handleChangeViewLeft = () => {
    const { renderer } = $APP_DATA
    const camera = renderer.getViewport().getCamera()
    setCameraXfo(camera, new Vec3(1, 0, 0), new Vec3(0, 0, 1))
    // camera.setIsOrthographic(1.0)
  }
  const handleChangeViewRight = () => {
    const { renderer } = $APP_DATA
    const camera = renderer.getViewport().getCamera()
    setCameraXfo(camera, new Vec3(-1, 0, 0), new Vec3(0, 0, 1))
    // camera.setIsOrthographic(1.0)
  }
  const handleChangeViewPerspective = () => {
    const { renderer } = $APP_DATA
    const camera = renderer.getViewport().getCamera()
    const dir = new Vec3(-1, 1, -1)
    dir.normalizeInPlace()
    setCameraXfo(camera, dir, new Vec3(0, 0, 1))
    camera.setIsOrthographic(0.0)
  }

  // ////////////////////////////////////////
  // Render Modes

  const RENDER_MODES = {
    WIREFRAME: Symbol(),
    FLAT: Symbol(),
    HIDDEN_LINE: Symbol(),
    SHADED: Symbol(),
    SHADED_AND_EDGES: Symbol(),
    PBR: Symbol(),
  }
  // The default materials are standard shiny surfaces.(PBR)
  let mode = RENDER_MODES.PBR
  // Materials are shared among geom items.
  // We keep track of the material the geom item was using after load.
  // and for each unique material, make a clone and modify it for
  // each render mode.
  const materials = {}

  // The mapping that remembers what material was assigned to the
  // geomItem at load time.
  const geomItemToMaterialMapping = {}
  const createAndAssignMaterial = (geomItem, mode, cb) => {
    const geomItemId = geomItem.getId()
    if (mode != RENDER_MODES.PBR) {
      const material = geomItem.getParameter('Material').getValue()
      const materialId = material.getId()
      if (!geomItemToMaterialMapping[geomItemId]) {
        geomItemToMaterialMapping[geomItemId] = materialId
      }
      if (!materials[materialId]) {
        materials[materialId] = {}
        materials[materialId][RENDER_MODES.PBR] = material
      }
    }
    const materialId = geomItemToMaterialMapping[geomItemId]
    if (!materials[materialId][mode]) {
      // Clone the PBR material and use it as a basis for the new material.
      const newMaterial = materials[materialId][RENDER_MODES.PBR].clone()
      if (cb) cb(newMaterial)
      materials[materialId][mode] = newMaterial
    }
    const result = materials[materialId][mode]
    geomItem.getParameter('Material').setValue(result)
  }
  const handleChangeRenderModeWireframe = () => {
    const { assets } = $APP_DATA
    if (mode == RENDER_MODES.WIREFRAME) return
    assets.traverse((item) => {
      if (item instanceof GeomItem) {
        const geom = item.getParameter('Geometry').getValue()
        if (geom instanceof Mesh || geom instanceof MeshProxy) {
          item.getParameter('Visible').setValue(false)
        }
        createAndAssignMaterial(item, RENDER_MODES.WIREFRAME, (newMaterial) => {
          newMaterial.setName('Wireframe')
        })
      }
    })
    mode = RENDER_MODES.WIREFRAME
  }
  const handleChangeRenderModeFlat = () => {
    const { assets, scene } = $APP_DATA
    if (mode == RENDER_MODES.FLAT) return
    const backgroundColor = scene
      .getSettings()
      .getParameter('BackgroundColor')
      .getValue()
    assets.traverse((item) => {
      if (item instanceof GeomItem) {
        const geom = item.getParameter('Geometry').getValue()
        if (mode == RENDER_MODES.WIREFRAME) {
          if (geom instanceof Mesh || geom instanceof MeshProxy) {
            item.getParameter('Visible').setValue(true)
          }
        }
        createAndAssignMaterial(item, RENDER_MODES.FLAT, (newMaterial) => {
          newMaterial.setName('Flat')
          const shaderName = newMaterial.getShaderName()
          if (shaderName == 'LinesShader') {
            newMaterial.getParameter('OccludedStippleValue').setValue(1)
          } else {
            newMaterial.setShaderName('FlatSurfaceShader')

            // Note: Assigning the background color makes the surfaces
            // blend in with the background. Another option would be to
            // desaturate the current color.
            newMaterial.getParameter('BaseColor').setValue(backgroundColor)
          }
        })
      }
    })
    mode = RENDER_MODES.FLAT
  }
  const handleChangeRenderModeHiddenLine = () => {
    const { assets } = $APP_DATA
    if (mode == RENDER_MODES.HIDDEN_LINE) return
    assets.traverse((item) => {
      if (item instanceof GeomItem) {
        const geom = item.getParameter('Geometry').getValue()
        if (mode == RENDER_MODES.WIREFRAME) {
          if (geom instanceof Mesh || geom instanceof MeshProxy) {
            item.getParameter('Visible').setValue(true)
          }
        }
        createAndAssignMaterial(
          item,
          RENDER_MODES.HIDDEN_LINE,
          (newMaterial) => {
            newMaterial.setName('HiddenLine')
            const shaderName = newMaterial.getShaderName()
            if (shaderName == 'LinesShader') {
              newMaterial.getParameter('StippleScale').setValue(0.02)
              newMaterial.getParameter('StippleValue').setValue(0)
              newMaterial.getParameter('OccludedStippleValue').setValue(0.6)
            } else {
              newMaterial.setShaderName('FlatSurfaceShader')
              newMaterial
                .getParameter('BaseColor')
                .setValue(new Color(0.75, 0.75, 0.75))
            }
          }
        )
      }
    })
    mode = RENDER_MODES.HIDDEN_LINE
  }
  const handleChangeRenderModeShadedAndEdges = () => {
    const { assets } = $APP_DATA
    if (mode == RENDER_MODES.SHADED_AND_EDGES) return
    assets.traverse((item) => {
      if (item instanceof GeomItem) {
        const geom = item.getParameter('Geometry').getValue()
        if (geom instanceof Mesh || geom instanceof MeshProxy) {
          item.getParameter('Visible').setValue(true)
        }
        if (geom instanceof Lines || geom instanceof LinesProxy) {
          item.getParameter('Visible').setValue(true)
        }
        createAndAssignMaterial(
          item,
          RENDER_MODES.SHADED_AND_EDGES,
          (newMaterial) => {
            newMaterial.setName('ShadedAndEdges')
            const shaderName = newMaterial.getShaderName()
            if (shaderName == 'LinesShader') {
              newMaterial.getParameter('OccludedStippleValue').setValue(1)
            } else {
              newMaterial.setShaderName('SimpleSurfaceShader')
            }
          }
        )
      }
    })
    mode = RENDER_MODES.SHADED_AND_EDGES
  }
  const handleChangeRenderModePBR = () => {
    const { assets } = $APP_DATA
    if (mode == RENDER_MODES.PBR) return
    assets.traverse((item) => {
      if (item instanceof GeomItem) {
        const geom = item.getParameter('Geometry').getValue()
        if (geom instanceof Mesh || geom instanceof MeshProxy) {
          item.getParameter('Visible').setValue(true)
        }
        if (geom instanceof Lines || geom instanceof LinesProxy) {
          item.getParameter('Visible').setValue(true)
        }
        createAndAssignMaterial(item, RENDER_MODES.PBR)
      }
    })
    mode = RENDER_MODES.PBR
  }
</script>

<div class="Toolbar flex gap-1" class:flex-col={orientation === 'vertical'}>
  <ToolbarButton title="Front" on:click={handleChangeViewFront}>
    <IconFrontView />
  </ToolbarButton>
  <ToolbarButton title="Back" on:click={handleChangeViewBack}>
    <IconBackView />
  </ToolbarButton>
  <ToolbarButton title="Top" on:click={handleChangeViewTop}>
    <IconTopView />
  </ToolbarButton>
  <ToolbarButton title="Bottom" on:click={handleChangeViewBottom}>
    <IconBottomView />
  </ToolbarButton>
  <ToolbarButton title="Left" on:click={handleChangeViewLeft}>
    <IconLeftView />
  </ToolbarButton>
  <ToolbarButton title="Right" on:click={handleChangeViewRight}>
    <IconRightView />
  </ToolbarButton>
  <ToolbarButton title="Perspective" on:click={handleChangeViewPerspective}>
    <IconPerspView />
  </ToolbarButton>

  <ToolbarButton title="Wireframe" on:click={handleChangeRenderModeWireframe}>
    <IconRenderModeWireframe />
  </ToolbarButton>
  <ToolbarButton title="Flat" on:click={handleChangeRenderModeFlat}>
    <IconRenderModeFlat />
  </ToolbarButton>
  <ToolbarButton title="HiddenLine" on:click={handleChangeRenderModeHiddenLine}>
    <IconRenderModeHiddenLine />
  </ToolbarButton>
  <ToolbarButton
    title="ShadedAndEdges"
    on:click={handleChangeRenderModeShadedAndEdges}
  >
    <IconRenderModeShadedAndEdges />
  </ToolbarButton>
  <ToolbarButton title="PBR" on:click={handleChangeRenderModePBR}>
    <IconRenderModePBR />
  </ToolbarButton>
</div>
