<script lang="ts">
  import { fade } from 'svelte/transition';
  import {
    Cpu,
    Gpu,
    MemoryStick,
    HardDrive,
    Cog,
    Tag,
    Trash,
    Edit,
    Share,
    Menu,
    X
  } from '@lucide/svelte';
  import { toast } from 'svelte-sonner';

  let {
    device,
    shareID = '',
    includeMenu = true,
    deleteDevice = undefined,
    editPopupOpen = $bindable(),
    toEdit = $bindable()
  }: {
    device: any;
    shareID?: string;
    includeMenu?: boolean;
    deleteDevice: any;
    editPopupOpen: boolean;
    toEdit: any;
  } = $props();

  let showingOverlay = $state(false);
  let confirmDelete = $state(false);
  let shareOverlayOpen = $state(false);
  let href = $state('');
  let shareLink = $state('');

  if (shareID && shareID !== '') {
    href = `/share/${shareID}/${device.id}`;
  } else {
    href = `/dash/device/${device.id}`;
  }

  async function shareDevice() {
    try {
      const response = await fetch(`/api/share/create_share`, {
        method: 'POST',
        body: JSON.stringify({ type: 2, deviceID: device.id }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const json = await response.json();
        shareLink = `${window.location.origin}/share/${json.share.id}`;
        shareOverlayOpen = true;
      } else {
        toast.error('Failed to create share link. Please try again later.');
      }
    } catch (error) {
      console.error('Error creating share link:', error);
      toast.error('An error occurred while creating the share link.');
    }
  }
</script>

<a
  class="relative flex max-w-100 min-w-85 flex-1 flex-col overflow-hidden rounded-lg border-2 border-zinc-400 bg-zinc-200 shadow-md sm:min-w-80 dark:bg-zinc-700"
  {href}
>
  {#if device.externalImages && device.externalImages.length > 0}
    <img src={device.externalImages[0]} alt={device.deviceName} class="h-48 w-full object-cover" />
  {:else if device.internalImages && device.internalImages.length > 0}
    <img
      src={`/api/image/device/${device.id}/${device.internalImages[0]}?share=${shareID || ''}`}
      alt={device.deviceName}
      class="h-48 w-full object-cover"
    />
  {/if}
  <div class="flex w-full flex-col gap-2 p-4">
    <div>
      <p class="text-sm text-zinc-600 dark:text-zinc-400">{device.brand}</p>
      <h2 class="text-xl font-semibold" translate="no">{device.deviceName}</h2>
      {#if !device.description || device.description.trim() === ''}
        <p class="text-sm text-zinc-500 dark:text-zinc-300">No description available</p>
      {:else}
        <p>{device.description}</p>
      {/if}
    </div>

    <div class="flex w-full flex-wrap gap-1 text-sm">
      {#if device.cpu}
        <div
          class="flex h-fit w-fit items-center justify-center gap-2 rounded-full border-2 border-zinc-400 bg-zinc-100 p-2 px-4 dark:bg-zinc-800"
        >
          <Cpu size="20" />
          <p translate="no">{device.cpu}</p>
        </div>
      {/if}
      {#if device.gpu}
        <div
          class="flex h-fit w-fit items-center justify-center gap-2 rounded-full border-2 border-zinc-400 bg-zinc-100 p-2 px-4 dark:bg-zinc-800"
        >
          <Gpu size="20" />
          <p translate="no">{device.gpu}</p>
        </div>
      {/if}
      {#if device.memory}
        <div
          class="flex h-fit w-fit items-center justify-center gap-2 rounded-full border-2 border-zinc-400 bg-zinc-100 p-2 px-4 dark:bg-zinc-800"
        >
          <MemoryStick size="20" />
          <p translate="no">{device.memory}</p>
        </div>
      {/if}
      {#if device.storage}
        <div
          class="flex h-fit w-fit items-center justify-center gap-2 rounded-full border-2 border-zinc-400 bg-zinc-100 p-2 px-4 dark:bg-zinc-800"
        >
          <HardDrive size="20" />
          <p translate="no">{device.storage}</p>
        </div>
      {/if}
      {#if device.os}
        <div
          class="flex h-fit w-fit items-center justify-center gap-2 rounded-full border-2 border-zinc-400 bg-zinc-100 p-2 px-4 dark:bg-zinc-800"
        >
          <Cog size="20" />
          <p translate="no">{device.os}</p>
        </div>
      {/if}

      {#if device.tags && device.tags.length > 0}
        {#each device.tags as tag}
          <div
            class="flex h-fit w-fit items-center justify-center gap-2 rounded-full border-2 border-zinc-400 bg-zinc-100 p-2 px-4 dark:bg-zinc-800"
            style="background-color: {tag.tagColour}; color: {tag.tagTextColour};"
          >
            <Tag size="20" />
            <p translate="no">{tag.tagName}</p>
          </div>
        {/each}
      {/if}
    </div>
  </div>

  {#if includeMenu}
    <div class="mt-auto flex w-full items-end justify-end p-4 pt-0">
      <button
        onclick={(event) => {
          event.preventDefault();
          showingOverlay = !showingOverlay;
          confirmDelete = false;
        }}
        aria-label="Toggle menu"
        class="z-10 cursor-pointer rounded-full border-2 border-zinc-400 bg-zinc-100 p-2 shadow-md transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-600"
      >
        {#if showingOverlay}
          <X size="20" />
        {:else}
          <Menu size="20" />
        {/if}
      </button>
    </div>
  {/if}

  {#if showingOverlay}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="absolute inset-0 flex cursor-default flex-col items-center justify-center gap-2 bg-white/60 p-4 backdrop-blur-lg dark:bg-black/60"
      transition:fade={{ duration: 100 }}
      onclick={(event) => {
        event.preventDefault();
      }}
    >
      <button
        class="flex w-full cursor-pointer items-center justify-center gap-2"
        onclick={(event) => {
          event.preventDefault();
          showingOverlay = false;
          editPopupOpen = true;
          toEdit = device;
        }}
      >
        <Edit size="20" />
        <p>Edit Device</p>
      </button>
      <hr class="w-full text-zinc-800 dark:text-zinc-200" />
      <button
        class="flex w-full cursor-pointer items-center justify-center gap-2"
        onclick={(event) => {
          event.preventDefault();
          shareDevice();
        }}
      >
        <Share size="20" />
        <p>New Share Link</p>
      </button>
      <hr class="w-full text-zinc-800 dark:text-zinc-200" />
      <button
        class="flex w-full cursor-pointer items-center justify-center gap-2 text-red-700 dark:text-red-200"
        onclick={() => {
          if (!confirmDelete) {
            confirmDelete = true;
          } else {
            deleteDevice(device.id);
          }
        }}
      >
        <Trash size="20" />
        {#if confirmDelete}
          <p>Press again to confirm</p>
        {:else}
          <p>Delete Device</p>
        {/if}
      </button>
    </div>
  {/if}
</a>

{#if shareOverlayOpen}
  <div
    class="fixed inset-0 z-60 mt-12 flex items-center justify-center overflow-hidden bg-white/60 p-4 backdrop-blur-lg dark:bg-black/60"
    transition:fade={{ duration: 100 }}
  >
    <div
      class="absolute inset-0 z-70"
      onclick={() => (shareOverlayOpen = false)}
      aria-hidden="true"
    ></div>

    <div
      class="z-80 flex max-h-full w-full max-w-lg flex-col overflow-hidden rounded-xl border-4 border-zinc-400 bg-zinc-100 shadow-2xl dark:bg-zinc-800"
    >
      <div class="flex items-center justify-between border-b p-4">
        <h2 class="text-xl font-bold">Shared</h2>
        <button
          onclick={() => (shareOverlayOpen = false)}
          class="cursor-pointer text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-400"
          aria-label="Close"><X /></button
        >
      </div>

      <div class="flex flex-col gap-4 p-6">
        <p>
          A share link has been created. Copy the link below to share the device. You can copy the
          link or revoke it at any time in the shares page.
        </p>

        <p class="text-sm font-medium">Share Link</p>
        <div class="w-full max-w-full overflow-hidden rounded-lg border p-2 text-wrap break-all">
          {shareLink}
        </div>
      </div>

      <div class="border-t p-6">
        <button
          onclick={() => {
            navigator.clipboard.writeText(shareLink);
            toast.success('Share link copied to clipboard!');
          }}
          class="w-full rounded-lg bg-blue-500 p-2 text-white hover:bg-blue-600"
        >
          Copy Share Link
        </button>
      </div>
    </div>
  </div>
{/if}
