<script lang="ts">
  import '../app.css';
  import { onNavigate } from '$app/navigation';
  import { onMount } from 'svelte';
  import { page } from '$app/state';

  import { Toaster } from 'svelte-sonner';
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import OldUrlAlert from '$lib/components/OldURLAlert.svelte';

  let { data, children } = $props();
  let alertPopupOpen = $state(false);

  onNavigate((navigation) => {
    if (!document.startViewTransition) return;

    if (!navigation.to || !navigation.from) return;
    if (navigation.to.url.href === navigation.from.url.href) return;

    return new Promise((resolve) => {
      document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
      });
    });
  });

  onMount(() => {
    if (page.url.host === 'devices.restartb.xyz' && !localStorage.getItem('oldURLAlertDismissed')) {
      alertPopupOpen = true;
    }
  });
</script>

<svelte:head>
  <title>DeviceGalaxy</title>
  <meta content="#6463FF" data-react-helmet="true" name="theme-color" />

  {#if !page.url.pathname.startsWith('/share')}
    <meta property="og:title" content="DeviceGalaxy" />
    <meta name="og:description" content="Manage and share your galaxy of devices." />
    <meta content="https://devicegalaxy.me/favicon.png" property="og:image" />
  {/if}
</svelte:head>

<div class="font-family font-lg h-screen max-h-screen w-full dark:text-white">
  <OldUrlAlert popupOpen={alertPopupOpen} />
  <Header {data} />

  <div
    class="box-border min-h-screen flex-1 overflow-y-auto p-4 pt-16"
    class:p-4={page.url.pathname.startsWith('/dash') &&
      !page.url.pathname.startsWith('/dash/device/')}
    class:pt-12={!page.url.pathname.startsWith('/dash') ||
      page.url.pathname.startsWith('/dash/device/')}
    class:pt-16={page.url.pathname.startsWith('/dash') &&
      !page.url.pathname.startsWith('/dash/device/')}
  >
    <Toaster position="top-center" richColors closeButton />
    {@render children()}
  </div>

  <Footer />
</div>

<style>
  @keyframes fade-in {
    from {
      opacity: 0;
    }
  }

  @keyframes fade-out {
    to {
      opacity: 0;
    }
  }

  @keyframes slide-from-bottom {
    from {
      transform: translateY(30px);
    }
  }

  @keyframes slide-to-bottom {
    to {
      transform: translateY(30px);
    }
  }

  :root::view-transition-old(root) {
    animation:
      90ms cubic-bezier(0.4, 0, 1, 1) both fade-out,
      300ms cubic-bezier(0.4, 0, 0.2, 1) both slide-to-bottom;
  }

  :root::view-transition-new(root) {
    animation:
      210ms cubic-bezier(0, 0, 0.2, 1) 90ms both fade-in,
      300ms cubic-bezier(0.4, 0, 0.2, 1) both slide-from-bottom;
  }
</style>
