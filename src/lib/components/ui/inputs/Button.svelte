<script lang="ts">
  import type { Snippet } from 'svelte';

  const {
    onclick = () => {},
    type = 'button',
    class: className = '',
    disabled = false,
    border = true,
    smallPadding = false,
    disablePadding = false,
    aria = '',
    children
  }: {
    onclick?: () => void;
    type?: 'button' | 'submit' | 'reset';
    class?: string;
    disabled?: boolean;
    border?: boolean;
    smallPadding?: boolean;
    disablePadding?: boolean;
    aria?: string;
    children: Snippet<[]>;
  } = $props();
</script>

<!-- prettier-ignore -->
<button
  class="flex w-fit cursor-pointer items-center gap-2 rounded-lg {border ? 'border-2 border-zinc-300 dark:border-zinc-700' : 'border-0'} bg-zinc-100 dark:bg-zinc-800 {disablePadding ? '' : smallPadding ? 'p-1 px-4' : 'p-2 px-4'} transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-600 disabled:cursor-not-allowed disabled:opacity-50 {className}"
  {onclick}
  {disabled}
  {type}
  aria-label={aria}
>
  {@render children?.()}
</button>
