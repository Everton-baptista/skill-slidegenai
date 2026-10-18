# Charts, flows and analytical construction

Use when the audience needs to compare, explain a mechanism, understand evidence or decide. Read the selected row, then the relevant contract; do not turn every presentation into a dashboard. Style families from the [complete template catalog](template-catalog.md) can dress these structures without changing their factual geometry.

## Choose the visual argument before the template

| Audience question | Candidate structure | Required input | Avoid |
| --- | --- | --- | --- |
| Which is larger? | Ranked horizontal bars, grouped columns | Comparable values, categories, units and series | Decorative bars or truncated magnitude baselines |
| What changes over time? | Line, small multiples, optionally area | Ordered periods, missing-value policy and comparable series | Connecting unordered categories or turning gaps into zero |
| What makes up the whole? | Stacked share bars, a simple donut for few categories | Exclusive parts, common denominator, total | Fake percentages or an incomplete whole |
| Are two variables related? | Scatter; bubble only with a meaningful third measure | Real x/y pairs, separate axis units, size measure | Category indices disguised as measurements, causal claims from correlation |
| What explains a change? | Waterfall | Opening value, signed changes and closing value | Summing percentages with different bases or losing signs |
| What happens after a choice? | Decision flow | Real steps, decision conditions and branch labels | Decorative arrows, omitted failure paths or invented rules |
| Who hands work to whom? | Swimlanes | Actors/lanes, activities, responsibility and handoffs | A numbered list that conceals responsibility |
| What connects to what? | System architecture, hierarchy or dependency map | Named entities, relationship meaning and direction | A network drawn solely for visual complexity |
| When does it happen? | Roadmap, timeline or Gantt when durations matter | Dates, duration and dependencies when known | Equal-width durations presented as a time scale |
| Where is risk concentrated? | Labeled categorical matrix or sourced heatmap | Axis definitions, assessment basis and cell meaning | Unexplained red/amber/green, fake probabilities |
| What are the tradeoffs? | Aligned comparison or native table | Common criteria and supported values/qualifications | Unsupported winner badges or incomparable columns |
| What is a place or experience like? | Photo editorial or full-canvas overlay | Relevant permitted imagery | A gratuitous chart when no quantitative question exists |

A website with only service descriptions may need flows and comparison structures, not fabricated performance charts. If numeric evidence is absent, ask for it when essential or deliver a clearly marked fictional demonstration only when that fits the user's request. Never manufacture business results to satisfy a chart quota.

## Compose the evidence, then apply identity

Preserve the user's brand before source theme samples. Translate its typography, semantic colors, spacing and signature into the plot and diagram. Keep one stable meaning for each series/status across the deck. Separate series color from decoration. Use size/weight, position and direct labels to support color, especially for statuses.

Keep a single visual argument per slide. A chart with an interpretive title and one useful annotation may need no photo. A technical architecture may use a dark stage while a dense comparison needs a calm light surface. Do not paste every source template's neon/glass/bento rules onto the evidence. No chart, font or background is inherently “more modern”; specific relationships and readable proportions matter.

For a 1280 × 720 example, reserve roughly 64px edges, a 100–150px heading region and a plot/diagram region around (64,230,1152,380). These are starting allocations, not global text limits. Direct labels and units need real measured space outside the plot. Dense content may require an overview plus a detail slide when count permits; do not silently drop categories or branches.

## Chart construction contract

Retain a machine-readable source beside the artifact: `id`, `type`, `unit`, source status/citation or explicit fictional label, category order, series names, numeric values and missing-data policy. For scatter/bubble use actual `x`/`y` pairs and axis units. For a waterfall keep opening/changes/closing separately. Do not infer numbers from decorative marks or rounded labels when original data exists.

Use the host's native chart object, series and workbook/data model for charts requested as editable. Keep the legend, chart labels, axes and title associated with the chart when the API supports them; avoid duplicate detached labels. Confirm formulas, cached values, category order, percentage representation, unit formatting and the exported workbook agree. Editable plot styling does not prove editable source data.

