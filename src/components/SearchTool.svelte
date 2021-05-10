<script>
  import { onMount } from 'svelte'

  import { scene } from '../stores/scene.js'

  const { AssetItem, Color } = window.zeaEngine

  let searchInputEl
  let searchResults
  let value = ''

  const filteredItemsSet = new Set()
  const matchedItemsSet = new Set()
  const matchColor = new Color(1, 0, 0, 0.2)

  if ($scene) {
    while (searchResults.firstChild) {
      searchResults.removeChild(searchResults.lastChild)
    }
    filteredItemsSet.forEach((item) => {})
    filteredItemsSet.clear()
    matchedItemsSet.forEach((item) => {
      item.removeHighlight('searchResult', true)
    })
    matchedItemsSet.clear()

    if (value.length >= 2) {
      const re = new RegExp(value, 'i')
      $scene.getRoot().traverse((item) => {
        if (re.test(item.getName())) {
          const listItem = document.createElement('ul')
          listItem.classList.add('truncate')
          listItem.textContent = item.getName()
          searchResults.appendChild(listItem)
          matchedItemsSet.add(item)
          item.addHighlight('searchResult', matchColor, true)
        } else {
          filteredItemsSet.add(item)
        }
      })
    }
  }

  const handleSubmit = () => {
    console.log('handleSubmit')
  }

  onMount(() => {
    searchInputEl.focus()
  })
</script>

<div class="h-full w-full px-3">
  <form on:submit|preventDefault={handleSubmit}>
    <input
      bind:this={searchInputEl}
      bind:value
      class="rounded w-full text-black px-1"
      type="search"
    />
  </form>
  <ul bind:this={searchResults} class="py-3" id="searchResults" />
</div>
