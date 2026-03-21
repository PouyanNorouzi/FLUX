<script>
	import { fade, fly } from 'svelte/transition';

	let { toast, onClose } = $props();

	const icon = $derived(toast.variant === 'success' ? 'check_circle' : 'warning');
	const panelClasses = $derived(
		toast.variant === 'success'
			? 'bg-daemon-green-pulse text-signal-black'
			: 'bg-molten-commit-orange text-cold-console-white'
	);
	const role = $derived(toast.variant === 'success' ? 'status' : 'alert');
</script>

<article
	class="brutalist-border pointer-events-auto flex w-full max-w-sm items-start gap-3 p-4 shadow-hard {panelClasses}"
	{role}
	in:fly={{ y: 12, duration: 160 }}
	out:fade={{ duration: 140 }}
>
	<span class="material-symbols-outlined pt-0.5">{icon}</span>
	<div class="flex min-w-0 flex-1 flex-col gap-1">
		<span class="font-display text-lg leading-none font-bold uppercase">{toast.title}</span>
		<p class="font-mono text-xs font-medium wrap-break-word uppercase">{toast.message}</p>
	</div>
	{#if toast.dismissible}
		<button
			type="button"
			onclick={onClose}
			class="ml-auto shrink-0 transition-opacity hover:opacity-70"
			aria-label="Dismiss toast"
		>
			<span class="material-symbols-outlined text-sm">close</span>
		</button>
	{/if}
</article>
