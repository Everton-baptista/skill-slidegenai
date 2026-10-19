# Data contracts and validation

The authoritative version-1 contracts are [brand profile](../brand-presentations/references/brand-profile.md), [design system](../brand-presentations/references/design-system.md), and [deck plan](../brand-presentations/references/deck-plan.md). Unknown extra fields are permitted for host-specific extensions; required fields still apply. Validators, packaging and installation checks are Python 3.9+ standard-library tools that work offline. The optional website collector makes explicit bounded HTTP requests when invoked; it is separate from offline validation.

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

Unexpected files/directories fail rather than silently entering the archive. Hidden files, caches, symlinks, and credential-like filenames fail. Only package folders you have reviewed and control; this is not hardened against concurrent filesystem mutation. The helper does not execute bundled scripts, validate their behavior, resolve asset rights or scan arbitrary file contents for secrets. Bundled font license files are checked against their manifest hashes.

Output is a ZIP containing the source folder name as its top-level directory. Existing output is never overwritten. Store the output outside the source folder. Check the resulting manifest and asset rights before distribution. Put working deck plans or private source documents outside the distributable skill folder unless intentionally represented in allowed references.

## Automated checks

```sh
python3 -B -m unittest discover -s tests -v
```

Tests cover valid examples, malformed and adversarial fields, path containment, hash/version drift, geometry, count/order, review-state consistency, packager exclusions, local documentation links, and expected native skill structure. They also inspect the checked-in PPTX for native text/table/chart/workbook data and exercise a scoped OOXML text edit without changing other parts. These tests do not execute an AI model or renderer. The separately recorded local example rendering/inspection is not certification of other hosts.

## Advisory composition review

`python3 -B brand-presentations/scripts/review_composition.py PATH_TO_PLAN --design PATH_TO_DESIGN` checks optional `visual_intent`/`art_direction` metadata and surfaces repeated declared layouts/images or a uniform declared density for inspection. Omit `--design` when absent. Existing plans without metadata remain supported.

Only malformed supplied metadata causes failure; repetition notices return success. `repeat_intent` documents deliberate recurring evidence/comparison frames. Logo reuse is excluded. These are inexpensive pattern notices, not image analysis, visual-fit validation, taste enforcement, or automatic beauty/AI detection. Never discard valid slides just to silence them.

## Analytical model and catalog

`validate_visuals.py` checks a separate optional version-1 semantic source. It supports fourteen chart model names and six diagram model names; consult [analytical construction](../brand-presentations/references/analytical-construction.md) for contracts and boundaries. Checks cover real x/y pairs, explicit missing values, meaningful bar baselines, share reconciliation, finite numbers, source declarations, decision branches, graph endpoints/cycles, lane ownership, date ranges and matrix indices. It does not render a chart, validate factual truth or guarantee that any host supports all accepted types. Existing profile/deck contracts remain compatible.

`find_templates.py` filters a bundled snapshot of 177 application styles by ID, family, pattern or query. Catalog tests check unique coverage, the complete Markdown index and recorded source counts (174 backend rules, 176 type declarations). The three missing backend rules and one missing type declaration are documented source gaps, not silently synthesized implementations. These checks do not certify 177 native exports.

The [analytical example](../examples/analytical-patterns/README.md) separately demonstrates four native charts with embedded workbooks, five editable diagram structures and one native comparison table. Its fixture checker follows chart relationships, compares caches and referenced workbook cells to the canonical model, verifies table contents and labels, and distinguishes attached connectors from free editable line segments. Regression tests deliberately corrupt cached values, workbook cells and attachments. Final visual inspection remains separate from automated validity.

## Visible-name lookup

`find_templates.py --name` matches normalized canonical IDs, source titles or source-observed preview labels. Punctuation, case and combining accents normalize. `--id` remains exact. Ambiguous names retain all matches; no fuzzy match silently selects a different template. Categories stay categories and may return several entries through `--query`. Tests cover these distinctions and preserve the 177-entry inventory.

## Whole-catalog construction coverage

`plan_template.py --coverage` resolves all 177 catalog entries through the same construction contract, across nine families including custom. Tests cover adaptation and faithful modes, source-gap preservation, non-demo lookup, unknown IDs/families and isolation of mutable resources. This establishes planning coverage, not visual evaluation of all 177 styles. See the [visual review](REPERTOIRE_REVIEW.md) for the rendered subset.

Educational entries use the neutral public IDs `aula`, `aula-moderno` and `aula-institucional`; source-snapshot hashes preserve provenance.

## Offline fonts

The bundle contains 46 families / 140 original TTFs, totaling 54,064,816 bytes: 24 application families, six pairing/open-alternative complements and 16 expressive families. The pinned upstream sources, exact hashes and original OFL licenses remain in the font manifest. Git attributes preserve original font/license bytes, including line endings.

