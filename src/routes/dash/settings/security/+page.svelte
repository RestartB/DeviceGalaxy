<script lang="ts">
  import { goto } from '$app/navigation';
  import { fade } from 'svelte/transition';
  import { toast } from 'svelte-sonner';

  import { authClient } from '$lib/client';
  import {
    X,
    Pencil,
    RefreshCw,
    Ban,
    Shield,
    Gamepad,
    Microchip,
    Phone,
    Tv,
    Tablet,
    Watch,
    Headset,
    Monitor
  } from '@lucide/svelte';

  // Get session from props
  const { data } = $props();

  type Session = {
    id: string;
    token: string;
    ipAddress: string | null | undefined;
    userAgent: string | null | undefined;
    deviceType: string;
    createdAt: Date;
    ipCountry: string;
    currentSession: boolean;
  };

  let passwordPopupOpen = $state(false);
  let oldPassword = $state('');
  let newPassword = $state('');
  let revokeSessions = $state(false);

  let reset2FAPopupOpen = $state(false);
  let resetConfirmPassword = $state('');

  let disable2FAPopupOpen = $state(false);
  let disableConfirmPassword = $state('');

  async function changePassword() {
    if (newPassword) {
      try {
        const { error } = await authClient.changePassword({
          newPassword: newPassword,
          currentPassword: oldPassword,
          revokeOtherSessions: revokeSessions
        });

        if (error) {
          toast.error(
            'Failed to update password: ' +
              (error.message
                ? error.message?.toLocaleLowerCase()
                : 'unknown error. Please try again.')
          );
          return;
        }

        passwordPopupOpen = false;
        toast.success('Password updated successfully!');

        newPassword = '';

        if (revokeSessions) {
          data.activeSessions = [];
        }
      } catch (error) {
        toast.error('Failed to update password. Please try again.');
        console.error('Error updating password:', error);
      }
    }
  }

  async function reset2FA() {
    try {
      const { data } = await authClient.twoFactor.disable({
        password: resetConfirmPassword
      });

      if (data?.status) {
        await goto('/dash/auth/setup-2fa');
      } else {
        toast.error('Failed to disable 2FA. Check your password is correct, then try again.');
      }
    } catch (error) {
      toast.error('Failed to reset 2FA. Please try again.');
      console.error('Error resetting 2FA:', error);
    }
  }

  async function disable2FA() {
    try {
      const { data } = await authClient.twoFactor.disable({
        password: disableConfirmPassword
      });

      if (data?.status) {
        window.location.reload();
      } else {
        toast.error('Failed to disable 2FA. Check your password is correct, then try again.');
      }
    } catch (error) {
      toast.error('Failed to disable 2FA. Please try again.');
      console.error('Error disabling 2FA:', error);
    }
  }

  async function revokeSession(token: string) {
    try {
      await authClient.revokeSession({ token });
      toast.success('Session revoked successfully!');

      // Remove session from list
      data.activeSessions = data.activeSessions.filter(
        (session: Session) => session.token !== token
      );
    } catch (error) {
      toast.error('Failed to revoke session. Please try again.');
      console.error('Error revoking session:', error);
    }
  }
</script>

