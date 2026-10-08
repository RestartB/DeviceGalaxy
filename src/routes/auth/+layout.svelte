<script lang="ts">
  let { children } = $props();
</script>

<div class="flex h-full w-full flex-1 items-center justify-center">
  <div
    class="flex max-w-lg flex-col gap-2 rounded-xl border-2 border-zinc-300 bg-zinc-200 p-4 text-center shadow-[0px_0px_105px_10px] shadow-purple-900 dark:border-zinc-700 dark:bg-zinc-800"
  >
    <h2 class="-mb-1 text-xl font-semibold text-zinc-900/80 dark:text-zinc-100/80">DeviceGalaxy</h2>

    {@render children()}
  </div>
</div>

<style>
  :global(label) {
    text-align: left;
  }

  :global(.text-red-600) {
    text-align: left;
  }
</style>
