<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { schema } from './schema';

	import type { InferSelectModel } from 'drizzle-orm';
	import type { userDevices } from '$lib/server/db/schema';

	import { toast } from 'svelte-sonner';
	import DeviceCard from '$lib/components/DeviceCard.svelte';
	import FilterPill from '$lib/components/FilterPill.svelte';

	type Device = InferSelectModel<typeof userDevices>;

	// Props
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

	let brands = $state<String[]>([]);
	let cpus = $state<String[]>([]);
	let memory = $state<String[]>([]);
	let storage = $state<String[]>([]);
	let loadingFilters = $state(false);
	let errorLoadingFilters = $state(false);

	let page = $state(1);
	let maxPages = $derived(Math.ceil(totalDevices / 4));

	let createPopupOpen = $state(false);
	let formPage = $state(0);

	type FormErrors = typeof $errors;

	let hasErrors = $derived(
		Object.keys($errors).some((key) => {
			const typedKey = key as keyof FormErrors;
			return typedKey !== '_errors' && $errors[typedKey];
		}) ||
			($errors._errors && $errors._errors.length > 0)
	);

	async function getFilters() {
		if (loadingFilters) return;
		if (errorLoadingFilters) return;

		loadingFilters = true;
		try {
			const response = await fetch(`/api/devices/get_filters`);
			const data = await response.json();

			console.log('Filters fetched:', data);

			brands = data.brands.map((brand: any) => brand.brand);
			cpus = data.cpus.map((cpu: any) => cpu.cpu);
			memory = data.memory.map((mem: any) => mem.memory);
			storage = data.storage.map((stor: any) => stor.storage);
		} catch (error) {
			console.error('Error fetching devices:', error);
			errorLoadingFilters = true;
		} finally {
			loadingFilters = false;
		}
	}

	async function fetchDevices() {
		if (loadingDevices) return;
		if (errorLoadingDevices) return;

		loadingDevices = true;
		try {
			console.log(`Fetching devices for page ${page}...`);
			console.log(`Request URL: /api/devices/get_devices?offset=${(page - 1) * 4}&limit=4`);
			const response = await fetch(`/api/devices/get_devices?offset=${(page - 1) * 4}&limit=4`);
			const data = await response.json();

			devices = data.devices as Device[];
			totalDevices = data.totalDevices;
		} catch (error) {
			console.error('Error fetching devices:', error);
			errorLoadingDevices = true;
		} finally {
			loadingDevices = false;
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
		await getFilters();
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
				getFilters();
				createPopupOpen = false;
			} else {
				toast.warning($message);
			}
		}
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
							<input
								type="text"
								id="brand"
								name="brand"
								class="w-full rounded-lg border p-2"
								bind:value={$form.brand}
							/>
							{#if $errors.brand}<span class="text-red-600">{$errors.brand}</span>{/if}
							<label for="cpu" class="text-sm font-medium">CPU</label>
							<input
								type="text"
								id="cpu"
								name="cpu"
								class="w-full rounded-lg border p-2"
								bind:value={$form.cpu}
							/>
							{#if $errors.cpu}<span class="text-red-600">{$errors.cpu}</span>{/if}
							<label for="memory" class="text-sm font-medium">Memory</label>
							<input
								type="text"
								id="memory"
								name="memory"
								class="w-full rounded-lg border p-2"
								bind:value={$form.memory}
							/>
							{#if $errors.memory}<span class="text-red-600">{$errors.memory}</span>{/if}
							<label for="storage" class="text-sm font-medium">Storage</label>
							<input
								type="text"
								id="storage"
								name="storage"
								class="w-full rounded-lg border p-2"
								bind:value={$form.storage}
							/>
							{#if $errors.storage}<span class="text-red-600">{$errors.storage}</span>{/if}
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
			<FilterPill name="Brand" options={brands} />
			<FilterPill name="CPU" options={cpus} />
			<FilterPill name="Memory" options={memory} />
			<FilterPill name="Storage" options={storage} />
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
						background={'https://www.thestreet.com/.image/t_share/MjA0Nzg2NDQ1MDQ5NzM0MTcz/4-13-inch15-inch-m3-macbook-air-hands-onfirst-look-thestreet.jpg'}
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
