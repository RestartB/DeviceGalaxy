<script lang="ts">
  import Toggle from '$lib/components/ui/inputs/Toggle.svelte';
  let { toggled = $bindable(false), children } = $props();
</script>

<div class="rounded-xl border-2 border-zinc-700 bg-zinc-800 p-4">
  <div class="flex items-center justify-between gap-2">
    <div>
      {@render children?.()}
    </div>
    <Toggle bind:toggled />
  </div>
</div>
