<script>
  export let tabs = []
  export let selectedTab = tabs[0]

  const handleClick = (tab) => {
    selectedTab = tab
  }
</script>

<div class="TabsBar flex border-b border-gray-600 mb-2">
  {#each tabs as tab}
    <button
      class="flex-1 leading-9 rounded-t {selectedTab !== tab &&
        'hover:bg-gray-700'} bg-gray-{selectedTab === tab
        ? '600'
        : '800'} {selectedTab === tab && 'text-primary'}"
      on:click={() => {
        handleClick(tab)
      }}
    >
      {tab}
    </button>
  {/each}
</div>
