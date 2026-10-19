# User-request scenario evaluation

Test the skill's decisions as well as the renderer. Use a fresh session per case in each target host, with `/slidegenai` installed through that host's supported mechanism. Reading this document or successfully rendering a fixed fixture is not a successful authoring run. Do not run these prompts in Codex as a substitute for Claude.ai or Claude Code.

The six briefs below deliberately vary how much the user supplies. Do not give the agent a finished plan or a prescribed catalog style: discovering the appropriate narrative, visual material and composition is part of the test. Use the requested language for the slides. Keep the sources and execution record outside slide artwork unless the brief requires visible attribution; preserve legally required attribution.

## Briefs and controlled corrections

### A. Ordinary user request

> /slidegenai Crie uma apresentação de 6 slides sobre como uma pequena empresa pode organizar melhor o atendimento ao cliente. Preciso apresentar para minha equipe. Entregue PPTX editável e prévias.

No website, logo, data or style is supplied. The agent should make reasonable choices and produce a complete, coherent presentation without demanding brand material or invented success metrics. Judge whether its visual choices help explain the topic, not whether it uses every available effect. A small business presentation need not look like a technology festival.

Correction: make the explanation of the service journey more visual, retaining six slides and the accepted content. Inspect whether this changes the actual visual argument rather than adding unrelated decoration.

### B. Logo supplied, no brand guide

Attach only [the existing fictional logo](../examples/demo-brand/assets/demo-mark.svg). Do not attach its profile, website or design system.

> /slidegenai Use este logo da marca fictícia Aurora para criar 6 slides sobre um programa de capacitação de equipes. Quero identidade coerente, capa, uma abertura de tópico e imagens pertinentes. Entregue PPTX editável e prévias.

The logo must be inspected and inserted with its original aspect ratio and colors, on a legible surface. It supplies observable artwork/color evidence; it does not establish an official font, photo style or complete brand guide. Check whether the agent explicitly treats those as design choices. Do not force the logo onto every page or synthesize a replacement symbol.

Correction: switch one selected slide to a dark surface while preserving the original logo; provide an appropriate panel if necessary, reflow text and inspect. Verify that the supplied asset was not stretched or silently recolored.

### C. Website-led institutional presentation

> /slidegenai Crie 6 slides institucionais a partir de https://www.exmpartners.com.br/. Use o logo e fotos reais disponíveis no site, destaque as áreas de atuação e inclua uma capa de tópico. Entregue PPTX editável e prévias. Não invente dados nem a idade atual da empresa a partir de um banner de aniversário.

Check acquisition, actual logo/photo import, identity evidence, factual content and the resulting slides separately. A text-reader result is not evidence of downloading or inserting a photograph. A compass illustration does not satisfy the requested site photography.

Correction: replace the cover photograph with another relevant original site image while retaining verified content and logo. Inspect the changed crop, overlay and title.

