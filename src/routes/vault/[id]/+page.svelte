<script>
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { toastStore } from '$lib/stores/toast.js';

	let { data } = $props();

	const recipe = $derived(data.recipe);
	const verificationFields = $derived(
		recipe
			? [
					{ label: 'STRUCT', value: recipe.parseSummary.sourceStruct },
					{ label: 'FIELDS', value: recipe.parseSummary.fieldCoverage },
					{ label: 'BYTES', value: recipe.parseSummary.recordBytes },
					{ label: 'CHECKSUM', value: recipe.parseSummary.checksum },
					{ label: 'MODE', value: recipe.parseSummary.parserMode }
				]
			: []
	);

	function returnToIndex() {
		goto(resolve('/vault'));
	}

	let showDeleteModal = $state(false);
	let deleteLoading = $state(false);

	async function confirmDelete() {
		if (!recipe) return;
		deleteLoading = true;
		try {
			const formData = new FormData();
			const response = await fetch('?/delete', {
				method: 'POST',
				body: formData
			});
			const result = await response.json();
			if (result.data?.success) {
				toastStore.pushSuccessToast(`RECORD ${recipe.id} PURGED FROM POUDB`);
				await goto(resolve('/vault'));
			} else {
				toastStore.pushErrorToast(`DELETE FAILED: ${result.data?.error ?? 'UNKNOWN_ERROR'}`);
				deleteLoading = false;
				showDeleteModal = false;
			}
		} catch (err) {
			const msg = err instanceof Error ? err.message : 'UNKNOWN_ERROR';
			toastStore.pushErrorToast(`NETWORK ERROR: ${msg}`);
			deleteLoading = false;
			showDeleteModal = false;
		}
	}
</script>

