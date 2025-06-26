<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import DeviceCard from '$lib/components/DeviceCard.svelte';

	import { superForm } from 'sveltekit-superforms';

	import type { InferSelectModel } from 'drizzle-orm';
	import type { userDevices } from '$lib/server/db/schema';

	type Device = InferSelectModel<typeof userDevices>;

	// Props
	const { data } = $props();
	const { form, errors, constraints, message, enhance } = superForm(data.form);

	let devices = $state<Device[]>([]);
	let totalDevices = $state(0);
	let loading = $state(false);
	let error = $state(false);

	let page = $state(1);
	let maxPages = $derived(Math.ceil(totalDevices / 20));

	let createPopupOpen = $state(false);
	let formPage = $state(0);

	async function fetchDevices() {
		if (loading) return;
		if (error) return;

		loading = true;
		try {
			const response = await fetch(`/api/devices/get_devices?offset=${(page - 1) * 20}&limit=20`);
			const data = await response.json();

			devices = data.devices as Device[];
			totalDevices = data.total;
		} catch (error) {
			console.error('Error fetching devices:', error);
			error = true;
		} finally {
			loading = false;
		}
	}

	onMount(async () => {
		await fetchDevices();
	});
</script>

{#if data.user}
	{#if createPopupOpen}
		<div
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
			transition:fade={{ duration: 100 }}
		>
			<div class="flex w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
				<div class="flex items-center justify-between border-b p-4">
					<h2 class="text-xl font-bold">Create New Device</h2>
					<button
						onclick={() => (createPopupOpen = false)}
						class="text-gray-400 hover:text-gray-600">&times;</button
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
								required
							/>
							<label for="description" class="text-sm font-medium">Description</label>
							<textarea
								id="description"
								name="description"
								class="h-24 w-full rounded-lg border p-2"
								bind:value={$form.description}
							></textarea>
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
							<label for="cpu" class="text-sm font-medium">CPU</label>
							<input
								type="text"
								id="cpu"
								name="cpu"
								class="w-full rounded-lg border p-2"
								bind:value={$form.cpu}
							/>
							<label for="memory" class="text-sm font-medium">Memory</label>
							<input
								type="text"
								id="memory"
								name="memory"
								class="w-full rounded-lg border p-2"
								bind:value={$form.memory}
							/>
							<label for="storage" class="text-sm font-medium">Storage</label>
							<input
								type="text"
								id="storage"
								name="storage"
								class="w-full rounded-lg border p-2"
								bind:value={$form.storage}
							/>
						</div>

						<div
							class="absolute inset-0 flex flex-col gap-2 overflow-y-auto p-6 transition-transform duration-300"
							style:transform="translateX({(2 - formPage) * 100}%)"
						>
							<h3 class="text-xl font-semibold">Confirm Details</h3>
							<div class="space-y-2 rounded-lg bg-gray-50 p-4 text-sm">
								<p><strong>Name:</strong> {$form.deviceName || 'N/A'}</p>
								<p><strong>Description:</strong> {$form.description || 'N/A'}</p>
								<p><strong>Brand:</strong> {$form.brand || 'N/A'}</p>
								<p><strong>CPU:</strong> {$form.cpu || 'N/A'}</p>
								<p><strong>Memory:</strong> {$form.memory || 'N/A'}</p>
								<p><strong>Storage:</strong> {$form.storage || 'N/A'}</p>
							</div>
							<p class="mt-auto text-base text-gray-500">
								Once you're happy with the details, click below to save
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
								class="flex-1 rounded-md bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-600"
								>Create Device</button
							>
						{/if}
					</div>
					{#if $errors?._errors}
						<div class="border-t bg-red-50 p-4 text-sm text-red-700">
							<strong>Error:</strong>
							{$errors?._errors}
						</div>
					{/if}
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
		{#if loading}
			<p>Loading devices...</p>
		{:else if totalDevices === 0}
			<p>No devices found.</p>
		{:else}
			<p class="text-sm text-zinc-500">Total devices: {totalDevices}</p>
			<div class="flex w-full flex-wrap gap-2">
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
				<button onclick={() => (page = Math.max(page - 1, 1))}>Previous</button>
				<span>Page {page} of {maxPages}</span>
				<button onclick={() => (page = Math.min(page + 1, maxPages))}>Next</button>
			</div>
		{/if}
	</div>
{/if}
