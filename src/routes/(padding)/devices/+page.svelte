<script lang="ts">
  import Device from '$lib/components/devices/Device.svelte';
  import Button from '$lib/components/ui/inputs/Button.svelte';
  import { Pencil, Search } from '@lucide/svelte';

  const { data } = $props();

  let overlayOpen = $state(false);
</script>

{#if overlayOpen}
  <Device specFields={data.specFields} bind:overlayOpen />
{/if}

<div class="flex w-full items-center gap-2">
  <input
    placeholder="Search devices..."
    class="h-12 w-full max-w-120 rounded-lg border-2 border-zinc-300 bg-zinc-200 p-2 px-4 dark:border-zinc-700 dark:bg-zinc-800"
  />
  <Button class="h-12 min-w-12 p-0!" title="Search">
    <Search />
  </Button>

  <Button
    class="ml-auto h-12 min-w-12 p-0! xxs:min-w-fit xxs:px-4!"
    title="Create device..."
    onclick={() => {
      overlayOpen = true;
    }}
  >
    <Pencil class="shrink-0" />
    <p class="hidden xxs:block">Create...</p>
  </Button>
</div>
