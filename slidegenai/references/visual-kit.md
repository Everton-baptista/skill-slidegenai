# Optional adaptive visual kit

Use this kit when file authoring is available and actual components help. Native host editors remain valid. The kit does not browse, invent content, acquire photographs, generate images or inspect its own aesthetic quality. Obtain the actual required imagery first; missing requested photos remain a partial requirement.

## Run from an installed skill

Requirements: Node.js 20+, a working folder containing a version-1 deck plan and design system, and permitted local images. No framework, CDN, paid API or npm installation is needed for HTML. Do not run npm inside the skill before packaging it; generated dependencies are intentionally rejected by the packager.

```sh
node /path/to/slidegenai/assets/visual-kit/build.mjs \
  --plan /work/deck-plan.json --design /work/design-system.json \
  --format html --out /work/preview-v1
```

`--out` must be a new directory outside the installed skill. The builder refuses overwrites, count/unit mismatches, unsupported objects, missing images and external asset paths. Plan and design share a working folder. Output contains presentation.html, render-report.json and original font licenses. The HTML embeds selected original font files and permitted images, so it can be opened offline or served locally without network requests.

For editable PPTX, use a local installed copy of the **complete skill folder** (or copy the complete folder to a tooling location), then install optional dependencies:

```sh
cd /path/to/slidegenai/assets/visual-kit
npm ci --ignore-scripts --no-audit --no-fund
node build.mjs --plan /work/deck-plan.json --design /work/design-system.json \
  --visuals /work/visual-model.json --format pptx --out /work/pptx-v1
```

For packaging, use a clean repository/installable folder without node_modules. PptxGenJS 4.0.1 and JSZip 3.10.1 are optional pinned dependencies; HTML mode never imports them. See [native authoring](native-authoring.md) before claiming export fidelity. The adapter creates a new file; use the host's import/edit workflow for preserving existing masters.

From this repository, reproduce the **existing** portable example with:

```sh
node slidegenai/assets/visual-kit/build.mjs \
  --plan examples/portable-deck/deck-plan.json \
  --design examples/portable-deck/design-system.json \
  --format html --out output/portable-html
```

This is a new rendering of existing source content, not a pixel-identical reconstruction. The example requests Arial; the portable kit explicitly substitutes bundled Manrope and records the substitution. Existing example-specific builders remain unchanged.

## Shared data and composition

Keep the [deck plan](deck-plan.md) and [design system](design-system.md) version 1 contracts. Omitted plan units still mean pixels. Canvas and unit must agree. Numeric element coordinates are authoritative; explicitly convert points to pixels only when changing the declared unit. Both adapters use the same compiled scene.

Optional additions:

- `template_id` on plan or design: canonical catalog ID; plan takes precedence. It resolves shared family/font suggestions for all 177 entries. Explicit element/design fonts and identity win. It does not reproduce an original master or invent a catalog color palette.
- `type_role` on an element: a design typography role, such as headline/body/caption. `font_family`, `font_size`, `font_weight`, `italic`, `line_height`, `align` override the applicable defaults. Font families outside the bundle are explicitly substituted; absent weights/styles use a recorded available face. HTML embeds selected faces. PPTX requests the families and approximates weights as regular/bold; register fonts and inspect substitutions in the real viewer.
- `composition` on a slide: an optional executable recipe. Types: cover, topic-cover, editorial, full-image, statement, comparison, closing. Uses the slide title and optional `eyebrow`, `body`, `number`, `image` or `panels`. Comparison requires exactly two `{title, body}` panels. Editorial/full-image require `{asset, alt}` image. Generated elements precede explicit `elements`; IDs must remain unique. Recipes scale measured regions to the canvas. They are starting compositions, not text-fitting algorithms or a mandatory deck sequence.
- `composition.variant`: optional alternate geometry. Omitted/`default` retains the previous layout. `image-right` supports cover/topic-cover/closing and requires an image; `inset-image` supports editorial; `bottom-caption` supports full-image; `offset` supports statement/closing; `open-columns` supports comparison without panel backgrounds. Unsupported type/variant combinations fail. These are explicit choices, not automatic rotation. Short headlines fit the narrow image-right column better; inspect long text rather than relying on silent shrinking. Expanded text remains editable in both adapters.
- `effect` on an element: `mask` (ellipse/organic), `radius` (nonnegative measure), `outline` (text stroke width), `tag` (boolean) and `gradient` (shape reading surface). Use supported properties, never inject arbitrary CSS/HTML. A gradient has opaque `from`/`to` colors, `from_opacity`/`to_opacity` from 0 to 1, and direction right/bottom. A full-image recipe builds an image, independent reading gradient and editable title/body.
- Image `fit` is cover/contain (logos default to contain). Optional `focal_point: [0.5, 0.5]` controls HTML crop. Native PPTX currently centers crop; a noncentral focal point is a reported export difference.

