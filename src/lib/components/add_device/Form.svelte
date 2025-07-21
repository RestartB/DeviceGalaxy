<script lang="ts">
	import { tick } from 'svelte';
	import { fade } from 'svelte/transition';

	import { filesProxy, superForm } from 'sveltekit-superforms';
	import type { SuperValidated, Infer } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { newDeviceSchema } from '$lib/schema/newDevice';
	import { newTagSchema } from '$lib/schema/newTag';

	import type { InferSelectModel } from 'drizzle-orm';
	import type { cpus, gpus, memory, storage, os, brands, tags } from '$lib/server/db/schema';

	import { toast } from 'svelte-sonner';
	import { X, Plus, Trash } from '@lucide/svelte';
	import Field from './Field.svelte';

	import NewTagForm from '$lib/components/add_tag/Form.svelte';

	type CPU = InferSelectModel<typeof cpus>;
	type GPU = InferSelectModel<typeof gpus>;
	type Memory = InferSelectModel<typeof memory>;
	type Storage = InferSelectModel<typeof storage>;
	type OS = InferSelectModel<typeof os>;
	type Brand = InferSelectModel<typeof brands>;
	type Tag = InferSelectModel<typeof tags>;

	export type AttributeLists = {
		cpus: CPU[];
		gpus: GPU[];
		memory: Memory[];
		storage: Storage[];
		os: OS[];
		brands: Brand[];
	};

	let {
		sourceForm,
		newTagForm,
		attributeLists,
		tagList,
		createPopupOpen = $bindable(),
		refreshAll
	}: {
		sourceForm: SuperValidated<Infer<typeof newDeviceSchema>>;
		newTagForm: SuperValidated<Infer<typeof newTagSchema>>;
		attributeLists: AttributeLists;
		tagList: Tag[];
		createPopupOpen: boolean;
		refreshAll: any;
	} = $props();

	const { form, errors, message, enhance, validateForm } = superForm(sourceForm, {
		validators: zod4Client(newDeviceSchema),
		dataType: 'json',
		customValidity: false,
		validationMethod: 'auto',

		onError: (error) => {
			console.error('Form submission error:', error);
			toast.error('Failed to create device. Try again later.');
		}
	});

	const files = filesProxy(form, 'images');

	let formPage = $state(0);
	let tagFormOpen = $state(false);

	let newImgURL = $state('');
	let newImgURLEl: HTMLInputElement | undefined = $state();
	let uploadAllowed = true;

	type FormErrors = typeof $errors;

	let hasErrors = $derived(
		(() => {
			// Check top-level _errors
			if ($errors._errors && $errors._errors.length > 0) return true;

			// Check all form fields (excluding special cases)
			const fieldKeys = Object.keys($errors).filter(
				(key) => !['_errors', 'images', 'imageURLs'].includes(key)
			);
			const hasFieldErrors = fieldKeys.some((key) => $errors[key as keyof FormErrors]);

			if (hasFieldErrors) return true;

			// Check image errors (for uploads)
			if ($errors.images) {
				// Check images._errors
				if ($errors.images._errors && $errors.images._errors.length > 0) return true;

				// Check individual file errors
				const hasFileErrors = Object.entries($errors.images).some(
					([index, fileErrors]) =>
						index !== '_errors' &&
						fileErrors &&
						(Array.isArray(fileErrors) ? fileErrors.length > 0 : Boolean(fileErrors))
				);
				if (hasFileErrors) return true;
			}

			// Check imageURL errors (for URL inputs)
			if ($errors.imageURLs) {
				if ($errors.imageURLs._errors && $errors.imageURLs._errors.length > 0) return true;

				const hasUrlErrors = Object.entries($errors.imageURLs).some(
					([index, urlErrors]) =>
						index !== '_errors' &&
						urlErrors &&
						(Array.isArray(urlErrors) ? urlErrors.length > 0 : Boolean(urlErrors))
				);
				if (hasUrlErrors) return true;
			}

			return false;
		})()
	);

	let imagesHaveErrors = $derived(
		(() => {
			// Check image errors (for uploads)
			if ($errors.images) {
				// Check images._errors
				if ($errors.images._errors && $errors.images._errors.length > 0) return true;

				// Check individual file errors
				const hasFileErrors = Object.entries($errors.images).some(
					([index, fileErrors]) =>
						index !== '_errors' &&
						fileErrors &&
						(Array.isArray(fileErrors) ? fileErrors.length > 0 : Boolean(fileErrors))
				);
				if (hasFileErrors) return true;
			}
		})()
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
			if ($message === 'Device added successfully!') {
				toast.success($message as string);
				refreshAll();

				createPopupOpen = false;
				formPage = 0;
			} else if (typeof $message === 'string' && $message) {
				toast.warning($message);
			}
		}
		$message = null;
	});

	$effect(() => {
		if (formPage === 4) {
			asyncValidateForm();
		}
	});
