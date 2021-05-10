<script>
  export let title = ''
</script>

<button
  class="ToolbarButton border border-gray-500 shadow cursor-default rounded transform hover:scale-105 transition-all h-9 w-9 p-1 bg-background opacity-80 hover:opacity-100"
  on:click
  {title}
>
  <slot />
</button>
