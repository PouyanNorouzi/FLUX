<script>
	/**
	 * @type {{
	 *   ingredient: { id: string, quantity: string, unit: string, name: string, note?: string },
	 *   index: number,
	 *   errors?: { qty?: string, unit?: string, name?: string },
	 *   onChange: (field: 'quantity' | 'unit' | 'name' | 'note', value: string) => void,
	 *   onRemove: () => void
	 * }}
	 */
	let { ingredient, index, errors = {}, onChange, onRemove } = $props();
</script>

<div
	class="grid grid-cols-1 gap-2 border-b border-divider-gray pb-3 last:border-b-0 sm:grid-cols-4"
>
	<div class="sm:col-span-1">
		<label
			for={`ingredient_${ingredient.id ?? index}_qty`}
			class="block text-[10px] font-bold tracking-widest text-muted uppercase"
		>
			QTY
		</label>
		<input
			id={`ingredient_${ingredient.id ?? index}_qty`}
			type="text"
			placeholder="1"
			value={ingredient.quantity}
			oninput={(event) => onChange('quantity', event.currentTarget.value)}
			class={`brutalist-border w-full border-2 border-signal-black bg-cold-console-white px-2 py-1 font-mono text-sm outline-none ${
				errors.qty
					? 'border-molten-commit-orange focus:border-molten-commit-orange'
					: 'focus:border-molten-commit-orange'
			}`}
		/>
		{#if errors.qty}
			<p class="mt-1 text-[10px] text-molten-commit-orange">{errors.qty}</p>
		{/if}
	</div>

	<div class="sm:col-span-1">
		<label
			for={`ingredient_${ingredient.id ?? index}_unit`}
			class="block text-[10px] font-bold tracking-widest text-muted uppercase"
		>
			UNIT
		</label>
		<input
			id={`ingredient_${ingredient.id ?? index}_unit`}
			type="text"
			placeholder="CUP"
			value={ingredient.unit}
			oninput={(event) => onChange('unit', event.currentTarget.value)}
			class={`brutalist-border w-full border-2 border-signal-black bg-cold-console-white px-2 py-1 font-mono text-sm uppercase outline-none ${
				errors.unit
					? 'border-molten-commit-orange focus:border-molten-commit-orange'
					: 'focus:border-molten-commit-orange'
			}`}
		/>
		{#if errors.unit}
			<p class="mt-1 text-[10px] text-molten-commit-orange">{errors.unit}</p>
		{/if}
	</div>

	<div class="sm:col-span-1">
		<label
			for={`ingredient_${ingredient.id ?? index}_name`}
			class="block text-[10px] font-bold tracking-widest text-muted uppercase"
		>
			NAME
		</label>
		<input
			id={`ingredient_${ingredient.id ?? index}_name`}
			type="text"
			placeholder="garlic"
			value={ingredient.name}
			oninput={(event) => onChange('name', event.currentTarget.value)}
			class={`brutalist-border w-full border-2 border-signal-black bg-cold-console-white px-2 py-1 font-mono text-sm outline-none ${
				errors.name
					? 'border-molten-commit-orange focus:border-molten-commit-orange'
					: 'focus:border-molten-commit-orange'
			}`}
		/>
		{#if errors.name}
			<p class="mt-1 text-[10px] text-molten-commit-orange">{errors.name}</p>
		{/if}
	</div>

	<div class="flex flex-col sm:col-span-1">
		<label
			for={`ingredient_${ingredient.id ?? index}_note`}
			class="block text-[10px] font-bold tracking-widest text-muted uppercase"
		>
			NOTE
		</label>
		<div class="flex gap-1">
			<input
				id={`ingredient_${ingredient.id ?? index}_note`}
				type="text"
				placeholder="minced"
				value={ingredient.note}
				oninput={(event) => onChange('note', event.currentTarget.value)}
				class="brutalist-border flex-1 border-2 border-signal-black bg-cold-console-white px-2 py-1 font-mono text-sm outline-none focus:border-molten-commit-orange"
			/>
			<button
				type="button"
				onclick={onRemove}
				class="border-2 border-molten-commit-orange bg-molten-commit-orange px-2 py-1 text-signal-black transition-colors hover:bg-signal-black hover:text-molten-commit-orange"
			>
				<span class="material-symbols-outlined text-lg">close</span>
			</button>
		</div>
	</div>
</div>
