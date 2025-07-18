<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { prefersReducedMotion } from 'svelte/motion';
	import Fuse from 'fuse.js';

	import type { InferSelectModel } from 'drizzle-orm';
	import type { tags } from '$lib/server/db/schema';

	import { Tag, X } from '@lucide/svelte';

	let selected = $state<number[]>([]);
	let dropdownOpen = $state(false);
	let search = $state('');
	let searchedTags: InferSelectModel<typeof tags>[] = $state([]);

	let {
		options,
		selectedItems = $bindable(selected)
	}: {
		options: InferSelectModel<typeof tags>[];
		selectedItems?: number[];
	} = $props();

	function toggleItem(event: MouseEvent, id: number) {
		if (selectedItems.includes(id)) {
			selectedItems = selectedItems.filter((item) => item !== id);
			(event.currentTarget as HTMLButtonElement).classList.replace('bg-green-200', 'bg-zinc-200');
		} else {
			selectedItems.push(id);
			(event.currentTarget as HTMLButtonElement).classList.replace('bg-zinc-200', 'bg-green-200');
		}
	}

	function searchTags() {
		if (search.trim() === '') {
			searchedTags = options;
			return;
		}

		const fuse = new Fuse(options, {
			keys: ['tagName'],
			includeScore: true,
			threshold: 0.3
		});

		const results = fuse.search(search.trim());
		searchedTags = results.map((result) => result.item);
	}

	$effect(() => {
		searchTags();
	});
</script>

<svelte:window
	onkeydown={(event) => {
		if (event.key === 'Escape') {
			dropdownOpen = false;
		}
	}}
/>

<div class="relative" transition:fly={{ x: prefersReducedMotion.current ? 0 : -5, duration: 300 }}>
	<button
		class="flex cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-zinc-400 bg-zinc-100 px-4 py-2 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-600"
		onclick={() => (dropdownOpen = !dropdownOpen)}
	>
		<Tag />
		<p>Tags</p>
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
				class="z-50 flex w-full max-w-lg flex-col overflow-hidden rounded-xl border-4 border-zinc-400 bg-zinc-100 shadow-2xl dark:bg-zinc-800"
			>
				<div class="flex w-full items-center justify-between gap-2 border-b p-4">
					<h1 class="text-xl font-bold text-nowrap">Select Tags</h1>
					<button
						onclick={() => (dropdownOpen = false)}
						class="cursor-pointer text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-400"
						aria-label="Close"><X /></button
					>
				</div>
				<input
					type="text"
					placeholder="Search tags..."
					class="m-6 mb-0 flex-1 rounded-lg border-2 border-zinc-500 px-4 py-2 dark:bg-zinc-700 dark:text-white"
					bind:value={search}
				/>
				<ul class="flex w-full flex-wrap justify-center gap-2 overflow-y-auto p-6">
					{#if options.length === 0}
						<p>No tags yet! Please create one to filter by tags.</p>
					{:else if searchedTags.length === 0}
						<p>No results found.</p>
					{:else}
						{#each searchedTags as option}
							<li class="h-fit w-fit">
								<button
									type="button"
									onclick={(event) => toggleItem(event, option.id)}
									class="h-fit w-fit cursor-pointer rounded-lg border-2 border-zinc-500 px-4 py-2"
									class:bg-green-200={selectedItems.includes(option.id)}
									class:dark:bg-green-700={selectedItems.includes(option.id)}
									class:bg-zinc-200={!selectedItems.includes(option.id)}
									class:dark:bg-zinc-700={!selectedItems.includes(option.id)}
									class:brightness-150={selectedItems.includes(option.id) && option.tagColour}
									style="background-color: {option.tagColour}; color: {option.tagTextColour};"
								>
									{option.tagName}
								</button>
							</li>
						{/each}
					{/if}
				</ul>
			</div>
		</div>
	{/if}
</div>
