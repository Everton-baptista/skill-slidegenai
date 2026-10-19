# Expressive typography for covers and emphasis

Use this guide for creative adaptation when a title needs a distinct voice. It applies across the catalog and to user-supplied brands when their rules permit it. Preserve required typography in faithful reproductions. These are curated design suggestions, not official rules inferred from a reference.

The [choice catalog](expressive-fonts.json) supplies 16 bundled families, readable body companions, sample treatments and cautions. Inspect the [live type lab](../assets/fonts/expressive.html) for cover-scale compositions and the [complete specimen](../assets/fonts/specimen.html) for all 46 families. The source, license and exact files are recorded in the [font manifest](../assets/fonts/manifest.json).

## Choose the voice before the family

| Visual intent | Optional display families | Useful placement | Quiet companion |
| --- | --- | --- | --- |
| Wide, assertive, geometric | Unbounded | Launch cover, major statement, section title | Manrope |
| Condensed and elastic | Anybody | Kinetic cover, tall chapter numerals, short stacked titles | DM Sans |
| Urban signage | Bungee, Dela Gothic One | Poster-like cover, city/culture topic opener | Inter or Manrope |
| Drawn outline or dimensional shade | Bungee Outline, Bungee Shade | One highlighted word, outline/solid counterpoint | Space Grotesk or DM Sans |
| Disrupted digital texture | Rubik Glitch | Experimental music/culture cover, deliberate signal metaphor | Space Grotesk |
| Inflated or sculptural | Climate Crisis, Tilt Warp | Material/creative concept, playful title composition | Inter |
| Soft editorial character | Fraunces | Food, craft, human stories, short quotation | Manrope |
| High-contrast editorial | Instrument Serif, DM Serif Display | Fashion, art, hospitality, elegant opening or chapter | DM Sans |
| Angular or rounded futurism | Orbitron, Audiowide | Systems, space, audio or technology introduction | Inter or Manrope |
| Graphic fixed-width blocks | Rubik Mono One | Very short manifesto, chapter number, prominent tag | DM Sans |
| Human handwritten accent | Caveat | Annotation, reflective question, human-scale chapter | Manrope |

Do not map one family permanently to an entire template category. Match the specific content and audience: a cyberpunk data slide may need calm labels, while a restrained editorial deck may support one expressive title. Existing brand rules and user choices take priority.

## Build the contrast

1. Assign the display role to a short title, phrase or numeral that carries the slide's idea. Use the reading companion for explanations and evidence. Usually two families are enough; add a separate label face only for a clear purpose.
2. Compose using the actual title. Compare line silhouette, density, word breaks, image position and negative space. A long title may need another font or layout; do not force the broadest face into a narrow column.
3. Establish contrast through scale, weight, width, serif/sans structure or solid/outline treatment. Avoid combining several loud textures simply because they are available.
4. Let the display voice recur in topic covers and meaningful emphasis so it belongs to the deck. Keep chart labels, table cells, footnotes and sustained body text readable.
5. Load real local files and supported faces before measuring. Check accents, numerals, punctuation, actual line breaks and local contrast over images. Render/export, then inspect again.

A smaller use can be more effective than another cover: a large chapter numeral, an editorial quotation, a two-word takeaway, a short image caption or an intentional margin annotation. Meaningful slide tags can use a compact display face if they remain legible at presentation scale.

## Outlines, shadows and variable axes

**Bungee Outline** and **Bungee Shade** contain drawn outline/shadow glyphs. They remain text when the host supports those fonts. They are different from applying native transparent glyph fill and text stroke to another font. Do not claim one method proves support for the other. Keep the font outline large enough to survive the final export, and avoid duplicating its shadow with an extra effect.

**Anybody** has a width axis; **Fraunces** has optical-size, weight, softness and wonk axes; **Climate Crisis** uses YEAR; **Tilt Warp** exposes perspective axes. Consult the actual ranges in the manifest. Do not invent an axis or value from its name. Use supported settings deliberately, keep an ordinary default when a renderer cannot reproduce them, and record substitutions. CSS variation settings are not proof that a native PPTX editor preserves them.

## Editable output

Keep titles as text in editable presentation formats where supported. A display font does not require flattening a slide into an image. If the chosen host cannot render the face or effect, use a supported licensed alternative and review the reflow, or disclose a limited decorative raster element if that meets the user's needs. Preserve editable factual text, tables and charts.

The HTML lab demonstrates browser typography with local fonts and CSS shapes. It does not certify PowerPoint, Keynote, Google Slides, font embedding or variable-axis export. It provides a visual starting point, not a mandatory set of masters.
