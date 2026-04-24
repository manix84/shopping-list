# Smart Shopping List

[![Deploy to GitHub Pages](https://github.com/manix84/shopping-list/actions/workflows/deploy-gh-pages.yml/badge.svg)](https://github.com/manix84/shopping-list/actions/workflows/deploy-gh-pages.yml) [![CI](https://github.com/manix84/shopping-list/actions/workflows/ci.yml/badge.svg)](https://github.com/manix84/shopping-list/actions/workflows/ci.yml)

A React + TypeScript shopping list app with country-aware routing, compact item metadata, and GitHub Pages deployment.

## What it does

- accepts pasted or typed shopping lists
- groups items into supermarket sections using country configs
- understands quantities like `bananas x2`, `2x apples`, `500g mince`
- supports size qualifiers like `small milk` and renders them as a badge
- applies display aliases for common milk shorthand like `blue milk`, `gold milk`, `green milk`, and `red milk`
- persists data locally so the app can be reopened without losing state
- includes debug self-checks for quantity parsing and section matching
- deploys to GitHub Pages via GitHub Actions

## Routes

The app uses hash-based routing so direct links work on GitHub Pages:

- `#/edit` - list editor
- `#/route` - store route
- `#/settings` - country config and section reference
- `#/debug` - parser self-checks

If a page needs data that is not available yet, it shows a warning and points you to the page that can populate it.

## Getting started

```bash
npm install
npm run dev
```

## Optional backend mode

The app can run in two modes:

- frontend-only mode uses browser `localStorage` and works as a static site
- backend mode is enabled automatically when `/api/health` responds

When backend mode is available, the app loads the browser record and the backend record, chooses the newest saved record using `updatedAt`, writes that winning record to both places, then keeps saving future edits to both local cache and the backend.

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

### Home Assistant

Set these environment variables before starting the backend:

```bash
HOME_ASSISTANT_URL=http://homeassistant.local:8123
HOME_ASSISTANT_TOKEN=your-long-lived-access-token
```

Backend routes:

- `GET /api/home-assistant/status`
- `POST /api/home-assistant/sync` pushes the current backend shopping list to Home Assistant
- `POST /api/home-assistant/add-item` with `{ "name": "Milk" }`
- `POST /api/home-assistant/remove-item` with `{ "name": "Milk" }`
- `POST /api/home-assistant/complete-item` with `{ "name": "Milk" }`
- `POST /api/home-assistant/incomplete-item` with `{ "name": "Milk" }`
- `POST /api/home-assistant/sort`

## Shared lists

Every browser session has an internal UUIDv7-style list id. When the backend is connected, that list id is migrated to the backend and shown in path-based URLs:

```text
/list/<uuidv7>/edit
```

Anyone with the link can edit the same list. Changes are saved to the shared backend record after each completed app state change and cached locally as an offline backup. If the backend is offline, new offline-only lists keep their UUID hidden from the URL; lists that have already been backend-backed keep the `/list/<uuidv7>` URL and render from local storage until the backend comes back.

Shared list API routes:

- `POST /api/shared-lists`
- `GET /api/shared-lists/:id`
- `PUT /api/shared-lists/:id`
- `DELETE /api/shared-lists/:id`

## Build

```bash
npm run build
npm run preview
```

## Deployment

The repo includes a GitHub Actions workflow in `.github/workflows/deploy-gh-pages.yml` that builds on push to `main` and publishes `dist/` to GitHub Pages.

## Project structure

- `src/config/countries` country-specific supermarket configs
- `src/lib` parsing, matching, routing helpers, and debug checks
- `src/lib/repository` persistence layer
- `src/components` reusable UI pieces
- `src/pages` top-level views
- `src/styles` SCSS styling
- `.github/workflows` GitHub Pages deployment
