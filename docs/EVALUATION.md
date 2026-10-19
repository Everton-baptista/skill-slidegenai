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

## Recorded local evaluation

The [complete fictional example](../examples/portable-deck/README.md) was authored and evaluated in Codex desktop on macOS. Its [review record](../examples/portable-deck/review.json) identifies the inspected artifact and exact boundaries. All eight slides and the overview were visually inspected after LibreOffice/Poppler rendering. Chrome found no text-box overflow in the HTML preview and detected an intentionally excessive heading.

A clean directory reproduction used only the included optional adapter and its public npm lockfile, then passed the native-object checker. Automated scenarios cover a scoped existing-deck text edit preserving every unaffected OOXML part, global numbering across split/rejoined batches, and false verification claims. These are targeted regressions, not model behavior certification in every host.

The [screenshot fixture](../examples/portable-deck/assets/reference-screenshot.png) demonstrates visible identity evidence without embedded font/master metadata. A screenshot-only run should mark the precise font family as unknown/inferred even though the separate HTML source declares it. This interpretation was evaluated in the current session; no separate Claude/Gemini run was performed.

Native PowerPoint/Google Slides/Keynote application editing remains untested. Real-brand extraction was subsequently exercised in the local trial described below; do not turn that run into broader host certification.

## Adaptive art-direction evaluation

The [three-direction study](../examples/art-direction-study/README.md) was rendered locally in Chrome and each PNG was inspected after font/image loading. It holds the visible factual anchors constant while varying audience, register, and visual argument. It demonstrates analytical, editorial, and restrained organic treatments rather than adding an organic preset to every brand.

Evaluate future runs for specific reasoning: why this crop, hierarchy, density, and image role fit the content. Include a rigid institutional template that should remain precise, a softer observational brief that permits organic cadence, a dense evidence slide, and a deliberately repeated comparison that should not be “fixed” for novelty. No automatic aesthetic score or detection of AI authorship is claimed.

## Website extraction and photographic revision trial

On 2026-10-18, Codex desktop on macOS used the repository skill to inspect an institutional education website (the institution is anonymized in this public record) and produce a 14-slide Portuguese presentation. A follow-up revision removed visible source footers while retaining note provenance, introduced five full-canvas photographs with native gradient overlays, and refined serif/sans-serif contrast. The final PPTX was structurally checked, reimported with Artifact Tool, rendered through LibreOffice/Poppler, and all 14 slides plus the overview were visually inspected. Native text, one native table and six native gradient fills were confirmed in the revised package.

Repairs addressed page numbers over photographs, ambiguous plus notation and text positioning over a group image. The trial used Georgia/Arial as documented substitutes for unavailable website fonts. It tested website extraction and the local native-object export pipeline, not an official institutional master, a native PowerPoint session, or other providers. Real-brand assets and private trial outputs are intentionally not distributed in this repository. The public fictional example remains the reproducible installation fixture.

A second 16-slide Portuguese trial used the EXM Partners website to test transfer to a different identity: blue sans-serif hierarchy, original monochrome navigation imagery and a distinct service narrative. The initial preview exposed loss of SVG class-based fills; a working-copy conversion of the existing class properties to equivalent inline attributes restored the original mark. Counts with conflicting scopes/versions across the website were not silently merged. Final visual inspection and native-object verification are recorded privately with the trial output; this is not cross-provider certification.

## Template repertoire and analytical construction trial

On 2026-10-18, the application source inventory identified 177 interface templates, 174 matching backend rule entries and 176 declared template IDs. The portable catalog records all entries, source hashes, adaptation families and unresolved source gaps. It is source-reviewed guidance rather than 177 tested presentation exporters.

The [ten-slide analytical fixture](../examples/analytical-patterns/README.md) was built with Artifact Tool in Codex desktop on macOS. All ten final slides were inspected at reading size after LibreOffice/Poppler rendering, along with the overview. Repairs addressed dark chart axis contrast, unintended scatter connecting lines, lane fills concealing connectors, destination arrows, a wrapped decision label, rework routing and system path clarity. The final PPTX retains four native charts with editable XLSX data, one native table and 16 attached connector segments for 14 diagram relationships. A date-scaled roadmap and categorical matrix remain native editable shapes/text.

A clean independent reproduction used the public PptxGenJS/JSZip lockfile, without private runtime paths or an API, and passed chart-cache, workbook, native-table and label checks. Its editable free line segments do not attach to nodes; the README records this difference. The checked-in rendered Artifact Tool deck is the visual-review artifact; the optional adapter is tested for generation and source/native-object preservation, not pixel equivalence or native application editing. See the [review record](../examples/analytical-patterns/review.json) for exact artifact hashes and boundaries.
