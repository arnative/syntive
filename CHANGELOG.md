# Changelog

All notable changes to the **Syntive** project will be documented in this file.

---

## [1.3.1] - 2026-08-16

### 🪶 Over-Engineering Audit (Ponytail) — Round 2
- **−433 net lines** across 19 files (+3 shared helpers created, 1 dead component deleted).
- Management module: 53 hand-rolled `language === 'id'` ternaries migrated to the shared `t()` i18n system (~33 new dictionary keys); the `language` prop is gone from all 4 tabs.
- Management scan/action handlers deduplicated into `runScan` / `runAction` / `triState` / `autoSelectSet` helpers.
- Segmented filter pill copy-pasted 7× replaced by one shared `ui/filter-btn.tsx`; success notice banner by `ui/notice-banner.tsx`; dnd collision + overlay animation by `lib/dnd.ts`.

### ♻️ Native Over Reimplementation
- Hijri calendar arithmetic (custom leap formula + 32-line day-accumulation loop) now derives everything from `Intl` Umm al-Qura — also fixes the old formula's ±1-day mismatch with the displayed "today".
- Theme surface tinting: 30-line `hexToOklch` color science replaced by CSS relative color syntax (`oklch(from var(--accent-source) l c h)`) in `globals.css`; per-preset `--primary-foreground` values are precomputed.
- `normalizeUrl` (duplicate matching) rebuilt on `new URL()` — lowercases the host and strips hash/query natively.
- Dead `chrome.topSites.get(callback)` fallback removed (WXT guarantees promise-based `browser.*`).

### 🐛 Fixes
- **Sync pull-restore is now partial-failure safe**: restoring merged toolbar nodes runs per top-level node, and if any node fails the sync never pushes the incomplete tree nor advances the local version (previously a single bad node could permanently drop local-only bookmarks created after it).
- Bookmark "back" navigation derives the parent from breadcrumbs instead of a separate async fetch (removes a state + effect race).
- Trash summary text ("Total N item") now localized in EN.
- Stale-page flash in Trash/Favorite-sites pagination replaced by a derived page clamp.

### 🧹 Cleanup
- Sidebar collapsed/expanded dual-branch renders merged into single conditional renders (4 components).
- `BookmarkView`: twin root drop zones → one `DropZone`; `currentFolder` state removed; dead SSR portal guards removed.
- `WidgetsSection`: dead controlled/uncontrolled dual modal state removed (single controlled caller); dashboard stats threaded as one object.
- Deleted unused `ui/list-item-card.tsx`; moved popup-only `formatTime` out of shared utils.

---

## [1.1.4] - 2026-07-31

### 🎨 Custom UI Dropdown Component Refinement
- **Replaced Native `<select>`**: Upgraded base `Select` component (`select.tsx`) from HTML native select elements to custom Radix UI `DropdownMenu` components, matching the sleek design of the Search Engine bar.
- **Dark Aesthetic Alignment**: Standardized background (`var(--color-card)`), borders (`var(--color-border)`), rounded corners (`rounded-2xl`), hover states, and active option checkmark indicators across all app dropdowns.
- **Clean Scrollbar Clipping**: Wrapped options list in an inner scrollable container (`max-h-60 overflow-y-auto custom-scrollbar p-1`) inside an outer `overflow-hidden` container to prevent scrollbar bleeding/offsetting over rounded borders.
- **Universal Application**: Instantly enhanced Radio Al-Quran reciter dropdown, Theme preset selector, and Bookmark management filter controls.

---

## [1.1.3] - 2026-07-29

### 🎨 Sidebar & Footer UX Refinements
- **Trash Bin Relocation**: Moved "Tong Sampah" (Trash Bin) navigation item from footer to the sidebar navigation section directly above the profile/device card for cleaner layout and full text visibility.
- **Support Button Integration**: Integrated a labeled Support button (`<Heart />`) into the sidebar footer, linking directly to the Support & Donation modal.
- **Header Cleanup**: Removed duplicate Support button from top header for a cleaner top navigation bar.
- **Compact Settings Control**: Streamlined Settings into a minimal icon-only button alongside the Theme mode switch in the footer bar.

