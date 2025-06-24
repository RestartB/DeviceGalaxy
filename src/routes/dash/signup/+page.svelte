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

<form method="POST" action="?/signUp" use:enhance>
	<label for="name">Name</label>
	<input name="name" bind:value={$formData.fullname} />

	<label for="email">Email</label>
	<input name="email" type="email" bind:value={$formData.email} />

	<label for="password">Password</label>
	<input name="password" bind:value={$formData.password} />

	<label for="confirm">Confirm Password</label>
	<input name="confirm" bind:value={$formData.passwordConfirm} />

	<button disabled={$submitting} class="w-full">
		{$submitting ? 'Submitting...' : 'Submit'}
	</button>
	{#if $errors?._errors}
		<div class="mt-3 rounded-md text-red-700">
			{$errors?._errors}
		</div>
	{/if}
</form>
