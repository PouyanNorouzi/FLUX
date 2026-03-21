<script>
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';

	let { data } = $props();

	const TAG_LIST = [
		'[ALL]',
		'[VEGAN]',
		'[HIGH-PROTEIN]',
		'[DESSERT]',
		'[PASTA]',
		'[QUICK]',
		'[CONDIMENT]',
		'[SIDE]',
		'[MEAT]',
		'[CARBS]'
	];

	let query = $state('');
	let activeTag = $state('[ALL]');
	let loading = $state(true);
	let showError = $state(false);

	onMount(() => {
		const t = setTimeout(() => {
			loading = false;
		}, 400);
		return () => clearTimeout(t);
	});

	const filteredRecords = $derived(
		data.records.filter((r) => {
			const q = query.trim().toLowerCase();
			const matchQuery = !q || r.title.toLowerCase().includes(q);
			const matchTag = activeTag === '[ALL]' || r.tags.includes(activeTag);
			return matchQuery && matchTag;
		})
	);
</script>

<svelte:head>
	<title>Vault Index — FLUX Recipe Vault</title>
	<link
		href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="flex min-h-screen flex-col">
	<!-- Top Status Ticker -->
	<header
		class="relative z-20 flex shrink-0 items-center justify-between border-b-4 border-signal-black bg-signal-black px-4 py-2 font-mono text-xs font-medium tracking-widest text-cold-console-white uppercase"
	>
		<div class="flex items-center gap-4">
			<span class="flex items-center gap-2">
				<span class="h-2 w-2 animate-pulse rounded-full bg-daemon-green-pulse"></span>
				POUDB v1.0.4
			</span>
			<span class="hidden opacity-50 sm:inline">|</span>
			<span class="hidden sm:inline">LATENCY: {data.stats.latency}</span>
			<span class="hidden opacity-50 md:inline">|</span>
			<span class="hidden md:inline">TCP PORT: 8080</span>
		</div>
		<div class="flex items-center gap-4">
			<span>USER_AUTH: ROOT</span>
			<button
				onclick={() => goto(resolve('/'))}
				class="border border-cold-console-white px-3 py-1 text-[10px] font-bold transition-colors hover:border-molten-commit-orange hover:bg-molten-commit-orange"
			>
				LOGOUT
			</button>
		</div>
	</header>

	<!-- Main Layout Grid -->
	<main class="flex flex-1 flex-col overflow-hidden lg:flex-row">
		<!-- Sidebar (20%) -->
		<aside
			class="relative z-10 flex w-full shrink-0 flex-col gap-8 overflow-y-auto border-b-4 border-signal-black bg-surface p-6 lg:w-1/5 lg:border-r-4 lg:border-b-0"
		>
			<!-- SYS_STATS -->
			<div class="flex flex-col gap-2">
				<h2
					class="border-b-2 border-signal-black pb-2 font-display text-xl font-bold tracking-tighter"
				>
					SYS_STATS
				</h2>
				<ul class="mt-2 flex flex-col gap-3 font-mono text-sm">
					<li class="flex justify-between border-b border-divider-gray pb-1">
						<span class="opacity-70">TOTAL_REC:</span>
						<span class="font-bold">{data.stats.total}</span>
					</li>
					<li class="flex justify-between border-b border-divider-gray pb-1">
						<span class="opacity-70">LAST_SYNC:</span>
						<span class="font-bold">{data.stats.lastSync}</span>
					</li>
					<li class="flex justify-between border-b border-divider-gray pb-1">
						<span class="opacity-70">DB_SIZE:</span>
						<span class="font-bold">{data.stats.dbSize}</span>
					</li>
				</ul>
			</div>

			<!-- METADATA_TAGS -->
			<div class="flex flex-1 flex-col gap-2">
				<h2
					class="border-b-2 border-signal-black pb-2 font-display text-xl font-bold tracking-tighter"
				>
					METADATA_TAGS
				</h2>
				<div class="mt-4 flex flex-wrap gap-2">
					{#each TAG_LIST as tag (tag)}
						<button
							onclick={() => (activeTag = tag)}
							class="border border-signal-black px-2 py-1 font-mono text-[10px] font-bold uppercase transition-colors {activeTag ===
							tag
								? 'bg-signal-black text-cold-console-white'
								: 'bg-cold-console-white text-signal-black hover:bg-signal-black hover:text-cold-console-white'}"
						>
							{tag}
						</button>
					{/each}
				</div>
			</div>

			<!-- Ingest CTA -->
			<button
				class="brutalist-border brutalist-button group mt-auto flex items-center justify-center gap-2 bg-signal-black px-4 py-3 font-display text-base font-bold tracking-wider text-cold-console-white uppercase shadow-hard"
			>
				<span
					class="material-symbols-outlined text-xl transition-transform group-hover:rotate-90"
					style="font-variation-settings: 'FILL' 1;"
				>
					add
				</span>
				[+ INGEST NEW]
			</button>
		</aside>

		<!-- Main Data Area (80%) -->
		<section class="relative flex flex-1 flex-col overflow-hidden bg-cold-console-white">
			<!-- Search Command Bar -->
			<div class="shrink-0 border-b-4 border-signal-black bg-surface p-4 lg:p-6">
				<div class="brutalist-border relative w-full bg-cold-console-white shadow-hard">
					<span
						class="absolute top-1/2 left-4 -translate-y-1/2 font-display text-2xl font-bold text-molten-commit-orange lg:text-4xl"
					>
						&gt;
					</span>
					<input
						bind:value={query}
						type="text"
						placeholder="QUERY POUDB..."
						class="h-16 w-full border-0 bg-transparent pr-16 pl-12 font-display text-2xl font-bold uppercase ring-0 outline-none placeholder:text-muted focus:ring-0 lg:h-20 lg:pl-16 lg:text-4xl"
					/>
					<button
						class="absolute top-1/2 right-4 -translate-y-1/2 border border-signal-black bg-signal-black p-2 text-cold-console-white transition-colors hover:bg-molten-commit-orange"
					>
						<span class="material-symbols-outlined">keyboard_return</span>
					</button>
				</div>
			</div>

			<!-- Data Grid Header -->
			<div
				class="grid shrink-0 grid-cols-12 gap-4 border-b-4 border-signal-black bg-surface px-6 py-3 font-mono text-xs font-bold tracking-wider uppercase"
			>
				<div class="col-span-2">FLUX_ID</div>
				<div class="col-span-6 sm:col-span-5">RECORD_TITLE</div>
				<div class="hidden sm:col-span-3 sm:block">METADATA_TAGS</div>
				<div class="col-span-4 text-right sm:col-span-2">LAST_MODIFIED_TS</div>
			</div>

			<!-- Data Grid Body -->
			<div class="flex-1 overflow-y-auto">
				{#if loading}
					{#each [0, 1, 2] as i (i)}
						<div class="skeleton-hash h-14 border-b border-signal-black"></div>
					{/each}
				{:else if filteredRecords.length === 0}
					<div class="flex h-64 flex-col items-center justify-center opacity-50">
						<span class="material-symbols-outlined mb-2 text-4xl">database</span>
						<p class="font-mono text-lg font-bold tracking-widest uppercase">
							0 RECORDS FOUND IN FLUX_DB
						</p>
					</div>
				{:else}
					{#each filteredRecords as record (record.id)}
						<a
							href={resolve(`/vault/${record.id}`)}
							class="data-row grid grid-cols-12 gap-4 border-b border-signal-black px-6 py-3 text-inherit no-underline transition-colors"
						>
							<div class="col-span-2 font-mono text-sm opacity-60">{record.id}</div>
							<div
								class="col-span-6 truncate font-display text-lg leading-tight font-bold uppercase sm:col-span-5"
							>
								{record.title}
							</div>
							<div class="hidden items-center gap-2 sm:col-span-3 sm:flex sm:flex-wrap">
								{#each record.tags as tag (tag)}
									<span class="tag-badge">{tag}</span>
								{/each}
							</div>
							<div
								class="col-span-4 flex flex-col justify-center text-right font-mono text-xs opacity-60 sm:col-span-2"
							>
								{record.ts}
							</div>
						</a>
					{/each}
				{/if}
			</div>

			<!-- Grid Footer Stats -->
			<div
				class="flex shrink-0 justify-between border-t-4 border-signal-black bg-surface p-2 font-mono text-[10px]"
			>
				<span>QUERY: '{query || '*'}'</span>
				<span>MATCHES: {loading ? '...' : filteredRecords.length}</span>
				<span>EXEC_TIME: {data.stats.latency}</span>
			</div>
		</section>
	</main>

	<!-- Error Toast -->
	{#if showError}
		<div class="fixed right-6 bottom-6 z-50">
			<div
				class="brutalist-border flex w-80 items-start gap-3 bg-molten-commit-orange p-4 text-cold-console-white shadow-hard"
			>
				<span class="material-symbols-outlined">warning</span>
				<div class="flex flex-col gap-1">
					<span class="font-display text-lg leading-none font-bold uppercase">FLUX_ALERT</span>
					<span class="font-mono text-xs font-medium uppercase"
						>ERR_TCP_TIMEOUT: CONNECTION LOST TO POUDB DAEMON.</span
					>
				</div>
				<button
					onclick={() => (showError = false)}
					class="ml-auto transition-opacity hover:opacity-70"
				>
					<span class="material-symbols-outlined text-sm">close</span>
				</button>
			</div>
		</div>
	{/if}
</div>
