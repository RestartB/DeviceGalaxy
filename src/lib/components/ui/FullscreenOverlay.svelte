<script lang="ts">
  import { fade, scale } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  import { X, type LucideIcon } from '@lucide/svelte';
  import type { Snippet } from 'svelte';

  let {
    children,
    extraButton,
    bottomRow,
    Icon,
    title,
    width = 466,
    height = 564,
    padding = 16,
    gap = 0,
    zIndex = 50,
    overflow = true,
    class: className = '',
    // eslint-disable-next-line no-useless-assignment
    overlayOpen = $bindable(false)
  }: {
    children?: Snippet<[]>;
    extraButton?: Snippet<[]>;
    bottomRow?: Snippet<[]>;
    Icon?: LucideIcon;
    title?: string;
    width?: number;
    height?: number;
    padding?: number;
    gap?: number;
    zIndex?: number;
    overflow?: boolean;
    class?: string;
    overlayOpen?: boolean;
  } = $props();
</script>

<div
  class="fixed inset-0 isolate flex flex-col items-center justify-center overflow-hidden bg-white/60 p-4 backdrop-blur-lg dark:bg-black/60 {className}"
  style="z-index: {zIndex}"
  transition:fade|global={{ duration: 100 }}
>
  <div
    class="absolute inset-0 -z-10"
    onclick={() => (overlayOpen = false)}
    aria-hidden="true"
  ></div>

  <div
    transition:scale|global={{ duration: 300, easing: cubicOut, start: 0.9, opacity: 1 }}
    class="relative overflow-auto rounded-xl border-2 border-zinc-300 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800"
    style="
      width: min({width}px, 100%);
      height: min({height}px, calc(100vh - 5rem));
    "
  >
    <div
      class="sticky top-0 z-10 flex items-center gap-4
             border-b-2 border-zinc-300 bg-zinc-100/70 p-4 backdrop-blur-md
             dark:border-zinc-700 dark:bg-zinc-800/70"
    >
      {#if Icon}
        <Icon size={24} class="shrink-0" />
      {/if}

      <h2 class="text-xl font-bold mr-auto">{title}</h2>
      {@render extraButton?.()}

      <button
        class="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-zinc-200 text-zinc-500 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-600"
        type="button"
        onclick={() => (overlayOpen = false)}
        aria-label="Close popup"
      >
        <X size={24} />
      </button>
    </div>

    <div
      class="flex w-full flex-col"
      class:overflow-hidden={!overflow}
      style="padding: {padding}px; gap: {gap}px;"
    >
      {@render children?.()}
    </div>

    {@render bottomRow?.()}
  </div>
</div>
