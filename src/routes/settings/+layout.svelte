<script lang="ts">
	// Get session from props
	const { data, children } = $props();

	import { page } from '$app/state';
	import Avatar from '$lib/components/Avatar.svelte';
</script>

<div class="flex w-full flex-col gap-2">
	{#if data.user}
		<div class="flex w-full gap-4">
			<div class="flex max-w-42 min-w-42 flex-col items-center gap-2 overflow-hidden text-center">
				<h1 class="text-4xl font-bold">Settings</h1>
				<Avatar
					size={140}
					src={data.user.image || ''}
					name={data.user.name || ''}
					alt="User Avatar"
					className="border-zinc-400"
					textClass="text-7xl"
				/>
				<h2 class="text-2xl font-semibold">{data.user.name}</h2>
				<p>User since <strong>{data.user.createdAt.toLocaleDateString()}</strong></p>

				<hr class="w-full text-zinc-600" />

				<div>
					<h3>Total Devices</h3>
					<p class="text-2xl font-bold">{data.totalDevices}</p>
				</div>

				<div>
					<h3>Total Tags</h3>
					<p class="text-2xl font-bold">{data.totalTags}</p>
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
