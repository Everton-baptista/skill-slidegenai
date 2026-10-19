# Installation and reproduction troubleshooting

## Start with the actual installed directory

From the copied skill folder, run:

```sh
python3 -B scripts/check_installation.py
```

On Windows, use `py -3 -B`. The check uses local files and the standard library; it does not require a provider key. Missing local links usually mean only `SKILL.md` was copied. Install the full `brand-presentations/` folder, including `references/`, `scripts/`, `assets/`, `LICENSE` and `NOTICE.md`. A repository clone alone does not activate a skill in a host.

For an update, back up or rename the old installed directory, then copy the complete current skill. Do not merge different snapshots indiscriminately: the font manifest and helpers need their matching resources. Re-run the check against the new installed directory, and refresh/restart host discovery if needed. These are manual update steps, not an automatic installation performed by the skill.

## The assistant says the skill requires a visual reference

Update the complete installed folder and start a fresh session to avoid stale instructions. The current skill creates complete presentations from a topic, outline or data without a visual reference. Invoke it explicitly and ask for original art direction. Its name remains `brand-presentations` for compatibility. Using a host's slide editor is part of the workflow; Python helpers are optional and do not render arbitrary decks.

If the assistant can create slide files, it should apply the creation, composition and review workflow to that artifact. If the host only returns text, the actual limit is file authoring, not absence of brand material. See the [creation guide](../brand-presentations/references/create-presentation.md).

## Website reading returns text or the editor requires image files

A page reader may discard styling and images even when another tool can access the original page/assets. Follow [website assets](../brand-presentations/references/website-assets.md): inspect available browser/raw-HTTP/download capabilities, acquire selected public image bytes and use the editor's documented import/upload path. A local file in a shell environment may need a separate transfer to the slide editor.

Do not claim exact fonts or official identity from plain text alone. With permission for adaptation, continue an explicitly authored visual direction while using observable content. Ask for uploads only when the necessary evidence or transfer capability is actually missing; do not repeatedly offer a menu instead of completing the independent deck work. Strict reproduction may require a specific missing reference.

## A font is included but not appearing

Bundled files do not imply registration in the OS, authoring library or slide application. For HTML, link the included local CSS and wait for fonts to load before measuring. For native tools, register/install the selected faces as described in the [font-pack guide](../brand-presentations/references/font-pack.md). Test a real title, accents and numerals in the actual tool.

If a tool cannot use variable fonts, choose an appropriate bundled static face or a supported licensed alternative, record the substitution and reflow. Do not mark embedding as successful merely because the font rendered locally. The recorded browser checks do not certify every native exporter.

## The font integrity check fails

Use a fresh clone or re-download the complete skill. The font manifest pins exact upstream bytes. Keep `.gitattributes` when working from Git; it preserves original font/license line endings. Do not repair an integrity mismatch by changing the expected hashes without reviewing the actual source files.

Paths stored in manifests and archives use forward slashes on every OS. A local Windows path shown in an error may naturally use backslashes; that is different from the portable stored path format.

## Packaging rejects a folder

`package_brand.py` packages a generated brand-specific skill containing `SKILL.md` and `brand-profile.json`; it does not package the generic repository. Run the appropriate validators first. Use `python3 -B` to avoid creating `__pycache__` folders inside a distributable skill; keep work files and caches outside it. The strict packager intentionally rejects unexpected files and symlinks.

The archive output must be outside the source directory, its parent must already exist, and the output filename must be new. Authorized retained PPTX/PDF references need explicit entries in `references/retained-sources.json`. Included font packs require their matching local manifest, CSS, binaries and original licenses. A root `LICENSE` or `NOTICE.md` is retained in the ZIP when supplied; generated brand assets may have their own terms.

## The example adapter cannot build

Run `npm ci --ignore-scripts` in the particular example directory before requesting its optional PPTX adapter. That initial dependency installation needs network or a populated npm cache. Use the documented Node version and a new output directory. Both public examples have pinned dependencies; no provider API key is required.

The portable eight-slide example can also generate HTML without npm dependencies. Its adapter and the analytical adapter are bounded fixtures, not a renderer for arbitrary 177-template plans. Start an actual presentation through the skill in a host with the required authoring/rendering tools.

## The preview looks right but the export does not

Inspect the exported format itself for substituted fonts, clipped text, changed gradients, missing images or flattened evidence objects. Repair the source presentation and render/export again. Preserve accepted slides when making a focused repair. A metadata validator or source PNG cannot certify the exported PPTX/PDF.

The repository records the actual evaluated tools and artifacts. Another host, provider or native editor needs its own check; describe an unsupported result as an unverified draft rather than reporting a completed editable deck.
