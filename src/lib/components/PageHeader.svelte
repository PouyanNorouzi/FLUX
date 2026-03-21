<script>
	/**
	 * @type {{
	 *   title?: string,
	 *   backLabel: string,
	 *   statusText?: string,
	 *   onBack: () => void
	 * }}
	 */
	let { title = '', backLabel, statusText = '', onBack } = $props();
</script>

<header class="sticky top-0 z-40 border-b-4 border-signal-black bg-surface px-4 py-4 lg:px-8">
	<div class="mx-auto flex w-full max-w-360 items-center justify-between gap-4">
		<button
			type="button"
			onclick={onBack}
			class="group flex items-center gap-2 font-display text-base font-bold tracking-tight uppercase transition-colors hover:text-molten-commit-orange lg:text-lg"
		>
			<span
				class="material-symbols-outlined transition-transform group-hover:-translate-x-1"
				style="font-variation-settings: 'FILL' 1;"
			>
				arrow_back
			</span>
			{backLabel}
		</button>
		{#if title}
			<div
				class="hidden flex-1 text-center font-display text-sm font-bold tracking-tight uppercase lg:block"
			>
				{title}
			</div>
		{/if}
		<div
			class="text-right font-mono text-[10px] font-bold tracking-widest text-muted uppercase sm:text-xs"
		>
			{statusText}
		</div>
	</div>
</header>
