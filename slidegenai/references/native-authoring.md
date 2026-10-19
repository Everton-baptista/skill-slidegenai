# Native presentation authoring recipe

Use the host's supported native slide API/editor. These operations are conceptual; adapt to documented APIs rather than inventing method names. No exclusive library is required by the skill.

1. Import/clone a fidelity reference; otherwise create the specified canvas and theme.
2. Resolve available fonts. Convert the design's sizes/positions explicitly for the tool. CSS uses 96 pixels/inch; presentation points use 72 points/inch; therefore pt = px * 0.75 and inches = pt / 72. Native file EMU = inches * 914400. Never mix font points and canvas pixels accidentally.
3. Bind semantic tokens and instantiate a master with native text, images, tables, charts, and requested diagrams. Preserve zero positions rather than replacing them with truthy-default fallbacks.
4. Fill content slots; fit using actual font metrics. Keep evidence sources/notes and original logo assets. Do not approximate data charts with decorative bars.
5. Render; check overflow and contrast; repair affected objects. Export and inspect again when the final format differs from the authoring preview.
6. Check the resulting file's native text/table/chart objects. Structural presence does not guarantee fidelity or editability in every viewer.

The repository includes a bounded optional PptxGenJS example adapter for reproducing its fictional deck. It is not the mandatory generation engine. Other hosts may use their own tools with the same data and component contracts. Only claim the formats and host combinations actually tested.

## Optional executable components

The [adaptive visual kit](visual-kit.md) implements shared scenes in offline HTML/CSS/SVG and editable PPTX. Use it when it fits the task; native host tooling remains valid. Read its support matrix and inspect the actual output separately for each format.
