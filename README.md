# Syntive

Bookmark sync extension for Chromium & Firefox — zero-knowledge end-to-end encrypted. Your bookmarks are encrypted in the browser before they ever touch the server. The server (Cloudflare Worker + D1) only stores opaque encrypted blobs.

## Architecture

- **`extension/`** — WXT + React + Tailwind + shadcn/ui. Overrides the new-tab page with the Syntive dashboard.
- **`backend/`** — Cloudflare Worker (native fetch handler) + D1 (SQLite). Stores encrypted vault blobs + device registry.

## Security model

A 12-word Indonesian mnemonic (Secret Key) is derived via PBKDF2 + HKDF into:
- `encKey` (AES-GCM) — encrypts the bookmark tree locally
- `authId` — account identity sent to the server (the mnemonic never leaves the device)

The server cannot read your bookmarks. `authId` acts as a bearer token; the Worker rate-limits per `authId`.

Conflict resolution is last-write-wins per device (version + timestamp). Sync runs every 15 minutes, on browser startup, and on manual trigger from the popup.

## Setup

### Backend (Cloudflare Worker + D1)
```bash
cd backend
bun install
bunx wrangler login
bunx wrangler d1 create syntive          # copy the database_id into wrangler.toml
bunx wrangler d1 migrations apply syntive --remote
bunx wrangler deploy
# set the Worker URL in extension/.env as VITE_API_BASE
```

### Extension
```bash
cd extension
bun install
cp .env.example .env                  # set VITE_API_BASE to your Worker URL
bun run dev                            # load unpacked in Chrome / about:debugging in Firefox
bun run build                         # production build for Chromium
bun run build:firefox                 # production build for Firefox
bun run zip                           # package for store upload
```

### Checks
```bash
bun run typecheck   # extension + backend
cd extension && bun run lint
```

## Env
- `VITE_API_BASE` — the deployed Worker origin (e.g. `https://syntive.<sub>.workers.dev`)

## CI/CD
- `.github/workflows/deploy-backend.yml` — deploys the Worker on push to `backend/` (requires `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` secrets; skipped without them).
- `.github/workflows/build-extension.yml` — typechecks, builds Chrome + Firefox zips, and uploads them as artifacts on `v*` tags.
