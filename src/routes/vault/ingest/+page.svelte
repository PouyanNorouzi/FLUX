<script>
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Button from '$lib/components/Button.svelte';
	import Input from '$lib/components/Input.svelte';

	/**
	 * @typedef {{id: string, quantity: string, unit: string, name: string, note?: string}} DraftIngredient
	 * @typedef {{id: string, instruction: string}} DraftStep
	 * @typedef {{recordBytes: string, checksumHex: string, structName: string, fieldCount: string}} DraftParserMetadata
	 * @typedef {{title: string, yieldLabel: string, timeMinutes: string, tags: string[], systemFlags: string[], ingredients: DraftIngredient[], steps: DraftStep[], parserMetadata: DraftParserMetadata}} RecipeDraft
	 */

	// Draft object representing the recipe being ingested
	/** @type {RecipeDraft} */
	let draft = $state({
		title: '',
		yieldLabel: '',
		timeMinutes: '',
		tags: [],
		systemFlags: [],
		ingredients: [],
		steps: [],
		parserMetadata: {
			recordBytes: '256',
			checksumHex: '0x000000',
			structName: 'recipe_record_v2',
			fieldCount: '10'
		}
	});

	// Temporary fields for adding new items
	let newTag = $state('');
	let newFlag = $state('');
	/** @type {{quantity: string, unit: string, name: string, note: string}} */
	let newIngredient = $state({
		quantity: '',
		unit: '',
		name: '',
		note: ''
	});
	let newStep = $state('');

	// Form state
	let loading = $state(false);
	/** @type {Record<string, string>} */
	let errors = $state({});

	// Helper to generate stable client-side ids for array items
	function generateId() {
		return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	// Ingredients mutations
	function addIngredient() {
		if (!newIngredient.quantity || !newIngredient.unit || !newIngredient.name) {
			return;
		}
		draft.ingredients.push({
			id: generateId(),
			...newIngredient
		});
		newIngredient = {
			quantity: '',
			unit: '',
			name: '',
			note: ''
		};
	}

	function removeIngredient(/** @type {string} */ id) {
		draft.ingredients = draft.ingredients.filter((ing) => ing.id !== id);
	}

	// Steps mutations
	function addStep() {
		const instruction = newStep.trim();
		if (!instruction) {
			return;
		}
		draft.steps = [
			...draft.steps,
			{
				id: generateId(),
				instruction
			}
		];
		newStep = '';
	}

	function removeStep(/** @type {string} */ id) {
		draft.steps = draft.steps.filter((step) => step.id !== id);
	}

	// Tags mutations
	function addTag() {
		if (!newTag.trim() || draft.tags.includes(newTag.trim())) {
			return;
		}
		draft.tags.push(newTag.trim().toUpperCase());
		newTag = '';
	}

	function removeTag(/** @type {string} */ tag) {
		draft.tags = draft.tags.filter((t) => t !== tag);
	}

	// Flags mutations
	function addFlag() {
		if (!newFlag.trim() || draft.systemFlags.includes(newFlag.trim())) {
			return;
		}
		draft.systemFlags.push(newFlag.trim().toUpperCase());
		newFlag = '';
	}

	function removeFlag(/** @type {string} */ flag) {
		draft.systemFlags = draft.systemFlags.filter((f) => f !== flag);
	}

	// Form submission
	async function handleSubmit(/** @type {SubmitEvent} */ e) {
		e.preventDefault();
		loading = true;
		errors = {};

		const formData = new FormData();
		formData.append('title', draft.title);
		formData.append('yieldLabel', draft.yieldLabel);
		formData.append('timeMinutes', draft.timeMinutes);

		// Tags
		draft.tags.forEach((tag, idx) => {
			formData.append(`tags[${idx}]`, tag);
		});

		// System flags
		draft.systemFlags.forEach((flag, idx) => {
			formData.append(`systemFlags[${idx}]`, flag);
		});

		// Ingredients
		draft.ingredients.forEach((ing, idx) => {
			formData.append(`ingredients[${idx}].quantity`, ing.quantity);
			formData.append(`ingredients[${idx}].unit`, ing.unit);
			formData.append(`ingredients[${idx}].name`, ing.name);
			if (ing.note) {
				formData.append(`ingredients[${idx}].note`, ing.note);
			}
		});

		// Steps
		draft.steps.forEach((step, idx) => {
			formData.append(`steps[${idx}].instruction`, step.instruction);
		});

		// Parser metadata
		formData.append('parserMetadata.recordBytes', draft.parserMetadata.recordBytes);
		formData.append('parserMetadata.checksumHex', draft.parserMetadata.checksumHex);
		formData.append('parserMetadata.structName', draft.parserMetadata.structName);
		formData.append('parserMetadata.fieldCount', draft.parserMetadata.fieldCount);

		try {
			const response = await fetch('?/create', {
				method: 'POST',
				body: formData
			});

			const result = await response.json();

			if (result.data?.success) {
				// Redirect to the created recipe detail page
				await goto(resolve(`/vault/${result.data.id}`));
			} else if (result.data?.errors) {
				errors = result.data.errors;
				loading = false;
			} else {
				errors.general = 'UNKNOWN ERROR DURING RECIPE CREATION';
				loading = false;
			}
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'UNKNOWN ERROR';
			errors.general = `NETWORK ERROR: ${errorMessage}`;
			loading = false;
		}
	}

	function resetForm() {
		draft = {
			title: '',
			yieldLabel: '',
			timeMinutes: '',
			tags: [],
			systemFlags: [],
			ingredients: [],
			steps: [],
			parserMetadata: {
				recordBytes: '256',
				checksumHex: '0x000000',
				structName: 'recipe_record_v2',
				fieldCount: '10'
			}
		};
		errors = {};
	}

	function returnToVault() {
		goto(resolve('/vault'));
	}
</script>

<svelte:head>
	<title>Ingest New Recipe — FLUX Recipe Vault</title>
	<link
		href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="flex min-h-screen flex-col bg-cold-console-white">
	<!-- Header -->
	<header class="sticky top-0 z-40 border-b-4 border-signal-black bg-surface px-4 py-4 lg:px-8">
		<div class="mx-auto flex w-full max-w-360 items-center justify-between gap-4">
			<button
				type="button"
				onclick={returnToVault}
				class="group flex items-center gap-2 font-display text-base font-bold tracking-tight uppercase transition-colors hover:text-molten-commit-orange lg:text-lg"
			>
				<span
					class="material-symbols-outlined transition-transform group-hover:-translate-x-1"
					style="font-variation-settings: 'FILL' 1;"
				>
					arrow_back
				</span>
				BACK TO VAULT
			</button>
			<div
				class="text-right font-mono text-[10px] font-bold tracking-widest text-muted uppercase sm:text-xs"
			>
				WRITE_MODE // INGEST_FORM
			</div>
		</div>
	</header>

	<!-- Main Form -->
	<main class="mx-auto flex w-full max-w-360 flex-1 flex-col gap-8 p-4 lg:p-8">
		<!-- Error toast -->
		{#if errors.general}
			<div
				class="brutalist-border flex flex-col gap-3 bg-molten-commit-orange p-4 text-signal-black shadow-hard lg:p-6"
			>
				<div class="flex items-center gap-2">
					<span class="material-symbols-outlined">warning</span>
					<span class="font-display text-lg font-bold uppercase">WRITE_ERROR</span>
				</div>
				<p class="font-mono text-sm uppercase">{errors.general}</p>
			</div>
		{/if}

		<form onsubmit={handleSubmit} class="flex flex-col gap-8">
			<!-- Recipe Metadata Section -->
			<section class="brutalist-border bg-cold-console-white p-6 shadow-hard lg:p-8">
				<h2
					class="mb-6 border-b-2 border-signal-black pb-3 font-display text-2xl font-bold tracking-tighter uppercase"
				>
					RECIPE_METADATA
				</h2>

				<div class="flex flex-col gap-6">
					<Input
						id="title"
						label="RECIPE_TITLE"
						type="text"
						placeholder="> RECIPE NAME..."
						bind:value={draft.title}
						error={!!errors.title}
						errorMessage={errors.title}
						icon="restaurant"
					/>

					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<Input
							id="yieldLabel"
							label="YIELD_LABEL"
							type="text"
							placeholder="> 4 SERVINGS..."
							bind:value={draft.yieldLabel}
							error={!!errors.yieldLabel}
							errorMessage={errors.yieldLabel}
							icon="scale"
						/>

						<Input
							id="timeMinutes"
							label="TIME_MINUTES"
							type="text"
							placeholder="> 45..."
							bind:value={draft.timeMinutes}
							error={!!errors.timeMinutes}
							errorMessage={errors.timeMinutes}
							icon="schedule"
						/>
					</div>
				</div>
			</section>

			<!-- Tags Section -->
			<section class="brutalist-border bg-cold-console-white p-6 shadow-hard lg:p-8">
				<h2
					class="mb-4 border-b-2 border-signal-black pb-3 font-display text-2xl font-bold tracking-tighter uppercase"
				>
					METADATA_TAGS
				</h2>

				<div class="mb-4 flex flex-wrap gap-2">
					{#each draft.tags as tag (tag)}
						<button
							type="button"
							onclick={() => removeTag(tag)}
							class="group flex items-center gap-2 border-2 border-signal-black bg-signal-black px-3 py-1 font-mono text-xs font-bold text-cold-console-white transition-colors hover:border-molten-commit-orange hover:bg-molten-commit-orange hover:text-signal-black"
						>
							{tag}
							<span class="material-symbols-outlined text-sm opacity-70 group-hover:opacity-100">
								close
							</span>
						</button>
					{/each}
				</div>

				<div class="flex gap-2">
					<label for="newTag" class="sr-only">Tag Name</label>
					<input
						id="newTag"
						type="text"
						placeholder="TAG NAME..."
						bind:value={newTag}
						class="brutalist-border flex-1 border-2 border-signal-black bg-cold-console-white px-3 py-2 font-mono text-sm uppercase outline-none focus:border-molten-commit-orange"
						onkeydown={(e) => {
							if (e.key === 'Enter') {
								e.preventDefault();
								addTag();
							}
						}}
					/>
					<button
						type="button"
						onclick={addTag}
						class="brutalist-border border-2 border-signal-black bg-signal-black px-4 py-2 font-mono text-sm font-bold text-cold-console-white transition-colors hover:bg-molten-commit-orange hover:text-signal-black"
					>
						ADD
					</button>
				</div>
			</section>

			<!-- System Flags Section -->
			<section class="brutalist-border bg-cold-console-white p-6 shadow-hard lg:p-8">
				<h2
					class="mb-4 border-b-2 border-signal-black pb-3 font-display text-2xl font-bold tracking-tighter uppercase"
				>
					SYSTEM_FLAGS
				</h2>

				<div class="mb-4 flex flex-wrap gap-2">
					{#each draft.systemFlags as flag (flag)}
						<button
							type="button"
							onclick={() => removeFlag(flag)}
							class="group flex items-center gap-2 border-2 border-signal-black bg-signal-black px-3 py-1 font-mono text-xs font-bold text-cold-console-white transition-colors hover:border-molten-commit-orange hover:bg-molten-commit-orange hover:text-signal-black"
						>
							{flag}
							<span class="material-symbols-outlined text-sm opacity-70 group-hover:opacity-100">
								close
							</span>
						</button>
					{/each}
				</div>

				<div class="flex gap-2">
					<label for="newFlag" class="sr-only">Flag Name</label>
					<input
						id="newFlag"
						type="text"
						placeholder="FLAG NAME..."
						bind:value={newFlag}
						class="brutalist-border flex-1 border-2 border-signal-black bg-cold-console-white px-3 py-2 font-mono text-sm uppercase outline-none focus:border-molten-commit-orange"
						onkeydown={(e) => {
							if (e.key === 'Enter') {
								e.preventDefault();
								addFlag();
							}
						}}
					/>
					<button
						type="button"
						onclick={addFlag}
						class="brutalist-border border-2 border-signal-black bg-signal-black px-4 py-2 font-mono text-sm font-bold text-cold-console-white transition-colors hover:bg-molten-commit-orange hover:text-signal-black"
					>
						ADD
					</button>
				</div>
			</section>

			<!-- Ingredients Section -->
			<section class="brutalist-border bg-cold-console-white p-6 shadow-hard lg:p-8">
				<h2
					class="mb-4 border-b-2 border-signal-black pb-3 font-display text-2xl font-bold tracking-tighter uppercase"
				>
					REQUIREMENTS_
				</h2>

				{#if errors.ingredients}
					<div
						class="mb-4 border-2 border-molten-commit-orange bg-cold-console-white p-3 font-mono text-xs text-molten-commit-orange uppercase"
					>
						{errors.ingredients}
					</div>
				{/if}

				<div class="mb-6 flex flex-col gap-3">
					{#each draft.ingredients as ingredient (ingredient.id)}
						{@const ingErrors = {
							qty: errors[`ingredients[${draft.ingredients.indexOf(ingredient)}].quantity`],
							unit: errors[`ingredients[${draft.ingredients.indexOf(ingredient)}].unit`],
							name: errors[`ingredients[${draft.ingredients.indexOf(ingredient)}].name`]
						}}
						<div
							class="grid grid-cols-1 gap-2 border-b border-divider-gray pb-3 last:border-b-0 sm:grid-cols-4"
						>
							<div class="sm:col-span-1">
								<label
									for="qty_{ingredient.id}"
									class="block text-[10px] font-bold tracking-widest text-muted uppercase"
								>
									QTY
								</label>
								<input
									id="qty_{ingredient.id}"
									type="text"
									placeholder="1"
									bind:value={ingredient.quantity}
									class="brutalist-border w-full border-2 border-signal-black bg-cold-console-white px-2 py-1 font-mono text-sm outline-none {ingErrors.qty
										? 'border-molten-commit-orange focus:border-molten-commit-orange'
										: 'focus:border-molten-commit-orange'}"
								/>
								{#if ingErrors.qty}
									<p class="mt-1 text-[10px] text-molten-commit-orange">{ingErrors.qty}</p>
								{/if}
							</div>

							<div class="sm:col-span-1">
								<label
									for="unit_{ingredient.id}"
									class="block text-[10px] font-bold tracking-widest text-muted uppercase"
								>
									UNIT
								</label>
								<input
									id="unit_{ingredient.id}"
									type="text"
									placeholder="CUP"
									bind:value={ingredient.unit}
									class="brutalist-border w-full border-2 border-signal-black bg-cold-console-white px-2 py-1 font-mono text-sm uppercase outline-none {ingErrors.unit
										? 'border-molten-commit-orange focus:border-molten-commit-orange'
										: 'focus:border-molten-commit-orange'}"
								/>
								{#if ingErrors.unit}
									<p class="mt-1 text-[10px] text-molten-commit-orange">{ingErrors.unit}</p>
								{/if}
							</div>

							<div class="sm:col-span-1">
								<label
									for="name_{ingredient.id}"
									class="block text-[10px] font-bold tracking-widest text-muted uppercase"
								>
									NAME
								</label>
								<input
									id="name_{ingredient.id}"
									type="text"
									placeholder="garlic"
									bind:value={ingredient.name}
									class="brutalist-border w-full border-2 border-signal-black bg-cold-console-white px-2 py-1 font-mono text-sm outline-none {ingErrors.name
										? 'border-molten-commit-orange focus:border-molten-commit-orange'
										: 'focus:border-molten-commit-orange'}"
								/>
								{#if ingErrors.name}
									<p class="mt-1 text-[10px] text-molten-commit-orange">{ingErrors.name}</p>
								{/if}
							</div>

							<div class="flex flex-col sm:col-span-1">
								<label
									for="note_{ingredient.id}"
									class="block text-[10px] font-bold tracking-widest text-muted uppercase"
								>
									NOTE
								</label>
								<div class="flex gap-1">
									<input
										id="note_{ingredient.id}"
										type="text"
										placeholder="minced"
										bind:value={ingredient.note}
										class="brutalist-border flex-1 border-2 border-signal-black bg-cold-console-white px-2 py-1 font-mono text-sm outline-none focus:border-molten-commit-orange"
									/>
									<button
										type="button"
										onclick={() => removeIngredient(ingredient.id)}
										class="border-2 border-molten-commit-orange bg-molten-commit-orange px-2 py-1 text-signal-black transition-colors hover:bg-signal-black hover:text-molten-commit-orange"
									>
										<span class="material-symbols-outlined text-lg">close</span>
									</button>
								</div>
							</div>
						</div>
					{/each}
				</div>

				<!-- Add Ingredient Row -->
				<div class="flex gap-2">
					<button
						type="button"
						onclick={addIngredient}
						class="brutalist-border border-2 border-signal-black bg-signal-black px-4 py-2 font-mono text-sm font-bold text-cold-console-white transition-colors hover:bg-molten-commit-orange hover:text-signal-black"
					>
						[+ ADD INGREDIENT]
					</button>
				</div>
			</section>

			<!-- Execution Steps Section -->
			<section class="brutalist-border bg-cold-console-white p-6 shadow-hard lg:p-8">
				<h2
					class="mb-4 border-b-2 border-signal-black pb-3 font-display text-2xl font-bold tracking-tighter uppercase"
				>
					EXECUTION_
				</h2>

				{#if errors.steps}
					<div
						class="mb-4 border-2 border-molten-commit-orange bg-cold-console-white p-3 font-mono text-xs text-molten-commit-orange uppercase"
					>
						{errors.steps}
					</div>
				{/if}

				<div class="mb-6 flex flex-col gap-3">
					{#each draft.steps as step, idx (step.id)}
						{@const stepError = errors[`steps[${idx}].instruction`]}
						<div class="border-b border-divider-gray pb-3 last:border-b-0">
							<label
								for="step_{step.id}"
								class="block text-[10px] font-bold tracking-widest text-muted uppercase"
							>
								STEP {String(idx + 1).padStart(2, '0')}
							</label>
							<div class="flex gap-2">
								<textarea
									id="step_{step.id}"
									rows="2"
									placeholder="Step instruction..."
									bind:value={step.instruction}
									class="brutalist-border flex-1 border-2 border-signal-black bg-cold-console-white px-3 py-2 font-mono text-sm outline-none {stepError
										? 'border-molten-commit-orange focus:border-molten-commit-orange'
										: 'focus:border-molten-commit-orange'}"
								></textarea>
								<button
									type="button"
									onclick={() => removeStep(step.id)}
									class="border-2 border-molten-commit-orange bg-molten-commit-orange px-3 py-2 text-signal-black transition-colors hover:bg-signal-black hover:text-molten-commit-orange"
								>
									<span class="material-symbols-outlined">close</span>
								</button>
							</div>
							{#if stepError}
								<p class="mt-1 text-[10px] text-molten-commit-orange">{stepError}</p>
							{/if}
						</div>
					{/each}
				</div>

				<!-- Add Step Row -->
				<div class="flex flex-col gap-2">
					<label for="newStep" class="text-[10px] font-bold tracking-widest text-muted uppercase">
						NEW STEP
					</label>
					<textarea
						id="newStep"
						rows="2"
						placeholder="New step instruction..."
						bind:value={newStep}
						class="brutalist-border flex-1 border-2 border-signal-black bg-cold-console-white px-3 py-2 font-mono text-sm outline-none focus:border-molten-commit-orange"
					></textarea>
					<button
						type="button"
						onclick={addStep}
						class="brutalist-border border-2 border-signal-black bg-signal-black px-4 py-2 font-mono text-sm font-bold text-cold-console-white transition-colors hover:bg-molten-commit-orange hover:text-signal-black"
					>
						[+ ADD STEP]
					</button>
				</div>
			</section>

			<!-- Parser Metadata Section -->
			<section class="brutalist-border bg-surface p-6 shadow-hard lg:p-8">
				<h2
					class="mb-4 border-b-2 border-signal-black pb-3 font-display text-xl font-bold tracking-tighter uppercase"
				>
					PARSE_METADATA
				</h2>

				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div>
						<label
							for="recordBytes"
							class="block text-[10px] font-bold tracking-widest text-muted uppercase"
						>
							RECORD_BYTES
						</label>
						<input
							id="recordBytes"
							type="number"
							bind:value={draft.parserMetadata.recordBytes}
							class="brutalist-border w-full border-2 border-signal-black bg-cold-console-white px-3 py-2 font-mono text-sm outline-none focus:border-molten-commit-orange"
						/>
					</div>

					<div>
						<label
							for="checksumHex"
							class="block text-[10px] font-bold tracking-widest text-muted uppercase"
						>
							CHECKSUM_HEX
						</label>
						<input
							id="checksumHex"
							type="text"
							bind:value={draft.parserMetadata.checksumHex}
							placeholder="0x000000"
							class="brutalist-border w-full border-2 border-signal-black bg-cold-console-white px-3 py-2 font-mono text-sm uppercase outline-none focus:border-molten-commit-orange"
						/>
					</div>

					<div>
						<label
							for="structName"
							class="block text-[10px] font-bold tracking-widest text-muted uppercase"
						>
							STRUCT_NAME
						</label>
						<input
							id="structName"
							type="text"
							bind:value={draft.parserMetadata.structName}
							placeholder="recipe_record_v2"
							class="brutalist-border w-full border-2 border-signal-black bg-cold-console-white px-3 py-2 font-mono text-sm uppercase outline-none focus:border-molten-commit-orange"
						/>
					</div>

					<div>
						<label
							for="fieldCount"
							class="block text-[10px] font-bold tracking-widest text-muted uppercase"
						>
							FIELD_COUNT
						</label>
						<input
							id="fieldCount"
							type="number"
							bind:value={draft.parserMetadata.fieldCount}
							class="brutalist-border w-full border-2 border-signal-black bg-cold-console-white px-3 py-2 font-mono text-sm outline-none focus:border-molten-commit-orange"
						/>
					</div>
				</div>
			</section>

			<!-- Submit and Reset Buttons -->
			<div class="flex flex-col gap-3 sm:flex-row">
				<Button type="submit" {loading} icon="send">[ COMMIT TO POUDB ]</Button>
				<button
					type="button"
					onclick={resetForm}
					disabled={loading}
					class="brutalist-border border-2 border-signal-black bg-cold-console-white px-6 py-3 font-display text-base font-bold uppercase transition-colors hover:bg-signal-black hover:text-cold-console-white disabled:opacity-50"
				>
					RESET FORM
				</button>
			</div>
		</form>
	</main>
</div>

<style>
	textarea {
		resize: vertical;
	}

	input:focus,
	textarea:focus {
		box-shadow: 6px 6px 0 var(--color-signal-black);
	}
</style>
