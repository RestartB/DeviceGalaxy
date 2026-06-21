<script lang="ts">
  import './layout.css';
  import favicon from '$lib/assets/favicon.svg';
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';

  let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="flex flex-col min-h-screen">
  <Header />
  <main class="h-full flex-1 pt-12 max-w-7xl w-full mx-auto">
    {@render children()}
  </main>
  <Footer />
</div>
