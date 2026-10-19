# Adaptive visual kit 1.2.0 validation

This record separates executable behavior, actual rendered output and host adoption. No aesthetic score or universal host certification is inferred from a successful build.

## Implementation exercised

- Node.js 22 on macOS; the public requirement is Node.js 20+. HTML uses only built-in modules, HTML/CSS/SVG and bundled original fonts.
- Optional PptxGenJS 4.0.1 / JSZip 3.10.1 native adapter, installed in a temporary complete skill copy. No runtime dependencies enter the installable ZIP.
- All 177 catalog IDs resolve through the same executable family/font resolver. This checks structural coverage, not 177 rendered or faithful template reproductions.
- 158 Python test cases, including the JavaScript wrapper and independent extracted-package execution. Fourteen JavaScript behavior tests were also run with optional native dependencies enabled. The counts overlap through the wrapper and should not be added as independent suites.
- Tests cover counts, omitted pixel units and explicit points, bounds, duplicate IDs, original input preservation, required image failure, safe local paths/SVG, text escaping, composition recipes, fonts, negative values, percentage totals, paired scatter, diagram topology/dates/lanes/cells, and native objects/effects.
- Both generic ZIP profiles retain the complete kit and licenses. The Claude.ai profile remains below the conservative 29,000,000-byte uncompressed budget; all 46 families remain represented. Dependencies/caches, unknown executable files, symlinks and credential-named files are rejected.

## Existing content reproduced and inspected

The existing eight-slide portable study and ten-slide analytical study were rendered through the new adapters. No new demonstration presentation was authored in Codex. The analytical regression conversion preserves the existing titles, data, diagram nodes, relationships and authored positions/routes.

| Format / check | Observed result | Boundary |
| --- | --- | --- |
| HTML: 8 + 10 slides | Actual Chrome rendering; every slide screenshot and both overviews inspected | Evaluated only for these sources and browser |
| HTML fonts and images | Original Manrope face loaded; used weights available; no broken images or external network requests | Other languages/glyphs and every bundled family not certified by this run |
| HTML geometry | Zero final inspector warnings in both studies; long accented text injected into a test element correctly raises overflow | Geometry checks do not measure visual quality or every collision |
| PPTX: 8 + 10 slides | Actual files exported through LibreOfficeDev 26.8 to PDF; every page and overview inspected | No native PowerPoint/Keynote/Google Slides opening test |
| PPTX fonts | Isolated fontconfig exposed bundled fonts; exported PDFs report Manrope Regular/Bold | PPTX does not embed fonts. Initial export without registration substituted fonts, demonstrating why verification is required |
| Native evidence | Existing checkers pass: four analytical charts/workbooks, one analytical table and 35 editable diagram line segments; portable table/chart/text/image checks pass | Diagram segments are not attached connectors; moving nodes requires rerouting |
| Native effects | Regression test confirms independent images/text, native gradient fill and organic custom geometry in OOXML | Not all effects were visually assessed across native viewers |

Repairs during this run: replace unsupported legacy image sizing calls with the pinned library API; preserve legacy explicit typography without inheriting body leading; make variable-font substitution fit the existing title regions; preserve authored diagram ports/routes and use visible edge/node colors on dark backgrounds; add color-keyed chart legends and units; keep a single-series native chart in one series color. Independently extracted execution also caught a macOS /var versus /private/var entry-point issue, now fixed with canonical paths. Overview inspection caught thumbnail frames wider than their grid tracks; scaling now follows the actual track width, with a collision regression check.

The new renderings preserve content but are not pixel-identical to the original authoring tool. Image crop, table rules, chart ticks/legend placement and type baselines differ between HTML and PPTX. Roadmap/cell colors are deliberately basic starting surfaces. Complex diagrams still need authored routes and visual review; composition recipes do not automatically solve arbitrary long copy.

## Reproduce the checks

From the repository root:

```sh
python3 -B -m unittest discover -s tests -v
node --test tests/test_visual_kit.mjs
```

To enable native adapter tests, install its optional dependencies in a complete tooling copy of the skill, then set SLIDEGENAI_NATIVE_KIT to that copy's assets/visual-kit directory. Do not package node_modules.