{#if passwordPopupOpen}
  <div
    class="fixed inset-0 z-60 mt-12 flex items-center justify-center overflow-hidden bg-white/60 p-4 backdrop-blur-lg dark:bg-black/60"
    transition:fade={{ duration: 100 }}
  >
    <div
      class="absolute inset-0 z-70"
      onclick={() => (passwordPopupOpen = false)}
      aria-hidden="true"
    ></div>

    <div
      class="z-80 flex max-h-full w-full max-w-lg flex-col overflow-hidden rounded-xl border-4 border-zinc-400 bg-zinc-100 shadow-2xl dark:bg-zinc-800"
    >
      <div class="flex items-center justify-between border-b p-4">
        <h2 class="text-xl font-bold">Change Password</h2>
        <button
          onclick={() => (passwordPopupOpen = false)}
          class="cursor-pointer text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-400"
          aria-label="Close"><X /></button
        >
      </div>
      <div class="flex flex-col gap-4 p-6">
        <label for="oldPassword" class="text-sm font-medium">Old Password</label>
        <input
          type="password"
          id="oldPassword"
          name="oldPassword"
          class="w-full rounded-lg border p-2"
          bind:value={oldPassword}
        />

        {#if oldPassword.length > 0 && oldPassword.length < 8}
          <span class="text-sm text-red-500">Password must be at least 8 characters long.</span>
        {/if}

        <label for="newPassword" class="text-sm font-medium">New Password</label>
        <input
          type="password"
          id="newPassword"
          name="newPassword"
          class="w-full rounded-lg border p-2"
          bind:value={newPassword}
        />

        {#if newPassword.length > 0 && newPassword.length < 8}
          <span class="text-sm text-red-500">Password must be at least 8 characters long.</span>
        {/if}

        <div class="flex items-center justify-between gap-4">
          <div>
            <label for="revokeSessions" class="text-sm font-medium">Revoke other sessions</label>
            <p class="text-sm text-zinc-400">
              You can optionally log out other devices where you are currently logged in.
            </p>
          </div>
          <input
            type="checkbox"
            id="revokeSessions"
            name="revokeSessions"
            class="h-6 w-6"
            bind:checked={revokeSessions}
          />
        </div>
      </div>
      <div class="border-t p-6">
        <button
          type="submit"
          class="w-full cursor-pointer rounded-md bg-green-500 px-4 py-2 font-bold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-green-500"
          disabled={oldPassword === '' || newPassword === ''}
          onclick={changePassword}>Change Password</button
        >
      </div>
    </div>
  </div>
{/if}

{#if reset2FAPopupOpen}
  <div
    class="fixed inset-0 z-60 mt-12 flex items-center justify-center overflow-hidden bg-white/60 p-4 backdrop-blur-lg dark:bg-black/60"
    transition:fade={{ duration: 100 }}
  >
    <div
      class="absolute inset-0 z-70"
      onclick={() => (reset2FAPopupOpen = false)}
      aria-hidden="true"
    ></div>

    <div
      class="z-80 flex max-h-full w-full max-w-lg flex-col overflow-hidden rounded-xl border-4 border-zinc-400 bg-zinc-100 shadow-2xl dark:bg-zinc-800"
    >
      <div class="flex items-center justify-between border-b p-4">
        <h2 class="text-xl font-bold">Reset 2FA</h2>
        <button
          onclick={() => (reset2FAPopupOpen = false)}
          class="cursor-pointer text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-400"
          aria-label="Close"><X /></button
        >
      </div>
      <div class="flex flex-col gap-4 p-6">
        <p>
          Confirm your password, then press the button below to reset your 2FA settings. You will be
          prompted to set up 2FA, and you may be logged out of other devices.
        </p>

        <label for="confirmPassword" class="text-sm font-medium">Confirm Password</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          class="w-full rounded-lg border p-2"
          bind:value={resetConfirmPassword}
        />
      </div>
      <div class="border-t p-6">
        <button
          type="submit"
          class="w-full cursor-pointer rounded-md bg-red-500 px-4 py-2 font-bold text-white transition-colors hover:bg-red-600"
          disabled={resetConfirmPassword === ''}
          onclick={reset2FA}>Reset 2FA</button
        >
      </div>
    </div>
  </div>
{/if}

{#if disable2FAPopupOpen}
  <div
    class="fixed inset-0 z-60 mt-12 flex items-center justify-center overflow-hidden bg-white/60 p-4 backdrop-blur-lg dark:bg-black/60"
    transition:fade={{ duration: 100 }}
  >
    <div
      class="absolute inset-0 z-70"
      onclick={() => (disable2FAPopupOpen = false)}
      aria-hidden="true"
    ></div>

    <div
      class="z-80 flex max-h-full w-full max-w-lg flex-col overflow-hidden rounded-xl border-4 border-zinc-400 bg-zinc-100 shadow-2xl dark:bg-zinc-800"
    >
      <div class="flex items-center justify-between border-b p-4">
        <h2 class="text-xl font-bold">Disable 2FA</h2>
        <button
          onclick={() => (disable2FAPopupOpen = false)}
          class="cursor-pointer text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-400"
          aria-label="Close"><X /></button
        >
      </div>
      <div class="flex flex-col gap-4 p-6">
        <p>
          Confirm your password, then press the button below to disable 2FA for your account. Tou
          may be logged out of other devices.
        </p>

        <label for="confirmPassword" class="text-sm font-medium">Confirm Password</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          class="w-full rounded-lg border p-2"
          bind:value={disableConfirmPassword}
        />
      </div>
      <div class="border-t p-6">
        <button
          type="submit"
          class="w-full cursor-pointer rounded-md bg-red-500 px-4 py-2 font-bold text-white transition-colors hover:bg-red-600"
          disabled={disableConfirmPassword === ''}
          onclick={disable2FA}>Disable 2FA</button
        >
      </div>
    </div>
  </div>
{/if}

{#snippet sessionTile(session: Session)}
  <div
    class="flex max-w-2xl items-center justify-start gap-4 rounded-lg border-2 border-zinc-400 bg-zinc-200 p-4 dark:bg-zinc-700"
  >
    {#if session.deviceType === 'console'}
      <Gamepad size="24" />
    {:else if session.deviceType === 'embedded'}
      <Microchip size="24" />
    {:else if session.deviceType === 'mobile'}
      <Phone size="24" />
    {:else if session.deviceType === 'smarttv'}
      <Tv size="24" />
    {:else if session.deviceType === 'tablet'}
      <Tablet size="24" />
    {:else if session.deviceType === 'wearable'}
      <Watch size="24" />
    {:else if session.deviceType === 'xr'}
      <Headset size="24" />
    {:else}
      <Monitor size="24" />
    {/if}
    <div>
      <p>{session.userAgent} - {session.ipAddress}</p>
      <p class="text-sm text-zinc-500 dark:text-zinc-400">
        Created: {new Date(session.createdAt).toLocaleString()}
      </p>
    </div>
    {#if !session.currentSession}
      <button
        class="ml-auto flex w-fit cursor-pointer items-center justify-center gap-2 text-red-500 hover:text-red-700"
        onclick={() => revokeSession(session.token)}
        aria-label="Revoke session"
      >
        <X size="16" />
        Revoke
      </button>
    {/if}
  </div>
{/snippet}

<div class="flex flex-col gap-4">
  <h3 class="text-2xl font-bold">Security Settings</h3>

  <div class="flex flex-col gap-2">
    <h4 class="text-xl font-semibold">Password</h4>
    <p>Change the password that you use to log in.</p>

    <button
      class="flex w-fit cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg border-2 border-zinc-400 bg-zinc-200 p-2 font-semibold text-zinc-700 transition-colors hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
      onclick={() => (passwordPopupOpen = true)}
    >
      <Pencil size="20" />
      Edit
    </button>
  </div>

  <div class="flex flex-col gap-2">
    <h4 class="text-xl font-semibold">Manage 2FA</h4>
    <p>Enable, disable or reset your account's 2FA for enhanced security.</p>

    <div class="flex flex-wrap items-center gap-2">
      {#if data.user?.twoFactorEnabled}
        <button
          class="flex w-fit items-center justify-center gap-2 overflow-hidden rounded-lg border-2 border-zinc-400 bg-zinc-200 p-2 font-semibold text-zinc-700 transition-colors hover:bg-red-300 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-red-600"
          onclick={() => (disable2FAPopupOpen = true)}
        >
          <Ban size="20" />
          Disable
        </button>
        <button
          class="flex w-fit items-center justify-center gap-2 overflow-hidden rounded-lg border-2 border-zinc-400 bg-zinc-200 p-2 font-semibold text-zinc-700 transition-colors hover:bg-red-300 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-red-600"
          onclick={() => (reset2FAPopupOpen = true)}
        >
          <RefreshCw size="20" />
          Reset
        </button>
      {:else}
        <a
          class="flex w-fit items-center justify-center gap-2 overflow-hidden rounded-lg border-2 border-zinc-400 bg-zinc-200 p-2 font-semibold text-zinc-700 transition-colors hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
          href="/dash/auth/setup-2fa"
        >
          <Shield size="20" />
          Enable 2FA
        </a>
      {/if}
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <h4 class="text-xl font-semibold">Active Sessions</h4>
    <p>View where you're logged in currently.</p>

    <div class="flex flex-col gap-2">
      {#if data.thisSession}
        <p class="font-semibold">Current Session</p>
        {@render sessionTile(data.thisSession)}
      {/if}

      <p class="font-semibold">Other Sessions</p>
      {#if data.activeSessions.length === 0}
        <p class="text-sm text-zinc-500">No active sessions found.</p>
      {:else}
        {#each data.activeSessions as session (session.token)}
          {@render sessionTile(session)}
        {/each}
      {/if}
    </div>
  </div>
</div>
