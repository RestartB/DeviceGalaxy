<script lang="ts">
  import { fade } from 'svelte/transition';
  import { X } from '@lucide/svelte';

  let { reason } = $props();

  let popupOpen = $state(true);
</script>

{#if popupOpen}
  <div
    class="fixed inset-0 z-90 mt-12 flex items-center justify-center overflow-hidden bg-white/60 p-4 backdrop-blur-lg dark:bg-black/60"
    transition:fade={{ duration: 100 }}
  >
    <div
      class="absolute inset-0 z-100"
      onclick={() => (popupOpen = false)}
      aria-hidden="true"
    ></div>

    <div
      class="z-110 flex max-h-full w-full max-w-lg flex-col overflow-hidden rounded-xl border-4 border-zinc-400 bg-zinc-100 shadow-2xl dark:bg-zinc-800"
    >
      <div class="flex items-center justify-between border-b p-4">
        <h2 class="text-xl font-bold">Account Suspended</h2>
        <button
          onclick={() => (popupOpen = false)}
          class="cursor-pointer text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-400"
          aria-label="Close"><X /></button
        >
      </div>

      <div class="flex w-full flex-wrap items-center justify-center gap-2 overflow-y-auto p-6">
        <p>
          Unfortunately, your account has been suspended. You will not be able to create new devices
          or share links. All existing share links have been revoked.
        </p>
      </div>
      <div class="border-t p-6">
        <button
          onclick={() => (popupOpen = false)}
          class="w-full cursor-pointer rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
        >
          OK
        </button>
      </div>
    </div>
  </div>
{/if}
