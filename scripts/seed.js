#!/usr/bin/env node
/**
 * Seed script — populates the poudb database with example recipes.
 *
 * Usage:
 *   POUDB_KEY=<your-passkey> node scripts/seed.js
 *   POUDB_KEY=<passkey> POUDB_HOST=127.0.0.1 POUDB_PORT=3005 node scripts/seed.js
 */

import { PoudbClient } from 'poudb-client';

const POUDB_KEY = process.env.POUDB_KEY ?? '';
const POUDB_HOST = process.env.POUDB_HOST ?? '127.0.0.1';
const POUDB_PORT = Number(process.env.POUDB_PORT ?? '3005');

const RECIPE_TABLE = process.env.POUDB_TABLE ?? 'recipes';
const INGREDIENTS_TABLE = process.env.POUDB_INGREDIENTS_TABLE ?? 'ingredients';
const TAGS_TABLE = process.env.POUDB_TAGS_TABLE ?? 'tags';

/** @type {import('poudb-client').SchemaField[]} */
const RECIPE_SCHEMA = [
	{ type: 'string', name: 'title' },
	{ type: 'string', name: 'yield_label' },
	{ type: 'int', name: 'time_minutes' },
	{ type: 'string[]', name: 'steps' },
	{ type: 'int[]', name: 'ingredient_keys' },
	{ type: 'int[]', name: 'tag_keys' }
];

/** @type {import('poudb-client').SchemaField[]} */
const INGREDIENT_SCHEMA = [
	{ type: 'string', name: 'qty' },
	{ type: 'string', name: 'unit' },
	{ type: 'string', name: 'name' },
	{ type: 'string', name: 'note' }
];

/** @type {import('poudb-client').SchemaField[]} */
const TAG_SCHEMA = [{ type: 'string', name: 'code' }];

// ---------------------------------------------------------------------------
// Example recipes
// ---------------------------------------------------------------------------

/**
 * @typedef {{
 *   title: string,
 *   yieldLabel: string,
 *   timeMinutes: number,
 *   tags: string[],
 *   ingredients: { quantity: string, unit: string, name: string, note?: string }[],
 *   steps: string[]
 * }} SeedRecipe
 */

