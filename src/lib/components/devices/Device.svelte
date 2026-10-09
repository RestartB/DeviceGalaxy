<script lang="ts">
  import { fade } from 'svelte/transition';

  import { createDevice } from '#lib/remote/devices.remote.js';

  import FullscreenOverlay from '#lib/components/ui/FullscreenOverlay.svelte';
  import SelectSpecField from '#lib/components/specs/SelectSpecField.svelte';
  import SelectSpec from '#lib/components/specs/SelectSpec.svelte';
  import Button from '#lib/components/ui/inputs/Button.svelte';
  import {
    Save,
    Upload,
    Trash,
    Pencil,
    Laptop,
    Plus,
    X,
    CircleAlert,
    Expand,
    ChevronLeft,
    ChevronRight
  } from '@lucide/svelte';

  import { deviceSchema } from '#lib/schema/device.js';
  import type { specificationField, specificationValue } from '#lib/server/db/schema.js';
  import type { SpecValueSchema } from '#lib/schema/spec.js';
  import type { DeviceWithSpecifications } from '#lib/types/devices.js';

  type SpecificationFieldWithValues = typeof specificationField.$inferSelect & {
    values: (typeof specificationValue.$inferSelect)[];
  };

  let {
    specFields,
    existingDevice,
    overlayOpen = $bindable(),
    onClose = () => (overlayOpen = false)
  }: {
    specFields: SpecificationFieldWithValues[];
    existingDevice?: DeviceWithSpecifications | undefined;
    overlayOpen: boolean;
    onClose?: () => void;
  } = $props();

  let specFieldOverlayOpen = $state(false);
  let specOverlayOpen = $state(false);
  let activeSpec: SpecValueSchema | undefined = $state();

  let form: typeof createDevice | undefined = $derived(existingDevice ? undefined : createDevice);
  let fileInput: HTMLInputElement | undefined = $state();
  let files: File[] = $derived(
    (form?.fields.images.value() ?? []).filter((file): file is File => file !== undefined)
  );

  let errorOverlayOpen = $state(false);
  let errorMessage = $state(
    'An error occurred while submitting the data. Please try again in a moment.'
  );

  let imageOverlayOpen = $state(false);
  let imageIndex = $state(0);
  let renderedImageWidth = $state(0);

  function imagePreview(node: HTMLImageElement, file: File) {
    let url: string;

    function show(nextFile: File) {
      if (url) URL.revokeObjectURL(url);
      url = URL.createObjectURL(nextFile);
      node.src = url;
    }

    show(file);

    return {
      update: show,
      destroy() {
        URL.revokeObjectURL(url);
      }
    };
  }

  function addSpecField(id: string) {
    if (!form) {
      return;
    }

    const specs = form.fields.specs.value() || [];
    specs.push({ uuid: crypto.randomUUID(), fieldId: id });
    form.fields.specs.set(specs);
  }

  function addSpecValue(id: string) {
    if (!form || !activeSpec) {
      return;
    }

    const specs = form.fields.specs.value() || [];
    const index = specs.indexOf(specs.find((sp) => sp?.uuid == activeSpec?.uuid));
    if (index === -1) {
      return;
    }

    const newSpec = activeSpec;
    newSpec.valueId = id;

    specs.splice(index, 1, newSpec);
    form.fields.specs.set(specs);
  }
</script>

<svelte:window
  onkeyup={(e) => {
    if (!imageOverlayOpen || !existingDevice) {
      return;
    }

    if (e.key === 'ArrowLeft') {
      imageIndex = Math.max(0, imageIndex - 1);
    } else if (e.key === 'ArrowRight') {
      imageIndex = Math.min(existingDevice.images.length - 1, imageIndex + 1);
    } else if (e.key === 'Escape') {
      imageOverlayOpen = false;
    }
  }}
/>

