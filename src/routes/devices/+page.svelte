<script lang="ts">
	import { onMount } from 'svelte';
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
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-lg">
			<div class="w-full max-w-2xl rounded-lg border-4 border-zinc-400 bg-zinc-100 p-4 shadow-lg">
				<h2 class="mb-4 text-xl font-bold">Create Device</h2>
				<form method="POST" class="flex flex-col gap-2" use:enhance>
					<label for="deviceName">Device Name</label>
					<input
						type="text"
						id="deviceName"
						name="deviceName"
						class="w-full rounded-lg border p-2"
						bind:value={$form.deviceName}
						required
					/>

					<label for="description">Description</label>
					<textarea
						id="description"
						name="description"
						class="w-full rounded-lg border p-2"
						bind:value={$form.description}
					></textarea>

					<label for="brand">Brand</label>
					<input
						type="text"
						id="brand"
						name="brand"
						class="w-full rounded-lg border p-2"
						bind:value={$form.brand}
					/>

					<label for="cpu">CPU</label>
					<input
						type="text"
						id="cpu"
						name="cpu"
						class="w-full rounded-lg border p-2"
						bind:value={$form.cpu}
					/>

					<label for="memory">Memory</label>
					<input
						type="text"
						id="memory"
						name="memory"
						class="w-full rounded-lg border p-2"
						bind:value={$form.memory}
					/>

					<label for="storage">Storage</label>
					<input
						type="text"
						id="storage"
						name="storage"
						class="w-full rounded-lg border p-2"
						bind:value={$form.storage}
					/>

					<div class="flex justify-between gap-2">
						<button type="submit" class="flex-1 rounded bg-blue-500 px-4 py-2 text-white"
							>Create</button
						>
						<button
							type="button"
							class="flex-1 rounded border px-4 py-2"
							onclick={() => (createPopupOpen = false)}>Cancel</button
						>
					</div>
					{#if $errors?._errors}
						<div class="mt-3 rounded-md text-red-700">
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
