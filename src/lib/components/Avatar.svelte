<script lang="ts">
  let { size = 40, src = '', name = '', alt = 'Avatar', className = '', textClass = '' } = $props();
  let generatedAvatar = $state(false);

  if (!src || src === '') {
    generatedAvatar = true;
  }
</script>

{#if generatedAvatar}
  <div
    class={`flex items-center justify-center rounded-full border-2 border-zinc-400 bg-gray-200 text-sm select-none ${className}`}
    style="min-width: {size}px; min-height: {size}px;"
  >
    <span class="font-semibold text-gray-700 {textClass}">
      {name ? name.charAt(0) : '?'}
    </span>
  </div>
{:else}
  <img
    {src}
    {alt}
    class={`rounded-full border-2 border-zinc-400 ${className}`}
    width={size}
    height={size}
    loading="lazy"
  />
{/if}
