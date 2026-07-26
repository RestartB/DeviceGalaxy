<script lang="ts">
  import { createDevice } from '$lib/remote/devices.remote';

  import FullscreenOverlay from '$lib/components/ui/FullscreenOverlay.svelte';
  import { Upload, Trash, Pencil, Laptop } from '@lucide/svelte';

  import type { InferSelectModel } from 'drizzle-orm';
  import type { devices } from '$lib/server/db/schema';

  let {
    device,
    overlayOpen = $bindable()
  }: { device?: InferSelectModel<typeof devices> | undefined; overlayOpen: boolean } = $props();

  let form: typeof createDevice | undefined = $derived(device ? undefined : createDevice);
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
</script>

{#if form}
  <form {...form} enctype="multipart/form-data">
    <FullscreenOverlay
      bind:overlayOpen
      width={1200}
      height={1000}
      gap={8}
      title={device ? device.deviceName : 'Create Device'}
      Icon={device ? Laptop : Pencil}
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

      <h3 class="font-semibold">Images</h3>

      <input
        bind:this={fileInput}
        {...form.fields.images.as('file multiple')}
        accept="image/*"
        class="hidden"
      />

      <div class="flex flex-wrap items-center gap-2">
        <button
          class="flex h-44 w-60 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-zinc-200 p-4 text-center hover:bg-zinc-200 dark:border-zinc-700 dark:hover:bg-zinc-700"
          type="button"
          onclick={() => fileInput?.click()}
        >
          <div
            class="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-500 dark:bg-zinc-600"
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
