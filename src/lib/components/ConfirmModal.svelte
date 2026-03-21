<script>
	/**
	 * @type {{
	 *   open: boolean,
	 *   title: string,
	 *   itemLabel?: string,
	 *   message: string,
	 *   warningLabel?: string,
	 *   confirmLabel?: string,
	 *   cancelLabel?: string,
	 *   loading?: boolean,
	 *   onConfirm: () => void,
	 *   onCancel: () => void
	 * }}
	 */
	let {
		open,
		title,
		itemLabel = '',
		message,
		warningLabel = 'DESTRUCTIVE_OP // CONFIRM_REQUIRED',
		confirmLabel = 'CONFIRM',
		cancelLabel = 'ABORT',
		loading = false,
		onConfirm,
		onCancel
	} = $props();
</script>

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-signal-black/70 p-4"
		role="dialog"
		aria-modal="true"
		aria-labelledby="confirm-modal-title"
	>
		<div class="brutalist-border w-full max-w-lg bg-cold-console-white shadow-hard">
			<div class="bg-signal-black px-6 py-4">
				<div
					class="mb-1 flex items-center gap-2 font-mono text-xs font-bold tracking-widest text-molten-commit-orange uppercase"
				>
					<span class="material-symbols-outlined text-base">warning</span>
					{warningLabel}
				</div>
				<h2
					id="confirm-modal-title"
					class="font-display text-2xl font-bold tracking-tight text-cold-console-white uppercase"
				>
					{title}
				</h2>
			</div>
			<div class="p-6">
				{#if itemLabel}
					<p class="mb-2 font-mono text-sm leading-7 uppercase">
						<span class="font-bold">{itemLabel}</span>
					</p>
				{/if}
				<p class="font-mono text-xs leading-6 text-muted uppercase">{message}</p>
				<div class="mt-6 flex flex-col gap-3 sm:flex-row">
					<button
						type="button"
						onclick={onConfirm}
						disabled={loading}
						class="brutalist-border flex-1 bg-molten-commit-orange px-6 py-3 font-display text-base font-bold uppercase shadow-hard transition-opacity hover:opacity-80 disabled:opacity-50"
					>
						<span class="flex items-center justify-center gap-2 text-signal-black">
							{#if loading}
								<span class="material-symbols-outlined animate-pulse text-base"
									>hourglass_empty</span
								>
								PROCESSING...
							{:else}
								<span
									class="material-symbols-outlined text-base"
									style="font-variation-settings: 'FILL' 1;">delete_forever</span
								>
								{confirmLabel}
							{/if}
						</span>
					</button>
					<button
						type="button"
						onclick={onCancel}
						disabled={loading}
						class="brutalist-border flex-1 bg-cold-console-white px-6 py-3 font-display text-base font-bold uppercase shadow-hard transition-colors hover:bg-signal-black hover:text-cold-console-white disabled:opacity-50"
					>
						{cancelLabel}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