</script>

<svelte:window
	onkeydown={(event) => {
		if (event.key === 'Escape') {
			createPopupOpen = false;
		}
	}}
/>

{#if createPopupOpen}
	<NewTagForm {refreshAll} sourceForm={newTagForm} bind:createPopupOpen={tagFormOpen} />

	<div
		class="fixed inset-0 z-60 mt-12 flex items-center justify-center overflow-hidden bg-white/60 p-4 backdrop-blur-lg dark:bg-black/60"
		transition:fade={{ duration: 100 }}
	>
		<div
			class="absolute inset-0 z-70"
			onclick={() => (createPopupOpen = false)}
			aria-hidden="true"
		></div>
		<div
			class="z-80 flex max-h-full w-full max-w-lg flex-col overflow-hidden rounded-xl border-4 border-zinc-400 bg-zinc-100 shadow-2xl dark:bg-zinc-800"
		>
			<div class="flex items-center justify-between border-b p-4">
				<h2 class="text-xl font-bold">Create New Device</h2>
				<button
					onclick={() => (createPopupOpen = false)}
					class="cursor-pointer text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-400"
					aria-label="Close"><X /></button
				>
			</div>

			<form
				method="POST"
				class="flex flex-col"
				action="?/newDevice"
				enctype="multipart/form-data"
				use:enhance
			>
				<div class="relative h-110 overflow-hidden">
					<div
						class="absolute inset-0 flex flex-col gap-4 overflow-y-auto p-6 transition-transform duration-300"
						style:transform="translateX({(0 - formPage) * 100}%)"
					>
						<h3 class="text-2xl font-semibold">Basic Information</h3>
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
							name="og:description"
							class="h-24 w-full rounded-lg border p-2"
							bind:value={$form.description}
						></textarea>
						{#if $errors.description}<span class="text-red-600">{$errors.description}</span>{/if}
					</div>

					<div
						class="absolute inset-0 flex flex-col gap-4 overflow-y-auto p-6 transition-transform duration-300"
						style:transform="translateX({(1 - formPage) * 100}%)"
					>
						<h3 class="text-2xl font-semibold">Specifications</h3>

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
							name="GPU"
							errors={$errors.gpu}
							attributes={attributeLists.gpus}
							bind:value={$form.gpu}
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
						<h3 class="text-2xl font-semibold">Tags</h3>
						<p>
							You can select tags to categorise your device. To delete or edit tags, please go to
							the tags page.
						</p>

						<div class="flex flex-wrap gap-2">
							{#each tagList as tag}
								<label class="cursor-pointer">
									<input
										type="checkbox"
										name="tags"
										value={tag.id}
										bind:group={$form.tags}
										class="peer hidden"
									/>
									<span
										class="inline-flex items-center justify-center rounded-full border-2 border-zinc-400
										bg-zinc-100 px-4 py-2 text-zinc-700 transition-all peer-checked:brightness-80
										dark:bg-zinc-800 dark:text-zinc-200 peer-checked:dark:text-white
										dark:peer-checked:brightness-150"
										style={tag.tagColour
											? `background-color: ${tag.tagColour}; color: ${tag.tagTextColour}`
											: ''}
									>
										{tag.tagName}
									</span>
								</label>
							{/each}
							<button
								type="button"
								class="flex h-11 w-11 items-center justify-center rounded-full border-2 border-zinc-400 bg-blue-600 p-2 text-white transition-colors hover:bg-blue-700"
								onclick={() => (tagFormOpen = true)}
							>
								<Plus size="20" />
							</button>
						</div>
					</div>

					<div
						class="absolute inset-0 flex flex-col gap-2 overflow-y-auto p-6 transition-transform duration-300"
						style:transform="translateX({(3 - formPage) * 100}%)"
					>
						{#if uploadAllowed}
							<h3 class="text-2xl font-semibold">Upload Images</h3>
							<p>
								You can upload images of your device here. The first image will also be used for the
								thumbnail. Please ensure that your images comply with the Terms of Service. Max size
								per image: 5MB.
							</p>
							<input
								type="file"
								multiple
								name="images"
								accept="image/png, image/jpeg, image/webp"
								bind:files={$files}
							/>

							{#if imagesHaveErrors}
								<h3 class="text-xl font-semibold">Problems</h3>
								{#if $errors.images?._errors}
									<ul class="text-red-600">
										{#each $errors.images._errors as error}
											<li>{error}</li>
										{/each}
									</ul>
								{/if}

								{#if $errors.images && Object.keys($errors.images).length > 0}
									<ul class="w-full">
										{#each Object.entries($errors.images) as [index, fileErrors]}
											{#if index !== '_errors' && fileErrors}
												<li class="flex w-full justify-center gap-2">
													{#if $files && $files[parseInt(index)] && $files[parseInt(index)].type.startsWith('image/')}
														<img
															src={URL.createObjectURL($files[parseInt(index)])}
															alt={$files[parseInt(index)] && $files[parseInt(index)].name
																? `${$files[parseInt(index)].name} (file ${parseInt(index) + 1})`
																: `File ${parseInt(index) + 1}`}
															class="h-16 w-16 rounded-lg object-cover"
														/>
													{/if}
													<div class="flex-1">
														<p class="font-bold">
															{#if $files[parseInt(index)] && $files[parseInt(index)].name}
																{$files[parseInt(index)].name} (file {parseInt(index) + 1})
															{:else}
																File {parseInt(index) + 1}
															{/if}
														</p>
														<ul>
															{#if Array.isArray(fileErrors)}
																{#each fileErrors as error}
																	<li class="text-red-600">{error}</li>
																{/each}
															{:else}
																<li class="text-red-600">{fileErrors}</li>
															{/if}
														</ul>
													</div>
													<button
														type="button"
														class="cursor-pointer text-red-600 hover:text-red-800"
														onclick={() => {
															files.update((currentFiles) => {
																const newFiles = [...currentFiles];
																newFiles.splice(parseInt(index), 1);
																return newFiles;
															});

															asyncValidateForm();
														}}
													>
														<Trash size="20" />
													</button>
												</li>
											{/if}
										{/each}
									</ul>
								{/if}
							{/if}

							<h3 class="text-xl font-semibold">Allowed Images</h3>
							<p>Click on an image to remove it.</p>
							{#if $files && $files.length > 0}
								<div class="flex flex-wrap gap-2">
									{#each $files as file, index}
										{#if !($errors.images?.[index] && $errors.images[index])}
											<!-- svelte-ignore a11y_click_events_have_key_events -->
											<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
											<img
												src={URL.createObjectURL(file)}
												alt={file.name}
												class="h-32 w-32 cursor-pointer rounded-lg object-cover"
												onclick={() => {
													files.update((currentFiles) => {
														const newFiles = [...currentFiles];
														newFiles.splice(index, 1);
														return newFiles;
													});

													asyncValidateForm();
												}}
											/>
										{/if}
									{/each}
								</div>
							{/if}
						{:else}
							<h3 class="text-2xl font-semibold">Add Images</h3>
							<p>
								Uploading images is disabled on this instance. Instead, you can provide image URLs.
								The first image will be used for the thumbnail.
							</p>

							{#if $errors.imageURLs?._errors}
								<ul class="text-red-600">
									{#each $errors.imageURLs._errors as error}
										<li>{error}</li>
									{/each}
								</ul>
							{/if}

							{#each $form.imageURLs as _, i}
								<div class="flex gap-2">
									<input
										class="flex-1 rounded-lg border p-2"
										type="text"
										name="newImageURLs"
										bind:value={$form.imageURLs[i]}
										placeholder="Enter image URL..."
									/>
									<button
										type="button"
										class="rounded-lg bg-red-500 px-3 py-2 text-white hover:bg-red-600"
										onclick={() => {
											$form.imageURLs = $form.imageURLs.filter((_, idx) => idx !== i);
										}}
									>
										<X size="16" />
									</button>
								</div>
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
						style:transform="translateX({(4 - formPage) * 100}%)"
					>
						<h3 class="text-2xl font-semibold">Confirm Details</h3>
						<div class="rounded-lg bg-zinc-200 p-4 text-sm dark:bg-zinc-700">
							<p class="break-words"><strong>Name:</strong> {$form.deviceName || 'N/A'}</p>
							<p class="break-words"><strong>Description:</strong> {$form.description || 'N/A'}</p>
							<p class="break-words"><strong>Brand:</strong> {$form.brand || 'N/A'}</p>
							<p class="break-words"><strong>CPU:</strong> {$form.cpu || 'N/A'}</p>
							<p class="break-words"><strong>Memory:</strong> {$form.memory || 'N/A'}</p>
							<p class="break-words"><strong>Storage:</strong> {$form.storage || 'N/A'}</p>
							<p class="break-words"><strong>OS:</strong> {$form.os || 'N/A'}</p>
							{#if uploadAllowed}
								{#if $files && $files.length > 0}
									<p><strong>Images:</strong></p>
									{#each $files as file}
										<p class="break-words">{file.name} ({file.size} bytes)</p>
									{/each}
								{:else}
									<p><strong>Images:</strong> None</p>
								{/if}
							{:else if $form.imageURLs && $form.imageURLs.length > 0}
								<p><strong>Images:</strong></p>
								<ul class="list-disc pl-5">
									{#each $form.imageURLs as imageURL}
										<li class="break-words">{imageURL}</li>
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
									{#if uploadAllowed}
										{#if $errors.images}
											{#if $errors.images._errors}
												{#each $errors.images._errors as error}
													<li class="text-red-600 dark:text-red-400">{error}</li>
												{/each}
											{/if}
											{#each Object.entries($errors.images) as [index, fileErrors]}
												{#if index !== '_errors' && fileErrors}
													<li class="text-red-600 dark:text-red-400">
														{#if $files && $files[parseInt(index)] && $files[parseInt(index)].name}
															{$files[parseInt(index)].name} (file {parseInt(index) + 1})
														{:else}
															File {parseInt(index) + 1}
														{/if}:
														{#if Array.isArray(fileErrors)}
															{fileErrors.join(', ')}
														{:else}
															{fileErrors}
														{/if}
													</li>
												{/if}
											{/each}
										{/if}
									{:else if $errors.imageURLs}
										{#each Object.entries($errors.imageURLs) as [index, imageErrors]}
											{#if index !== '_errors' && imageErrors}
												<li class="text-red-600 dark:text-red-400">
													{$form.imageURLs[parseInt(index)]}:
													{#if Array.isArray(imageErrors)}
														{imageErrors.join(', ')}
													{:else}
														{imageErrors}
													{/if}
												</li>
											{/if}
										{/each}
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
						class="cursor-pointer rounded-md border px-4 py-2"
						onclick={() => (formPage = Math.max(formPage - 1, 0))}
						style:visibility={formPage > 0 ? 'visible' : 'hidden'}>Previous</button
					>

					{#if formPage < 4}
						<button
							type="button"
							class="cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
							onclick={() => (formPage = Math.min(formPage + 1, 4))}>Next</button
						>
					{/if}

					{#if formPage === 4}
						<button
							type="submit"
							class="flex-1 cursor-pointer rounded-md bg-green-500 px-4 py-2 font-bold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-green-500"
							disabled={hasErrors}>Create Device</button
						>
					{/if}
				</div>
			</form>
		</div>
	</div>
{/if}
