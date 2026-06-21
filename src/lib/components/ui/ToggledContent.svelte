<script lang="ts">
  let { enabled = $bindable(false), children } = $props();
</script>

<div
  class="flex flex-col gap-4 transition-all"
  class:opacity-50={!enabled}
  class:pointer-events-none={!enabled}
  class:select-none={!enabled}
  class:blur-[2px]={!enabled}
>
  {@render children?.()}
</div>
