# FLUX — Recipe Vault

A brutalist operator-console recipe management application built with SvelteKit and backed by [poudb](https://github.com/pouyandb/poudb) — a custom C database over TCP.

---

## Features

- **Vault** — Browse, search, and filter recipes by tag categories (e.g., `[VEGAN]`, `[HIGH-PROTEIN]`, `[PASTA]`)
- **Ingest** — Create recipes with structured ingredients, cooking steps, yield, and time estimates
- **Detail view** — Full recipe schematics with a parsed ingredient and execution step layout
- **Edit** — Update any recipe in place
- **System telemetry** — Live connection status, latency, and record counts in the UI
- **Passkey auth** — Secure vault access

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | SvelteKit 2 + Svelte 5 (runes) |
| Styling | Tailwind CSS 4 |
| Database | poudb (custom C DB over TCP) |
| Type system | JSDoc |
| Package manager | pnpm |

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- pnpm
- A running [poudb](https://github.com/pouyandb/poudb) server

### Install

```bash
pnpm install
```

### Environment

Create a `.env` file (or set environment variables):

```env
POUDB_HOST=127.0.0.1   # default: 127.0.0.1
POUDB_PORT=3005         # default: 3005
POUDB_TABLE=recipes     # default: recipes
```

### Develop

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173).

### Build

```bash
pnpm build
pnpm preview   # preview the production build
```

---

## Project Structure

```
src/
├── routes/
│   ├── +page.svelte              # Auth / login entry point
│   └── vault/
│       ├── +page.svelte          # Vault index — list, search, filter
│       ├── [id]/+page.svelte     # Recipe detail view
│       ├── [id]/edit/            # Edit form
│       └── ingest/               # Create recipe form
└── lib/
    ├── components/               # Reusable UI components
    ├── errors/                   # Server + client action error handling
    ├── stores/toast.js           # Toast notification store
    ├── recipe-repository.js      # Abstract repository interface + validation
    ├── poudb-repository.js       # Concrete poudb implementation
    └── ingredient-units.js       # Supported ingredient units
```

---

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm preview` | Preview production build |
| `pnpm check` | Svelte type-check |
| `pnpm lint` | Prettier + ESLint |
| `pnpm format` | Auto-format all files |

---

## Design

See [DESIGN.md](DESIGN.md) for the full design system — palette, typography, component patterns, and operator vocabulary.
