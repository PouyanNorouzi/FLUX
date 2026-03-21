<script>
	/**
	 * @type {{
	 *   step: { id: string, instruction: string },
	 *   index: number,
	 *   errorMessage?: string,
	 *   onRemove: () => void
	 * }}
	 */
	let { step, index, errorMessage = '', onRemove } = $props();
</script>

<div class="border-b border-divider-gray pb-3 last:border-b-0">
	<label
		for={`step_${step.id ?? index}`}
		class="block text-[10px] font-bold tracking-widest text-muted uppercase"
	>
		STEP {String(index + 1).padStart(2, '0')}
	</label>
	<div class="flex gap-2">
		<textarea
			id={`step_${step.id ?? index}`}
			rows="2"
			placeholder="Step instruction..."
			bind:value={step.instruction}
			class={`brutalist-border flex-1 border-2 border-signal-black bg-cold-console-white px-3 py-2 font-mono text-sm outline-none ${
				errorMessage
					? 'border-molten-commit-orange focus:border-molten-commit-orange'
					: 'focus:border-molten-commit-orange'
			}`}
		></textarea>
		<button
			type="button"
			onclick={onRemove}
			class="border-2 border-molten-commit-orange bg-molten-commit-orange px-3 py-2 text-signal-black transition-colors hover:bg-signal-black hover:text-molten-commit-orange"
		>
			<span class="material-symbols-outlined">close</span>
		</button>
	</div>
	{#if errorMessage}
		<p class="mt-1 text-[10px] text-molten-commit-orange">{errorMessage}</p>
	{/if}
</div>
