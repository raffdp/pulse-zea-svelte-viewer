<script>
  import { redirect } from '@roxi/routify'

  import { auth } from '../../helpers/auth.js'

  const { Session, SessionSync } = window.zeaCollab

  let submitted
  let username

  const handleSubmit = async () => {
    submitted = true

    await auth.setUsername(username)

    $redirect('/')
  }
</script>

<div
  class="bg-background min-h-screen flex items-center justify-center py-12 px-4 text-foreground sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <h2 class="mt-6 text-center text-3xl font-extrabold">
      Hello, what's your name?
    </h2>

    <form class="mt-8 space-y-6" on:submit|once|preventDefault={handleSubmit}>
      <div class="rounded-md shadow-sm -space-y-px">
        <div>
          <!-- svelte-ignore a11y-autofocus -->
          <input
            bind:value={username}
            autofocus
            name="username"
            type="text"
            required
            class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm"
            placeholder="My name is..." />
        </div>
      </div>

      <div>
        <button
          disabled={submitted}
          type="submit"
          class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-gray-800 bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
          Join Room
        </button>
      </div>
    </form>
  </div>
</div>
