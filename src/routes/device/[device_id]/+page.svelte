<script lang="ts">
	import { Cpu, MemoryStick, HardDrive, Cog } from '@lucide/svelte';

	const { data } = $props();
	const device = data.device;
</script>

{#if device.imageURLs && device.imageURLs.length > 0}
	<img
		src={device.imageURLs[0]}
		alt={device.deviceName}
		class="h-[50vh] w-full mask-b-from-70% object-cover"
	/>
{/if}

<div class="flex flex-col gap-4 p-4">
	<div>
		{#if device.brand}
			<p class="text-sm text-zinc-500">{device.brand}</p>
		{/if}
		<h1 class="text-4xl font-bold">{device.deviceName}</h1>
		<p>{device.description || 'No description.'}</p>
	</div>

	<div class="flex w-fit flex-wrap items-center justify-center gap-2">
		{#if device.cpu}
			<div class="rounded-lg border-2 border-zinc-400 bg-zinc-200 p-4 shadow-md">
				<div class="flex items-center gap-2">
					<Cpu />
					<h2 class="text-xl font-bold">CPU</h2>
				</div>
				<p>{device.cpu}</p>
			</div>
		{/if}

		{#if device.memory}
			<div class="rounded-lg border-2 border-zinc-400 bg-zinc-200 p-4 shadow-md">
				<div class="flex items-center gap-2">
					<MemoryStick />
					<h2 class="text-xl font-bold">Memory</h2>
				</div>
				<p>{device.memory}</p>
			</div>
		{/if}

		{#if device.storage}
			<div class="rounded-lg border-2 border-zinc-400 bg-zinc-200 p-4 shadow-md">
				<div class="flex items-center gap-2">
					<HardDrive />
					<h2 class="text-xl font-bold">Storage</h2>
				</div>
				<p>{device.storage}</p>
			</div>
		{/if}

		{#if device.os}
			<div class="rounded-lg border-2 border-zinc-400 bg-zinc-200 p-4 shadow-md">
				<div class="flex items-center gap-2">
					<Cog />
					<h2 class="text-xl font-bold">Operating System</h2>
				</div>
				<p>{device.os}</p>
			</div>
		{/if}
	</div>
</div>
