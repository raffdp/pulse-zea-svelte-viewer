<script>
  import { redirect } from '@roxi/routify'

  import { auth } from '../../helpers/auth.js'
  import { getRandomString } from '../../helpers/misc.js'

  const { Color } = window.zeaEngine

  let submitted
  let username
  let password

  /** ELEMENTS START */
  let passwordEl
  let passwordErrorContainer
  /** ELEMENTS END */

  const handleSubmit = async () => {
    const userData = {
      firstName: username,
      password: password,
      lastName: '',
      color: Color.random().toHex(),
      id: getRandomString(),
    }

    auth
      .setUserData(userData)
      .then(() => {
        submitted = true
        $redirect('/')
      })
      .catch((e) => {
        if (passwordErrorContainer) {
          passwordErrorContainer.classList.remove('hidden')
          passwordErrorContainer.textContent = e.message
          passwordEl.classList.add('border-red-500')
        }
      })
  }
</script>

<div
  class="bg-background min-h-screen flex items-center justify-center py-12 px-4 text-foreground sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <h2 class="mt-6 text-center text-3xl font-extrabold">Zea Demo</h2>

    <form
      class="mt-8 space-y-6"
      on:submit|preventDefault|stopPropagation={handleSubmit}>
      <div class="rounded-md shadow-sm -space-y-px">
        <div class="mb-2">
          <!-- svelte-ignore a11y-autofocus -->
          <input
            bind:value={username}
            autofocus
            name="username"
            type="text"
            autocomplete="off"
            required
            class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm"
            placeholder="My name is..." />
        </div>
        <div>
          <input
            bind:this={passwordEl}
            bind:value={password}
            name="password"
            type="password"
            autocomplete="off"
            required
            class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm"
            placeholder="Password" />
          <span
            bind:this={passwordErrorContainer}
            class="flex items-center font-medium tracking-wide text-red-500 text-xs mt-1 ml-1 hidden" />
        </div>
      </div>

      <div>
        <button
          disabled={submitted}
          type="submit"
          class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-gray-800 bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
          Login
        </button>
      </div>
    </form>
  </div>
</div>
