<script lang="ts">
  let { children } = $props();
</script>

<span
  class="absolute -z-10 inset-0 pt-12 pb-10 block bg-cover bg-center bg-no-repeat bg-[url(https://images.unsplash.com/photo-1465101162946-4377e57745c3?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&dl=jeremy-thomas-4dpAqfTbvKA-unsplash.jpg&w=1920)]"
></span>

<div class="absolute inset-0 pt-12 pb-10">
  <div class="inset-0 flex items-center h-full max-w-7xl mx-auto">
    <div
      class="m-4 flex gap-2 flex-col bg-zinc-800/80 backdrop-blur-lg border-2 border-zinc-700 p-4 rounded-xl max-w-lg"
    >
      {@render children()}
    </div>
  </div>
</div>
