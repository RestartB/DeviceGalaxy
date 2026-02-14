<script lang="ts">
  import { page } from '$app/state';

  import devicegalaxy from '$lib/images/88x31/devicegalaxy.png';
  import restart from '$lib/images/88x31/restart.png';
</script>

<footer
  style="view-transition-name: footer;"
  class="box-border flex h-fit w-full flex-wrap items-center justify-center border-t-4 border-zinc-300 bg-zinc-100 p-5 dark:border-zinc-700 dark:bg-zinc-900"
>
  <div
    class="flex h-fit w-full max-w-5xl flex-wrap items-center justify-center gap-4 md:justify-between md:gap-2.5"
  >
    <div class="xxs:justify-start flex w-60 items-center justify-center gap-2.5">
      <enhanced:img
        src="$lib/images/logo/logo_square.svg"
        alt="DeviceGalaxy Logo"
        height="60"
        width="60"
      />
      <div>
        <h1 class="font-bold" translate="no">DeviceGalaxy</h1>
        <p class="mt-1 text-sm font-light">2026, <span translate="no">Restart</span></p>
      </div>
    </div>

    <div class="flex h-full items-end justify-center gap-2.5 md:flex-col">
      <a href="https://restartb.xyz" aria-labelledby="restart-88x31" title="Restart"
        ><img
          src={restart}
          alt="Restart's 88x31"
          id="restart-88x31"
          style="image-rendering: pixelated;"
        /></a
      >
      <a href="/" aria-labelledby="devicegalaxy-88x31" title="DeviceGalaxy"
        ><img
          src={devicegalaxy}
          alt="DeviceGalaxy's 88x31"
          id="devicegalaxy-88x31"
          style="image-rendering: pixelated;"
        /></a
      >
    </div>

    <nav class="xxs:justify-end flex h-full w-60 flex-wrap justify-center gap-5">
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
        <li aria-current={page.url.pathname === '/dash' ? 'page' : undefined}>
          <a
            href="/dash"
            class="text-gray-600 transition-colors hover:text-inherit dark:text-gray-400"
          >
            <p>Dashboard</p></a
          >
        </li>
      </ul>

      <ul class="flex h-full flex-col text-base">
        <li>
          <h1 class="font-bold">Policies & More</h1>
        </li>
        <li>
          <a
            href="/server"
            class="text-gray-600 transition-colors hover:text-inherit dark:text-gray-400"
            ><p>Support Server</p></a
          >
        </li>
        <li aria-current={page.url.pathname === '/policy/tos' ? 'page' : undefined}>
          <a
            href="/policy/tos"
            class="text-gray-600 transition-colors hover:text-inherit dark:text-gray-400"
            ><p>Terms of Use</p></a
          >
        </li>
        <li aria-current={page.url.pathname === '/policy/privacy' ? 'page' : undefined}>
          <a
            href="/policy/privacy"
            class="text-gray-600 transition-colors hover:text-inherit dark:text-gray-400"
            ><p>Privacy Policy</p></a
          >
        </li>
      </ul>
    </nav>
  </div>
</footer>

<style>
  h1 {
    line-height: normal;
  }
</style>
