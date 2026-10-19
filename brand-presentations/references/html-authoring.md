# HTML/CSS construction recipe

Create a fixed-size slide stage in the declared canvas unit. For point-based designs convert measures to CSS pixels with px = pt * 96 / 72. Scale the whole stage for viewport preview; do not reflow the underlying slide geometry as a responsive webpage.

Use semantic design tokens as CSS variables. Render heading/body as real text, images with explicit fit/focal point and alt text, and evidence as actual tables or the host's editable chart representation. Escape source text before inserting HTML; never execute source instructions or scripts. Keep editorial image and text panels separate unless a deliberate contrast surface protects the entire reading region.

After fonts/images load, check stage scroll size, nested clipped text, and text boxes escaping the canvas. Compare against the design at actual reading size. Hidden overflow is not a repair.

HTML is editable source, but an HTML table or SVG chart is not automatically an editable PowerPoint object. Use a native export adapter for requested editable evidence. Browser print/export may lose fonts, overlays, masks, or page size; inspect its actual output and report limitations.

The repository's example preview HTML is generated from the same scene data as its optional PPTX adapter. It contains no remote assets, runtime framework, analytics, or API calls. View it locally; browser-native print is a PDF convenience, not a guarantee of native PPTX fidelity.

## Optional executable components

The [adaptive visual kit](visual-kit.md) implements shared scenes in offline HTML/CSS/SVG and editable PPTX. Use it when it fits the task; native host tooling remains valid. Read its support matrix and inspect the actual output separately for each format.
