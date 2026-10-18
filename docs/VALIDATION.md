# Data contracts and validation

The authoritative version-1 contracts are [brand profile](../brand-presentations/references/brand-profile.md) and [deck plan](../brand-presentations/references/deck-plan.md). Unknown extra fields are permitted for host-specific extensions; required fields still apply. Helpers are Python 3.9+ standard-library tools with no network access.

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

Required root files: `SKILL.md` with simple `name`/`description` front matter and a profile reference, plus a structurally valid `brand-profile.json`. Supported subdirectories/extensions:

| Directory | Extensions |
| --- | --- |
| `references/` | `.md`, `.json` |
| `agents/` | `.yaml`, `.yml` |
| `scripts/` | `.py` |
| `assets/` | `.png`, `.jpg`, `.jpeg`, `.webp`, `.svg`, `.gif`, `.ttf`, `.otf`, `.woff`, `.woff2` |

Unexpected files/directories fail rather than silently entering the archive. Hidden files, caches, symlinks, and credential-like filenames fail. Only package folders you have reviewed and control; this is not hardened against concurrent filesystem mutation. The helper does not execute bundled scripts, validate their behavior, audit licenses, or scan arbitrary file contents for secrets.

Output is a ZIP containing the source folder name as its top-level directory. Existing output is never overwritten. Store the output outside the source folder. Check the resulting manifest and asset rights before distribution. Put working deck plans or private source documents outside the distributable skill folder unless intentionally represented in allowed references.

## Automated checks

```sh
python3 -B -m unittest discover -s tests -v
```

Tests cover valid examples, malformed and adversarial fields, path containment, hash/version drift, geometry, count/order, review-state consistency, packager exclusions, local documentation links, and expected native skill structure. They do not execute an AI model or render a deck. Manual model/output evaluation remains separate.
