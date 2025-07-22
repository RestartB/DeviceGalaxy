<script lang="ts">
	import {
		LayoutDashboard,
		LogIn,
		UserPlus,
		Heart,
		Cpu,
		MemoryStick,
		HardDrive,
		Cog,
		Image,
		Info,
		Tag,
		Eye,
		Funnel,
		Search,
		Share,
		Monitor,
		Ban,
		User
	} from '@lucide/svelte';

	// Get session from props
	const { data } = $props();
</script>

<svelte:head>
	<title>DeviceGalaxy</title>
</svelte:head>

<div>
	<div
		class="flex h-fit w-full flex-col items-center justify-center gap-4 bg-gradient-to-b from-[#35005E] to-[#100031] p-12 px-2 pb-6 text-center text-white"
	>
		<div>
			<div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
				<enhanced:img src="$lib/images/logo/monitor.svg" alt="DeviceGalaxy Logo" />
				<h1 class="text-5xl font-bold">DeviceGalaxy</h1>
			</div>

			<div class="mt-4 flex items-center justify-center gap-2 sm:mt-0">
				<enhanced:img
					src="$lib/images/pfp.png"
					alt="Restart's PFP"
					class="h-8 w-8 rounded-full border-2"
				/>
				<p class="text-xl">by <strong>Restart</strong></p>
			</div>
		</div>

		<p class="text-xl font-semibold">Manage and share your galaxy of devices.</p>
	</div>

	<div class="h-12 w-full rounded-b-[100%] bg-[#100031] shadow-2xl"></div>
</div>

