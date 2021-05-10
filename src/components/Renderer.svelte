<style>
  #renderer {
    height: 100%;
    width: 100%;
  }
</style>

<script>
  import { Scene, GLRenderer } from '@zeainc/zea-engine'

  const canvas = document.getElementById('renderer')

  const renderer = new GLRenderer(canvas)
  const scene = new Scene()
  scene.setupGrid(10, 10)
  renderer.setScene(scene)
</script>

<canvas id="renderer"></canvas>