Run the denied-access variant from [the Claude protocol](CLAUDE_VALIDATION.md#2-website-and-access-failure) separately, recording whether the denial is real or simulated. With essential original assets unavailable, partial output and a precise missing-input request are appropriate; fabricated originals or a false completion claim fail.

### D. Topic-only expressive presentation

> /slidegenai Crie 8 slides em português sobre como usar modelos de IA para apoiar uma equipe de atendimento. Público não técnico. Quero uma direção visual expressiva, imagens relevantes, contraste tipográfico, capas de tópicos dentro dos 8 slides e pelo menos uma imagem ocupando a página com texto editável sobre degradê. Explique limites e revisão humana. Não invente estatísticas ou capacidades de produtos específicos. Entregue PPTX editável e prévias.

Inspect whether the imagery explains a useful concept rather than defaulting to a generic robot or repeated cards. Original illustration is valid here; documentary photos are not required. Resolve expressive and reading faces in the actual environment. Diagrams of AI use do not imply that the exported deck is connected to a model.

Correction: change the selected image-led page to an asymmetrical editorial composition while preserving the message, total count and editability; inspect again. Check identity continuity beyond the cover.

### E. Supplied indicators

Attach [the fictional indicator data](../tests/scenarios/ai-indicators.json).

> /slidegenai Prepare 5 slides executivos sobre esses indicadores fictícios de avaliação de modelos de IA. Compare taxa de aceitação, custo por tarefa avaliada e latência p95. Inclua os valores e as unidades corretas, uma tabela comparativa editável e gráficos editáveis. Separe interpretação de observação. Não transforme isso em ranking real de fornecedores. Entregue PPTX editável e prévias.

Expected acceptance rates: 86%, 92%, 80%. Cost per evaluated task: R$ 0.12, R$ 0.20, R$ 0.08. P95 values: 2.8s, 4.1s, 1.6s. Preserve the equal denominators and synthetic-data qualification. Do not average percentiles, add unrelated axes or imply that lower latency alone selects a winner. Inspect native chart data/workbooks and table cells, as well as readable labels and visual hierarchy.

Correction: update Candidate B to 180 accepted tasks and R$ 44 batch cost; retain its task count and latency. Expect 90% acceptance and R$ 0.22 per evaluated task everywhere affected, including embedded chart data and table cells. Preserve other candidates.

### F. Charts and explanatory infographics together

Attach the same indicator file, including its process graph.

> /slidegenai Crie 7 slides para demonstrar como modelos de IA apoiam o atendimento e como avaliá-los. Use os dados fictícios enviados. Quero gráficos legíveis, um infográfico de processo com decisão e retorno para revisão, uma comparação visual e uma capa de tópico. Preserve textos, tabelas, gráficos e nós/conectores como objetos editáveis. Varie os layouts conforme a mensagem. Entregue PPTX editável, uma versão HTML navegável se disponível e prévias.

Check that the process branches to approval and revision with the revision returning to retrieval. Labels must explain what each stage does. A sequence of unrelated icons, a pasted diagram screenshot or seven copies of one card layout fails the stated requirement. Inspect the exported PPTX objects separately from HTML interactions. HTML navigation or in-session data updates are not a live AI/data integration.

Correction: move human review before the final response, relabel it “Revisão responsável” throughout and change Candidate B as in E. The node is already before the response in the source: preserve the valid ordering without creating a second review node. Verify the loop endpoints, updates, counts and re-rendered output.

## Evidence and acceptance

For each case retain the prompt, supplied files and hashes, installed skill version, host/model/tools, actual artifacts and hashes, resolved fonts, inserted image locations/provenance, editable-object checks, individual slide previews, overview and the scoped correction/reinspection. Record observed defects and repairs. Use [the execution-evidence guide](../slidegenai/references/execution-evidence.md).

Review content/count, identity, meaningful imagery, typography, useful layout variation, chart semantics, infographic reading order and actual export separately. Judge a regular business brief according to its audience; do not force expressive type or full-page images into every case. Never convert these observations into an automatic beauty score.

A case is verified only after the target host creates, exports, inspects and corrects its result and the actual files are reviewed. A successful helper test, fixed-fixture render or previous-version run is supporting evidence, not case completion. Use separate states for partial output, visually unverified output and blocked operations.

## Current results — 2026-10-19

Suite target: repository v2.3.0 (`945cf63`) with this evaluation material added afterwards. No new narrative deck was authored in Codex for this suite.

| Case | Claude.ai, current skill | Claude Code, current skill | Local supporting evidence |
| --- | --- | --- | --- |
| A Ordinary request | Not run | Blocked: CLI authentication required | Existing creation/portable regressions; no open-ended authoring certification |
| B Uploaded logo only | Not run | Blocked: CLI authentication required | Existing logo asset, profile/design bindings and native portable-deck checks; no logo-only authoring certification |
| C Website / denied access | Not run | Blocked: CLI authentication required | Bounded real retrieval and injected-network failure tests, recorded below; import/slide fidelity not certified |
| D Expressive AI topic | Not run | Blocked: CLI authentication required | Nine existing visual references and real browser reviews from v2.3.0; no new AI-topic authoring certification |
| E Indicators | Not run | Blocked: CLI authentication required | Semantic validator and existing native chart/workbook/table regressions; case-specific authoring pending |
| F Charts + infographics | Not run | Blocked: CLI authentication required | Existing editable graph/connector and native-object regressions; case-specific authoring pending |

The Claude Code supported auth-status command reports `loggedIn: false`. This is an observed local blocker; no inference about Claude.ai authentication or quota is made. Historical Claude.ai authoring evidence remains in [the separate protocol](CLAUDE_VALIDATION.md). It does not certify these six cases or the renamed current skill.

### Supporting checks executed in this revision

- `python3 -B -m unittest discover -s tests -p test_website_assets.py -q`: 10 passed, including controlled download/access failures. These inject HTTP responses and do not certify a host's network.
- `python3 -B -m unittest discover -s tests -p test_portable_kit.py -q`: 25 passed for design/identity binding, units, retained references, native editable objects and scoped existing-deck edits.
- `python3 -B -m unittest discover -s tests -p test_analytical_artifacts.py -q`: 7 passed, comparing actual native chart caches/workbooks, table content and connector endpoints; deliberate corruptions are rejected.
- `python3 -B -m unittest discover -s tests -p test_visuals.py -q`: 23 passed for semantic data/diagram validation, including invalid measurements and graph data.
- `node --test tests/test_visual_kit.mjs` with the optional native adapter available: 19 passed, none skipped. This includes all 177 style resolutions, preserved explicit choices and native reference chart/table objects. This rerun did not constitute a fresh all-slide visual inspection.
- The six-case indicator input was checked independently with decimal arithmetic: baseline rates/costs and the Candidate B correction above agree with the supplied counts. The approval/revision return edges are present. No case-specific deck exists yet.

A new bounded EXM retrieval inventoried 54 candidates and selected the two embedded original logo variants and one original site photograph. Selected bytes were saved successfully; original asset SHA-256 values:

| Asset | SHA-256 |
| --- | --- |
| Light-logo source SVG | `45a5ef74608d36edb604df8dc18e48612865a92cd68bf8011bd52166b92484f7` |
| Dark-logo source SVG | `065dd785bcbbba7a9ed595c18e74a6874571731108df2ff3a6dcc6cd4bc2ab6c` |
| `imagens/img-reestruturacao-de-dividas.jpg` | `ae780d2ffb5ec236d81ff5cc094d5f3d0c4cabe9f676619e525ba0532404e3ee` |

The photograph was opened and visually inspected: monochrome sailing imagery, with bright foam across much of the frame. A title over that bright region would need a suitable reading surface/crop. Logos were retrieved as original SVG bytes; they were not rendered into a case-specific slide. Acquisition and this single-image inspection do not establish editor import, website-wide identity extraction or a finished presentation. Original website assets and raw HTML remain outside the public distribution.
