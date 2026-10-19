# Claude validation protocol and results

## Current evidence — 2026-10-18/19

Source version: **1.1.3**. Authoring runs below used the actually installed **1.1.2** Claude.ai profile; later packaging fixes do not retroactively certify a new authoring run. No new presentation was authored in Codex. Downloaded Claude-produced exports were separately reviewed locally.

| Environment | Installation / access | Authoring / inspection evidence | Remaining boundary |
| --- | --- | --- | --- |
| Claude.ai, exposed Sonnet 5.5 Medium selection | 1.1.2 native ZIP installed, enabled and mounted; VERSION, distribution and route-reference reads observed. Replacement with 1.1.3 confirmed in the current enabled installation | Eight-slide original deck and one-slide native process delivered; actual exports/previews reviewed. In-session rendering, inspection and self-corrections observed | Quota interrupted other cases and follow-up corrections. Native Claude Slides, PowerPoint and Keynote not tested |
| Claude Code 2.1.252 | CLI installed; supported auth status reports not logged in | No authoring run | All six cases blocked by required user authentication |
| Antigravity / ChatGPT / other hosts | Official installation guidance reviewed; no execution certification | Not tested end to end | Product discovery and authoring tools require real host tests |

The Claude.ai UI reported exhausted free messages until **4:50 AM**. No purchase, quota bypass or provider substitution was attempted. Website and long-text requests returned to unsent draft states; they are not successful tests. The analytical run explicitly paused before delivery. The one-slide follow-up shows Failed to send. The overall two-host acceptance remains **incomplete**.

### Case 1: original expressive eight-slide deck

Actual retained files: cultura-do-reparo.pptx, cultura-do-reparo-previa.pdf, visao-geral.png and registro-de-execucao.md. PPTX SHA-256: `4ca2b557465753e7244844d8f2ef7c04ad9b2db2bfd2ea6401f679f52d7027b6`.

Observed Claude tools: python-pptx, Pillow, LibreOffice, pdftoppm and font inspection. The record and visible tool sequence show creation/art-direction/Claude.ai references and font manifest reads, original conceptual illustration, rendering, all eight slide inspections, overview inspection and repairs to image geometry, text placement, shape effects and contrast. Catalog/style-grammar files were explicitly not used, which is valid for original art direction.

The downloaded PPTX independently contains exactly eight slides, editable text on every slide, original image instances on slides 1, 3 and 8, topic covers on slides 2 and 5, native staircase shapes and a five-step native process with seven connector/line objects. Slide 3's image matches the full canvas at (0,0), with a native gradient and separate editable text. The two distinct illustrations are conceptual, not documentary photography. The exported PDF contains embedded Instrument Serif Regular/Italic, Lato Regular/Bold and IBM Plex Mono Regular, confirmed by its font inventory.

All eight actual exported pages and the overview were reviewed after download. No visible clipping was found at the inspected size. The imagery is deliberately simple; slide 7 has a sparse card composition and is the weakest part of the visual rhythm. Some return-path segments require manual rerouting when shapes move. These are qualitative observations, not an automatic beauty score. The requested post-delivery revision could not be exercised after quota exhaustion; the full case is not marked passed.

### Case 6A: one-slide process

Actual retained files: reparo-solicitacao-a-conclusao.pptx, reparo-previa-renderizada.png and registro-de-execucao.md, retrieved together through the UI's Download all ZIP. PPTX SHA-256: `752ca287d9f51b7b7beacf64d305356c656237f8938d022ae399e0893069b98f`.

The PPTX independently contains exactly one slide, 25 native shapes/text boxes, 15 connector/line objects (13 with endpoint bindings) and no flattened image. The downloaded preview was visually inspected: readable swimlanes, approval/rework paths, title and conclusion; no observed clipping. The in-Claude record shows initial layout defects, fixes, rendering and reinspection. Variable-font families were resolved, but exact rendered weights were not independently measured; the record discloses this. Font embedding in the PPTX and native application opening were not certified.

A scoped follow-up asked for a final customer-acceptance branch while preserving one slide. The UI explicitly showed Failed to send after quota exhaustion. The correction/reinspection and separate five-slide variant remain untested.

### Distribution failures found by actual installation

