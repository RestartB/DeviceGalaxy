<script lang="ts">
	// Get session from props
	const { data, children } = $props();

	import { page } from '$app/state';
	import Avatar from '$lib/components/Avatar.svelte';

	let clientWidth = $state(0);
</script>

<svelte:body bind:clientWidth />

<div class="flex w-full flex-col gap-2">
	{#if data.user}
		<div class="flex w-full flex-col gap-4 sm:flex-row">
			<div
				class="flex flex-col gap-2 overflow-hidden sm:max-w-42 sm:min-w-42 sm:items-center sm:text-center"
			>
				<h1 class="text-4xl font-bold">Settings</h1>
				<div class="flex items-center gap-2 overflow-hidden text-center sm:flex-col">
					<Avatar
						size={clientWidth > 640 ? 140 : 60}
						src={data.user.image || ''}
						name={data.user.name || ''}
						alt="User Avatar"
						className="border-zinc-400"
						textClass="text-3xl sm:text-7xl"
					/>
					<div class="flex w-full flex-col overflow-hidden text-start sm:gap-2 sm:text-center">
						<h2 class="w-full truncate text-2xl font-semibold sm:text-nowrap">{data.user.name}</h2>
						<p>User since <strong>{data.user.createdAt.toLocaleDateString()}</strong></p>
					</div>
				</div>

				<hr class="hidden w-full text-zinc-600 sm:block" />

				<div class="hidden sm:block">
					<div>
						<h3>Total Devices</h3>
						<p class="text-2xl font-bold">{data.totalDevices}</p>
					</div>

					<div>
						<h3>Total Tags</h3>
						<p class="text-2xl font-bold">{data.totalTags}</p>
					</div>
				</div>
			</div>
			<div class="flex w-full flex-col">
				<div class="mb-2 flex w-fit rounded-full bg-zinc-200 p-1 dark:bg-zinc-800">
					<a
						class="rounded-full px-4 py-1 transition-colors hover:bg-zinc-300 dark:hover:bg-zinc-700"
						class:bg-zinc-100={page.url.pathname === '/settings/account'}
						class:dark:bg-zinc-600={page.url.pathname === '/settings/account'}
						href="/settings/account"
						title="Account Settings"
					>
						Account
					</a>
					<a
						class="rounded-full px-4 py-1 transition-colors hover:bg-zinc-300 dark:hover:bg-zinc-700"
						class:bg-zinc-100={page.url.pathname === '/settings/security'}
						class:dark:bg-zinc-600={page.url.pathname === '/settings/security'}
						href="/settings/security"
						title="Security Settings"
					>
						Security
					</a>
					<a
						class="rounded-full px-4 py-1 transition-colors hover:bg-red-300 dark:hover:bg-red-700"
						class:bg-zinc-100={page.url.pathname === '/settings/delete'}
						class:dark:bg-zinc-600={page.url.pathname === '/settings/delete'}
						href="/settings/delete"
						title="Delete Account"
					>
						Delete Account
					</a>
				</div>
				<div class="w-full">
					{@render children()}
				</div>
			</div>
		</div>
	{/if}
</div>
