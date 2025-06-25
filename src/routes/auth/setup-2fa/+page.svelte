<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { passwordFormSchema, totpFormSchema, type PasswordFormSchema, type TotpFormSchema } from './schema';
	import type { PageData } from './$types';

	import QRCode from '@castlenine/svelte-qrcode';

	let { data }: { data: PageData } = $props();
	let totpURI = $state<string | null>(null);

	const passwordForm = superForm(data.passwordForm, {
        validators: zodClient(passwordFormSchema),
        dataType: 'json',
        onResult: ({ result }) => {
            if (result.type === 'success' && result.data?.totpURI) {
                totpURI = result.data.totpURI;
            }
        }
    });

	const { form: passwordFormData, errors: passwordErrors, message: passwordMessage, submitting: passwordSubmitting, enhance: passwordEnhance } = passwordForm;

	const totpForm = superForm(data.totpForm, {
        validators: zodClient(totpFormSchema),
        dataType: 'json'
    });

	const { form: totpFormData, errors: totpErrors, message: totpMessage, submitting: totpSubmitting, enhance: totpEnhance } = totpForm;
</script>

<div class="box-border flex h-full min-h-fit w-full items-center justify-center p-2">
	{#if totpURI}
		<form
			method="POST"
			action="?/verifyTOTP"
			class="flex h-fit w-fit flex-col items-center justify-center gap-4 rounded-xl border-2 border-zinc-400 bg-zinc-200 p-4"
			use:totpEnhance
		>
			<h1 class="text-center text-2xl font-bold">2FA Setup</h1>
			<p>
				To help keep your account secure, please setup two factor authentication. You will not be able
				to continue until this is done.
			</p>

			<p>Please scan the QR code below with your authenticator app, then enter a 2FA code from the app to verify.</p>

			<QRCode data={totpURI} />

			<p>
				Alternatively, you can manually enter the secret key into your authenticator app:
				<strong>{totpURI}</strong>
			</p>

			<div class="flex flex-col gap-2">
				<label for="totp" class="font-semibold">TOTP Code</label>
				<input
					class="rounded-full border-2 border-zinc-500 bg-zinc-300 p-2 px-4"
					id="totp"
					placeholder="123456"
					required
					bind:value={$totpFormData.totp}
				/>
			</div>

			<button
				disabled={$totpSubmitting}
				class="w-fit rounded-md border-2 border-zinc-500 bg-zinc-300 p-2 px-4"
			>
				{$totpSubmitting ? 'Verifying...' : 'Verify Code'}
			</button>
			{#if $totpErrors?._errors}
				<div class="mt-3 rounded-md text-red-700">
					{$totpErrors?._errors}
				</div>
			{/if}
		</form>
	{:else}
        <form
            method="POST"
            action="?/confirmPassword"
            class="flex h-fit w-fit flex-col items-center justify-center gap-4 rounded-xl border-2 border-zinc-400 bg-zinc-200 p-4"
            use:passwordEnhance
        >
            <h1 class="text-center text-2xl font-bold">Confirm Password</h1>
            <p>Please confirm your password to continue with 2FA setup.</p>

            <div class="flex flex-col gap-2">
                <label for="password" class="font-semibold">Password</label>
                <input
                    type="password"
                    class="rounded-full border-2 border-zinc-500 bg-zinc-300 p-2 px-4"
                    id="password"
                    placeholder="Enter your password"
                    required
                    bind:value={$passwordFormData.password}
                />
            </div>

            <button
                disabled={$passwordSubmitting}
                class="w-fit rounded-md border-2 border-zinc-500 bg-zinc-300 p-2 px-4"
            >
                {$passwordSubmitting ? 'Confirming...' : 'Confirm Password'}
            </button>
            {#if $passwordErrors?._errors}
                <div class="mt-3 rounded-md text-red-700">
                    {$passwordErrors?._errors}
                </div>
            {/if}
        </form>
	{/if}
</div>
