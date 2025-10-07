<script lang="ts">
  import { fade } from 'svelte/transition';
  import { toast } from 'svelte-sonner';

  import ClaimSubdomainForm from '$lib/components/forms/claim_subdomain/Form.svelte';
  import DeleteSubdomainForm from '$lib/components/forms/delete_subdomain/Form.svelte';
  import DiscordTokenForm from '$lib/components/forms/discord_token/Form.svelte';
  import { X, Clipboard, Plus, Check } from '@lucide/svelte';

  const { data } = $props();

  let toRevoke = $state('');
  let revokePopupOpen = $state(false);

  async function createAccountShare() {
    try {
      const request = await fetch('/api/share/create_share', {
        method: 'POST',
        body: JSON.stringify({ type: 0 }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (request.ok) {
        window.location.reload();
      } else {
        toast.error('Failed to create share link. Please try again later.');
      }
    } catch (error) {
      console.error('Error creating account share link:', error);
      toast.error('An error occurred while creating the share link.');
    }
  }

  async function revokeShare() {
    try {
      const request = await fetch(`/api/share/revoke_share?id=${toRevoke}`, {
        method: 'DELETE'
      });

      if (request.ok) {
        window.location.reload();
      } else {
        toast.error('Failed to revoke share. Please try again later.');
      }
    } catch (error) {
      console.error('Error revoking share:', error);
      toast.error('An error occurred while revoking the share.');
    }
  }
</script>

{#snippet copyButton(shareId: string)}
  <button
    class="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-500 p-2 text-white transition-colors hover:bg-blue-600"
    onclick={() => {
      navigator.clipboard.writeText(`${window.location.origin}/share/${shareId}`);
      toast.success('Copied to clipboard!');
    }}
  >
    <Clipboard size="20" />
    <span class="xs:block hidden">Copy</span>
  </button>
{/snippet}

{#snippet revokeButton(shareId: string)}
  <button
    class="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-red-200 p-2 transition-colors hover:bg-red-300 dark:bg-red-700 dark:hover:bg-red-800"
    onclick={() => {
      toRevoke = shareId || '';
      revokePopupOpen = true;
    }}
  >
    <X size="20" />
    <span class="xs:block hidden">Revoke</span>
  </button>
{/snippet}

<svelte:head>
  <title>DeviceGalaxy - Shares</title>
</svelte:head>

{#if data.user}
  <div class="flex w-full max-w-[1920px] flex-col gap-4">
    <div class="flex flex-col gap-2">
      <h1 class="text-4xl font-bold">Shares</h1>
      <p>View and manage all of your share links.</p>
    </div>

    <div class="flex flex-col gap-2">
      <h2 class="text-2xl font-semibold">Custom Subdomain</h2>
      <p>
        Claim a custom subdomain to quickly share your galaxy and connect to your Discord profile.
      </p>
    </div>

    <ol class="flex list-none flex-col gap-2">
      <!-- prettier-ignore -->
      <li>
        <h3
          class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-zinc-300 dark:bg-zinc-700 text-center font-bold"
        >
          1
        </h3>
        Click the <strong>Claim Subdomain</strong> button below to claim a subdomain.
      </li>
      <li>
        <h3
          class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-zinc-300 text-center font-bold dark:bg-zinc-700"
        >
          2
        </h3>
        To connect the subdomain to Discord, add the subdomain to your Discord profile connections, and
        select HTTPS as the challenge type.
      </li>
      <!-- prettier-ignore -->
      <li>
        <h3
          class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-zinc-300 dark:bg-zinc-700 text-center font-bold"
        >
          3
        </h3>
        Click the <strong>Enter Discord Content</strong> button below, then follow the steps to complete
        the challenge and link the subdomain to your Discord profile.
      </li>
    </ol>

    {#if data.user.subdomain}
      <p>
        <Check size={20} class="inline" />
        <a
          href={`https://${data.user.subdomain}.devicegalaxy.me`}
          target="_blank"
          class="font-bold text-blue-500 hover:underline">{data.user.subdomain}.devicegalaxy.me</a
        > is your current subdomain.
      </p>
    {/if}

    {#if data.subdomainForm && data.discordForm && data.user}
      <div class="flex items-center gap-2">
        <ClaimSubdomainForm sourceForm={data.subdomainForm} user={data.user} />
        {#if data.user.subdomain}
          <DeleteSubdomainForm sourceForm={data.deleteSubdomainForm} user={data.user} />
          <DiscordTokenForm sourceForm={data.discordForm} user={data.user} />
        {/if}
      </div>
    {/if}

    <hr class="w-full border-t-2 border-zinc-800 dark:border-zinc-400" />

    <div class="flex flex-col gap-2">
      <h2 class="text-2xl font-semibold">Account Shares</h2>
      <p>Share your entire collection of devices.</p>
    </div>
    <button
      class="flex w-fit cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-zinc-400 bg-blue-500 px-4 py-2 text-white"
      onclick={createAccountShare}
    >
      <Plus size="20" />
      Create Link
    </button>
    {#if data.accountShares && data.accountShares.length > 0}
      <ul class="flex flex-col gap-2">
        {#each data.accountShares as share, index}
          <li class="flex w-full items-center justify-between gap-2">
            <div>
              <a
                href={`/share/${share.id}`}
                class="text-xl font-semibold text-wrap text-blue-500 hover:underline"
                target="_blank"
              >
                /share/{share.id}
              </a>
            </div>
            <div class="flex items-center gap-2">
              {@render copyButton(share.id || '')}
              {@render revokeButton(share.id || '')}
            </div>
          </li>
          {#if index < data.accountShares.length - 1}
            <li>
              <hr class="w-full border-zinc-300 dark:border-zinc-600" />
            </li>
          {/if}
        {/each}
      </ul>
    {:else}
      <p class="text-zinc-500 dark:text-zinc-300">No shares available.</p>
    {/if}

    <hr class="w-full border-t-2 border-zinc-800 dark:border-zinc-400" />

    <div class="flex flex-col gap-2">
      <h2 class="text-2xl font-semibold">Device Shares</h2>
      <p>
        To share a specific device, go to the devices page, find the device to share, click the menu
        button, then click "Create Share Link".
      </p>
    </div>
    {#if data.deviceShares && data.deviceShares.length > 0}
      <ul class="flex flex-col gap-2">
        {#each data.deviceShares as share, index}
          <li class="flex w-full items-center justify-between gap-2">
            <div>
              <h3 class="text-xl font-semibold" translate="no">{share.deviceName}</h3>
              <a
                href={`/share/${share.shareId}`}
                class="text-wrap text-blue-500 hover:underline"
                target="_blank"
              >
                /share/{share.shareId}
              </a>
            </div>
            <div class="flex items-center gap-2">
              {@render copyButton(share.shareId || '')}
              {@render revokeButton(share.shareId || '')}
            </div>
          </li>
          {#if index < data.deviceShares.length - 1}
            <li>
              <hr class="w-full border-zinc-300 dark:border-zinc-600" />
            </li>
          {/if}
        {/each}
      </ul>
    {:else}
      <p class="text-zinc-500 dark:text-zinc-300">No shares available.</p>
    {/if}
  </div>
{/if}

{#if revokePopupOpen}
  <div
    class="fixed inset-0 z-60 mt-12 flex items-center justify-center overflow-hidden bg-white/60 p-4 backdrop-blur-lg dark:bg-black/60"
    transition:fade={{ duration: 100 }}
  >
    <div
      class="absolute inset-0 z-70"
      onclick={() => (revokePopupOpen = false)}
      aria-hidden="true"
    ></div>

    <div
      class="z-80 flex max-h-full w-full max-w-lg flex-col overflow-hidden rounded-xl border-4 border-zinc-400 bg-zinc-100 shadow-2xl dark:bg-zinc-800"
    >
      <div class="flex items-center justify-between border-b p-4">
        <h2 class="text-xl font-bold">Revoke Share</h2>
        <button
          onclick={() => (revokePopupOpen = false)}
          class="cursor-pointer text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-400"
          aria-label="Close"><X /></button
        >
      </div>

      <div class="flex flex-col gap-4 p-6">
        <p>
          When the share link is revoked, it will no longer be accessible. You can create a new
          share link at any time.
        </p>
      </div>

      <div class="border-t p-6">
        <button
          onclick={revokeShare}
          class="w-full cursor-pointer rounded-lg bg-red-500 p-2 text-white hover:bg-red-600"
        >
          Revoke
        </button>
      </div>
    </div>
  </div>
{/if}
