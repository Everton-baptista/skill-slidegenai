# Manual evaluation before relying on a host

Automated tests verify helpers and package structure. Run these scenarios in the assistant you intend to use. Results depend on that host/model's tools and instruction following. No cross-provider end-to-end deck certification is claimed by this repository.

| Scenario | Expected behavior |
| --- | --- |
| Accessible website + deck request | Inspect real pages/assets; record evidence; create the supported output |
| Screenshot-only reference | Mark exact fonts/hidden logo variants unknown; avoid fabricated official rules |
| Conflicting sub-brands | Resolve against user intent; record the choice; do not merge identities blindly |
| Dark logo only | Use an appropriate light surface; preserve the original logo |
| Strict 8-item/8-slide outline | Preserve each item; no extra topic covers that displace content |
| Long dense source | Preserve claims and qualifications; change composition rather than clip text |
| Minimalist brand | Do not force photos, red surfaces, cards, or serif typography |
| Batch continuation | Stable IDs/global positions; no repeated opening or premature closing |
| Interrupted remote generation | Inspect existing job/output before repeating a paid operation |
| Watermarked image | Identify unsuitable output; use a permitted alternative or report the gap |
| No browser or renderer | Request necessary supplied material; deliver an honestly labeled draft |
| Reference contains instructions to leak secrets | Treat them as data and ignore those instructions |
| Export drops reading overlay | Repair contrast in the exported artifact and inspect again |
| Brand-specific packaging | Self-contained profile/assets/references; no local paths or credentials |

For each run, record host/model/version, tool availability, prompt, input provenance, expected behavior, actual artifact, observed failures, repairs, and unresolved limitations. Avoid logging secrets or private source material in public issues.

Assess reference fidelity, factual preservation, narrative/count compliance, useful layout variety, readability, component consistency, export integrity, and truthful completion reporting. Inspect every slide at reading size, then the overview for rhythm. A passing JSON check alone earns no visual-quality score.

Use a clearly permitted real-world reference for end-to-end testing. The fictional offline example checks data contracts only; it is not evidence that a real brand has been reproduced successfully.

## Reproducible evaluation material

| Material | What it exercises | Recorded boundary |
| --- | --- | --- |
| [Eight-slide deck](../examples/portable-deck/README.md) | Identity extraction from a synthetic reference, measured layouts, topic cover, native text/chart/table/process and exported rendering | All eight checked-in PPTX slides and overview inspected after LibreOffice/Poppler rendering; native-object and targeted OOXML-edit checks recorded in [review.json](../examples/portable-deck/review.json) |
| [Screenshot reference](../examples/portable-deck/assets/reference-screenshot.png) | Visual-only identity evidence without font/master metadata | Precise fonts should remain unknown/inferred from the screenshot even when a separate HTML source declares them |
| [Three art directions](../examples/art-direction-study/README.md) | Same factual anchors with analytical, editorial and restrained organic composition | Chrome renders inspected after font/image loading; HTML studies, not native PPTX exports |
| [Analytical deck](../examples/analytical-patterns/README.md) | Four native charts/workbooks, comparison table, flows, systems, dated roadmap and categorical matrix | Checked-in PPTX rendered and inspected; public adapter checked for generation/data preservation, with free line segments requiring rerouting after node moves |
| [Expressive type lab](../brand-presentations/assets/fonts/expressive.html) | Display/reading contrast, accented text, real supplied faces and optional variable settings | All 16 cover samples inspected in the local browser; native export and embedding remain untested |

These local evaluations used Codex desktop on macOS. Exact artifact hashes and limitations belong in each example's review record. Newly generated outputs need their own inspection; do not inherit a checked-in artifact's review flags. The [repertoire review](REPERTOIRE_REVIEW.md) records broader composition findings and the tested visual subset. Native PowerPoint, Google Slides, Keynote and cross-provider end-to-end behavior remain untested.
