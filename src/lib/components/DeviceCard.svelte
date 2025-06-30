<script lang="ts">
	import { Cpu, MemoryStick, HardDrive, Cog } from '@lucide/svelte';
	const { id, name, description, brand, cpu, memory, storage, os, background } = $props();
</script>

<a
	class="max-w-sm min-w-64 flex-1 overflow-hidden rounded-lg border-2 border-zinc-400 bg-zinc-200 shadow-md"
	href={`/device/${id}`}
>
	{#if background}
		<img src={background} alt={name} class="h-48 w-full object-cover" />
	{/if}
	<div class="flex w-full flex-col gap-2 p-4">
		<div>
			<p class="text-sm text-zinc-600">{brand}</p>
			<h2 class="text-xl font-semibold">{name}</h2>
			<p>{description}</p>
		</div>

		<div class="flex w-full flex-wrap gap-1 text-sm">
			{#if cpu}
				<div
					class="flex h-fit w-fit items-center justify-center gap-2 rounded-full border-2 border-zinc-400 bg-zinc-100 p-2 px-4"
				>
					<Cpu size="20" />
					<p>{cpu}</p>
				</div>
			{/if}
			{#if memory}
				<div
					class="flex h-fit w-fit items-center justify-center gap-2 rounded-full border-2 border-zinc-400 bg-zinc-100 p-2 px-4"
				>
					<MemoryStick size="20" />
					<p>{memory}</p>
				</div>
			{/if}
			{#if storage}
				<div
					class="flex h-fit w-fit items-center justify-center gap-2 rounded-full border-2 border-zinc-400 bg-zinc-100 p-2 px-4"
				>
					<HardDrive size="20" />
					<p>{storage}</p>
				</div>
			{/if}
			{#if os}
				<div
					class="flex h-fit w-fit items-center justify-center gap-2 rounded-full border-2 border-zinc-400 bg-zinc-100 p-2 px-4"
				>
					<Cog size="20" />
					<p>{os}</p>
				</div>
			{/if}
		</div>
	</div>
</a>