/** @type {SeedRecipe[]} */
const RECIPES = [
	{
		title: 'Shakshuka',
		yieldLabel: '2 SERVINGS',
		timeMinutes: 30,
		tags: ['BREAKFAST', 'VEGETARIAN', 'QUICK'],
		ingredients: [
			{ quantity: '2', unit: 'TBSP', name: 'olive oil' },
			{ quantity: '1', unit: 'COUNT', name: 'yellow onion', note: 'diced' },
			{ quantity: '1', unit: 'COUNT', name: 'red bell pepper', note: 'diced' },
			{ quantity: '4', unit: 'CLOVES', name: 'garlic', note: 'minced' },
			{ quantity: '1', unit: 'TSP', name: 'cumin' },
			{ quantity: '1', unit: 'TSP', name: 'smoked paprika' },
			{ quantity: '0.5', unit: 'TSP', name: 'chili flakes' },
			{ quantity: '1', unit: 'CAN', name: 'crushed tomatoes', note: '28 oz' },
			{ quantity: '4', unit: 'COUNT', name: 'large eggs' },
			{ quantity: '0.25', unit: 'CUP', name: 'feta cheese', note: 'crumbled' }
		],
		steps: [
			'HEAT OLIVE OIL IN A WIDE SKILLET OVER MEDIUM HEAT. SOFTEN ONION AND BELL PEPPER FOR 6 MINUTES.',
			'ADD GARLIC, CUMIN, PAPRIKA, AND CHILI FLAKES. COOK FOR 1 MINUTE UNTIL FRAGRANT.',
			'POUR IN CRUSHED TOMATOES AND SIMMER FOR 10 MINUTES. SEASON WITH SALT AND PEPPER.',
			'MAKE FOUR WELLS IN THE SAUCE AND CRACK AN EGG INTO EACH ONE.',
			'COVER AND COOK FOR 5 TO 7 MINUTES UNTIL WHITES ARE SET BUT YOLKS ARE STILL RUNNY.',
			'SCATTER FETA OVER THE TOP AND SERVE DIRECTLY FROM THE PAN WITH CRUSTY BREAD.'
		]
	},
	{
		title: 'Chicken Tikka Masala',
		yieldLabel: '4 SERVINGS',
		timeMinutes: 55,
		tags: ['DINNER', 'MEAT', 'HIGH-PROTEIN'],
		ingredients: [
			{ quantity: '1.5', unit: 'POUNDS', name: 'chicken thighs', note: 'cubed' },
			{ quantity: '1', unit: 'CUP', name: 'plain yogurt' },
			{ quantity: '2', unit: 'TSP', name: 'garam masala' },
			{ quantity: '1', unit: 'TSP', name: 'turmeric' },
			{ quantity: '1', unit: 'TSP', name: 'cumin' },
			{ quantity: '1', unit: 'TBSP', name: 'ginger', note: 'freshly grated' },
			{ quantity: '4', unit: 'CLOVES', name: 'garlic', note: 'minced' },
			{ quantity: '1', unit: 'CAN', name: 'tomato puree', note: '14 oz' },
			{ quantity: '1', unit: 'CUP', name: 'heavy cream' },
			{ quantity: '2', unit: 'TBSP', name: 'butter' }
		],
		steps: [
			'MARINATE CHICKEN IN YOGURT, GARAM MASALA, TURMERIC, AND HALF THE GINGER AND GARLIC FOR AT LEAST 30 MINUTES.',
			'CHAR CHICKEN UNDER THE BROILER OR IN A HOT CAST IRON PAN UNTIL LIGHTLY BLACKENED. SET ASIDE.',
			'MELT BUTTER IN A WIDE PAN. SAUTÉ REMAINING GARLIC AND GINGER UNTIL GOLDEN.',
			'ADD TOMATO PUREE AND REMAINING SPICES. SIMMER FOR 10 MINUTES.',
			'POUR IN HEAVY CREAM AND STIR TO COMBINE. RETURN CHICKEN TO THE SAUCE.',
			'SIMMER FOR 10 MORE MINUTES UNTIL THE SAUCE THICKENS AND COATS THE CHICKEN. ADJUST SALT.',
			'SERVE WITH BASMATI RICE OR WARM NAAN.'
		]
	},
	{
		title: 'Caesar Salad',
		yieldLabel: '4 SERVINGS',
		timeMinutes: 20,
		tags: ['SALAD', 'QUICK', 'VEGETARIAN'],
		ingredients: [
			{ quantity: '2', unit: 'COUNT', name: 'romaine hearts', note: 'chopped' },
			{ quantity: '0.5', unit: 'CUP', name: 'parmesan', note: 'finely grated, plus shavings' },
			{ quantity: '1', unit: 'CUP', name: 'croutons' },
			{ quantity: '3', unit: 'CLOVES', name: 'garlic' },
			{ quantity: '2', unit: 'COUNT', name: 'anchovy fillets', note: 'optional' },
			{ quantity: '1', unit: 'COUNT', name: 'egg yolk' },
			{ quantity: '1', unit: 'TBSP', name: 'dijon mustard' },
			{ quantity: '1', unit: 'TBSP', name: 'lemon juice' },
			{ quantity: '0.5', unit: 'CUP', name: 'olive oil' }
		],
		steps: [
			'POUND GARLIC AND ANCHOVIES INTO A PASTE USING A MORTAR AND PESTLE.',
			'WHISK TOGETHER EGG YOLK, MUSTARD, AND LEMON JUICE IN A BOWL.',
			'SLOWLY DRIZZLE IN OLIVE OIL WHILE WHISKING TO BUILD AN EMULSIFIED DRESSING.',
			'FOLD IN THE GARLIC PASTE AND HALF THE GRATED PARMESAN. SEASON WITH SALT AND PEPPER.',
			'TOSS ROMAINE WITH DRESSING UNTIL EVERY LEAF IS LIGHTLY COATED.',
			'TOP WITH CROUTONS AND PARMESAN SHAVINGS. SERVE IMMEDIATELY.'
		]
	},
	{
		title: 'Banana Bread',
		yieldLabel: '1 LOAF',
		timeMinutes: 75,
		tags: ['DESSERT', 'BAKING', 'VEGETARIAN'],
		ingredients: [
			{ quantity: '3', unit: 'COUNT', name: 'ripe bananas', note: 'mashed' },
			{ quantity: '0.33', unit: 'CUP', name: 'unsalted butter', note: 'melted' },
			{ quantity: '0.75', unit: 'CUP', name: 'sugar' },
			{ quantity: '1', unit: 'COUNT', name: 'egg', note: 'beaten' },
			{ quantity: '1', unit: 'TSP', name: 'vanilla extract' },
			{ quantity: '1', unit: 'TSP', name: 'baking soda' },
			{ quantity: '1', unit: 'CUP', name: 'all-purpose flour' },
			{ quantity: '0.5', unit: 'TSP', name: 'cinnamon' },
			{ quantity: '0.25', unit: 'TSP', name: 'salt' }
		],
		steps: [
			'PREHEAT OVEN TO 350°F (175°C). BUTTER A 9×5 INCH LOAF PAN.',
			'MIX MELTED BUTTER INTO THE MASHED BANANAS UNTIL SMOOTH.',
			'STIR IN SUGAR, BEATEN EGG, AND VANILLA.',
			'SPRINKLE BAKING SODA AND SALT OVER THE MIXTURE AND FOLD IN.',
			'ADD FLOUR AND CINNAMON. STIR ONLY UNTIL JUST COMBINED — DO NOT OVERMIX.',
			'POUR BATTER INTO PREPARED PAN AND BAKE FOR 55 TO 65 MINUTES UNTIL A TOOTHPICK COMES OUT CLEAN.',
			'COOL IN PAN FOR 10 MINUTES, THEN TURN OUT ONTO A RACK.'
		]
	},
	{
		title: 'French Onion Soup',
		yieldLabel: '4 SERVINGS',
		timeMinutes: 90,
		tags: ['SOUP', 'VEGETARIAN'],
		ingredients: [
			{ quantity: '4', unit: 'COUNT', name: 'large yellow onions', note: 'thinly sliced' },
			{ quantity: '3', unit: 'TBSP', name: 'unsalted butter' },
			{ quantity: '1', unit: 'TBSP', name: 'olive oil' },
			{ quantity: '1', unit: 'TSP', name: 'sugar' },
			{ quantity: '0.5', unit: 'CUP', name: 'dry white wine' },
			{ quantity: '6', unit: 'CUPS', name: 'beef or vegetable stock' },
			{ quantity: '1', unit: 'TSP', name: 'fresh thyme' },
			{ quantity: '8', unit: 'COUNT', name: 'baguette slices', note: 'toasted' },
			{ quantity: '2', unit: 'CUPS', name: 'gruyere', note: 'grated' }
		],
		steps: [
			'MELT BUTTER WITH OIL IN A HEAVY POT OVER MEDIUM HEAT. ADD ONIONS AND STIR TO COAT.',
			'COOK ONIONS SLOWLY FOR 45 TO 60 MINUTES, STIRRING EVERY FEW MINUTES, UNTIL DEEP GOLDEN BROWN.',
			'ADD SUGAR AND COOK FOR 2 MORE MINUTES. DEGLAZE WITH WINE AND SCRAPE UP ANY FOND.',
			'ADD STOCK AND THYME. SIMMER FOR 15 MINUTES. SEASON WITH SALT AND PEPPER.',
			'LADLE SOUP INTO OVEN-SAFE BOWLS. FLOAT BAGUETTE SLICES ON TOP AND COVER WITH GRUYERE.',
			'BROIL UNTIL CHEESE IS BUBBLY AND SPOTTED BROWN. SERVE IMMEDIATELY.'
		]
	},
	{
		title: 'Honey Garlic Salmon',
		yieldLabel: '2 SERVINGS',
		timeMinutes: 20,
		tags: ['DINNER', 'MEAT', 'HIGH-PROTEIN', 'QUICK'],
		ingredients: [
			{ quantity: '2', unit: 'COUNT', name: 'salmon fillets', note: '6 oz each' },
			{ quantity: '3', unit: 'CLOVES', name: 'garlic', note: 'minced' },
			{ quantity: '3', unit: 'TBSP', name: 'honey' },
			{ quantity: '2', unit: 'TBSP', name: 'soy sauce' },
			{ quantity: '1', unit: 'TBSP', name: 'lemon juice' },
			{ quantity: '1', unit: 'TBSP', name: 'olive oil' }
		],
		steps: [
			'PAT SALMON DRY AND SEASON WITH SALT AND PEPPER.',
			'WHISK TOGETHER HONEY, SOY SAUCE, LEMON JUICE, AND GARLIC TO MAKE THE GLAZE.',
			'HEAT OIL IN AN OVEN-SAFE SKILLET OVER MEDIUM-HIGH HEAT.',
			'SEAR SALMON SKIN-SIDE UP FOR 3 MINUTES UNTIL A GOLDEN CRUST FORMS. FLIP AND SEAR 2 MORE MINUTES.',
			'POUR THE GLAZE OVER THE FISH AND TRANSFER THE PAN TO A 400°F OVEN.',
			'BAKE FOR 5 TO 6 MINUTES, BASTING ONCE, UNTIL THE GLAZE IS CARAMELIZED AND SALMON IS JUST COOKED THROUGH.'
		]
	},
	{
		title: 'Mushroom Risotto',
		yieldLabel: '4 SERVINGS',
		timeMinutes: 45,
		tags: ['DINNER', 'VEGETARIAN'],
		ingredients: [
			{ quantity: '1.5', unit: 'CUPS', name: 'arborio rice' },
			{ quantity: '1', unit: 'POUND', name: 'mixed mushrooms', note: 'sliced' },
			{ quantity: '1', unit: 'COUNT', name: 'shallot', note: 'finely diced' },
			{ quantity: '3', unit: 'CLOVES', name: 'garlic', note: 'minced' },
			{ quantity: '0.5', unit: 'CUP', name: 'dry white wine' },
			{ quantity: '5', unit: 'CUPS', name: 'warm vegetable stock' },
			{ quantity: '3', unit: 'TBSP', name: 'butter' },
			{ quantity: '0.5', unit: 'CUP', name: 'parmesan', note: 'grated' },
			{ quantity: '2', unit: 'TBSP', name: 'olive oil' }
		],
		steps: [
			'SAUTÉ MUSHROOMS IN 1 TBSP BUTTER OVER HIGH HEAT UNTIL GOLDEN. SEASON AND SET ASIDE.',
			'REDUCE HEAT TO MEDIUM. COOK SHALLOT IN OIL UNTIL TRANSLUCENT, THEN ADD GARLIC.',
			'ADD ARBORIO RICE AND TOAST FOR 2 MINUTES, STIRRING CONSTANTLY.',
			'DEGLAZE WITH WINE AND STIR UNTIL ABSORBED.',
			'ADD WARM STOCK ONE LADLE AT A TIME, STIRRING AND ALLOWING EACH ADDITION TO ABSORB BEFORE ADDING MORE.',
			'AFTER ABOUT 20 MINUTES, WHEN RICE IS AL DENTE AND CREAMY, REMOVE FROM HEAT.',
			'FOLD IN REMAINING BUTTER AND PARMESAN. STIR IN RESERVED MUSHROOMS. SERVE AT ONCE.'
		]
	},
	{
		title: 'Classic Beef Chili',
		yieldLabel: '6 SERVINGS',
		timeMinutes: 60,
		tags: ['DINNER', 'MEAT', 'HIGH-PROTEIN'],
		ingredients: [
			{ quantity: '1.5', unit: 'POUNDS', name: 'ground beef' },
			{ quantity: '1', unit: 'COUNT', name: 'yellow onion', note: 'diced' },
			{ quantity: '1', unit: 'COUNT', name: 'green bell pepper', note: 'diced' },
			{ quantity: '4', unit: 'CLOVES', name: 'garlic', note: 'minced' },
			{ quantity: '2', unit: 'TBSP', name: 'chili powder' },
			{ quantity: '1', unit: 'TSP', name: 'cumin' },
			{ quantity: '1', unit: 'TSP', name: 'smoked paprika' },
			{ quantity: '2', unit: 'CANS', name: 'kidney beans', note: '15 oz each, drained' },
			{ quantity: '1', unit: 'CAN', name: 'crushed tomatoes', note: '28 oz' },
			{ quantity: '1', unit: 'CUP', name: 'beef stock' }
		],
		steps: [
			'BROWN GROUND BEEF IN A LARGE POT OVER HIGH HEAT. DRAIN EXCESS FAT.',
			'ADD ONION AND BELL PEPPER. COOK FOR 5 MINUTES UNTIL SOFTENED.',
			'STIR IN GARLIC, CHILI POWDER, CUMIN, AND PAPRIKA. COOK FOR 1 MINUTE.',
			'ADD CRUSHED TOMATOES, BEEF STOCK, AND BEANS. STIR TO COMBINE.',
			'BRING TO A BOIL, THEN REDUCE TO A STEADY SIMMER FOR 30 MINUTES, STIRRING OCCASIONALLY.',
			'ADJUST SEASONING AND SERVE WITH SHREDDED CHEESE, SOUR CREAM, AND CORNBREAD.'
		]
	},
	{
		title: 'Avocado Toast with Poached Egg',
		yieldLabel: '2 SERVINGS',
		timeMinutes: 15,
		tags: ['BREAKFAST', 'VEGETARIAN', 'QUICK'],
		ingredients: [
			{ quantity: '2', unit: 'COUNT', name: 'thick bread slices', note: 'sourdough preferred' },
			{ quantity: '1', unit: 'COUNT', name: 'ripe avocado' },
			{ quantity: '2', unit: 'COUNT', name: 'large eggs' },
			{ quantity: '1', unit: 'TBSP', name: 'lemon juice' },
			{ quantity: '0.5', unit: 'TSP', name: 'chili flakes' },
			{ quantity: '1', unit: 'TSP', name: 'white vinegar', note: 'for poaching water' }
		],
		steps: [
			'TOAST THE BREAD TO GOLDEN BROWN.',
			'MASH AVOCADO WITH LEMON JUICE, SALT, AND PEPPER UNTIL SPREADABLE BUT STILL CHUNKY.',
			'BRING A SAUCEPAN OF WATER TO A GENTLE SIMMER. ADD VINEGAR.',
			'CRACK EACH EGG INTO A SMALL CUP AND SLIDE INTO THE SIMMERING WATER. POACH FOR 3 MINUTES.',
			'SPREAD AVOCADO ON TOAST. TOP WITH A POACHED EGG.',
			'FINISH WITH CHILI FLAKES, A CRACK OF PEPPER, AND FLAKY SEA SALT.'
		]
	},
	{
		title: 'Lemon Herb Roast Chicken',
		yieldLabel: '4 SERVINGS',
		timeMinutes: 100,
		tags: ['DINNER', 'MEAT', 'HIGH-PROTEIN'],
		ingredients: [
			{ quantity: '1', unit: 'COUNT', name: 'whole chicken', note: '3.5 to 4 lbs' },
			{ quantity: '1', unit: 'COUNT', name: 'lemon', note: 'halved' },
			{ quantity: '4', unit: 'CLOVES', name: 'garlic', note: 'smashed' },
			{ quantity: '3', unit: 'TBSP', name: 'softened butter' },
			{ quantity: '4', unit: 'SPRIGS', name: 'fresh thyme' },
			{ quantity: '2', unit: 'SPRIGS', name: 'fresh rosemary' },
			{ quantity: '1', unit: 'TBSP', name: 'olive oil' }
		],
		steps: [
			'PAT CHICKEN COMPLETELY DRY INSIDE AND OUT. SEASON GENEROUSLY WITH SALT ALL OVER.',
			'MIX BUTTER WITH CHOPPED THYME, ROSEMARY, AND ZEST FROM THE LEMON.',
			'LOOSEN THE SKIN OVER THE BREAST AND RUB HERB BUTTER DIRECTLY ONTO THE MEAT. RUB REMAINING BUTTER ON THE OUTSIDE.',
			'STUFF THE CAVITY WITH LEMON HALVES, GARLIC, AND REMAINING HERB SPRIGS.',
			'TRUSS THE LEGS AND ROAST BREAST-SIDE UP AT 425°F (220°C) FOR 70 TO 80 MINUTES.',
			'CHECK THAT THE THIGH REACHES 165°F (74°C) INTERNALLY. REST UNCOVERED FOR 15 MINUTES BEFORE CARVING.'
		]
	}
];

