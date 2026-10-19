# Brand profile contract

Store `brand-profile.json` at the brand package root. Use UTF-8 JSON and relative asset paths. This profile records identity evidence, not slide content. Version 1 requires these fields:

| Field | Meaning |
| --- | --- |
| `version` | Integer `1` |
| `brand_name` | Nonempty reference name; no implied official affiliation |
| `sources` | Nonempty array of objects with unique `id`, nonempty `location`, and `kind` |
| `palette` | Array of `role`, six-digit `hex`, and `evidence` |
| `typography` | Array of `role`, `family` (nonempty string or `null`), nonempty string-array `fallback`, and `evidence` |
| `logos` | Array of relative existing `path`, nonempty `variant`, nonempty string-array `backgrounds`, and `evidence` |
| `imagery` | Nonempty `direction`, `evidence`, optional string-array `avoid` |
| `rules` | Array of nonempty `rule` and `evidence` |
| `gaps` | Array of concrete nonempty limitations; may be empty |

Source kinds: `website`, `brand-guide`, `presentation`, `pdf`, `image`, `local-file`. Locations may be URLs or descriptive relative source names. Do not copy restricted source documents into a public package merely because their names appear here.

Each evidence object requires:

```json
{"status":"observed","source_id":"home","detail":"Computed heading color in the homepage hero."}
```

Allowed statuses are `observed`, `inferred`, and `user-approved`. The first two require a matching source ID. `user-approved` may use `null`, but only for an explicit user instruction, not merely permission to create a deck.

Unknown font families should be `null` with usable fallbacks and a gap. Do not invent extra palette roles or logo variants. Empty palettes, fonts, or logos are structurally allowed with warnings, because incomplete references are real; record what is missing before delivery.

Logo paths must remain inside the package, including after resolving symlinks. Packaging rejects symlinks altogether. Preserve original files and provenance. The helper flags SVG external dependencies; it does not certify SVG safety, asset rights, or authenticity. Inspect untrusted SVGs before using them in an authoring tool.

The repository's `examples/demo-brand/` contains a clearly fictional profile. Never use its colors or rules as a fallback identity for a real brand.

```sh
python3 -B scripts/validate_brand.py /path/to/brand-profile.json
```

Validation checks types, evidence references, colors, and local logo files. It cannot identify brands, confirm licenses, load fonts, or judge visual fidelity.
