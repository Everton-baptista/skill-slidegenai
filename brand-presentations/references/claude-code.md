# Claude Code execution

Use this route for the terminal agent, not Claude.ai Slides or Cowork.

## Install and load

Copy the complete brand-presentations folder into .claude/skills/brand-presentations in the target project, or into ~/.claude/skills/brand-presentations for personal use. Start a new session and invoke /brand-presentations. A repository cloned elsewhere is not automatically an installed skill. To update, back up and replace the entire installed folder rather than overlaying releases, then restart discovery. Read VERSION and the applicable references from the installed copy.

Check CLI authentication using the CLI's supported status command. The user handles login and credentials. Do not log secrets, bypass permissions, or assume the login state of a web session authenticates the CLI.

## Discover, build, inspect

Record actual tools and versions: filesystem/shell, available presentation libraries, browser/renderers, image source/generator, HTTP retrieval, font resolution and the requested export. Discover local supported packages/tools before choosing an adapter; there is no mandatory engine. Install optional dependencies only through permitted host workflows. Do not claim that bundled helpers generate slides; they validate, plan, acquire assets or package resources.

Create output in a new working directory, separate from the installed skill. Follow creation/art direction or template editing as requested. Website downloads must respect actual network policy; use supported routes and distinguish retrieval from successful insertion. Missing required photography makes the relevant output partial. Do not ask the user to upload public assets before trying the available permitted paths.

For PPTX, preserve native editable text/table/chart/diagram objects as requested. Render the actual final file with an available presentation renderer; inspect every resulting slide and the overview, correct fit and inspect changed slides again. Record renderer/version, warnings and known differences from the target application. A browser rendering of a separately authored HTML deck does not verify a PPTX export. Native object inspection complements visual review; it does not replace it.

Resolve actual fonts before measuring: register locally through a supported scoped method or choose a confirmed available face. For HTML, wait for font loading and check the exact face/weight has resolved. For PPTX, inspect the rendering and available renderer substitution reports or exported PDF font inventory, then fix identifiable substitutions and re-render. Do not certify font embedding or native PowerPoint rendering without checking it.

If authoring or rendering is unavailable, continue independent work and label the artifact partial or visually unverified. A JSON/storyboard is not a slide file. Keep the session's execution record using [execution evidence](execution-evidence.md). Run corrections in this same environment rather than treating a Codex-produced example as proof.
