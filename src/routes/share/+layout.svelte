<script lang="ts">
  let { children } = $props();
</script>

<svelte:head>
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

{@render children()}
