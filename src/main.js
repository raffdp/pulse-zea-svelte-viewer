import HMR from '@roxi/routify/hmr'
import App from './App.svelte'
import { defineCustomElements } from '@zeainc/zea-web-components/dist/custom-elements'
defineCustomElements()

const app = HMR(App, { target: document.body }, 'routify-app')

export default app

/** Service worker. Uncomment to use service worker */

// if ('serviceWorker' in navigator) {
//     import('workbox-window').then(async ({ Workbox }) => {
//         const wb = new Workbox('/sw.js')
//         const registration = await wb.register()
//         wb.addEventListener('installed', () => (console.log('installed service worker')))
//         wb.addEventListener('externalinstalled', () => (console.log('installed service worker')))
//     })
// }
