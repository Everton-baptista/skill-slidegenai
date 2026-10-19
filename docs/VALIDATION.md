# Data contracts and validation

The authoritative version-1 contracts are [brand profile](../brand-presentations/references/brand-profile.md) [design system](../brand-presentations/references/design-system.md), and [deck plan](../brand-presentations/references/deck-plan.md). Unknown extra fields are permitted for host-specific extensions; required fields still apply. Helpers are Python 3.9+ standard-library tools with no network access.

## Profile validator

Checks root type/version, required arrays, source IDs/kinds/locations, evidence statuses/references/details, palette syntax, font/fallback types, local logo files, imagery, and gaps. Warns on missing identity categories, unknown fonts, and external SVG resources. Rejects some obvious active SVG patterns; it is not a complete SVG parser or sanitizer. Inspect untrusted assets before opening them in a rendering engine.

## Deck validator

Checks total count, sequential positions, unique IDs, role placement, section IDs, finite geometry, canvas bounds, text fields/font sizes, local image/logo assets, factual citation fields, brand hash when `--brand` is supplied, and review references. An explicitly supplied brand must validate and share the plan's parent directory.

Warns on unbound profile hashes, unknown contrast, solid-color contrast below 4.5:1, text-box overlap, and illustrative data. These warnings require judgment: large text may have different contrast needs, and intentional overlap can be valid. The helper cannot inspect an actual font, image, gradient, alpha value, or final slide.

`--require-reviewed` requires all slides to be marked verified, rendered, inspected, and free of recorded blockers. These are self-reported claims. The script cannot know whether a human/agent actually inspected an export. Use it to detect inconsistent review records, never as proof of visual quality.

Generate a profile hash locally with:

```sh
python3 -c "import hashlib,pathlib; print(hashlib.sha256(pathlib.Path('examples/demo-brand/brand-profile.json').read_bytes()).hexdigest())"
```

## Brand packager

An optional root `design-system.json` adds measured canvas/unit, semantic tokens, typography, logo rules, layout slots, and evidence. Validate it with `validate_design.py FILE --brand PROFILE`; use `validate_deck.py ... --design FILE` to check layout/slot and canvas compatibility. Old inputs without a design system remain valid; omitted plan units mean pixels.

Required root files: `SKILL.md` with simple `name`/`description` front matter and a profile reference, plus a structurally valid `brand-profile.json`. Supported subdirectories/extensions:

| Directory | Extensions |
| --- | --- |
| `references/` | `.md`, `.json` |
| `agents/` | `.yaml`, `.yml` |
| `scripts/` | `.py`, `.js`, `.mjs` |
| `assets/` | `.png`, `.jpg`, `.jpeg`, `.webp`, `.svg`, `.gif`, `.ttf`, `.otf`, `.woff`, `.woff2`, `.pdf`, `.pptx`, `.html`, `.css` |

Authorized retained PPTX/PDF sources and all files under `assets/references/` need entries in `references/retained-sources.json` with `path`, `purpose`, and `distribution_authorized: true`. Missing files, broken/escaping local Markdown links, missing bundled validator imports, and invalid design systems fail. Legitimate names such as `design-tokens.json` are allowed.

Unexpected files/directories fail rather than silently entering the archive. Hidden files, caches, symlinks, and credential-like filenames fail. Only package folders you have reviewed and control; this is not hardened against concurrent filesystem mutation. The helper does not execute bundled scripts, validate their behavior, audit licenses, or scan arbitrary file contents for secrets.

Output is a ZIP containing the source folder name as its top-level directory. Existing output is never overwritten. Store the output outside the source folder. Check the resulting manifest and asset rights before distribution. Put working deck plans or private source documents outside the distributable skill folder unless intentionally represented in allowed references.

## Automated checks

```sh
python3 -B -m unittest discover -s tests -v
```

Tests cover valid examples, malformed and adversarial fields, path containment, hash/version drift, geometry, count/order, review-state consistency, packager exclusions, local documentation links, and expected native skill structure. They also inspect the checked-in PPTX for native text/table/chart/workbook data and exercise a scoped OOXML text edit without changing other parts. These tests do not execute an AI model or renderer. The separately recorded local example rendering/inspection is not certification of other hosts.

## Advisory composition review

`python3 brand-presentations/scripts/review_composition.py PATH_TO_PLAN --design PATH_TO_DESIGN` checks optional `visual_intent`/`art_direction` metadata and surfaces repeated declared layouts/images or a uniform declared density for inspection. Omit `--design` when absent. Existing plans without metadata remain supported.

Only malformed supplied metadata causes failure; repetition notices return success. `repeat_intent` documents deliberate recurring evidence/comparison frames. Logo reuse is excluded. These are inexpensive pattern notices, not image analysis, visual-fit validation, taste enforcement, or automatic beauty/AI detection. Never discard valid slides just to silence them.

## Analytical model and catalog

