import { writable } from 'svelte/store'

const ui = writable({
  currentMenuBarItem: null,
  shouldShowDrawer: window.innerWidth >= 768,
})

export { ui }
