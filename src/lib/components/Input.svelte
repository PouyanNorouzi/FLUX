<script>
	/**
	 * @type {{
	 *   id: string,
	 *   label: string,
	 *   type?: 'text' | 'password' | 'email',
	 *   placeholder?: string,
	 *   value?: string,
	 *   error?: boolean,
	 *   errorMessage?: string,
	 *   icon?: string | null
	 * }}
	 */
	let {
		id,
		label,
		type = 'text',
		placeholder = '',
		value = $bindable(''),
		error = false,
		errorMessage = '',
		icon = null
	} = $props();
</script>

<div class="flex flex-col gap-2">
	<label
		for={id}
		class="flex items-center gap-2 font-mono text-xs font-bold tracking-wider text-signal-black uppercase"
	>
		{#if icon}
			<span class="material-symbols-outlined text-[16px]">{icon}</span>
		{/if}
		{label}
	</label>
	<input
		{id}
		{type}
		{placeholder}
		bind:value
		autocomplete="off"
		class="brutalist-input h-14 w-full px-4 font-mono text-base placeholder:text-muted focus:ring-0
			{error ? 'error' : ''}"
	/>
	{#if error && errorMessage}
		<span
			class="mt-1 flex items-center gap-1 font-mono text-xs font-bold text-molten-commit-orange"
		>
			<span class="material-symbols-outlined text-[14px]">warning</span>
			{errorMessage}
		</span>
	{/if}
</div>
