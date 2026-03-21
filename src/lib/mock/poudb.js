/**
 * @typedef {{
 * 	qty: string,
 * 	unit: string,
 * 	name: string,
 * 	note?: string
 * }} RawIngredient
 */

/**
 * @typedef {{
 * 	flux_id: string,
 * 	title: string,
 * 	tag_codes: string[],
 * 	modified_hex: string,
 * 	yield_label: string,
 * 	time_minutes: number,
 * 	sys_flags: string[],
 * 	ingredients: RawIngredient[],
 * 	steps: string[],
 * 	parse_trace: {
 * 		record_bytes: number,
 * 		checksum_hex: string,
 * 		struct_name: string,
 * 		field_count: number
 * 	}
 * }} RawRecipe
 */

/** @type {RawRecipe[]} */
const RAW_RECIPES = [
	{
		flux_id: '0x8F9A',
		title: 'Garlic Confit Bomb',
		tag_codes: ['CONDIMENT', 'VEGAN'],
		modified_hex: '1698742A',
		yield_label: '16 OUNCES',
		time_minutes: 95,
		sys_flags: ['SYS_VERIFIED', 'READ_VIEW_READY'],
		ingredients: [
			{ qty: '4', unit: 'HEADS', name: 'garlic' },
			{ qty: '2', unit: 'CUPS', name: 'olive oil' },
			{ qty: '1', unit: 'TSP', name: 'black peppercorns' },
			{ qty: '3', unit: 'SPRIGS', name: 'thyme' },
			{ qty: '1', unit: 'TSP', name: 'kosher salt' }
		],
		steps: [
			'SPLIT GARLIC HEADS, PEEL CLOVES, AND LOAD INTO A HEAVY SAUCEPAN WITH OLIVE OIL.',
			'ADD PEPPERCORNS, THYME, AND SALT. HOLD OVER LOW HEAT UNTIL SMALL, LAZY BUBBLES FORM.',
			'CONFIT FOR 60 TO 75 MINUTES. DO NOT ALLOW THE OIL TO FRY THE GARLIC OR EXCEED A LOW SIMMER.',
			'COOL TO ROOM TEMPERATURE IN THE PAN, THEN TRANSFER GARLIC AND OIL TO A SANITIZED JAR.',
			'SEAL, LABEL, AND STORE UNDER REFRIGERATION. USE OIL AND CLOVES AS A FLAVOR BASE.'
		],
		parse_trace: {
			record_bytes: 348,
			checksum_hex: '0x71C4AF',
			struct_name: 'recipe_record_v2',
			field_count: 10
		}
	},
	{
		flux_id: '0x2B4C',
		title: 'Roasted Garlic Mashed Potatoes',
		tag_codes: ['SIDE', 'CARBS'],
		modified_hex: '1698739F',
		yield_label: '6 SERVINGS',
		time_minutes: 50,
		sys_flags: ['SYS_VERIFIED'],
		ingredients: [
			{ qty: '2', unit: 'POUNDS', name: 'yukon gold potatoes' },
			{ qty: '1', unit: 'HEAD', name: 'roasted garlic' },
			{ qty: '4', unit: 'TBSP', name: 'unsalted butter' },
			{ qty: '0.5', unit: 'CUP', name: 'warm cream' },
			{ qty: '1', unit: 'TSP', name: 'kosher salt' }
		],
		steps: [
			'BOIL POTATOES IN SALTED WATER UNTIL KNIFE-TENDER.',
			'DRAIN THOROUGHLY AND RETURN TO THE HOT POT TO DRIVE OFF RESIDUAL MOISTURE.',
			'MASH WITH ROASTED GARLIC, BUTTER, AND WARM CREAM UNTIL SMOOTH.',
			'ADJUST SALT, HOLD WARM, AND SERVE WITH A FINAL BUTTER GLOSS.'
		],
		parse_trace: {
			record_bytes: 304,
			checksum_hex: '0x5AE819',
			struct_name: 'recipe_record_v2',
			field_count: 10
		}
	},
	{
		flux_id: '0x9D1E',
		title: 'Aglio e Olio Protocol',
		tag_codes: ['PASTA', 'QUICK'],
		modified_hex: '1698721B',
		yield_label: '2 PLATES',
		time_minutes: 18,
		sys_flags: ['SYS_VERIFIED', 'FAST_PATH'],
		ingredients: [
			{ qty: '8', unit: 'OUNCES', name: 'spaghetti' },
			{ qty: '6', unit: 'CLOVES', name: 'garlic', note: 'thinly sliced' },
			{ qty: '0.25', unit: 'CUP', name: 'olive oil' },
			{ qty: '1', unit: 'TSP', name: 'chili flakes' },
			{ qty: '0.25', unit: 'CUP', name: 'parsley', note: 'chopped' }
		],
		steps: [
			'COOK SPAGHETTI TO JUST SHY OF AL DENTE. RESERVE ONE CUP OF PASTA WATER.',
			'GENTLY TOAST GARLIC IN OLIVE OIL WITH CHILI FLAKES UNTIL FRAGRANT, NOT BROWN.',
			'TOSS PASTA IN THE OIL, ADDING RESERVED WATER TO EMULSIFY.',
			'FINISH WITH PARSLEY AND A FINAL ACIDITY CHECK BEFORE SERVICE.'
		],
		parse_trace: {
			record_bytes: 296,
			checksum_hex: '0x2F090D',
			struct_name: 'recipe_record_v2',
			field_count: 10
		}
	},
	{
		flux_id: '0x5F77',
		title: 'Garlic Butter Ribeye Seared',
		tag_codes: ['MEAT', 'HIGH-PROTEIN'],
		modified_hex: '1698655C',
		yield_label: '2 STEAKS',
		time_minutes: 22,
		sys_flags: ['SYS_VERIFIED'],
		ingredients: [
			{ qty: '2', unit: '14 OZ', name: 'ribeye steaks' },
			{ qty: '2', unit: 'TBSP', name: 'neutral oil' },
			{ qty: '3', unit: 'TBSP', name: 'butter' },
			{ qty: '4', unit: 'CLOVES', name: 'garlic', note: 'smashed' },
			{ qty: '2', unit: 'SPRIGS', name: 'rosemary' }
		],
		steps: [
			'TEMPER STEAKS AND SEASON AGGRESSIVELY WITH SALT.',
			'SEAR IN A HOT PAN WITH NEUTRAL OIL UNTIL A DEEP CRUST FORMS.',
			'ADD BUTTER, GARLIC, AND ROSEMARY. BASTE UNTIL TARGET INTERNAL TEMPERATURE IS REACHED.',
			'REST FOR AT LEAST SIX MINUTES BEFORE SLICING.'
		],
		parse_trace: {
			record_bytes: 288,
			checksum_hex: '0x93A2C1',
			struct_name: 'recipe_record_v2',
			field_count: 10
		}
	},
	{
		flux_id: '0xA3C8',
		title: 'Black Bean Tacos',
		tag_codes: ['VEGAN', 'QUICK'],
		modified_hex: '1698621D',
		yield_label: '8 TACOS',
		time_minutes: 25,
		sys_flags: ['SYS_VERIFIED'],
		ingredients: [
			{ qty: '2', unit: 'CANS', name: 'black beans' },
			{ qty: '8', unit: 'COUNT', name: 'corn tortillas' },
			{ qty: '1', unit: 'TBSP', name: 'cumin' },
			{ qty: '1', unit: 'TSP', name: 'smoked paprika' },
			{ qty: '1', unit: 'COUNT', name: 'lime', note: 'cut into wedges' }
		],
		steps: [
			'SIMMER BLACK BEANS WITH CUMIN, PAPRIKA, AND A SMALL AMOUNT OF WATER UNTIL THICKENED.',
			'WARM TORTILLAS DIRECTLY OVER FLAME OR ON A DRY SKILLET.',
			'LOAD TORTILLAS, FINISH WITH LIME, AND SERVE IMMEDIATELY.'
		],
		parse_trace: {
			record_bytes: 252,
			checksum_hex: '0x0F3D3A',
			struct_name: 'recipe_record_v2',
			field_count: 10
		}
	},
	{
		flux_id: '0xB1D2',
		title: 'Chocolate Lava Cake',
		tag_codes: ['DESSERT'],
		modified_hex: '1698600E',
		yield_label: '4 CAKES',
		time_minutes: 28,
		sys_flags: ['SYS_VERIFIED', 'HEAT_CRITICAL'],
		ingredients: [
			{ qty: '6', unit: 'OUNCES', name: 'dark chocolate' },
			{ qty: '0.5', unit: 'CUP', name: 'butter' },
			{ qty: '2', unit: 'COUNT', name: 'whole eggs' },
			{ qty: '2', unit: 'COUNT', name: 'egg yolks' },
			{ qty: '0.25', unit: 'CUP', name: 'flour' }
		],
		steps: [
			'MELT CHOCOLATE AND BUTTER TOGETHER UNTIL SMOOTH.',
			'WHISK EGGS, YOLKS, AND SUGAR UNTIL LIGHT, THEN FOLD INTO THE CHOCOLATE BASE.',
			'FOLD IN FLOUR, PORTION INTO BUTTERED RAMEKINS, AND BAKE UNTIL EDGES SET.',
			'REST FOR ONE MINUTE, UNMOLD, AND SERVE WHILE THE CORE REMAINS FLUID.'
		],
		parse_trace: {
			record_bytes: 276,
			checksum_hex: '0xA9910E',
			struct_name: 'recipe_record_v2',
			field_count: 10
		}
	},
	{
		flux_id: '0xC4F3',
		title: 'Smoked Salmon Bagel Stack',
		tag_codes: ['HIGH-PROTEIN', 'QUICK'],
		modified_hex: '1698598A',
		yield_label: '2 STACKS',
		time_minutes: 10,
		sys_flags: ['SYS_VERIFIED'],
		ingredients: [
			{ qty: '2', unit: 'COUNT', name: 'bagels', note: 'toasted' },
			{ qty: '6', unit: 'OUNCES', name: 'smoked salmon' },
			{ qty: '4', unit: 'TBSP', name: 'cream cheese' },
			{ qty: '0.5', unit: 'COUNT', name: 'red onion', note: 'paper-thin slices' },
			{ qty: '1', unit: 'TBSP', name: 'capers' }
		],
		steps: [
			'TOAST BAGELS AND APPLY A THICK LAYER OF CREAM CHEESE.',
			'LAYER SALMON, ONION, AND CAPERS EVENLY ACROSS BOTH HALVES.',
			'PRESS, SLICE, AND SERVE IMMEDIATELY.'
		],
		parse_trace: {
			record_bytes: 241,
			checksum_hex: '0x01AE09',
			struct_name: 'recipe_record_v2',
			field_count: 10
		}
	},
	{
		flux_id: '0xD7E1',
		title: 'Cacio e Pepe Classic',
		tag_codes: ['PASTA'],
		modified_hex: '1698580F',
		yield_label: '2 PLATES',
		time_minutes: 20,
		sys_flags: ['SYS_VERIFIED', 'EMULSION_SENSITIVE'],
		ingredients: [
			{ qty: '8', unit: 'OUNCES', name: 'tonnarelli or spaghetti' },
			{ qty: '1.5', unit: 'CUPS', name: 'pecorino romano', note: 'finely grated' },
			{ qty: '2', unit: 'TSP', name: 'black pepper', note: 'freshly cracked' }
		],
		steps: [
			'COOK PASTA UNTIL AL DENTE AND RESERVE STARCHY WATER.',
			'TOAST BLACK PEPPER BRIEFLY IN A SKILLET.',
			'BUILD A PECORINO SLURRY WITH WARM PASTA WATER, THEN TOSS WITH PASTA OFF HEAT.',
			'ADJUST WITH MORE WATER UNTIL GLOSSY AND EMULSIFIED.'
		],
		parse_trace: {
			record_bytes: 233,
			checksum_hex: '0x79D0E2',
			struct_name: 'recipe_record_v2',
			field_count: 10
		}
	},
	{
		flux_id: '0xE2A9',
		title: 'Mango Habanero Hot Sauce',
		tag_codes: ['CONDIMENT', 'VEGAN'],
		modified_hex: '1698570B',
		yield_label: '24 OUNCES',
		time_minutes: 40,
		sys_flags: ['SYS_VERIFIED', 'ACID_LOCKED'],
		ingredients: [
			{ qty: '3', unit: 'COUNT', name: 'ripe mangoes', note: 'peeled and diced' },
			{ qty: '4', unit: 'COUNT', name: 'habaneros', note: 'stemmed' },
			{ qty: '0.5', unit: 'COUNT', name: 'yellow onion', note: 'diced' },
			{ qty: '0.75', unit: 'CUP', name: 'apple cider vinegar' },
			{ qty: '2', unit: 'TBSP', name: 'brown sugar' },
			{ qty: '1', unit: 'TSP', name: 'kosher salt' }
		],
		steps: [
			'SWEAT ONION UNTIL TRANSLUCENT, THEN LOAD MANGO, HABANERO, VINEGAR, SUGAR, AND SALT.',
			'SIMMER UNTIL THE MANGO COLLAPSES AND THE PEPPERS SOFTEN COMPLETELY.',
			'BLEND UNTIL FULLY HOMOGENEOUS. STRAIN ONLY IF A FINER TEXTURE IS REQUIRED.',
			'COOL, TRANSFER TO A SANITIZED BOTTLE, AND REFRIGERATE BEFORE SERVICE.'
		],
		parse_trace: {
			record_bytes: 317,
			checksum_hex: '0xACF221',
			struct_name: 'recipe_record_v2',
			field_count: 10
		}
	},
	{
		flux_id: '0xF308',
		title: 'Braised Short Rib Ragu',
		tag_codes: ['MEAT', 'PASTA'],
		modified_hex: '1698550C',
		yield_label: '8 SERVINGS',
		time_minutes: 210,
		sys_flags: ['SYS_VERIFIED', 'LONG_COOK'],
		ingredients: [
			{ qty: '3', unit: 'POUNDS', name: 'bone-in short ribs' },
			{ qty: '1', unit: 'COUNT', name: 'onion', note: 'diced' },
			{ qty: '2', unit: 'COUNT', name: 'carrots', note: 'diced' },
			{ qty: '2', unit: 'TBSP', name: 'tomato paste' },
			{ qty: '2', unit: 'CUPS', name: 'red wine' }
		],
		steps: [
			'SEAR SHORT RIBS UNTIL DARKLY BROWNED, THEN REMOVE.',
			'COOK ONION AND CARROT IN THE RENDERED FAT, ADDING TOMATO PASTE UNTIL BRICK RED.',
			'DEGLAZE WITH WINE, RETURN RIBS, AND BRAISE UNTIL THE MEAT SHREDS EASILY.',
			'PULL THE MEAT, REDUCE THE SAUCE, AND TOSS WITH PASTA OR POLENTA.'
		],
		parse_trace: {
			record_bytes: 299,
			checksum_hex: '0xC81743',
			struct_name: 'recipe_record_v2',
			field_count: 10
		}
	},
	{
		flux_id: '0x1B4E',
		title: 'Tiramisu Brick',
		tag_codes: ['DESSERT'],
		modified_hex: '1698540D',
		yield_label: '1 TRAY',
		time_minutes: 260,
		sys_flags: ['SYS_VERIFIED', 'CHILL_REQUIRED'],
		ingredients: [
			{ qty: '24', unit: 'COUNT', name: 'ladyfingers' },
			{ qty: '1.5', unit: 'CUPS', name: 'espresso', note: 'cooled' },
			{ qty: '16', unit: 'OUNCES', name: 'mascarpone' },
			{ qty: '4', unit: 'COUNT', name: 'egg yolks' },
			{ qty: '0.5', unit: 'CUP', name: 'sugar' }
		],
		steps: [
			'WHISK YOLKS AND SUGAR UNTIL THICK, THEN FOLD INTO MASCARPONE.',
			'DIP LADYFINGERS QUICKLY IN ESPRESSO AND LAYER INTO THE TRAY.',
			'ALTERNATE CREAM AND LADYFINGERS UNTIL THE TRAY IS FULL.',
			'CHILL UNTIL SET AND FINISH WITH COCOA BEFORE SERVICE.'
		],
		parse_trace: {
			record_bytes: 312,
			checksum_hex: '0x42E8A0',
			struct_name: 'recipe_record_v2',
			field_count: 10
		}
	},
	{
		flux_id: '0x6A7C',
		title: 'Herb Roasted Potatoes',
		tag_codes: ['SIDE', 'VEGAN'],
		modified_hex: '1698530E',
		yield_label: '4 SERVINGS',
		time_minutes: 45,
		sys_flags: ['SYS_VERIFIED'],
		ingredients: [
			{ qty: '2', unit: 'POUNDS', name: 'baby potatoes' },
			{ qty: '2', unit: 'TBSP', name: 'olive oil' },
			{ qty: '1', unit: 'TBSP', name: 'rosemary', note: 'chopped' },
			{ qty: '1', unit: 'TSP', name: 'kosher salt' }
		],
		steps: [
			'TOSS POTATOES WITH OIL, ROSEMARY, AND SALT.',
			'ROAST CUT-SIDE DOWN UNTIL DEEPLY CARAMELIZED.',
			'FINISH WITH AN EXTRA PINCH OF SALT AND SERVE HOT.'
		],
		parse_trace: {
			record_bytes: 208,
			checksum_hex: '0xE90A1F',
			struct_name: 'recipe_record_v2',
			field_count: 10
		}
	}
];

