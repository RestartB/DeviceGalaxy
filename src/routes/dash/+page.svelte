<script lang="ts">
  // Get session from props
  const { data } = $props();

  import { goto } from '$app/navigation';

  import AddDeviceForm from '$lib/components/forms/add_device/Form.svelte';
  import CreateTagForm from '$lib/components/forms/add_tag/Form.svelte';
  import Avatar from '$lib/components/Avatar.svelte';
  import DeviceCard from '$lib/components/DeviceCard.svelte';
  import { Shield, Monitor, Tag } from '@lucide/svelte';

  let createDevicePopupOpen = $state(false);
  let createTagPopupOpen = $state(false);
  let search = $state('');

  function refreshAll() {
    goto('/dash');
  }
</script>

<svelte:head>
  <title>DeviceGalaxy</title>
</svelte:head>

{#if data.user}
  <AddDeviceForm
    sourceForm={data.newDeviceForm}
    newTagForm={data.newTagForm}
    {refreshAll}
    attributeLists={data.attributeLists}
    tagList={data.tags}
    bind:createPopupOpen={createDevicePopupOpen}
  />

  <CreateTagForm
    sourceForm={data.newTagForm}
    {refreshAll}
    bind:createPopupOpen={createTagPopupOpen}
  />
{/if}

<div class="flex w-full max-w-[1920px] flex-col gap-4">
  {#if data.user}
    <div class="flex w-full flex-col gap-2">
      <h1 class="text-4xl font-bold">Home</h1>
      <div class="flex items-center gap-2">
        <Avatar
          size={44}
          src={data.user.image || ''}
          name={data.user.name || ''}
          alt="User Avatar"
          className="border-zinc-400"
        />
        <div>
          <h1 class="text-lg font-semibold">
            {data.randomGreeting}
            <span translate="no">{data.user.name}</span>! Where to today?
          </h1>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        {#if !data.user.twoFactorEnabled}
          <a
            class="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-zinc-400 bg-zinc-100 px-4 py-2 font-bold text-nowrap transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-600"
            href="/dash/auth/setup-2fa"
            title="Enable 2FA"
          >
            <Shield size="20" />
            Enable 2FA
          </a>
        {/if}
        <button
          class="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-zinc-400 bg-green-600 px-4 py-2 font-bold text-nowrap text-white transition-colors hover:bg-green-500"
          onclick={() => (createDevicePopupOpen = true)}
        >
          <Monitor size="20" />
          Add New Device
        </button>
        <button
          class="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-zinc-400 bg-blue-600 px-4 py-2 font-bold text-nowrap text-white transition-colors hover:bg-blue-500"
          onclick={() => (createTagPopupOpen = true)}
        >
          <Tag size="20" />
          Add New Tag
        </button>
      </div>
    </div>

    {#if data.recentlyUpdated && data.recentlyUpdated?.length > 0}
      <h2 class="text-2xl font-semibold">Recently Modified</h2>
      <div class="flex w-fit max-w-full flex-nowrap gap-4 overflow-x-auto">
        {#each data.recentlyUpdated as device}
          <DeviceCard
            {device}
            includeMenu={false}
            deleteDevice={undefined}
            editPopupOpen={false}
            toEdit={null}
          />
        {/each}

        {#if data.recentlyUpdated.length === 0}
          <p class="text-sm text-zinc-500">No devices to show.</p>
        {:else if data.totalCount > 5}
          <a
            class="relative flex max-w-sm min-w-50 flex-1 flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border-2 border-zinc-400 bg-zinc-200 p-4 shadow-md sm:min-w-80 dark:bg-zinc-700"
            href="/dash/devices"
          >
            <div
              class="mt-auto flex max-w-full flex-col items-center justify-center gap-2 overflow-hidden"
            >
              <div
                class="max-w-full overflow-hidden rounded-full bg-zinc-100 px-8 py-4 dark:bg-zinc-800"
              >
                <p class="overflow-hidden text-5xl font-bold text-nowrap text-ellipsis">
                  +{(data.totalCount - 5).toLocaleString()}
                </p>
              </div>
              <p class="text-xl font-semibold">View All</p>
            </div>

            <p class="mt-auto text-center text-sm">View all of your devices on the devices page.</p>
          </a>
        {/if}
      </div>
    {/if}

    {#if data.recentlyCreated && data.recentlyCreated?.length > 0}
      <h2 class="text-2xl font-semibold">Recently Created</h2>
      <div class="flex w-fit max-w-full flex-nowrap gap-4 overflow-x-auto">
        {#each data.recentlyCreated as device}
          <DeviceCard
            {device}
            includeMenu={false}
            deleteDevice={undefined}
            editPopupOpen={false}
            toEdit={null}
          />
        {/each}

        {#if data.recentlyUpdated.length === 0}
          <p class="text-sm text-zinc-500">No devices to show.</p>
        {:else if data.totalCount > 5}
          <a
            class="relative flex max-w-sm min-w-50 flex-1 flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border-2 border-zinc-400 bg-zinc-200 p-4 shadow-md sm:min-w-80 dark:bg-zinc-700"
            href="/dash/devices"
          >
            <div
              class="mt-auto flex max-w-full flex-col items-center justify-center gap-2 overflow-hidden"
            >
              <div
                class="max-w-full overflow-hidden rounded-full bg-zinc-100 px-8 py-4 dark:bg-zinc-800"
              >
                <p class="overflow-hidden text-5xl font-bold text-nowrap text-ellipsis">
                  +{(data.totalCount - 5).toLocaleString()}
                </p>
              </div>
              <p class="text-xl font-semibold">View All</p>
            </div>

            <p class="mt-auto text-center text-sm">View all of your devices on the devices page.</p>
          </a>
        {/if}
      </div>
    {/if}
  {/if}
</div>
