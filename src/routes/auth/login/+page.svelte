<script lang="ts">
	import { goto } from '$app/navigation';

	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { logInSchema } from '$lib/schema/logIn';

	import { LogIn } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';

	const { data } = $props();

	const { form, errors, message, enhance } = superForm(data.logInForm, {
		validators: zod4Client(logInSchema),
		customValidity: false,
		validationMethod: 'auto',

		onError: (error) => {
			console.error('Form submission error:', error);
			toast.error('Failed to log in. Try again later.');
		}
	});

	$effect(() => {
		if ($message === 'User logged in successfully') {
			toast.success('Logged in! Redirecting...');
			setTimeout(() => {
				goto('/');
			}, 2000);
		} else if ($message) {
			toast.error($message);
		}
	});
</script>

<div class="box-border flex h-full min-h-fit w-full items-center justify-center text-center">
	<div
		class="absolute top-0 left-0 -z-10 h-full w-full after:pointer-events-none after:absolute after:top-0 after:left-0 after:h-full after:w-full after:backdrop-blur-lg after:backdrop-brightness-120 after:content-['']"
		style="background-image: url('https://cdn.stocksnap.io/img-thumbs/960w/building-abstract_QDCJ1JA4QV.jpg')"
	></div>
	<form
		class="flex h-fit w-full max-w-lg flex-col items-center justify-center gap-4 rounded-xl border-4 border-zinc-700 bg-zinc-100 p-4 backdrop-blur-lg dark:bg-zinc-800/80"
		action="?/logIn"
		method="POST"
		use:enhance
	>
		<h1 class="flex items-center justify-center gap-2 text-2xl font-bold"><LogIn /> Sign in</h1>
		<p><strong>Welcome back!</strong> Please enter your credentials.</p>
		<div class="flex w-full flex-col gap-2">
			<label for="email" class="w-full text-start font-semibold">Email</label>
			<input
				class="w-full rounded-full border-2 border-zinc-500 bg-zinc-200 p-2 px-4 text-start dark:bg-zinc-700"
				name="email"
				id="email"
				type="email"
				bind:value={$form.email}
			/>
			{#if $errors.email}<span class="text-red-600">{$errors.email}</span>{/if}
		</div>

		<div class="flex w-full flex-col gap-2">
			<label for="password" class="w-full text-start font-semibold">Password</label>
			<input
				class="w-full rounded-full border-2 border-zinc-500 bg-zinc-200 p-2 px-4 text-start dark:bg-zinc-700"
				name="password"
				id="password"
				type="password"
				bind:value={$form.password}
			/>
			{#if $errors.password}<span class="text-red-600">{$errors.password}</span>{/if}
		</div>

		<a href="/auth/signup" class="text-blue-600 hover:underline dark:text-blue-400">
			Don't have an account? Sign up
		</a>

		<button
			class="flex w-fit cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-zinc-500 bg-zinc-200 p-2 px-4 font-bold transition-colors hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600"
		>
			<LogIn />
			Log in
		</button>
		{#if $errors._errors && $errors._errors.length > 0}
			{#each $errors._errors as error}
				<div class="text-red-700">
					{error}
				</div>
			{/each}
		{/if}
	</form>
</div>
