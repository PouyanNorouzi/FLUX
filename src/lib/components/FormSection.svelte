<script>
	/**
	 * @type {{
	 *   title: string,
	 *   titleClass?: string,
	 *   sectionClass?: string,
	 *   children: import('svelte').Snippet
	 * }}
	 */
	let {
		title,
		titleClass = 'text-2xl',
		sectionClass = 'bg-cold-console-white p-6 shadow-hard lg:p-8',
		children
	} = $props();
</script>

<section class={`brutalist-border ${sectionClass}`}>
	<h2
		class={`mb-4 border-b-2 border-signal-black pb-3 font-display font-bold tracking-tighter uppercase ${titleClass}`}
	>
		{title}
	</h2>
	{@render children()}
</section>
