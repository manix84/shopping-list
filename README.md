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
