<script lang="ts">
  import { fade } from 'svelte/transition';
  import {
    MoveLeft,
    Cpu,
    Gpu,
    MemoryStick,
    HardDrive,
    Cog,
    X,
    MoveLeftIcon,
    MoveRightIcon
  } from '@lucide/svelte';
  import Avatar from '$lib/components/Avatar.svelte';
  import AttributePill from '$lib/components/AttributePill.svelte';

  const { data, shareID } = $props();
  const device = data.device;

  const hasExternalImages = device.externalImages?.length > 0;
  const hasInternalImages = device.internalImages?.length > 0;

  let imageOpen = $state(false);
  let imageIndex = $state(0);

  let imageSrc = $derived(
    `/api/image/device/${device.id}/${device.internalImages[imageIndex]}?share=${shareID}`
  );
</script>

<svelte:body
  onkeypress={(event) => {
    if (event) {
      if (event.key === 'Escape') {
        imageOpen = false;
      } else if (event.key === 'ArrowLeft' && imageOpen) {
        imageIndex = Math.max(0, imageIndex - 1);
      } else if (event.key === 'ArrowRight' && imageOpen) {
        imageIndex = Math.min(device.internalImages.length - 1, imageIndex + 1);
      }
    }
  }}
/>

{#if !data.share || data.share.type === 0}
  <div class={hasExternalImages || hasInternalImages ? 'fixed top-16 left-4 z-20' : 'p-4 pb-0'}>
    <button
      onclick={() => history.back()}
      class="flex cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-zinc-400 bg-zinc-100 px-4 py-2 shadow-md transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-800 dark:hover:bg-zinc-600"
    >
      <MoveLeft size="20" />
      <p>Back</p>
    </button>
  </div>
{/if}

{#if hasInternalImages || hasExternalImages}
  <img
    src={hasExternalImages
      ? device.externalImages[0]
      : `/api/image/device/${device.id}/${device.internalImages[0]}?share=${shareID}`}
    alt={device.deviceName}
    class="h-[50vh] w-full mask-b-from-70% object-cover"
  />
{/if}

<div class="z-10 flex flex-col gap-4 p-4">
  <div>
    {#if device.brand}
      <p class="text-sm text-zinc-500 dark:text-zinc-400">{device.brand}</p>
    {/if}
    <h1 class="text-4xl font-bold">{device.deviceName}</h1>
    <p>{device.description || 'No description.'}</p>
  </div>

  {#if device.tags?.length > 0}
    <div class="flex w-fit flex-wrap items-center justify-center gap-2">
      {#each device.tags as tag}
        <span
          class="rounded-full bg-zinc-300 px-3 py-1 text-sm font-semibold text-zinc-800 dark:bg-zinc-600 dark:text-zinc-200"
          style="background-color: {tag?.tagColour}; color: {tag?.tagTextColour};"
        >
          {tag?.tagName}
        </span>
      {/each}
    </div>
  {/if}

  {#if shareID}
    <div class="flex max-w-full flex-wrap items-center gap-2">
      <Avatar
        src={data.shareUser?.image}
        name={data.shareUser?.name}
        size={30}
        className="rounded-full"
      />
      <p class="text-base text-zinc-500 dark:text-zinc-400">
        from <strong>{data.shareUser?.name}</strong>'s galaxy
      </p>
    </div>
  {/if}

  <div class="flex w-fit flex-wrap items-center justify-center gap-2">
    {#if device.cpu}
      <AttributePill name="CPU" icon={Cpu}>
        {device.cpu}
      </AttributePill>
    {/if}

    {#if device.gpu}
      <AttributePill name="GPU" icon={Gpu}>
        {device.gpu}
      </AttributePill>
    {/if}

    {#if device.memory}
      <AttributePill name="Memory" icon={MemoryStick}>
        {device.memory}
      </AttributePill>
    {/if}

    {#if device.storage}
      <AttributePill name="Storage" icon={HardDrive}>
        {device.storage}
      </AttributePill>
    {/if}

    {#if device.os}
      <AttributePill name="Operating System" icon={Cog}>
        {device.os}
      </AttributePill>
    {/if}
  </div>
</div>

{#if hasInternalImages}
  <div class="flex flex-col gap-4 p-4">
    <h2 class="text-2xl font-bold">Images</h2>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {#each device.internalImages as image, index}
        <button
          style="background-image: url('/api/image/device/{device.id}/{image}?share={shareID}');"
          aria-label="Click to fullscreen image"
          class="bg-fit h-48 w-full rounded-lg border-2 border-zinc-400 bg-cover bg-center"
          onclick={() => {
            imageIndex = index;
            imageOpen = true;
          }}
        ></button>
      {/each}
    </div>
  </div>
{/if}

{#if imageOpen}
  <div
    class="fixed inset-0 z-60 flex items-center justify-center bg-white/60 p-4 backdrop-blur-lg dark:bg-black/60"
    transition:fade={{ duration: 100 }}
  >
    <div class="flex flex-col items-center justify-center gap-2">
      <div class="flex w-full items-center gap-2">
        <button
          class="flex h-11 w-11 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-zinc-400 bg-zinc-100 p-2 shadow-md transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-600"
          onclick={() => (imageOpen = false)}
          aria-label="Close fullscreen image"
        >
          <X size="24" />
        </button>
        <!-- We're now sure that device.internalImage is not null, so we dont check it -->
        {#if device.internalImages.length > 1}
          <button
            class="ml-auto flex h-11 w-11 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-zinc-400 bg-zinc-100 p-2 shadow-md transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-800 dark:hover:bg-zinc-600"
            onclick={() => (imageIndex = Math.max(0, imageIndex - 1))}
            disabled={imageIndex <= 0}
            aria-label="Previous image"
          >
            <MoveLeftIcon size="24" />
          </button>
          <button
            class="flex h-11 w-11 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-zinc-400 bg-zinc-100 p-2 shadow-md transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-800 dark:hover:bg-zinc-600"
            onclick={() =>
              (imageIndex = Math.min(device.internalImages.length - 1, imageIndex + 1))}
            disabled={imageIndex >= device.internalImages.length - 1}
            aria-label="Next image"
          >
            <MoveRightIcon size="24" />
          </button>
        {/if}
      </div>
      <img src={imageSrc} alt="Fullscreen" class="max-h-[80vh] max-w-full rounded-lg shadow-lg" />
    </div>
  </div>
{/if}
