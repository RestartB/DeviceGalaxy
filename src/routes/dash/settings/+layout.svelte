<script lang="ts">
	// Get session from props
	const { data, children } = $props();

	import { page } from '$app/state';
	import Avatar from '$lib/components/Avatar.svelte';

	let clientWidth = $state(0);
</script>

<svelte:body bind:clientWidth />

<svelte:head>
	<title>DeviceGalaxy - Settings</title>
</svelte:head>

<div class="flex w-full flex-col gap-2">
	{#if data.user}
		<div class="flex w-full flex-col gap-4 sm:flex-row">
			<div
				class="flex flex-col gap-2 overflow-hidden sm:max-w-42 sm:min-w-42 sm:items-center sm:text-center"
				style="view-transition-name: settings-sidebar"
			>
				<h1 class="text-4xl font-bold" style="view-transition-name: settings-title">Settings</h1>
				<div
					class="flex items-center gap-2 overflow-hidden text-center sm:flex-col"
					style="view-transition-name: settings-user-info"
				>
					<Avatar
						size={clientWidth > 640 ? 140 : 60}
						src={data.user.image || ''}
						name={data.user.name || ''}
						alt="User Avatar"
						className="border-zinc-400"
						textClass="text-3xl sm:text-7xl"
					/>
					<div class="flex w-full flex-col overflow-hidden text-start sm:gap-2 sm:text-center">
						<h2
							class="w-full truncate text-2xl font-semibold sm:text-nowrap"
							style="view-transition-name: settings-username"
						>
							{data.user.name}
						</h2>
						<p style="view-transition-name: settings-user-since">
							User since <strong>{data.user.createdAt.toLocaleDateString()}</strong>
						</p>
					</div>
				</div>

				<hr class="hidden w-full text-zinc-600 sm:block" />

				<div class="hidden sm:block" style="view-transition-name: settings-stats">
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
				<div
					class="mb-2 flex w-fit overflow-hidden rounded-full bg-zinc-200 p-1 dark:bg-zinc-800"
					style="view-transition-name: settings-tabs"
				>
					<a
						class="relative rounded-full px-4 py-1 transition-colors hover:bg-zinc-300 dark:hover:bg-zinc-700"
						class:dark:bg-zinc-600={page.url.pathname === '/dash/settings/account'}
						href="/dash/settings/account"
						title="Account Settings"
						aria-current={page.url.pathname === '/dash/settings/account' ? 'page' : undefined}
					>
						<p class="z-20">Account</p>
					</a>
					<a
						class="relative rounded-full px-4 py-1 transition-colors hover:bg-zinc-300 dark:hover:bg-zinc-700"
						class:dark:bg-zinc-600={page.url.pathname === '/dash/settings/security'}
						href="/dash/settings/security"
						title="Security Settings"
						aria-current={page.url.pathname === '/dash/settings/security' ? 'page' : undefined}
					>
						<p class="z-20">Security</p>
					</a>
					<a
						class="relative rounded-full px-4 py-1 transition-colors hover:bg-red-300 dark:hover:bg-red-700"
						class:dark:bg-zinc-600={page.url.pathname === '/dash/settings/delete'}
						href="/dash/settings/delete"
						title="Delete Account"
						aria-current={page.url.pathname === '/dash/settings/delete' ? 'page' : undefined}
					>
						<p class="z-20">Delete Account</p>
					</a>
				</div>
				<div class="w-full">
					{@render children()}
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	a[aria-current='page']::before {
		content: '';
		position: absolute;
		bottom: -4px;
		left: 0;
		right: 0;
		height: 4px;
		margin-left: 20px;
		margin-right: 20px;
		border-radius: 9999px;
		background: oklch(70.5% 0.015 286.067);
		view-transition-name: active-bar;
	}
</style>
