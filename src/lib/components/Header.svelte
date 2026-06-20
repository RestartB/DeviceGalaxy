<script lang="ts">
  /* eslint-disable svelte/no-navigation-without-resolve */
  import { page } from '$app/state';
  import { resolve } from '$app/paths';
  import { afterNavigate } from '$app/navigation';
  import { fade, fly } from 'svelte/transition';
  import { prefersReducedMotion } from 'svelte/motion';

  import { X, Menu, House, Info, Wifi, LayoutDashboard, Plus } from '@lucide/svelte';
  import logo from '$lib/assets/logo.svg';

  import type { Component } from 'svelte';
  import type { Pathname } from '$app/types';

  let menuOpen = $state(false);
  let width = $state(0);

  afterNavigate(() => {
    menuOpen = false;
  });

  $effect(() => {
    if (menuOpen && width >= 568) {
      menuOpen = false;
    }
  });
</script>

<svelte:window bind:innerWidth={width} />

{#snippet topRowLink(title: string, href: Pathname)}
  <a
    href={resolve(href)}
    class="hidden h-full items-center border-y-transparent border-b-zinc-400 px-2 transition-all hover:border-y-4 xs:flex dark:border-b-zinc-500"
  >
    {title}
  </a>
{/snippet}

{#snippet menuLink(title: string, href: string, active: boolean, Icon: Component)}
  <a
    class="flex w-full items-center gap-2 p-2 px-8 {active
      ? 'bg-zinc-200 font-bold dark:bg-zinc-700'
      : ''} transition-all active:scale-98"
    {href}
  >
    <Icon size={20} />
    <p>{title}</p>
  </a>
{/snippet}

<header
  class="fixed z-100 h-12 w-full border-b-2 border-b-zinc-300 bg-zinc-200 text-base dark:border-b-zinc-700 dark:bg-zinc-800"
  style="view-transition-name: header"
>
  <div class="mx-auto flex h-full max-w-7xl items-center">
    <div class="mr-auto ml-4 flex h-full shrink-0 items-center">
      <div class="mr-2 flex items-center gap-2">
        <img src={logo} alt="Titanium" class="h-8 w-8 rounded-md" translate="no" />
        <h1 class="text-lg font-bold" translate="no">Titanium</h1>
      </div>

      <nav class="flex h-full shrink-0 items-center">
        {@render topRowLink('Home', '/')}
      </nav>
    </div>

    <a
      class="mr-4 ml-2 hidden items-center justify-center gap-1 rounded-lg border border-zinc-400 bg-zinc-300 p-1 px-2 transition-colors hover:bg-zinc-200 xs:flex dark:border-zinc-600 dark:bg-zinc-700 hover:dark:bg-zinc-800"
      href={resolve('/auth/signin')}
    >
      <Plus size={20} />
      Sign In
    </a>
  </div>
</header>

{#if menuOpen}
  <nav
    class="fixed inset-0 z-90 mt-12 h-fit w-full bg-linear-to-b from-zinc-300 from-75% pt-2 pb-20 dark:from-zinc-800"
    transition:fly={{ y: prefersReducedMotion.current ? 0 : -10, duration: 200 }}
  >
    {@render menuLink('Home', resolve('/'), page.url.pathname.endsWith('/'), Plus)}
    {@render menuLink('Devices', "", page.url.pathname.endsWith('/about'), Plus)}
    {@render menuLink('Tags', "", page.url.pathname.endsWith('/status'), Plus)}
    {@render menuLink('Shares', "", false, Plus)}
    {@render menuLink('Settings', "", false, Plus)}
    {@render menuLink('Sign Out', "", false, Plus)}
  </nav>
{/if}