```sh
SLIDEGENAI_NATIVE_KIT=/tooling/slidegenai/assets/visual-kit \
  node --test tests/test_visual_kit.mjs
```

The maintained browser check is tests/inspect_visual_kit.mjs. It needs Playwright 1.62.1 for testing only, plus its Chromium installation or a supplied executable. Set SLIDEGENAI_PLAYWRIGHT to the installed Playwright index.mjs when it lives outside this repository; optionally set SLIDEGENAI_BROWSER_EXECUTABLE to the browser executable. Then run `node tests/inspect_visual_kit.mjs NEW_OUTPUT_DIRECTORY`. The output includes screenshots, overviews and browser-evidence.json, with visual inspection still marked pending for the person running it. The CI job installs its own browser and runs these checks separately from distribution packaging.

## Target environments

| Host | New kit status |
| --- | --- |
| Local Node / Chrome / LibreOffice | Existing source reproduction and inspection as recorded above |
| Claude.ai | Account reachable. Replacement ZIP selection was blocked by the extension's local-file upload permission; native 1.2.0 installation and authoring remain untested. The earlier 1.1.3 installation / 1.1.2 authoring record remains historical |
| Claude Code | Rechecked: CLI reports loggedIn false. New kit authoring remains blocked by authentication |
| Antigravity, ChatGPT, other hosts | Not evaluated with this kit. Use documented discovery and capability checks |

Passing local rendering does not close the Claude.ai/Claude Code acceptance cases. Do not label a new deck ready from render-report.json: render and inspect its actual deliverable and record font/image resolution, corrections and remaining limitations in that host.

## Version 2 naming migration

The same kit is now distributed under the single slidegenai folder/name, with /slidegenai as the public request prefix. The 1.2.0 results above describe the implementation tested before this rename. The renamed full/profile packages pass independent extraction/execution and the 158 Python / 14 JavaScript checks; the browser regression also passes with the renamed resource paths; native slash registration in the target hosts remains untested. See the current README for selector differences and the old-name migration.

