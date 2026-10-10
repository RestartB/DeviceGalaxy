<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { fade } from 'svelte/transition';

  import { deleteDevice, editDevice } from '#lib/remote/devices.remote.js';

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

  import { editDeviceSchema } from '#lib/schema/device.js';
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
    existingDevice: DeviceWithSpecifications;
    overlayOpen: boolean;
    onClose?: () => void;
  } = $props();

  let editMode = $state(false);

  let specFieldOverlayOpen = $state(false);
  let specOverlayOpen = $state(false);
  let activeSpec: SpecValueSchema | undefined = $state();

  let fileInput: HTMLInputElement | undefined = $state();
  let images: File[] = $derived(
    (editDevice.fields.images.value() ?? []).filter((file): file is File => file !== undefined)
  );
  let existingImages: string[] = $derived(
    (editDevice.fields.existingImages.value() ?? []).filter(
      (image): image is string => image !== undefined
    )
  );

  let errorOverlayOpen = $state(false);
  let errorMessage = $state(
    'An error occurred while submitting the data. Please try again in a moment.'
  );

  let deleteOverlayOpen = $state(false);

  let imageOverlayOpen = $state(false);
  let imageIndex = $state(0);
  let renderedImageWidth = $state(0);

  function updateFormData() {
    editDevice.fields.name.set(existingDevice.name);
    editDevice.fields.description.set(existingDevice.description);
    editDevice.fields.existingImages.set(existingDevice.images);

    let specs = [];
    let i = 0;
    for (const spec of existingDevice.specifications) {
      specs.push({
        uuid: crypto.randomUUID(),
        fieldId: spec.fieldId,
        valueId: spec.valueId,
        position: i
      });
      i += 1;
    }

    editDevice.fields.specs.set(specs);
  }

  onMount(() => updateFormData);

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
    const specs = editDevice.fields.specs.value() || [];
    specs.push({ uuid: crypto.randomUUID(), fieldId: id });
    editDevice.fields.specs.set(specs);
  }

  function addSpecValue(id: string) {
    if (!activeSpec) {
      return;
    }

    const specs = editDevice.fields.specs.value() || [];
    const index = specs.indexOf(specs.find((sp) => sp?.uuid == activeSpec?.uuid));
    if (index === -1) {
      return;
    }

    const newSpec = activeSpec;
    newSpec.valueId = id;

    specs.splice(index, 1, newSpec);
    editDevice.fields.specs.set(specs);
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

<svelte:head>
  <title>{existingDevice.name}</title>
</svelte:head>

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
    zIndex={70}
    bind:overlayOpen={errorOverlayOpen}
  >
    <p>{errorMessage}</p>
  </FullscreenOverlay>
{/if}

{#if deleteOverlayOpen}
  <FullscreenOverlay
    title="Delete Device"
    Icon={Trash}
    zIndex={60}
    gap={12}
    bind:overlayOpen={deleteOverlayOpen}
  >
    <p>
      Are you sure you want to delete <b>{existingDevice.name}?</b> This is an irreversible action. Specifications
      will not be deleted.
    </p>

    <button
      class="cursor-pointer rounded-lg border border-zinc-300 bg-zinc-200 p-2 px-4 transition-colors hover:bg-zinc-300 dark:border-zinc-600 dark:bg-zinc-700 dark:hover:bg-zinc-600"
      onclick={async () => {
        try {
          await deleteDevice(existingDevice.id);
          await goto('/dash/devices', { refreshAll: true });
        } catch (error) {
          const errorDataRaw = String(error);

          try {
            const errorJson = JSON.parse(errorDataRaw);
            errorMessage =
              errorJson.message ||
              'An error occurred while deleting the device. Please try again later.';
          } catch {
            errorMessage = 'An error occurred while deleting the device. Please try again later.';
          }

          errorOverlayOpen = true;
        }
      }}
    >
      Delete Device
    </button>
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
  {#if editMode}
    <button
      class="flex h-8 w-fit shrink-0 cursor-pointer items-center justify-center gap-1 rounded-full bg-zinc-200 px-3 text-zinc-500 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-600"
      type="button"
      aria-label="Cancel"
      onclick={() => (editMode = false)}
    >
      <X size={20} /> Cancel
    </button>
    <button
      class="flex h-8 w-fit shrink-0 cursor-pointer items-center justify-center gap-1 rounded-full bg-zinc-200 px-3 text-zinc-500 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-600"
      type="submit"
      form="edit-device-form"
      aria-label="Save"
    >
      <Save size={20} /> Save
    </button>
  {:else}
    <button
      class="flex h-8 w-fit shrink-0 cursor-pointer items-center justify-center gap-1 rounded-full bg-zinc-200 px-3 text-zinc-500 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-600"
      type="button"
      aria-label="Delete"
      onclick={() => (deleteOverlayOpen = true)}
    >
      <Trash size={20} /> Delete
    </button>
    <button
      class="flex h-8 w-fit shrink-0 cursor-pointer items-center justify-center gap-1 rounded-full bg-zinc-200 px-3 text-zinc-500 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-600"
      type="button"
      aria-label="Edit"
      onclick={() => (editMode = true)}
    >
      <Pencil size={20} /> Edit
    </button>
  {/if}
{/snippet}

<FullscreenOverlay
  bind:overlayOpen
  width={1200}
  height={1000}
  gap={12}
  title={editMode ? 'Edit Device' : existingDevice.name}
  Icon={editMode ? Pencil : Laptop}
  {onClose}
  {extraButton}
>
  {#if editMode}
    <form
      id="edit-device-form"
      {...editDevice.preflight(editDeviceSchema).enhance(async (form) => {
        try {
          form.validate({ preflightOnly: true });
          if (!(await form.submit()) || !form.result || !form.result.success) {
            return;
          }

          updateFormData();
          editMode = false;
        } catch (error) {
          console.error(error);
          errorMessage = String(error);
          errorOverlayOpen = true;
        }
      })}
      enctype="multipart/form-data"
      class="space-y-3"
    >
      <input {...editDevice.fields.id.as('hidden', existingDevice.id)} />

      {#if existingImages.length > 0}
        <span
          class="block h-80 w-full rounded-xl bg-cover bg-center"
          style="background-image: url(/api/v1/image/device/{existingDevice.id}/{existingImages[0]})"
        ></span>
      {:else if images.length > 0}
        <span
          class="block h-80 w-full rounded-xl bg-cover bg-center"
          style="background-image: url({URL.createObjectURL(images[0])})"
        ></span>
      {/if}

      <input
        class="w-full text-3xl outline-0"
        placeholder="Enter title..."
        {...editDevice.fields.name.as('text')}
      />

      {#each editDevice.fields.name.issues() as issue (issue.message)}
        <p class="text-red-600">{issue.message}</p>
      {/each}

      <textarea
        class="h-8 min-h-8 w-full"
        placeholder="Enter description..."
        {...editDevice.fields.description.as('text')}></textarea>

      {#each editDevice.fields.description.issues() as issue (issue.message)}
        <p class="text-red-600">{issue.message}</p>
      {/each}

      <h3 class="font-semibold">Specs</h3>

      <ul class="space-y-2">
        <li>
          <button
            title="Add specification field..."
            class="flex w-full cursor-pointer items-center gap-4 rounded-lg border border-zinc-300 bg-zinc-200 p-4 text-center transition-colors hover:bg-zinc-300 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-700 hover:dark:bg-zinc-600"
            type="button"
            disabled={editDevice.fields.specs.value() &&
              editDevice.fields.specs.value().length >= 10}
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

        {#each editDevice.fields.specs.value() as spec, index (spec?.uuid)}
          {@const matchedSpec = specFields.find((sp) => sp.id === spec?.fieldId)}
          {#if spec?.uuid && spec.fieldId && matchedSpec}
            <input {...editDevice.fields.specs[index].uuid.as('hidden', spec.uuid)} />
            <input {...editDevice.fields.specs[index].fieldId.as('hidden', spec.fieldId)} />
            {#if spec.valueId}
              <input {...editDevice.fields.specs[index].valueId.as('hidden', spec.valueId)} />
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
                  editDevice.fields.specs.set(
                    editDevice.fields.specs.value().filter((sp) => sp?.uuid !== spec.uuid)
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
        {...editDevice.fields.images.as('file multiple')}
        accept="image/*"
        class="hidden"
      />

      <div class="flex flex-wrap items-center gap-2">
        <button
          class="flex h-44 w-60 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-zinc-200 p-4 text-center transition-colors hover:bg-zinc-300 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-700 dark:hover:bg-zinc-600"
          type="button"
          disabled={images.length >= 5}
          onclick={() => fileInput?.click()}
        >
          <div class="flex h-12 w-12 items-center justify-center">
            <Upload />
          </div>
          <p class="font-bold">Upload image</p>
          <p class="text-zinc-900/70 dark:text-zinc-100/70">Max 5MB per image</p>
        </button>

        {#each existingImages as image, i (image)}
          <div
            class="relative isolate overflow-hidden rounded-lg border-zinc-200 dark:border-zinc-700"
          >
            <button
              class="absolute inset-0 z-10 flex cursor-pointer items-center justify-center bg-white/70 opacity-0 transition-opacity hover:opacity-100 dark:bg-black/70"
              type="button"
              onclick={() => {
                existingImages.splice(existingImages.indexOf(image), 1);
                editDevice.fields.existingImages.set(existingImages);
              }}
            >
              <Trash />
            </button>

            <!-- svelte-ignore a11y_missing_attribute -->
            <img src="/api/v1/image/device/{existingDevice?.id}/{image}" class="h-44 w-auto" />
            <input {...editDevice.fields.existingImages[i].as('hidden', image)} />
          </div>
        {/each}

        <!-- eslint-disable-next-line svelte/require-each-key -->
        {#each images as file}
          <div
            class="relative isolate overflow-hidden rounded-lg border-zinc-200 dark:border-zinc-700"
          >
            <button
              class="absolute inset-0 z-10 flex cursor-pointer items-center justify-center bg-white/70 opacity-0 transition-opacity hover:opacity-100 dark:bg-black/70"
              type="button"
              onclick={() => {
                images.splice(images.indexOf(file), 1);
                editDevice.fields.images.set(images);
              }}
            >
              <Trash />
            </button>

            <img use:imagePreview={file} alt={file.name} class="h-44 w-auto" />
          </div>
        {/each}
      </div>

      {#each editDevice.fields.images.issues() as issue (issue.message)}
        <p class="text-red-600">{issue.message}</p>
      {/each}

      {#each images as _, index (index)}
        {#each editDevice.fields.images[index].issues() as issue (issue.message)}
          <p class="text-red-600">File {index + 1}: {issue.message}</p>
        {/each}
      {/each}
    </form>
  {:else if existingDevice}
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

    {#if existingDevice.additional.trim()}
      <h3 class="font-semibold">Additional Info</h3>
      <p>{existingDevice.additional}</p>
    {/if}

    {#if existingDevice.specifications.length > 0}
      <h3 class="font-semibold">Specs</h3>

      <ul class="flex flex-wrap gap-2">
        {#each existingDevice.specifications as spec (spec.valueId)}
          <li
            class="flex w-fit flex-col items-start justify-center rounded-lg border border-zinc-300 bg-zinc-200 p-4 dark:border-zinc-600 dark:bg-zinc-700"
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
  {/if}
</FullscreenOverlay>
