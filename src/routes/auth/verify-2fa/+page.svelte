<script lang="ts">
	import { goto } from '$app/navigation';
	import { authClient } from '$lib/client';

	let totpInput = $state('');

	let submitting = $state(false);
	let error = $state('');

	async function handleSubmit(event: Event) {
		event.preventDefault();
		submitting = true;
		error = '';

		try {
			const { data, error: signInError } = await authClient.twoFactor.verifyTotp({
				code: totpInput
			});

			if (signInError) {
				error = signInError.message || 'Failed to verify 2FA code.';
				return;
			}

			await goto('/');
		} catch (err) {
			error = 'An unexpected error occurred. Please try again.';
		} finally {
			submitting = false;
		}
	}
</script>

<div class="box-border flex h-full min-h-fit w-full items-center justify-center p-2 text-center">
	<form
		class="flex h-fit w-fit flex-col items-center justify-center gap-4 rounded-xl border-2 border-zinc-400 bg-zinc-200 p-4"
		onsubmit={handleSubmit}
	>
		<h1 class="text-2xl font-bold">Two Factor Authentication</h1>
		<p>Please enter a 2FA code from your authenticator app.</p>
		<div class="flex flex-col gap-2">
			<label for="totp" class="font-semibold">Code</label>
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
</div>
