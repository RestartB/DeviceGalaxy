<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import Fuse from 'fuse.js';

	import type { InferSelectModel } from 'drizzle-orm';
	import type { cpus, memory, storage, os, brands } from '$lib/server/db/schema';

	import { X, Cpu, MemoryStick, HardDrive, Cog, Funnel } from '@lucide/svelte';

	let selected = $state<number[]>([]);
	let dropdownOpen = $state(false);

	let search = $state('');
	let searchedOptions: Array<CPU | Memory | Storage | OS | Brand> = $state([]);

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

	function searchItems() {
		if (search.trim() === '') {
			searchedOptions = options;
			return;
		}

		const fuse = new Fuse(options, {
			keys: ['displayName'],
			includeScore: true,
			threshold: 0.3
		});

		const results = fuse.search(search.trim());
		searchedOptions = results.map((result) => result.item);
	}

	$effect(() => {
		searchItems();
	});
</script>

<svelte:window
	onkeydown={(event) => {
		if (event.key === 'Escape') {
			dropdownOpen = false;
		}
	}}
/>

<div class="relative" transition:fly={{ x: -20, duration: 300 }}>
	<button
		class="flex cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-zinc-400 bg-zinc-100 px-4 py-2 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-600"
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
			class="fixed inset-0 z-30 mt-12 flex items-center justify-center overflow-hidden bg-white/60 p-4 backdrop-blur-lg dark:bg-black/60"
			transition:fade={{ duration: 100 }}
		>
			<div
				class="absolute inset-0 z-40"
				onclick={() => (dropdownOpen = false)}
				aria-hidden="true"
			></div>
			<div
				class="z-50 flex max-h-full w-full max-w-lg flex-col overflow-hidden rounded-xl border-4 border-zinc-400 bg-zinc-100 shadow-2xl dark:bg-zinc-800"
			>
				<div class="flex w-full items-center justify-between gap-2 border-b p-4">
					<h1 class="text-xl font-bold text-nowrap">Select Filters - {name}</h1>
					<button
						onclick={() => (dropdownOpen = false)}
						class="cursor-pointer text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-400"
						aria-label="Close"><X /></button
					>
				</div>
				<input
					type="text"
					placeholder="Search..."
					class="m-6 mb-0 flex-1 rounded-lg border-2 border-zinc-500 px-4 py-2 dark:bg-zinc-700 dark:text-white"
					bind:value={search}
				/>
				<ul class="flex w-full flex-wrap justify-center gap-2 overflow-y-auto p-6">
					{#if searchedOptions.length === 0}
						<p>No results found.</p>
					{:else}
						{#each searchedOptions as option}
							<li class="h-fit w-fit">
								<button
									type="button"
									onclick={(event) => toggleItem(event, option.id)}
									class="h-fit w-fit cursor-pointer rounded-lg border-2 border-zinc-500 px-4 py-2"
									class:bg-green-200={selectedItems.includes(option.id)}
									class:dark:bg-green-700={selectedItems.includes(option.id)}
									class:bg-zinc-200={!selectedItems.includes(option.id)}
									class:dark:bg-zinc-700={!selectedItems.includes(option.id)}
								>
									{option.displayName}
								</button>
							</li>
						{/each}
					{/if}
				</ul>
			</div>
		</div>
	{/if}
</div>
