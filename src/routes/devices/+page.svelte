<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { schema } from './schema';

	import type { InferSelectModel } from 'drizzle-orm';
	import type { userDevices, cpus, memory, storage, os, brands } from '$lib/server/db/schema';

	import { toast } from 'svelte-sonner';
	import Fuse from 'fuse.js';

	import DeviceCard from '$lib/components/DeviceCard.svelte';
	import FilterPill from '$lib/components/FilterPill.svelte';

	type Device = InferSelectModel<typeof userDevices>;
	type CPU = InferSelectModel<typeof cpus>;
	type Memory = InferSelectModel<typeof memory>;
	type Storage = InferSelectModel<typeof storage>;
	type OS = InferSelectModel<typeof os>;
	type Brand = InferSelectModel<typeof brands>;

	const { data } = $props();
	const { form, errors, message, enhance, validateForm } = superForm(data.form, {
		validators: zod4Client(schema),
		customValidity: false,
		validationMethod: 'auto',

		onError: (error) => {
			console.error('Form submission error:', error);
			toast.error('Failed to create device. Try again later.');
		}
	});

	let devices = $state<Device[]>([]);

	let totalDevices = $state(0);
	let loadingDevices = $state(false);
	let errorLoadingDevices = $state(false);

	let attributeLists = $state({
		cpus: [] as CPU[],
		memory: [] as Memory[],
		storage: [] as Storage[],
		os: [] as OS[],
		brands: [] as Brand[]
	});

	let cpuFuzzy = $state<Fuse<CPU> | null>(null);
	let memoryFuzzy = $state<Fuse<Memory> | null>(null);
	let storageFuzzy = $state<Fuse<Storage> | null>(null);
	let osFuzzy = $state<Fuse<OS> | null>(null);
	let brandFuzzy = $state<Fuse<Brand> | null>(null);

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
	let showApplyFilters = $state(false);
	let applyingFilters = $state(false);

	let page = $state(1);
	let maxPages = $derived(Math.ceil(totalDevices / 10));

	let createPopupOpen = $state(false);
	let formPage = $state(0);

	let brandFocus = $state(false);
	let cpuFocus = $state(false);
	let memoryFocus = $state(false);
	let storageFocus = $state(false);
	let osFocus = $state(false);

	type FormErrors = typeof $errors;

	let hasErrors = $derived(
		Object.keys($errors).some((key) => {
			const typedKey = key as keyof FormErrors;
			return typedKey !== '_errors' && $errors[typedKey];
		}) ||
			($errors._errors && $errors._errors.length > 0)
	);

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

			console.log(url);

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

	async function asyncValidateForm() {
		await validateForm({ update: true });
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

	onMount(async () => {
		await fetchDevices();
		await getAttributes();
	});

	$effect(() => {
		if (formPage === 2) {
			asyncValidateForm();
			console.log('Form validation complete');
		}
	});

	$effect(() => {
		if ($message) {
			if ($message === 'Device added successfully!') {
				toast.success($message);
				fetchDevices();
				getAttributes();
				createPopupOpen = false;
			} else {
				toast.warning($message);
			}
		}
	});

	$effect(() => {
		if (attributeLists.cpus.length > 0) {
			cpuFuzzy = new Fuse(attributeLists.cpus, {
				keys: ['displayName'],
				includeScore: true,
				threshold: 0.3
			});
		}
		if (attributeLists.memory.length > 0) {
			memoryFuzzy = new Fuse(attributeLists.memory, {
				keys: ['displayName'],
				includeScore: true,
				threshold: 0.3
			});
		}
		if (attributeLists.storage.length > 0) {
			storageFuzzy = new Fuse(attributeLists.storage, {
				keys: ['displayName'],
				includeScore: true,
				threshold: 0.3
			});
		}
		if (attributeLists.os.length > 0) {
			osFuzzy = new Fuse(attributeLists.os, {
				keys: ['displayName'],
				includeScore: true,
				threshold: 0.3
			});
		}
		if (attributeLists.brands.length > 0) {
			brandFuzzy = new Fuse(attributeLists.brands, {
				keys: ['displayName'],
				includeScore: true,
				threshold: 0.3
			});
		}
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
	{#if createPopupOpen}
		<div
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
			transition:fade={{ duration: 100 }}
		>
			<div class="flex w-full max-w-lg flex-col overflow-hidden rounded-xl bg-zinc-100 shadow-2xl">
				<div class="flex items-center justify-between border-b p-4">
					<h2 class="text-xl font-bold">Create New Device</h2>
					<button
						onclick={() => (createPopupOpen = false)}
						class="text-zinc-400 hover:text-zinc-600">&times;</button
					>
				</div>

				<form method="POST" class="flex flex-col" use:enhance>
					<div class="relative h-110 overflow-hidden">
						<div
							class="absolute inset-0 flex flex-col gap-4 overflow-y-auto p-6 transition-transform duration-300"
							style:transform="translateX({(0 - formPage) * 100}%)"
						>
							<h3 class="text-xl font-semibold">Basic Information</h3>
							<label for="deviceName" class="text-sm font-medium">Device Name</label>
							<input
								type="text"
								id="deviceName"
								name="deviceName"
								class="w-full rounded-lg border p-2"
								bind:value={$form.deviceName}
							/>
							{#if $errors.deviceName}<span class="text-red-600">{$errors.deviceName}</span>{/if}
							<label for="description" class="text-sm font-medium">Description</label>
							<textarea
								id="description"
								name="description"
								class="h-24 w-full rounded-lg border p-2"
								bind:value={$form.description}
							></textarea>
							{#if $errors.description}<span class="text-red-600">{$errors.description}</span>{/if}
						</div>

						<div
							class="absolute inset-0 flex flex-col gap-4 overflow-y-auto p-6 transition-transform duration-300"
							style:transform="translateX({(1 - formPage) * 100}%)"
						>
							<h3 class="text-xl font-semibold">Specifications</h3>

							<label for="brand" class="text-sm font-medium">Brand</label>
							<div class="relative">
								<input
									type="text"
									id="brand"
									name="brand"
									class="w-full rounded-lg border p-2"
									bind:value={$form.brand}
									onfocusin={() => (brandFocus = true)}
									onfocusout={() => (brandFocus = false)}
								/>
								{#if brandFuzzy && $form.brand && brandFocus}
									<ul
										class="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border bg-white shadow-lg"
									>
										{#each brandFuzzy.search($form.brand) as result}
											<!-- svelte-ignore a11y_click_events_have_key_events -->
											<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
											<li
												class="cursor-pointer px-4 py-2 hover:bg-zinc-200"
												onclick={() => ($form.brand = result.item.displayName)}
											>
												{result.item.displayName}
											</li>
										{/each}
									</ul>
								{/if}
							</div>
							{#if $errors.brand}<span class="text-red-600">{$errors.brand}</span>{/if}

							<label for="cpu" class="text-sm font-medium">CPU</label>
							<div class="relative">
								<input
									type="text"
									id="cpu"
									name="cpu"
									class="w-full rounded-lg border p-2"
									bind:value={$form.cpu}
									onfocusin={() => (cpuFocus = true)}
									onfocusout={() => (cpuFocus = false)}
								/>
								{#if cpuFuzzy && $form.cpu && cpuFocus}
									<ul
										class="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border bg-white shadow-lg"
									>
										{#each cpuFuzzy.search($form.cpu) as result}
											<!-- svelte-ignore a11y_click_events_have_key_events -->
											<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
											<li
												class="cursor-pointer px-4 py-2 hover:bg-zinc-200"
												onclick={() => ($form.cpu = result.item.displayName)}
											>
												{result.item.displayName}
											</li>
										{/each}
									</ul>
								{/if}
							</div>
							{#if $errors.cpu}<span class="text-red-600">{$errors.cpu}</span>{/if}

							<label for="memory" class="text-sm font-medium">Memory</label>
							<div class="relative">
								<input
									type="text"
									id="memory"
									name="memory"
									class="w-full rounded-lg border p-2"
									bind:value={$form.memory}
									onfocusin={() => (memoryFocus = true)}
									onfocusout={() => (memoryFocus = false)}
								/>
								{#if memoryFuzzy && $form.memory && memoryFocus}
									<ul
										class="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border bg-white shadow-lg"
									>
										{#each memoryFuzzy.search($form.memory) as result}
											<!-- svelte-ignore a11y_click_events_have_key_events -->
											<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
											<li
												class="cursor-pointer px-4 py-2 hover:bg-zinc-200"
												onclick={() => ($form.memory = result.item.displayName)}
											>
												{result.item.displayName}
											</li>
										{/each}
									</ul>
								{/if}
							</div>
							{#if $errors.memory}<span class="text-red-600">{$errors.memory}</span>{/if}

							<label for="storage" class="text-sm font-medium">Storage</label>
							<div class="relative">
								<input
									type="text"
									id="storage"
									name="storage"
									class="w-full rounded-lg border p-2"
									bind:value={$form.storage}
									onfocusin={() => (storageFocus = true)}
									onfocusout={() => (storageFocus = false)}
								/>
								{#if storageFuzzy && $form.storage && storageFocus}
									<ul
										class="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border bg-white shadow-lg"
									>
										{#each storageFuzzy.search($form.storage) as result}
											<!-- svelte-ignore a11y_click_events_have_key_events -->
											<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
											<li
												class="cursor-pointer px-4 py-2 hover:bg-zinc-200"
												onclick={() => ($form.storage = result.item.displayName)}
											>
												{result.item.displayName}
											</li>
										{/each}
									</ul>
								{/if}
							</div>
							{#if $errors.storage}<span class="text-red-600">{$errors.storage}</span>{/if}

							<label for="os" class="text-sm font-medium">Operating System</label>
							<div class="relative">
								<input
									type="text"
									id="os"
									name="os"
									class="w-full rounded-lg border p-2"
									bind:value={$form.os}
									onfocusin={() => (osFocus = true)}
									onfocusout={() => (osFocus = false)}
								/>
								{#if osFuzzy && $form.os && osFocus}
									<ul
										class="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border bg-white shadow-lg"
									>
										{#each osFuzzy.search($form.os) as result}
											<!-- svelte-ignore a11y_click_events_have_key_events -->
											<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
											<li
												class="cursor-pointer px-4 py-2 hover:bg-zinc-200"
												onclick={() => ($form.os = result.item.displayName)}
											>
												{result.item.displayName}
											</li>
										{/each}
									</ul>
								{/if}
							</div>
							{#if $errors.os}<span class="text-red-600">{$errors.os}</span>{/if}
						</div>

						<div
							class="absolute inset-0 flex flex-col gap-2 overflow-y-auto p-6 transition-transform duration-300"
							style:transform="translateX({(2 - formPage) * 100}%)"
						>
							<h3 class="text-xl font-semibold">Confirm Details</h3>
							<div class="rounded-lg bg-zinc-200 p-4 text-sm">
								<p><strong>Name:</strong> {$form.deviceName || 'N/A'}</p>
								<p><strong>Description:</strong> {$form.description || 'N/A'}</p>
								<p><strong>Brand:</strong> {$form.brand || 'N/A'}</p>
								<p><strong>CPU:</strong> {$form.cpu || 'N/A'}</p>
								<p><strong>Memory:</strong> {$form.memory || 'N/A'}</p>
								<p><strong>Storage:</strong> {$form.storage || 'N/A'}</p>
							</div>
							{#if hasErrors}
								<div class="rounded-lg bg-zinc-200 p-4 text-sm">
									<h3 class="font-semibold">Errors</h3>
									<ul class="list-disc pl-5">
										{#if $errors.deviceName}
											<li class="text-red-600">{$errors.deviceName}</li>
										{/if}
										{#if $errors.description}
											<li class="text-red-600">{$errors.description}</li>
										{/if}
										{#if $errors.brand}
											<li class="text-red-600">{$errors.brand}</li>
										{/if}
										{#if $errors.cpu}
											<li class="text-red-600">{$errors.cpu}</li>
										{/if}
										{#if $errors.memory}
											<li class="text-red-600">{$errors.memory}</li>
										{/if}
										{#if $errors.storage}
											<li class="text-red-600">{$errors.storage}</li>
										{/if}
										{#if $errors.os}
											<li class="text-red-600">{$errors.os}</li>
										{/if}
										{#if $errors._errors}
											{#each $errors._errors as error}
												<li class="text-red-600">{error}</li>
											{/each}
										{/if}
									</ul>
								</div>
							{/if}
							<p class="mt-auto text-base text-zinc-500">
								Once you're happy with the details above, click below to create.
							</p>
						</div>
					</div>

					<div class="flex items-center justify-between gap-4 border-t bg-gray-50 p-4">
						<button
							type="button"
							class="rounded-md border bg-white px-4 py-2"
							onclick={() => (formPage = Math.max(formPage - 1, 0))}
							style:visibility={formPage > 0 ? 'visible' : 'hidden'}>Previous</button
						>

						{#if formPage < 2}
							<button
								type="button"
								class="rounded-md bg-blue-600 px-4 py-2 text-white"
								onclick={() => (formPage = Math.min(formPage + 1, 2))}>Next</button
							>
						{/if}

						{#if formPage === 2}
							<button
								type="submit"
								class="flex-1 rounded-md bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-green-500"
								disabled={hasErrors}>Create Device</button
							>
						{/if}
					</div>
				</form>
			</div>
		</div>
	{/if}
	<div class="flex flex-col gap-2">
		<h1 class="text-4xl font-bold">Devices</h1>
		<button
			class="w-fit rounded bg-blue-500 px-4 py-2 text-white"
			onclick={() => (createPopupOpen = true)}>Create Device</button
		>
		<div class="flex flex-wrap gap-2">
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
			<FilterPill name="OS" options={attributeLists.os} bind:selectedItems={selectedFilters.os} />
			{#if showApplyFilters}
				<button
					class="rounded bg-green-500 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-40"
					disabled={applyingFilters}
					onclick={() => {
						applyingFilters = true;
						showApplyFilters = false;
						// Deep copy the selected filters
						activeFilters = {
							brand: [...selectedFilters.brand],
							cpu: [...selectedFilters.cpu],
							memory: [...selectedFilters.memory],
							storage: [...selectedFilters.storage],
							os: [...selectedFilters.os]
						};
						fetchDevices();
					}}>Apply Filters</button
				>
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
						name={device.deviceName}
						description={device.description}
						brand={device.brand}
						cpu={device.cpu}
						memory={device.memory}
						storage={device.storage}
						background={null}
					/>
				{/each}
			</div>

			<div class="flex justify-center gap-4">
				<button onclick={previousPage}>Previous</button>
				<span>Page {page} of {maxPages}</span>
				<button onclick={nextPage}>Next</button>
			</div>
		{/if}
	</div>
{/if}
