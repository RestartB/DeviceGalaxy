<script lang="ts">
	import { goto } from '$app/navigation';
	import { authClient } from '$lib/client';
	import qrcode, { QRCode } from '@castlenine/svelte-qrcode';

	let password = $state('');
	let totpInput = $state('');

	let submitting = $state(false);
	let generatedTOTP = $state(false);
	let error = $state('');

	let totpURI = $state('');
	let backupCodes = $state<string[]>([]);

	async function generateTOTP(event: Event) {
		event.preventDefault();
		submitting = true;
		error = '';

		try {
			const { data, error: signUpError } = await authClient.twoFactor.enable({
				password
			});

			if (signUpError) {
				error = signUpError.message || 'Failed to verify password.';
				return;
			}

			totpURI = data.totpURI;
			backupCodes = data.backupCodes;
			generatedTOTP = true;
		} catch (err) {
			error = 'An unexpected error occurred. Please try again.';
		} finally {
			submitting = false;
		}
	}

	async function verifyTOTPCode(event: Event) {
		event.preventDefault();
		submitting = true;
		error = '';

		try {
			const { data, error: signUpError } = await authClient.twoFactor.verifyTotp({
				code: totpInput
			});

			if (signUpError) {
				error = signUpError.message || 'Failed to enable 2FA.';
				return;
			}

			goto('/');
		} catch (err) {
			error = 'An unexpected error occurred. Please try again.';
		} finally {
			submitting = false;
		}
	}
</script>

<div class="box-border flex h-full min-h-fit w-full items-center justify-center p-2 text-center">
	{#if generatedTOTP}
		<form
			class="flex h-fit w-fit max-w-xl flex-col items-center justify-center gap-4 rounded-xl border-2 border-zinc-400 bg-zinc-200 p-4"
			onsubmit={verifyTOTPCode}
		>
			<h1 class="text-2xl font-bold">Set up 2FA</h1>
			<p>Your password has been verified. Please follow these steps to set up 2FA:</p>
			<ol class="list-inside list-decimal text-left">
				<li>
					Download an authenticator app (Authy, MS Authenticator, etc) or use a password manager
					that supports 2FA (1Password, Bitwarden, etc)
				</li>
				<li>Scan the QR code displayed, or copy the URL below</li>
				<li>Enter a verification code in the box below</li>
			</ol>

			<QRCode data={totpURI} />

			<h3 class="text-xl font-semibold">QR not working?</h3>
			<p>Copy this URL into your authenticator app:</p>
			<p class="max-w-full font-mono text-sm break-words">{totpURI}</p>

			<div class="flex flex-col gap-2">
				<label for="totp" class="font-semibold">Verify Code</label>
				<input
					class="rounded-full border-2 border-zinc-500 bg-zinc-300 p-2 px-4"
					id="totp"
					type="text"
					inputmode="numeric"
					pattern="[0-9]*"
					maxlength="6"
					bind:value={totpInput}
				/>
			</div>

			<button
				disabled={submitting}
				class="w-fit rounded-md border-2 border-zinc-500 bg-zinc-300 p-2 px-4"
			>
				{submitting ? 'Verifying...' : 'Verify'}
			</button>
			{#if error !== ''}
				<div class="text-red-700">
					{error}
				</div>
			{/if}
		</form>
	{:else}
		<form
			class="flex h-fit w-fit flex-col items-center justify-center gap-4 rounded-xl border-2 border-zinc-400 bg-zinc-200 p-4"
			onsubmit={generateTOTP}
		>
			<h1 class="text-2xl font-bold">Set up 2FA</h1>
			<p>
				To help keep your account secure, we require that you enable 2FA. To get started, please
				verify your password.
			</p>
			<div class="flex flex-col gap-2">
				<label for="password" class="font-semibold">Verify Password</label>
				<input
					class="rounded-full border-2 border-zinc-500 bg-zinc-300 p-2 px-4"
					id="password"
					type="password"
					bind:value={password}
				/>
			</div>

			<button
				disabled={submitting}
				class="w-fit rounded-md border-2 border-zinc-500 bg-zinc-300 p-2 px-4"
			>
				{submitting ? 'Verifying...' : 'Verify'}
			</button>
			{#if error !== ''}
				<div class="text-red-700">
					{error}
				</div>
			{/if}
		</form>
	{/if}
</div>
