<script lang="ts">
	import { fade } from 'svelte/transition';
	import { MoveLeft, Cpu, MemoryStick, HardDrive, Cog, X } from '@lucide/svelte';

	const { data } = $props();
	const device = data.device;

	let imageOpen = $state(false);
	let imageSrc = $state('');
</script>

<div
	class:fixed={(device.externalImages && device.externalImages.length > 0) ||
		(device.internalImages && device.internalImages.length > 0)}
	class:top-16={(device.externalImages && device.externalImages.length > 0) ||
		(device.internalImages && device.internalImages.length > 0)}
	class:left-4={(device.externalImages && device.externalImages.length > 0) ||
		(device.internalImages && device.internalImages.length > 0)}
	class:z-20={(device.externalImages && device.externalImages.length > 0) ||
		(device.internalImages && device.internalImages.length > 0)}
	class:p-4={!device.externalImages ||
		device.externalImages.length === 0 ||
		!device.internalImages ||
		device.internalImages.length === 0}
	class:pb-0={!device.externalImages ||
		device.externalImages.length === 0 ||
		!device.internalImages ||
		device.internalImages.length === 0}
>
	<button
		onclick={() => history.back()}
		class="flex cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-zinc-400 bg-zinc-100 px-4 py-2 shadow-md transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-800 dark:hover:bg-zinc-600"
	>
		<MoveLeft size="20" />
		<p>Back</p>
	</button>
</div>

{#if device.externalImages && device.externalImages.length > 0}
	<img
		src={device.externalImages[0]}
		alt={device.deviceName}
		class="h-[50vh] w-full mask-b-from-70% object-cover"
	/>
{:else if device.internalImages && device.internalImages.length > 0}
	<img
		src={`/api/image/device/${device.id}/${device.internalImages[0]}`}
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

	{#if device.tags && device.tags.length > 0}
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

	<div class="flex w-fit flex-wrap items-center justify-center gap-2">
		{#if device.cpu}
			<div class="rounded-lg border-2 border-zinc-400 bg-zinc-200 p-4 shadow-md dark:bg-zinc-700">
				<div class="flex items-center gap-2">
					<Cpu />
					<h2 class="text-xl font-bold">CPU</h2>
				</div>
				<p>{device.cpu}</p>
			</div>
		{/if}

		{#if device.memory}
			<div class="rounded-lg border-2 border-zinc-400 bg-zinc-200 p-4 shadow-md dark:bg-zinc-700">
				<div class="flex items-center gap-2">
					<MemoryStick />
					<h2 class="text-xl font-bold">Memory</h2>
				</div>
				<p>{device.memory}</p>
			</div>
		{/if}

		{#if device.storage}
			<div class="rounded-lg border-2 border-zinc-400 bg-zinc-200 p-4 shadow-md dark:bg-zinc-700">
				<div class="flex items-center gap-2">
					<HardDrive />
					<h2 class="text-xl font-bold">Storage</h2>
				</div>
				<p>{device.storage}</p>
			</div>
		{/if}

		{#if device.os}
			<div class="rounded-lg border-2 border-zinc-400 bg-zinc-200 p-4 shadow-md dark:bg-zinc-700">
				<div class="flex items-center gap-2">
					<Cog />
					<h2 class="text-xl font-bold">Operating System</h2>
				</div>
				<p>{device.os}</p>
			</div>
		{/if}
	</div>
</div>

{#if device.internalImages && device.internalImages.length > 0}
	<div class="flex flex-col gap-4 p-4">
		<h2 class="text-2xl font-bold">Images</h2>
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each device.internalImages as image}
				<button
					style="background-image: url('/api/image/device/{device.id}/{image}');"
					aria-label="Click to fullscreen image"
					class="bg-fit h-48 w-full rounded-lg border-2 border-zinc-400 bg-cover bg-center"
					onclick={() => {
						imageSrc = `/api/image/device/${device.id}/${image}`;
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
		<div>
			<button
				class="mb-4 flex h-11 w-11 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-zinc-400 bg-zinc-100 p-2 shadow-md transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-600"
				onclick={() => (imageOpen = false)}
				aria-label="Close fullscreen image"
			>
				<X size="24" />
			</button>
			<img src={imageSrc} alt="Fullscreen" class="max-h-[80vh] max-w-full rounded-lg shadow-lg" />
		</div>
	</div>
{/if}
