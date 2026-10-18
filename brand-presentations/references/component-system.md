# Reusable presentation components

Use a small component vocabulary to keep production predictable. These patterns draw on SlideGenAI's separation of structured content from visual masters, its topic-cover normalization, and its rendered overflow checks. They are design contracts, not a bundled rendering engine or a copy of the application.

## Three layers

1. **Brand tokens:** semantic colors, actual font families/fallbacks, logo variants, spacing scale, safe areas, and image direction derived from evidence.
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

A large heading and photograph can carry an idea without extra cards. Use cards, borders, shadows, and decorative shapes only when supported by the reference and useful for grouping.

## Geometry and overflow

Keep a single canvas and unit system. Convert geometry explicitly for the authoring tool; do not silently rely on its default aspect ratio. Account for footer/citation regions when allocating body space. Intentional image/shape overlap is allowed; accidental text collisions are not.

In DOM-based hosts, measure after layout and after fonts/images load. Check the canvas scroll size, nested fixed-height boxes that clip their own content, and text regions escaping the canvas. Account for scaling and subpixel tolerance. A hidden overflow setting can conceal content rather than fix it. In non-DOM hosts, use equivalent text measurement and final rendering tools.

These measurements are host responsibilities. The included JSON validator checks declared boxes only; it does not perform DOM measurements.

## Deterministic masters and controlled variation

Select a master by meaning and fit. Keep logos, spacing, and type tokens stable; vary image-led, text-led, explanatory, and evidence-led compositions when appropriate. Normalize middle-batch opening/closing roles before merging. Preserve valid content and repair only the affected regions or slides.

## Export adapters

Map components to supported native primitives whenever possible. Preserve valid zero coordinates; do not replace `0` with a default position. Convert units and font sizes explicitly. Check unsupported gradients, transparency, masks, SVG dependencies, missing images, and layer order. Do not swallow element insertion errors and still claim a complete export.

Record what remains editable. A rasterized background with native text is a possible fallback, not a fully editable reconstruction. Inspect the actual exported artifact before marking it verified.
