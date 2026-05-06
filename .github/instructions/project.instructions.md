---
applyTo: "**"
---

# Shopping List Project Instructions

## Project Shape

This is a React, TypeScript, Vite, Storybook, and Node backend app.

- Frontend entry points live in `src/main.tsx` and `src/App.tsx`.
- Page components live in `src/pages`.
- Reusable UI components live in `src/components`.
- Parser, routing, storage, i18n, preferences, and debug helpers live in `src/lib`.
- Country-specific supermarket layouts live in `src/config/countries`.
- Backend API code lives in `server`.
- Styles are primarily in `src/styles/main.scss`, with CSS custom properties exposed through `src/styles/_variables.scss`.

Prefer existing local patterns over new frameworks or large abstractions. Keep changes scoped to the requested behaviour.

## Commands

Use these checks before proposing or finalising code changes:

```bash
npm run typecheck
npm run lint
npm run test:unit -- --run path/to/relevant.test.ts
npm run build
```

Run Storybook-specific checks when changing stories or visual components:

```bash
npm run test:storybook
```

For local backend development:

```bash
npm run setup
npm run api
npm run dev
```

`npm run setup` requires Docker Desktop to be installed and running. It starts local Postgres, writes `.env.local`, and creates the backend schema.

## Backend And Database

The backend uses Postgres when `DATABASE_URL` or `SHOPPING_LIST_DATABASE_URL` is set. It falls back to the legacy JSON file store at `data/shopping-list-db.json` when no database URL is configured.

Important backend details:

- `server/database.mjs` owns persistence and schema setup.
- `server/index.mjs` owns API routes and static file serving.
- `server/validation.mjs` validates incoming backend records before storage.
- `server/env.mjs` loads `.env` and `.env.local` for backend scripts.
- The backend creates or updates its Postgres schema on startup.
- Do not commit `.env.local` or real production database URLs.
- Production should set `DATABASE_URL` to provider credentials and may set `DATABASE_SSL=true` when TLS is required.

The local Postgres defaults are only for Docker development:

```text
Host: localhost
Port: 54321
Database: shopping_list
Username: shopping_list
Password: shopping_list
```

Never reuse those local credentials in production documentation or examples except where clearly labelled local-only.

## Data Model

Shopping-list records are validated and encoded through the repository layer.

- Frontend local storage code lives in `src/lib/repository/localStorageRepository.ts`.
- Backend API client code lives in `src/lib/repository/apiRepository.ts`.
- Record encoding/decoding lives in `src/lib/repository/recordCodec.ts`.
- Merge behaviour lives in `src/lib/repository/recordMerge.ts`.

Backend mode chooses the newest browser/backend record by `updatedAt`, writes the winner to both places, and then continues saving to both local cache and backend.

## UI And Styling

Follow the existing UI style:

- Use existing button, card, field, settings-select, title, subtitle, and status patterns.
- Use Material Design Icons from `@mdi/js` where existing icon buttons use them.
- Keep controls accessible: use semantic buttons, labels, `role="switch"` for switches, and keyboard handlers where needed.
- Keep text visually stable and avoid layout shifts.
- Avoid adding unused class names.
- Avoid Sass variables that do not exist in `src/styles/_variables.scss`; if a token is needed, add it deliberately.

For hidden interactions, keep them keyboard-accessible and screen-reader meaningful even if they are visually plain.

## Internationalisation

All user-visible strings should be added to the message contract in `src/lib/i18n/types.ts` and every locale file in `src/lib/i18n/messages`.

Currently supported locale files:

- `en.ts`
- `de.ts`
- `es.ts`
- `fr.ts`
- `it.ts`
- `nl.ts`
- `ro.ts`
- `pi.ts`

Run `npm run test:unit -- --run src/lib/i18n.test.ts` after editing i18n messages.

## Country Profiles

Country profiles define store layout order, section keywords, measurement behaviour, and display defaults. Add or change country behaviour in `src/config/countries`, and add focused tests for matching, ordering, and measurement differences.

Use localized country labels from `messages.countryOptions` in UI dropdowns. Sort localized lists using the active app locale, not the browser default.

## Testing Guidance

Add or update tests when changing:

- parser behaviour
- route generation or routing
- storage and record migration
- i18n message shape
- country inference/defaults
- backend API payload contracts
- accessibility-visible controls such as switches, dialogs, or status indicators

Use focused test commands during development. Run broader checks before finalising.

## Storybook Guidance

Add stories for new reusable components and meaningful UI states. Update interaction tests when accessible names, roles, or expected controls change.

Stories should use existing helpers from `src/components/storyFixtures.tsx` where appropriate.

## Git And Merge Safety

Do not revert unrelated changes. If a file is already modified, inspect it before editing and preserve user work. During merge conflict resolution, keep robust behaviour, accessibility fixes, production-safe defaults, and current version metadata unless the conflict clearly indicates otherwise.
