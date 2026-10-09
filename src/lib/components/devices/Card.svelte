<script lang="ts">
  import type { device } from '#lib/server/db/schema.js';
  let { deviceData }: { deviceData: typeof device.$inferSelect } = $props();
</script>

<a
  class="h-full cursor-pointer overflow-hidden rounded-lg border-2 border-zinc-300 bg-zinc-200 text-left dark:border-zinc-700 dark:bg-zinc-800"
  href="/devices/{deviceData.id}"
  title={deviceData.name}
>
  {#if deviceData.images.length > 0}
    <span
      class="block h-30 w-full border-b-2 border-zinc-300 bg-cover bg-center dark:border-zinc-700"
      style="background-image: url(/api/v1/image/device/{deviceData.id}/{deviceData.images[0]})"
    ></span>
  {/if}

  <div class="p-4">
    <p class="text-xl font-semibold">{deviceData.name}</p>
    <p class:opacity-50={!deviceData.description.trim()}>
      {deviceData.description.trim() || 'No description provided'}
    </p>
  </div>
</a>
