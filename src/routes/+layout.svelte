<script lang="ts">
  import './layout.css';

  import { onNavigate } from '$app/navigation';

  import favicon from '#lib/assets/favicon.svg';
  import Header from '#lib/components/Header.svelte';
  import Footer from '#lib/components/Footer.svelte';

  let { children, data } = $props();
  const user = $derived(data.user);
  let scrollY = $state(0);

  const pages = {
    '/': 1,
    '/dash/devices': 2
  };
  type PagePath = keyof typeof pages;

  onNavigate((navigation) => {
    if (!document.startViewTransition) return;

    // handle same page navigation, also avoid breakage with the device overlay animation
    if (
      !navigation.to ||
      !navigation.from ||
      navigation.to.url.pathname === navigation.from?.url.pathname ||
      navigation.to.url.pathname.startsWith('/dash/devices/') ||
      (navigation.from.url.pathname.startsWith('/dash/devices/') &&
        navigation.to.url.pathname.startsWith('/dash/devices'))
    ) {
      return;
    }

    const oldPage = pages[navigation.from.url.pathname as PagePath];
    const newPage = pages[navigation.to.url.pathname as PagePath];

    let oldAnim;
    let newAnim;

    if (!oldPage || !newPage) {
      oldAnim = 'fade-out';
      newAnim = 'fade-in';
    } else if (oldPage < newPage) {
      oldAnim = 'slide-to-left';
      newAnim = 'slide-from-right';
    } else {
      oldAnim = 'slide-to-right';
      newAnim = 'slide-from-left';
    }

    document.documentElement.style.setProperty('--old-animation', oldAnim);
    document.documentElement.style.setProperty('--new-animation', newAnim);

    return new Promise((resolve) => {
      document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
      });
    });
  });
</script>

<svelte:window bind:scrollY />

<svelte:head>
  <script
    src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
    defer
  ></script>

  <link rel="icon" href={favicon} />
  <title>DeviceGalaxy</title>
</svelte:head>

<div class="flex min-h-screen flex-col">
  <Header {user} />
  <main class="mx-auto flex h-full w-full max-w-7xl flex-1 flex-col p-4 pt-20">
    {@render children()}
  </main>
  <Footer />
</div>

<style>
  :root::view-transition-old(root) {
    animation: 300ms cubic-bezier(0.4, 0, 0.2, 1) both var(--old-animation);
  }

  :root::view-transition-new(root) {
    animation: 300ms cubic-bezier(0.4, 0, 0.2, 1) both var(--new-animation);
  }
</style>
