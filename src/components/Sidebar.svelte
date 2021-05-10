<script>
  import SearchTool from '../components/SearchTool.svelte'
  import TabsBar from '../components/TabsBar.svelte'
  import TreeView from '../components/TreeView.svelte'

  import { assets } from '../stores/assets.js'
  import { selectionManager } from '../stores/selectionManager.js'

  const tabs = ['Assembly', 'Search']

  let selectedTab

  $: treeItems = [$assets]
</script>

<div class="Sidebar h-full w-full flex flex-col">
  <TabsBar {tabs} bind:selectedTab />

  <div class="flex-1 overflow-auto">
    <div class:hidden={selectedTab !== tabs[0]}>
      <TreeView items={treeItems} selectionManager={$selectionManager} />
    </div>

    <div class:hidden={selectedTab !== tabs[1]}>
      <SearchTool />
    </div>
  </div>
</div>