| Attempt | Observed result | Implemented response |
| --- | --- | --- |
| Full 140-font ZIP | Rejected: uncompressed size exceeds 30 MB | Default full package retained; explicit Claude.ai profile stays below a conservative 29,000,000 uncompressed bytes |
| Initial reduced-face profile | Rejected: path contains invalid characters | Normalize upload filenames; preserve original binary hashes and source-path mapping |
| 1.1.2 normalized profile | Installed/enabled; font staging exposed repeated face-01.ttf basenames | 1.1.3 uses unique family-prefixed filenames and tests staging all 53 retained fonts together |

The 1.1.3 replacement was accepted; after refreshing the Skills contents view, the current enabled installation displayed VERSION 1.1.3 (UI revision v2). No 1.1.3 authoring run was possible after quota exhaustion. Its submitted ZIP SHA-256 is `df30fc63c7e4a7af138dd2d65550e7ec8a32830e7b1423835d5f8e1fb3cb701e`. The profile retains all 46 families and original licenses, with 53 original font binaries. Some styles/weights are intentionally omitted and listed in DISTRIBUTION.json; original files remain in the complete repository. Font bytes and internal family identities are unchanged. Installation/activation and authoring quality are distinct checks.

## Current request coverage

The [six-case request suite](SCENARIO_EVALUATION.md) adds ordinary briefs, logo-only input, website-led work, an expressive AI topic and data/infographic requests for the current `/slidegenai` skill. Run those cases in addition to the editing, long-text and strict-count edge cases below. Historical evidence above remains tied to its actual version. For new runs use `/slidegenai`, the current installed name, rather than the legacy `brand-presentations` name in the historical protocol.

## Run separately in each environment

Install the full skill first using the README. Use a fresh working directory/conversation per case and retain artifacts and preview evidence. Use the same brief in both environments, but adapt the operational path to exposed tools. Do not run these authoring prompts in Codex as a substitute.

For every case require an editable artifact in the requested format, actual slide count, inserted imagery, real font resolution, all-slide plus overview inspection, native-object checks where applicable, and an execution record. Review the actual files/previews. Then send the correction prompt in the same session, verify the changed artifact and re-inspect affected slides. If inspection finds no defect, record that observation and still exercise the stated scoped revision. Keep prior accepted work.

| Case | Claude.ai | Claude Code |
| --- | --- | --- |
| 1 Topic only / expressive imagery | Initial 8-slide artifact inspected; follow-up revision blocked by quota | Blocked: login required |
| 2 Website / denied access | Not completed: quota prevented a usable run; denied-access variant not run | Blocked: login required |
| 3 Editable data objects | Started; paused by quota before artifact delivery; object validation pending | Blocked: login required |
| 4 Existing template edit | Not run: quota reached before authoring | Blocked: login required |
| 5 Long text / accents / font substitution | Not completed: quota prevented a usable run | Blocked: login required |
| 6 Single slide / strict count | Initial 1-slide artifact inspected; correction failed to send due to quota; 5-slide variant not run | Blocked: login required |

### 1. Topic only

“Use brand-presentations. Create exactly 8 slides in Brazilian Portuguese about repair culture and circular economy for small business owners. No brand reference. Choose an expressive original direction, meaningful images, contrasting typography, topic covers within the total and an editable process. Include at least one full-page image with editable text over a reading gradient. Do not invent factual metrics. Deliver editable PPTX and inspected previews; keep native Slides verification separate. Record the resources actually used.”

Correction: “On the image-led slide, move the text to the opposite side, adjust crop/gradient for legibility, preserve its message and inspect the changed export again.” Check that the image is inserted, not an empty placeholder or filename.

### 2. Website and access failure

“Use brand-presentations. Create exactly 6 institutional slides from https://www.exmpartners.com.br/ in Portuguese. Use verified public content and original logo and site photographs, not an invented logo or icon. Avoid treating an anniversary banner as evidence of current company age. Deliver editable PPTX and inspected previews, plus retrieval/import evidence.”

Correction: “Replace the cover photograph with a different suitable original site photograph, preserving the logo and facts; re-inspect the cover.”

