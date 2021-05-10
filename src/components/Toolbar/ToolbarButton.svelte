<script>
  export let title = ''
</script>

<button
  class="ToolbarButton border border-gray-500 shadow cursor-default rounded transform hover:scale-105 transition-all h-12 w-12 p-1 bg-background bg-opacity-40 hover:opacity-100"
  on:click
  {title}
>
  <slot />
</button>
