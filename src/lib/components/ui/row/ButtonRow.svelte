<script lang="ts">
  import type { Component, Snippet } from 'svelte';

  let {
    children,
    class: className = '',
    label = '',
    Icon,
    thisElement = $bindable(),
    onclick
  }: {
    children?: Snippet<[]>;
    class?: string;
    label?: string;
    Icon?: Component;
    thisElement?: HTMLButtonElement;
    onclick?: (event: MouseEvent) => void;
  } = $props();
</script>

<button
  class={`block w-full min-w-0 cursor-pointer rounded-xl border-2 border-zinc-700 bg-zinc-800 p-4 text-left transition-colors hover:bg-zinc-700 ${className}`}
  bind:this={thisElement}
  {onclick}
  aria-label={label}
>
  <div class="flex w-full items-center justify-between gap-2">
    <div class="min-w-0 flex-1">
      {@render children?.()}
    </div>

    {#if Icon}
      <Icon size={24} class="shrink-0" />
    {/if}
  </div>
</button>
