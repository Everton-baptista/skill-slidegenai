# Installation and portability gap review

Review date: 2026-10-18 (America/Sao_Paulo).

## Confirmed problems and changes

| Gap | Evidence | Change |
| --- | --- | --- |
| Font inventory paths differed on Windows | The latest prior CI run failed `test_complete_bundle_covers_app_and_pairings` and font staging with “Unmanifested or missing font binaries” | Store/compare relative inventory paths with `as_posix()` |
| Font ZIP metadata was rejected on Windows | The same run rejected `assets\\fonts\\manifest.json` | Compare portable manifest paths independently of OS separators and write portable ZIP member names |
| Linux/Windows matrix stopped early | The failed Windows job cancelled the remaining matrix jobs | Disable matrix fail-fast so each supported combination reports its own result |
| No single first-installation resource check | Separate commands covered parts of the folder, but copying only the installable skill was not a first-use check | Add `check_installation.py` and a regression that invokes it from an independent copied skill folder |
| No declared license for original skill code/text | README explicitly said no software license was declared | Add MIT with the user's approval, including an installed-folder copy and third-party notices; retain original font OFL licenses |
| Brand ZIP could omit a supplied root license/notice | The strict root allowlist did not accept these files | Retain optional `LICENSE` and `NOTICE.md`, with archive coverage in the font-pack regression |
| Only one public adapter was reproduced in CI | The workflow rebuilt the eight-slide example but not the ten-slide analytical example | Reproduce and check both optional adapters |
| Common failures had no short recovery guide | Installation, registration and export limits were dispersed across references | Add first-use instructions and focused troubleshooting; use `-B` in helper examples to avoid adding caches to distributable folders |

Prior CI evidence: [run 39184893428](https://github.com/Everton-baptista/skill-slidegenai/actions/runs/39184893428). The failed tests identify concrete Windows path problems; they do not imply that all earlier visual studies were invalid.

## Verification boundaries

The Python suite includes 137 tests after adding three independent-installation checks. The first-use command checks local Markdown resources, helper syntax, 177 catalog entries, 30 font families / 120 font files and coverage of suggested families. It does not register OS fonts, inspect external links or generate/render slides.

The public example adapters validate source-data/native-object preservation; those checks do not establish visual quality of every newly generated export. The existing visual study records remain scoped to their actual authoring/rendering hosts. Font registration/embedding and native editing in PowerPoint, Google Slides or Keynote still need testing in the relevant application. Cross-provider execution remains untested.

No SlideGenAI application code is included or modified by this skill-repository update. The skill's MIT license does not change the application's license or third-party font/brand terms.

A clean Git archive passed the 137-test suite and the installed-resource check. Both optional adapters were reproduced after isolated `npm ci --ignore-scripts` installs: the eight-slide PPTX passed its native-object checker, and the ten-slide analytical reproduction retained four native charts and one table. Its 34 free line segments remain explicitly distinct from attached connectors. These fresh reproductions were structurally checked, not re-certified visually.