For example, replace a slide's elements with a measured full-image starting composition, keeping its existing ID, position and content:

```json
{"composition":{"type":"full-image","body":"Existing supporting content","image":{"asset":"assets/approved-photo.jpg","alt":"Actual image description"}},"elements":[]}
```

For custom work, edit the expanded geometry or use the reusable source functions; a recipe does not supersede accepted work, an existing template or a user-specified layout. Long text may require faithful rewriting or a different composition. The kit does not silently shrink it away.

## Analytical objects

Pass `--visuals FILE` using the existing [visual model](visual-model-example.json). Place `visual_id` on `kind:chart` for charts, or on `kind:shape` for diagrams; geometry defines the region. Table `values` is a nonempty rectangular array. No object is rasterized into a whole slide.

| Object | HTML | PPTX |
| --- | --- | --- |
| grouped-bar, line, stacked-share, scatter | Data-derived SVG, labels and unit/source description | Native chart with embedded workbook |
| Table | Real HTML table | Native table |
| process, decision-flow, swimlane, architecture | Positioned text, shapes and orthogonal lines | Native text/shapes/free line segments |
| roadmap | Dates determine bar position and duration | Native proportional shapes and text |
| matrix | Categorical rows/columns and cell labels | Native cells and text |

Charts require named series, source status and label. Percent columns must total 100; bars include zero; negative values are retained. Scatter uses paired observations sharing the same X vector across series; independent X samples need another host adapter. Diagram edges must resolve; lanes, dates and matrix cells must be valid. Optional `node_positions` on a diagram element maps node IDs to local `{x,y,width,height}` for deliberate layout. Default layout preserves nodes/edges but complex branches need authored positions and inspection. Optional `routes` is an array in edge order: each item declares `fromSide`/`toSide` (left/right/top/bottom), optional local `waypoints`, and a local `label_box: [x,y,width,height]`. Optional `label_font_size` controls the label. `node_color` can set a contrasting node-label color separately from the edge color. Native segments are editable but not attached to nodes; reroute after moving nodes. Unsupported analytical types fail instead of becoming decorative imagery.

## Export and review

HTML supports local fonts, outline/tag styling, image crop, gradients, ellipse/organic masks and SVG charts. PPTX translates gradients and masks into DrawingML, retains editable foreground text and uses native charts/tables/diagram objects. CSS outline becomes filled editable text; rounded corners map to a native preset; native font weights, crop and SVG import need inspection. Recorded differences are limitations, not a claim of equivalence. SVG input must be passive/self-contained; active content, external resources, style blocks and unsupported file types are rejected. Keep the original and create a permitted flattened working copy for complex SVG.

Open HTML and await `window.slidegenai.ready`, then call `await window.slidegenai.inspect()`. It reports font loading, broken images, content overflow and outside-stage bounds. Use Overview / reading to inspect all slides and the overview. Text collisions, contrast, image meaning, reading rhythm and whether the composition is beautiful still require visual inspection. Do not label a file verified from the JSON report alone. `render-report.json` starts with rendering and inspection false on every build, regardless of old input review fields.

For PPTX, register selected bundled fonts, render the actual file, inspect every page and overview, and check native text/table/chart/diagram objects. PDF or screenshot inspection does not prove another viewer's font behavior. Record those outcomes with [execution evidence](execution-evidence.md). No Claude, Codex, Antigravity or ChatGPT certification follows from a successful local build.

## Functional HTML presentations (2.2)

CSS controls visual treatment and measured geometry; the small bundled JavaScript player provides behavior. Both remain optional when using a native host editor. No framework, external chart library, network request or paid API is required.

