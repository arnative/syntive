# Syntive

> Bookmark sync extension for Chromium & Firefox — zero-knowledge end-to-end encrypted. Your bookmarks are encrypted in the browser before they ever touch the server. The server (Cloudflare Worker + D1) only stores opaque encrypted blobs.

[Bahasa Indonesia](README.md)

## Features

- **New Tab Dashboard** — Clock, Bookmark Stats, Favorite Sites, Most Visited, Todo and more; widget order is reorderable (drag & drop).
- **E2E Sync** — the bookmark tree is AES-GCM encrypted on-device; the server only stores ciphertext.
- **Multi-device** — device + session registry, conflicts resolved last-write-wins (version + timestamp).
- **Bilingual UI** — Indonesian (default) and English, switchable from Settings.
- **Color Schemes** — theme presets + import a color scheme from GitHub.
- **Trash Bin** — delete bookmarks with restore.
- **Hide sites** — hide sites from the "Most Visited" widget without touching browser history.

## Architecture

- **`extension/`** — WXT + React + Tailwind + shadcn/ui. Overrides the new-tab page with the Syntive dashboard.
- **`backend/`** — Cloudflare Worker (native fetch handler) + D1 (SQLite). Stores encrypted vault blobs + device registry.

## Security model

A 12-word mnemonic (Secret Key) is derived via PBKDF2 + HKDF into:

- `encKey` (AES-GCM) — encrypts the bookmark tree locally
- `authId` — account identity sent to the server (the mnemonic never leaves the device)

The server cannot read your bookmarks. `authId` acts as a bearer token; the Worker rate-limits per `authId`.

Conflict resolution is last-write-wins per device (version + timestamp). Sync runs every 15 minutes, on browser startup, and on manual trigger from the popup.

## Setup

### 1. Backend (Cloudflare Worker + D1)

```bash
cd backend
bun install
bunx wrangler login
bunx wrangler d1 create syntive      # copy the database_id into wrangler.toml
bunx wrangler d1 migrations apply syntive --remote
bunx wrangler deploy
```

After deploying, copy the Worker URL (e.g. `https://syntive.<subdomain>.workers.dev`) into `extension/.env` as `VITE_API_BASE`.

#### Using your own Cloudflare D1 database

Syntive is not tied to any particular database — you are free to use your own Cloudflare account and D1 database. Here's how:

1. **Log in to your Cloudflare account**
   ```bash
   cd backend
   bunx wrangler login
   ```

2. **Create a new D1 database** (any name, e.g. `syntive`)
   ```bash
   bunx wrangler d1 create syntive
   ```
   This prints a `database_id` (UUID) that belongs to you.

3. **Put your `database_id` into `backend/wrangler.toml`** — replace the old `database_id` with your UUID, and adjust `database_name` if different:
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "syntive"
   database_id = "YOUR-UUID-HERE"
   migrations_dir = "migrations"
   ```

4. **Apply the schema** (tables `vaults` + `devices`):
   ```bash
   bunx wrangler d1 migrations apply syntive --remote
   ```
   For local development, run `bunx wrangler d1 migrations apply syntive --local` (creates a local D1 under `.wrangler`).

5. **Deploy the Worker** bound to your database:
   ```bash
   bunx wrangler deploy
   ```

6. **Point the extension at your Worker** — create `extension/.env` from the example:
   ```bash
   cd ../extension
   cp .env.example .env
   ```
   Then set `VITE_API_BASE` to your Worker URL (e.g. `https://syntive.<subdomain>.workers.dev`).

> **Note:** `wrangler.toml` contains a `database_id` which is public (not a secret), but never commit Cloudflare API tokens. CI deploys use the `CLOUDFLARE_API_TOKEN` secret (see CI/CD).

### 2. Extension

```bash
cd extension
bun install
cp .env.example .env        # set VITE_API_BASE to your Worker URL
bun run dev                 # load unpacked in Chrome / about:debugging in Firefox
```

### 3. Build & Package

From the project root:

```bash
bun run build:ext           # build Chrome + Firefox in one go
bun run build:ext:chrome    # Chrome only
bun run build:ext:firefox   # Firefox only
bun run zip:ext             # zip Chrome + Firefox + sources
bun run zip:ext:chrome      # Chrome zip only
bun run zip:ext:firefox     # Firefox zip only
```

Build output: `extension/.output/chrome-mv3/` and `extension/.output/firefox-mv2/`. Zips: `extension/.output/syntive-extension-<version>-{chrome,firefox,sources}.zip`.

### 4. Checks

```bash
bun run typecheck           # extension + backend
cd extension && bun run lint
```

## Env

- `VITE_API_BASE` — the deployed Worker origin (e.g. `https://syntive.<subdomain>.workers.dev`). Injected at build time via `__API_BASE__` in `extension/wxt.config.ts`.

## CI/CD

- `.github/workflows/deploy-backend.yml` — deploys the Worker on push to `backend/` (requires `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` secrets; skipped without them).
- `.github/workflows/build-extension.yml` — typechecks, builds Chrome + Firefox zips, and uploads them as artifacts on `v*` tags.
