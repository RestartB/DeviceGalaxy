<script lang="ts">
  import { PUBLIC_TURNSTILE_SITE_KEY, PUBLIC_TURNSTILE_ENABLED } from '$env/static/public';
  import { Turnstile } from 'svelte-turnstile';

  import { tick } from 'svelte';
  import { fade } from 'svelte/transition';

  import { filesProxy, superForm } from 'sveltekit-superforms';
  import type { SuperValidated, Infer } from 'sveltekit-superforms';
  import { zod4Client } from 'sveltekit-superforms/adapters';
  import { editDeviceSchema } from '$lib/schema/editDevice';
  import { newTagSchema } from '$lib/schema/newTag';

  import type { InferSelectModel } from 'drizzle-orm';
  import type { cpus, gpus, memory, storage, os, brands, tags } from '$lib/server/db/schema';

  import { toast } from 'svelte-sonner';
  import { X, Plus } from '@lucide/svelte';

  import Field from './Field.svelte';
  import Submit from '$lib/components/forms/Submit.svelte';
  import NewTagForm from '$lib/components/forms/add_tag/Form.svelte';

  export type AttributeLists = {
    cpus: InferSelectModel<typeof cpus>[];
    gpus: InferSelectModel<typeof gpus>[];
    memory: InferSelectModel<typeof memory>[];
    storage: InferSelectModel<typeof storage>[];
    os: InferSelectModel<typeof os>[];
    brands: InferSelectModel<typeof brands>[];
  };

  let {
    sourceForm,
    newTagForm,
    toEdit,
    attributeLists,
    tagList,
    editPopupOpen = $bindable(),
    refreshAll
  }: {
    sourceForm: SuperValidated<Infer<typeof editDeviceSchema>>;
    newTagForm: SuperValidated<Infer<typeof newTagSchema>>;
    toEdit: any;
    attributeLists: AttributeLists;
    tagList: InferSelectModel<typeof tags>[];
    editPopupOpen: boolean;
    refreshAll: any;
  } = $props();

  let reset = $state<() => void>();

  const {
    form,
    errors,
    allErrors,
    message,
    submitting,
    delayed,
    timeout,
    formId,
    enhance,
    validateForm
  } = superForm(sourceForm, {
    validators: zod4Client(editDeviceSchema),
    dataType: 'json',
    customValidity: false,
    validationMethod: 'auto',
    delayMs: 3000,
    timeoutMs: 30000,

    onError: (error) => {
      console.error('Form submission error:', error);
      toast.error('Failed to update device. Try again later.');
    },

    onUpdated() {
      // When the form is updated, we reset the turnstile
      reset?.();
    }
  });

  const files = filesProxy(form, 'newImages');

  let formPage = $state(0);
  let tagFormOpen = $state(false);

  let newImgURL = $state('');
  let newImgURLEl: HTMLInputElement | undefined = $state();
  let uploadAllowed = true;

  let hasErrors = $derived($allErrors.length > 0);

  let imagesHaveErrors = $derived(
    (() => {
      // Check image errors (for uploads)
      if ($errors.newImages) {
        // Check images._errors
        if ($errors.newImages._errors && $errors.newImages._errors.length > 0) return true;

        // Check individual file errors
        const hasFileErrors = Object.entries($errors.newImages).some(
          ([index, fileErrors]) =>
            index !== '_errors' &&
            fileErrors &&
            (Array.isArray(fileErrors) ? fileErrors.length > 0 : Boolean(fileErrors))
        );
        if (hasFileErrors) return true;
      }
    })()
  );

  $effect(() => {
    if (editPopupOpen && toEdit) {
      $formId = toEdit.id.toString();

      $form.deviceName = toEdit.deviceName;
      $form.description = toEdit.description || undefined;
      $form.additional = toEdit.additional || undefined;

      $form.brand = toEdit.brand || '';
      $form.cpu = toEdit.cpu || '';
      $form.gpu = toEdit.gpu || '';
      $form.memory = toEdit.memory || '';
      $form.storage = toEdit.storage || '';
      $form.os = toEdit.os || '';

      $form.oldImages = toEdit.internalImages || [];
      $form.imageURLs = toEdit.imageURLs || [];

      $form.tags = toEdit.tags?.map((tag: any) => tag.id) || [];
    }
  });

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
      if ($message === 'Device updated successfully!') {
        toast.success($message as string);
        refreshAll();

        editPopupOpen = false;
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

  $effect(() => {
    if (!editPopupOpen) {
      formPage = 0;
    }
  });

  $effect(() => {
    if ($timeout) {
      toast.error('Timed out while editing device. Please try again.');
    }
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
  <NewTagForm {refreshAll} sourceForm={newTagForm} bind:createPopupOpen={tagFormOpen} />

  <div
    class="fixed inset-0 z-60 mt-12 flex items-center justify-center overflow-hidden bg-white/60 p-4 backdrop-blur-lg dark:bg-black/60"
    transition:fade={{ duration: 100 }}
  >
    <div
      class="absolute inset-0 z-70"
      onclick={() => (editPopupOpen = false)}
      aria-hidden="true"
    ></div>
    <div
      class="z-80 flex max-h-full w-full max-w-lg flex-col overflow-hidden rounded-xl border-4 border-zinc-400 bg-zinc-100 shadow-2xl dark:bg-zinc-800"
    >
      <div class="flex items-center justify-between border-b p-4">
        <h2 class="text-xl font-bold">Edit Device</h2>
        <button
          onclick={() => (editPopupOpen = false)}
          class="cursor-pointer text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-400"
          aria-label="Close"><X /></button
        >
      </div>

      <form
        method="POST"
        class="flex flex-col"
        action="/dash/devices?/editDevice"
        enctype="multipart/form-data"
        use:enhance
      >
        <div class="relative h-110 overflow-hidden">
          <div
            class="absolute inset-0 overflow-y-auto p-6 transition-transform duration-300"
            style:transform="translateX({(0 - formPage) * 100}%)"
          >
            <div class="flex flex-col gap-4">
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
                name="description"
                class="min-h-20 w-full rounded-lg border p-2"
                bind:value={$form.description}
              ></textarea>
              {#if $errors.description}<span class="text-red-600">{$errors.description}</span>{/if}
              <div>
                <label for="additional" class="text-sm font-medium">Additional Notes</label>
                <p class="text-sm font-light">
                  Information that only shows in the fullscreen view.
                </p>
              </div>
              <textarea
                id="additional"
                name="additional"
                class="min-h-20 w-full rounded-lg border p-2"
                bind:value={$form.additional}
              ></textarea>
              {#if $errors.additional}<span class="text-red-600">{$errors.additional}</span>{/if}
            </div>
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
            <h3 class="text-2xl font-semibold">Manage Images</h3>

            <!-- Existing Images Section -->
            {#if $form.oldImages && $form.oldImages.length > 0}
              <div>
                <h4 class="text-lg font-semibold">Current Images</h4>
                <p>Click on an image to remove it.</p>
                <div class="flex flex-wrap gap-2">
                  {#each $form.oldImages as image, index}
                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                    <img
                      src="/api/image/device/{$formId}/{image}"
                      alt="Device image {index + 1}"
                      class="h-32 w-32 cursor-pointer rounded-lg object-cover"
                      onclick={() => {
                        $form.oldImages = $form.oldImages.filter((_, idx) => idx !== index);
                        asyncValidateForm();
                      }}
                    />
                  {/each}
                </div>
              </div>
            {/if}

            {#if uploadAllowed}
              <!-- New Images Upload Section -->
              <div>
                <h4 class="text-lg font-semibold">Add New Images</h4>
                <p>Max size per image: 10MB</p>
                <input
                  type="file"
                  multiple
                  name="newImages"
                  accept="image/png, image/jpeg, image/webp"
                  class="file:h-11 file:cursor-pointer file:rounded-full file:border-2 file:border-zinc-400 file:bg-zinc-100 file:px-4 file:py-2 file:text-center file:font-bold file:text-nowrap file:dark:bg-zinc-800"
                  bind:files={$files}
                />

                {#if imagesHaveErrors}
                  <!-- Error handling for new images -->
                  {#if $errors.newImages?._errors}
                    <ul class="text-red-600">
                      {#each $errors.newImages._errors as error}
                        <li>{error}</li>
                      {/each}
                    </ul>
                  {/if}
                  <!-- ... rest of error handling ... -->
                {/if}

                <!-- Preview new images -->
                {#if $files && $files.length > 0}
                  <div class="flex flex-wrap gap-2">
                    {#each $files as file, index}
                      <div class="relative">
                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          class="h-32 w-32 rounded-lg object-cover"
                          onclick={() => {
                            files.update((currentFiles) => {
                              const newFiles = [...currentFiles];
                              newFiles.splice(index, 1);
                              return newFiles;
                            });
                            asyncValidateForm();
                          }}
                        />
                      </div>
                    {/each}
                  </div>
                {/if}
              </div>
            {:else}
              <!-- Image URLs Section -->
              <div>
                <h4 class="text-lg font-semibold">Add Image URLs</h4>

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
                  {#if $errors.imageURLs?.[i]}
                    <span class="text-red-600">{$errors.imageURLs[i]}</span>
                  {/if}
                {/each}

                <input
                  class="w-full rounded-lg border p-2"
                  type="text"
                  placeholder="Enter image URL..."
                  bind:value={newImgURL}
                  bind:this={newImgURLEl}
                  onchange={() => addImageURL()}
                />
              </div>
            {/if}

            <!-- Total image count validation -->
            {#if $errors._errors}
              {#each $errors._errors as error}
                <div class="text-red-600">{error}</div>
              {/each}
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
              <p class="break-words">
                <strong>Additional Notes:</strong>
                {$form.additional || 'N/A'}
              </p>
              <p class="break-words"><strong>Brand:</strong> {$form.brand || 'N/A'}</p>
              <p class="break-words"><strong>CPU:</strong> {$form.cpu || 'N/A'}</p>
              <p class="break-words"><strong>Memory:</strong> {$form.memory || 'N/A'}</p>
              <p class="break-words"><strong>Storage:</strong> {$form.storage || 'N/A'}</p>
              <p class="break-words"><strong>OS:</strong> {$form.os || 'N/A'}</p>
              {#if uploadAllowed}
                {#if $files && $files.length > 0}
                  <p><strong>Images:</strong></p>
                  {#each $files as file}
                    <p class="break-words" translate="no">{file.name} ({file.size} bytes)</p>
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
                  {#if $errors.additional}
                    <li class="text-red-600 dark:text-red-400">{$errors.additional}</li>
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
                    {#if $errors.newImages}
                      {#if $errors.newImages._errors}
                        {#each $errors.newImages._errors as error}
                          <li class="text-red-600 dark:text-red-400">{error}</li>
                        {/each}
                      {/if}
                      {#each Object.entries($errors.newImages) as [index, fileErrors]}
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

            {#if PUBLIC_TURNSTILE_ENABLED.toLowerCase() === 'true'}
              <Turnstile
                siteKey={PUBLIC_TURNSTILE_SITE_KEY}
                theme="auto"
                bind:reset
                on:callback={(event) => {
                  const { token } = event.detail;
                  $form['cf-turnstile-response'] = token;
                }}
              />
            {/if}

            {#if $errors['cf-turnstile-response']}<span class="text-red-600"
                >{$errors['cf-turnstile-response']}</span
              >{/if}

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
              class="cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              onclick={() => (formPage = Math.min(formPage + 1, 4))}>Next</button
            >
          {/if}

          {#if formPage === 4}
            <Submit text="Update Device" {hasErrors} submitting={$submitting} delayed={$delayed} />
          {/if}
        </div>
      </form>
    </div>
  </div>
{/if}