/** @param {string} tag */
function bracketTag(tag) {
	return `[${tag}]`;
}

/** @param {string} value */
function titleCase(value) {
	return value
		.toLowerCase()
		.split(' ')
		.filter(Boolean)
		.map(
			/** @param {string} segment */
			(segment) => segment.charAt(0).toUpperCase() + segment.slice(1)
		)
		.join(' ');
}

/** @param {RawIngredient} ingredient */
function parseIngredientLabel(ingredient) {
	const base = [ingredient.qty, ingredient.unit, ingredient.name].filter(Boolean).join(' ');
	return ingredient.note ? `${base} // ${ingredient.note}` : base;
}

/** @param {RawRecipe} raw */
function parseRecordSummary(raw) {
	return {
		id: raw.flux_id,
		title: raw.title,
		tags: raw.tag_codes.map(bracketTag),
		ts: raw.modified_hex
	};
}

/** @param {RawRecipe} raw */
function parseRecipeDetail(raw) {
	return {
		id: raw.flux_id,
		title: raw.title,
		updatedHex: raw.modified_hex,
		timeLabel: `${raw.time_minutes} MINS`,
		yieldLabel: raw.yield_label,
		categories: raw.tag_codes,
		systemFlags: raw.sys_flags,
		ingredients: raw.ingredients.map((ingredient, index) => ({
			id: `${raw.flux_id}-ingredient-${index + 1}`,
			label: parseIngredientLabel(ingredient),
			quantity: ingredient.qty,
			unit: ingredient.unit,
			name: titleCase(ingredient.name),
			note: ingredient.note ? titleCase(ingredient.note) : null
		})),
		steps: raw.steps.map((instruction, index) => ({
			id: `${raw.flux_id}-step-${index + 1}`,
			index: String(index + 1).padStart(2, '0'),
			instruction
		})),
		parseSummary: {
			sourceStruct: raw.parse_trace.struct_name.toUpperCase(),
			fieldCoverage: `${raw.parse_trace.field_count}/${raw.parse_trace.field_count}`,
			recordBytes: `${raw.parse_trace.record_bytes}B`,
			checksum: raw.parse_trace.checksum_hex,
			parserMode: 'C_DB_STRUCT -> UI_READ_MODEL'
		}
	};
}