---

## [1.1.2] - 2026-07-29

### 🪶 Lean & Cleanup (Over-Engineering Audit)
- **-794 net lines** of dead/duplicated/speculative code removed across 30 files.
- **-4 dependencies**: `@dicebear/core`, `@dicebear/collection`, `@radix-ui/react-tooltip`, `sharp`.
- **Bundle size -27 kB** (712 kB → 685 kB).
- Removed dead `mergeTrees` merge engine + its test (sync overwrites wholesale).
- Removed unused Tooltip system (all tooltips use native `title`).
- Removed `purgeExpiredTrash` wrapper and 6 dead UI exports.
- Removed `generate-icons.mjs` script + `sharp` dep (PNG icons already committed).

### 🔧 Deduplication
- One shared `formatSyncAgo` helper replaces 3 inline copies.
- `trash.ts` reuses `serializeNode`/`restoreTree` from `sync.ts`.
- One shared `domainOf` helper replaces 4 copies.
- One `useRandomQuote` hook replaces 2 identical quote widgets.
- 5 credit panels → 1 data array + map.
- 4 tool-tab empty states → 1 `ScanTableState` component.
- Hijri calendar: event labels deduped (table + hardcoded if-chains merged); dead Julian fallback removed.
- Widget config migration: 18-branch if-chain → Map lookup; `DEFAULT_ORDER` derived.

### 🐛 Fixes
- **`Clear Local Cache` now actually works** — was removing nonexistent storage keys (`syntive.lastSyncTime`, `syntive.vaultHash`); now removes real keys (`syntive.version`, `syntive.lastSync`, `syntive.dirty`).
- Fixed pre-existing typecheck failure (CSS side-effect imports) via `globals.d.ts`.
- Crypto self-check moved out of production bundle (removed `node:url` build warning).

### ♻️ Native Over Reimplementation
- `Select` rebuilt on native `<select>` (Radix dropdown → 32 lines).
- `AbortSignal.timeout()` replaces manual `AbortController` + `setTimeout` pairs.
- Device label UA-sniffing 12 browsers → 6 (Brave/Opera/Edge/Chrome/Firefox/Safari).
- Dicebear avatar → simple initial-letter glyph.

---

## [1.1.0] - 2026-07-27

### 🚀 Highlights
- **Initial Public Release of Syntive** — Zero-Knowledge End-to-End Encrypted bookmark synchronization extension for Chromium & Firefox browsers.

### ✨ Key Features

#### 🛡️ Security & Privacy (Zero-Knowledge E2E)
- **Client-Side Encryption**: Bookmarks are encrypted locally in the browser using **AES-GCM** before sync. The backend server only sees opaque encrypted blobs.
- **12-Word Indonesian Mnemonic**: Secret key derivation via PBKDF2 + HKDF. Your secret key never leaves your device.
- **Device Registry & Conflict Resolution**: Automatic conflict resolution via timestamp and version tracking per device.

#### 📊 Dashboard & New Tab Page
- **Custom New Tab Experience**: Overrides browser new tab with a clean, fast dashboard.
- **Search Engine Bar**: Multi-engine search support (Google, DuckDuckGo, Bing, Brave, Ecosia, etc.).
- **Top & Favorite Sites**: Quick access grid with automatic favicon fetching.
- **Hijri Calendar Widget**: Built-in Hijri & Gregorian date display.

#### 🧰 Bookmark Management & Optimization Tools
- **Duplicate Links Cleaner**: Detect and remove duplicate bookmark URLs across folders.
- **Domain Grouping**: Automatically organize and group bookmarks by domain/host.
- **Empty Folders Detector**: Quickly locate and clean up empty bookmark directories.
- **Folder Merging Tool**: Merge folders with identical names to prevent duplicate directory sprawl.
- **Trash & Recovery**: Soft-delete system allowing item restoration or permanent purge.

#### 🔄 Cross-Platform & Backend
- **WXT Multi-Browser Support**: Built for Chromium (Chrome, Edge, Brave) & Firefox.
- **Cloudflare Worker + D1 Backend**: Lightweight, low-latency sync server built on Cloudflare Workers and D1 SQLite.
