# Reusable presentation components

Use a small component vocabulary to keep production predictable. These patterns draw on SlideGenAI's separation of structured content from visual masters, its topic-cover normalization, and its rendered overflow checks. They are design contracts, not a bundled rendering engine or a copy of the application.

## Three layers

1. **Brand tokens:** semantic colors, actual font families/fallbacks, logo variants, spacing scale, safe areas, and image direction derived from evidence when a brand reference exists, or authored explicitly for an original deck. A logo is optional for unbranded work.
2. **Layout masters:** brand-appropriate compositions with measured regions and content slots. The rendering tool owns geometry; the content model fills the slots.
3. **Slide content:** heading, optional eyebrow, body or points, image description/alt text, factual metric/context/source when applicable. Omit unused fields instead of inventing content.

When a fixed master has a tested capacity, use its local content budgets as early guardrails. Those budgets belong to that master and font; do not transfer one template's numeric limits to every brand. Always verify the rendered fit.

## Component contracts

| Component | Inputs | Review |
| --- | --- | --- |
| Brand signature | Original asset, supported variant, target box, evidenced spacing | Preserve aspect ratio; ensure suitable background and clear space |
| Heading block | Eyebrow if useful, meaningful heading, type token, region | Natural wrapping; no clipped lines; hierarchy clear |
| Body block | Paragraph or related points, type token, region | Avoid redundant paragraph plus repeated bullets; readable density |
| Editorial image | Permitted local asset, crop/focal point, alt text | Subject remains meaningful; no stretched image or unwanted watermark |
| Reading surface | Solid panel or supported overlay beneath text | Entire reading area protected, including long headings |
| Metric/chart | Source-supported values, units, labels, context | No invented scale or values; label illustrative examples |
| Citation/footer | Actual citation and optional page position | Fits safely; never invent affiliation, contact, or a source |
| Section marker | Topic ID/label and global position | Introduces a real transition and counts toward total |

A large heading and photograph can carry an idea without extra cards. Use cards, borders, shadows, and decorative shapes when useful for hierarchy or grouping and consistent with the chosen direction. For faithful reproduction, retain the reference's treatment; for original work, author a suitable treatment.

## Geometry and overflow

Keep a single canvas and unit system. Convert geometry explicitly for the authoring tool; do not silently rely on its default aspect ratio. Account for footer/citation regions when allocating body space. Intentional image/shape overlap is allowed; accidental text collisions are not.

In DOM-based hosts, measure after layout and after fonts/images load. Check the canvas scroll size, nested fixed-height boxes that clip their own content, and text regions escaping the canvas. Account for scaling and subpixel tolerance. A hidden overflow setting can conceal content rather than fix it. In non-DOM hosts, use equivalent text measurement and final rendering tools.

These measurements are host responsibilities. The included JSON validator checks declared boxes only; it does not perform DOM measurements.

## Deterministic masters and controlled variation

Select a master by meaning and fit. Keep logos, spacing, and type tokens stable; vary image-led, text-led, explanatory, and evidence-led compositions when appropriate. Normalize middle-batch opening/closing roles before merging. Preserve valid content and repair only the affected regions or slides.

## Export adapters

Map components to supported native primitives whenever possible. Preserve valid zero coordinates; do not replace `0` with a default position. Convert units and font sizes explicitly. Check unsupported gradients, transparency, masks, SVG dependencies, missing images, and layer order. Some SVG renderers drop class-based styles: compare the rendered logo with the source. When needed, resolve its existing CSS properties into equivalent element attributes in a working copy, preserving paths, colors, proportions and the original file. Do not substitute a black silhouette or recolor the mark to hide an import failure. Do not swallow element insertion errors and still claim a complete export.

Record what remains editable. A rasterized background with native text is a possible fallback, not a fully editable reconstruction. Inspect the actual exported artifact before marking it verified.

## Construction recipes

Use the example's `deck-plan.json` for complete numeric instances. The numbers below describe its 1280 × 720 px canvas only, not every brand. Reuse a master or change it intentionally; keep a 64px body-safe margin and reserve the footer at y=666.

| Recipe | Inputs and measured region | Overflow/editability/review |
| --- | --- | --- |
| Heading | Text + headline role; explanation title at (64,68), 1120×150 | Preserve line breaks deliberately; rewrite or enlarge region before shrinking. Native text; compare wrapping after export. |
| Body | Paragraph or points; editorial body at (640,400), 535×164 | Fit real font metrics; never hide clipped lines. Native text; retain qualifications when shortening. |
| Editorial image | Local asset + alt text + focal point; (0,0), 570×640 | Crop proportionally; protect important subject matter. Raster image is allowed; verify resolution and permitted use. |
| Reading surface | Surface role + reading region; editorial text stays on the paper region to the right | Extend contrast across all wrapped lines. Native solid shape/background where supported; inspect gradients in exports. |
| Logo | Original asset, suitable background, target box + clear_space | For the demo asset, a 64×64 box needs 16px surrounding space. Preserve aspect ratio; no recoloring without support. For brand work, record a missing required logo; an unbranded deck needs no logo. |
| Chart | Categories, values, units, source/illustrative label; (64,255), 760×330 | Keep a native chart with editable series/workbook. Check categories, scale and values against the source after export. |
| Table | Full matrix with headers; (64,260), 1152×290 | Preserve all cells. Adjust row heights/column widths before splitting when allowed. Native table; inspect every cell. |
| Citation/footer | Real source or supplied attribution, global page number; (64,666), 1152×22 | Never invent a citation or shrink below readable size to fit. Longer citations need a larger region or notes when appropriate. |
| Topic cover | Topic ID/label, short title, optional context; title (64,230), 1120×220 | Counts toward total; long substantive content belongs in an explanatory master. Native text; inspect transitions across batches. |

For a native process diagram, keep labels and connectors as editable objects with semantic order. The example's process slide uses three measured columns; it is an illustration of that topic, not a universal requirement for three-part content.

## Full-canvas photograph with a gradient reading layer

Inputs: permitted image, visible focal subject, crop/fit, reading region, brand-compatible overlay color, gradient direction/stops, text roles and supported logo variant. Match the host's unit and angle conventions explicitly. Do not assume CSS angles, gradient offsets or opacity values transfer unchanged to a native presentation API.

For a 1280 × 720 px example, the image may occupy (0,0,1280,720), with a left headline around (64,200,600,250). A native overlay covers the photograph and fades from a dark reading region on the left to low opacity near the subject on the right. These are starting regions, not a compulsory layout or universal stop values. For a bottom composition, reserve space below faces rather than using the same coordinates rotated.

Layer order is image, reading overlay, then native text/logo. Preserve the original photo and logo. Use the host's native gradient with explicit stop offsets and alpha when supported; otherwise retain a permitted background layer and native text, noting that the overlay is not independently editable. Do not add a rendering dependency solely for this effect.

Before export, check the text over the brightest and most detailed areas beneath it. After export, inspect gradient direction, stop interpolation, alpha, logo contrast and image crop. A source preview can differ from PPTX/PDF. Verify editable text and native evidence objects separately from appearance.

## Source display

Keep factual and image provenance in the relevant speaker notes or an accompanying source record when the host permits. Visible source footers are optional unless the user, supplied template, attribution terms or the meaning of the evidence requires them. Honor a request to remove visible source footers without deleting the underlying provenance. Preserve qualifications such as “more than,” the measured population and the reporting period in the audience-facing claim.
