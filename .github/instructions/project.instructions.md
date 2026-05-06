---
applyTo: "**/*.{ts,tsx,mjs,scss}"
---

# Shopping List Implementation Notes

These path-specific notes supplement `.github/copilot-instructions.md` for code and style files. Keep review comments concrete and tied to the changed lines.

## Frontend

- Use existing patterns in `src/pages`, `src/components`, and `src/lib` before adding new abstractions.
- Keep app state and persistence behaviour compatible with both frontend-only mode and backend mode.
- Do not introduce layout shifts around page titles, route toolbars, save-status indicators, dialogs, or mobile controls.
- Use Material Design Icons from `@mdi/js` where existing icon buttons use them.
- Add stories for new reusable components and meaningful component states.

## Backend

- `server/database.mjs` owns persistence and schema setup.
- `server/index.mjs` owns API routes and static file serving.
- `server/validation.mjs` validates incoming backend records before storage.
- `server/env.mjs` loads `.env` and `.env.local` for backend scripts.
- Postgres must work with `DATABASE_URL` or `SHOPPING_LIST_DATABASE_URL`; JSON file storage remains the no-DB fallback.
- Production database settings belong in environment variables, not source files.

## Repository Data Flow

- Local storage repository: `src/lib/repository/localStorageRepository.ts`
- Backend API repository: `src/lib/repository/apiRepository.ts`
- Record encoding/decoding: `src/lib/repository/recordCodec.ts`
- Record merge behaviour: `src/lib/repository/recordMerge.ts`

When backend mode is available, the newest record by `updatedAt` wins and is written back to both browser storage and backend storage.

## Styling

- Main styles live in `src/styles/main.scss`.
- Shared Sass tokens live in `src/styles/_variables.scss`.
- Do not use undefined Sass variables.
- Prefer existing classes and design tokens over one-off styling.
- Avoid adding class names that are not styled, tested, or used as stable hooks.

## I18n

All user-visible strings need entries in `src/lib/i18n/types.ts` and every file in `src/lib/i18n/messages`.

After i18n changes, run:

```bash
npm run test:unit -- --run src/lib/i18n.test.ts
```

## Local Setup

`npm run setup` requires Docker Desktop to be installed and running. It starts local Postgres, writes `.env.local`, and creates schema. Local defaults are only for development:

```text
localhost:54321
database: shopping_list
username: shopping_list
password: shopping_list
```
