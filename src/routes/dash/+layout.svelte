<script lang="ts">
  import { page } from '$app/state';
  let { children } = $props();
</script>

<svelte:head>
  {#if page.url.pathname !== '/dash/auth/login' && page.url.pathname !== '/dash/auth/signup'}
    <meta name="robots" content="noindex, nofollow" />
  {/if}
</svelte:head>

{@render children()}
