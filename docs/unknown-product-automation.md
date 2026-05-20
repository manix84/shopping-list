# Unknown Product Automation

## Goal

Unknown products should be easier to turn into useful matcher data without manually opening a GitHub issue, deciding the right country config, and editing source code by hand.

The implemented workflow is:

1. A user enters an item that currently lands in `Other`.
2. The backend records the unknown product sighting.
3. A user can also manually suggest a better section for any current list item from Debug tools.
4. The backend creates or updates a pending product suggestion with product identity, section, aliases, country, confidence, and evidence.
5. Approved suggestions are merged into the matcher at runtime, and can later be exported back into source-controlled country config.

This should reduce manual product dictionary work while still protecting the matcher from low-confidence or incorrect automatic additions.

## Non-Goals

- Do not let arbitrary unknown products directly mutate `src/config/countries/*.ts` at runtime.
- Do not accept low-confidence classifications without review.
- Do not collect full shopping lists, user identities, analytics identifiers, or unrelated personal data.
- Do not require GitHub issues for the normal product improvement workflow.

## Current Approach

Use a database-backed product overlay plus an in-app review queue.

The checked-in country configs remain the stable baseline. Approved runtime suggestions are stored in the backend and merged over the static config when parsing and routing items. This makes improvements available without a deploy, while still allowing curated exports back into source code later.

## Data Flow

1. The frontend reports products that parse into the `Other` section.
2. The Debug tools Products tab can submit recategorisation suggestions for any current item.
3. The backend deduplicates reports by normalized product identity and country.
4. The backend creates or updates a suggestion.
5. The Debug tools expose a review panel for pending suggestions.
6. Approved suggestions are stored as active product overrides.
7. The frontend loads active overrides and merges them with the selected country config.
8. The current list is reparsed when config or overrides change, preserving checked state while recalculating sections.

GitHub issue creation remains an optional fallback or audit trail, but it is no longer the primary workflow.

## Suggestion Model

Suggested database shape:

```json
{
  "id": "uuid-v7",
  "status": "pending",
  "product": "canned tuna",
  "aliases": ["tuna", "tin of tuna"],
  "section": "tinned_jarred",
  "countries": ["uk"],
  "confidence": 0.94,
  "source": "unknown-report",
  "evidence": {
    "reportCount": 7,
    "latestRawItems": ["tuna", "canned tuna", "2 tins tuna"],
    "locale": "en"
  },
  "createdAt": "2026-05-20T12:00:00.000Z",
  "updatedAt": "2026-05-20T12:00:00.000Z",
  "reviewedAt": null,
  "reviewedBy": null
}
```

Suggestions are currently stored as `pending`, `approved`, or `rejected` records. Approved records are returned by the product-overrides API as runtime matcher overlays.

Recategorisation suggestions include current and suggested section evidence:

```json
{
  "product": "dettol wipes",
  "section": "household",
  "source": "recategorization",
  "evidence": {
    "currentSection": "baby",
    "suggestedSection": "household",
    "locale": "en"
  }
}
```

## Classification Strategy

The current implementation starts with deterministic local data:

- Unknown `Other` items are converted into pending suggestions.
- Manual recategorisation suggestions use the section selected by the reviewer.
- Approved suggestions become extra product keywords for their target section.

Future classifier work should start with deterministic local matching before using external intelligence.

Recommended classifier order:

1. Normalize the product text using the existing parser cleanup rules.
2. Check for exact matches against existing product names and aliases.
3. Check obvious section keywords from the selected country config.
4. Compare against approved overlays.
5. Use report frequency and repeated country/locale sightings as confidence signals.
6. Optionally call an LLM or food taxonomy service only when local rules cannot classify the item confidently.

The classifier should return a confidence score and evidence. High confidence can pre-fill the review form. Low confidence should stay pending and clearly show why it needs review.

## Review UI

The Debug tools `Products` tab provides the review surface.

Current actions:

- approve suggestion
- reject suggestion
- edit product name
- edit aliases
- edit section
- suggest a better section for a current list item
- view recent raw sightings

Future actions:

- edit applicable countries beyond the current country
- merge duplicate suggestions
- export approved overlays to source-controlled config

## Runtime Overlay

The frontend should fetch approved product overlays from the backend and merge them into the active country config before building product suggestions and parsing list items.

API shape:

```text
GET /api/product-overrides?country=uk
GET /api/unknown-products/suggestions
PATCH /api/unknown-products/suggestions/:id
POST /api/unknown-products/suggestions/:id/approve
POST /api/unknown-products/suggestions/:id/reject
```

The app should continue to work offline with the static configs. If overrides cannot be loaded, parsing falls back to the checked-in dictionary.

## Export Back To Source

Approved overlays should eventually be exportable into source-controlled config.

Options:

- Generate a report that lists approved overlays by country and section.
- Generate a patch or PR that updates `src/config/countries/*.ts`.
- Add a script that writes a generated config file, such as `src/config/generated/productOverrides.ts`.

The safest first implementation is a read-only export or generated PR. Direct source edits should remain a deliberate maintenance action.

## Rollout Status

### Completed

- Unknown product reports create persistent suggestions.
- Suggestions are stored in JSON fallback and Postgres.
- Pending suggestions can be approved or rejected from Debug tools.
- Approved suggestions are served as runtime product overlays.
- Current lists are reparsed after config or overlay changes.
- Manual recategorisation suggestions can be submitted from current list items.
- GitHub issue creation remains optional.

### Remaining

- Cache overlays locally for offline use if needed.
- Add a script or admin action to export approved overlays.
- Optionally generate a GitHub PR with the suggested dictionary updates.
- Add higher-confidence classifier suggestions for unknown items before review.
- Add duplicate merge tooling for near-equivalent suggestions.

## Risks

- Wrong section assignment can make route ordering worse.
- Country-specific supermarket layouts may classify the same product differently.
- Brand names can be mistaken for product identities.
- User-entered text can contain typos, notes, or quantities that should not become aliases.
- Automatically accepted suggestions can pollute the matcher and be hard to unwind.

Mitigations:

- Require review before activation at first.
- Keep confidence and evidence visible.
- Record every approved overlay with timestamps and reviewer metadata.
- Make overlays reversible.
- Add tests for duplicate aliases and section validity.

## Implemented Slice

The first implemented version includes:

1. A `product_suggestions` table or JSON-store equivalent.
2. Unknown product reports converted into pending suggestions.
3. Debug tools review and recategorisation UI.
4. Approved suggestions applied through a runtime overlay API.

That removes the GitHub issue/manual source edit loop while keeping the product dictionary controlled and reversible.