export function getVaultStats() {
	return {
		total: String(RAW_RECIPES.length),
		lastSync: '09:42:11Z',
		dbSize: '4.2MB',
		latency: '12ms'
	};
}

export function getRecipeSummaries() {
	return RAW_RECIPES.map(parseRecordSummary);
}

/** @param {string} recipeId */
export function getRecipeDetail(recipeId) {
	const recipe = RAW_RECIPES.find(
		(entry) => entry.flux_id.toLowerCase() === recipeId.toLowerCase()
	);
	return recipe ? parseRecipeDetail(recipe) : null;
}

/**
 * Generate a new flux_id in hex format.
 * In production, this would come from the database schema or a proper ID generator.
 * For in-memory use, we'll generate a pseudo-random 4-digit hex value.
 */
function generateFluxId() {
	const randomHex = Math.floor(Math.random() * 0xffff)
		.toString(16)
		.toUpperCase()
		.padStart(4, '0');
	return `0x${randomHex}`;
}

/**
 * Generate a modified_hex timestamp in the same format as existing records.
 * This is a naive hex representation of a Unix timestamp,
 * following the pattern seen in RAW_RECIPES.
 */
function generateModifiedHex() {
	const timestamp = Math.floor(Date.now() / 1000);
	return timestamp.toString(16).toUpperCase();
}

