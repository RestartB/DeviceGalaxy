<script lang="ts">
  const { src = '', name = '', size = 40, class: customClass = '', circle = false } = $props();
</script>

{#if src}
  <img
    class="inline-block shrink-0 {circle
      ? 'rounded-full'
      : 'rounded-md'} border-2 border-zinc-600 bg-zinc-700 object-cover {customClass}"
    translate="no"
    {src}
    alt={name}
    width={size}
    height={size}
    style="width: {size}px; height: {size}px;"
  />
{:else}
  <div
    class="inline-flex shrink-0 items-center justify-center align-middle {circle
      ? 'rounded-full'
      : 'rounded-md'} border-2 border-zinc-600 bg-zinc-700 text-zinc-400 {customClass}"
    style="width: {size}px; height: {size}px; font-size: {size / 2}px;"
    translate="no"
  >
    <p class="select-none">{name ? name.charAt(0) : ''}</p>
  </div>
{/if}
