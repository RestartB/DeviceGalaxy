<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    children,
    class: className = '',
    thisElement = $bindable()
  }: { children?: Snippet<[]>; class?: string; thisElement?: HTMLDivElement } = $props();
</script>

<div class={`rounded-xl border-2 border-zinc-700 bg-zinc-800 p-4 ${className}`} bind:this={thisElement}>
  {@render children?.()}
</div>
