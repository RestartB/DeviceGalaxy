<script lang="ts">
  import { onMount } from 'svelte';

  import type { InferSelectModel } from 'drizzle-orm';
  import type {
    tags,
    userDevices,
    cpus,
    gpus,
    memory,
    storage,
    os,
    brands
  } from '$lib/server/db/schema';

  import { toast } from 'svelte-sonner';
  import { Plus, Check, MoveLeft, MoveRight, RefreshCw, Search } from '@lucide/svelte';
  import Avatar from '$lib/components/Avatar.svelte';

  import DeviceCard from '$lib/components/DeviceCard.svelte';
  import FilterPill from '$lib/components/FilterPill.svelte';
  import TagFilterPill from '$lib/components/TagFilterPill.svelte';

  import AddDeviceForm from '$lib/components/forms/add_device/Form.svelte';
  import EditDeviceForm from '$lib/components/forms/edit_device/Form.svelte';
  import type { AttributeLists } from '$lib/components/forms/add_device/Form.svelte';

  type Device = InferSelectModel<typeof userDevices>;
  type CPU = InferSelectModel<typeof cpus>;
  type GPU = InferSelectModel<typeof gpus>;
  type Memory = InferSelectModel<typeof memory>;
  type Storage = InferSelectModel<typeof storage>;
  type OS = InferSelectModel<typeof os>;
  type Brand = InferSelectModel<typeof brands>;
  type Tag = InferSelectModel<typeof tags>;

  const { data, shareID } = $props();

  let devices = $state<Device[]>([]);
  let createPopupOpen: boolean = $state(false);

  let editPopupOpen: boolean = $state(false);
  let toEdit: Device | undefined = $state();

  let totalDevices = $state(0);
  let loadingDevices = $state(false);
  let errorLoadingDevices = $state(false);

  let attributeLists: AttributeLists = $state({
    cpus: [],
    gpus: [],
    memory: [],
    storage: [],
    os: [],
    brands: [],
    tags: []
  });

  let loadingAttributes = $state(false);
  let errorLoadingAttributes = $state(false);

  let tagList: Tag[] = $state([]);

  let loadingTags = $state(false);
  let errorLoadingTags = $state(false);

  let activeFilters = $state({
    brand: [] as number[],
    cpu: [] as number[],
    gpu: [] as number[],
    memory: [] as number[],
    storage: [] as number[],
    os: [] as number[],
    tags: [] as number[]
  });
  let selectedFilters = $state({
    brand: [] as number[],
    cpu: [] as number[],
    gpu: [] as number[],
    memory: [] as number[],
    storage: [] as number[],
    os: [] as number[],
    tags: [] as number[]
  });
  let filtersVisible = $state(false);
  let showApplyFilters = $state(false);
  let showResetFilters = $derived(Object.values(activeFilters).some((filter) => filter.length > 0));

  let page = $state(1);
  let maxPages = $derived(Math.ceil(totalDevices / 40));

  let currentSearch = $state('');
  let search = $state('');

  async function fetchDevices() {
    if (loadingDevices) return;
    if (errorLoadingDevices) return;

    loadingDevices = true;
    try {
      let url = `/api/devices/get_devices?offset=${(page - 1) * 40}&limit=40`;

      const hasActiveFilters = Object.values(activeFilters).some((filter) => filter.length > 0);

      if (hasActiveFilters) {
        if (activeFilters.cpu.length > 0) url += `&cpu=${activeFilters.cpu.join(',')}`;
        if (activeFilters.gpu.length > 0) url += `&gpu=${activeFilters.gpu.join(',')}`;
        if (activeFilters.memory.length > 0) url += `&memory=${activeFilters.memory.join(',')}`;
        if (activeFilters.storage.length > 0) url += `&storage=${activeFilters.storage.join(',')}`;
        if (activeFilters.os.length > 0) url += `&os=${activeFilters.os.join(',')}`;
        if (activeFilters.brand.length > 0) url += `&brand=${activeFilters.brand.join(',')}`;
        if (activeFilters.tags.length > 0) url += `&tags=${activeFilters.tags.join(',')}`;
      }

      if (currentSearch && currentSearch !== '') {
        url += `&search=${encodeURIComponent(currentSearch)}`;
      }

      if (shareID) {
        url += `&share=${shareID}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      devices = data.devices;
      totalDevices = data.totalDevices;
    } catch (error) {
      console.error('Error fetching devices:', error);
      errorLoadingDevices = true;
    } finally {
      loadingDevices = false;
    }
  }

  async function getAttributes() {
    if (loadingAttributes) return;
    if (errorLoadingAttributes) return;

    loadingAttributes = true;
    try {
      let url = '/api/devices/get_attributes';

      if (shareID) {
        url += `?share=${shareID}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      attributeLists.cpus = data.cpus as CPU[];
      attributeLists.gpus = data.gpus as GPU[];
      attributeLists.memory = data.memory as Memory[];
      attributeLists.storage = data.storage as Storage[];
      attributeLists.os = data.os as OS[];
      attributeLists.brands = data.brands as Brand[];
    } catch (error) {
      console.error('Error fetching attributes:', error);
      errorLoadingAttributes = true;
    } finally {
      loadingAttributes = false;
    }
  }

  async function getTags() {
    if (loadingTags) return;
    if (errorLoadingTags) return;

    loadingTags = true;
    try {
      let url = '/api/tags/get_tags';

      if (shareID) {
        url += `?share=${shareID}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      tagList = data.tags as Tag[];
    } catch (error) {
      console.error('Error fetching tags:', error);
      errorLoadingTags = true;
    } finally {
      loadingTags = false;
    }
  }

  function deleteDevice(id: number) {
    fetch(`/api/devices/delete_device?id=${id}`, { method: 'DELETE' })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          toast.success('Device deleted successfully!');
          refreshAll();
        } else {
          toast.error(data.message || 'Failed to delete device.');
        }
      })
      .catch((error) => {
        console.error('Error deleting device:', error);
        toast.error('An error occurred while deleting the device.');
      });
  }

  function previousPage() {
    if (page > 0) {
      page -= 1;
      refreshAll();
    }
  }

  function nextPage() {
    if (page < maxPages) {
      page += 1;
      refreshAll();
    }
  }

  function refreshAll() {
    fetchDevices();
    getAttributes();
    getTags();
  }

  onMount(() => {
    // Get filter arguments from URL
    const urlParams = new URLSearchParams(window.location.search);
    const filterParams = {
      brand: urlParams.get('brand')?.split(',').map(Number) || [],
      cpu: urlParams.get('cpu')?.split(',').map(Number) || [],
      gpu: urlParams.get('gpu')?.split(',').map(Number) || [],
      memory: urlParams.get('memory')?.split(',').map(Number) || [],
      storage: urlParams.get('storage')?.split(',').map(Number) || [],
      os: urlParams.get('os')?.split(',').map(Number) || [],
      tags: urlParams.get('tags')?.split(',').map(Number) || []
    };

    selectedFilters = {
      brand: filterParams.brand,
      cpu: filterParams.cpu,
      gpu: filterParams.gpu,
      memory: filterParams.memory,
      storage: filterParams.storage,
      os: filterParams.os,
      tags: filterParams.tags
    };
    activeFilters = {
      brand: [...selectedFilters.brand],
      cpu: [...selectedFilters.cpu],
      gpu: [...selectedFilters.gpu],
      memory: [...selectedFilters.memory],
      storage: [...selectedFilters.storage],
      os: [...selectedFilters.os],
      tags: [...selectedFilters.tags]
    };

    currentSearch = urlParams.get('search') || '';
    search = currentSearch;

    refreshAll();
  });

  $effect(() => {
    const hasNewFilters = Object.keys(selectedFilters).some((key) => {
      const selectedKey = key as keyof typeof selectedFilters;
      return (
        JSON.stringify(selectedFilters[selectedKey].sort()) !==
        JSON.stringify(activeFilters[selectedKey].sort())
      );
    });

    const hasSelectedFilters = Object.keys(selectedFilters).some(
      (key) => selectedFilters[key as keyof typeof selectedFilters].length > 0
    );

    const hasActiveFilters = Object.keys(activeFilters).some(
      (key) => activeFilters[key as keyof typeof activeFilters].length > 0
    );

    showApplyFilters = hasNewFilters && (hasSelectedFilters || hasActiveFilters);
  });
</script>

{#if !shareID}
  <AddDeviceForm
    sourceForm={data.newDeviceForm}
    newTagForm={data.newTagForm}
    {refreshAll}
    {attributeLists}
    {tagList}
    bind:createPopupOpen
  />

  <EditDeviceForm
    sourceForm={data.editDeviceForm}
    newTagForm={data.newTagForm}
    {toEdit}
    {refreshAll}
    {attributeLists}
    {tagList}
    bind:editPopupOpen
  />
{/if}

<div class="flex flex-col gap-2">
  {#if shareID}
    <div class="flex w-full flex-wrap items-center gap-2">
      <Avatar
        size={30}
        src={data.shareUser.image || ''}
        name={data.shareUser.name || ''}
        alt="User Avatar"
        className="border-zinc-400"
      />
      <h1 class="text-4xl font-bold">
        <span translate="no">{data.shareUser.name}</span>'s Devices
      </h1>
    </div>
  {:else}
    <h1 class="text-4xl font-bold">Devices</h1>
  {/if}

  {#if shareID && data.shareUser && data.shareUser.description}
    <p>
      {data.shareUser.description}
    </p>
  {:else if shareID && data.shareUser}
    <p class="text-zinc-500 dark:text-zinc-400">
      View devices shared by <span translate="no">{data.shareUser.name}</span>.
    </p>
  {:else}
    <p>View all of the devices saved to your account.</p>
  {/if}
  <div class="flex flex-wrap gap-2">
    {#if !shareID && data.user}
      {#if !data.user.banned}
        <button
          class="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-2 border-zinc-400 bg-blue-500 text-white"
          onclick={() => (createPopupOpen = true)}
        >
          <Plus size="20" />
        </button>
      {/if}
    {/if}
    <button
      class="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-2 border-zinc-400 bg-zinc-100 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-600"
      onclick={refreshAll}
    >
      <RefreshCw size="20" />
    </button>
    <input
      type="text"
      id="search"
      name="search"
      class="flex w-full max-w-96 items-center justify-center gap-2 rounded-full border-2 border-zinc-400 bg-zinc-100 px-4 py-2 dark:bg-zinc-800"
      bind:value={search}
      placeholder="Search devices..."
      onkeydown={(e) => {
        if (e.key === 'Enter') {
          if (search.trim().toLocaleLowerCase() !== currentSearch) {
            currentSearch = search.trim().toLocaleLowerCase();
            page = 1;
            refreshAll();
          }
        }
      }}
    />

    {#if search.toLowerCase() !== currentSearch}
      <button
        class="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-2 border-zinc-400 bg-zinc-100 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-600"
        aria-label="Search for {search}"
        onclick={() => {
          currentSearch = search.trim().toLocaleLowerCase();
          page = 1;
          refreshAll();
        }}
      >
        <Search size="20" />
      </button>
    {/if}

    <button
      class="flex min-w-40 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-zinc-400 bg-zinc-100 px-4 py-2 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-600"
      onclick={() => (filtersVisible = !filtersVisible)}
    >
      <p>{filtersVisible ? 'Hide' : 'Show'} Filters</p>
      <div class="transition-transform duration-300 ease-in-out" class:rotate-180={filtersVisible}>
        <MoveRight size="20" />
      </div>
    </button>
    {#if showApplyFilters}
      <button
        class="flex items-center justify-center gap-2 rounded-full border-2 border-zinc-400 bg-green-500 px-4 py-2 text-white"
        onclick={() => {
          showApplyFilters = false;
          activeFilters = {
            brand: [...selectedFilters.brand],
            cpu: [...selectedFilters.cpu],
            gpu: [...selectedFilters.gpu],
            memory: [...selectedFilters.memory],
            storage: [...selectedFilters.storage],
            os: [...selectedFilters.os],
            tags: [...selectedFilters.tags]
          };
          refreshAll();
        }}
      >
        <Check size="20" />
        Apply
      </button>
    {/if}
    {#if showResetFilters}
      <button
        class="flex items-center justify-center gap-2 rounded-full border-2 border-zinc-400 bg-red-500 px-4 py-2 text-white"
        onclick={() => {
          activeFilters = {
            brand: [],
            cpu: [],
            gpu: [],
            memory: [],
            storage: [],
            os: [],
            tags: []
          };
          selectedFilters = {
            brand: [],
            cpu: [],
            gpu: [],
            memory: [],
            storage: [],
            os: [],
            tags: []
          };
          refreshAll();
        }}
      >
        <RefreshCw size="20" />
        Reset Filters
      </button>
    {/if}
    {#if filtersVisible}
      <FilterPill
        name="Brand"
        options={attributeLists.brands}
        bind:selectedItems={selectedFilters.brand}
      />
      <FilterPill
        name="CPU"
        options={attributeLists.cpus}
        bind:selectedItems={selectedFilters.cpu}
      />
      <FilterPill
        name="GPU"
        options={attributeLists.gpus}
        bind:selectedItems={selectedFilters.gpu}
      />
      <FilterPill
        name="Memory"
        options={attributeLists.memory}
        bind:selectedItems={selectedFilters.memory}
      />
      <FilterPill
        name="Storage"
        options={attributeLists.storage}
        bind:selectedItems={selectedFilters.storage}
      />
      <!-- prettier-ignore -->
      <FilterPill
				name="OS"
				options={attributeLists.os}
				bind:selectedItems={selectedFilters.os}
			/>
      <!-- prettier-ignore -->
      <TagFilterPill
				options={tagList}
				bind:selectedItems={selectedFilters.tags}
			/>
    {/if}
  </div>
  {#if loadingDevices}
    <p>Loading devices...</p>
  {:else if totalDevices === 0}
    <p>No devices found.</p>
  {:else}
    <div class="flex w-full flex-wrap justify-center gap-4">
      {#each devices as device}
        <DeviceCard
          {device}
          bind:editPopupOpen
          bind:toEdit
          {deleteDevice}
          {shareID}
          includeMenu={!shareID}
          banned={data.user.banned}
        />
      {/each}
    </div>

    {#if maxPages > 1}
      <div class="flex items-center justify-center gap-4">
        <button
          onclick={previousPage}
          class="cursor-pointer rounded-full border-2 border-zinc-400 bg-zinc-100 p-2 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-800"
          aria-label="Previous Page"
          disabled={page <= 1}><MoveLeft size="20" /></button
        >
        <span>Page {page} of {maxPages}</span>
        <button
          onclick={nextPage}
          class="cursor-pointer rounded-full border-2 border-zinc-400 bg-zinc-100 p-2 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-800"
          aria-label="Next Page"
          disabled={page >= maxPages}><MoveRight size="20" /></button
        >
      </div>
    {/if}
  {/if}
</div>
