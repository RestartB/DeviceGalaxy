<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { X } from '@lucide/svelte';

	let { popupOpen = $bindable(false) } = $props();

	function remindMeLater() {
		popupOpen = false;
	}

	function dontRemindAgain() {
		localStorage.setItem('oldURLAlertDismissed', 'true');
		popupOpen = false;
	}
</script>

<svelte:window
	onkeydown={(event) => {
		if (event.key === 'Escape') {
			popupOpen = false;
		}
	}}
/>

{#if popupOpen}
	<div
		class="fixed inset-0 z-30 mt-12 flex items-center justify-center overflow-hidden bg-white/60 p-4 backdrop-blur-lg dark:bg-black/60"
		transition:fade={{ duration: 100 }}
	>
		<div
			class="z-50 flex max-h-full w-full max-w-lg flex-col overflow-hidden rounded-xl border-4 border-zinc-400 bg-zinc-100 text-center shadow-2xl dark:bg-zinc-800"
		>
			<div class="flex w-full items-center justify-center gap-2 border-b p-4">
				<h1 class="text-xl font-bold text-nowrap">This link will stop working soon</h1>
			</div>
			<div class="flex w-full flex-wrap justify-center gap-2 overflow-y-auto p-6">
				<p>
					DeviceGalaxy is migrating from <a
						href="https://devices.restartb.xyz"
						class="underline"
						title="devices.restartb.xyz">devices.restartb.xyz</a
					>
					to
					<a href="https://devicegalaxy.me" class="underline" title="devicegalaxy.me"
						>devicegalaxy.me</a
					>, and old links will stop working soon. Please correct any links that you may have saved
					to ensure a smooth migration.
				</p>
			</div>
			<div class="flex flex-col gap-2 border-t p-6">
				<a
					class="w-full cursor-pointer rounded-md bg-green-500 px-4 py-2 font-bold text-white transition-colors hover:bg-green-600"
					href="https://devicegalaxy.me">Go to devicegalaxy.me</a
				>
				<button
					class="w-full cursor-pointer rounded-md bg-zinc-500 px-4 py-2 font-bold text-white transition-colors hover:bg-zinc-600"
					onclick={remindMeLater}>Remind me later</button
				>
				<button
					class="w-full cursor-pointer rounded-md bg-zinc-500 px-4 py-2 font-bold text-white transition-colors hover:bg-zinc-600"
					onclick={dontRemindAgain}>Don't remind me again</button
				>
			</div>
		</div>
	</div>
{/if}
