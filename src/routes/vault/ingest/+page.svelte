<script>
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { flip } from 'svelte/animate';
	import { cubicOut } from 'svelte/easing';
	import { fade, fly, slide } from 'svelte/transition';
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

	let loading = $state(false);
	/** @type {Record<string, string>} */
	let errors = $state({});

	function generateId() {
		return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

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

	function addTag(value = newTag) {
		const normalized = value.trim().toUpperCase();
		if (!normalized || draft.tags.includes(normalized)) {
			return false;
		}
		draft.tags.push(normalized);
		return true;
	}

	function removeTag(/** @type {string} */ tag) {
		draft.tags = draft.tags.filter((t) => t !== tag);
	}

	function addFlag(value = newFlag) {
		const normalized = value.trim().toUpperCase();
		if (!normalized || draft.systemFlags.includes(normalized)) {
			return false;
		}
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

		draft.tags.forEach((tag, idx) => {
			formData.append(`tags[${idx}]`, tag);
		});

		draft.systemFlags.forEach((flag, idx) => {
			formData.append(`systemFlags[${idx}]`, flag);
		});

		draft.ingredients.forEach((ing, idx) => {
			formData.append(`ingredients[${idx}].quantity`, ing.quantity);
			formData.append(`ingredients[${idx}].unit`, ing.unit);
			formData.append(`ingredients[${idx}].name`, ing.name);
			if (ing.note) {
				formData.append(`ingredients[${idx}].note`, ing.note);
			}
		});

		draft.steps.forEach((step, idx) => {
			formData.append(`steps[${idx}].instruction`, step.instruction);
		});

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
				toastStore.pushSuccessToast(`RECIPE COMMIT OK // FLUX_ID ${result.data.id}`);
				await goto(resolve(`/vault/${result.data.id}`));
			} else if (result.data?.errors) {
				const { general, ...fieldErrors } = result.data.errors;
				errors = fieldErrors;
				if (general) {
					toastStore.pushErrorToast(general);
				}
				loading = false;
			} else {
				toastStore.pushErrorToast('UNKNOWN ERROR DURING RECIPE CREATION');
				loading = false;
			}
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'UNKNOWN ERROR';
			toastStore.pushErrorToast(`NETWORK ERROR: ${errorMessage}`);
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

	function sectionEnter(/** @type {number} */ index) {
		return {
			y: 20,
			opacity: 0.32,
			duration: 280,
			delay: 90 + index * 70,
			easing: cubicOut
		};
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
	<PageHeader
		title="INGEST RECORD"
		backLabel="BACK TO VAULT"
		statusText="WRITE_MODE // INGEST_FORM"
		onBack={returnToVault}
	/>

	<main class="mx-auto flex w-full max-w-360 flex-1 flex-col gap-8 p-4 lg:p-8">
		<form onsubmit={handleSubmit} class="flex flex-col gap-8">
			<div in:fly={sectionEnter(0)} out:fade={{ duration: 110 }}>
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
			</div>

			<div in:fly={sectionEnter(1)} out:fade={{ duration: 110 }}>
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
			</div>

			<div in:fly={sectionEnter(2)} out:fade={{ duration: 110 }}>
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
			</div>

			<div in:fly={sectionEnter(3)} out:fade={{ duration: 120 }}>
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
						<div
							animate:flip={{ duration: 240, easing: cubicOut }}
							in:slide={{
								axis: 'y',
								duration: 230,
								easing: cubicOut,
								delay: Math.min(idx, 6) * 30
							}}
							out:fade={{ duration: 160 }}
						>
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
						</div>
					{/each}
				</div>

				<div class="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-4">
					<div>
						<label
							for="newIngredientQty"
							class="block text-[10px] font-bold tracking-widest text-muted uppercase"
						>
							QTY
						</label>
						<input
							id="newIngredientQty"
							type="text"
							placeholder="1"
							bind:value={newIngredient.quantity}
							class="brutalist-border w-full border-2 border-signal-black bg-cold-console-white px-2 py-1 font-mono text-sm outline-none focus:border-molten-commit-orange"
						/>
					</div>

					<div>
						<label
							for="newIngredientUnit"
							class="block text-[10px] font-bold tracking-widest text-muted uppercase"
						>
							UNIT
						</label>
						<input
							id="newIngredientUnit"
							type="text"
							placeholder="CUP"
							bind:value={newIngredient.unit}
							class="brutalist-border w-full border-2 border-signal-black bg-cold-console-white px-2 py-1 font-mono text-sm uppercase outline-none focus:border-molten-commit-orange"
						/>
					</div>

					<div>
						<label
							for="newIngredientName"
							class="block text-[10px] font-bold tracking-widest text-muted uppercase"
						>
							NAME
						</label>
						<input
							id="newIngredientName"
							type="text"
							placeholder="garlic"
							bind:value={newIngredient.name}
							class="brutalist-border w-full border-2 border-signal-black bg-cold-console-white px-2 py-1 font-mono text-sm outline-none focus:border-molten-commit-orange"
						/>
					</div>

					<div>
						<label
							for="newIngredientNote"
							class="block text-[10px] font-bold tracking-widest text-muted uppercase"
						>
							NOTE
						</label>
						<input
							id="newIngredientNote"
							type="text"
							placeholder="minced"
							bind:value={newIngredient.note}
							class="brutalist-border w-full border-2 border-signal-black bg-cold-console-white px-2 py-1 font-mono text-sm outline-none focus:border-molten-commit-orange"
						/>
					</div>
				</div>

				<div class="flex gap-2">
					<button
						type="button"
						onclick={addIngredient}
						disabled={!newIngredient.quantity || !newIngredient.unit || !newIngredient.name}
						class="brutalist-border border-2 border-signal-black bg-signal-black px-4 py-2 font-mono text-sm font-bold text-cold-console-white transition-colors hover:bg-molten-commit-orange hover:text-signal-black disabled:cursor-not-allowed disabled:opacity-50"
					>
						[+ ADD INGREDIENT]
					</button>
				</div>
				</FormSection>
			</div>

			<div in:fly={sectionEnter(4)} out:fade={{ duration: 120 }}>
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
						<div
							animate:flip={{ duration: 250, easing: cubicOut }}
							in:slide={{
								axis: 'y',
								duration: 240,
								easing: cubicOut,
								delay: Math.min(idx, 6) * 28
							}}
							out:fade={{ duration: 170 }}
						>
							<StepRow
								{step}
								index={idx}
								errorMessage={errors[`steps[${idx}].instruction`]}
								onRemove={() => removeStep(step.id)}
							/>
						</div>
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
			</div>

			<div in:fly={sectionEnter(5)} out:fade={{ duration: 120 }}>
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
			</div>

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
