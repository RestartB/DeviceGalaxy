<script lang="ts">
  import Card from '#lib/components/devices/Card.svelte';
  import { CircleX } from '@lucide/svelte';
  import type { Attachment } from 'svelte/attachments';

  const { data } = $props();

  // eslint-disable-next-line no-useless-assignment
  let greeting = $state('');

  // decide greeting based on browser time
  const time = new Date().getHours();
  if (time > 5 && time < 12) {
    greeting = 'Good morning, ';
  } else if (time >= 12 && time < 19) {
    greeting = 'Good afternoon, ';
  } else {
    greeting = 'Good evening, ';
  }

  const handleFades: Attachment = (element) => {
    if (element.scrollWidth > element.clientWidth) {
      element.classList.add('overflow-right');
    }
  };

  function onscroll(event: Event) {
    const target = event.currentTarget as HTMLElement;

    const maxScroll = target.scrollWidth - target.clientWidth;
    const atStart = target.scrollLeft <= 1;
    const atEnd = target.scrollLeft >= maxScroll - 1;
    const overflows = maxScroll > 1;

    target.classList.toggle('overflow-left', overflows && !atStart && atEnd);
    target.classList.toggle('overflow-right', overflows && atStart && !atEnd);
    target.classList.toggle('overflow-both', overflows && !atStart && !atEnd);
  }
</script>

{#snippet statsSquare(title: string, amount: number)}
  <div
    class="rounded-lg border border-zinc-300 bg-zinc-200 p-2 px-4 text-start dark:border-zinc-700 dark:bg-zinc-800"
  >
    <p class="font-semibold">{title}</p>
    <p class="font-mono text-3xl">{amount || 0}</p>
  </div>
{/snippet}

{#if data.user}
  <div class="space-y-4">
    <h1 class="text-4xl">
      {greeting || 'Hi there, '}
      <span
        class="bg-linear-to-r from-purple-900 to-purple-700 bg-clip-text font-bold text-transparent dark:from-purple-100 dark:to-purple-400"
        translate="no"
      >
        {data.user.name}
      </span>
    </h1>

    <h3 class="text-xl font-semibold">Stats</h3>
    <div class="flex flex-wrap items-center gap-4">
      {@render statsSquare('Devices', data.deviceCount)}
      {@render statsSquare('Tags', data.tagCount)}
      {@render statsSquare('Shares', data.shareCount)}
      {@render statsSquare('Share Views', 0)}
    </div>

    <h3 class="text-xl font-semibold">Recently added</h3>
    {#if data.newDevices.length > 0}
      <div class="scroll-fades flex gap-4 overflow-x-auto" {@attach handleFades} {onscroll}>
        {#each data.newDevices as device (device.id)}
          <Card deviceData={device} />
        {/each}
      </div>
    {:else}
      <div class="flex items-center justify-center gap-2">
        <CircleX />No data to show
      </div>
    {/if}

    <h3 class="text-xl font-semibold">Recently modified</h3>
    {#if data.recentDevices.length > 0}
      <div class="scroll-fades flex gap-4 overflow-x-auto" {@attach handleFades} {onscroll}>
        {#each data.recentDevices as device (device.id)}
          <Card deviceData={device} />
        {/each}
      </div>
    {:else}
      <div class="flex items-center justify-center gap-2">
        <CircleX />No data to show
      </div>
    {/if}

    <h3 class="text-xl font-semibold">Recently shared</h3>
    {#if data.recentShared.length > 0}
      <div class="scroll-fades flex gap-4 overflow-x-auto" {@attach handleFades} {onscroll}></div>
    {:else}
      <div class="flex items-center gap-2 opacity-50">
        <CircleX />No data to show
      </div>
    {/if}
  </div>
{/if}

<style>
  @property --left-mask-opacity {
    syntax: '<number>';
    inherits: false;
    initial-value: 1;
  }

  @property --right-mask-opacity {
    syntax: '<number>';
    inherits: false;
    initial-value: 1;
  }

  :global(.scroll-fades) {
    --left-mask-opacity: 1;
    --right-mask-opacity: 1;

    mask-image: linear-gradient(
      to right,
      rgb(0 0 0 / var(--left-mask-opacity)),
      black 5rem,
      black calc(100% - 5rem),
      rgb(0 0 0 / var(--right-mask-opacity))
    );

    transition:
      --left-mask-opacity 200ms ease,
      --right-mask-opacity 200ms ease;
  }

  :global(.scroll-fades.overflow-left) {
    --left-mask-opacity: 0;
  }

  :global(.scroll-fades.overflow-right) {
    --right-mask-opacity: 0;
  }

  :global(.scroll-fades.overflow-both) {
    --left-mask-opacity: 0;
    --right-mask-opacity: 0;
  }
</style>
