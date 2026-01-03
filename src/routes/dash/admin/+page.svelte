<script lang="ts">
  import { fade } from 'svelte/transition';
  import { toast } from 'svelte-sonner';

  import { authClient } from '$lib/client';
  import type { UserWithRole } from 'better-auth/plugins';

  import { X } from '@lucide/svelte';

  // Get session from props
  const { data } = $props();

  let resetPasswordPopup = $state(false);
  let userEmailInput = $state('');

  let userId = $state('');
  let newPassword = $state('');

  let userIdsResult: NonNullable<
    | {
        users: UserWithRole[];
        total: number;
        limit: number | undefined;
        offset: number | undefined;
      }
    | {
        users: never[];
        total: number;
      }
  > | null = $state(null);
  let userIdsError: {
    code?: string | undefined | undefined;
    message?: string | undefined | undefined;
    status: number;
    statusText: string;
  } | null = $state(null);

  function changePassword() {
    if (userId === '' || newPassword === '') return;

    authClient.admin.setUserPassword({ newPassword, userId }).then((result) => {
      if (result.error) {
        toast.error(`Error: ${result.error.message}`);
      } else {
        toast.success('Password changed successfully.');
        resetPasswordPopup = false;
        userId = '';
        newPassword = '';
      }
    });
  }
</script>

<svelte:head>
  <title>DeviceGalaxy</title>
</svelte:head>

{#if resetPasswordPopup}
  <div
    class="fixed inset-0 z-60 mt-12 flex items-center justify-center overflow-hidden bg-white/60 p-4 backdrop-blur-lg dark:bg-black/60"
    transition:fade={{ duration: 100 }}
  >
    <div
      class="absolute inset-0 z-70"
      onclick={() => (resetPasswordPopup = false)}
      aria-hidden="true"
    ></div>

    <div
      class="z-80 flex max-h-full w-full max-w-lg flex-col overflow-hidden rounded-xl border-4 border-zinc-400 bg-zinc-100 shadow-2xl dark:bg-zinc-800"
    >
      <div class="flex items-center justify-between border-b p-4">
        <h2 class="text-xl font-bold">Change User Password</h2>
        <button
          onclick={() => (resetPasswordPopup = false)}
          class="cursor-pointer text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-400"
          aria-label="Close"><X /></button
        >
      </div>
      <div class="flex flex-col gap-4 p-6">
        <label for="userId" class="text-sm font-medium">User ID</label>
        <input
          type="text"
          id="userId"
          name="userId"
          class="w-full rounded-lg border p-2"
          bind:value={userId}
        />

        <label for="newPassword" class="text-sm font-medium">New Password</label>
        <input
          type="password"
          id="newPassword"
          name="newPassword"
          class="w-full rounded-lg border p-2"
          bind:value={newPassword}
        />
      </div>
      <div class="border-t p-6">
        <button
          type="submit"
          class="w-full cursor-pointer rounded-md bg-green-500 px-4 py-2 font-bold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-green-500"
          disabled={userId === '' || newPassword === ''}
          onclick={changePassword}>Change Password</button
        >
      </div>
    </div>
  </div>
{/if}

<div class="flex w-full max-w-480 flex-col gap-4">
  <h1 class="text-4xl font-bold">Admin Dashboard</h1>
  <button
    class="w-fit cursor-pointer rounded-lg border-2 border-zinc-400 bg-red-200 p-2 font-semibold transition-colors hover:bg-red-300 dark:bg-red-700 dark:hover:bg-red-600"
    onclick={() => (resetPasswordPopup = true)}
  >
    Reset Password
  </button>
  <div class="flex w-fit gap-2">
    <input
      type="email"
      placeholder="User Email"
      class="w-full rounded-lg border-2 border-zinc-400 bg-zinc-200 p-1 px-2 dark:bg-zinc-700"
      bind:value={userEmailInput}
    />
    <button
      class="w-fit shrink-0 cursor-pointer rounded-lg border-2 border-zinc-400 bg-zinc-200 p-2 font-semibold transition-colors hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600"
      onclick={async () => {
        userIdsResult = null;
        userIdsError = null;

        const result = await authClient.admin.listUsers({
          query: {
            searchValue: userEmailInput,
            searchField: 'email',
            searchOperator: 'starts_with',
            limit: 1
          }
        });

        if (result.data) {
          userIdsResult = result.data;
        }

        if (result.error) {
          userIdsError = result.error;
        }
      }}
    >
      Get User ID
    </button>
  </div>
  {#if userIdsError}
    <p class="text-red-600">Error: {userIdsError.message}</p>
  {:else if userIdsResult && userIdsResult.users.length > 0}
    <p>User ID: {userIdsResult.users[0].id} ({userIdsResult.users[0].email})</p>
  {:else}
    <p>User not found.</p>
  {/if}
</div>