/**
 * In-memory recipe repository implementation.
 * Wraps RAW_RECIPES and provides read/write operations for the application layer.
 */
export class InMemoryRecipeRepository {
	/**
	 * @param {typeof RAW_RECIPES} store
	 */
	constructor(store) {
		this.store = store;
	}

	getSummaries() {
		return getRecipeSummaries();
	}

	/**
	 * @param {string} id
	 */
	getDetail(id) {
		return getRecipeDetail(id);
	}

	/**
	 * Return a RecipeCreateInput-shaped object for pre-populating the edit form.
	 * @param {string} id
	 * @returns {import('../recipe-repository').RecipeCreateInput | null}
	 */
	getEditData(id) {
		const raw = this.store.find((r) => r.flux_id.toLowerCase() === id.toLowerCase());
		if (!raw) return null;
		return {
			title: raw.title,
			yieldLabel: raw.yield_label,
			timeMinutes: String(raw.time_minutes),
			tags: [...raw.tag_codes],
			systemFlags: [...raw.sys_flags],
			ingredients: raw.ingredients.map((ing) => ({
				quantity: ing.qty,
				unit: ing.unit,
				name: ing.name,
				note: ing.note ?? ''
			})),
			steps: raw.steps.map((instruction) => ({ instruction })),
			parserMetadata: {
				recordBytes: String(raw.parse_trace.record_bytes),
				checksumHex: raw.parse_trace.checksum_hex,
				structName: raw.parse_trace.struct_name,
				fieldCount: String(raw.parse_trace.field_count)
			}
		};
	}

