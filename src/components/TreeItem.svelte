<script>
  import { beforeUpdate } from 'svelte'

  export let expanded = false
  export let highlighted = false
  export let item
  export let selectionManager = null
  export let undoRedoManager = null
  export let visible = false

  let el
  let hasChildren = false
  let highlightBgColor
  let highlightColor
  let isTreeItem
  let unsubHighlightChanged
  let unsubVisibilityChanged

  const updateHighlight = () => {
    if (item && 'isHighlighted' in item) {
      highlighted = item.isHighlighted()

      if (highlighted && 'getHighlight' in item) {
        const { Color } = globalThis.zeaEngine

        const itemHighlightColor = item.getHighlight()
        const bgColor = itemHighlightColor.lerp(
          new Color(0.75, 0.75, 0.75, 0),
          0.5
        )

        highlightColor = itemHighlightColor.toHex()
        highlightBgColor = `${bgColor.toHex()}60`
      }
    }
  }

  const toggleExpanded = () => {
    expanded = !expanded
  }

  const updateVisibility = () => {
    if (isTreeItem) {
      visible = item.isVisible()
    }
  }

  const toggleVisibility = () => {
    const visibleParam = item.getParameter('Visible')
    visible = !visibleParam.getValue()

    if (undoRedoManager) {
      const { ParameterValueChange } = globalThis.zeaUx
      const change = new ParameterValueChange(visibleParam, visible)
      undoRedoManager.addChange(change)
      return
    }

    visibleParam.setValue(visible)
  }

  const handleItemClick = (event) => {
    if (!selectionManager) {
      item.setSelected(!item.getSelected())
      return
    }

    if (selectionManager.pickingModeActive()) {
      selectionManager.pick(item)
      return
    }

    selectionManager.toggleItemSelection(item, !event.ctrlKey)
  }

  const initItem = () => {
    if (!item) {
      return
    }

    if (!globalThis.zeaEngine) {
      throw new Error(
        '`zeaEngine` is missing from the `globalThis` property. This component requires it.'
      )
    }

    // This reference to the element is added so the component can navigate
    // using the keyboard.
    item.elemRef = el

    isTreeItem = item instanceof globalThis.zeaEngine.TreeItem

    updateHighlight()
    updateVisibility()

    if (isTreeItem) {
      if (unsubVisibilityChanged > -1) {
        item.off('visibilityChanged', updateVisibility)
      }

      unsubVisibilityChanged = item.on('visibilityChanged', updateVisibility)

      // This code is for a special case when items are replaced in the
      // TreeView and we don't load the component again.
      hasChildren = item.getNumChildren() > 0
    }

    if (unsubHighlightChanged > -1) {
      item.off('highlightChanged', updateHighlight)
    }

    unsubHighlightChanged = item.on('highlightChanged', updateHighlight)
  }

  beforeUpdate(() => {
    initItem()
  })
</script>

{#if item}
  <div bind:this={el} class="TreeItem {visible || 'text-gray-500'}">
    <div class="flex items-center">
      {#if hasChildren}
        <button class="px-1" on:click={toggleExpanded}>
          <span class="material-icons">
            {expanded ? 'expand_more' : 'chevron_right'}
          </span>
        </button>
      {/if}

      {#if isTreeItem}
        <button class="px-1" on:click={toggleVisibility}>
          <span class="material-icons">
            {visible ? 'visibility' : 'visibility_off'}
          </span>
        </button>
      {/if}

      <span
        class="flex-1 border rounded px-1"
        style="background-color: {highlighted
          ? highlightBgColor
          : 'transparent'}; border-color: {highlighted
          ? highlightColor
          : 'transparent'};"
        on:click={handleItemClick}
      >
        {item.getName()}
      </span>
    </div>

    {#if hasChildren && expanded}
      <div class="pl-3 border-dotted border-l ml-3">
        {#if isTreeItem}
          {#each item.getChildren() as childItem}
            <svelte:self
              item={childItem}
              {selectionManager}
              {undoRedoManager}
            />
          {/each}
        {/if}
      </div>
    {/if}
  </div>
{/if}

<style>
  .material-icons {
    font-size: 1rem;
  }
</style>
