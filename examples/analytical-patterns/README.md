# Editable analytical patterns

A fictional ten-slide construction study for the portable slidegenai skill. It extends the eight-slide identity example with evidence structures: grouped bars, a two-series line chart, 100% stacked columns, paired scatter observations, a decision with rework, responsibility lanes, system relationships, a date-scaled roadmap, a categorical matrix and a comparison table.

## Inspect the actual output

- [Editable PowerPoint](example.pptx)
- [Rendered PDF](example.pdf), [overview](previews/overview.png) and individual PNGs in `previews/`
- [Storyboard](storyboard.md), [measured layout](layout.json) and [semantic source](../../slidegenai/references/visual-model-example.json)
- [Review record](review.json) and [native-object checker](check_pptx.py)

The checked-in deck was authored with Artifact Tool in Codex desktop on macOS, then rendered with LibreOffice and Poppler. All ten final slides and the overview were inspected. Four charts retain editable series and embedded XLSX data, the comparison is a native table, and diagram edges use 16 attached connector segments for 14 logical relationships. Nodes, roadmap bars, matrix cells and text remain native slide objects. No photograph, external API, real company identity or paid service is needed for this fixture. It uses Arial without embedding the font.

The repeated study frame is intentional: compare the construction methods without changing visual identity on every page. These are examples to adapt to the content and brand, not a mandatory ten-slide outline or a general-purpose rendering engine. All values, risk placements, relationships and dates are fictional and disclosed on the slides. The date-based roadmap spans January–June 2027. Share values stored as 45 in the source model become 0.45 in the native chart/workbook with percentage formatting.

## Reproduce with public dependencies

The optional bounded adapter uses PptxGenJS 4.0.1 and JSZip 3.10.1, pinned by the lockfile. It reads only this folder and the relative semantic source above. Keep the repository structure when copying the example. Node.js 20+ and Python 3.9+ are sufficient; npm installation needs network access or a populated package cache. No Codex-specific library or path is required.

From this directory:

```sh
npm ci --ignore-scripts
node build.mjs --out ./generated
python3 -B check_pptx.py ./generated/example.pptx
```

Use a new output directory for each run; the adapter refuses to overwrite one. It produces an editable PPTX. The reproduced charts include their data workbooks and the comparison remains a native table. Unlike the checked-in Artifact Tool deck, the PptxGenJS adapter draws relationships as editable free line segments: moving nodes requires manual rerouting. It is not pixel-identical to the checked-in artifact. This difference is reported by the checker, not hidden as equivalent attachment support.

The checked-in deck also passes the stricter attachment check:

```sh
python3 -B check_pptx.py example.pptx --require-attached
python3 -B ../../slidegenai/scripts/validate_visuals.py ../../slidegenai/references/visual-model-example.json
```

The checker compares native chart caches and referenced XLSX cells to the source, verifies scatter x/y pairs and share conversion, checks node/relationship labels, native table contents and connector counts. It is scoped to this trusted fixture; it does not prove visual quality or provide a general security audit of arbitrary PPTX files.

To render your reproduction, use an installed PowerPoint-compatible renderer. For example, with LibreOffice and Poppler available:

```sh
soffice --headless --convert-to pdf --outdir ./generated ./generated/example.pptx
pdftoppm -png -scale-to-x 1280 -scale-to-y -1 ./generated/example.pdf ./generated/slide
```

Inspect every rendered slide after any content/font/layout change. No renderer is installed by the adapter. Native PowerPoint, Google Slides and Keynote application editing, and runs in Claude/Gemini or other hosts, remain untested. The recorded local review covers this particular artifact and reproduction path, not all 177 catalog entries or all chart types accepted by the semantic validator.
