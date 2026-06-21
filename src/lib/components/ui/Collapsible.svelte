<script lang="ts">
  import { onMount, type Snippet } from 'svelte';
  import { slide } from 'svelte/transition';
  import { cubicInOut } from 'svelte/easing';

  import { ChevronDown } from '@lucide/svelte';

  const {
    children,
    title,
    defaultState = false
  }: { children?: Snippet<[]>; title: string; defaultState?: boolean } = $props();

  // default open when there's no client side js
  let isOpen = $state(false);

  onMount(() => {
    isOpen = defaultState;
  });
</script>

<div class="w-full">
  <button
    class="flex w-full cursor-pointer items-center justify-between py-1"
    onclick={() => (isOpen = !isOpen)}
    aria-label="Toggle {title} section"
  >
    <h3 class="text-left font-bold">{title}</h3>
    <ChevronDown
      class="shrink-0 transition-transform duration-400 {isOpen
        ? 'transform-[rotateX(180deg)]'
        : 'transform-[rotateX(0deg)]'}"
    />
  </button>

  {#if isOpen}
    <div class="mt-2" transition:slide={{ easing: cubicInOut }}>
      {@render children?.()}
    </div>
  {/if}
</div>
