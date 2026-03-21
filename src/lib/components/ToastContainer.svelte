<script>
	import { onDestroy } from 'svelte';
	import Toast from '$lib/components/Toast.svelte';
	import { toastStore } from '$lib/stores/toast.js';

	/** @type {Array<{id: string, variant: 'error' | 'success', title: string, message: string, dismissible: boolean}>} */
	let toasts = $state([]);

	const unsubscribe = toastStore.subscribe((value) => {
		toasts = value;
	});

	onDestroy(() => {
		unsubscribe();
	});
</script>

<section
	class="pointer-events-none fixed right-4 bottom-4 z-70 flex w-[min(92vw,22rem)] flex-col gap-3"
	aria-live="polite"
	aria-atomic="false"
>
	{#each toasts as toast (toast.id)}
		<Toast {toast} onClose={() => toastStore.dismissToast(toast.id)} />
	{/each}
</section>
