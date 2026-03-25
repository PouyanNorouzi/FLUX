<script>
	import TagChip from '$lib/components/TagChip.svelte';

	/**
	 * @type {{
	 *   label: string,
	 *   placeholder?: string,
	 *   tags: string[],
	 *   inputValue?: string,
	 *   errorMessage?: string,
	 *   requirementLabel?: 'required' | 'optional' | null,
	 *   onAdd: (value: string) => void,
	 *   onRemove: (value: string) => void
	 * }}
	 */
	let {
		label,
		placeholder = 'VALUE...',
		tags,
		inputValue = $bindable(''),
		errorMessage = '',
		requirementLabel = null,
		onAdd,
		onRemove
	} = $props();

	function handleAdd() {
		onAdd(inputValue);
	}
</script>

<div class="flex flex-col gap-4">
	<div
		class="flex items-center gap-2 font-mono text-[10px] font-bold tracking-widest text-signal-black uppercase sm:text-xs"
	>
		<span>{label}</span>
		{#if requirementLabel}
			<span
				class={`border px-1 py-0.5 text-[9px] leading-none tracking-[0.2em] ${requirementLabel === 'required' ? 'border-molten-commit-orange text-molten-commit-orange' : 'border-divider-gray text-muted'}`}
			>
				{requirementLabel === 'required' ? 'REQ' : 'OPT'}
			</span>
		{/if}
	</div>
	{#if errorMessage}
		<div
			class="border-2 border-molten-commit-orange bg-cold-console-white p-3 font-mono text-xs text-molten-commit-orange uppercase"
		>
			{errorMessage}
		</div>
	{/if}

	<div class="flex flex-wrap gap-2">
		{#each tags as tag (tag)}
			<TagChip label={tag} onRemove={() => onRemove(tag)} />
		{/each}
	</div>

	<div class="flex gap-2">
		<label for={label} class="sr-only">{label}</label>
		<input
			id={label}
			type="text"
			{placeholder}
			bind:value={inputValue}
			aria-required={requirementLabel === 'required'}
			class="brutalist-border flex-1 border-2 border-signal-black bg-cold-console-white px-3 py-2 font-mono text-sm uppercase outline-none focus:border-molten-commit-orange"
			onkeydown={(e) => {
				if (e.key === 'Enter') {
					e.preventDefault();
					handleAdd();
				}
			}}
		/>
		<button
			type="button"
			onclick={handleAdd}
			class="brutalist-border border-2 border-signal-black bg-signal-black px-4 py-2 font-mono text-sm font-bold text-cold-console-white transition-colors hover:bg-molten-commit-orange hover:text-signal-black"
		>
			ADD
		</button>
	</div>
</div>