{#if specFieldOverlayOpen}
  <SelectSpecField
    fields={specFields}
    onSelect={addSpecField}
    bind:overlayOpen={specFieldOverlayOpen}
  />
{/if}

{#if specOverlayOpen && activeSpec}
  {@const selectedSpec = specFields.find((sp) => sp.id === activeSpec?.fieldId)}
  {#if selectedSpec}
    <SelectSpec
      fieldId={activeSpec.fieldId}
      values={selectedSpec.values}
      onSelect={addSpecValue}
      bind:overlayOpen={specOverlayOpen}
    />
  {/if}
{/if}

{#if errorOverlayOpen}
  <FullscreenOverlay
    title="Error"
    Icon={CircleAlert}
    zIndex={60}
    bind:overlayOpen={errorOverlayOpen}
  >
    <p>{errorMessage}</p>
  </FullscreenOverlay>
{/if}

{#if imageOverlayOpen && existingDevice}
  <div
    class="fixed inset-0 isolate flex flex-col items-center justify-center overflow-hidden bg-white/60 p-4 backdrop-blur-lg dark:bg-black/60"
    style="z-index: 100"
    transition:fade|global={{ duration: 100 }}
  >
    <div
      class="absolute inset-0 -z-10"
      onclick={() => (imageOverlayOpen = false)}
      aria-hidden="true"
    ></div>

    <div class="flex h-full min-h-0 w-full flex-col items-center justify-center gap-2">
      <div
        class="flex shrink-0 items-center gap-2"
        style:width={renderedImageWidth ? `${renderedImageWidth}px` : undefined}
      >
        {#if existingDevice.images.length > 1}
          <button
            type="button"
            aria-label="Previous image"
            class="flex cursor-pointer items-center justify-center rounded-full border border-zinc-300 bg-zinc-200 p-1 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800"
            disabled={imageIndex === 0}
            onclick={() => (imageIndex -= 1)}
          >
            <ChevronLeft />
          </button>

          <button
            type="button"
            aria-label="Next image"
            class="flex cursor-pointer items-center justify-center rounded-full border border-zinc-300 bg-zinc-200 p-1 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800"
            disabled={imageIndex === existingDevice.images.length - 1}
            onclick={() => (imageIndex += 1)}
          >
            <ChevronRight />
          </button>
        {/if}

        <button
          type="button"
          aria-label="Close image"
          class="ml-auto flex cursor-pointer items-center justify-center rounded-full border border-zinc-300 bg-zinc-200 p-1 dark:border-zinc-700 dark:bg-zinc-800"
          onclick={() => (imageOverlayOpen = false)}
        >
          <X />
        </button>
      </div>

      <img
        bind:clientWidth={renderedImageWidth}
        class="block max-h-full min-h-0 w-auto max-w-full shrink object-contain"
        src="/api/v1/image/device/{existingDevice.id}/{existingDevice.images[imageIndex]}"
        alt="Fullscreen view"
      />
    </div>
  </div>
{/if}

{#snippet extraButton()}
  <button
    class="flex h-8 w-fit shrink-0 cursor-pointer items-center justify-center gap-1 rounded-full bg-zinc-200 px-3 text-zinc-500 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-600"
    type={form ? 'submit' : 'button'}
    aria-label={existingDevice ? 'Save' : 'Create'}
  >
    {#if existingDevice && form}
      <Save size={20} />
    {:else}
      <Pencil size={20} />
    {/if}
    {existingDevice ? (form ? 'Save' : 'Edit') : 'Create'}
  </button>
{/snippet}

{#if form}
  <form
    {...form.preflight(deviceSchema).enhance(async (form) => {
      try {
        form.validate({ preflightOnly: true });
        if (!(await form.submit()) || !form.result || !form.result.success) {
          return;
        }

        form.element.reset();
        overlayOpen = false;
      } catch (error) {
        console.error(error);
        errorMessage = String(error);
        errorOverlayOpen = true;
      }
    })}
    enctype="multipart/form-data"
  >
    <FullscreenOverlay
      bind:overlayOpen
      width={1200}
      height={1000}
      gap={12}
      title={existingDevice ? 'Edit Device' : 'Create Device'}
      Icon={existingDevice ? Laptop : Pencil}
      {onClose}
      {extraButton}
    >
      <input
        class="w-full text-3xl outline-0"
        placeholder="Enter title..."
        {...form.fields.name.as('text')}
      />

      {#each form.fields.name.issues() as issue (issue.message)}
        <p class="text-red-600">{issue.message}</p>
      {/each}

      <textarea
        class="h-8 min-h-8 w-full"
        placeholder="Enter description..."
        {...form.fields.description.as('text')}></textarea>

      {#each form.fields.description.issues() as issue (issue.message)}
        <p class="text-red-600">{issue.message}</p>
      {/each}

      <h3 class="font-semibold">Specs</h3>

      <ul class="space-y-2">
        <li>
          <button
            title="Add specification field..."
            class="flex w-full cursor-pointer items-center gap-4 rounded-lg border border-zinc-300 bg-zinc-200 p-4 text-center transition-colors hover:bg-zinc-300 dark:border-zinc-600 dark:bg-zinc-700 hover:dark:bg-zinc-600"
            type="button"
            onclick={() => (specFieldOverlayOpen = true)}
          >
            <Plus />
            <div class="text-start">
              <p class="font-bold">Add specification field...</p>
              <p class="text-base text-zinc-900/70 dark:text-zinc-100/70">
                CPU, GPU, RAM, custom field, etc
              </p>
            </div>
          </button>
        </li>

        {#each form.fields.specs.value() as spec, index (spec?.uuid)}
          {@const matchedSpec = specFields.find((sp) => sp.id === spec?.fieldId)}
          {#if spec?.uuid && spec.fieldId && matchedSpec}
            <input {...form.fields.specs[index].uuid.as('hidden', spec.uuid)} />
            <input {...form.fields.specs[index].fieldId.as('hidden', spec.fieldId)} />
            {#if spec.valueId}
              <input {...form.fields.specs[index].valueId.as('hidden', spec.valueId)} />
            {/if}

            <li
              class="flex w-full items-center justify-between rounded-lg border border-zinc-200 p-4 dark:border-zinc-700"
            >
              <div>
                <p class="mb-2 text-base font-bold text-zinc-900/70 dark:text-zinc-100/70">
                  {matchedSpec.name}
                </p>

                <Button
                  title="Select specification value"
                  class="bg-zinc-200! hover:bg-zinc-100 dark:bg-zinc-700! dark:hover:bg-zinc-600!"
                  smallPadding={true}
                  border={false}
                  onclick={() => {
                    const { uuid, fieldId, valueId } = spec;
                    if (!uuid || !fieldId) {
                      return;
                    }

                    activeSpec = {
                      uuid,
                      fieldId,
                      valueId
                    };
                    specOverlayOpen = true;
                  }}
                >
                  {#if spec.valueId}
                    {@const matchedValue = matchedSpec.values.find(
                      (val) => val.id === spec.valueId
                    )}
                    {#if matchedValue}
                      <p>{matchedValue.value}</p>
                    {:else}
                      <p class="text-red-500 dark:text-red-300">Unknown Value</p>
                    {/if}
                  {:else}
                    <p>Select a value...</p>
                  {/if}
                </Button>
              </div>

              <Button
                title="Remove spec"
                class="h-10 min-w-10 bg-zinc-200! hover:bg-zinc-100 dark:bg-zinc-700! dark:hover:bg-zinc-600!"
                border={false}
                disablePadding={true}
                onclick={() => {
                  form.fields.specs.set(
                    form.fields.specs.value().filter((sp) => sp?.uuid !== spec.uuid)
                  );
                }}
              >
                <X />
              </Button>
            </li>
          {/if}
        {/each}
      </ul>

      <h3 class="font-semibold">Images</h3>

      <input
        bind:this={fileInput}
        {...form.fields.images.as('file multiple')}
        accept="image/*"
        class="hidden"
      />

      <div class="flex flex-wrap items-center gap-2">
        <button
          class="flex h-44 w-60 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-zinc-200 p-4 text-center transition-colors hover:bg-zinc-300 dark:border-zinc-600 dark:bg-zinc-700 dark:hover:bg-zinc-600"
          type="button"
          onclick={() => fileInput?.click()}
        >
          <div class="flex h-12 w-12 items-center justify-center">
            <Upload />
          </div>
          <p class="font-bold">Upload image</p>
          <p class="text-zinc-900/70 dark:text-zinc-100/70">Max 5MB per image</p>
        </button>

        <!-- eslint-disable-next-line svelte/require-each-key -->
        {#each files as file}
          <div
            class="relative isolate overflow-hidden rounded-lg border-zinc-200 dark:border-zinc-700"
          >
            <button
              class="absolute inset-0 z-10 flex cursor-pointer items-center justify-center bg-white/70 opacity-0 transition-opacity hover:opacity-100 dark:bg-black/70"
              type="button"
              onclick={() => {
                files.splice(files.indexOf(file), 1);
                form.fields.images.set(files);
              }}
            >
              <Trash />
            </button>

            <img use:imagePreview={file} alt={file.name} class="h-44 w-auto" />
          </div>
        {/each}
      </div>

      {#each form.fields.images.issues() as issue (issue.message)}
        <p class="text-red-600">{issue.message}</p>
      {/each}

      {#each files as _, index (index)}
        {#each form.fields.images[index].issues() as issue (issue.message)}
          <p class="text-red-600">File {index + 1}: {issue.message}</p>
        {/each}
      {/each}
    </FullscreenOverlay>
  </form>
{:else if existingDevice}
  <FullscreenOverlay
    bind:overlayOpen
    width={1200}
    height={1000}
    gap={12}
    title={existingDevice.name}
    Icon={Laptop}
    {onClose}
    {extraButton}
  >
    {#if existingDevice.images.length > 0}
      <span
        class="block h-80 w-full rounded-xl bg-cover bg-center"
        style="background-image: url(/api/v1/image/device/{existingDevice.id}/{existingDevice
          .images[0]})"
      ></span>
    {/if}

    <h1 class="text-3xl font-bold">{existingDevice.name}</h1>
    <p class:opacity-50={!existingDevice.description.trim()}>
      {existingDevice.description.trim() || 'No description provided.'}
    </p>

    {#if existingDevice.specifications.length > 0}
      <h3 class="font-semibold">Specs</h3>

      <ul class="flex flex-wrap gap-2">
        {#each existingDevice.specifications as spec (spec.valueId)}
          <li
            class="flex w-fit flex-col items-start justify-center rounded-lg border border-zinc-200 p-4 dark:border-zinc-700"
          >
            <p class="mb-2 text-base font-bold text-zinc-900/70 dark:text-zinc-100/70">
              {spec.field.name}
            </p>
            <p>{spec.value.value}</p>
          </li>
        {/each}
      </ul>
    {/if}

    {#if existingDevice.images.length > 0}
      <h3 class="font-semibold">Images</h3>

      <div class="flex flex-wrap items-center gap-2">
        {#each existingDevice.images as image, i (image)}
          <div
            class="relative isolate overflow-hidden rounded-lg border-zinc-200 dark:border-zinc-700"
          >
            <button
              class="absolute inset-0 z-10 flex cursor-pointer items-center justify-center bg-white/70 opacity-0 transition-opacity hover:opacity-100 dark:bg-black/70"
              type="button"
              onclick={() => {
                imageIndex = i;
                imageOverlayOpen = true;
              }}
            >
              <Expand />
            </button>

            <img
              src="/api/v1/image/device/{existingDevice.id}/{image}"
              alt="User uploaded"
              class="h-44 w-auto"
            />
          </div>
        {/each}
      </div>
    {/if}
  </FullscreenOverlay>
{/if}