	getStats() {
		return getVaultStats();
	}

	/**
	 * Create a new recipe from an ingest input payload.
	 * Maps application-level shape to RawRecipe and mutates the in-memory store.
	 *
	 * @param {import('../recipe-repository').RecipeCreateInput} input
	 * @returns {import('../recipe-repository').RecipeCreateResult}
	 */
	create(input) {
		const fluxId = generateFluxId();

		/** @type {RawRecipe} */
		const newRecipe = {
			flux_id: fluxId,
			title: input.title,
			tag_codes: input.tags,
			modified_hex: generateModifiedHex(),
			yield_label: input.yieldLabel,
			time_minutes: Number(input.timeMinutes),
			sys_flags: input.systemFlags,
			ingredients: input.ingredients.map((/** @type {any} */ row) => ({
				qty: row.quantity,
				unit: row.unit,
				name: row.name,
				note: row.note || undefined
			})),
			steps: input.steps.map((/** @type {any} */ row) => row.instruction),
			parse_trace: {
				record_bytes: Number(input.parserMetadata.recordBytes) || 256,
				checksum_hex: input.parserMetadata.checksumHex || '0x000000',
				struct_name: input.parserMetadata.structName || 'recipe_record_v2',
				field_count: Number(input.parserMetadata.fieldCount) || 10
			}
		};

		this.store.push(newRecipe);

		return {
			success: true,
			id: fluxId
		};
	}

