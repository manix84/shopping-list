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

When the optional backend is running, shopping lists, shared lists, and the country profile can be stored in the backend database file so they can survive restarts and support shared links. Language, theme, route density, and measurement display mode remain device/browser preferences.

## Shared links

If you create or open a shared list link, anyone with that link can view and edit that shared list. Treat shared list URLs like a lightweight access key.

The app does not add accounts, passwords, user tracking, or analytics around shared links.

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

If you run the backend, the database is stored in `data/shopping-list-db.json` by default. Whoever runs the backend controls that file and can back it up, delete it, or move it using `SHOPPING_LIST_DB_PATH`.

## Open source

The source code is available so the behaviour can be inspected, changed, self-hosted, or improved. That is part of the privacy model: no mystery box, no hidden business model.

## Changes

If the app changes in a way that affects privacy, this policy should change with it.
