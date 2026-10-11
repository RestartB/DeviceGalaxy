<script lang="ts">
  import { onMount, type Snippet } from 'svelte';
  import { slide } from 'svelte/transition';
  import { cubicInOut } from 'svelte/easing';

  import { ChevronDown } from '@lucide/svelte';

  const {
    children,
    title = '',
    class: className = '',
    topRow = null,
    defaultState = false
  }: {
    children?: Snippet<[]>;
    title?: string;
    class?: string;
    topRow?: Snippet | null;
    defaultState?: boolean;
  } = $props();

  // default open when there's no client side js
  let isOpen = $state(false);

  onMount(() => {
    isOpen = defaultState;
  });
</script>

<div class="w-full">
  <button
    class="flex w-full cursor-pointer items-center justify-between gap-2 py-1"
    onclick={() => (isOpen = !isOpen)}
    aria-label="Toggle {title} section"
  >
    {#if topRow}
      {@render topRow()}
    {:else}
      <h3 class="text-left font-bold">{title}</h3>
    {/if}
    <ChevronDown
      class="shrink-0 transition-transform duration-400 {isOpen
        ? 'transform-[rotateX(180deg)]'
        : 'transform-[rotateX(0deg)]'}"
    />
  </button>

  {#if isOpen}
    <div class="mt-2 {className}" transition:slide={{ easing: cubicInOut }}>
      {@render children?.()}
    </div>
  {/if}
</div>
