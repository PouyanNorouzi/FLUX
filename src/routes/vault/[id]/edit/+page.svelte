<script>
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Button from '$lib/components/Button.svelte';
	import FormSection from '$lib/components/FormSection.svelte';
	import IngredientRow from '$lib/components/IngredientRow.svelte';
	import Input from '$lib/components/Input.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import StepRow from '$lib/components/StepRow.svelte';
	import TagEditor from '$lib/components/TagEditor.svelte';
	import { toastStore } from '$lib/stores/toast.js';

	/**
	 * @typedef {{id: string, quantity: string, unit: string, name: string, note?: string}} DraftIngredient
	 * @typedef {{id: string, instruction: string}} DraftStep
	 * @typedef {{recordBytes: string, checksumHex: string, structName: string, fieldCount: string}} DraftParserMetadata
	 * @typedef {{title: string, yieldLabel: string, timeMinutes: string, tags: string[], systemFlags: string[], ingredients: DraftIngredient[], steps: DraftStep[], parserMetadata: DraftParserMetadata}} RecipeDraft
	 */

	let { data } = $props();

	function generateId() {
		return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	/**
	 * Map server draft data (RecipeCreateInput shape) to the local DraftIngredient/DraftStep shapes
	 * which require stable client-side `id` fields for keyed rendering.
	 * @returns {RecipeDraft}
	 */
	function buildDraftFromData() {
		const src = data.draft;
		if (!src) {
			return {
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
		}
		return {
			title: src.title,
			yieldLabel: src.yieldLabel,
			timeMinutes: src.timeMinutes,
			tags: [...src.tags],
			systemFlags: [...src.systemFlags],
			ingredients: src.ingredients.map((ing) => ({
				id: generateId(),
				quantity: ing.quantity,
				unit: ing.unit,
				name: ing.name,
				note: ing.note ?? ''
			})),
			steps: src.steps.map((s) => ({
				id: generateId(),
				instruction: s.instruction
			})),
			parserMetadata: { ...src.parserMetadata }
		};
	}

	/** @type {RecipeDraft} */
	let draft = $state(buildDraftFromData());

	let newTag = $state('');
	let newFlag = $state('');
	/** @type {{quantity: string, unit: string, name: string, note: string}} */
	let newIngredient = $state({ quantity: '', unit: '', name: '', note: '' });
	let newStep = $state('');
	let loading = $state(false);
	/** @type {Record<string, string>} */
	let errors = $state({});

	// Ingredients mutations
	function addIngredient() {
		if (!newIngredient.quantity || !newIngredient.unit || !newIngredient.name) return;
		draft.ingredients.push({ id: generateId(), ...newIngredient });
		newIngredient = { quantity: '', unit: '', name: '', note: '' };
	}
	function removeIngredient(/** @type {string} */ id) {
		draft.ingredients = draft.ingredients.filter((ing) => ing.id !== id);
	}

	// Steps mutations
	function addStep() {
		const instruction = newStep.trim();
		if (!instruction) return;
		draft.steps = [...draft.steps, { id: generateId(), instruction }];
		newStep = '';
	}
	function removeStep(/** @type {string} */ id) {
		draft.steps = draft.steps.filter((step) => step.id !== id);
	}

	// Tags mutations
	function addTag(value = newTag) {
		const normalized = value.trim().toUpperCase();
		if (!normalized || draft.tags.includes(normalized)) return false;
		draft.tags.push(normalized);
		return true;
	}
	function removeTag(/** @type {string} */ tag) {
		draft.tags = draft.tags.filter((t) => t !== tag);
	}

	// Flags mutations
	function addFlag(value = newFlag) {
		const normalized = value.trim().toUpperCase();
		if (!normalized || draft.systemFlags.includes(normalized)) return false;
		draft.systemFlags.push(normalized);
		return true;
	}
	function removeFlag(/** @type {string} */ flag) {
		draft.systemFlags = draft.systemFlags.filter((f) => f !== flag);
	}

	async function handleSubmit(/** @type {SubmitEvent} */ e) {
		e.preventDefault();
		loading = true;
		errors = {};

		const formData = new FormData();
		formData.append('title', draft.title);
		formData.append('yieldLabel', draft.yieldLabel);
		formData.append('timeMinutes', draft.timeMinutes);

		draft.tags.forEach((tag, idx) => formData.append(`tags[${idx}]`, tag));
		draft.systemFlags.forEach((flag, idx) => formData.append(`systemFlags[${idx}]`, flag));
		draft.ingredients.forEach((ing, idx) => {
			formData.append(`ingredients[${idx}].quantity`, ing.quantity);
			formData.append(`ingredients[${idx}].unit`, ing.unit);
			formData.append(`ingredients[${idx}].name`, ing.name);
			if (ing.note) formData.append(`ingredients[${idx}].note`, ing.note);
		});
		draft.steps.forEach((step, idx) =>
			formData.append(`steps[${idx}].instruction`, step.instruction)
		);
		formData.append('parserMetadata.recordBytes', draft.parserMetadata.recordBytes);
		formData.append('parserMetadata.checksumHex', draft.parserMetadata.checksumHex);
		formData.append('parserMetadata.structName', draft.parserMetadata.structName);
		formData.append('parserMetadata.fieldCount', draft.parserMetadata.fieldCount);

		try {
			const response = await fetch('?/update', { method: 'POST', body: formData });
			const result = await response.json();

			if (result.data?.success) {
				toastStore.pushSuccessToast(`RECIPE UPDATE OK // FLUX_ID ${data.requestedId}`);
				await goto(resolve(`/vault/${data.requestedId}`));
			} else if (result.data?.errors) {
				const { general, ...fieldErrors } = result.data.errors;
				errors = fieldErrors;
				if (general) toastStore.pushErrorToast(general);
				loading = false;
			} else {
				toastStore.pushErrorToast('UNKNOWN ERROR DURING RECIPE UPDATE');
				loading = false;
			}
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'UNKNOWN ERROR';
			toastStore.pushErrorToast(`NETWORK ERROR: ${errorMessage}`);
			loading = false;
		}
	}

	function returnToDetail() {
		goto(resolve(`/vault/${data.requestedId}`));
	}
</script>

<svelte:head>
	<title>Edit {draft.title || data.requestedId} — FLUX Recipe Vault</title>
	<link
		href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="flex min-h-screen flex-col bg-cold-console-white">
	<PageHeader
		title="EDIT RECORD"
		backLabel="RETURN TO RECORD"
		statusText={`WRITE_MODE // EDIT_RECORD // ${data.requestedId}`}
		onBack={returnToDetail}
	/>

	<main class="mx-auto flex w-full max-w-360 flex-1 flex-col gap-8 p-4 lg:p-8">
		{#if !data.draft}
			<section
				class="brutalist-border flex flex-1 flex-col justify-center bg-cold-console-white p-8 shadow-hard lg:p-12"
			>
				<div
					class="mb-4 flex items-center gap-3 font-mono text-sm font-bold tracking-widest text-molten-commit-orange uppercase"
				>
					<span class="material-symbols-outlined">warning</span>
					RECORD_NOT_FOUND
				</div>
				<h1 class="max-w-3xl font-display text-4xl font-bold tracking-tight uppercase lg:text-6xl">
					CANNOT EDIT RECORD {data.requestedId}
				</h1>
				<p class="mt-4 max-w-2xl font-mono text-sm leading-7 text-muted uppercase">
					NO MATCHING RECORD FOUND IN POUDB. RETURN TO THE VAULT INDEX.
				</p>
				<div class="mt-8">
					<button
						type="button"
						onclick={() => goto(resolve('/vault'))}
						class="brutalist-border brutalist-button bg-signal-black px-6 py-3 font-display text-base font-bold tracking-wider text-cold-console-white uppercase shadow-hard"
					>
						RETURN TO INDEX
					</button>
				</div>
			</section>
		{:else}
			<form onsubmit={handleSubmit} class="flex flex-col gap-8">
				<FormSection
					title="RECIPE_METADATA"
					titleClass="text-2xl"
					sectionClass="bg-cold-console-white p-6 shadow-hard lg:p-8"
				>
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
				</FormSection>

				<FormSection title="METADATA_TAGS">
					<TagEditor
						label="newTag"
						placeholder="TAG NAME..."
						tags={draft.tags}
						bind:inputValue={newTag}
						errorMessage={errors.tags}
						onAdd={(value) => {
							if (addTag(value)) newTag = '';
						}}
						onRemove={removeTag}
					/>
				</FormSection>

				<FormSection title="SYSTEM_FLAGS">
					<TagEditor
						label="newFlag"
						placeholder="FLAG NAME..."
						tags={draft.systemFlags}
						bind:inputValue={newFlag}
						errorMessage={errors.systemFlags}
						onAdd={(value) => {
							if (addFlag(value)) newFlag = '';
						}}
						onRemove={removeFlag}
					/>
				</FormSection>

				<FormSection title="REQUIREMENTS_">
					{#if errors.ingredients}
						<div
							class="mb-4 border-2 border-molten-commit-orange bg-cold-console-white p-3 font-mono text-xs text-molten-commit-orange uppercase"
						>
							{errors.ingredients}
						</div>
					{/if}
					<div class="mb-6 flex flex-col gap-3">
						{#each draft.ingredients as ingredient, idx (ingredient.id)}
							<IngredientRow
								{ingredient}
								index={idx}
								errors={{
									qty: errors[`ingredients[${idx}].quantity`],
									unit: errors[`ingredients[${idx}].unit`],
									name: errors[`ingredients[${idx}].name`]
								}}
								onRemove={() => removeIngredient(ingredient.id)}
							/>
						{/each}
					</div>
					<button
						type="button"
						onclick={addIngredient}
						class="brutalist-border border-2 border-signal-black bg-signal-black px-4 py-2 font-mono text-sm font-bold text-cold-console-white transition-colors hover:bg-molten-commit-orange hover:text-signal-black"
					>
						[+ ADD INGREDIENT]
					</button>
				</FormSection>

				<FormSection title="EXECUTION_">
					{#if errors.steps}
						<div
							class="mb-4 border-2 border-molten-commit-orange bg-cold-console-white p-3 font-mono text-xs text-molten-commit-orange uppercase"
						>
							{errors.steps}
						</div>
					{/if}
					<div class="mb-6 flex flex-col gap-3">
						{#each draft.steps as step, idx (step.id)}
							<StepRow
								{step}
								index={idx}
								errorMessage={errors[`steps[${idx}].instruction`]}
								onRemove={() => removeStep(step.id)}
							/>
						{/each}
					</div>
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
				</FormSection>

				<FormSection
					title="PARSE_METADATA"
					titleClass="text-xl"
					sectionClass="bg-surface p-6 shadow-hard lg:p-8"
				>
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
				</FormSection>

				<div class="flex flex-col gap-3 sm:flex-row">
					<Button type="submit" {loading} icon="save">[ COMMIT CHANGES ]</Button>
					<button
						type="button"
						onclick={returnToDetail}
						disabled={loading}
						class="brutalist-border border-2 border-signal-black bg-cold-console-white px-6 py-3 font-display text-base font-bold uppercase transition-colors hover:bg-signal-black hover:text-cold-console-white disabled:opacity-50"
					>
						DISCARD CHANGES
					</button>
				</div>
			</form>
		{/if}
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
