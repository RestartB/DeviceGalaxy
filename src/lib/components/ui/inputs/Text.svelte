<script lang="ts">
  import type { HTMLInputTypeAttribute } from 'svelte/elements';

  let {
    value = $bindable(),
    border = true,
    class: className = '',
    aria = '',
    id = '',
    type = 'text'
  }: {
    value?: string;
    border?: boolean;
    class?: string;
    aria?: string;
    id?: string;
    type?: HTMLInputTypeAttribute;
  } = $props();
</script>

<input
  {type}
  class="flex cursor-text items-center gap-2 rounded-lg {border
    ? 'border-2 border-zinc-700'
    : ''} bg-zinc-800 p-1 px-2 transition-colors focus:bg-zinc-600 {className}"
  aria-label={aria}
  {id}
  bind:value
/>
