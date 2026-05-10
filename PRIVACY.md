# Privacy Policy

Smart Shopping List is built around a simple idea: useful software can be free, private, ad-free, and open source without making things weird.

This app does not exist to profile you, sell you things, or turn your shopping habits into someone else's spreadsheet. It stores only what it needs to store so the features you choose to use can work.

## What the app stores

The app may store:

- your shopping list text and parsed list items
- checked/unchecked item state
- the country profile used for store routing
- a shared-list identifier when sharing is enabled
- a local history of recently opened shared lists so they can be reopened quickly
- local display preferences such as language, theme, route density, and measurement display mode

In frontend-only mode, this is stored in your browser's local storage on your device.

When the optional backend is running, backend-backed shared lists can be stored in the backend database so they can survive restarts, support shared links, and sync changes between active clients. The country profile is stored as part of each shared-list record. Language, theme, route density, and measurement display mode remain device/browser preferences.

## Shared links

If you create or open a shared list link, anyone with that link can view and edit that shared list. Treat shared list URLs like a lightweight access key.

The app does not add accounts, passwords, user tracking, or analytics around shared links.

Open shared lists may keep a live backend connection for server-sent update events so changes from another device can appear automatically. Those events are scoped to the shared list id in the URL.

## Unknown product reports

Unknown product reporting is optional and disabled unless the backend operator configures GitHub issue reporting. When it is enabled, the app may report items that were filed under `Other` so the product matcher can be improved.

Reports include only the product information needed for that matcher work:

- the item text entered in the shopping list
- normalized and cleaned parser text for that item
- the selected country/store profile
- the app language
- a report timestamp created by the backend/GitHub issue

Reports do not include the full shopping list, checked state, shared-list URL, user accounts, payment details, analytics identifiers, or advertising identifiers. The browser also keeps a small local `shoppingList:reportedUnknownProducts` record so it does not repeatedly report the same unknown product from the same country/language combination.

When configured, reports are stored in the GitHub repository chosen by the backend operator as issues and sub-issues. Duplicate product sightings are added as `+1` comments to the existing product issue instead of creating duplicate issues.

## Home Assistant

Home Assistant integration is currently disabled by default. The code is still present for future work, but the live app should not send shopping list actions to Home Assistant unless a backend operator explicitly enables the experimental integration.

If that experimental integration is enabled, the app can send shopping list actions to the configured Home Assistant instance. That only happens when the backend is configured with your Home Assistant URL and token.

Those credentials are read by the backend from environment variables. They are not part of the frontend app.

## What the app does not do

Smart Shopping List does not:

- show ads
- use analytics trackers
- sell or share your data
- build user profiles
- require an account
- collect payment details

## Data control

You can clear local browser data using the app's reset flow or your browser's site data controls.

If you run the backend with `DATABASE_URL` configured, the database is stored in that PostgreSQL database. Whoever runs the backend controls that database and can back it up, delete it, or rotate credentials using their hosting provider’s tools.

If `DATABASE_URL` is not configured, the backend falls back to `data/shopping-list-db.json`. That file fallback is intended for quick local experiments and should not be treated as durable production storage.

If unknown product reporting is enabled, those reports are stored in the configured GitHub repository. Whoever runs that repository controls the resulting issues, comments, and retention.

## Open source

The source code is available so the behaviour can be inspected, changed, self-hosted, or improved. That is part of the privacy model: no mystery box, no hidden business model.

## Changes

If the app changes in a way that affects privacy, this policy should change with it.
