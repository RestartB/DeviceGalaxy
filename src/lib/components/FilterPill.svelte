<script lang="ts">
	import type { InferSelectModel } from 'drizzle-orm';
	import type { cpus, memory, storage, os, brands } from '$lib/server/db/schema';
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { Cpu, MemoryStick, HardDrive, Cog, Funnel } from '@lucide/svelte';

	let selected = $state<number[]>([]);
	let dropdownOpen = $state(false);

	let {
		name,
		options,
		selectedItems = $bindable(selected)
	}: {
		name: string;
		options: Array<CPU | Memory | Storage | OS | Brand>;
		selectedItems?: number[];
	} = $props();

	type CPU = InferSelectModel<typeof cpus>;
	type Memory = InferSelectModel<typeof memory>;
	type Storage = InferSelectModel<typeof storage>;
	type OS = InferSelectModel<typeof os>;
	type Brand = InferSelectModel<typeof brands>;

	function toggleItem(event: MouseEvent, id: number) {
		if (selectedItems.includes(id)) {
			selectedItems = selectedItems.filter((item) => item !== id);
			(event.currentTarget as HTMLButtonElement).classList.replace('bg-green-200', 'bg-zinc-200');
		} else {
			selectedItems.push(id);
			(event.currentTarget as HTMLButtonElement).classList.replace('bg-zinc-200', 'bg-green-200');
		}
	}

	onMount(() => {
		document.addEventListener('keydown', (event) => {
			if (event.key === 'Escape') {
				dropdownOpen = false;
			}
		});
	});
</script>

<div class="relative">
	<button
		class="z-20 flex items-center justify-center gap-2 rounded-full border-2 border-zinc-400 bg-zinc-100 px-4 py-2"
		onclick={() => (dropdownOpen = !dropdownOpen)}
	>
		{#if name === 'CPU'}
			<Cpu />
		{:else if name === 'Memory'}
			<MemoryStick />
		{:else if name === 'Storage'}
			<HardDrive />
		{:else if name === 'OS'}
			<Cog />
		{:else}
			<Funnel />
		{/if}
		<p>{name}</p>
	</button>

	{#if dropdownOpen}
		<div
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
			transition:fade={{ duration: 100 }}
		>
			<div
				class="absolute inset-0 z-[999]"
				onclick={() => (dropdownOpen = false)}
				aria-hidden="true"
			></div>
			<div
				class="z-[1000] flex w-full max-w-lg flex-col overflow-hidden rounded-xl bg-zinc-100 shadow-2xl"
			>
				<div class="flex w-full items-center justify-center gap-2 border-b p-4">
					<h1 class="text-xl font-bold text-nowrap">Select Filters</h1>
				</div>
				<ul class="flex w-full flex-wrap justify-start gap-2 overflow-y-auto p-6">
					{#each options as option}
						<li class="h-fit w-fit">
							<button
								type="button"
								onclick={(event) => toggleItem(event, option.id)}
								class="h-fit w-fit cursor-pointer rounded-lg border-2 border-zinc-500 px-4 py-2"
								class:bg-green-200={selectedItems.includes(option.id)}
								class:bg-zinc-200={!selectedItems.includes(option.id)}
							>
								{option.displayName}
							</button>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	{/if}
</div>
