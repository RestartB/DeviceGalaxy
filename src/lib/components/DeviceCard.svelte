<script lang="ts">
	import { fade } from 'svelte/transition';
	import { Cpu, MemoryStick, HardDrive, Cog, Trash, Edit, Share, Menu, X } from '@lucide/svelte';

	let {
		device,
		deleteDevice,
		editPopupOpen = $bindable(),
		toEdit = $bindable()
	}: {
		device: any;
		deleteDevice: any;
		editPopupOpen?: boolean;
		toEdit: any;
	} = $props();

	let showingOverlay = $state(false);
	let confirmDelete = $state(false);
</script>

<a
	class="relative flex max-w-sm min-w-50 flex-1 flex-col overflow-hidden rounded-lg border-2 border-zinc-400 bg-zinc-200 shadow-md sm:min-w-80 dark:bg-zinc-700"
	href={`/device/${device.id}`}
>
	{#if device.externalImages && device.externalImages.length > 0}
		<img src={device.externalImages[0]} alt={device.deviceName} class="h-48 w-full object-cover" />
	{:else if device.internalImages && device.internalImages.length > 0}
		<img
			src={`/api/image/device/${device.id}/${device.internalImages[0]}`}
			alt={device.deviceName}
			class="h-48 w-full object-cover"
		/>
	{/if}
	<div class="flex w-full flex-col gap-2 p-4">
		<div>
			<p class="text-sm text-zinc-600 dark:text-zinc-400">{device.brand}</p>
			<h2 class="text-xl font-semibold">{device.deviceName}</h2>
			<p>{device.description}</p>
		</div>

		<div class="flex w-full flex-wrap gap-1 text-sm">
			{#if device.cpu}
				<div
					class="flex h-fit w-fit items-center justify-center gap-2 rounded-full border-2 border-zinc-400 bg-zinc-100 p-2 px-4 dark:bg-zinc-800"
				>
					<Cpu size="20" />
					<p>{device.cpu}</p>
				</div>
			{/if}
			{#if device.memory}
				<div
					class="flex h-fit w-fit items-center justify-center gap-2 rounded-full border-2 border-zinc-400 bg-zinc-100 p-2 px-4 dark:bg-zinc-800"
				>
					<MemoryStick size="20" />
					<p>{device.memory}</p>
				</div>
			{/if}
			{#if device.storage}
				<div
					class="flex h-fit w-fit items-center justify-center gap-2 rounded-full border-2 border-zinc-400 bg-zinc-100 p-2 px-4 dark:bg-zinc-800"
				>
					<HardDrive size="20" />
					<p>{device.storage}</p>
				</div>
			{/if}
			{#if device.os}
				<div
					class="flex h-fit w-fit items-center justify-center gap-2 rounded-full border-2 border-zinc-400 bg-zinc-100 p-2 px-4 dark:bg-zinc-800"
				>
					<Cog size="20" />
					<p>{device.os}</p>
				</div>
			{/if}

			{#if device.tags && device.tags.length > 0}
				{#each device.tags as tag}
					<div
						class="flex h-fit w-fit items-center justify-center gap-2 rounded-full border-2 border-zinc-400 bg-zinc-100 p-2 px-4 dark:bg-zinc-800"
						style="background-color: {tag.tagColour}; color: {tag.tagTextColour};"
					>
						<p>{tag.tagName}</p>
					</div>
				{/each}
			{/if}
		</div>
	</div>

	<div class="mt-auto flex w-full items-end justify-end p-4 pt-0">
		<button
			onclick={(event) => {
				event.preventDefault();
				showingOverlay = !showingOverlay;
				confirmDelete = false;
			}}
			aria-label="Toggle menu"
			class="z-10 cursor-pointer rounded-full border-2 border-zinc-400 bg-zinc-100 p-2 shadow-md transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-600"
		>
			{#if showingOverlay}
				<X size="20" />
			{:else}
				<Menu size="20" />
			{/if}
		</button>
	</div>

	{#if showingOverlay}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="absolute inset-0 flex cursor-default flex-col items-center justify-center gap-2 bg-white/60 p-4 backdrop-blur-lg dark:bg-black/60"
			transition:fade={{ duration: 100 }}
			onclick={(event) => {
				event.preventDefault();
			}}
		>
			<button
				class="flex w-full cursor-pointer items-center justify-center gap-2"
				onclick={(event) => {
					event.preventDefault();
					showingOverlay = false;
					editPopupOpen = true;
					toEdit = device;
				}}
			>
				<Edit size="20" />
				<p>Edit</p>
			</button>
			<hr class="w-full border-zinc-800 dark:border-zinc-200" />
			<button class="flex w-full cursor-pointer items-center justify-center gap-2">
				<Share size="20" />
				<p>Share</p>
			</button>
			<hr class="w-full border-zinc-800 dark:border-zinc-200" />
			<button
				class="flex w-full cursor-pointer items-center justify-center gap-2 text-red-700 dark:text-red-200"
				onclick={() => {
					if (!confirmDelete) {
						confirmDelete = true;
					} else {
						deleteDevice(device.id);
					}
				}}
			>
				<Trash size="20" />
				{#if confirmDelete}
					<p>Press again to confirm</p>
				{:else}
					<p>Delete</p>
				{/if}
			</button>
		</div>
	{/if}
</a>
