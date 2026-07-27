<script lang="ts">
  import { createDevice } from '$lib/remote/devices.remote';

  import FullscreenOverlay from '$lib/components/ui/FullscreenOverlay.svelte';
  import SelectSpecField from '../specs/SelectSpecField.svelte';
  import SelectSpec from '../specs/SelectSpec.svelte';
  import Button from '../ui/inputs/Button.svelte';
  import { Upload, Trash, Pencil, Laptop, Plus, X } from '@lucide/svelte';

  import type { device, specificationField, specificationValue } from '$lib/server/db/schema';
  import type { SpecValueSchema } from '$lib/schema/spec';

  type SpecificationFieldWithValues = typeof specificationField.$inferSelect & {
    values: (typeof specificationValue.$inferSelect)[];
  };

  let {
    specFields,
    existingDevice,
    overlayOpen = $bindable()
  }: {
    specFields: SpecificationFieldWithValues[];
    existingDevice?: typeof device.$inferSelect | undefined;
    overlayOpen: boolean;
  } = $props();

  let specFieldOverlayOpen = $state(false);
  let specOverlayOpen = $state(false);
  let activeSpec: SpecValueSchema | undefined = $state();

  let form: typeof createDevice | undefined = $derived(existingDevice ? undefined : createDevice);
  let fileInput: HTMLInputElement | undefined = $state();
  let files: File[] = $derived(
    (form?.fields.images.value() ?? []).filter((file): file is File => file !== undefined)
  );

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
    console.log(`updating spec value (spec: ${activeSpec.uuid}, value: ${id})`);

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

{#if form}
  <form {...form} enctype="multipart/form-data">
    <FullscreenOverlay
      bind:overlayOpen
      width={1200}
      height={1000}
      gap={12}
      title={existingDevice ? existingDevice.name : 'Create Device'}
      Icon={existingDevice ? Laptop : Pencil}
    >
      <input
        class="w-full text-3xl outline-0"
        placeholder="Enter title..."
        {...form.fields.name.as('text')}
      />
      <textarea
        class="h-8 min-h-8 w-full"
        placeholder="Enter description..."
        {...form.fields.description.as('text')}></textarea>

      <h3 class="font-semibold">Specs</h3>

      <ul class="space-y-2">
        <li>
          <button
            title="Add specification field..."
            class="flex w-full cursor-pointer items-center gap-4 rounded-lg border-2 border-zinc-300 bg-zinc-200 p-4 text-center transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-700 hover:dark:bg-zinc-500"
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

        {#each form.fields.specs.value() as spec (spec?.uuid)}
          {@const matchedSpec = specFields.find((sp) => sp.id === spec?.fieldId)}
          {#if spec && matchedSpec}
            <li
              class="flex w-full items-center justify-between rounded-lg border-2 border-zinc-200 p-4 dark:border-zinc-700"
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
          class="flex h-44 w-60 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-zinc-200 p-4 text-center transition-colors hover:bg-zinc-200 dark:border-zinc-700 dark:hover:bg-zinc-700"
          type="button"
          onclick={() => fileInput?.click()}
        >
          <div
            class="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-300 dark:bg-zinc-600"
          >
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
    </FullscreenOverlay>
  </form>
{/if}
