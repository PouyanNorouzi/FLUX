<script>
	/**
	 * @type {{
	 *   label: string,
	 *   onRemove?: (() => void) | null
	 * }}
	 */
	let { label, onRemove = null } = $props();
</script>

{#if onRemove}
	<button
		type="button"
		onclick={onRemove}
		class="group flex items-center gap-2 border-2 border-signal-black bg-signal-black px-3 py-1 font-mono text-xs font-bold text-cold-console-white transition-colors hover:border-molten-commit-orange hover:bg-molten-commit-orange hover:text-signal-black"
	>
		{label}
		<span class="material-symbols-outlined text-sm opacity-70 group-hover:opacity-100">close</span>
	</button>
{:else}
	<span class="border border-signal-black bg-surface px-2 py-1 font-mono text-[11px] uppercase"
		>{label}</span
	>
{/if}
