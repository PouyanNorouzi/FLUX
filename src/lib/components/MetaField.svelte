<script>
	/**
	 * @typedef {'panel' | 'compact'} MetaFieldMode
	 */

	/**
	 * @type {{
	 *   label: string,
	 *   value: string,
	 *   mode?: MetaFieldMode
	 * }}
	 */
	let { label, value, mode = 'panel' } = $props();
</script>

{#if mode === 'compact'}
	<div class="border border-signal-black bg-cold-console-white px-3 py-2">
		<div class="text-muted">{label}</div>
		<div class="mt-1 font-bold break-all">{value}</div>
	</div>
{:else}
	<div class="border-2 border-signal-black bg-surface p-3 font-mono text-[10px] uppercase">
		<div class="mb-1 text-muted">{label}</div>
		<div class="text-xs font-bold break-all text-signal-black">{value}</div>
	</div>
{/if}
