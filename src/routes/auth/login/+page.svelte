<script lang="ts">
	import { goto } from '$app/navigation';
	import { authClient } from '$lib/client';

	let email = $state('');
	let password = $state('');

	let submitting = $state(false);
	let error = $state('');

	async function handleSignIn(event: Event) {
		event.preventDefault();
		submitting = true;
		error = '';

		try {
			const { data, error: signInError } = await authClient.signIn.email({
				email,
				password
			});

			if (signInError) {
				error = signInError.message || 'Failed to create account';
				return;
			}

			await goto('/auth/verify-2fa');
		} catch (err) {
			error = 'An unexpected error occurred. Please try again.';
		} finally {
			submitting = false;
		}
	}
</script>

<div class="box-border flex h-full min-h-fit w-full items-center justify-center p-2 text-center">
	<form
		class="flex h-fit w-fit flex-col items-center justify-center gap-4 rounded-xl border-2 border-zinc-400 bg-zinc-200 p-4"
		onsubmit={handleSignIn}
	>
		<h1 class="text-2xl font-bold">Sign in</h1>
		<div class="flex flex-col gap-2">
			<label for="name" class="font-semibold">Email</label>
			<input
				class="rounded-full border-2 border-zinc-500 bg-zinc-300 p-2 px-4"
				id="name"
				type="email"
				bind:value={email}
			/>
		</div>

		<div class="flex flex-col gap-2">
			<label for="email" class="font-semibold">Password</label>
			<input
				class="rounded-full border-2 border-zinc-500 bg-zinc-300 p-2 px-4"
				id="email"
				type="password"
				bind:value={password}
			/>
		</div>

		<button
			disabled={submitting}
			class="w-fit rounded-md border-2 border-zinc-500 bg-zinc-300 p-2 px-4"
		>
			{submitting ? 'Logging in...' : 'Log in'}
		</button>
		{#if error !== ''}
			<div class="text-red-700">
				{error}
			</div>
		{/if}
	</form>
</div>
