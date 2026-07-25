<script lang="ts">
  import './layout.css';

  import favicon from '$lib/assets/favicon.svg';
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';

  let { children, data } = $props();
  const user = $derived(data.user);
</script>

<svelte:head>
  <script
    src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
    defer
  ></script>

  <link rel="icon" href={favicon} />
</svelte:head>

<div class="flex min-h-screen flex-col">
  <Header {user} />
  <main class="mx-auto h-full w-full max-w-7xl flex-1 pt-12">
    {@render children()}
  </main>
  <Footer />
</div>
