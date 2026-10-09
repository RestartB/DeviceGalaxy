<script lang="ts">
  import type { device } from '#lib/server/db/schema.js';
  let { deviceData }: { deviceData: typeof device.$inferSelect } = $props();
</script>

<a
  class="h-fit cursor-pointer overflow-hidden rounded-lg border-2 border-zinc-300 bg-zinc-200 text-left dark:border-zinc-700 dark:bg-zinc-800"
  href="/devices/{deviceData.id}"
  title={deviceData.name}
>
  {#if deviceData.images.length > 0}
    <span
      class="block h-40 w-full bg-cover bg-center"
      style="background-image: url(/api/v1/image/device/{deviceData.id}/{deviceData.images[0]})"
    ></span>
  {/if}

  <div class="p-2">
    <p class="text-xl font-semibold">{deviceData.name}</p>
    <p>{deviceData.description}</p>
  </div>
</a>