Bar magnitudes need a meaningful zero baseline. A line can use a focused range when clearly labeled. State/logically preserve logarithmic axes, mixed units, denominators, uncertainty, missing values and periods. Stacked-share values need the same whole. Radar/gauge/polar charts require explicit scales and a reason; a bar or dot plot is often easier to compare. Do not use a gauge just because the source theme says “metrics.”

For unsupported native types (for example Sankey, treemap, heatmap or some waterfall APIs), choose a supported structure that preserves the question with the user's intent, or disclose the editing limitation and retain the full source. Do not silently call an SVG, HTML chart or screenshot a native editable chart. Mermaid/SVG may be useful diagram source formats, but their rendered images do not preserve native object editability.

## Diagram construction contract

Keep nodes and edges separate from appearance. Nodes need stable IDs, readable labels, roles, measured bounds and lane/group membership when applicable. Edges need existing `from`/`to` IDs, relationship meaning, direction and useful branch labels. Dates and dependencies belong to the source model, not the visual ornament. A hierarchy cannot acquire cycles to fit a layout. A process may have an explicit rework loop.

Build requested editable diagrams with native text/shapes and actual connectors anchored to the intended nodes where supported. This is semantic diagram geometry, not decorative illustration. Choose ports and orthogonal routes that minimize crossings. Put labels beside their edge, preserve arrow direction in the target API, and inspect after resize/export. Do not make an arrow terminate in the middle of an unrelated box. A “No” branch needs a visible destination, and a lane boundary does not itself imply a handoff. Some editors place attached connectors behind other shapes by default; check that lane/background fills do not conceal them, then adjust the stack without covering node labels.

Use shapes for decisions, steps, groups or quantified cells only when they express the model. Avoid styling every label as a pill or adding numbered circles that imply nonexistent sequence. Content stays readable when a lane, container or title wraps. Keep start/end roles, alternate branches and required actors.

## Optional visual-model validator

`python3 scripts/validate_visuals.py /path/to/visuals.json` validates the separate optional version-1 model used by the [complete source example](visual-model-example.json). It checks finite values, category lengths, share totals, nonnegative parts, scatter/bubble pairs, gauge/radar scales, waterfall reconciliation, source status, graph endpoints, decision branches, hierarchy cycles, lane membership, date ranges and matrix indices. It does not render, route connectors, verify source truth, certify brand fidelity or validate a native export. Existing deck/profile contracts do not change.

Supported helper chart type names: `bar`, `grouped-bar`, `stacked-bar`, `stacked-share`, `line`, `area`, `pie`, `donut`, `radar`, `polar-area`, `scatter`, `bubble`, `gauge`, `waterfall`. These are data-model checks, not a claim that every host/export supports every type. Unsupported models fail explicitly.

Every chart has `source: {status: "sourced", citation: "..."}` or `{status: "illustrative", label: "Fictional example"}`. The latter label must appear in the produced audience-facing chart/slide. Scalar-series charts use `categories` and `series: [{name, values}]`. Scatter/bubble series use `points: [{x,y,size?}]`, plus `x_unit` and `y_unit`. Missing scalar values may be `null` only with `missing_policy: "gap"`; the renderer must preserve the gap. Examples and tests contain the remaining shape details. The helper checks the source declaration; visual QA must check that its label/citation is actually visible or retained as required.

## Review the exported result

Check the question, data, geometry and style independently. Read every axis/branch/lane label at final size. Confirm all source categories, series and nodes survive export. Check zero/negative values, percentages, true gaps, arrow directions, decision destinations, road-map date positions and matrix axis definitions. Inspect the overview for pacing, not for a mandatory number of chart slides. A structurally valid deck can still communicate poorly.

Record which objects remain native and which tool/render path was tested. Include the editable artifact and useful visual preview. Keep implementation and validation commentary outside audience slides unless requested.
