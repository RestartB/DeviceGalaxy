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
  <div class="flex w-full cursor-pointer items-center justify-between gap-2 py-1">
    {#if topRow}
      {@render topRow()}
    {:else}
      <h3 class="text-left font-bold">{title}</h3>
    {/if}

    <button
      class="cursor-pointer rounded-lg p-1 transition-colors hover:bg-zinc-300 dark:hover:bg-zinc-700"
      onclick={() => (isOpen = !isOpen)}
      aria-label="Toggle {title} section"
    >
      <ChevronDown
        class="shrink-0 transition-transform duration-400 {isOpen
          ? 'transform-[rotateX(180deg)]'
          : 'transform-[rotateX(0deg)]'}"
      />
    </button>
  </div>

  {#if isOpen}
    <div class="mt-2 {className}" transition:slide={{ easing: cubicInOut }}>
      {@render children?.()}
    </div>
  {/if}
</div>