`validate_visuals.py` checks a separate optional version-1 semantic source. It supports fourteen chart model names and six diagram model names; consult [analytical construction](../brand-presentations/references/analytical-construction.md) for contracts and boundaries. Checks cover real x/y pairs, explicit missing values, meaningful bar baselines, share reconciliation, finite numbers, source declarations, decision branches, graph endpoints/cycles, lane ownership, date ranges and matrix indices. It does not render a chart, validate factual truth or guarantee that any host supports all accepted types. Existing profile/deck contracts remain compatible.

`find_templates.py` filters a bundled snapshot of 177 application styles by ID, family, pattern or query. Catalog tests check unique coverage, the complete Markdown index and recorded source counts (174 backend rules, 176 type declarations). The three missing backend rules and one missing type declaration are documented source gaps, not silently synthesized implementations. These checks do not certify 177 native exports.

The [analytical example](../examples/analytical-patterns/README.md) separately demonstrates four native charts with embedded workbooks, five editable diagram structures and one native comparison table. Its fixture checker follows chart relationships, compares caches and referenced workbook cells to the canonical model, verifies table contents and labels, and distinguishes attached connectors from free editable line segments. Regression tests deliberately corrupt cached values, workbook cells and attachments. Final visual inspection remains separate from automated validity.

## Visible-name lookup

`find_templates.py --name` matches normalized canonical IDs, source titles or source-observed preview labels. Punctuation, case and combining accents normalize. `--id` remains exact. Ambiguous names retain all matches; no fuzzy match silently selects a different template. Categories stay categories and may return several entries through `--query`. Tests cover these distinctions and preserve the 177-entry inventory.

## Composition and typography study

The [repertoire review](REPERTOIRE_REVIEW.md) records the first eight-deck critique and the completed nine-direction, 54-slide local follow-up. The follow-up included final slide/overview inspection, native chart/source checks, table values, attached connector endpoints, font-role refinement and a native outlined text example. This is host-specific qualitative evidence, separate from the 117 helper tests. Optional Google Fonts pairing suggestions were not installed or tested across providers; Mac font binaries are not distributed.

## Whole-catalog construction coverage

`plan_template.py --coverage` resolves all 177 catalog entries through the same construction contract, across nine families including custom. Automated tests cover each entry in adaptation and faithful modes, source-gap preservation, non-demo lookup, unknown IDs/families and isolation of mutable resources. The eight new planner tests bring the helper suite to 125 tests. This establishes deterministic planning coverage, not visual evaluation of all 177 styles. The nine rendered studies remain the recorded visual subset.

## Offline font pack and neutral educational names

The repository now includes 30 openly licensed families / 120 original TTF files, covering all 24 families explicitly loaded by the application and six complements. `validate_fonts.py` checks local paths, hashes, sizes, binary signatures, original OFL files, coverage and offline CSS. Preparation with fontTools 4.67.0 parsed every TTF and checked a Portuguese accented-text/numeral cmap sample. This does not certify all-language coverage or native slide-tool registration/embedding. Nine regression tests cover font integrity, missing/altered licenses, unsafe paths, CSS, dry-run/idempotent staging, collision preflight, licensed ZIP retention and neutral educational entry lookup. The suite now has 134 tests.

Educational entries use the public IDs `aula`, `aula-moderno` and `aula-institucional`. The catalog descriptions and public documentation use neutral names; source-snapshot hashes remain provenance records. Current-tree renaming does not rewrite previously published Git history.

The included local HTML specimen loaded all 30 family samples successfully in the Codex in-app browser using the bundled CSS/TTFs on 2026-10-18. This confirms that browser path for the specimen, not native desktop registration or every weight in every exporter.

A clean Git archive of the final font bundle passed the offline font verifier and all 134 tests. Git attributes preserve the exact upstream font/license bytes, including original line endings, so integrity checks survive a fresh checkout/download.

## Installation audit

See the [gap review](GAP_REVIEW.md) for the confirmed Windows CI failures, targeted repairs, first-use resource checker, independent installed-copy tests, MIT adoption and broader example reproduction. The current suite has 137 tests; earlier counts in study records describe their historical snapshots.

## Expressive type extension — 2026-10-18

The current pack adds 16 display families / 20 original TTF files: 46 families, 140 TTFs, 54,064,816 bytes in total. The original 24 application families and six complements remain unchanged. New families use the same pinned Google Fonts snapshot and preserve their original OFL files and upstream binaries. fontTools 4.67.0 parsed all 140 files and confirmed the recorded Portuguese accented-text/numeral sample; hashes, sizes, signatures, local CSS and licenses passed the offline verifier.

The local Codex in-app browser loaded all 46 regular family specimens and all 16 expressive title samples, including the supplied Instrument Serif italic. Every cover-scale title and the overview were visually inspected. DOM bounds at the tested desktop width placed all 16 titles inside their artboard and above the caption. A CSS containment repair keeps decorative geometry inside its artboard. The family search was checked against a visible result. These are HTML/CSS compositions with live text, not PPTX masters or evidence of native variable-font export/embedding.

The additional regression check verifies that each expressive choice has a bundled body companion and a supplied style/weight, and that declared sample-axis settings lie within the actual file's axes. Historical font counts and browser checks above describe their earlier snapshots. The current suite has 138 tests.
