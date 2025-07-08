<script lang="ts">
	import { goto } from '$app/navigation';
	import { fade } from 'svelte/transition';
	import { toast } from 'svelte-sonner';

	import { authClient } from '$lib/client';
	import { X, Pencil, RefreshCw } from '@lucide/svelte';

	// Get session from props
	const { data } = $props();

	let emailBlurred = $state(true);

	let emailPopupOpen = $state(false);
	let newEmail = $state(data.user?.email || '');

	let passwordPopupOpen = $state(false);
	let oldPassword = $state('');
	let newPassword = $state('');
	let revokeSessions = $state(false);

	let reset2FAPopupOpen = $state(false);
	let resetConfirmPassword = $state('');

	async function changeEmail() {
		if (newEmail && newEmail !== data.user?.email) {
			try {
				await authClient.changeEmail({
					newEmail: newEmail
				});

				emailPopupOpen = false;
				toast.success('Email address updated successfully!');

				newEmail = '';
			} catch (error) {
				toast.error('Failed to update email address. Please try again.');
				console.error('Error updating email:', error);
			}
		}
	}

	async function changePassword() {
		if (newPassword) {
			try {
				await authClient.changePassword({
					newPassword: oldPassword,
					currentPassword: newPassword,
					revokeOtherSessions: revokeSessions
				});

				passwordPopupOpen = false;
				toast.success('Password updated successfully!');

				newPassword = '';
			} catch (error) {
				toast.error('Failed to update password. Please try again.');
				console.error('Error updating password:', error);
			}
		}
	}

	async function disable2FA() {
		try {
			const { data } = await authClient.twoFactor.disable({
				password: resetConfirmPassword
			});

			if (data?.status) {
				await goto('/auth/setup-2fa', { replaceState: true });
			} else {
				toast.error('Failed to disable 2FA. Check your password is correct, then try again.');
			}
		} catch (error) {
			toast.error('Failed to reset 2FA. Please try again.');
			console.error('Error resetting 2FA:', error);
		}
	}
</script>

