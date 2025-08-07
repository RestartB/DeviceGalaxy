<script lang="ts">
  import { page } from '$app/state';

  import titanium from '$lib/images/88x31/titanium.png';
  import restart from '$lib/images/88x31/restart.png';
</script>

<footer
  style="view-transition-name: footer;"
  class="border-titanium-border box-border flex h-fit w-full flex-wrap items-center justify-center border-t-4 bg-zinc-100 p-5 dark:bg-zinc-900"
>
  <div
    class="flex h-fit w-full max-w-5xl flex-wrap items-center justify-center gap-4 sm:justify-between"
  >
    <div class="flex w-[196px] items-center justify-center gap-2.5">
      <enhanced:img
        src="$lib/images/logo/logo_square.svg"
        alt="DeviceGalaxy Logo"
        height="60"
        width="60"
      />
      <div>
        <h1 class="text-xl font-bold" translate="no">DeviceGalaxy</h1>
        <p class="mt-1 text-sm font-light">2025, <span translate="no">Restart</span></p>
      </div>
    </div>

    <div class="flex h-full flex-col items-end justify-center gap-2.5">
      <a href="https://restartb.xyz" aria-labelledby="restart-88x31" title="Restart"
        ><img
          src={restart}
          alt="Restart's 88x31"
          id="restart-88x31"
          style="image-rendering: pixelated;"
        /></a
      >
      <a href="https://titaniumbot.me" aria-labelledby="titanium-88x31" title="Titanium"
        ><img
          src={titanium}
          alt="Titanium's 88x31"
          id="titanium-88x31"
          style="image-rendering: pixelated;"
        /></a
      >
    </div>

    <nav class="flex h-full flex-wrap justify-end gap-5 text-center sm:w-[196px] sm:text-end">
      <ul class="flex h-full flex-col text-base">
        <li>
          <h1 class="font-bold">Navigation</h1>
        </li>
        <li aria-current={page.url.pathname === '/' ? 'page' : undefined}>
          <a href="/" class="text-gray-600 transition-colors hover:text-inherit dark:text-gray-400">
            <p>Home</p></a
          >
        </li>
        <li aria-current={page.url.pathname === '/open-source' ? 'page' : undefined}>
          <a
            href="/open-source"
            class="text-gray-600 transition-colors hover:text-inherit dark:text-gray-400"
          >
            <p>Open Source</p></a
          >
        </li>
        <li aria-current={page.url.pathname.startsWith('/dash') ? 'page' : undefined}>
          <a
            href="/dash"
            class="text-gray-600 transition-colors hover:text-inherit dark:text-gray-400"
          >
            <p>Dashboard</p></a
          >
        </li>
      </ul>
    </nav>
  </div>
</footer>
