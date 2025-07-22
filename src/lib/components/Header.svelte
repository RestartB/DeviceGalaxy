<script lang="ts">
	import { goto, onNavigate } from '$app/navigation';
	import { fade, fly } from 'svelte/transition';
	import { prefersReducedMotion } from 'svelte/motion';
	import type { LayoutData } from '../../routes/$types';

	import { authClient } from '$lib/client';

	import Avatar from '$lib/components/Avatar.svelte';
	import { House, Monitor, Tag, Share, Cog, LogOut, Menu, LogIn } from '@lucide/svelte';

	// Get session from props
	let { data }: { data: LayoutData } = $props();
	let menuOpen = $state(false);

	onNavigate(() => {
		menuOpen = false;
	});
</script>

<header
	class="fixed z-1000 box-border flex h-12 w-full items-center justify-center gap-4 border-b-4 border-zinc-300 bg-zinc-200 px-4 dark:border-zinc-700 dark:bg-zinc-800"
	style="view-transition-name: header"
>
	<a class="flex h-full items-center gap-2" href="/" title="DeviceGalaxy">
		<enhanced:img src="$lib/images/logo/logo_square.svg" alt="DeviceGalaxy Logo" class="h-6 w-6" />
		<h1 class=" text-xl font-bold">DeviceGalaxy</h1>
	</a>
	{#if data.user}
		<nav class="hidden h-full items-center justify-center sm:flex">
			<a
				class="flex h-full items-center justify-center rounded-lg px-2 transition-colors hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700"
				href="/dash"
				title="Home"
			>
				Home
			</a>
			<a
				class="flex h-full items-center justify-center rounded-lg px-2 transition-colors hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700"
				href="/dash/devices"
				title="Devices"
			>
				Devices
			</a>
			<a
				class="flex h-full items-center justify-center rounded-lg px-2 transition-colors hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700"
				href="/dash/tags"
				title="Tags"
			>
				Tags
			</a>
			<a
				class="flex h-full items-center justify-center rounded-lg px-2 transition-colors hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700"
				href="/dash/shares"
				title="Shared"
			>
				Shared
			</a>
		</nav>

		<div class="ml-auto flex h-full max-w-[50%] items-center justify-end gap-2">
			{#if data.user}
				<Avatar
					size={30}
					src={data.user.image || ''}
					name={data.user.name || ''}
					alt="User Avatar"
					className="border-zinc-400"
				/>
				<p class="xxs:block hidden max-w-full truncate font-bold text-nowrap">{data.user.name}</p>
				<div class="hidden h-full sm:flex">
					<a
						class="flex h-full cursor-pointer items-center justify-center rounded-lg px-2 transition-colors hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700"
						href="/dash/settings/account"
						title="Settings"
					>
						<Cog size="20" />
					</a>
					<button
						class="flex h-full cursor-pointer items-center justify-center rounded-lg px-2 transition-colors hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700"
						title="Sign Out"
						onclick={() => {
							authClient.signOut();
							goto('/dash/auth/login');
						}}
					>
						<LogOut size="20" />
					</button>
				</div>
			{/if}
			<button
				class="flex h-full cursor-pointer items-center justify-center rounded-lg px-2 transition-colors hover:bg-zinc-100 sm:hidden dark:bg-zinc-800 dark:hover:bg-zinc-700"
				title="Menu"
				onclick={() => {
					menuOpen = !menuOpen;
				}}
			>
				<Menu size="20" />
			</button>
		</div>
	{:else}
		<a
			class="ml-auto flex w-fit items-center justify-center gap-2 rounded-lg p-2 font-semibold"
			href="/dash/auth/login"
		>
			<LogIn size="20" />
			Log in
		</a>
	{/if}

	{#if menuOpen && data.user}
		<div
			class="fixed inset-0 z-60 mt-12 flex items-start justify-center overflow-hidden bg-white/60 p-4 backdrop-blur-lg dark:bg-black/60"
			transition:fade={{ duration: 100 }}
		>
			<div
				class="absolute inset-0 z-70"
				onclick={() => (menuOpen = false)}
				aria-hidden="true"
			></div>

			<div
				class="z-80 flex max-h-full w-full flex-col overflow-hidden rounded-xl border-4 border-zinc-400 bg-zinc-100 p-4 shadow-2xl dark:bg-zinc-800"
				transition:fly={{ duration: 300, y: prefersReducedMotion.current ? 0 : -10, opacity: 0 }}
			>
				<nav class="flex h-full w-full flex-col items-center justify-start gap-2">
					<a
						class="flex h-full w-full items-center justify-start gap-2 rounded-lg text-xl font-semibold"
						href="/dash"
					>
						<House size="30" />
						Home
					</a>
					<a
						class="flex h-full w-full items-center justify-start gap-2 rounded-lg text-xl font-semibold"
						href="/dash/devices"
					>
						<Monitor size="30" />
						Devices
					</a>
					<a
						class="flex h-full w-full items-center justify-start gap-2 rounded-lg text-xl font-semibold"
						href="/dash/tags"
					>
						<Tag size="30" />
						Tags
					</a>
					<a
						class="flex h-full w-full items-center justify-start gap-2 rounded-lg text-xl font-semibold"
						href="/dash/shares"
					>
						<Share size="30" />
						Shared
					</a>

					<hr class="w-full text-zinc-800 dark:text-zinc-200" />

					<div class="flex w-full items-center justify-center gap-2">
						<Avatar
							size={30}
							src={data.user.image || ''}
							name={data.user.name || ''}
							alt="User Avatar"
							className="border-zinc-400"
						/>
						<p class="max-w-full truncate text-xl text-nowrap">{data.user.name}</p>
					</div>
					<div class="flex w-full items-center justify-center gap-2">
						<a
							class="flex h-full flex-1 items-center justify-center gap-2 rounded-lg border-2 border-zinc-400 bg-zinc-300 p-2 font-semibold dark:bg-zinc-700"
							href="/dash/settings/account"
						>
							<Cog size="20" />
							Settings
						</a>
						<button
							class="flex h-full flex-1 items-center justify-center gap-2 rounded-lg border-2 border-zinc-400 bg-zinc-300 p-2 font-semibold dark:bg-zinc-700"
							onclick={() => {
								authClient.signOut();
								goto('/dash/auth/login');
							}}
						>
							<LogOut size="20" />
							Sign Out
						</button>
					</div>
				</nav>
			</div>
		</div>
	{/if}
</header>
