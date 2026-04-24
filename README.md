# 🛒 Smart Shopping List

[![Deploy to GitHub Pages](https://github.com/manix84/shopping-list/actions/workflows/deploy-gh-pages.yml/badge.svg)](https://github.com/manix84/shopping-list/actions/workflows/deploy-gh-pages.yml) [![CI](https://github.com/manix84/shopping-list/actions/workflows/ci.yml/badge.svg)](https://github.com/manix84/shopping-list/actions/workflows/ci.yml)

A React + TypeScript shopping list app that turns a rough grocery list into an ordered route through the store. It runs as a static frontend by default, can install as a PWA, and can use an optional backend for shared lists and durable settings.

## ✨ What it does

- accepts pasted or typed shopping lists
- groups items into supermarket sections using country configs
- understands quantities like `bananas x2`, `2x apples`, `500g mince`
- supports size qualifiers like `small milk` and renders them as a badge
- applies display aliases for common milk shorthand like `blue milk`, `gold milk`, `green milk`, and `red milk`
- persists data locally so the app can be reopened without losing state
- supports backend-backed shared list links that anyone with the link can edit
- generates themed QR codes for shared lists and can scan shared-list QR codes when the browser supports camera scanning
- remembers recently opened shared lists locally on the device for quick reopening
- stores the country profile in the backend when available, with local fallback
- supports English and Spanish UI text, defaulting from the browser language
- supports light, dark, and system themes, including PWA chrome theme colours
- includes debug self-checks for backend health, database state, quantity parsing, and section matching
- deploys to GitHub Pages via GitHub Actions

## 🧭 Routes

The app uses hash-based routing so direct links work on GitHub Pages:

- `#/edit` - list editor, used when there is no saved list yet or when editing an existing list
- `#/route` - shopping list route view
- `#/sections` - read-only section and route-order reference
- `#/settings` - language, country profile, and theme preferences
- `#/debug` - parser self-checks

Backend-backed shared lists use path routes:

- `/list/<uuidv7>/edit` - shared list editor
- `/list/<uuidv7>/route` - shared list route view

If a page needs data that is not available yet, it shows a warning and points you to the page that can populate it.

## 🚀 Getting started

```bash
npm install
npm run dev
```

## 🗄️ Optional backend mode

The app can run in two modes:

- frontend-only mode uses browser `localStorage` and works as a static site
- backend mode is enabled automatically when `/api/health` responds

When backend mode is available, the app loads the browser record and the backend record, chooses the newest saved record using `updatedAt`, writes that winning record to both places, then keeps saving future edits to both local cache and the backend. The country profile is also stored in the backend settings record and cached locally for offline use. Language remains a browser preference and defaults from the user's browser language.

Run the backend API:

```bash
npm run api
```

Run the frontend in another terminal:

```bash
npm run dev
```

The Vite dev server proxies `/api` to `http://localhost:8787`. For production backend hosting, build the frontend and run the API server:

```bash
npm run build
npm run api
```

By default, the backend stores data in `data/shopping-list-db.json`. Set `SHOPPING_LIST_DB_PATH` to use another file path.

Backend utility routes:

- `GET /api/health`
- `GET /api/database/status`
- `GET /api/settings`
- `PUT /api/settings`

### 🏠 Home Assistant

Home Assistant integration code exists in the backend, but it is currently disabled by default. The current implementation does not yet model one Home Assistant list per shared app list, so it is not suitable for general multi-user use.

To experiment with the disabled integration locally, explicitly opt in before starting the backend:

```bash
ENABLE_HOME_ASSISTANT_INTEGRATION=true
HOME_ASSISTANT_URL=http://homeassistant.local:8123
HOME_ASSISTANT_TOKEN=your-long-lived-access-token
```

Disabled-by-default backend routes:

- `GET /api/home-assistant/status`
- `POST /api/home-assistant/sync` pushes the current backend shopping list to Home Assistant
- `POST /api/home-assistant/add-item` with `{ "name": "Milk" }`
- `POST /api/home-assistant/remove-item` with `{ "name": "Milk" }`
- `POST /api/home-assistant/complete-item` with `{ "name": "Milk" }`
- `POST /api/home-assistant/incomplete-item` with `{ "name": "Milk" }`
- `POST /api/home-assistant/sort`

## 🔗 Shared lists

Every browser session has an internal UUIDv7-style list id. When the backend is connected, that list id is migrated to the backend and shown in path-based URLs:

```text
/list/<uuidv7>/edit
```

Anyone with the link can edit the same list. Changes are saved to the shared backend record after each completed app state change and cached locally as an offline backup. If the backend is offline, new offline-only lists keep their UUID hidden from the URL; lists that have already been backend-backed keep the `/list/<uuidv7>` URL and render from local storage until the backend comes back.

The sharing panel also supports:

- copying the shared URL
- showing a themed QR code for the current shared list
- scanning another shared-list QR code into the shared-list input
- collapsing pasted shared URLs down to just the UUIDv7 in the shared-list input
- validating that scanned or pasted list ids exist in the backend
- a device-local history of recently opened shared lists with quick reopen/delete actions
- tapping a recent-history card to reopen that list, with drag protection so scroll gestures do not trigger accidental loads

Empty lists do not create new shared-list entries. The `New List` action also removes the current shared list instead of leaving behind an empty backend record. If a previously opened shared list is empty, the recent-history panel labels it as `Empty list`.

Shared list API routes:

- `POST /api/shared-lists`
- `GET /api/shared-lists/:id`
- `PUT /api/shared-lists/:id`
- `DELETE /api/shared-lists/:id`

## 📲 PWA install

The app includes a web app manifest, install icons, theme-aware browser favicons, and runtime theme-colour updates. Light, dark, and system theme choices update the browser/PWA chrome where the host OS supports dynamic `theme-color` changes. Some installed app shells cache manifest metadata, so reinstalling the PWA may be needed after manifest colour or icon changes.

### Install it

On supported browsers you can install the app with the browser's install action:

- desktop Chrome / Edge: use the install icon in the address bar
- Android Chrome: use `Add to Home screen` / `Install app`
- iPhone / iPad Safari: use `Share` -> `Add to Home Screen`

### PWA notes

- the app works offline with local storage even without the backend
- backend-backed shared lists still need network access to validate, refresh, or load remote list data
- QR scanning depends on browser camera support and `BarcodeDetector`; if it is unavailable, the scanner action is hidden and you can paste the shared UUID or URL manually
- if you change icons or manifest colours, some installed shells keep stale assets until the app is removed and installed again

## 🧪 Build

```bash
npm run build
npm run preview
```

## 🚢 Deployment

The repo includes a GitHub Actions workflow in `.github/workflows/deploy-gh-pages.yml` that builds on push to `main` and publishes `dist/` to GitHub Pages.

## 🧱 Project structure

- `server` file-backed backend API and disabled Home Assistant integration stub
- `src/config/countries` country-specific supermarket configs
- `src/lib` parsing, matching, routing helpers, and debug checks
- `src/lib/repository` persistence layer
- `src/components` reusable UI pieces
- `src/pages` top-level views
- `src/styles` SCSS styling
- `.github/workflows` GitHub Pages deployment

## 📄 License

MIT. See [LICENSE](./LICENSE).

## 🔒 Privacy

See [PRIVACY.md](./PRIVACY.md).
