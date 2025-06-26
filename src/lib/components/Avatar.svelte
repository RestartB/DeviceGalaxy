<script lang="ts">
	let { size = 40, src = '', name = '', alt = 'Avatar', className = '' } = $props();
	let generatedAvatar = $state(false);
	let initials = name
		.split(' ')
		.map((part) => part.charAt(0).toUpperCase())
		.join('');

	if (src === '') {
		generatedAvatar = true;
	}
</script>

{#if generatedAvatar}
	<div
		class={`flex items-center justify-center rounded-full border-2 border-zinc-400 bg-gray-200 select-none ${className}`}
		style="width: {size}px; height: {size}px;"
	>
		<span class="text-sm font-semibold text-gray-700">
			{initials}
		</span>
	</div>
{:else}
	<img
		{src}
		{alt}
		class={`rounded-full border-2 border-zinc-400 ${className}`}
		width={size}
		height={size}
		loading="lazy"
	/>
{/if}
