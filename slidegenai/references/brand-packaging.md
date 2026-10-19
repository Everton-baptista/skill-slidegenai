# Build a reusable brand skill

Create `<brand>-presentations/` with a focused `SKILL.md`, `brand-profile.json`, optional `design-system.json`, required references/helpers, and permitted local assets. Link the profile and applicable design system from the manifest. Include copied helper dependencies so another installed skill is not required.

Retain source PPTX/PDF and reference previews only when their inclusion is authorized. Put them under `assets/references/`, and describe their use in `references/retained-sources.json` as `files` entries with `path`, `purpose`, and `distribution_authorized: true`. Profile provenance can mention a source without distributing it. Keep private originals and temporary working decks outside the package.

Copy the profile, design, and deck validators together when including them; deck validation imports profile/design validation. Include only the construction recipes the brand needs. No absolute machine paths, API keys, private customer exports, hidden files, caches, or dependencies folders.

Run the validators, then:

```sh
python3 -B scripts/package_brand.py /path/to/slidegenai --output /path/to/slidegenai.zip
```

The helper validates the profile and optional design system, local Markdown links, declared retained sources, and local Python helper dependencies. It rejects missing assets, unsafe paths, symlinks, unexpected files, and credential-like filenames. `design-tokens.json` is a legitimate reference filename; token names alone are not credentials. The checks are not a complete secret scanner or license audit.

Inspect the archive and install it in a clean host or unpacked workspace to confirm all referenced resources resolve. Package creation does not imply publication approval or visual verification.

For fonts, retain the original files/licenses and a consistent manifest/CSS under `assets/fonts/`; see the [font-pack guide](font-pack.md). The packager verifies that bundle offline before archiving.
