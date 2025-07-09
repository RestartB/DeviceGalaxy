<script lang="ts">
	// Get session from props
	const { data } = $props();

	import Avatar from '$lib/components/Avatar.svelte';
	import DeviceCard from '$lib/components/DeviceCard.svelte';
</script>

<svelte:head>
	<title>DeviceGalaxy</title>
</svelte:head>

<div class="flex w-full flex-col gap-2">
	{#if data.user}
		<h1 class="text-4xl font-bold">Home</h1>
		<div class="flex items-center gap-2">
			<Avatar
				size={40}
				src={data.user.image || ''}
				name={data.user.name || ''}
				alt="User Avatar"
				className="border-zinc-400"
			/>
			<div>
				<h1 class="text-lg font-semibold">{data.randomGreeting} {data.user.name}!</h1>
			</div>
		</div>

		{#if data.recentlyUpdated && data.recentlyUpdated?.length > 0}
			<h2 class="text-2xl font-semibold">Recently Modified</h2>
			<div class="flex w-fit max-w-full flex-nowrap gap-2 overflow-x-auto">
				{#each data.recentlyUpdated as device}
					<DeviceCard
						{device}
						includeMenu={false}
						deleteDevice={undefined}
						editPopupOpen={false}
						toEdit={null}
					/>
				{/each}

				{#if data.recentlyUpdated.length === 0}
					<p class="text-sm text-zinc-500">No devices to show.</p>
				{:else if data.totalCount > 5}
					<a
						class="relative flex max-w-sm min-w-50 flex-1 flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border-2 border-zinc-400 bg-zinc-200 p-4 shadow-md sm:min-w-80 dark:bg-zinc-700"
						href="/devices"
					>
						<div
							class="mt-auto flex max-w-full flex-col items-center justify-center gap-2 overflow-hidden"
						>
							<div
								class="max-w-full overflow-hidden rounded-full bg-zinc-100 px-8 py-4 dark:bg-zinc-800"
							>
								<p class="overflow-hidden text-5xl font-bold text-nowrap text-ellipsis">
									+{(data.totalCount - 5).toLocaleString()}
								</p>
							</div>
							<p class="text-xl font-semibold">View All</p>
						</div>

						<p class="mt-auto text-center text-sm">View all of your devices on the devices page.</p>
					</a>
				{/if}
			</div>
		{/if}

		{#if data.recentlyCreated && data.recentlyCreated?.length > 0}
			<h2 class="text-2xl font-semibold">Recently Created</h2>
			<div class="flex w-fit max-w-full flex-nowrap gap-2 overflow-x-auto">
				{#each data.recentlyCreated as device}
					<DeviceCard
						{device}
						includeMenu={false}
						deleteDevice={undefined}
						editPopupOpen={false}
						toEdit={null}
					/>
				{/each}

				{#if data.recentlyUpdated.length === 0}
					<p class="text-sm text-zinc-500">No devices to show.</p>
				{:else if data.totalCount > 5}
					<a
						class="relative flex max-w-sm min-w-50 flex-1 flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border-2 border-zinc-400 bg-zinc-200 p-4 shadow-md sm:min-w-80 dark:bg-zinc-700"
						href="/devices"
					>
						<div
							class="mt-auto flex max-w-full flex-col items-center justify-center gap-2 overflow-hidden"
						>
							<div
								class="max-w-full overflow-hidden rounded-full bg-zinc-100 px-8 py-4 dark:bg-zinc-800"
							>
								<p class="overflow-hidden text-5xl font-bold text-nowrap text-ellipsis">
									+{(data.totalCount - 5).toLocaleString()}
								</p>
							</div>
							<p class="text-xl font-semibold">View All</p>
						</div>

						<p class="mt-auto text-center text-sm">View all of your devices on the devices page.</p>
					</a>
				{/if}
			</div>
		{/if}
	{/if}
</div>