<svelte:head>
	<title>
		{recipe
			? `${recipe.title} - Recipe Schematic - FLUX Recipe Vault`
			: 'Recipe Missing - FLUX Recipe Vault'}
	</title>
	<link
		href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="flex min-h-screen flex-col bg-cold-console-white">
	<header class="sticky top-0 z-40 border-b-4 border-signal-black bg-surface px-4 py-4 lg:px-8">
		<div class="mx-auto flex w-full max-w-360 items-center justify-between gap-4">
			<button
				type="button"
				onclick={returnToIndex}
				class="group flex items-center gap-2 font-display text-base font-bold tracking-tight uppercase transition-colors hover:text-molten-commit-orange lg:text-lg"
			>
				<span
					class="material-symbols-outlined transition-transform group-hover:-translate-x-1"
					style="font-variation-settings: 'FILL' 1;"
				>
					arrow_back
				</span>
				RETURN TO INDEX
			</button>
			<div
				class="text-right font-mono text-[10px] font-bold tracking-widest text-muted uppercase sm:text-xs"
			>
				SYS_READ_ONLY // POUDB_CONN_ACTIVE // LATENCY: {data.stats.latency}
			</div>
		</div>
	</header>

	<main class="mx-auto flex w-full max-w-360 flex-1 flex-col gap-8 p-4 lg:p-8">
		{#if !recipe}
			<section
				class="brutalist-border flex flex-1 flex-col justify-center bg-cold-console-white p-8 shadow-hard lg:p-12"
			>
				<div
					class="mb-4 flex items-center gap-3 font-mono text-sm font-bold tracking-widest text-molten-commit-orange uppercase"
				>
					<span class="material-symbols-outlined">warning</span>
					READ_MODEL_NOT_FOUND
				</div>
				<h1 class="max-w-3xl font-display text-4xl font-bold tracking-tight uppercase lg:text-6xl">
					RECIPE RECORD {data.requestedId} FAILED SCHEMATIC RESOLUTION
				</h1>
				<p class="mt-4 max-w-2xl font-mono text-sm leading-7 text-muted uppercase">
					THE CUSTOM C DB PARSER DID NOT RETURN A MATCHING READ MODEL FOR THIS FLUX ID. RETURN TO
					THE INDEX AND SELECT A VALID RECORD TO CONTINUE VERIFICATION.
				</p>
				<div class="mt-8 flex flex-wrap gap-3">
					<button
						type="button"
						onclick={returnToIndex}
						class="brutalist-border brutalist-button bg-signal-black px-6 py-3 font-display text-base font-bold tracking-wider text-cold-console-white uppercase shadow-hard"
					>
						RETURN TO INDEX
					</button>
				</div>
			</section>
		{:else if recipe}
			<section
				class="brutalist-border relative overflow-hidden bg-cold-console-white p-6 shadow-hard lg:p-12"
			>
				<div class="schematic-grid absolute inset-0 opacity-10"></div>
				<div class="relative z-10 flex flex-col gap-5">
					<div
						class="flex flex-wrap gap-4 bg-signal-black px-3 py-1 font-mono text-sm font-bold text-cold-console-white uppercase"
					>
						<span>ID: {recipe.id}</span>
						<span>|</span>
						<span>TIME: {recipe.timeLabel}</span>
						<span>|</span>
						<span>YIELD: {recipe.yieldLabel}</span>
					</div>

					<div class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
						<div class="flex max-w-4xl flex-col gap-4">
							<h1
								class="font-display text-4xl leading-none font-bold tracking-[-0.05em] uppercase sm:text-5xl lg:text-7xl"
							>
								{recipe.title}
							</h1>
							<div class="flex flex-wrap gap-2">
								{#each [...recipe.categories, ...recipe.systemFlags] as chip (chip)}
									<span
										class="border border-signal-black bg-surface px-2 py-1 font-mono text-[11px] uppercase"
									>
										{chip}
									</span>
								{/each}
							</div>
						</div>

						<div class="grid min-w-full grid-cols-2 gap-3 xl:min-w-md xl:grid-cols-3">
							{#each verificationFields as field (field.label)}
								<div
									class="border-2 border-signal-black bg-surface p-3 font-mono text-[10px] uppercase"
								>
									<div class="mb-1 text-muted">{field.label}</div>
									<div class="text-xs font-bold break-all text-signal-black">{field.value}</div>
								</div>
							{/each}
						</div>
					</div>
				</div>
			</section>

			<section
				class="brutalist-border flex flex-col overflow-hidden bg-cold-console-white shadow-hard lg:flex-row"
			>
				<section class="w-full border-b-4 border-signal-black lg:w-1/2 lg:border-r-4 lg:border-b-0">
					<div
						class="bg-signal-black px-4 py-4 font-display text-2xl font-bold tracking-tight text-cold-console-white uppercase"
					>
						REQUIREMENTS_
					</div>
					<div class="p-6 lg:p-8">
						<ul class="flex flex-col gap-3">
							{#each recipe.ingredients as ingredient (ingredient.id)}
								<li
									class="group flex items-start gap-4 border-b border-divider-gray pb-3 font-mono text-sm uppercase last:border-b-0 last:pb-0"
								>
									<span
										class="pt-0.5 font-bold text-molten-commit-orange transition-colors group-hover:text-signal-black"
									>
										[ ]
									</span>
									<div class="flex flex-col gap-1">
										<span class="leading-6">{ingredient.label}</span>
										<span class="text-[10px] tracking-widest text-muted">
											PARSED -> {ingredient.quantity}
											{ingredient.unit}
											{ingredient.name}
											{#if ingredient.note}
												// {ingredient.note}
											{/if}
										</span>
									</div>
								</li>
							{/each}
						</ul>
					</div>
				</section>

				<section class="w-full lg:w-1/2">
					<div
						class="flex items-center justify-between bg-signal-black px-4 py-4 text-cold-console-white"
					>
						<span class="font-display text-2xl font-bold tracking-tight uppercase">EXECUTION_</span>
						<span class="material-symbols-outlined animate-pulse text-sm">terminal</span>
					</div>
					<div class="p-6 lg:p-8">
						<ol class="flex flex-col gap-8">
							{#each recipe.steps as step (step.id)}
								<li class="group relative pl-14 font-mono text-sm leading-7 uppercase">
									<span
										class="absolute top-0 left-0 font-display text-2xl font-bold text-muted transition-colors group-hover:text-signal-black"
									>
										{step.index}.
									</span>
									{step.instruction}
								</li>
							{/each}
						</ol>
					</div>
				</section>
			</section>

			<section class="brutalist-border bg-surface p-4 shadow-hard">
				<div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
					<div class="max-w-3xl">
						<div class="mb-2 font-display text-xl font-bold tracking-tight uppercase">
							PARSE_VERIFICATION_
						</div>
						<p class="font-mono text-xs leading-6 text-muted uppercase">
							THIS SCREEN IS DRIVEN BY A MOCKED READ MODEL GENERATED FROM RAW CUSTOM C DB FIELDS.
							USE IT TO VERIFY THAT TITLE, META, INGREDIENT ARRAYS, AND EXECUTION STEP ORDER PARSE
							CORRECTLY BEFORE BACKEND INTEGRATION LANDS.
						</p>
					</div>
					<div
						class="grid grid-cols-2 gap-2 font-mono text-[10px] uppercase sm:grid-cols-3 xl:grid-cols-5"
					>
						{#each verificationFields as field (field.label)}
							<div class="border border-signal-black bg-cold-console-white px-3 py-2">
								<div class="text-muted">{field.label}</div>
								<div class="mt-1 font-bold break-all">{field.value}</div>
							</div>
						{/each}
					</div>
				</div>
			</section>
		{/if}
	</main>

	{#if recipe}
		<div class="fixed right-4 bottom-4 z-50 flex flex-col gap-3 sm:right-6 sm:bottom-6 sm:flex-row">
			<button
				type="button"
				onclick={() => goto(resolve(`/vault/${recipe.id}/edit`))}
				class="brutalist-border bg-cold-console-white px-6 py-3 font-display text-lg font-bold uppercase shadow-hard transition-colors hover:bg-signal-black hover:text-cold-console-white"
			>
				<span class="flex items-center gap-2">
					<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;"
						>edit</span
					>
					EDIT
				</span>
			</button>
			<button
				type="button"
				onclick={() => (showDeleteModal = true)}
				class="brutalist-border bg-molten-commit-orange px-6 py-3 font-display text-lg font-bold uppercase shadow-hard transition-opacity hover:opacity-80"
			>
				<span class="flex items-center gap-2 text-signal-black">
					<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;"
						>delete</span
					>
					DELETE
				</span>
			</button>
		</div>
	{/if}

	{#if showDeleteModal}
		<div
			class="fixed inset-0 z-50 flex items-center justify-center bg-signal-black/70 p-4"
			role="dialog"
			aria-modal="true"
			aria-labelledby="delete-modal-title"
		>
			<div class="brutalist-border w-full max-w-lg bg-cold-console-white shadow-hard">
				<div class="bg-signal-black px-6 py-4">
					<div
						class="mb-1 flex items-center gap-2 font-mono text-xs font-bold tracking-widest text-molten-commit-orange uppercase"
					>
						<span class="material-symbols-outlined text-base">warning</span>
						DESTRUCTIVE_OP // CONFIRM_REQUIRED
					</div>
					<h2
						id="delete-modal-title"
						class="font-display text-2xl font-bold tracking-tight text-cold-console-white uppercase"
					>
						PURGE RECORD?
					</h2>
				</div>
				<div class="p-6">
					<p class="mb-2 font-mono text-sm leading-7 uppercase">
						<span class="font-bold">{recipe?.title}</span>
					</p>
					<p class="font-mono text-xs leading-6 text-muted uppercase">
						THIS WILL PERMANENTLY REMOVE FLUX_ID {recipe?.id} FROM POUDB. THIS ACTION CANNOT BE UNDONE.
					</p>
					<div class="mt-6 flex flex-col gap-3 sm:flex-row">
						<button
							type="button"
							onclick={confirmDelete}
							disabled={deleteLoading}
							class="brutalist-border flex-1 bg-molten-commit-orange px-6 py-3 font-display text-base font-bold uppercase shadow-hard transition-opacity hover:opacity-80 disabled:opacity-50"
						>
							<span class="flex items-center justify-center gap-2 text-signal-black">
								{#if deleteLoading}
									<span class="material-symbols-outlined animate-pulse text-base"
										>hourglass_empty</span
									>
									PURGING...
								{:else}
									<span
										class="material-symbols-outlined text-base"
										style="font-variation-settings: 'FILL' 1;">delete_forever</span
									>
									CONFIRM PURGE
								{/if}
							</span>
						</button>
						<button
							type="button"
							onclick={() => (showDeleteModal = false)}
							disabled={deleteLoading}
							class="brutalist-border flex-1 bg-cold-console-white px-6 py-3 font-display text-base font-bold uppercase shadow-hard transition-colors hover:bg-signal-black hover:text-cold-console-white disabled:opacity-50"
						>
							ABORT
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.schematic-grid {
		background-image:
			linear-gradient(var(--color-signal-black) 1px, transparent 1px),
			linear-gradient(90deg, var(--color-signal-black) 1px, transparent 1px);
		background-size: 20px 20px;
	}
</style>
