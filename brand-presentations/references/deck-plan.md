# Portable deck plan

Use `deck-plan.json` for file production, longer decks, or batches. It is working state, not a presentation renderer. Keep it beside `brand-profile.json` so assets resolve from one root.

## Version 1 fields

- `version`: integer `1`.
- `title`, `language`: nonempty strings.
- `expected_slides`: positive integer, including opening, topic covers, and closing.
- `slide_size`: positive finite `width` and `height`, such as 1280 by 720. Geometry and font sizes share a consistent unit; convert when authoring in points or inches.
- `brand_profile_sha256`: exact SHA-256 of profile file bytes, or `null` while unbound. Update only after reviewing identity changes. Whitespace changes also change this hash.
- `slides`: nonempty array in global order.
- `review`: the review record below.

Each slide has unique nonempty `id`, sequential integer `position` starting at 1, nonempty `title` and `layout`, `role`, `status`, and nonempty `elements`. Roles: `cover`, `section`, `content`, `insight`, `data`, `closing`. An opening cover is first; closing is last. Section slides require a nonempty `topic_id`; other slides may use `null`. Layout names are free-form and brand-specific. Statuses: `planned`, `generated`, `verified`.

Each element has a per-slide unique `id`, `kind`, nonnegative finite `x`/`y`, positive finite `width`/`height`, and stays inside the canvas. Kinds: `text`, `image`, `logo`, `shape`, `chart`, `table`.

Text requires nonempty `text` and positive `font_size`. Optional `color` and `background` must be opaque `#RRGGBB` when known. Do not misrepresent a photograph as a solid background to manufacture a contrast pass. Images/logos require an existing relative `asset` path. Native charts use `chart`, not an invented asset filename. Logo assets must appear in the linked profile.

Data slides require `data_status`: `sourced` with nonempty `citation`, or `illustrative` with a visible label in the eventual slide. The helper checks field presence, not source accuracy.

## Review record

```json
{"rendered":false,"inspected_slide_ids":[],"issues":[]}
```

After actual inspection, set `rendered` to true and list the inspected slide IDs. Issues contain `slide_id`, `severity` (`blocking` or `warning`), and nonempty `message`. References must point to existing slides. A verified slide must be inspected, rendered, and have no blocking issue. Keep unresolved warnings documented.

```sh
python3 scripts/validate_deck.py /path/to/deck-plan.json --brand /path/to/brand-profile.json
python3 scripts/validate_deck.py /path/to/deck-plan.json --brand /path/to/brand-profile.json --require-reviewed
```

Use the second command for an actually inspected final artifact. Review flags are self-reported; the helper cannot prove that rendering occurred. Solid-color contrast and text-box overlaps produce warnings for manual review. Text can overflow a geometrically valid box, so inspect the export.
