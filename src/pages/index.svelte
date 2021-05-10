<script>
  import { redirect } from '@roxi/routify'
  import { onMount } from 'svelte'

  import { auth } from '../helpers/auth.js'
  import { getRandomString } from '../helpers/misc.js'

  const { Session, SessionSync } = window.zeaCollab
  const { Color, GLRenderer, Scene } = window.zeaEngine

  let canvas
  let userChip
  let userChipSet

  const getAppData = () => {
    const renderer = new GLRenderer(canvas)
    const scene = new Scene()

    scene.setupGrid(10, 10)
    renderer.setScene(scene)

    const appData = {
      scene,
      renderer,
    }

    return appData
  }

  onMount(async () => {
    const isAuthenticated = await auth.isAuthenticated()

    if (!isAuthenticated) {
      $redirect('/login')
      return
    }

    const username = await auth.getUsername()

    const appData = getAppData()
    const userData = {
      color: Color.random().toHex(),
      family_name: username,
      given_name: '',
      id: getRandomString(),
    }
    const socketUrl = 'https://websocket-staging.zea.live'
    const session = new Session(userData, socketUrl)
    session.joinRoom('zea-template-collab')
    const sessionSync = new SessionSync(session, appData, userData, {})
  })
</script>

<zea-layout
  orientation="vertical"
  cell-a-size="50"
  resize-cell-a="false"
  cell-b-size="100%"
  cell-c-size="0px"
  resize-cell-c="false">
  <div slot="a" class="app-header">
    <img alt="Zea logo" class="app-logo" src="images/logo-zea.svg" />
    <div class="UserChipSetHolder">
      <zea-user-chip-set bind:this={userChipSet} id="zea-user-chip-set" />
    </div>
    <zea-user-chip bind:this={userChip} id="zea-user-chip" />
  </div>
  <zea-layout
    slot="b"
    cell-a-size="0px"
    cell-b-size="100%"
    cell-c-size="0px"
    resize-cell-c="false">
    <canvas bind:this={canvas} slot="b" class="h-full w-full" />
  </zea-layout>
</zea-layout>
