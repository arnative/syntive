<img src="design/Syntive_hero.webp" alt="Syntive Hero" width="100%">

[Indonesia](README.md) · [English](README.en.md)

# Syntive
Ekstensi sinkronisasi bookmark untuk Chromium & Firefox — terenkripsi end-to-end **zero-knowledge**. Bookmark Anda dienkripsi di browser sebelum menyentuh server. Server (Cloudflare Worker + D1) hanya menyimpan blok terenkripsi yang tidak dapat dibaca.



## Fitur

- **Dashboard New Tab** — widget Waktu, Statistik Bookmark, Situs Favorit, Sering Diakses, Todo, dan lainnya; urutan widget bisa diubah (drag & drop).
- **Sinkronisasi E2E** — pohon bookmark dienkripsi AES-GCM di perangkat; server hanya menyimpan ciphertext.
- **Multi-perangkat** — registri perangkat + sesi, konflik diselesaikan last-write-wins (versi + timestamp).
- **Dua bahasa** — antarmuka Indonesia (default) dan Inggris, bisa diganti dari Pengaturan.
- **Skema Warna** — preset tema + impor skema warna dari GitHub.
- **Kotak Sampah** — hapus bookmark dengan pemulihan.
- **Sembunyikan situs** — sembunyikan situs dari widget "Sering Diakses" tanpa menghapus histori browser.

## Arsitektur

- **`extension/`** — WXT + React + Tailwind + shadcn/ui. Menggantikan halaman new-tab dengan dashboard Syntive.
- **`backend/`** — Cloudflare Worker (fetch handler native) + D1 (SQLite). Menyimpan blok vault terenkripsi + registri perangkat.

## Model Keamanan

Mnemonic 12 kata (Secret Key) diturunkan via PBKDF2 + HKDF menjadi:

- `encKey` (AES-GCM) — mengenkripsi pohon bookmark secara lokal
- `authId` — identitas akun yang dikirim ke server (mnemonic tidak pernah meninggalkan perangkat)

Server tidak dapat membaca bookmark Anda. `authId` bertindak sebagai bearer token; Worker melakukan rate-limit per `authId`.

Resolusi konflik: last-write-wins per perangkat (versi + timestamp). Sinkronisasi berjalan setiap 15 menit, saat browser start, dan manual dari popup.

## Setup

### 1. Backend (Cloudflare Worker + D1)

```bash
cd backend
bun install
bunx wrangler login
bunx wrangler d1 create syntive      # salin database_id ke wrangler.toml
bunx wrangler d1 migrations apply syntive --remote
bunx wrangler deploy
```

Setelah deploy, salin URL Worker (mis. `https://syntive.<subdomain>.workers.dev`) ke `extension/.env` sebagai `VITE_API_BASE`.

#### Menggunakan database Cloudflare D1 milik sendiri

Syntive tidak terikat pada database tertentu — Anda bebas memakai akun Cloudflare dan database D1 Anda sendiri. Caranya:

1. **Login ke akun Cloudflare Anda**
   ```bash
   cd backend
   bunx wrangler login
   ```

2. **Buat database D1 baru** (nama bebas, mis. `syntive`)
   ```bash
   bunx wrangler d1 create syntive
   ```
   Perintah ini mencetak `database_id` (UUID) milik Anda.

3. **Pasang `database_id` ke `backend/wrangler.toml`** — ganti nilai `database_id` yang lama dengan UUID Anda, dan sesuaikan `database_name` bila berbeda:
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "syntive"
   database_id = "UUID-ANDA-DI-SINI"
   migrations_dir = "migrations"
   ```

4. **Terapkan skema** (tabel `vaults` + `devices`):
   ```bash
   bunx wrangler d1 migrations apply syntive --remote
   ```
   Untuk pengembangan lokal, jalankan `bunx wrangler d1 migrations apply syntive --local` (membuat D1 lokal di `.wrangler`).

5. **Deploy Worker** yang terhubung ke database Anda:
   ```bash
   bunx wrangler deploy
   ```

6. **Arahkan ekstensi ke Worker Anda** — buat `extension/.env` dari contoh:
   ```bash
   cd ../extension
   cp .env.example .env
   ```
   Lalu ubah `VITE_API_BASE` menjadi URL Worker Anda (mis. `https://syntive.<subdomain>.workers.dev`).

> **Catatan:** `wrangler.toml` berisi `database_id` yang bersifat publik (bukan rahasia), tetapi jangan pernah meng-commit token API Cloudflare. Deploy via CI memakai secret `CLOUDFLARE_API_TOKEN` (lihat bagian CI/CD).

### 2. Ekstensi

```bash
cd extension
bun install
cp .env.example .env        # set VITE_API_BASE ke URL Worker Anda
bun run dev                 # load unpacked di Chrome / about:debugging di Firefox
```

### 3. Build & Paket

Dari root proyek:

```bash
bun run build:ext           # build Chrome + Firefox sekaligus
bun run build:ext:chrome    # hanya Chrome
bun run build:ext:firefox   # hanya Firefox
bun run zip:ext             # zip Chrome + Firefox + sources
bun run zip:ext:chrome      # hanya zip Chrome
bun run zip:ext:firefox     # hanya zip Firefox
```

Output build: `extension/.output/chrome-mv3/` dan `extension/.output/firefox-mv2/`. Zip: `extension/.output/syntive-extension-<versi>-{chrome,firefox,sources}.zip`.

### 4. Pemeriksaan

```bash
bun run typecheck           # extension + backend
cd extension && bun run lint
```

## Env

- `VITE_API_BASE` — origin Worker yang di-deploy (mis. `https://syntive.<subdomain>.workers.dev`). Diinjeksi saat build melalui `__API_BASE__` di `extension/wxt.config.ts`.

## CI/CD

- `.github/workflows/deploy-backend.yml` — deploy Worker saat ada push ke `backend/` (butuh secret `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`; dilewati jika tidak ada).
- `.github/workflows/build-extension.yml` — typecheck, build zip Chrome + Firefox, dan unggah sebagai artifact pada tag `v*`.
