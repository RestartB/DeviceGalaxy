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
		<h1 class="text-center text-2xl font-bold">Enter 2FA Code</h1>
		<div class="flex flex-col gap-2">
			<label for="totp" class="font-semibold">2FA Code</label>
			<input
				class="rounded-full border-2 border-zinc-500 bg-zinc-300 p-2 px-4"
				id="totp"
				required
				bind:value={$formData.code}
			/>
		</div>

		<button
			disabled={$submitting}
			class="w-fit rounded-md border-2 border-zinc-500 bg-zinc-300 p-2 px-4"
		>
			{$submitting ? 'Logging in...' : 'Log in'}
		</button>
		{#if $errors?._errors}
			<div class="mt-3 rounded-md text-red-700">
				{$errors?._errors}
			</div>
		{/if}
	</form>
</div>