The pre-rename kit commit also passed all six CI jobs: Linux/Windows with Python 3.9/3.13, existing example reproduction, and native/browser kit regressions. [Recorded CI run](https://github.com/Everton-baptista/skill-slidegenai/actions/runs/39257588234). This is code/resource evidence, not native /slidegenai registration in an AI host.

The final v2 namespace source (1b1ebdd940dca4a722bcbed8e5ba7128c75b7e90, also the v2.0.0 release target) passed [all six CI jobs](https://github.com/Everton-baptista/skill-slidegenai/actions/runs/39258624605), including independent renamed ZIPs on Linux/Windows, Python 3.9/3.13, native objects and actual offline Chromium inspection checks. Native /slidegenai registration in an AI host remains outside that evidence.

## 2.1 art-direction and composition update

The entry instructions were reduced from 1,217 to 924 whitespace-delimited words (about 24%), moving decisions and targeted visual repairs into the art-direction reference. This is an entry-context reduction, not a measured provider latency or output-quality improvement.

Eight explicit type/variant combinations add five alternate spatial arrangements: image-right (cover/topic-cover/closing), inset-image (editorial), bottom-caption (full-image), offset (statement/closing), and open-columns (comparison). Omitted variants preserve the previous geometry. Unsupported combinations and missing required images fail; text is not silently shrunk. All 177 style IDs still resolve through the shared system.

Validation: 158 Python tests pass. Sixteen JavaScript behavior tests pass with optional native dependencies, including the new variants' measured regions, pixel/point scaling, required images, retained text and independent native picture/text/gradient objects. These test counts overlap through the Python wrapper.

The browser harness reproduced the existing 18 source slides and applied all eight variant combinations to existing portable-study content. Original Manrope fonts and images loaded offline, with zero inspector issues. Each of the eight variant screenshots and their overview was visually inspected in Chrome. Text was readable and the photographed room remained visible; the lower gradient protected the photo caption. This controlled fixture deliberately repeats content and imagery to compare geometry. It is not a newly authored demonstration deck or evidence of narrative variation or beauty across subjects.

The variants' PPTX objects were checked in OOXML; the variants were not newly rendered in PowerPoint, LibreOffice or the Claude editors in this update. Earlier rendered PPTX observations above apply to the existing studies. Claude.ai/Claude Code end-to-end evaluation remains pending; revised guidance and additional geometry do not certify either host.

## 2.2 functional HTML update

CSS retains fixed slide geometry, gradient/image/type styling, focus states and print layout. A small offline player adds single-slide presentation mode, keyboard/button navigation, current-slide position, explicit fullscreen support, accessible SVG focus/hover value inspection, series emphasis and a chart-data dialog. Chart updates use the same self-contained renderer and model validator in Node and the browser. Highlights dim other series without removing values or changing totals. A negative domain now has an explicit zero reference.

Observed validation in Chrome 156 (macOS): the existing 8-slide portable and 10-slide analytical sources, plus the 8 controlled composition variants, rendered without font/image/geometry issues. The browser harness checks previous/next, Home/End/Escape, preservation of presentation mode after full-deck inspection, one visible slide, fit at a 390 × 844 viewport, and all slides restored under print media. It exercises keyboard legend toggling, focused value details, the data dialog, valid updates to all four chart types, invalid updates preserving the prior model, and escaped script-like source labels. No external HTTP requests or page errors were observed. Data mutation is test-only and does not rewrite the source study.

The actual PDF exported from presentation mode contains 10 pages at 960 × 540 points, with controls excluded and all slides included. In headless tooling, forcing screen media initially produced an incorrect two-page letter-sized file; switching to print media fixed it. Do not treat screen screenshots as a print test.

The 158 Python cases and 16 JavaScript cases with optional native dependencies pass; counts overlap through the wrapper. The native PPTX regression remains editable and does not acquire HTML controls. Fullscreen permission behavior, screen-reader operation, touch use and other browsers are not certified by this run. The interaction additions do not establish live-data connectivity, automatic persistence, narrative quality or Claude authoring compatibility. Updates persist only in the open HTML session; source-model changes and rebuilt exports are required to save a revision.

## 2.3 visual correction

The previous analytical regression is a technical data fixture, not a public visual standard for modern catalog work. This revision adds an opt-in catalog treatment connecting all 177 IDs to authored semantic color, type roles, composition and analytical-object styling. Explicit user/brand choices retain precedence. Family defaults and inferred palette/geometry are identified as creative adaptations; this does not reconstruct or visually certify 177 source masters.

Nine executable reference pairs reproduce existing fictitious studies using the previously generated concept artwork, preserved content/scene geometry, portable fonts and separate text/image/chart/table objects. Optimized JPEGs total 1,654,011 bytes and have checked hashes. No new narrative demonstration deck or new image was authored. The reference collection is selected guidance, not an exclusive support list.

Observed repairs from actual HTML inspection: restore NOVA's intended 230px title after the earlier layout export reported a tiny size; restore Kinetic's visible yellow plot and light axes on black; separate the horizontal-chart unit from the legend; retain Bauhaus category colors; restore the education table's contrasting header. Shared topic layouts needed larger numeral/title regions and removal of a duplicated section prefix while retaining the displayed section number. Controlled diagram tests preserve the existing authored positions/routes when changing region measures.

Validation: 158 Python cases pass. Nineteen JavaScript cases pass with optional native dependencies, including compilation of a cover and evidence page for every catalog ID, preservation of data and explicit design overrides, nine reference reproductions, horizontal native charts and native category colors. Counts overlap through the Python wrapper. Browser runs render the 18 reference slides plus nine eight-page shared-treatment fixtures with resolved fonts, intact images, no external requests and zero final geometry issues. All nine reference overviews and critical title, contrast and graph cases were visually reviewed. The ordinary portable/analytical/composition regression and interaction/print checks also pass.

The nine reference PPTX outputs were checked for independent native text/pictures, chart workbooks and tables through OOXML. These new reference exports were not visually rendered in PowerPoint, LibreOffice or Claude in this revision. Earlier native render observations apply to their original studies. HTML and native font/effect translation are not pixel-identical; Kinetic outline uses filled editable text in the current PPTX adapter. Complete Claude authoring evaluation remains pending.

Early local test attempts failed with ENOSPC while copying temporary fonts or screenshots; those were resource failures. Superseded generated archives and temporary renders were cleaned, and the affected checks were rerun. No source fonts or application code were removed.
