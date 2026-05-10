# 🛒 Smart Shopping List

[![Lint](https://github.com/manix84/shopping-list/actions/workflows/lint.yml/badge.svg)](https://github.com/manix84/shopping-list/actions/workflows/lint.yml) [![Type Check](https://github.com/manix84/shopping-list/actions/workflows/typecheck.yml/badge.svg)](https://github.com/manix84/shopping-list/actions/workflows/typecheck.yml) [![Test](https://github.com/manix84/shopping-list/actions/workflows/test.yml/badge.svg)](https://github.com/manix84/shopping-list/actions/workflows/test.yml) [![Build](https://github.com/manix84/shopping-list/actions/workflows/build.yml/badge.svg)](https://github.com/manix84/shopping-list/actions/workflows/build.yml) [![Accessibility](https://github.com/manix84/shopping-list/actions/workflows/accessibility.yml/badge.svg)](https://github.com/manix84/shopping-list/actions/workflows/accessibility.yml) [![Lighthouse](https://github.com/manix84/shopping-list/actions/workflows/lighthouse.yml/badge.svg)](https://github.com/manix84/shopping-list/actions/workflows/lighthouse.yml)

[![Deploy to GitHub Pages](https://github.com/manix84/shopping-list/actions/workflows/deploy-gh-pages.yml/badge.svg)](https://github.com/manix84/shopping-list/actions/workflows/deploy-gh-pages.yml) [![DigitalOcean deployment](https://img.shields.io/website?url=https%3A%2F%2Fshopping-list-6baqs.ondigitalocean.app&label=DigitalOcean)](https://shoppinglist.website)

[![Version](https://img.shields.io/github/package-json/v/manix84/shopping-list?filename=package.json&label=version)](package.json) [![Compressed app shell size](https://img.badgesize.io/https://manix84.github.io/shopping-list/index.html?compression=gzip&label=compressed%20app%20shell&color=blue&size=dec)](https://manix84.github.io/shopping-list/)

A React + TypeScript shopping list app that turns a rough grocery list into an ordered route through the store. It runs as a static frontend by default, can install as a PWA, and can use an optional backend for shared lists.

See [What's New](WHATSNEW.md) for recent changes and major app milestones.

## 📸 App screens

These are real app screenshots with numbered callouts. The README versions are generated from `docs/screenshots/source` with:

```bash
node scripts/generate-readme-screenshots.mjs
```

The generator uses Playwright Chromium. If the browser binary is missing after installing dependencies, run `npx playwright install chromium`.

| Route view                                                                                                                                                         | Edit and share                                                                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ![Annotated desktop route view showing toolbar controls, section grouping, quantity badges, and tickable items.](docs/screenshots/readme/readme-desktop-route.png) | ![Annotated desktop edit and share view showing store layout selection, pasted list input, save actions, shared link, QR preview, and recent shared lists.](docs/screenshots/readme/readme-desktop-edit-share.png) |

| Mobile edit and share                                                                                                                                                    | Mobile settings                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ![Annotated mobile edit and share view showing the stacked editor, list input, install prompt, and sharing panel.](docs/screenshots/readme/readme-mobile-edit-share.png) | ![Annotated mobile settings view showing localized selectors, detected country, and local preference storage.](docs/screenshots/readme/readme-mobile-settings.png) |

## ✨ What it does

- accepts pasted or typed shopping lists
- groups items into supermarket sections using country configs for Belgium, Canada, France, Germany, Italy, Mexico, the Netherlands, Romania, Spain, the UK, and the US
- understands quantities and measurements like `bananas x2`, `2x apples`, `500g mince`, `½ tsp`, and `8 fl. oz`
- stores liquid and weight quantities in metric form, then displays metric, imperial, or cooking measurements from the route toolbar
- supports size qualifiers like `small milk` and renders them as a badge
- applies display aliases for common milk shorthand like `blue milk`, `gold milk`, `green milk`, and `red milk`
- persists data locally so the app can be reopened without losing state
- supports backend-backed shared list links that anyone with the link can edit
- generates themed QR codes for shared lists and can scan shared-list QR codes when the browser supports camera scanning
- can optionally show grouped, low-noise browser notifications when another device adds items to an open shared list while the app is not focused
- remembers recently opened shared lists locally on the device for quick reopening
- stores each shared list's country profile with that shared-list record, with local fallback
- supports English, Spanish, French, German, Dutch, Italian, Romanian, and Pirate UI text, defaulting from the browser language
- supports light, dark, and system themes, including PWA chrome theme colours
- includes debug self-checks and diagnostics for backend health, heartbeat latency, database type, runtime host, state consistency, quantity parsing, measurement conversion, variants, storage, section matching, and active shop layout
- deploys to GitHub Pages via GitHub Actions

## 🧭 Routes

The app uses normal path-based routing:

- `/edit` - list editor, used when there is no saved list yet or when editing an existing list
- `/route` - shopping list route view
- `/sections` - read-only section and route-order reference
- `/settings` - language, country profile, and theme preferences
- `/about` - app version, install status, and release information
- `/debug` - debug tools, defaulting to parsed item diagnostics
- `/debug/<tab>` - direct debug tabs such as `/debug/backend`, `/debug/host`, and `/debug/settings`
- `/404` - not-found page for unknown routes
- `/500` - server-error page for backend failure states

Backend-backed shared lists use path routes:

- `/<uuidv7>/edit` - shared list editor
- `/<uuidv7>/route` - shared list route view

Legacy `/list/<uuidv7>/...` URLs are still accepted and normalized to the canonical `/<uuidv7>/...` structure. Debug tools are generated and normalized as app-level routes because they inspect the current browser/app runtime rather than a specific shared list. Older list-nested debug URLs such as `/list/<uuidv7>/debug/backend` may still be accepted for compatibility, but the canonical URL is `/debug/backend`.

If a page needs data that is not available yet, it shows a warning and points you to the page that can populate it.

## 🚀 Getting started

```bash
npm install
npm run dev
```

Run Storybook for component and design-system documentation:

```bash
npm run storybook
```

Storybook includes component stories with autodocs plus design-system reference pages for actions, accessibility, colour tokens, empty states, forms, internationalisation, measurements, and typography. The theme button in the Storybook toolbar switches the preview and Storybook chrome between light and dark mode.

## 🗄️ Optional backend mode

The app can run in two modes:

- frontend-only mode uses browser `localStorage` and works as a static site
- backend mode is enabled automatically when `/api/health` responds

When backend mode is available for a shared list, the app loads the browser record and the backend shared-list record, chooses the newest saved record using `updatedAt`, writes that winning record to both places, then keeps saving future edits to both local cache and the backend. The country profile is stored as part of each shared-list record. Language, theme, route density, and measurement display mode remain browser preferences and default from the user's browser environment.

### Running Locally

Start the backend API:

```bash
npm run api
```

Start the frontend in another terminal:

```bash
npm run dev
```

The Vite dev server proxies `/api` to `http://localhost:8787`.

For production backend hosting, build the frontend and run the API server:

```bash
npm run build
npm run api
```

### Local Postgres Setup

Persistent backend storage uses Postgres. Local setup uses Docker Compose, so Docker Desktop must already be installed and running before setup starts.

Once Docker is running, project setup is one command:

```bash
npm run setup
```

That command:

- writes a local `DATABASE_URL` to `.env.local`
- starts Postgres with Docker Compose
- creates the required tables

After setup, run the backend as usual with `npm run api`.

### Setup Troubleshooting

If setup says the Docker daemon is not running, open Docker Desktop, wait until it reports that Docker is running, then run `npm run setup` again.

If setup prints Docker success messages and then fails with `read ECONNRESET`, Postgres started but was not ready for schema setup yet. Run `npm run setup` again; the command is safe to repeat and will reuse the existing container and volume.

### Inspecting The Local Database

To inspect the local database in DBeaver or another Postgres client, use:

```text
Host: 127.0.0.1
Port: 54321
Database: shopping_list
Username: shopping_list
Password: shopping_list
SSL: disabled
```

The local setup creates this app table:

- `shared_lists`

If a database client cannot connect, check Docker is running and the Postgres container is up:

```bash
docker compose ps
```

### Production Database

In production, set the app's environment variables to point at a persistent Postgres database from your hosting provider:

```text
DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
```

Use the real connection string from the database provider. Do not reuse the local Docker username/password in production, and do not commit production credentials to the repository.

If your provider requires TLS and the connection string does not include `sslmode=require`, add:

```text
DATABASE_SSL=true
```

Add these variables wherever your host configures app or service environment variables, then redeploy.

The backend creates/updates its schema on startup.

### Production App Setup

Most Node app hosts need separate build and run commands. Use:

```text
Build command: npm run build
Run command: npm run api
```

Configure the production database before deploying:

1. Create or attach a persistent PostgreSQL database.
2. Add the database connection string as `DATABASE_URL`.
3. Add `DATABASE_SSL=true` if the connection string does not already include `sslmode=require`.
4. Redeploy the app.

Do not use the local Docker database credentials in production. Use the credentials generated by your database provider.

Unknown product reporting is optional. When enabled, items that parse into the `Other` section are reported from the frontend to the backend with only the item text, normalized item text, country profile, and app language. The backend creates a GitHub issue for each report and adds it as a sub-issue under the parent issue titled `Unknown products`.

```text
FOOD_GITHUB_REPO=owner/repo
FOOD_GITHUB_TOKEN=github_pat_...
```

`FOOD_GITHUB_REPO` falls back to `GITHUB_REPOSITORY` when available. The token needs permission to read and write issues for that repository. The older `UNKNOWN_PRODUCTS_GITHUB_*` names are still accepted for compatibility.

Optional overrides:

```text
FOOD_GITHUB_ISSUE=123
FOOD_GITHUB_TITLE=Unknown products
```

`FOOD_GITHUB_ISSUE` is the parent issue number. If it is omitted, the backend finds or creates an open parent issue using `FOOD_GITHUB_TITLE`.

If these variables are not configured, the endpoint is disabled and the app continues normally.

### JSON Fallback

If `DATABASE_URL` is not configured, the backend falls back to the old JSON file store at `data/shopping-list-db.json`. That fallback is useful for quick local experiments, but it is not suitable for production deployments on ephemeral filesystems.

### Backend Routes

Backend utility routes:

- `GET /api/health` - includes backend health and database status
- `GET /api/database/status` - compatibility route for database status only
- `POST /api/unknown-products` - optional GitHub-backed unknown product reporting

The health payload also includes the backend app version. The frontend compares that with its built version during backend checks and shows the update reload overlay before refreshing if a newer backend/app revision is detected. Backend records are validated before they are stored. Shopping-list timestamps must use canonical ISO format, country codes must match the supported country profiles, and persisted section keys must be known route sections.

## 🛠️ Debug tools

Debug tools are hidden from the normal app flow until debug mode is enabled. Tap the About page version seven times to reveal the Debug tools link, then open `/debug` or a direct tab route such as `/debug/backend`.

Debug tabs include:

- `Parsed` - inspect and edit the structured items generated from the current list
- `State` - validate parser, matcher, progress, variants, and list identity state
- `Backend` - inspect backend health, current storage type, database metadata, heartbeat history, and latency trend
- `Database Entry` - inspect the current backend-backed shared-list record as highlighted JSON
- `Events` - manually trigger notification examples, toast variants, install/update overlays, and hidden interaction previews
- `Host` - show the current hostname, host, origin, protocol, and Vite base path so installed PWAs can be checked against the domain they are running from
- `Config`, `Matcher`, `Quantities`, `Measurements`, `Weights`, `Variants`, `Layout`, `Sections`, and `Storage` - self-checks and reference data for parser and route behaviour
- `Settings` - debug-only switches that should stay out of the main user settings area

The Backend tab reports whether the app is currently using `LocalStorage`, backend JSON DB fallback, or PostgreSQL. It only displays non-sensitive database details: adapter type, shared-list count, and timestamps. The heartbeat panel records recent backend status checks, latest latency, and a latency-coloured sparkline using a fixed latency scale, with disconnected/error states shown as failed/offline samples.

Debug Settings currently include:

- force LocalStorage mode
- pause backend heartbeat
- disable automatic backend reconnect
- show PWA install prompts while testing install UI
- disable the PWA splash screen
- disable hidden easter-egg interactions
- enable verbose console diagnostics for route, storage, backend heartbeat, and sharing events

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
- `POST /api/home-assistant/sync` pushes a supplied shopping-list record, or a stored shared list referenced by `listId`, to Home Assistant
- `POST /api/home-assistant/add-item` with `{ "name": "Milk" }`
- `POST /api/home-assistant/remove-item` with `{ "name": "Milk" }`
- `POST /api/home-assistant/complete-item` with `{ "name": "Milk" }`
- `POST /api/home-assistant/incomplete-item` with `{ "name": "Milk" }`
- `POST /api/home-assistant/sort`

## 🔗 Shared lists

Every browser session has an internal UUIDv7-style list id. When the backend is connected, that list id is migrated to the backend and shown in path-based URLs:

```text
/<uuidv7>/edit
```

Anyone with the link can edit the same list. Changes are saved to the shared backend record after each completed app state change and cached locally as an offline backup. If the backend is offline, new offline-only lists keep their UUID hidden from the URL; lists that have already been backend-backed keep the `/<uuidv7>` URL and render from local storage until the backend comes back.

When supported by the browser and backend, open shared lists subscribe to server-sent events for remote changes. SSE updates trigger an immediate backend fetch and a short working indicator while incoming changes are applied. A slower fallback poll remains in place for missed events or browsers without `EventSource`.

The sharing panel also supports:

- copying the shared URL
- showing a themed QR code for the current shared list
- scanning another shared-list QR code into the shared-list input
- collapsing pasted shared URLs down to just the UUIDv7 in the shared-list input
- validating that scanned or pasted list ids exist in the backend
- a device-local history of recently opened shared lists with quick reopen/delete actions
- tapping a recent-history card to reopen that list, with drag protection so scroll gestures do not trigger accidental loads
- opt-in grouped notifications for item additions from another device while the app is running, unfocused, and connected to the shared backend list

Empty lists do not create new shared-list entries. The `New List` action also removes the current shared list instead of leaving behind an empty backend record. If a previously opened shared list is empty, the recent-history panel labels it as `Empty list`.

Shared list API routes:

- `POST /api/shared-lists`
- `GET /api/shared-lists/:id`
- `PUT /api/shared-lists/:id`
- `DELETE /api/shared-lists/:id`
- `GET /api/shared-lists/:id/events` - server-sent events for shared-list updates and deletes

## 📲 PWA install

The app includes a web app manifest, install icons, theme-aware browser favicons, and runtime theme-colour updates. Light, dark, and system theme choices update the browser/PWA chrome where the host OS supports dynamic `theme-color` changes. Some installed app shells cache manifest metadata, so reinstalling the PWA may be needed after manifest colour or icon changes.

An app-level animated splash using `public/logo-animated-once.svg` is available but disabled by default. Enable it at build time with `VITE_ENABLE_PWA_SPLASH=true`. Browser/OS native PWA splash screens are generated from the manifest icons and may remain static before the web app shell starts.

### Install it

On supported browsers you can install the app with the browser's install action:

- desktop Chrome / Edge: use the install icon in the address bar
- Android Chrome: use `Add to Home screen` / `Install app`
- iPhone / iPad Safari: use `Share` -> `Add to Home Screen`

### PWA notes

- the app shell, core icons, and built JS/CSS are cached for offline navigation after the service worker has installed
- online launches and resumes check for updated app assets and backend version changes; when an update reload is needed, a theme-aware translucent overlay with a spinner is shown across the reload
- the app works offline with local storage even without the backend
- backend-backed shared lists still need network access to validate, refresh, or load remote list data
- shared-list notifications are opt-in, only cover item additions while the app/PWA is running, and use service-worker/browser notification delivery with grouped notification tags so later additions update the existing notification silently where the browser supports it
- QR scanning depends on browser camera support and `BarcodeDetector`; if it is unavailable, the scanner action is hidden and you can paste the shared UUID or URL manually
- if you change icons or manifest colours, some installed shells keep stale assets until the app is removed and installed again

## 🧪 Build

```bash
npm run build
npm run preview
```

Run the automated checks:

```bash
npm run lint
npm run typecheck
npm run test:unit
npm run test:storybook
```

`npm run test:storybook` runs the Storybook interaction tests, including role/name checks for component stories and design-system documentation examples.

Run a local Lighthouse audit against the production build:

```bash
npm run lighthouse
```

The audit writes `lighthouse/report.json` and `lighthouse/report.html`, and fails if the main Lighthouse category scores fall below the configured thresholds. You can audit an already deployed URL with `LIGHTHOUSE_URL=https://example.com npm run lighthouse`. On Apple Silicon, run this with an arm64 Node install; x64 Node under Rosetta is blocked by Lighthouse because it makes Chrome performance results unreliable.

## ✅ Release checks

Before tagging a release, run the same local checks used by CI:

```bash
npm run lint
npm run typecheck
npm run test:unit
npm run test:storybook
npm run build
```

For accessibility and PWA confidence, also run:

```bash
npm run lighthouse
```

The app version shown on the About page comes from `package.json`. Use `npm run version:major`, `npm run version:minor`, or `npm run version:patch` when preparing an intentional release bump.

The repo installs `.githooks/pre-commit` through `npm run prepare`. The pre-commit hook runs lint, applies the configured automatic version bump, and stages `package.json` plus `package-lock.json`. Set `VERSION_BUMP=major`, `VERSION_BUMP=minor`, or `VERSION_BUMP=patch` when you need to control the bump for a specific commit.

Pushes to `main` automatically create an annotated git tag and GitHub Release. The release workflow uses `v<package.json version>` as the tag when it is available, and falls back to a SHA-suffixed tag if that version tag already exists so every `main` push still has a release point.

## 🚢 Deployment

The repo includes GitHub Actions workflows that build on push to `main`, publish `dist/` to GitHub Pages, and create a GitHub Release for the pushed commit. The production build copies `dist/index.html` to `dist/404.html` so direct path-based SPA links work when opened or refreshed on GitHub Pages.

## 🧱 Project structure

- `server` Postgres/JSON-backed API and disabled Home Assistant integration stub
- `src/config/countries` country-specific supermarket configs
- `src/lib` parsing, matching, routing helpers, and debug checks
- `src/lib/repository` persistence layer
- `src/components` reusable UI pieces
- `src/pages` top-level views
- `src/stories` design-system Storybook reference pages
- `src/styles` SCSS styling
- `.storybook` Storybook configuration, global theme toggle, i18n provider, and accessibility addon setup
- `.github/workflows` GitHub Pages deployment

## 📄 License

MIT. See [LICENSE](./LICENSE).

## 🔒 Privacy

See [PRIVACY.md](./PRIVACY.md).
