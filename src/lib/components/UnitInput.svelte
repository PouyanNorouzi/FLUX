<script>
	import { INGREDIENT_UNIT_SUGGESTIONS } from '$lib/ingredient-units.js';

	/**
	 * @type {{
	 *   id: string,
	 *   value: string,
	 *   placeholder?: string,
	 *   hasError?: boolean,
	 *   onChange: (value: string) => void
	 * }}
	 */
	let { id, value, placeholder = 'CUP', hasError = false, onChange } = $props();

	let isFocused = $state(false);

	const filteredUnits = $derived.by(() => {
		const query = value.trim().toLowerCase();
		if (!query) {
			return [];
		}
		return INGREDIENT_UNIT_SUGGESTIONS.filter((unit) => unit.toLowerCase().includes(query)).slice(0, 8);
	});

	const showSuggestions = $derived.by(() => isFocused && filteredUnits.length > 0);

	/** @param {Event & { currentTarget: EventTarget & HTMLInputElement }} event */
	function handleInput(event) {
		onChange(event.currentTarget.value);
	}

	/** @param {string} unit */
	function applySuggestion(unit) {
		onChange(unit);
		isFocused = false;
	}
</script>

<div class="relative">
	<input
		{id}
		type="text"
		autocomplete="off"
		autocorrect="off"
		autocapitalize="off"
		spellcheck="false"
		{placeholder}
		value={value}
		onfocus={() => (isFocused = true)}
		onblur={() => {
			setTimeout(() => {
				isFocused = false;
			}, 120);
		}}
		oninput={handleInput}
		class={`brutalist-border w-full border-2 border-signal-black bg-cold-console-white px-2 py-1 font-mono text-sm uppercase outline-none ${
			hasError
				? 'border-molten-commit-orange focus:border-molten-commit-orange'
				: 'focus:border-molten-commit-orange'
		}`}
	/>

	{#if showSuggestions}
		<ul
			class="absolute z-20 mt-1 max-h-44 w-full overflow-y-auto border-2 border-signal-black bg-cold-console-white shadow-hard"
		>
			{#each filteredUnits as unit (unit)}
				<li>
					<button
						type="button"
						onmousedown={(event) => {
							event.preventDefault();
							applySuggestion(unit);
						}}
						class="w-full border-b border-divider-gray px-2 py-1 text-left font-mono text-xs tracking-wider uppercase last:border-b-0 hover:bg-signal-black hover:text-cold-console-white"
					>
						{unit}
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	input:focus {
		box-shadow: 6px 6px 0 var(--color-signal-black);
	}
</style>
