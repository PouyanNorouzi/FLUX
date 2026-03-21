/** @typedef {{ id: string; title: string; tags: string[]; ts: string }} Recipe */

/** @type {Recipe[]} */
const MOCK_RECORDS = [
	{ id: '0x8F9A', title: 'Garlic Confit Bomb', tags: ['[CONDIMENT]', '[VEGAN]'], ts: '1698742A' },
	{
		id: '0x2B4C',
		title: 'Roasted Garlic Mashed Potatoes',
		tags: ['[SIDE]', '[CARBS]'],
		ts: '1698739F'
	},
	{ id: '0x9D1E', title: 'Aglio e Olio Protocol', tags: ['[PASTA]', '[QUICK]'], ts: '1698721B' },
	{
		id: '0x5F77',
		title: 'Garlic Butter Ribeye Seared',
		tags: ['[MEAT]', '[HIGH-PROTEIN]'],
		ts: '1698655C'
	},
	{ id: '0xA3C8', title: 'Black Bean Tacos', tags: ['[VEGAN]', '[QUICK]'], ts: '1698621D' },
	{ id: '0xB1D2', title: 'Chocolate Lava Cake', tags: ['[DESSERT]'], ts: '1698600E' },
	{
		id: '0xC4F3',
		title: 'Smoked Salmon Bagel Stack',
		tags: ['[HIGH-PROTEIN]', '[QUICK]'],
		ts: '1698598A'
	},
	{ id: '0xD7E1', title: 'Cacio e Pepe Classic', tags: ['[PASTA]'], ts: '1698580F' },
	{
		id: '0xE2A9',
		title: 'Mango Habanero Hot Sauce',
		tags: ['[CONDIMENT]', '[VEGAN]'],
		ts: '1698570B'
	},
	{ id: '0xF308', title: 'Braised Short Rib Ragu', tags: ['[MEAT]', '[PASTA]'], ts: '1698550C' },
	{ id: '0x1B4E', title: 'Tiramisu Brick', tags: ['[DESSERT]'], ts: '1698540D' },
	{ id: '0x6A7C', title: 'Herb Roasted Potatoes', tags: ['[SIDE]', '[VEGAN]'], ts: '1698530E' }
];

const MOCK_STATS = {
	total: '12',
	lastSync: '09:42:11Z',
	dbSize: '4.2MB',
	latency: '12ms'
};

/** @type {import('./$types').PageLoad} */
export async function load() {
	// Simulate TCP round-trip delay to POUDB daemon on port 8080
	await new Promise((resolve) => setTimeout(resolve, 500));
	return {
		records: MOCK_RECORDS,
		stats: MOCK_STATS
	};
}