	/**
	 * Update an existing recipe in the in-memory store.
	 * @param {string} id
	 * @param {import('../recipe-repository').RecipeCreateInput} input
	 * @returns {import('../recipe-repository').RecipeUpdateResult}
	 */
	update(id, input) {
		const idx = this.store.findIndex((r) => r.flux_id.toLowerCase() === id.toLowerCase());
		if (idx === -1) {
			return { success: false, error: 'RECORD_NOT_FOUND' };
		}

		this.store[idx] = {
			...this.store[idx],
			title: input.title,
			tag_codes: input.tags,
			modified_hex: generateModifiedHex(),
			yield_label: input.yieldLabel,
			time_minutes: Number(input.timeMinutes),
			sys_flags: input.systemFlags,
			ingredients: input.ingredients.map((row) => ({
				qty: row.quantity,
				unit: row.unit,
				name: row.name,
				note: row.note || undefined
			})),
			steps: input.steps.map((row) => row.instruction),
			parse_trace: {
				record_bytes: Number(input.parserMetadata.recordBytes) || 256,
				checksum_hex: input.parserMetadata.checksumHex || '0x000000',
				struct_name: input.parserMetadata.structName || 'recipe_record_v2',
				field_count: Number(input.parserMetadata.fieldCount) || 10
			}
		};

		return { success: true, id };
	}

	/**
	 * Delete a recipe from the in-memory store.
	 * @param {string} id
	 * @returns {import('../recipe-repository').RecipeDeleteResult}
	 */
	delete(id) {
		const idx = this.store.findIndex((r) => r.flux_id.toLowerCase() === id.toLowerCase());
		if (idx === -1) {
			return { success: false, error: 'RECORD_NOT_FOUND' };
		}
		this.store.splice(idx, 1);
		return { success: true };
	}
}

/**
 * Singleton instance of the in-memory repository.
 * In production, this would be replaced with a poudb-backed implementation.
 */
export const recipeRepository = new InMemoryRecipeRepository(RAW_RECIPES);
