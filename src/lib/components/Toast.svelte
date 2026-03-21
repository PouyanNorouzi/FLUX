<script>
	import { fade, fly } from 'svelte/transition';

	let { toast, onClose, index = 0 } = $props();

	const icon = $derived(toast.variant === 'success' ? 'check_circle' : 'warning');
	const panelClasses = $derived(
		toast.variant === 'success'
			? 'bg-daemon-green-pulse text-signal-black'
			: 'bg-molten-commit-orange text-cold-console-white'
	);
	const role = $derived(toast.variant === 'success' ? 'status' : 'alert');
	const delay = $derived(Math.min(index, 5) * 24);
	const enterTransition = $derived(
		toast.variant === 'success'
			? { y: 10, opacity: 0.55, duration: 170, delay }
			: { y: 16, opacity: 0.45, duration: 210, delay }
	);
	const exitTransition = $derived(
		toast.variant === 'success' ? { duration: 125 } : { duration: 165 }
	);
</script>

<article
	class="brutalist-border pointer-events-auto flex w-full max-w-sm items-start gap-3 p-4 shadow-hard {panelClasses}"
	{role}
	in:fly={enterTransition}
	out:fade={exitTransition}
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
