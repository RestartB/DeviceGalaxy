<script lang="ts">
	import { goto } from '$app/navigation';
	import { authClient } from '$lib/client';

	import { LogIn, LoaderCircle } from '@lucide/svelte';

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
		} catch (err) {
			error = 'An unexpected error occurred. Please try again.';
		} finally {
			submitting = false;
		}
	}
</script>

<div class="box-border flex h-full min-h-fit w-full items-center justify-center text-center">
	<div class="absolute w-full h-full top-0 left-0 -z-10 after:absolute after:w-full after:h-full after:pointer-events-none after:content-[''] after:backdrop-blur-lg after:backdrop-brightness-120 after:top-0 after:left-0" style="background-image: url('https://cdn.stocksnap.io/img-thumbs/960w/building-abstract_QDCJ1JA4QV.jpg')"></div>
	<form
		class="flex h-fit w-full max-w-lg flex-col items-center justify-center gap-4 rounded-xl border-4 border-zinc-700 bg-zinc-100/80 backdrop-blur-lg p-4"
		onsubmit={handleSignIn}
	>
		<h1 class="text-2xl font-bold flex items-center justify-center gap-2"><LogIn /> Sign in</h1>
		<p><strong>Welcome back!</strong> Please enter your credentials.</p>
		<div class="flex flex-col gap-2 w-full">
			<label for="email" class="font-semibold w-full text-start">Email</label>
			<input
				class="rounded-full border-2 border-zinc-500 bg-zinc-200 p-2 px-4 w-full text-start"
				id="email"
				type="email"
				bind:value={email}
			/>
		</div>

		<div class="flex flex-col gap-2 w-full">
			<label for="password" class="font-semibold w-full text-start">Password</label>
			<input
				class="rounded-full border-2 border-zinc-500 bg-zinc-200 p-2 px-4 w-full text-start"
				id="password"
				type="password"
				bind:value={password}
			/>
		</div>

		<a href="/auth/signup" class="text-blue-600 hover:underline">
			Don't have an account? Sign up
		</a>

		<button
			disabled={submitting}
			class="w-fit rounded-md border-2 border-zinc-500 bg-zinc-200 p-2 px-4 flex items-center justify-center gap-2 font-bold cursor-pointer hover:bg-zinc-300 transition-colors"
		>
			{#if submitting}
				<LoaderCircle class="animate-spin" />
			{:else}
				<LogIn />
			{/if}
			{submitting ? 'Logging in...' : 'Log in'}
		</button>
		{#if error !== ''}
			<div class="text-red-700">
				{error}
			</div>
		{/if}
	</form>
</div>
