<script>
  export let appData = {}
  export let rootItems = []

  let treeView
</script>

<div class="h-full w-full">
  <zea-scroll-pane>
    <zea-tree-view bind:this={treeView} items={rootItems} {appData} />
  </zea-scroll-pane>
</div>