{#if emailPopupOpen}
	<div
		class="fixed inset-0 z-60 flex items-center justify-center bg-white/60 p-4 backdrop-blur-lg dark:bg-black/60"
		transition:fade={{ duration: 100 }}
	>
		<div
			class="absolute inset-0 z-70"
			onclick={() => (emailPopupOpen = false)}
			aria-hidden="true"
		></div>

		<div
			class="z-80 flex w-full max-w-lg flex-col overflow-hidden rounded-xl border-4 border-zinc-400 bg-zinc-100 shadow-2xl dark:bg-zinc-800"
		>
			<div class="flex items-center justify-between border-b p-4">
				<h2 class="text-xl font-bold">Change Email Address</h2>
				<button
					onclick={() => (emailPopupOpen = false)}
					class="cursor-pointer text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-400"
					aria-label="Close"><X /></button
				>
			</div>
			<div class="flex flex-col gap-4 p-6">
				<label for="email" class="text-sm font-medium">New Email Address</label>
				<input
					type="email"
					id="email"
					name="email"
					class="w-full rounded-lg border p-2"
					bind:value={newEmail}
				/>
			</div>
			<div class="border-t p-6">
				<button
					type="submit"
					class="w-full cursor-pointer rounded-md bg-green-500 px-4 py-2 font-bold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-green-500"
					disabled={newEmail === data.user?.email}
					onclick={changeEmail}>Change Email Address</button
				>
			</div>
		</div>
	</div>
{/if}

{#if passwordPopupOpen}
	<div
		class="fixed inset-0 z-60 flex items-center justify-center bg-white/60 p-4 backdrop-blur-lg dark:bg-black/60"
		transition:fade={{ duration: 100 }}
	>
		<div
			class="absolute inset-0 z-70"
			onclick={() => (emailPopupOpen = false)}
			aria-hidden="true"
		></div>

		<div
			class="z-80 flex w-full max-w-lg flex-col overflow-hidden rounded-xl border-4 border-zinc-400 bg-zinc-100 shadow-2xl dark:bg-zinc-800"
		>
			<div class="flex items-center justify-between border-b p-4">
				<h2 class="text-xl font-bold">Change Password</h2>
				<button
					onclick={() => (passwordPopupOpen = false)}
					class="cursor-pointer text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-400"
					aria-label="Close"><X /></button
				>
			</div>
			<div class="flex flex-col gap-4 p-6">
				<label for="oldPassword" class="text-sm font-medium">Old Password</label>
				<input
					type="password"
					id="oldPassword"
					name="oldPassword"
					class="w-full rounded-lg border p-2"
					bind:value={oldPassword}
				/>

				<label for="newPassword" class="text-sm font-medium">New Password</label>
				<input
					type="password"
					id="newPassword"
					name="newPassword"
					class="w-full rounded-lg border p-2"
					bind:value={newPassword}
				/>

				<div class="flex items-center justify-between gap-4">
					<div>
						<label for="revokeSessions" class="text-sm font-medium">Revoke other sessions</label>
						<p class="text-sm text-zinc-400">
							You can optionally log out other devices where you are currently logged in.
						</p>
					</div>
					<input
						type="checkbox"
						id="revokeSessions"
						name="revokeSessions"
						class="h-6 w-6"
						bind:checked={revokeSessions}
					/>
				</div>
			</div>
			<div class="border-t p-6">
				<button
					type="submit"
					class="w-full cursor-pointer rounded-md bg-green-500 px-4 py-2 font-bold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-green-500"
					disabled={oldPassword === '' || newPassword === ''}
					onclick={changePassword}>Change Password</button
				>
			</div>
		</div>
	</div>
{/if}

{#if reset2FAPopupOpen}
	<div
		class="fixed inset-0 z-60 flex items-center justify-center bg-white/60 p-4 backdrop-blur-lg dark:bg-black/60"
		transition:fade={{ duration: 100 }}
	>
		<div
			class="absolute inset-0 z-70"
			onclick={() => (reset2FAPopupOpen = false)}
			aria-hidden="true"
		></div>

		<div
			class="z-80 flex w-full max-w-lg flex-col overflow-hidden rounded-xl border-4 border-zinc-400 bg-zinc-100 shadow-2xl dark:bg-zinc-800"
		>
			<div class="flex items-center justify-between border-b p-4">
				<h2 class="text-xl font-bold">Reset 2FA</h2>
				<button
					onclick={() => (reset2FAPopupOpen = false)}
					class="cursor-pointer text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-400"
					aria-label="Close"><X /></button
				>
			</div>
			<div class="flex flex-col gap-4 p-6">
				<p>
					Confirm your password, then press the button below to reset your 2FA settings. You will be
					prompted to set up 2FA, and you may be logged out of other devices.
				</p>

				<label for="confirmPassword" class="text-sm font-medium">Confirm Password</label>
				<input
					type="password"
					id="confirmPassword"
					name="confirmPassword"
					class="w-full rounded-lg border p-2"
					bind:value={resetConfirmPassword}
				/>
			</div>
			<div class="border-t p-6">
				<button
					type="submit"
					class="w-full cursor-pointer rounded-md bg-red-500 px-4 py-2 font-bold text-white transition-colors hover:bg-red-600"
					disabled={resetConfirmPassword === ''}
					onclick={disable2FA}>Reset 2FA</button
				>
			</div>
		</div>
	</div>
{/if}

<div class="flex flex-col gap-4">
	<h3 class="text-2xl font-bold">Manage Account</h3>

	<div class="flex flex-col gap-2">
		<h4 class="text-xl font-bold">Email</h4>

		<p class="font-semibold">View your login email address.</p>
		<div>
			<button
				class="w-fit overflow-hidden rounded-lg border-2 border-zinc-400 bg-zinc-200 p-2 dark:bg-zinc-700"
				onclick={() => (emailBlurred = !emailBlurred)}
			>
				<p class="w-full blur-sm transition-all" class:blur-sm={emailBlurred}>{data.user?.email}</p>
			</button>
			<p class="mt-1 text-sm">Click to toggle</p>
		</div>

		<p class="font-semibold">Change your login email address.</p>
		<button
			class="flex w-fit items-center justify-center gap-2 overflow-hidden rounded-lg border-2 border-zinc-400 bg-zinc-200 p-2 font-semibold text-zinc-700 transition-colors hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
			onclick={() => (emailPopupOpen = true)}
		>
			<Pencil size="20" />
			Edit
		</button>
	</div>

	<div class="flex flex-col gap-2">
		<h4 class="text-xl font-semibold">Password</h4>
		<p>Change the password that you use to log in.</p>

		<button
			class="flex w-fit items-center justify-center gap-2 overflow-hidden rounded-lg border-2 border-zinc-400 bg-zinc-200 p-2 font-semibold text-zinc-700 transition-colors hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
			onclick={() => (passwordPopupOpen = true)}
		>
			<Pencil size="20" />
			Edit
		</button>
	</div>

	<div class="flex flex-col gap-2">
		<h4 class="text-xl font-semibold">Reset 2FA</h4>
		<p>Reset your 2FA if you're setting up a new authenticator app.</p>

		<button
			class="flex w-fit items-center justify-center gap-2 overflow-hidden rounded-lg border-2 border-zinc-400 bg-zinc-200 p-2 font-semibold text-zinc-700 transition-colors hover:bg-red-300 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-red-600"
			onclick={() => (reset2FAPopupOpen = true)}
		>
			<RefreshCw size="20" />
			Reset
		</button>
	</div>
</div>
