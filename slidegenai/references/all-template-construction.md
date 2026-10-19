# One construction system for the entire catalog

Use this for **every** SlideGenAI catalog entry, including directions that have no named demo or special recipe. The catalog currently contains 177 entries. The nine style studies demonstrate the system; they are not an exclusive support list. A newly indexed style follows the same construction process once its source character is established.

## Resolve a specific style, then compose the content

```sh
python3 -B scripts/plan_template.py --id watercolor
python3 -B scripts/plan_template.py --name "Swiss Style"
python3 -B scripts/plan_template.py --id academic --mode faithful
python3 -B scripts/plan_template.py --coverage
```

The optional helper combines the original catalog record, shared rules, a family starting point and any named typography suggestion into a JSON working brief. It creates no slides and measures no visual quality. `--coverage` checks that every indexed entry resolves; it does not render 177 decks. Unknown IDs and ambiguous names fail explicitly. The original source status, missing rules and missing palette evidence remain visible in the returned record.

For a host without Python, read the chosen catalog record and the matching family in [template-system.json](template-system.json) directly. The construction process is identical. Neither the nine named style recipes nor the typography pairing list is required for a style to be usable.

Inspect the particular reference or source preview. Derive its **own** relationships: type width/weight, image role, material, contrast, density, grid and rhythm. Family suggestions provide a starting point when useful; watercolor, ASCII, Bauhaus and Frutiger Aero do not become the same look because the catalog groups them as experimental. Preserve the source description, evidenced palette and distinctive relationships in the working design system. Where the source is unavailable or incomplete, state which decisions are inferred. Never label a family recipe as an official master.

## Shared abilities, content-led use

Every direction can draw on the same composition and component repertoire:

| Content need | Construction choice | Preserve across styles |
| --- | --- | --- |
| Opening | Typographic, photographic, split, poster or restrained cover | Actual title, identity, audience and requested count |
| Topic transition | Numbered, typographic, image-led or quiet topic cover | A real narrative transition; no extra slides beyond the brief |
| Editorial story | Full-page image, image window, band, crop or text/image counterweight | Meaningful image and readable editable text |
| Typographic contrast | Display/body/label roles, serif/sans or width/weight contrast | Brand constraints, resolved fonts, accents and fit |
| Outlined type, gradient, tag | Native glyph outline, reading surface or contextual label when appropriate | Transparent glyph interior, editability, contrast and actual label meaning |
| Comparison or structured detail | Native table, aligned columns, matrix or explanation | Complete content and clear reading order |
| Quantitative evidence | Appropriate native chart and labels | Exact data, units, scales and proportional geometry |
| Process or relationship | Linear, branched, feedback, swimlane, architecture or dependency diagram | Actual topology, direction, endpoints and readable relationships |
| Ending | Synthesis, question, next action, image-led or typographic closing | The specific conclusion, rather than the last demo's geometry |

These are available choices for all styles, not elements to insert into every deck. A luxury deck need not contain a chart without data; an analytical deck can have a full-page image when the image contributes to its argument. Organic composition, outline type and expressive fonts are not universally suitable. Faithful reproduction retains the original restrictions; creative adaptation may modernize within the user's latitude.

Use [typography](typography.md), [components](component-system.md) and [analytical construction](analytical-construction.md) for their respective mechanics in every family. The optional font pairings are examples, not an allowlist. Discover or select other suitable families when the source, language, message or user calls for them. Record the actual resolved family and reflow the layout in the chosen host.

## Preserve identity while changing the object

A style determines visual treatment; content determines object semantics. Carry its type hierarchy, semantic colors, spacing and line character into a chart, table or diagram without changing quantities or topology. Keep expressive texture outside the region where it would damage reading. Reuse the same native component contracts rather than creating an unrelated implementation for each theme.

Choose layout by the actual content, not by the catalog's `suggested_patterns`. Those patterns are suggestions, not restrictions on which objects a style may use. A chart requested by the user should not disappear because its theme's preview contains only a photograph.

For a missing native capability, select a supported editable alternative and explain the material tradeoff. Do not silently flatten required text, charts, tables or diagrams. Missing images, fonts or reference assets are capability/evidence gaps to resolve or disclose, not a reason to silently switch to one of the nine demo identities.

## Validate consistently

Apply the same quality review to every selected style: representative title and evidence construction, then all final slide renders and the overview; verify font resolution, accents, hierarchy, crop, contrast, text fit, data, native objects and batch continuity. Test the requested export separately when applicable. Preserve accepted slides during repairs.

The shared planning contract covers the catalog. Actual presentation quality and host support are established by constructing and inspecting the requested artifact. Keep these two kinds of evidence separate in documentation and delivery.

For optional display voices beyond the starting pairings, consult [expressive typography](expressive-typography.md). The 16 additional local choices can serve any compatible catalog or user-supplied direction; no particular family or effect is mandatory. Preserve evidenced fonts in faithful mode.
