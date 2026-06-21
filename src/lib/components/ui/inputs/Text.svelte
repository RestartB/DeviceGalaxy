<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

  let {
    value = $bindable(),
    border = true,
    class: className = '',
    ...rest
  }: Omit<HTMLInputAttributes, 'value'> & {
    value?: string | number;
    border?: boolean;
  } = $props();
</script>

<input
  class="flex cursor-text items-center gap-2 rounded-lg border-2 border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 p-1 px-2 transition-colors focus:bg-zinc-200 dark:focus:bg-zinc-600 {className}"
  {...rest}
  bind:value
/>
