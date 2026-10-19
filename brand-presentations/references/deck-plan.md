# Portable deck plan

Use `deck-plan.json` for file production, longer decks, or batches. It is working state, not a presentation renderer. For an original deck without a brand profile, keep the plan at the deck project root with any relative assets. If linking a brand profile, keep both files in the same root so assets resolve consistently.

## Version 1 fields

- `version`: integer `1`.
- `title`, `language`: nonempty strings.
- Optional `unit`: `px` or `pt`; omission means `px` for backward compatibility. Geometry and font sizes share this unit.
- Optional element `slot_id`: when checking with `--design`, references a slot in the selected design layout with a matching kind.
- `expected_slides`: positive integer, including opening, topic covers, and closing.
- `slide_size`: positive finite `width` and `height`, such as 1280 by 720. Geometry and font sizes share a consistent unit; convert when authoring in points or inches.
- `brand_profile_sha256`: exact SHA-256 of linked profile file bytes, or `null` when no profile is linked (including original unbranded decks). Update only after reviewing identity changes. Whitespace changes also change this hash.
- `slides`: nonempty array in global order.
- `review`: the review record below.

Each slide has unique nonempty `id`, sequential integer `position` starting at 1, nonempty `title` and `layout`, `role`, `status`, and nonempty `elements`. Roles: `cover`, `section`, `content`, `insight`, `data`, `closing`. An opening cover is first; closing is last. Section slides require a nonempty `topic_id`; other slides may use `null`. Layout names are free-form and brand-specific. Statuses: `planned`, `generated`, `verified`.

Each element has a per-slide unique `id`, `kind`, nonnegative finite `x`/`y`, positive finite `width`/`height`, and stays inside the canvas. Kinds: `text`, `image`, `logo`, `shape`, `chart`, `table`.

Text requires nonempty `text` and positive `font_size`. Optional `color` and `background` must be opaque `#RRGGBB` when known. Do not misrepresent a photograph as a solid background to manufacture a contrast pass. Images/logos require an existing relative `asset` path. Native charts use `chart`, not an invented asset filename. When a profile is linked, logo assets must appear in it. An unbranded deck does not require a logo or profile.

Data slides require `data_status`: `sourced` with nonempty `citation`, or `illustrative` with a visible label in the eventual slide. The helper checks field presence, not source accuracy.

## Review record

```json
{"rendered":false,"inspected_slide_ids":[],"issues":[]}
```

After actual inspection, set `rendered` to true and list the inspected slide IDs. Issues contain `slide_id`, `severity` (`blocking` or `warning`), and nonempty `message`. References must point to existing slides. A verified slide must be inspected, rendered, and have no blocking issue. Keep unresolved warnings documented.

For an original deck with no linked brand profile:

```sh
python3 -B scripts/validate_deck.py /path/to/deck-plan.json
```

If using an optional design system in the same project root, add `--design /path/to/design-system.json`. A null profile hash produces an unbound-profile advisory; it is not a requirement to create a profile.

For a linked brand profile:

```sh
python3 -B scripts/validate_deck.py /path/to/deck-plan.json --brand /path/to/brand-profile.json
python3 -B scripts/validate_deck.py /path/to/deck-plan.json --brand /path/to/brand-profile.json --require-reviewed
```

Add `--require-reviewed` for an actually inspected final artifact, with or without `--brand`. Review flags are self-reported; the helper cannot prove that rendering occurred. Solid-color contrast and text-box overlaps produce warnings for manual review. Text can overflow a geometrically valid box, so inspect the export.

## Optional visual kit extensions

The [visual kit contract](visual-kit.md) adds optional template_id, typography/effects, measured composition recipes and visual_id bindings. Version 1 and omitted-unit pixel behavior remain unchanged. Composition may supply the content when elements is empty. Original review declarations never verify a newly rendered output.
