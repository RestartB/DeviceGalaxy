<script lang="ts">
  let { name, value, toggled = false, class: className = '', group = $bindable() } = $props();
</script>

<input
  type="radio"
  class={`border-box block h-6 w-6 shrink-0 cursor-pointer appearance-none rounded-full border-4 border-zinc-700 bg-zinc-800 transition-colors checked:bg-zinc-400 ${className}`}
  aria-label="Enable"
  checked={toggled}
  {name}
  {value}
  bind:group
/>
