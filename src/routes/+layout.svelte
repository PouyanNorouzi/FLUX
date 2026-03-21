<script>
	import { page } from '$app/state';
	import { cubicOut } from 'svelte/easing';
	import { fade, fly } from 'svelte/transition';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import ToastContainer from '$lib/components/ToastContainer.svelte';

	let { children } = $props();

	const isVaultRoute = $derived(page.url.pathname.startsWith('/vault'));
	const enterTransition = $derived(
		isVaultRoute
			? { y: 18, opacity: 0.35, duration: 360, easing: cubicOut }
			: { y: 24, opacity: 0.5, duration: 300, easing: cubicOut }
	);
	const exitTransition = $derived(isVaultRoute ? { duration: 230 } : { duration: 180 });
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{#key page.url.pathname}
	<div
		in:fly={enterTransition}
		out:fade={exitTransition}
	>
		{@render children()}
	</div>
{/key}
<ToastContainer />