<div class="flex w-full flex-col items-center justify-center">
	<div class="flex max-w-7xl flex-col gap-8 p-8">
		<div class="flex w-full flex-wrap items-center justify-center gap-2">
			{#if data.user}
				<a
					href="/dash"
					class="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-zinc-400 bg-zinc-100 px-4 py-2 font-bold text-nowrap transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
				>
					<LayoutDashboard size="20" class="flex-shrink-0" />
					Go to Dashboard
				</a>
			{:else}
				<a
					href="/dash/auth/login"
					class="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-zinc-400 bg-zinc-100 px-4 py-2 font-bold text-nowrap transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
				>
					<LogIn size="20" class="flex-shrink-0" />
					Log in
				</a>
				<a
					href="/dash/auth/signup"
					class="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-zinc-400 bg-zinc-100 px-4 py-2 font-bold text-nowrap transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
				>
					<UserPlus size="20" class="flex-shrink-0" />
					Sign up
				</a>
			{/if}
			<a
				href="/open-source"
				class="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-zinc-400 bg-zinc-100 px-4 py-2 font-bold text-nowrap transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
			>
				<Heart size="20" class="flex-shrink-0" />
				Open Source
			</a>
		</div>

		<div class="flex w-full flex-col items-center justify-center gap-6 sm:flex-row">
			<div
				class="relative flex max-w-100 flex-1 cursor-default flex-col overflow-hidden rounded-lg border-2 border-zinc-400 bg-zinc-200 shadow-md select-none sm:min-w-80 dark:bg-zinc-700"
			>
				<div class="flex w-full flex-col gap-2 p-4">
					<div>
						<p class="text-sm text-zinc-600 dark:text-zinc-400">Apple</p>
						<h2 class="text-xl font-semibold">Macbook Air</h2>
						<p>My Midnight Blue Macbook Air, that I got in October 2024.</p>
					</div>
					<div class="flex w-full flex-wrap gap-1 text-sm">
						<div
							class="flex h-fit w-fit items-center justify-center gap-2 rounded-full border-2 border-zinc-400 bg-zinc-100 p-2 px-4 dark:bg-zinc-800"
						>
							<Cpu size="20" class="flex-shrink-0" />
							<p>Apple M3</p>
						</div>

						<div
							class="flex h-fit w-fit items-center justify-center gap-2 rounded-full border-2 border-zinc-400 bg-zinc-100 p-2 px-4 dark:bg-zinc-800"
						>
							<MemoryStick size="20" class="flex-shrink-0" />
							<p>16GB</p>
						</div>

						<div
							class="flex h-fit w-fit items-center justify-center gap-2 rounded-full border-2 border-zinc-400 bg-zinc-100 p-2 px-4 dark:bg-zinc-800"
						>
							<HardDrive size="20" class="flex-shrink-0" />
							<p>512GB</p>
						</div>

						<div
							class="flex h-fit w-fit items-center justify-center gap-2 rounded-full border-2 border-zinc-400 bg-zinc-100 p-2 px-4 dark:bg-zinc-800"
						>
							<Cog size="20" class="flex-shrink-0" />
							<p>macOS 15</p>
						</div>
					</div>
				</div>
			</div>
			<div>
				<h2 class="text-4xl font-bold"><strong>Add</strong> your devices.</h2>
				<p>
					Add all of your devices. Set a name, description, specifications, upload images, and add
					tags to group devices together.
				</p>

				<ul class="mt-2">
					<li class="flex items-center gap-2">
						<Image size="20" class="flex-shrink-0" />
						<span>Upload up to <strong>5 images</strong> per device.</span>
					</li>
					<li class="flex items-center gap-2">
						<Info size="20" class="flex-shrink-0" />
						<span
							>Set <strong>CPU, Memory, Hard Drive, OS</strong> and <strong>Brand</strong> attributes.</span
						>
					</li>
					<li class="flex items-center gap-2">
						<Tag size="20" class="flex-shrink-0" />
						<span>Create <strong>tags</strong> to categorise devices.</span>
					</li>
				</ul>
			</div>
		</div>

		<hr class="w-full text-zinc-300 dark:text-zinc-600" />

		<div class="flex w-full flex-col items-center justify-center gap-6 sm:flex-row-reverse">
			<div class="flex flex-col items-center justify-center gap-2">
				<div
					class="flex w-full items-center justify-start gap-2 rounded-full border-2 border-zinc-400 bg-zinc-200 px-4 py-2 shadow-md dark:bg-zinc-700"
				>
					<Search size="20" class="flex-shrink-0" />
					<p class="text-zinc-600 dark:text-zinc-300">optiplex</p>
				</div>
				<div
					class="flex max-w-100 flex-1 cursor-default flex-col overflow-hidden rounded-lg border-2 border-zinc-400 bg-zinc-200 p-4 shadow-md select-none sm:min-w-80 dark:bg-zinc-700"
				>
					<p class="text-sm text-zinc-600 dark:text-zinc-400">Dell</p>
					<h2 class="text-xl font-semibold">Optiplex 3080</h2>
					<p>Took this from recycling, installed Proxmox on it, now it's the core of my homelab!</p>
				</div>
				<p class="text-zinc-600 dark:text-zinc-300"><strong>+5</strong> results</p>
			</div>
			<div>
				<h2 class="text-4xl font-bold"><strong>View</strong> your devices.</h2>
				<p>
					See your entire collection of devices at a glance. View device details, specifications and
					tags in a grid view. Set tag, brand or specification filters to remove the noise and find
					things quicker.
				</p>

				<ul class="mt-2">
					<li class="flex items-center gap-2">
						<Eye size="20" class="flex-shrink-0" />
						<span>View up to <strong>50 devices</strong> per page.</span>
					</li>
					<li class="flex items-center gap-2">
						<Funnel size="20" class="flex-shrink-0" />
						<span
							>Set <strong>CPU, Memory, Hard Drive, OS, Brand</strong> and <strong>tag</strong> filters.</span
						>
					</li>
					<li class="flex items-center gap-2">
						<Search size="20" class="flex-shrink-0" />
						<span><strong>Search your collection</strong> quickly.</span>
					</li>
				</ul>
			</div>
		</div>

		<hr class="w-full text-zinc-300 dark:text-zinc-600" />

		<div class="flex w-full flex-col items-center justify-center gap-6 sm:flex-row">
			<div class="flex w-fit flex-col items-center gap-4">
				<div class="flex w-full items-center justify-center gap-2">
					<span class="flex-shrink-0">
						<enhanced:img
							src="$lib/images/pfp.png"
							alt="Restart's PFP"
							class="aspect-square h-12 w-12 rounded-full"
						/>
					</span>
					<div class="flex flex-1 flex-col justify-center text-start">
						<p class="w-fit text-xl font-semibold">Restart</p>
						<p class="w-fit">devicegalaxy.me/share/1234abcd</p>
					</div>
				</div>

				<div
					class="flex-1 cursor-default overflow-hidden rounded-lg border-2 border-zinc-400 bg-zinc-200 shadow-md select-none sm:min-w-80 dark:bg-zinc-700"
				>
					<div class="flex gap-2 border-l-4 border-[#6463FF] p-4">
						<div>
							<p class="text-zinc-600 dark:text-zinc-300">DeviceGalaxy</p>
							<p class="text-2xl font-bold">Restart's Devices</p>
							<p>View Restart's devices on DeviceGalaxy.</p>
						</div>

						<div class="flex-shrink-0">
							<enhanced:img
								src="$lib/images/pfp.png"
								alt="Restart's PFP"
								class="aspect-square h-25 w-25 rounded-lg"
							/>
						</div>
					</div>
				</div>
			</div>
			<div>
				<h2 class="text-4xl font-bold"><strong>Share</strong> your devices.</h2>
				<p>
					Generate share links for your devices or collection. Then, share them with friends, or put
					them on your profile. We handle the rest.
				</p>

				<ul class="mt-2">
					<li class="flex items-center gap-2">
						<Share size="20" class="flex-shrink-0" />
						<span>Create <strong>unlimited</strong> share links.</span>
					</li>
					<li class="flex items-center gap-2">
						<Monitor size="20" class="flex-shrink-0" />
						<span
							>Share your <strong>entire collection,</strong> or a
							<strong>specific device.</strong></span
						>
					</li>
					<li class="flex items-center gap-2">
						<Ban size="20" class="flex-shrink-0" />
						<span><strong>Revoke share links</strong> at any time.</span>
					</li>
				</ul>
			</div>
		</div>

		<hr class="w-full text-zinc-300 dark:text-zinc-600" />

		<div class="grid gap-4 md:grid-cols-3">
			<div
				class="flex flex-1 cursor-default items-center gap-4 overflow-hidden rounded-lg border-2 border-zinc-400 bg-zinc-200 p-4 shadow-md select-none dark:bg-zinc-700"
			>
				<User size="40" class="flex-shrink-0" />
				<div>
					<h3 class="text-2xl font-bold">Users <span class="font-normal">joined.</span></h3>
					<code class="text-xl">{data.totalUsers}</code>
				</div>
			</div>
			<div
				class="flex flex-1 cursor-default items-center gap-4 overflow-hidden rounded-lg border-2 border-zinc-400 bg-zinc-200 p-4 shadow-md select-none dark:bg-zinc-700"
			>
				<Monitor size="40" class="flex-shrink-0" />
				<div>
					<h3 class="text-2xl font-bold">Devices <span class="font-normal">created.</span></h3>
					<code class="text-xl">{data.totalDevices}</code>
				</div>
			</div>
			<div
				class="flex flex-1 cursor-default items-center gap-4 overflow-hidden rounded-lg border-2 border-zinc-400 bg-zinc-200 p-4 shadow-md select-none dark:bg-zinc-700"
			>
				<Image size="40" class="flex-shrink-0" />
				<div>
					<h3 class="text-2xl font-bold">Images <span class="font-normal">uploaded.</span></h3>
					<code class="text-xl">{data.totalImages}</code>
				</div>
			</div>
		</div>

		<hr class="w-full text-zinc-300 dark:text-zinc-600" />

		<div class="flex flex-col items-center justify-center gap-4">
			<h2 class="text-center text-4xl">
				Ready to <span
					class="bg-gradient-to-br from-[#ad42ff] to-[#1700c5] bg-clip-text font-bold text-transparent dark:from-[#e0b7ff] dark:to-[#9966ff]"
					>create your galaxy?</span
				>
			</h2>
			{#if data.user}
				<a
					href="/dash"
					class="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-zinc-400 bg-zinc-100 px-4 py-2 font-bold text-nowrap transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
				>
					<LayoutDashboard size="20" class="flex-shrink-0" />
					Go to Dashboard
				</a>
			{:else}
				<a
					href="/dash/auth/login"
					class="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-zinc-400 bg-zinc-100 px-4 py-2 font-bold text-nowrap transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
				>
					<LogIn size="20" class="flex-shrink-0" />
					Log in
				</a>
				<a
					href="/dash/auth/signup"
					class="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-zinc-400 bg-zinc-100 px-4 py-2 font-bold text-nowrap transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
				>
					<UserPlus size="20" class="flex-shrink-0" />
					Sign up
				</a>
			{/if}
		</div>
	</div>
</div>
