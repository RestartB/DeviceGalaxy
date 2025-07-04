<script lang="ts">
	import { Cpu, MemoryStick, HardDrive, Cog, MoveLeft } from '@lucide/svelte';

	const { data } = $props();
	const device = data.device;
</script>

<div
	class:fixed={device.imageURLs && device.imageURLs.length > 0}
	class:top-16={device.imageURLs && device.imageURLs.length > 0}
	class:left-4={device.imageURLs && device.imageURLs.length > 0}
	class:z-50={device.imageURLs && device.imageURLs.length > 0}
	class:p-4={!device.imageURLs || device.imageURLs.length === 0}
	class:pb-0={!device.imageURLs || device.imageURLs.length === 0}
>
	<button
		onclick={() => history.back()}
		class="flex cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-zinc-400 bg-zinc-100 px-4 py-2 shadow-md transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-800 dark:hover:bg-zinc-600"
	>
		<MoveLeft size="20" />
		<p>Back</p>
	</button>
</div>

{#if device.imageURLs && device.imageURLs.length > 0}
	<img
		src={device.imageURLs[0]}
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
