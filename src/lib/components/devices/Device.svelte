<script lang="ts">
  import { fade, scale } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  import { X, Upload, Trash } from '@lucide/svelte';

  import type { InferSelectModel } from 'drizzle-orm';
  import type { devices } from '$lib/server/db/schema';
  import { createDevice } from '$lib/remote/devices.remote';

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

{#if overlayOpen && form}
  <form
    class="fixed inset-0 isolate flex flex-col items-center justify-center overflow-hidden bg-white/60 dark:bg-black/60 p-4 pt-16 backdrop-blur-lg z-50"
    transition:fade={{ duration: 100 }}
    {...form}
    enctype="multipart/form-data"
  >
    <div
      class="absolute inset-0 -z-10"
      onclick={() => (overlayOpen = false)}
      aria-hidden="true"
    ></div>

    <div
      class="overflow-hidden flex flex-col gap-4 rounded-xl border-2 border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 relative"
      style="width: min(1200px, 100%); height: min(1000px, calc(100vh - 5rem)); max-height: calc(100vh - 5rem);"
      transition:scale={{ duration: 300, easing: cubicOut, start: 0.9, opacity: 1 }}
    >
      <div class="p-4 h-16 z-10 flex w-full shrink-0 items-center justify-between gap-2">
        <h2 class="text-xl font-bold">{device ? device.deviceName : 'Create Device'}</h2>
        <button
          class="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-600"
          type="button"
          onclick={() => (overlayOpen = false)}
          aria-label="Close popup"
        >
          <X size={24} />
        </button>
      </div>

      <div
        class="p-4 pt-16 absolute inset-0 overflow-auto mask-[linear-gradient(to_top,black_92%,transparent)] flex flex-col gap-4"
      >
        <input
          class="w-full outline-0 text-3xl"
          placeholder="Enter title..."
          {...form.fields.name.as('text')}
        />
        <textarea
          class="w-full min-h-8 h-8"
          placeholder="Enter description..."
          {...form.fields.description.as('text')}></textarea>

        <h3 class="font-semibold">Images</h3>

        <input
          bind:this={fileInput}
          {...form.fields.images.as('file multiple')}
          accept="image/*"
          class="hidden"
        />

        <div class="flex items-center gap-2 flex-wrap">
          <button
            class="h-44 w-60 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 border rounded-lg p-4 flex items-center justify-center gap-2 flex-col text-center cursor-pointer"
            type="button"
            onclick={() => fileInput?.click()}
          >
            <div
              class="bg-zinc-500 dark:bg-zinc-600 h-12 w-12 flex items-center justify-center rounded-xl"
            >
              <Upload />
            </div>
            <p class="font-bold">Upload image</p>
            <p class="text-zinc-900/70 dark:text-zinc-100/70">Max 5MB per image</p>
          </button>

          <!-- eslint-disable-next-line svelte/require-each-key -->
          {#each files as file}
            <div
              class="relative isolate border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden"
            >
              <button
                class="absolute inset-0 z-10 flex items-center justify-center bg-white/70 dark:bg-black/70 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
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
      </div>
    </div>
  </form>
{/if}
