# What's New

Keep this file updated when user-visible features, platform changes, major parser/routing changes, or important debug/ops improvements land. Newest entries go at the top.

## 0.16.x - Current - Backend Visibility, Notifications, and Sauce Routing

- Added optional unknown-product reporting for items that fall into `Other`, including country profile and app language, with server-side GitHub product sub-issues and duplicate `+1` comments when configured.
- Changed backend-backed shared-list URLs to the shorter `/<uuidv7>/edit` and `/<uuidv7>/route` format while keeping legacy `/list/<uuidv7>/...` links supported and normalized.
- Added persistent navigation memory for the last Edit/Route page and the last Debug tab, using the app's consistent `shoppingList:*` localStorage key style.
- Standardized localStorage keys around the `shoppingList:*` namespace and migrated legacy `smart-shopping-list-*` values, including the measurement display mode enum.
- Improved list-loading behavior so the spinner overlay appears for initial list routing and shared-list switches without covering normal background checks.
- Reworked the Debug tab menu into a horizontally scrollable, icon-enhanced tab row that shows icon-only tabs on mobile while preserving accessible tab labels and keyboard navigation.
- Added automatic PWA update checks so online app launches, resumes, and navigations refresh cached static assets, show a theme-aware translucent spinner overlay across update reloads, and move onto the latest built revision.
- Added backend-version update detection from `/api/health`, with automatic refresh deferred until the app is hidden/unfocused and a manual About-page update link when versions differ.
- Added shared-list server-sent events so open backend-backed lists can apply remote changes automatically, with slower polling kept as a fallback.
- Consolidated backend persistence around `shared_lists`, with each shared-list record carrying its own country profile and list metadata.
- Added a Debug database-entry tab for the current backend-backed shared-list JSON and an Events trigger to preview the update reload overlay.
- Added automatic git tags and GitHub Releases for every push to `main`.
- Added a development-only `[Dev]` browser title suffix so local tabs are easier to distinguish from production.
- Replaced the old backend operation table with selected heartbeat details so database health errors, error codes, version, adapter, and latency diagnostics are shown against the selected sample.
- Expanded the Backend debug tab with heartbeat history, status timeline bars, latency, health/database check results, adapter details, and collapsible diagnostic panels.
- Fixed a live-site offline flicker caused by backend save validation rejecting the new `sauces` section.
- Added a dedicated UK `Sauces` cupboard section, including ketchup, mayo, mustard, soya sauce, BBQ sauce, sriracha, dressings, and related condiments.
- Expanded the France, Germany, Italy, Belgium, Spain, Romania, Mexico, and Netherlands item libraries with native-language food, frozen, sauces, pantry, household, baby, and personal-care terms.
- Localized international store section labels so non-UK/US country profiles show their supermarket groups and aisles in the primary local language.
- Added display aliases such as `Ketchup` -> `Tomato Ketchup` and `Real Milk` -> `Whole Milk`.
- Improved notification debugging with structured, localized result details and clearer failure states.
- Localized notification test text and debug event labels across all supported locale bundles.

## 0.15.x - Shared Lists, Debug Tools, Accessibility, and Easter Eggs

- Added backend-backed shared list links with UUID routes, local offline backup, and automatic reconnect behavior.
- Added recent shared-list history, shared link validation, QR code generation, and QR scanning where browser support is available.
- Added opt-in grouped browser notifications for new items added from another device while a shared list is open.
- Added list names, save status indicators, and clearer edit/share workflows.
- Expanded Debug tools with tabs for parsed items, state, backend, config, matcher, quantities, measurements, weights, variants, layout, sections, storage, host, events, and settings.
- Added backend heartbeat diagnostics, database metadata, and debug-only switches for backend reconnect, PWA prompts, splash screen, easter eggs, and verbose diagnostics.
- Added not-found and server-error pages with route handling.
- Improved accessibility across navigation, controls, stories, and route interactions.
- Added hidden interactions including the secret aisle and predator easter egg.

## 0.14.x - Backend Hardening

- Hardened backend status checks, API validation, and local/backend fallback behavior.
- Added stricter server-side validation for shopping-list records, timestamps, country codes, and section keys.
- Improved offline behavior for backend-backed lists so local editing remains available when the server is unreachable.

## 0.12.x - Measurements and Quantity Handling

- Added measurement parsing for weights, liquid quantities, cooking units, fractions, and parenthetical measurement hints.
- Added measurement display modes for metric, imperial, and cooking-friendly views.
- Stored metric values internally while allowing route display to adapt to the selected measurement mode.
- Added self-checks and tests for measurements, count quantities, units, and parser behavior.

## 0.8.x - Versioning, Storybook, and About Page

- Added app version display on the About page.
- Added automatic version bump tooling and pre-commit version handling.
- Added Storybook coverage for components, design-system states, accessibility checks, forms, typography, measurements, and internationalization.
- Added an About page with project context, privacy positioning, source link, sponsor link, and author details.

## Early Milestones - Core App, PWA, Internationalization, and Routing

- Built the core shopping-list parser and supermarket route view.
- Added country-specific store layout profiles and supermarket sections for multiple regions.
- Added item matching, variants, cleaned names, quantities, and section grouping.
- Added local-first storage so lists work without a backend.
- Added installable PWA support with manifest, icons, service worker caching, offline asset support, and theme-aware browser chrome.
- Added light, dark, and system theme preferences.
- Added internationalization, language settings, and localized UI copy for supported languages.
- Added country profile settings and terminology updates around store layout profiles.
- Added SEO and social preview metadata.
- Added linting, typechecking, unit tests, CI/deployment badges, and repository documentation.