- **Present** fits one slide inside the available width and height. Previous/Next and Arrow keys, Page Up/Down, Home/End navigate; Escape returns to reading. **Overview / reading** retains the review grid. **Fullscreen** is an explicit browser action and may be restricted by the host. Small-screen preview scales the stage without rearranging factual geometry; dense slides may still require a larger screen.
- Focus or hover on an SVG data mark to read its series/category/value. Focus a legend and press Enter/Space, or click it, to emphasize a series. Other series are dimmed, not removed; axes, values and percentage totals retain their meaning. These interactions do not change source data.
- **Chart data** opens an HTML table of the chart values and source status. Use the selector to inspect each chart. This is a reading tool, not an editable PowerPoint table or a full screen-reader certification.
- Print restores all slides and series even when presentation mode shows a single slide or a series is highlighted. Browser PDF export is a static snapshot of the current HTML state. Tooling must use print media rather than forcing screen media when exporting.

For an authored local interaction, use the API after `await window.slidegenai.ready`. `navigate(index)` uses a zero-based index; `setMode()` accepts `reading`, `overview`, or `presenting`. `getState()` returns current mode/index/count. Example of an explicit chart-data update using existing IDs:

```js
const api = window.slidegenai;
const visual = api.getChart(slideId, chartElementId); // independent copy
// Change the supplied model here, retaining source status and truthful units.
api.updateChart(slideId, chartElementId, visual);
```

`updateChart` validates the complete visual model with the same rules as compilation, then rebuilds that chart's SVG, axis domain, labels, interactions and data-table model. Invalid input throws before replacing the chart. Supported types remain grouped-bar, line, stacked-share and paired scatter. A changed dataset requires another visual fit/meaning check; this API does not certify it. Negative values retain a zero reference; percentage columns must total 100.

Updates live only in the open browser session. The API does not rewrite the HTML, synchronize PPTX/PDF, connect to databases, poll a live feed or persist changes. Update the source visual model and rebuild the deliverables to save a revision. A genuine live-data integration needs an explicitly chosen and authorized data source plus refresh/error handling; do not claim one exists from an interactive chart alone. PPTX keeps native editable chart objects and workbooks, without the HTML player's tooltips or controls.

## Catalog character and composition

`template_id` alone remains backward-compatible and supplies catalog font suggestions. For a creative catalog starting system, set `catalog_treatment: true` in the design and choose a canonical `template_id` on the plan or design. This opts into authored semantic colors, type roles, composition geometry, chart colors and evidence treatments. Explicit design colors/fonts and element values take precedence. Omitted composition variants use the catalog treatment when supported; an explicit `variant: "default"` retains legacy recipe geometry. Existing explicit elements are not rearranged.

All 177 IDs resolve through the shared treatment factory. The factory combines source color inventories, family starting points and selected authored directions. Semantic roles, missing colors and geometry are creative inferences, recorded as such; they are not imported source masters. Different source styles may share a family layout. This does not reproduce 177 original templates or certify all of them visually. Use specific source relationships and custom measured elements for further differentiation. Preserve faithful-template and brand requirements.

Catalog compositions support cover, topic-cover, editorial, statement, closing and `evidence`. An evidence composition takes an `object` with `kind: chart|diagram|table` and the same `visual_id` or table `values` used by ordinary elements. Pass the model through `--visuals`. Example:

```json
{"composition":{"type":"evidence","eyebrow":"Existing section label","body":"Existing explanation","caption":"Illustrative data","object":{"kind":"chart","visual_id":"existing-chart-id"}},"elements":[]}
```

Choose this when its geometry fits the content; use explicit elements otherwise. Charts receive a quiet plotting region while retaining display/body roles and semantic colors. Source units, data and diagram topology stay intact. Native elements and HTML use the same expanded scene; original masters are not imported by this builder.

Charts additionally support `orientation: horizontal|vertical` for grouped bars and stacked shares, `chart_label_size` as a positive measure, and boolean `show_values`. Boolean `color_by_category` is restricted to a single grouped-bar series; an explicit palette colors categories in both adapters. Otherwise colors identify series. Unsupported category-color models fail. Numeric axes use readable tick steps without altering data. Tooltips, the data table and the original source status remain available.

The [executable visual references](visual-reference-library.md) bundle nine existing cover/evidence pairs, measured plans, structured data and optimized concept images. They are the visual reference collection. The analytical-patterns fixture remains a functionality/data regression, not the intended universal art direction or public aesthetic showcase.

The compiler rejects ambiguous chart/diagram IDs and non-finite table numbers. Explicit visual-model versions must be 1; omitted versions remain compatible with existing reference fixtures. Chart ranges that cannot produce finite plotting axes fail with a request to rescale values and units. Output must stay outside the installed skill, including paths through symlinked parent directories. These checks do not replace actual renderer inspection.
