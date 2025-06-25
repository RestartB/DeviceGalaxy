<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { formSchema, type FormSchema } from './schema';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let form = $derived(
		superForm(data.form, {
			validators: zodClient(formSchema),
			dataType: 'json'
		})
	);

	let formData = $derived(form.form);
	let errors = $derived(form.errors);
	let message = $derived(form.message);
	let submitting = $derived(form.submitting);

	let enhance = $derived(form.enhance);
</script>

<div class="box-border flex h-full min-h-fit w-full items-center justify-center p-2">
	<form
		method="POST"
		action="?/verifyTOTP"
		class="flex h-fit w-fit flex-col items-center justify-center gap-4 rounded-xl border-2 border-zinc-400 bg-zinc-200 p-4"
		use:enhance
	>
		<h1 class="text-center text-2xl font-bold">2FA Setup</h1>
		<p>
			To help keep your account secure, please setup two factor authentication. You will not be able
			to continue until this is done.
		</p>

		<p>Please scan the QR code below with your authenticator app, then enter a 2FA code from the app to verify.</p>

		<div class="flex flex-col gap-2">
			<label for="totp" class="font-semibold">TOTP Code</label>
			<input
				class="rounded-full border-2 border-zinc-500 bg-zinc-300 p-2 px-4"
				id="totp"
				placeholder="123456"
				required
				bind:value={$formData.totp}
			/>
		</div>

		<button
			disabled={$submitting}
			class="w-fit rounded-md border-2 border-zinc-500 bg-zinc-300 p-2 px-4"
		>
			{$submitting ? 'Verifying...' : 'Verify Code'}
		</button>
		{#if $errors?._errors}
			<div class="mt-3 rounded-md text-red-700">
				{$errors?._errors}
			</div>
		{/if}
	</form>
</div>
