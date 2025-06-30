<script lang="ts">
	import { tick, onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	import { superForm } from 'sveltekit-superforms';
	import type { SuperValidated, Infer } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { schema } from '../../../routes/devices/schema';

	import type { InferSelectModel } from 'drizzle-orm';
	import type { cpus, memory, storage, os, brands } from '$lib/server/db/schema';

	import { toast } from 'svelte-sonner';
	import { X } from '@lucide/svelte';
	import Field from './Field.svelte';

	type schemaType = typeof schema;
	type CPU = InferSelectModel<typeof cpus>;
	type Memory = InferSelectModel<typeof memory>;
	type Storage = InferSelectModel<typeof storage>;
	type OS = InferSelectModel<typeof os>;
	type Brand = InferSelectModel<typeof brands>;

	export type AttributeLists = {
		cpus: CPU[];
		memory: Memory[];
		storage: Storage[];
		os: OS[];
		brands: Brand[];
	};

	let {
		sourceForm,
		attributeLists,
		createPopupOpen = $bindable(),
		message: parentMessage = $bindable()
	}: {
		sourceForm: SuperValidated<Infer<schemaType>>;
		attributeLists: AttributeLists;
		createPopupOpen: boolean;
		message: any;
	} = $props();

	const { form, errors, message, enhance, validateForm } = superForm(sourceForm, {
		validators: zod4Client(schema),
		customValidity: false,
		validationMethod: 'auto',

		onError: (error) => {
			console.error('Form submission error:', error);
			toast.error('Failed to create device. Try again later.');
		}
	});

	let formPage = $state(0);
	let newImgURL = $state('');
	let uploadAllowed = false;
	let newImgURLEl: HTMLInputElement | undefined = $state();
	type FormErrors = typeof $errors;

	let hasErrors = $derived(
		Object.keys($errors).some((key) => {
			const typedKey = key as keyof FormErrors;
			return typedKey !== '_errors' && $errors[typedKey];
		}) ||
			($errors._errors && $errors._errors.length > 0)
	);

	async function asyncValidateForm() {
		await validateForm({ update: true });
	}

	async function addImageURL() {
		if (!newImgURL) return;
		if (!$form.imageURLs) $form.imageURLs = [];
		$form.imageURLs = [...$form.imageURLs, newImgURL];

		await tick();
		setTimeout(() => (newImgURL = ''), 1);
	}

	$effect(() => {
		if ($message) {
			parentMessage = $message;
		}
	});

	$effect(() => {
		if (formPage === 2) {
			asyncValidateForm();
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

			<form method="POST" class="flex flex-col" use:enhance>
				<div class="relative h-110 overflow-hidden">
					<div
						class="absolute inset-0 flex flex-col gap-4 overflow-y-auto p-6 transition-transform duration-300"
						style:transform="translateX({(0 - formPage) * 100}%)"
					>
						<h3 class="text-xl font-semibold">Basic Information</h3>
						<label for="deviceName" class="text-sm font-medium">Device Name</label>
						<input
							type="text"
							id="deviceName"
							name="deviceName"
							class="w-full rounded-lg border p-2"
							bind:value={$form.deviceName}
						/>
						{#if $errors.deviceName}<span class="text-red-600">{$errors.deviceName}</span>{/if}
						<label for="description" class="text-sm font-medium">Description</label>
						<textarea
							id="description"
							name="description"
							class="h-24 w-full rounded-lg border p-2"
							bind:value={$form.description}
						></textarea>
						{#if $errors.description}<span class="text-red-600">{$errors.description}</span>{/if}
					</div>

					<div
						class="absolute inset-0 flex flex-col gap-4 overflow-y-auto p-6 transition-transform duration-300"
						style:transform="translateX({(1 - formPage) * 100}%)"
					>
						<h3 class="text-xl font-semibold">Specifications</h3>

						<Field
							name="Brand"
							errors={$errors.brand}
							attributes={attributeLists.brands}
							bind:value={$form.brand}
						/>
						<Field
							name="CPU"
							errors={$errors.cpu}
							attributes={attributeLists.cpus}
							bind:value={$form.cpu}
						/>
						<Field
							name="Memory"
							errors={$errors.memory}
							attributes={attributeLists.memory}
							bind:value={$form.memory}
						/>
						<Field
							name="Storage"
							errors={$errors.storage}
							attributes={attributeLists.storage}
							bind:value={$form.storage}
						/>
						<Field
							name="OS"
							errors={$errors.os}
							attributes={attributeLists.os}
							bind:value={$form.os}
						/>
					</div>

					<div
						class="absolute inset-0 flex flex-col gap-2 overflow-y-auto p-6 transition-transform duration-300"
						style:transform="translateX({(2 - formPage) * 100}%)"
					>
						{#if uploadAllowed}
							<h3 class="text-xl font-semibold">Upload Images</h3>
							<p>
								You can upload images of your device here. The first image will also be used for the
								thumbnail. Please ensure that your images comply with the Terms of Service. Max
								size: 5MB.
							</p>
						{:else}
							<h3 class="text-xl font-semibold">Add Images</h3>
							<p>
								Uploading images is disabled on this instance. Instead, you can provide image URLs.
								The first image will be used for the thumbnail.
							</p>

							{#each $form.imageURLs as _, i}
								<input
									class="w-full rounded-lg border p-2"
									type="text"
									name="imageURLs"
									bind:value={$form.imageURLs[i]}
								/>
								{#if $errors.imageURLs?.[i]}<span class="text-red-600">{$errors.imageURLs[i]}</span
									>{/if}
							{/each}

							<input
								class="w-full rounded-lg border p-2"
								type="text"
								placeholder="Enter image URL..."
								bind:value={newImgURL}
								bind:this={newImgURLEl}
								onchange={() => addImageURL()}
							/>

							{#if newImgURL}
								<input
									class="w-full rounded-lg border p-2"
									type="text"
									placeholder="Enter image URL..."
									onfocus={() => newImgURLEl?.focus()}
								/>
							{/if}
						{/if}
					</div>

					<div
						class="absolute inset-0 flex flex-col gap-2 overflow-y-auto p-6 transition-transform duration-300"
						style:transform="translateX({(3 - formPage) * 100}%)"
					>
						<h3 class="text-xl font-semibold">Confirm Details</h3>
						<div class="rounded-lg bg-zinc-200 p-4 text-sm dark:bg-zinc-700">
							<p><strong>Name:</strong> {$form.deviceName || 'N/A'}</p>
							<p><strong>Description:</strong> {$form.description || 'N/A'}</p>
							<p><strong>Brand:</strong> {$form.brand || 'N/A'}</p>
							<p><strong>CPU:</strong> {$form.cpu || 'N/A'}</p>
							<p><strong>Memory:</strong> {$form.memory || 'N/A'}</p>
							<p><strong>Storage:</strong> {$form.storage || 'N/A'}</p>
							<p><strong>OS:</strong> {$form.os || 'N/A'}</p>
							{#if $form.imageURLs && $form.imageURLs.length > 0}
								<p><strong>Images:</strong></p>
								<ul class="list-disc pl-5">
									{#each $form.imageURLs as imageURL}
										<li>{imageURL}</li>
									{/each}
								</ul>
							{:else}
								<p><strong>Images:</strong> None</p>
							{/if}
						</div>
						{#if hasErrors}
							<div class="rounded-lg bg-zinc-200 p-4 text-sm dark:bg-zinc-700">
								<h3 class="font-semibold">Errors</h3>
								<ul class="list-disc pl-5">
									{#if $errors.deviceName}
										<li class="text-red-600 dark:text-red-400">{$errors.deviceName}</li>
									{/if}
									{#if $errors.description}
										<li class="text-red-600 dark:text-red-400">{$errors.description}</li>
									{/if}
									{#if $errors.brand}
										<li class="text-red-600 dark:text-red-400">{$errors.brand}</li>
									{/if}
									{#if $errors.cpu}
										<li class="text-red-600 dark:text-red-400">{$errors.cpu}</li>
									{/if}
									{#if $errors.memory}
										<li class="text-red-600 dark:text-red-400">{$errors.memory}</li>
									{/if}
									{#if $errors.storage}
										<li class="text-red-600 dark:text-red-400">{$errors.storage}</li>
									{/if}
									{#if $errors.os}
										<li class="text-red-600 dark:text-red-400">{$errors.os}</li>
									{/if}
									{#if $errors._errors}
										{#each $errors._errors as error}
											<li class="text-red-600 dark:text-red-400">{error}</li>
										{/each}
									{/if}
								</ul>
							</div>
						{/if}
						<p class="mt-auto text-base text-zinc-500">
							Once you're happy with the details above, click below to create.
						</p>
					</div>
				</div>

				<div class="flex items-center justify-between gap-4 border-t p-4">
					<button
						type="button"
						class="cursor-pointer rounded-md border bg-zinc-50 px-4 py-2 dark:bg-zinc-950"
						onclick={() => (formPage = Math.max(formPage - 1, 0))}
						style:visibility={formPage > 0 ? 'visible' : 'hidden'}>Previous</button
					>

					{#if formPage < 3}
						<button
							type="button"
							class="cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-white"
							onclick={() => (formPage = Math.min(formPage + 1, 3))}>Next</button
						>
					{/if}

					{#if formPage === 3}
						<button
							type="submit"
							class="flex-1 cursor-pointer rounded-md bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-green-500"
							disabled={hasErrors}>Create Device</button
						>
					{/if}
				</div>
			</form>
		</div>
	</div>
{/if}
