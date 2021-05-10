<script>
  export let orientation = 'horizontal'

  import IconEye from '../icons/IconEye.svelte'
  import IconEyeOff from '../icons/IconEyeOff.svelte'
  import ToolbarButton from './ToolbarButton.svelte'

  const handleFoo = () => {
    alert('Foo')
  }

  const handleBar = () => {
    alert('Bar')
  }
</script>

<div class="Toolbar flex gap-1" class:flex-col={orientation === 'vertical'}>
  <ToolbarButton title="Foo" on:click={handleFoo}>
    <IconEye />
  </ToolbarButton>

  <ToolbarButton title="Bar" on:click={handleBar}>
    <IconEyeOff />
  </ToolbarButton>

  <ToolbarButton title="Foo" on:click={handleFoo}>
    <IconEye />
  </ToolbarButton>

  <ToolbarButton title="Bar" on:click={handleBar}>
    <IconEyeOff />
  </ToolbarButton>
</div>
