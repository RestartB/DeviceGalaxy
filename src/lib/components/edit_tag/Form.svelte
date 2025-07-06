<script lang="ts">
	import { fade } from 'svelte/transition';

	import { superForm } from 'sveltekit-superforms';
	import type { SuperValidated, Infer } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { newTagSchema } from '$lib/schema/newTag';

	import type { InferSelectModel } from 'drizzle-orm';
	import type { tags } from '$lib/server/db/schema';

	import { toast } from 'svelte-sonner';
	import { X } from '@lucide/svelte';

	type schemaType = typeof newTagSchema;

	let {
		sourceForm,
		editPopupOpen = $bindable(),
		refreshAll,
		tag
	}: {
		sourceForm: SuperValidated<Infer<schemaType>>;
		editPopupOpen: boolean;
		refreshAll: any;
		tag: InferSelectModel<typeof tags> | undefined;
	} = $props();

	const { form, errors, message, formId, enhance } = superForm(sourceForm, {
		validators: zod4Client(newTagSchema),
		customValidity: false,
		validationMethod: 'auto',

		onError: (error) => {
			console.error('Form submission error:', error);
			toast.error('Failed to edit tag. Try again later.');
		}
	});

	$effect(() => {
		if (editPopupOpen && tag) {
			$form.tagName = tag.tagName;
			$form.colourEnabled = !!tag.tagColour;
			$form.colour = tag.tagColour ? tag.tagColour : '#ffffff';
			$formId = tag.id.toString();
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
			if ($message === 'Tag updated successfully!') {
				toast.success($message as string);
				refreshAll();
				editPopupOpen = false;
			} else if (typeof $message === 'string' && $message) {
				toast.warning($message);
			}
		}
		$message = null;
	});
</script>

<svelte:window
	onkeydown={(event) => {
		if (event.key === 'Escape') {
			editPopupOpen = false;
		}
	}}
/>

{#if editPopupOpen}
	<div
		class="fixed inset-0 z-60 flex items-center justify-center bg-white/60 p-4 backdrop-blur-lg dark:bg-black/60"
		transition:fade={{ duration: 100 }}
	>
		<div
			class="absolute inset-0 z-70"
			onclick={() => (editPopupOpen = false)}
			aria-hidden="true"
		></div>

		<div
			class="z-80 flex w-full max-w-lg flex-col overflow-hidden rounded-xl border-4 border-zinc-400 bg-zinc-100 shadow-2xl dark:bg-zinc-800"
		>
			<div class="flex items-center justify-between border-b p-4">
				<h2 class="text-xl font-bold">Edit Tag</h2>
				<button
					onclick={() => (editPopupOpen = false)}
					class="cursor-pointer text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-400"
					aria-label="Close"><X /></button
				>
			</div>

			<form method="POST" class="flex flex-col" action="/tags?/editTag" use:enhance>
				<input type="hidden" name="__superform_id" bind:value={$formId} />
				<div class="flex flex-col gap-4 p-6">
					<label for="tagName" class="text-sm font-medium">Tag Name</label>
					<input
						type="text"
						id="tagName"
						name="tagName"
						class="w-full rounded-lg border p-2"
						bind:value={$form.tagName}
					/>
					{#if $errors.tagName}<span class="text-red-600">{$errors.tagName}</span>{/if}

					<div class="flex items-center justify-between gap-4">
						<div>
							<label for="colourEnabled" class="text-sm font-medium">Custom Colour</label>
							<p class="text-sm text-zinc-400">
								To set a custom colour, check the box to the right.
							</p>
						</div>
						<input
							type="checkbox"
							id="colourEnabled"
							name="colourEnabled"
							class="h-6 w-6 cursor-pointer rounded-lg border p-2"
							bind:checked={$form.colourEnabled}
						/>
					</div>
					{#if $errors.colourEnabled}<span class="text-red-600">{$errors.colourEnabled}</span>{/if}

					{#if $form.colourEnabled}
						<div>
							<label for="tagColour" class="text-sm font-medium">Tag Colour</label>
							<p class="text-sm text-zinc-400">
								Select a custom colour to be used for the tag's background. We will automatically
								decide the text colour based on the background colour you select.
							</p>
						</div>
						<input
							id="tagColour"
							name="colour"
							type="color"
							class="h-24 w-full rounded-lg border"
							bind:value={$form.colour}
						/>
						{#if $errors.colour}<span class="text-red-600">{$errors.colour}</span>{/if}
					{/if}
				</div>
				<div class="border-t p-6">
					<button
						type="submit"
						class="w-full cursor-pointer rounded-md bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-green-500"
						disabled={hasErrors}>Edit Tag</button
					>
				</div>
			</form>
		</div>
	</div>
{/if}
