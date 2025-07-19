<script lang="ts">
	import { fade } from 'svelte/transition';
	import Fuse from 'fuse.js';
	import type { FuseResult } from 'fuse.js';

	import type { InferSelectModel } from 'drizzle-orm';
	import type { cpus, memory, storage, os, brands } from '$lib/server/db/schema';

	type CPU = InferSelectModel<typeof cpus>;
	type Memory = InferSelectModel<typeof memory>;
	type Storage = InferSelectModel<typeof storage>;
	type OS = InferSelectModel<typeof os>;
	type Brand = InferSelectModel<typeof brands>;

	let {
		errors,
		name,
		attributes,
		value = $bindable()
	}: {
		errors: any;
		name: string;
		attributes: Array<CPU | Memory | Storage | OS | Brand>;
		value: string | undefined;
	} = $props();

	let focus = $state(false);
	let fuzzy = new Fuse(attributes, {
		keys: ['displayName'],
		includeScore: true,
		threshold: 0.3
	});
	let fuzzyResults: FuseResult<CPU | Memory | Storage | OS | Brand>[] = $state([]);

	$effect(() => {
		if (value) {
			fuzzyResults = fuzzy.search(value);
		}
	});
</script>

<label for={name.toLowerCase()} class="text-sm font-medium">{name}</label>
<div class="relative">
	<input
		type="text"
		id={name.toLowerCase()}
		name={name.toLowerCase()}
		class="w-full rounded-lg border p-2"
		bind:value
		onfocusin={() => (focus = true)}
		onfocusout={() => (focus = false)}
	/>
	{#if fuzzyResults && fuzzyResults.length > 0 && value && focus}
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<ul
			class="absolute z-60 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border bg-white dark:bg-black shadow-lg"
			onmousedown={(event) => event.preventDefault()}
			transition:fade={{ duration: 100 }}
		>
			{#each fuzzyResults as result}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
				<li
					class="cursor-pointer px-4 py-2 hover:bg-zinc-200 dark:hover:bg-zinc-700"
					onclick={() => {
						value = result.item.displayName;
						focus = false;
					}}
				>
					{result.item.displayName}
				</li>
			{/each}
		</ul>
	{/if}
</div>
{#if errors}<span class="text-red-600">{errors}</span>{/if}
