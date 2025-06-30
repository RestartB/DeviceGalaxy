<script lang="ts">
	import { goto } from '$app/navigation';
	import { authClient } from '$lib/client';

	import { UserPlus, LoaderCircle } from '@lucide/svelte';

	let fullname = $state('');
	let email = $state('');
	let password = $state('');
	let passwordConfirm = $state('');

	let submitting = $state(false);
	let error = $state('');

	async function handleSignUp(event: Event) {
		event.preventDefault();
		submitting = true;
		error = '';

		try {
			const { data, error: signUpError } = await authClient.signUp.email({
				email,
				password,
				name: fullname
			});

			if (signUpError) {
				error = signUpError.message || 'Failed to create account';
				return;
			}

			await goto('/auth/setup-2fa');
		} catch (err) {
			error = 'An unexpected error occurred. Please try again.';
		} finally {
			submitting = false;
		}
	}
</script>

<div class="box-border flex h-full min-h-fit w-full items-center justify-center text-center">
	<div
		class="absolute top-0 left-0 -z-10 h-full w-full after:pointer-events-none after:absolute after:top-0 after:left-0 after:h-full after:w-full after:backdrop-blur-lg after:backdrop-brightness-120 after:content-['']"
		style="background-image: url('https://cdn.stocksnap.io/img-thumbs/960w/building-abstract_QDCJ1JA4QV.jpg')"
	></div>
	<form
		class="flex h-fit w-full max-w-lg flex-col items-center justify-center gap-4 rounded-xl border-2 border-zinc-700 bg-zinc-100 p-4 backdrop-blur-lg dark:bg-zinc-800/80"
		onsubmit={handleSignUp}
	>
		<h1 class="flex items-center justify-center gap-2 text-2xl font-bold">
			<UserPlus /> Create Account
		</h1>
		<p><strong>Welcome!</strong> Please fill in the details to create your account.</p>

		<div class="flex w-full flex-col gap-2">
			<label for="name" class="w-full text-start font-semibold">Name</label>
			<input
				class="w-full rounded-full border-2 border-zinc-500 bg-zinc-200 p-2 px-4 text-start dark:bg-zinc-700"
				id="name"
				type="text"
				bind:value={fullname}
			/>
		</div>

		<div class="flex w-full flex-col gap-2">
			<label for="email" class="w-full text-start font-semibold">Email</label>
			<input
				class="w-full rounded-full border-2 border-zinc-500 bg-zinc-200 p-2 px-4 text-start dark:bg-zinc-700"
				id="email"
				type="email"
				bind:value={email}
			/>
		</div>

		<div class="flex w-full flex-col gap-2">
			<label for="password" class="w-full text-start font-semibold">Password</label>
			<input
				class="w-full rounded-full border-2 border-zinc-500 bg-zinc-200 p-2 px-4 text-start dark:bg-zinc-700"
				id="password"
				type="password"
				bind:value={password}
			/>
		</div>

		<div class="flex w-full flex-col gap-2">
			<label for="confirm" class="w-full text-start font-semibold">Confirm Password</label>
			<input
				class="w-full rounded-full border-2 border-zinc-500 bg-zinc-200 p-2 px-4 text-start dark:bg-zinc-700"
				id="confirm"
				type="password"
				bind:value={passwordConfirm}
			/>
		</div>

		<a href="/auth/login" class="text-blue-600 hover:underline dark:text-blue-400">
			Already have an account? Log in
		</a>

		<button
			disabled={submitting}
			class="flex w-fit cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-zinc-500 bg-zinc-200 p-2 px-4 font-bold transition-colors hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600"
		>
			{#if submitting}
				<LoaderCircle class="animate-spin" />
			{:else}
				<UserPlus />
			{/if}
			{submitting ? 'Loading...' : 'Sign Up'}
		</button>
		{#if error !== ''}
			<div class="text-red-700">
				{error}
			</div>
		{/if}
	</form>
</div>
