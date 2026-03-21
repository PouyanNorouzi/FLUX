<script>
	/**
	 * @typedef {'primary' | 'secondary'} ButtonVariant
	 * @typedef {'button' | 'submit' | 'reset'} ButtonType
	 */

	/**
	 * @type {{
	 *   variant?: ButtonVariant,
	 *   type?: ButtonType,
	 *   disabled?: boolean,
	 *   loading?: boolean,
	 *   icon?: string | null,
	 *   children: import('svelte').Snippet
	 * }}
	 */
	let {
		variant = 'primary',
		type = 'button',
		disabled = false,
		loading = false,
		icon = null,
		children
	} = $props();
</script>

<button
	{type}
	disabled={disabled || loading}
	class="brutalist-button brutalist-border group flex h-14 w-full cursor-pointer items-center justify-center gap-2 font-display text-lg font-bold tracking-wider uppercase shadow-hard
		{variant === 'primary'
		? 'bg-signal-black text-cold-console-white'
		: 'bg-cold-console-white text-signal-black'}"
>
	{#if loading}
		<span class="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
	{:else if icon}
		<span
			class="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1"
			>{icon}</span
		>
	{/if}
	{@render children()}
</button>