Run a separate denied-access variant in the same environment's approved restricted-network configuration if available. Do not weaken security policy or deliberately break system DNS. Otherwise supply the explicit constraint: “For this variant, assume all permitted acquisition/transfer paths for the website's binary assets are unavailable; do not attempt them. The original photos and logo remain essential.” This is a **simulated denial**, not proof of actual network behavior. Expected result: useful partial work and a precise blocker/request, never a claim that those missing assets were inserted. Record whether failure was real or simulated. A text reader's success does not prove download access.

### 3. Editable chart, table and flow

“Use brand-presentations. Create exactly 4 slides in Portuguese for fictional project Aurora. Label all numbers as fictional. Data: quarterly revenue in R$ thousand Q1=120, Q2=155, Q3=148, Q4=210. Table: Plan A cost=80 duration=6 weeks; Plan B cost=95 duration=4 weeks; Plan C cost=70 duration=8 weeks. Flow: request → analysis → approval decision; approved → implementation; rejected → analysis. Include an editable chart with embedded data, native editable comparison table, and editable flow shapes/connectors. Deliver PPTX and inspected previews.”

Correction: “Change Q2 to 165 in chart data and visible labels; rename analysis to technical review throughout the flow. Preserve all other values and inspect again.” Inspect native objects, series/workbook values and branch destinations; raster screenshots do not satisfy editability.

### 4. Existing template editing

Attach the repository's existing fictional examples/portable-deck/example.pptx (not the installable ZIP). Record its hash and object inventory first.

“Use brand-presentations to edit this deck faithfully. Preserve slide count, masters, dimensions, original media and all unrequested objects. Replace the title of slide 4 with ‘A new chapter’ and the closing slide's main statement with ‘Let us build the next step’. Keep text editable. Deliver edited PPTX and inspected previews.”

Correction: “Restore the original slide 4 title; keep the closing revision. Inspect both affected slides.” Compare OOXML parts/object inventories, including master relationships and media hashes, to distinguish intentional changes from lost objects. Record any required conversion limitation instead of claiming faithful preservation.

### 5. Long text and font fallback

“Use brand-presentations. Create exactly 3 slides in Portuguese explaining this sentence without dropping qualifications: ‘A organização deve avaliar eficiência, segurança, transparência, inclusão, manutenção e custo total antes de automatizar decisões; ganhos de velocidade não eliminam a necessidade de revisão humana em situações excepcionais.’ Include the accented test line ‘Ação, coração, ciência, órgão, útil — R$ 1.250,50’. Request the deliberately unavailable font FictionalMissingFace999; use a confirmed available fallback and record it. Use editable text, readable hierarchy and inspected PPTX previews.”

Correction: “Add ‘A revisão deve ter responsáveis e prazos definidos.’ to the explanation, preserve every prior qualification and reflow/re-inspect.” Check glyphs, line breaks and actual resolved fallback, not just the font name in source.

### 6. Single slide and strict count

Run A: “Use brand-presentations. Deliver exactly one editable slide in Portuguese explaining how a customer request becomes a completed repair. Include a meaningful process diagram and a clear takeaway. No separate cover or closing. Render and inspect it.”

Correction A: “Add an approval branch without adding a slide; inspect again.”

Run B: “Use brand-presentations. Create exactly 5 slides on the same topic, including one opening, one topic cover and a closing within the total. Include the complete revised process. Deliver inspected editable PPTX.”

Correction B: “Move the topic cover immediately before the process without changing slide count; re-inspect order and affected previews.” Count actual export slides; topic covers never justify exceeding the requested total.

## Acceptance record

For each run retain: host/tool versions, installed VERSION and package hash, prompt, loaded references, artifact location/hash/count, font resolution, images and slide placement, native object evidence, all inspected preview locations, defects, correction request and reinspection, remaining limitations and completion state. Follow the bundled execution-evidence reference. Keep credentials, private conversation URLs/logs, account identifiers and proprietary source assets out of public evidence.

Only mark a case verified after the target environment actually authored, exported, inspected and corrected its output and the retained evidence has been reviewed. An inspected initial artifact is useful evidence but does not complete this two-host protocol. Resume the existing paused analytical run and failed one-slide correction after access returns; avoid blindly creating duplicate work. Other providers and all unperformed formats remain untested.
