<script>
	/**
	 * @type {{
	 *   id: string,
	 *   name?: string,
	 *   label: string,
	 *   type?: 'text' | 'password' | 'email',
	 *   placeholder?: string,
	 *   value?: string,
	 *   error?: boolean,
	 *   errorMessage?: string,
	 *   icon?: string | null,
	 *   requirement?: 'required' | 'optional' | null
	 * }}
	 */
	let {
		id,
		name = id,
		label,
		type = 'text',
		placeholder = '',
		value = $bindable(''),
		error = false,
		errorMessage = '',
		icon = null,
		requirement = null
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
		<span>{label}</span>
		{#if requirement}
			<span
				class={`border px-1 py-0.5 text-[9px] leading-none tracking-[0.2em] ${requirement === 'required' ? 'border-molten-commit-orange text-molten-commit-orange' : 'border-divider-gray text-muted'}`}
			>
				{requirement === 'required' ? 'REQ' : 'OPT'}
			</span>
		{/if}
	</label>
	<input
		{id}
		{name}
		{type}
		{placeholder}
		bind:value
		aria-required={requirement === 'required'}
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
