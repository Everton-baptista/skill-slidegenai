# Complete fictional example

Eight slides, one invented identity, one generated editorial image, and illustrative chart data. This is a construction fixture, not a real institution, empirical report, or default style for every brand.

## Explore

- [Storyboard](storyboard.md): narrative and roles.
- [Identity](brand-profile.json), [design system](design-system.json), [deck plan](deck-plan.json): the three layers.
- [Reference webpage](reference.html): synthetic source with explicit colors/type.
- [Editable PPTX](example.pptx), [PDF](example.pdf), [HTML preview](preview.html).
- [Overview](previews/overview.png) and [slide previews](previews/slide-01.png): all eight numbered PNGs are in `previews/`.
- [Review record](review.json): exact checks, host, hashes, and limitations.

Text, the comparison table, chart series/workbook, and the process diagram's text/connector objects are native in the PPTX. The library image is rasterized by design. No font is embedded. No claim is made about native opening in PowerPoint, Google Slides, or Keynote.

## Reproduce without a provider key

Use Node.js 20+ and run from this directory. HTML generation has no dependencies:

```sh
node build.mjs --format html --out ./generated-html
```

For the optional PPTX adapter:

```sh
npm ci
node build.mjs --format all --out ./generated
python3 check_pptx.py ./generated/example.pptx
```

`package.json` pins PptxGenJS 4.0.1 and JSZip 3.10.1. These packages are optional example dependencies, not a required skill engine. See the [PptxGenJS quick start](https://gitbrent.github.io/PptxGenJS/docs/quick-start/). Outputs are generated locally, with no API calls or downloaded images. Use a new directory on each run; existing output files are not overwritten.

The bounded builder reads the included eight-slide pixel plan. It illustrates mapping components to primitives, not a general-purpose untrusted-input rendering service. CSS/chart preview and native PPTX are distinct renderers; inspect your newly generated PPTX rather than transferring this fixture's review flags to it.

The adapter removes dangling generated slide-master content-type declarations and simplifies single-level chart category references while preserving formulas and cached values. It never changes an input/source PPTX. These narrow interoperability repairs are covered by artifact tests.

## Render and check your output

The checked-in PDF/PNGs were rendered from the checked-in PPTX using LibreOffice and Poppler, then visually inspected. You can use a native slide editor or install those optional tools to reproduce previews:

```sh
libreoffice --headless --convert-to pdf --outdir ./generated ./generated/example.pptx
pdftoppm -scale-to 1280 -png ./generated/example.pdf ./generated/slide
```

On macOS, the executable may be `soffice` in the LibreOffice application bundle; on Windows use its installed executable path. Rendering tools are optional and not installed by this repository. Browser printing of `preview.html` is useful, but does not verify native PPTX editability.

From the repository root, validate the included data:

```sh
python3 slidegenai/scripts/validate_design.py examples/portable-deck/design-system.json --brand examples/portable-deck/brand-profile.json
python3 slidegenai/scripts/validate_deck.py examples/portable-deck/deck-plan.json --brand examples/portable-deck/brand-profile.json --design examples/portable-deck/design-system.json --require-reviewed
python3 -B -m unittest discover -s tests -v
```

The image was generated for this example with built-in ImageGen on 2026-10-18. It does not depict a real campus. The synthetic demo mark is retained as an identity asset; it is not required on every layout. This example's generous whitespace and colors should not override another user's reference.
