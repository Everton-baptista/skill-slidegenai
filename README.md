# SlideGenAI Skill

**Create a complete presentation from a topic, outline or reference—with an original visual direction or your brand identity.**

SlideGenAI Skill gives your AI assistant a reusable workflow for creating and editing presentations: typography, images, topic covers, varied layouts, editable charts, tables and diagrams. You provide a topic or content, and optionally a visual reference; the assistant uses the tools available in your session to build and review the result.

The skill you install and invoke is called **`brand-presentations`**. You do not need to install the SlideGenAI application. This repository supplies instructions, resources and examples; your assistant supplies browsing, slide creation, image generation and rendering when those tools are available.

**Start here:** [Install](#1-install-the-skill) → [Create your first deck](#2-create-your-first-presentation) → [Improve the result](#3-refine-without-starting-over).

## Preview: styles and capabilities

Real rendered slides from fictional studies made with the skill. Choose a direction that fits your subject, or provide your own brand reference.

![Nine presentation directions: Acid Rave, Neo-Tech, Cyberpunk, NOVA, Ultimate Luxury, Neo Tokyo, Bauhaus, Kinetic and Corporate & Education](docs/previews/style-study-9.jpg)

### Beyond the cover

Topic covers, full-page photography, contrasting typography, editable charts, tables, flows and schedules:

![Eight slide examples: outlined typography, full-page photography, topic covers, charts, tables, feedback flows, schedules and time series](docs/previews/capabilities.jpg)

[Download the eight-slide PowerPoint example](examples/portable-deck/example.pptx) · [View its PDF](examples/portable-deck/example.pdf) · [Explore the analytical example](examples/analytical-patterns/README.md).

These previews demonstrate completed studies. The catalog contains **177 style directions**, rather than 177 downloadable PowerPoint masters. All entries share the construction workflow; a complete deck has not been visually tested for every entry.

## 1. Install the skill

Choose **one** installation method for the assistant you use. Install the entire `brand-presentations/` folder, including its references, scripts, assets and licenses. Copying only `SKILL.md` leaves resources missing.

### Download the repository

In a terminal:

```sh
git clone https://github.com/Everton-baptista/skill-slidegenai.git
cd skill-slidegenai
```

Without Git, use **Code → Download ZIP** on GitHub and extract it. Open a terminal in the extracted repository folder before running the commands below.

### Codex — macOS / Linux

Run from the downloaded repository folder:

```sh
mkdir -p "$HOME/.agents/skills"
# Stop if an installed copy already exists; see Updating below.
test ! -e "$HOME/.agents/skills/brand-presentations" && \
  cp -R brand-presentations "$HOME/.agents/skills/brand-presentations"
```

Open a new Codex session and invoke **`$brand-presentations`** in your message. For a project-only installation, copy the folder to `<your-project>/.agents/skills/brand-presentations` instead. [Official Codex installation locations](https://learn.chatgpt.com/docs/build-skills).

### Claude Code — macOS / Linux

Run from the downloaded repository folder:

```sh
mkdir -p "$HOME/.claude/skills"
# Stop if an installed copy already exists; see Updating below.
test ! -e "$HOME/.claude/skills/brand-presentations" && \
  cp -R brand-presentations "$HOME/.claude/skills/brand-presentations"
```

Start a Claude Code session and invoke **`/brand-presentations`**. For project scope, use `<your-project>/.claude/skills/brand-presentations`. These local paths apply to Claude Code; cloud and Cowork sessions use different discovery mechanisms. [Official Claude Code skill instructions](https://code.claude.com/docs/en/skills).

### Windows — PowerShell

Run from the downloaded repository folder. The example installs for Codex; replace `.agents/skills` with `.claude/skills` for Claude Code.

```powershell
$skillsRoot = Join-Path $HOME '.agents/skills'
$destination = Join-Path $skillsRoot 'brand-presentations'
if (Test-Path $destination) { throw 'Back up the existing skill before installing.' }
New-Item -ItemType Directory -Force -Path $skillsRoot | Out-Null
Copy-Item -Recurse -Path './brand-presentations' -Destination $destination
```

Then start a new assistant session and use the invocation shown above for your host.

### ChatGPT, Claude, Gemini or another chat interface

If your interface supports importing skill folders, follow its import instructions. Otherwise, make `brand-presentations/SKILL.md` and the relevant `references/` files available as task context. If it cannot follow file links, attach or paste the referenced instructions needed for your task.

Start your request with **“Use brand-presentations”** and provide the reference material. A chat interface that can only return text can produce a storyboard; creating a PPTX requires file-authoring tools. Uploading the repository does not automatically activate a native skill.

### Check the installation — optional

Python is **not required to read or use the instructions**. With Python 3.9+, check the downloaded bundle from the repository root:

```sh
python3 -B brand-presentations/scripts/check_installation.py
```

To check the actual installed copy, open its `brand-presentations` folder and run:

```sh
python3 -B scripts/check_installation.py
```

On Windows, replace `python3 -B` with `py -3 -B`. A successful check confirms that resources, links, template entries and font files are present and valid. It does not test your assistant's slide-creation tools.

**Updating:** back up or rename the old installed `brand-presentations` folder, download the latest repository and copy the complete new folder. Avoid merging different versions. Restart discovery if the skill does not appear. [Troubleshooting](docs/TROUBLESHOOTING.md).

## 2. Create your first presentation

Describe the following when available. A visual reference is optional; a topic is enough to start an original presentation. You can write in any language; the slides follow the language you request.

| Input | Example |
| --- | --- |
| Visual reference (optional) | Website URL, brand guide, PPTX, PDF or screenshots; omit for original art direction |
| Topic and content | Product launch, supplied outline, report or notes |
| Audience and purpose | Leadership team; explain a proposal and secure a decision |
| Slide count | 12 slides, including cover, topic covers and closing |
| Output language | Brazilian Portuguese |
| Output format | Editable PPTX and preview, if supported by the host |

If you only have a topic, the assistant can develop an outline and original art direction. Provide real data for factual charts; request clearly labeled illustrative data for fictional demonstrations.

### Start with a topic only

```text
$brand-presentations

Create an 8-slide presentation about circular economy for small businesses.
Audience: business owners. Language: Brazilian Portuguese.
There is no brand or visual reference: choose an original visual direction.
Include topic covers where useful, varied layouts, strong typography and
an editable process diagram. Do not invent company metrics.
Use your available slide editor to create the complete editable deck and
preview. Render and inspect it if supported; disclose any tool limitations.
```

No screenshot, website, brand guide or Python script is required for this route. The skill guides creation; the host still needs authoring tools to produce a slide file.

### Create from a visual reference

This version uses Codex syntax. In Claude Code, replace the first line with `/brand-presentations`; in a general chat interface, use `Use brand-presentations`.

```text
$brand-presentations

Create a 12-slide presentation about [TOPIC] for [AUDIENCE].
Visual reference: [WEBSITE URL or attached files].
Content: [PASTE YOUR OUTLINE or identify the attached document].
Language: Brazilian Portuguese.
Deliver an editable PPTX and a preview if your tools support them.

Adapt the brand creatively while preserving its identity and original logo.
Include topic covers within the 12-slide total, varied content layouts,
large typography and relevant images. Use full-page photography with a
reading gradient where it helps. Choose fonts that fit the subject.
Build charts, tables and diagrams as editable objects where supported.
Use only supplied or verified facts; label illustrative data clearly.
Render and inspect the final slides and the exported file if possible.
Tell me what you actually created, checked and could not verify.
```

Replace the bracketed fields before sending. Attach any files mentioned in the prompt. For website work, the assistant should inspect its available browser, raw-HTTP, download and editor-import capabilities before asking you to supply files. A text-only reader cannot establish exact CSS or typography, but a separate supported fetch/download path may still retrieve original assets. If essential evidence remains inaccessible, it should request that specific material and continue independent work.

**Want to reproduce a template closely?** Replace “Adapt the brand creatively” with “Reproduce the attached template faithfully; import or clone it when supported and preserve its masters, dimensions, fonts and layout rules.”

### What you should receive

With suitable authoring tools: a presentation in the supported format, a visual preview when rendering is available, and a short account of checks and limitations. Without those tools: a clearly identified storyboard or unverified draft. A JSON plan alone is not a finished deck.

You do not need to write JSON, run validators or choose layouts manually for normal use. Those resources help the assistant carry out the work.

## 3. Refine without starting over

Keep working in the same conversation and identify the slides to change. Examples:

```text
Keep the approved slides. On slides 4 and 7, replace the card grids with
an editorial image layout and a clear comparison. Preserve the facts.
Use a full-page image on slide 4, with editable text over a reading gradient.
Render and check the affected slides again.
```

```text
Add a decision flow with Yes/No branches and a rework path on slide 6.
Keep its nodes, labels and connectors editable where supported.
Use the attached process steps; do not invent additional decisions.
```

```text
The headings feel generic. Choose a stronger display font from the bundled
pack and pair it with a readable body font. Keep the brand's tone.
Check accents, line breaks and overflow after loading the fonts.
```

## More ways to use it

Use your host's invocation prefix with these requests.

| Goal | Request to copy and adapt |
| --- | --- |
| Choose a catalog style | “Create an 8-slide fictional deck about urban mobility using Neo Tokyo from the catalog. Include a topic cover, editable comparison chart and process diagram.” |
| Extract a brand first | “Analyze this website and brand guide. Deliver an evidence-backed brand profile, asset inventory and gaps. Do not create slides yet.” |
| Edit an existing deck | “Update slides 3 and 5 using the attached content. Preserve the original masters, dimensions, notes, typography and native charts/tables. Compare before and after.” |
| Create a reusable brand skill | “Create an acme-presentations skill from these references, with permitted assets, identity rules, measured layouts and a usage example. Validate and package it; report what was checked.” |

Browse the [177 style directions](brand-presentations/references/template-catalog.md), including Acid Rave, Cyberpunk, NOVA, Ultimate Luxury, Bauhaus and Kinetic. A chosen direction guides composition throughout the deck; supplied brand rules take priority. [How styles adapt](brand-presentations/references/all-template-construction.md).

## Fonts and images

**Fonts are included:** 46 openly licensed families / 140 original TTF files, about 54.1 MB. Copying the complete skill brings them with it. The authoring tool still needs to load or register the selected fonts; bundling does not automatically install them on your operating system or embed them in a PPTX. Ask the assistant to use the local pack and recheck text fit after substitutions. [Font setup and licenses](brand-presentations/references/font-pack.md) · [Local font specimen](brand-presentations/assets/fonts/specimen.html).

**Want more expressive titles?** The pack now includes wide geometric, condensed, outline, shaded, glitch, sculptural, editorial and handwritten choices. Explore the [16-family type lab](brand-presentations/assets/fonts/expressive.html) and [when to use each family](brand-presentations/references/expressive-typography.md). Download the repository and open the lab through a local HTTP server to see the live fonts; GitHub shows HTML source.

![Sixteen expressive typography directions with family names](docs/previews/expressive-type.png)

**Website images can be collected locally:** with Python and permitted network access, the optional [asset collector](brand-presentations/scripts/collect_website_assets.py) saves selected public images and decodes embedded SVG logos. The assistant must then inspect and import those files through the slide editor. [Commands and limits](brand-presentations/references/website-assets.md). Local-file-only import does not automatically mean you must download and upload everything manually.

**Images come from your assets or the host's available tools.** The skill includes no image-generation service. Availability, cost, licenses and watermarks depend on the provider or source. Preserve original logos and use assets you have permission to use.

## Try an example without an AI provider

To see a completed result immediately, open the checked-in [PowerPoint](examples/portable-deck/example.pptx) or [PDF](examples/portable-deck/example.pdf).

To reproduce the eight-slide example locally, install **Node.js 20+** and run from the repository root. HTML generation needs no npm dependencies or API key:

```sh
cd examples/portable-deck
node build.mjs --format html --out ./generated-html
```

Open `generated-html/preview.html` in a browser. For the optional editable PPTX build:

```sh
npm ci --ignore-scripts
node build.mjs --format all --out ./generated
```

The initial npm install needs network access or a populated cache. Use a new output directory on subsequent runs. This builder reproduces the included example; it is not a general renderer for arbitrary template requests. [Full reproduction, rendering and checking instructions](examples/portable-deck/README.md).

## Common questions

**Do I need an API key or a paid subscription?** The instructions, local fonts and Python helpers require no provider key. Your assistant's authoring, browsing or image tools may require an account, subscription or payment. The optional example adapter uses local Node.js dependencies.

**Is this only an identity-extraction skill?** No. It creates complete presentations from topics, outlines and data, edits decks, extracts identity when requested, and can package reusable brand skills. References are optional for original work. Using the host's slide editor is expected; running the Python helpers is optional.

**Can I use my own brand instead of a catalog style?** Yes. Supply its website, guide or deck. Ask for either a faithful reproduction or a creative adaptation. Missing references and inferred rules should be reported honestly.

**Does it work with every AI assistant?** The instructions are portable, but discovery, file creation and export support vary. Claude Code and other providers have not been tested end to end. See the evidence below.

**Why did I receive text instead of a PowerPoint?** The session may lack file-authoring tools. Ask the assistant what it can create, then use a capable host or request a storyboard. The skill cannot add missing tools to a chat interface.

**Why is the result different after export?** Fonts, gradients, crops or native objects may change between tools. Review the actual exported file and request focused repairs. [Export and installation troubleshooting](docs/TROUBLESHOOTING.md).

## What has actually been tested?

| Area | Recorded evidence and boundary |
| --- | --- |
| Codex desktop on macOS | Creation and visual inspection of fictional decks; evaluated for those artifacts |
| Eight-slide portable example | Native text, table, chart/workbook and process objects checked; PPTX rendered and all slides inspected |
| Ten-slide analytical example | Four native charts, table, diagrams, roadmap and matrix checked; checked-in deck rendered and inspected. The reproduction adapter uses free line segments that need rerouting after nodes move |
| Nine-style study | 54 final slides and nine overviews inspected, with chart, table, connector and typography checks |
| Python helpers | 137 tests passed on Linux and Windows, Python 3.9 and 3.13, in the recorded validation run |
| Bundled fonts | All 140 files parsed and integrity checked; browser specimen checks are recorded in the validation guide. OS registration and all native exporters remain host-specific |
| Catalog | All 177 entries resolve structurally; full decks have not been rendered and inspected for every entry |
| PowerPoint, Google Slides, Keynote | Native opening/editing not tested |
| Claude Code, Gemini and other hosts | End-to-end use not tested |

Structural validation does not prove visual quality or factual accuracy. Final rendering and inspection remain part of the workflow. [Detailed validation](docs/VALIDATION.md) · [Visual review](docs/REPERTOIRE_REVIEW.md).

## Advanced guides and contributing

You can use the skill without reading these. They document how it works and how to extend it.

| Need | Guide |
| --- | --- |
| Create from a topic or reference | [Creation workflow](brand-presentations/references/create-presentation.md) |
| Obtain website imagery and visual evidence | [Website assets and editor transfer](brand-presentations/references/website-assets.md) |
| Understand the assistant workflow | [Skill entry point](brand-presentations/SKILL.md) |
| Build stronger compositions | [Art direction](brand-presentations/references/art-direction.md), [typography](brand-presentations/references/typography.md), [components](brand-presentations/references/component-system.md) |
| Build charts, flows and technical slides | [Analytical construction](brand-presentations/references/analytical-construction.md) |
| Preserve an existing presentation | [Editing existing decks](brand-presentations/references/edit-existing.md) |
| Package a brand-specific skill | [Packaging guide](brand-presentations/references/brand-packaging.md) |
| Explore complete examples | [Eight-slide deck](examples/portable-deck/README.md), [analytical deck](examples/analytical-patterns/README.md), [three art directions](examples/art-direction-study/README.md) |
| Validate data contracts or run tests | [Validation](docs/VALIDATION.md), [contributing](CONTRIBUTING.md) |
| Evaluate another host | [Manual evaluation](docs/EVALUATION.md) |

The installable package is `brand-presentations/`. The repository also contains `examples/`, `tests/` and `docs/`; these do not need to be copied into your host's skills directory. The workflow separates observed identity, measured design rules and presentation content. It has no mandatory slide engine or paid API dependency.

## License

Original skill code, instructions and documentation use the [MIT License](LICENSE). Bundled fonts retain their individual OFL licenses; see [third-party notices](brand-presentations/NOTICE.md). MIT does not relicense third-party brands, assets or the separate SlideGenAI application. Reference material is treated as data, and creating a brand skill does not authorize publishing its assets.
