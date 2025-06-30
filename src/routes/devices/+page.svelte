<script lang="ts">
	import { onMount } from 'svelte';

	import type { InferSelectModel } from 'drizzle-orm';
	import type { userDevices, cpus, memory, storage, os, brands } from '$lib/server/db/schema';

	import { toast } from 'svelte-sonner';
	import { Plus, Check, MoveLeft, MoveRight, RefreshCw } from '@lucide/svelte';

	import DeviceCard from '$lib/components/DeviceCard.svelte';
	import FilterPill from '$lib/components/FilterPill.svelte';
	import Form from '$lib/components/add_device/Form.svelte';
	import type { AttributeLists } from '$lib/components/add_device/Form.svelte';

	type Device = InferSelectModel<typeof userDevices>;
	type CPU = InferSelectModel<typeof cpus>;
	type Memory = InferSelectModel<typeof memory>;
	type Storage = InferSelectModel<typeof storage>;
	type OS = InferSelectModel<typeof os>;
	type Brand = InferSelectModel<typeof brands>;

	const { data } = $props();

	let devices = $state<Device[]>([]);
	let createPopupOpen: boolean = $state(false);
	let message = $state();

	let totalDevices = $state(0);
	let loadingDevices = $state(false);
	let errorLoadingDevices = $state(false);

	let attributeLists: AttributeLists = $state({
		cpus: [],
		memory: [],
		storage: [],
		os: [],
		brands: []
	});

	let loadingAttributes = $state(false);
	let errorLoadingAttributes = $state(false);

	let activeFilters = $state({
		brand: [] as number[],
		cpu: [] as number[],
		memory: [] as number[],
		storage: [] as number[],
		os: [] as number[]
	});
	let selectedFilters = $state({
		brand: [] as number[],
		cpu: [] as number[],
		memory: [] as number[],
		storage: [] as number[],
		os: [] as number[]
	});
	let filtersVisible = $state(false);
	let showApplyFilters = $state(false);
	let applyingFilters = $state(false);

	let page = $state(1);
	let maxPages = $derived(Math.ceil(totalDevices / 10));

	let currentSearch = '';
	let search = $state('');

	async function fetchDevices() {
		if (loadingDevices) return;
		if (errorLoadingDevices) return;

		loadingDevices = true;
		try {
			let url = `/api/devices/get_devices?offset=${(page - 1) * 10}&limit=10`;

			if (applyingFilters) {
				if (activeFilters.cpu.length > 0) url += `&cpu=${activeFilters.cpu.join(',')}`;
				if (activeFilters.memory.length > 0) url += `&memory=${activeFilters.memory.join(',')}`;
				if (activeFilters.storage.length > 0) url += `&storage=${activeFilters.storage.join(',')}`;
				if (activeFilters.os.length > 0) url += `&os=${activeFilters.os.join(',')}`;
				if (activeFilters.brand.length > 0) url += `&brand=${activeFilters.brand.join(',')}`;
			}

			if (currentSearch && currentSearch !== '') {
				url += `&search=${encodeURIComponent(currentSearch)}`;
			}

			const response = await fetch(url);
			const data = await response.json();

			devices = data.devices as Device[];
			totalDevices = data.totalDevices;
		} catch (error) {
			console.error('Error fetching devices:', error);
			errorLoadingDevices = true;
		} finally {
			loadingDevices = false;
			applyingFilters = false;
		}
	}

	async function getAttributes() {
		if (loadingAttributes) return;
		if (errorLoadingAttributes) return;

		loadingAttributes = true;
		try {
			const response = await fetch('/api/devices/get_attributes');
			const data = await response.json();

			attributeLists.cpus = data.cpus as CPU[];
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

	function previousPage() {
		if (page > 0) {
			page -= 1;
			fetchDevices();
		}
	}

	function nextPage() {
		if (page < maxPages) {
			page += 1;
			fetchDevices();
		}
	}

	function refreshDevices() {
		fetchDevices();
		getAttributes();
	}

	onMount(() => {
		refreshDevices();
	});

	$effect(() => {
		if (message) {
			if (message === 'Device added successfully!') {
				toast.success(message as string);
				refreshDevices();
				createPopupOpen = false;
			} else if (typeof message === 'string' && message) {
				toast.warning(message);
			}
		}
		message = undefined;
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

{#if data.user}
	<Form sourceForm={data.form} {attributeLists} bind:createPopupOpen bind:message />

	<div class="flex flex-col gap-2">
		<h1 class="text-4xl font-bold">Devices</h1>
		<div class="flex flex-wrap gap-2">
			<button
				class="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-2 border-zinc-400 bg-blue-500 text-white"
				onclick={() => (createPopupOpen = true)}
			>
				<Plus size="20" />
			</button>
			<button
				class="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-2 border-zinc-400 bg-zinc-100 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-600"
				onclick={refreshDevices}
			>
				<RefreshCw size="20" />
			</button>
			<input
				type="text"
				id="search"
				name="search"
				class="z-20 flex items-center justify-center gap-2 rounded-full border-2 border-zinc-400 bg-zinc-100 px-4 py-2 dark:bg-zinc-800"
				bind:value={search}
				placeholder="Search devices..."
				onkeydown={(e) => {
					if (e.key === 'Enter') {
						if (search.trim().toLocaleLowerCase() !== currentSearch) {
							currentSearch = search.trim().toLocaleLowerCase();
							page = 1;
							fetchDevices();
						}
						fetchDevices();
					}
				}}
			/>
			<button
				class="z-20 flex cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-zinc-400 bg-zinc-100 px-4 py-2 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-600"
				onclick={() => (filtersVisible = !filtersVisible)}
			>
				<p>{filtersVisible ? 'Hide' : 'Show'} Filters</p>
				<div
					class="transition-transform duration-300 ease-in-out"
					class:rotate-180={filtersVisible}
				>
					<MoveRight size="20" />
				</div>
			</button>
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
			{/if}
			{#if showApplyFilters}
				<button
					class="flex items-center justify-center gap-2 rounded-full border-2 border-zinc-400 bg-green-500 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-40"
					disabled={applyingFilters}
					onclick={() => {
						applyingFilters = true;
						showApplyFilters = false;
						activeFilters = {
							brand: [...selectedFilters.brand],
							cpu: [...selectedFilters.cpu],
							memory: [...selectedFilters.memory],
							storage: [...selectedFilters.storage],
							os: [...selectedFilters.os]
						};
						fetchDevices();
						getAttributes();
					}}
				>
					<Check size="20" />
					Apply
				</button>
			{/if}
		</div>
		{#if loadingDevices}
			<p>Loading devices...</p>
		{:else if totalDevices === 0}
			<p>No devices found.</p>
		{:else}
			<p class="text-sm text-zinc-500">Total devices: {totalDevices}</p>
			<div class="flex w-full flex-wrap justify-center gap-2">
				{#each devices as device}
					<DeviceCard
						id={device.id}
						name={device.deviceName}
						description={device.description}
						brand={device.brand}
						cpu={device.cpu}
						memory={device.memory}
						storage={device.storage}
						os={device.os}
						background={device.imageURLs === null ? undefined : device.imageURLs[0]}
					/>
				{/each}
			</div>

			{#if maxPages > 1}
				<div class="flex items-center justify-center gap-4">
					<button
						onclick={previousPage}
						class="rounded-full border-2 border-zinc-400 bg-zinc-100 p-2 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-800"
						disabled={page <= 1}><MoveLeft size="20" /></button
					>
					<span>Page {page} of {maxPages}</span>
					<button
						onclick={nextPage}
						class="rounded-full border-2 border-zinc-400 bg-zinc-100 p-2 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-800"
						disabled={page >= maxPages}><MoveRight size="20" /></button
					>
				</div>
			{/if}
		{/if}
	</div>
{/if}
