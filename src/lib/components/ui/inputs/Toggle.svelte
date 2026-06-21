<script lang="ts">
  let { toggled = $bindable(false), class: className = '' }: { toggled?: boolean | null; class?: string } = $props();
</script>

<button
  class={`border-box flex h-6 min-w-12 shrink-0 cursor-pointer rounded-full p-1 transition-all ${toggled ? 'bg-green-500' : 'bg-zinc-200 dark:bg-zinc-500'} ${className}`}
  onclick={() => (toggled = !toggled)}
  aria-label="Toggle"
>
  <span
    class="aspect-square h-4 w-4 rounded-full bg-black dark:bg-white transition-all"
    style="margin-left: {toggled ? 'calc(100% - 1rem)' : '0'}"
  ></span>
</button>
