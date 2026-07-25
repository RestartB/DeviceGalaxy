<script lang="ts">
  let { children } = $props();
</script>

<span
  class="absolute inset-0 -z-10 block bg-[url(https://images.unsplash.com/photo-1465101162946-4377e57745c3?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&dl=jeremy-thomas-4dpAqfTbvKA-unsplash.jpg&w=1920)] bg-cover bg-center bg-no-repeat pt-12 pb-10"
></span>

<div class="absolute inset-0 pt-12 pb-10">
  <div class="inset-0 mx-auto flex h-full max-w-7xl items-center">
    <div
      class="m-4 flex max-w-lg flex-col gap-2 rounded-xl border-2 border-zinc-300 bg-zinc-100 p-4 dark:border-zinc-700 dark:bg-zinc-900"
    >
      <h2 class="-mb-1 text-xl font-semibold text-zinc-900/80 dark:text-zinc-100/80">
        DeviceGalaxy
      </h2>

      {@render children()}
    </div>
  </div>
</div>
