# Copilot Review Instructions

Use these instructions for all reviews in this repository. Focus on bugs, regressions, missing tests, accessibility issues, persistence risks, and production safety. Avoid broad style feedback unless it affects maintainability or user behaviour.

This is a React, TypeScript, Vite, Storybook, Sass, and Node backend app for a local-first shopping list with optional backend-backed sharing.

## Review Priorities

- Preserve local-first behaviour. Browser storage must continue to work without the backend.
- Preserve backend mode. When `/api/health` is available, browser and backend records are merged by `updatedAt`, the newest record wins, and future edits are saved to both local cache and backend.
- Treat shared-list URLs and QR codes as editable links. Avoid changes that expose secrets, break UUID routes, or make QR scanning/revealing less accessible.
- Do not approve code that commits `.env.local`, production database URLs, secrets, or real credentials.
- Postgres is used when `DATABASE_URL` or `SHOPPING_LIST_DATABASE_URL` is set. JSON file storage is the fallback when no DB URL exists.
- Local Docker Postgres credentials are local-only examples, not production credentials.

## UI And Accessibility

- Prefer existing UI patterns for buttons, cards, fields, settings selects, status indicators, dialogs, and title rows.
- Interactive controls should be semantic where possible: use buttons for actions, labels for inputs, `role="switch"` for switch-style controls, and Escape handling for dialogs.
- Hidden or easter-egg interactions still need keyboard and assistive-tech support if they are exposed through UI text or controls.
- Avoid layout shifts in headers, save-status indicators, toolbars, and compact mobile views.
- Avoid unused class names and undefined Sass variables. Add new tokens deliberately in `src/styles/_variables.scss` when needed.

## Internationalisation

All user-visible strings must be represented in `src/lib/i18n/types.ts` and every locale file in `src/lib/i18n/messages`.

Supported locales: English, German, Spanish, French, Italian, Dutch, Romanian, and Pirate.

When reviewing i18n changes, check that message keys are complete across locales and that localized country labels come from `messages.countryOptions`.

## Country Profiles

Country profiles control store order, section keywords, measurement behaviour, and defaults. Changes under `src/config/countries` should include focused tests. Sort localized country dropdown options using the active app locale, not the browser default.

## Testing Expectations

Expect focused tests for changes to:

- parser behaviour and quantity extraction
- route generation or section ordering
- storage, migrations, record codec, and merge logic
- backend API payload validation
- i18n message shape
- country detection/default profile behaviour
- accessibility-visible controls such as dialogs, switches, scanner/QR UI, and save-status indicators

Useful checks:

```bash
npm run typecheck
npm run lint
npm run test:unit -- --run path/to/relevant.test.ts
npm run build
```

Run Storybook checks when stories or UI component states change:

```bash
npm run test:storybook
```

## Merge Safety

Do not suggest reverting unrelated changes. During conflict resolution, prefer robust behaviour, accessibility fixes, production-safe defaults, and current version metadata unless the conflict clearly indicates otherwise.
