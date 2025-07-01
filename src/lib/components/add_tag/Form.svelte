<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	import { superForm } from 'sveltekit-superforms';
	import type { SuperValidated, Infer } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { newTagSchema } from '$lib/schema/newTag';

	import { toast } from 'svelte-sonner';
	import { X } from '@lucide/svelte';

	type schemaType = typeof newTagSchema;

	let {
		sourceForm,
		createPopupOpen = $bindable(),
		message: parentMessage = $bindable()
	}: {
		sourceForm: SuperValidated<Infer<schemaType>>;
		createPopupOpen: boolean;
		message: any;
	} = $props();

	const { form, errors, message, enhance } = superForm(sourceForm, {
		validators: zod4Client(newTagSchema),
		customValidity: false,
		validationMethod: 'auto',

		onError: (error) => {
			console.error('Form submission error:', error);
			toast.error('Failed to create tag. Try again later.');
		}
	});

	type FormErrors = typeof $errors;

	let hasErrors = $derived(
		Object.keys($errors).some((key) => {
			const typedKey = key as keyof FormErrors;
			return typedKey !== '_errors' && $errors[typedKey];
		}) ||
			($errors._errors && $errors._errors.length > 0)
	);

	$effect(() => {
		if ($message) {
			parentMessage = $message;
		}
	});

	onMount(() => {
		document.addEventListener('keydown', (event) => {
			if (event.key === 'Escape') {
				createPopupOpen = false;
			}
		});
	});
</script>

{#if createPopupOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-white/60 p-4 backdrop-blur-lg dark:bg-black/60"
		transition:fade={{ duration: 100 }}
	>
		<div
			class="flex w-full max-w-lg flex-col overflow-hidden rounded-xl border-4 border-zinc-400 bg-zinc-100 shadow-2xl dark:bg-zinc-800"
		>
			<div class="flex items-center justify-between border-b p-4">
				<h2 class="text-xl font-bold">Create New Device</h2>
				<button
					onclick={() => (createPopupOpen = false)}
					class="cursor-pointer text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-400"
					><X /></button
				>
			</div>

			<form method="POST" class="flex flex-col" action="?/addTag" use:enhance>
				<label for="tagName" class="text-sm font-medium">Tag Name</label>
				<input
					type="text"
					id="tagName"
					name="tagName"
					class="w-full rounded-lg border p-2"
					bind:value={$form.tagName}
				/>
				{#if $errors.tagName}<span class="text-red-600">{$errors.tagName}</span>{/if}

				<label for="tagColour" class="text-sm font-medium">Tag Colour</label>
				<p class="text-sm text-zinc-400">Leave empty to use default colour.</p>
				<input
					id="tagColour"
					name="tagColour"
					type="color"
					class="h-24 w-full rounded-lg border p-2"
					bind:value={$form.colour}
				/>
				{#if $errors.colour}<span class="text-red-600">{$errors.colour}</span>{/if}

				<label for="tagTextColour" class="text-sm font-medium">Tag Text Colour</label>
				<p class="text-sm text-zinc-400">Leave empty to use default colour.</p>
				<input
					id="tagTextColour"
					name="tagTextColour"
					type="color"
					class="h-24 w-full rounded-lg border p-2"
					bind:value={$form.textColour}
				/>
				{#if $errors.textColour}<span class="text-red-600">{$errors.textColour}</span>{/if}

				<div class="border-t p-4">
					<button
						type="submit"
						class="w-full cursor-pointer rounded-md bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-green-500"
						disabled={hasErrors}>Create Tag</button
					>
				</div>
			</form>
		</div>
	</div>
{/if}
