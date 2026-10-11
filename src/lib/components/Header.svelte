<script lang="ts">
  import { resolve } from '$app/paths';
  import { page } from '$app/state';

  import { LogIn, LogOut } from '@lucide/svelte';
  import logo from '#lib/assets/logo.svg';

  import type { Path } from '$app/types';
  import type { User } from 'better-auth';

  const { user }: { user?: User | undefined } = $props();

  let headerElement: HTMLElement | undefined = $state();
  let scrollPos = $state(0);
  let width = $state(0);

  const pages = {
    Devices: '/dash/devices',
    Specs: '/dash/specs',
    Shares: '/dash/shares',
    Settings: '/dash/settings'
  };

  let currentTitle = $derived.by(() => {
    if (user && page.url.pathname === '/') {
      return 'Home';
    }

    for (const [name, path] of Object.entries(pages)) {
      if (page.url.pathname.startsWith(path)) {
        return name;
      }
    }
  });

  $effect(() => {
    if (!headerElement) {
      return;
    }

    if (scrollPos >= 20 && headerElement.classList.contains('h-20')) {
      headerElement.classList.replace('h-20', 'h-12');
      headerElement.classList.replace('text-lg', 'text-base');
      headerElement.classList.add('bg-zinc-200/50', 'dark:bg-zinc-800/50');
      headerElement.classList.add('border-b-2');
    } else if (scrollPos < 20 && headerElement.classList.contains('h-12')) {
      headerElement.classList.replace('h-12', 'h-20');
      headerElement.classList.replace('text-base', 'text-lg');
      headerElement.classList.remove('bg-zinc-200/50', 'dark:bg-zinc-800/50');
      headerElement.classList.remove('border-b-2');
    }
  });
</script>

<svelte:window bind:innerWidth={width} bind:scrollY={scrollPos} />

{#snippet topRowLink(title: string, href: Path)}
  <a
    href={resolve(href)}
    class="hidden h-full items-center opacity-60 transition-opacity hover:opacity-100 mob:flex"
  >
    {title}
  </a>
{/snippet}

<header
  class="fixed z-40 h-20 w-full border-b-zinc-300 text-lg backdrop-blur-lg transition-all dark:border-b-zinc-700"
  style="view-transition-name: header"
  bind:this={headerElement}
>
  <div class="flex h-full w-full items-center px-4 mob:hidden">
    <h1 class="text-left text-lg font-bold" translate="no">{currentTitle}</h1>
  </div>

  <div class="mx-auto hidden h-full max-w-7xl grid-cols-[1fr_auto_1fr] px-4 mob:grid">
    <div class="flex items-center gap-2">
      <img src={logo} alt="Titanium" class="h-8 w-8 rounded-md" translate="no" />
      <h1 class="hidden text-lg font-bold sm:block" translate="no">DeviceGalaxy</h1>
    </div>

    <div class="flex h-full shrink-0 items-center">
      <nav class="flex h-full shrink-0 items-center justify-center gap-4">
        {#if user}
          {@render topRowLink('Home', '')}
          {@render topRowLink('Devices', 'dash/devices')}
          {@render topRowLink('Specs', 'dash/specs')}
          {@render topRowLink('Shares', '')}
        {/if}
      </nav>
    </div>

    <div class="ml-auto flex items-center justify-center">
      {#if user}
        <p class="hidden font-bold sm:block">{user.name}</p>
        <form action="/auth/logout" method="POST" class="h-full">
          <button
            class="hidden h-full cursor-pointer items-center justify-center gap-2 px-4 opacity-60 transition-opacity hover:opacity-100 mob:flex"
            title="Log out"
            type="submit"
          >
            <LogOut size={20} class="shrink-0" />
          </button>
        </form>
      {:else}
        <a
          class="mr-4 ml-2 hidden items-center justify-center gap-1 rounded-lg border border-zinc-400 bg-zinc-300 p-1 px-2 transition-colors hover:bg-zinc-200 mob:flex dark:border-zinc-600 dark:bg-zinc-700 hover:dark:bg-zinc-800"
          href={resolve('auth/login')}
        >
          <LogIn size={20} />Log In
        </a>
      {/if}
    </div>
  </div>
</header>