// ---------------------------------------------------------------------------
// Seeding logic
// ---------------------------------------------------------------------------

/**
 * Resolve a tag code to its stored key, creating it if missing.
 * @param {PoudbClient} client
 * @param {string} code
 * @returns {Promise<number>}
 */
async function resolveTagKey(client, code) {
	const trimmed = code.trim().toUpperCase();
	const searchResult = await client.search(TAGS_TABLE, 'code', trimmed, { schema: TAG_SCHEMA });
	if (searchResult.rows.length > 0 && searchResult.rows[0].key > 0) {
		return searchResult.rows[0].key;
	}
	return client.add(TAGS_TABLE, '*', [trimmed]);
}

/**
 * Insert a single recipe and return its flux_id.
 * @param {PoudbClient} client
 * @param {SeedRecipe} recipe
 * @returns {Promise<string>}
 */
async function insertRecipe(client, recipe) {
	const [ingredientKeys, tagKeys] = await Promise.all([
		Promise.all(
			recipe.ingredients.map((ing) =>
				client.add(INGREDIENTS_TABLE, '*', [
					String(ing.quantity),
					String(ing.unit),
					String(ing.name),
					String(ing.note ?? '')
				])
			)
		),
		(async () => {
			const keys = [];
			for (const tag of recipe.tags) {
				keys.push(await resolveTagKey(client, tag));
			}
			return keys;
		})()
	]);

	const key = await client.add(RECIPE_TABLE, '*', [
		recipe.title,
		recipe.yieldLabel,
		recipe.timeMinutes,
		recipe.steps,
		ingredientKeys,
		tagKeys
	]);

	return `0x${key.toString(16).toUpperCase().padStart(4, '0')}`;
}

