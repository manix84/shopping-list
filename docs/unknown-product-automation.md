# Unknown Product Automation

## Goal

Unknown products should be easier to turn into useful matcher data without manually opening a GitHub issue, deciding the right country config, and editing source code by hand.

The target workflow is:

1. A user enters an item that currently lands in `Other`.
2. The backend records the unknown product sighting.
3. The app suggests the most likely product identity, section, aliases, and country applicability.
4. A reviewer can approve or reject the suggestion inside the app.
5. Approved suggestions are merged into the matcher at runtime, and can later be exported back into source-controlled country config.

This should reduce manual product dictionary work while still protecting the matcher from low-confidence or incorrect automatic additions.

## Non-Goals

- Do not let arbitrary unknown products directly mutate `src/config/countries/*.ts` at runtime.
- Do not accept low-confidence classifications without review.
- Do not collect full shopping lists, user identities, analytics identifiers, or unrelated personal data.
- Do not require GitHub issues for the normal product improvement workflow.

## Recommended Approach

Use a database-backed product overlay plus an in-app review queue.

The checked-in country configs remain the stable baseline. Approved runtime suggestions are stored in the backend and merged over the static config when parsing and routing items. This makes improvements available without a deploy, while still allowing curated exports back into source code later.

## Data Flow

1. The frontend reports products that parse into the `Other` section.
2. The backend deduplicates reports by normalized product identity, country, and locale.
3. The backend runs a classifier to create or update a suggestion.
4. The Debug tools expose a review panel for pending suggestions.
5. Approved suggestions are stored as active product overrides.
6. The frontend loads active overrides and merges them with the selected country config.

GitHub issue creation can remain as an optional fallback or audit trail, but should not be the primary workflow.

## Suggestion Model

Suggested database shape:

```json
{
  "id": "uuid-v7",
  "status": "pending",
  "product": "canned tuna",
  "aliases": ["tuna", "tin of tuna"],
  "section": "canned",
  "countries": ["uk", "us", "ca"],
  "confidence": 0.94,
  "source": "classifier",
  "evidence": {
    "reportCount": 7,
    "latestRawItems": ["tuna", "canned tuna", "2 tins tuna"],
    "matchedExistingSignals": ["canned", "tin"]
  },
  "createdAt": "2026-05-20T12:00:00.000Z",
  "updatedAt": "2026-05-20T12:00:00.000Z",
  "reviewedAt": null,
  "reviewedBy": null
}
```

Approved overlays can be stored separately or represented by `status: "approved"`. Keeping pending and approved records in one table is simpler, but a separate active overlay table can make runtime reads safer and easier to cache.

## Classification Strategy

Start with deterministic local matching before using external intelligence.

Recommended classifier order:

1. Normalize the product text using the existing parser cleanup rules.
2. Check for exact matches against existing product names and aliases.
3. Check obvious section keywords from the selected country config.
4. Compare against approved overlays.
5. Use report frequency and repeated country/locale sightings as confidence signals.
6. Optionally call an LLM or food taxonomy service only when local rules cannot classify the item confidently.

The classifier should return a confidence score and evidence. High confidence can pre-fill the review form. Low confidence should stay pending and clearly show why it needs review.

## Review UI

Add a Debug tools panel for unknown product suggestions.

Expected actions:

- approve suggestion
- reject suggestion
- edit product name
- edit aliases
- edit section
- edit applicable countries
- merge duplicate suggestions
- view recent raw sightings

The review panel should make the common path fast: most suggestions should need a single approve click, but the reviewer must be able to correct section or alias data before approving.

## Runtime Overlay

The frontend should fetch approved product overlays from the backend and merge them into the active country config before building product suggestions and parsing list items.

Recommended API shape:

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

## Rollout Plan

### Phase 1: Store Suggestions

- Keep the current unknown product report endpoint.
- Add persistent suggestion records.
- Deduplicate reports by product, country, and locale.
- Add tests for normalization and deduplication.

### Phase 2: Local Classifier

- Implement deterministic classification from existing country configs.
- Store suggested product, aliases, section, countries, confidence, and evidence.
- Keep GitHub issue creation behind the existing environment variables as an optional fallback.

### Phase 3: Review Queue

- Add a Debug tools tab or panel for pending suggestions.
- Support approve, reject, and edit actions.
- Add API tests around review state transitions.

### Phase 4: Runtime Product Overlay

- Add an approved-overlay API.
- Load overlays in the frontend.
- Merge overlays with country configs before parsing and suggestions.
- Cache overlays locally for offline use if needed.

### Phase 5: Export

- Add a script or admin action to export approved overlays.
- Optionally generate a GitHub PR with the suggested dictionary updates.

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

## First Implementation Slice

The smallest useful version is:

1. Add a `product_suggestions` table or JSON-store equivalent.
2. Convert unknown product reports into pending suggestions.
3. Add a Debug tools review panel.
4. Apply approved suggestions through a runtime overlay API.

That removes the GitHub issue/manual source edit loop while keeping the product dictionary controlled and reversible.
