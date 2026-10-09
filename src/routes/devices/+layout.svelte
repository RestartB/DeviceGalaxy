<script lang="ts">
  import Device from '#lib/components/devices/Device.svelte';
  import Card from '#lib/components/devices/Card.svelte';
  import Button from '#lib/components/ui/inputs/Button.svelte';
  import { Pencil, Search, Funnel, CircleAlert } from '@lucide/svelte';

  const { data, children } = $props();
  let overlayOpen = $state(false);
</script>

{#if overlayOpen}
  <Device specFields={data.specFields} bind:overlayOpen />
{/if}

{@render children?.()}

<div class="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-2">
  <Button
    class="h-12 min-w-12 p-0! xxs:min-w-fit xxs:px-4!"
    title="Create device..."
    onclick={() => {
      overlayOpen = true;
    }}
  >
    <Pencil class="shrink-0" />
  </Button>

  <div
    class="flex h-12 w-full items-center justify-center gap-1 rounded-lg border border-zinc-300 bg-zinc-200 p-2 pr-4 pl-5 md:min-w-120 dark:border-zinc-700 dark:bg-zinc-800"
  >
    <input placeholder="Search devices..." class="w-full" />
    <button
      class="cursor-pointer rounded-lg p-1 transition-colors hover:bg-zinc-300 dark:hover:bg-zinc-700"
      title="Search"
    >
      <Search size={22} />
    </button>
  </div>

  <Button class="ml-auto h-12 min-w-12 p-0! xxs:min-w-fit xxs:px-4!" title="Filter devices...">
    <Funnel class="shrink-0" />
  </Button>
</div>

{#if data.devices}
  <!-- calc(var(--spacing) * 70) = max-w-70 -->
  <div
    class="mt-4 grid gap-2"
    style="grid-template-columns: repeat(auto-fit, minmax(calc(var(--spacing) * 70), 1fr));"
  >
    {#each data.devices as device (device.id)}
      <Card deviceData={device}></Card>
    {/each}
  </div>
{:else}
  <div class="p-auto mt-4 flex flex-1 items-center justify-center gap-2">
    <CircleAlert />
    <p>No devices found</p>
  </div>
{/if}