/**
 * Ensure tables exist, ignoring "already exists" errors.
 * @param {PoudbClient} client
 */
async function ensureSchema(client) {
	const isAlreadyExists = (/** @type {unknown} */ err) =>
		err instanceof Error && err.message.toUpperCase().includes('ALREADY');

	await Promise.all([
		client.create(RECIPE_TABLE, RECIPE_SCHEMA).catch((e) => { if (!isAlreadyExists(e)) throw e; }),
		client.create(INGREDIENTS_TABLE, INGREDIENT_SCHEMA).catch((e) => { if (!isAlreadyExists(e)) throw e; }),
		client.create(TAGS_TABLE, TAG_SCHEMA).catch((e) => { if (!isAlreadyExists(e)) throw e; })
	]);
}

async function main() {
	if (!POUDB_KEY) {
		console.error('ERROR: POUDB_KEY environment variable is required.');
		console.error('  Usage: POUDB_KEY=<passkey> node scripts/seed.js');
		process.exit(1);
	}

	const client = new PoudbClient({ host: POUDB_HOST, port: POUDB_PORT });

	try {
		console.log(`Connecting to poudb at ${POUDB_HOST}:${POUDB_PORT}...`);
		await client.connect();
		await client.auth(POUDB_KEY);
		console.log('Connected and authenticated.\n');

		await ensureSchema(client);

		for (const recipe of RECIPES) {
			process.stdout.write(`  Inserting "${recipe.title}"... `);
			const id = await insertRecipe(client, recipe);
			console.log(`done (${id})`);
		}

		console.log(`\nSeeded ${RECIPES.length} recipes successfully.`);
	} finally {
		await client.disconnect().catch(() => {});
	}
}

main().catch((err) => {
	console.error('Seed failed:', err.message ?? err);
	process.exit(1);
});
