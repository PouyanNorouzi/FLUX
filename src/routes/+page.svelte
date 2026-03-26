<script>
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Button from '$lib/components/Button.svelte';
	import Input from '$lib/components/Input.svelte';
	import { mapRepositoryErrorToMessage } from '$lib/errors/action-errors.js';

	let passkey = $state('');
	let error = $state(false);
	let gateError = $state('');
	let dbStatus = $state('unknown');
	let dbPort = $state(3005);
	let connected = $state(false);
	let loading = $state(false);

	const DB_UNAVAILABLE_FALLBACK =
		'Database is currently unreachable. Verify PoUDB is online and try again.';

	function dbStatusLabel() {
		if (dbStatus === 'checking') return 'POUDB_CONN_CHECKING';
		if (dbStatus === 'online') return 'POUDB_CONN_ACTIVE';
		if (dbStatus === 'offline') return 'POUDB_CONN_OFFLINE';
		return 'POUDB_CONN_UNKNOWN';
	}

	function dbStatusFooterLabel() {
		if (dbStatus === 'checking') return 'POUDB_PROBING';
		if (dbStatus === 'online') return 'POUDB_ONLINE';
		if (dbStatus === 'offline') return 'POUDB_OFFLINE';
		return 'POUDB_STATUS_UNKNOWN';
	}

	async function probeDatabaseConnectivity() {
		try {
			const response = await fetch(resolve('/api/db-health'));
			const payload = await response.json().catch(() => ({}));
			if (typeof payload?.port === 'number' && Number.isFinite(payload.port)) {
				dbPort = payload.port;
			}

			if (response.ok && payload?.success === true) {
				return { success: true, message: '' };
			}

			const code = typeof payload?.code === 'string' ? payload.code : undefined;
			return {
				success: false,
				message: mapRepositoryErrorToMessage(code, DB_UNAVAILABLE_FALLBACK)
			};
		} catch {
			return {
				success: false,
				message: DB_UNAVAILABLE_FALLBACK
			};
		}
	}

	async function handleSubmit() {
		if (!passkey.trim()) {
			error = true;
			gateError = '';
			return;
		}
		error = false;
		gateError = '';
		loading = true;
		dbStatus = 'checking';

		const connectivity = await probeDatabaseConnectivity();
		if (!connectivity.success) {
			loading = false;
			dbStatus = 'offline';
			gateError = connectivity.message;
			return;
		}

		dbStatus = 'online';

		setTimeout(() => {
			loading = false;
			connected = true;
			goto(resolve('/vault'));
		}, 800);
	}
</script>

<svelte:head>
	<link
		href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="flex min-h-screen items-center justify-center p-4">
	<!-- Screen flash overlay -->
	{#if connected}
		<div
			class="pointer-events-none fixed inset-0 z-50"
			style="animation: flash 0.3s ease-out forwards;"
		></div>
	{/if}

	<!-- Main card -->
	<main
		class="brutalist-border z-10 flex w-full max-w-100 flex-col bg-cold-console-white shadow-hard"
	>
		<!-- Black header -->
		<header
			class="flex items-center justify-between border-b-4 border-signal-black bg-signal-black p-4 text-cold-console-white"
		>
			<h1
				class="flex items-center font-display text-xl font-bold tracking-tighter uppercase md:text-2xl"
			>
				<span
					class="material-symbols-outlined mr-2 text-molten-commit-orange"
					style="font-variation-settings: 'FILL' 1;">terminal</span
				>
				FLUX SECURE ACCESS<span class="cursor-blink ml-1 text-molten-commit-orange">_</span>
			</h1>
		</header>

		<!-- Status ticker -->
		<div
			class="flex items-center justify-between border-b-4 border-signal-black bg-surface px-4 py-2 font-mono text-[10px] font-bold text-muted uppercase"
		>
			<span>{dbStatusLabel()}</span>
			<span>PORT: {dbPort} TCP</span>
		</div>

		<!-- Body -->
		{#if !connected}
			<!-- Auth form -->
			<form
				class="flex flex-col gap-6 p-6 md:p-8"
				onsubmit={(e) => {
					e.preventDefault();
					handleSubmit();
				}}
			>
				<Input
					id="passkey"
					label="FLUX_AUTH_TOKEN"
					type="password"
					placeholder="> POUDB_PASSKEY..."
					bind:value={passkey}
					{error}
					errorMessage="ERR_AUTH_FAILED: INVALID_TOKEN"
					icon="key"
				/>
				{#if gateError}
					<p
						class="border-2 border-signal-black bg-surface px-3 py-2 font-mono text-[10px] text-signal-black uppercase"
					>
						ERR_DB_UNAVAILABLE: {gateError}
					</p>
				{/if}
				<Button type="submit" {loading} icon="database">[ WRITE TO POUDB ]</Button>
			</form>
		{:else}
			<!-- CONN_ESTABLISHED panel -->
			<div class="flex flex-col gap-4 p-6 md:p-8">
				<div class="flex flex-col gap-3 border-2 border-signal-black bg-surface p-6">
					<div class="flex items-center gap-3">
						<span class="h-3 w-3 shrink-0 animate-pulse rounded-full bg-daemon-green-pulse"></span>
						<span class="font-display text-xl font-bold tracking-tighter uppercase"
							>AUTH_CONFIRMED</span
						>
					</div>
					<p class="font-mono text-xs leading-relaxed tracking-wider text-muted uppercase">
						POUDB_CONN_ESTABLISHED // ACCESS GRANTED<br />
						SESSION ACTIVE · PORT {dbPort} TCP
					</p>
				</div>
			</div>
		{/if}

		<!-- Footer -->
		<footer
			class="mt-auto flex items-center justify-between bg-signal-black p-2 font-mono text-[10px] text-muted"
		>
			<span>FLUX v1.0.4 build-8a9b2c</span>
			<span class="flex items-center gap-1">
				<span
					class="h-2 w-2 rounded-full"
					class:animate-pulse={dbStatus !== 'offline'}
					class:bg-daemon-green-pulse={dbStatus === 'online'}
					class:bg-molten-commit-orange={dbStatus === 'checking' || dbStatus === 'unknown'}
					class:bg-red-600={dbStatus === 'offline'}
				></span>
				{dbStatusFooterLabel()}
			</span>
		</footer>
	</main>
</div>
