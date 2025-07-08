<script lang="ts">
	import { fade } from 'svelte/transition';
	import { toast } from 'svelte-sonner';

	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { superForm, fileProxy } from 'sveltekit-superforms/client';
	import { profilePictureSchema } from '$lib/schema/profilePicture.js';

	import { authClient } from '$lib/client';
	import { X, Pencil, RefreshCw, Save } from '@lucide/svelte';
	import Avatar from '$lib/components/Avatar.svelte';

	// Get session from props
	const { data } = $props();

	const { form, message, errors, enhance } = superForm(data.profilePictureForm, {
		validators: zod4Client(profilePictureSchema),
		customValidity: false,
		validationMethod: 'auto',

		onError: (error) => {
			console.error('Form submission error:', error);
			toast.error('Failed to submit profile picture. Try again later.');
		}
	});

	$effect(() => {
		if ($message === 'Updated') {
			window.location.reload();
		}
	});

	const file = fileProxy(form, 'image');

	let emailBlurred = $state(true);

	let emailPopupOpen = $state(false);
	let newEmail = $state(data.user?.email || '');

	let newName = $state(data.user?.name || '');

	async function changeEmail() {
		if (newEmail && newEmail !== data.user?.email) {
			try {
				await authClient.changeEmail({
					newEmail: newEmail
				});

				emailPopupOpen = false;
				window.location.reload();
			} catch (error) {
				toast.error('Failed to update email address. Please try again.');
				console.error('Error updating email:', error);
			}
		}
	}

	async function resetAvatar() {
		try {
			await authClient.updateUser({ image: null });
			window.location.reload();
		} catch (error) {
			toast.error('Failed to reset avatar. Please try again.');
			console.error('Error resetting avatar:', error);
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

<div class="flex flex-col gap-4">
	<h3 class="text-2xl font-bold">Account Settings</h3>

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
		<h4 class="text-xl font-bold">Name</h4>
		<p class="font-semibold">Change your display name.</p>

		<div class="flex items-center gap-2">
			<input
				type="text"
				class="w-full max-w-lg rounded-lg border p-2"
				placeholder={data.user?.name}
				bind:value={newName}
			/>
			{#if newName !== data.user?.name && newName !== ''}
				<button
					class="h-10.5 w-fit overflow-hidden rounded-lg border-2 border-zinc-400 bg-green-200 p-2 font-semibold text-zinc-700 transition-colors hover:bg-green-300 dark:bg-green-700 dark:text-zinc-200 dark:hover:bg-green-600"
					aria-label="Save Name"
					onclick={async () => {
						await authClient.updateUser({ name: newName });
						toast.success('Name updated successfully!');
						window.location.reload();
					}}
				>
					<Save size="20" />
				</button>
				<button
					class="flex h-10.5 w-fit items-center justify-center gap-2 overflow-hidden rounded-lg border-2 border-zinc-400 bg-zinc-200 p-2 font-semibold text-zinc-700 transition-colors hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
					onclick={() => {
						newName = data.user?.name || '';
					}}
				>
					<RefreshCw size="20" />
					Reset
				</button>
			{/if}
		</div>
	</div>

	<div class="flex flex-col gap-2">
		<h4 class="text-xl font-bold">Profile Picture</h4>
		<p class="font-semibold">Edit your profile picture.</p>

		<div class="flex items-center gap-2">
			<Avatar
				size={120}
				src={data.user?.image || ''}
				name={data.user?.name || ''}
				alt="User Avatar"
				className="border-zinc-400"
				textClass="text-6xl"
			/>

			<div class="flex flex-col gap-2">
				<form
					enctype="multipart/form-data"
					action="?/uploadPFP"
					method="POST"
					class="flex flex-col gap-2"
					use:enhance
				>
					<div class="flex gap-2">
						{#if $file?.length > 0}
							<button
								type="submit"
								class="flex h-11 w-11 items-center justify-center rounded-lg border-2 border-zinc-400 bg-green-200 p-2 font-semibold text-zinc-700 transition-colors hover:bg-green-300 dark:bg-green-700 dark:text-zinc-200 dark:hover:bg-green-600"
							>
								<Save size="20" />
							</button>
						{/if}

						<input
							class="file:w-fit file:cursor-pointer file:rounded-lg file:border-2 file:border-zinc-400 file:bg-zinc-200 file:p-2 file:font-semibold file:text-zinc-700 file:transition-colors file:hover:bg-zinc-300 dark:file:bg-zinc-700 dark:file:text-zinc-200 dark:file:hover:bg-zinc-600"
							name="image"
							type="file"
							accept="image/png, image/jpeg, image/webp"
							bind:files={$file}
						/>
					</div>
					{#if $errors.image}
						{#each $errors.image as error}
							<p class="text-sm text-red-500">{error}</p>
						{/each}
					{/if}
					{#if $errors._errors}
						{#each $errors._errors as error}
							<p class="text-sm text-red-500">{error}</p>
						{/each}
					{/if}
				</form>
				{#if data.user?.image && !$errors.image && !$errors._errors}
					<button
						class="w-fit overflow-hidden rounded-lg border-2 border-zinc-400 bg-red-200 p-2 font-semibold text-zinc-700 transition-colors hover:bg-red-300 dark:bg-red-700 dark:text-zinc-200 dark:hover:bg-red-600"
						onclick={resetAvatar}
					>
						Reset Avatar
					</button>
				{/if}
			</div>
		</div>
	</div>
</div>
