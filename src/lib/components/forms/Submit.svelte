<script>
  import { LoaderCircle } from '@lucide/svelte';
  let { text, hasErrors, submitting, delayed } = $props();
</script>

<button
  type="submit"
  class="flex w-full cursor-pointer items-center justify-center rounded-md bg-green-500 px-4 py-2 font-bold text-white transition-all hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-green-500"
  disabled={hasErrors || submitting}
>
  {#if !delayed}
    {text}
  {:else}
    <LoaderCircle size={20} class="animate-spin" />
  {/if}
</button>