`validate_fonts.py` checks paths, hashes, sizes, signatures, licenses, coverage and local CSS offline. `install_fonts.py` tests cover dry-run copying, idempotence and collision preflight. The expressive-choice regression verifies bundled companions, actual style/weight availability, variable-axis ranges and recorded Portuguese sample coverage.

Preparation with fontTools 4.67.0 parsed all 140 TTFs and checked a Portuguese accented-text/numeral sample. The Codex in-app browser loaded all 46 regular family specimens and all 16 expressive cover samples, including the supplied Instrument Serif italic. All cover samples and the overview were visually inspected; title bounds stayed inside artboards above captions at the tested desktop width. Family search was exercised. This does not certify all-language support, every weight, native application registration, font embedding or variable-axis export.

## Installation and portability

From the repository root:

```sh
python3 -B brand-presentations/scripts/check_installation.py
```

The checker validates the copied skill's licenses, local Markdown resources, Python syntax, all catalog entries and font coverage/integrity. Independent-installation tests run it from a copy containing only the installable folder. A clean Git archive was also checked. The command does not register fonts, contact a provider or render slides. See [troubleshooting](TROUBLESHOOTING.md) for recovery steps.

Inventory comparisons and ZIP members use portable forward-slash paths; root `LICENSE` and `NOTICE.md` files are retained when supplied to brand packaging. CI runs Python 3.9 and 3.13 on Linux and Windows with matrix fail-fast disabled, then reproduces both optional examples using isolated npm installs and native-object checks. The analytical adapter's free line segments remain distinct from the checked-in deck's attached connectors.

The suite covers both brand-specific and generic packaging; run it for the current count. Automated validity, host behavior and visual quality are separate checks. Follow the [manual evaluation guide](EVALUATION.md) before relying on another provider or native editor.

## Website acquisition helper

`collect_website_assets.py` inventories image candidates from one HTML page, embedded image data and a bounded set of direct stylesheets, and optionally saves original bytes to a new working directory. It checks response limits, image signatures, exact allowed hosts and redirects, preserves source hashes and reports acquisition separately from visual inspection/editor import. It does not sanitize SVG or certify a slide editor. Ten offline fixtures cover source/base/srcset/CSS resolution, embedded SVG, deduplication, byte signatures, failures, limits, explicit external hosts, non-overwrite and unsafe URL forms. These tests inject HTTP responses; CI does not contact external websites.

A local acquisition check on 2026-10-18 used the EXM Partners public homepage: 64 candidates were inventoried and seven selected originals saved, including two embedded SVG logo variants and banner imagery. SVG roots/signatures were checked and two downloaded photographs visually inspected. The original files and raw page remain outside the distribution. This confirms public HTTP acquisition in this local environment, not Claude editor import, complete visual identity extraction or slide rendering. The banner itself includes an anniversary mark, so it must not silently become evidence of the company's current age.

## Generic installable ZIP

`python3 -B brand-presentations/scripts/package_skill.py --output dist/brand-presentations.zip` validates the entire generic skill, including VERSION, local links, Python syntax, catalog/font coverage, font bytes and original license hashes. It accepts only documented skill resource directories/file types and rejects symlinks, hidden entries, credential-like names, unexpected files, output inside the installable folder and existing output. It excludes Python bytecode caches and .DS_Store rather than including local residue. It never downloads or executes bundled helpers. Design-token names remain valid. Review trusted sources before packaging; this is not a secret-content scanner or concurrent-mutation sandbox.

The ZIP has exactly one top folder, brand-presentations; repository examples, tests, private work and app code are excluded. Tests extract the resulting archive into an independent directory and execute the installed resource checker there. Byte-for-byte resource comparison verifies retention of fonts/licenses and references. Installation checks and packaging do not prove Claude activation or visual quality; see the separate [Claude protocol](CLAUDE_VALIDATION.md).

### Claude.ai size-limited profile

The full 140-font ZIP was actually submitted and rejected by Claude.ai at an observed 30 MB uncompressed limit. `package_skill.py --profile claude-ai --output dist/brand-presentations-claude-ai.zip` retains all 46 families and original licenses with 53 original normal/display/expressive faces. It preserves original binary hashes, normalizes font filenames for upload, rewrites the font manifest and local CSS to the retained inventory, and records omitted paths and the complete source-manifest hash in DISTRIBUTION.json. It refuses a profile exceeding 29,000,000 uncompressed bytes. Full source files remain unchanged. Profile tests independently extract/run the installed checker, compare retained originals and licenses byte-for-byte and check the archive size and complete source inventory. Reduced face coverage is an explicit distribution constraint, not a visual rendering certification.

Actual Claude.ai installation and two inspected initial artifacts are recorded separately in [Claude validation](CLAUDE_VALIDATION.md). The 1.1.2 run exposed flattened font-staging basename collisions; 1.1.3 prefixes filenames by family and regression-tests installing all retained faces together. The suite currently has 157 tests. Claude usage quota and unauthenticated Claude Code prevent full two-host acceptance; no success is inferred for their blocked cases.
