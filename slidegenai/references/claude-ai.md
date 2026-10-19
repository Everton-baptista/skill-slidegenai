# Claude.ai execution

Use this route only in Claude.ai. Claude Code is a different runtime; do not infer its tools or network access here.

## Load and establish capabilities

Native installation: generate the Claude.ai distribution with `scripts/package_skill.py --profile claude-ai --output /path/out/slidegenai-claude-ai.zip` and upload that ZIP in Customize → Skills → + → Create skill → Upload a skill, then enable it. Code execution/file creation and organizational permissions must permit skills. Reading a GitHub link or attaching its README is not native installation. UI labels may change; follow the current Skills controls. For updates, back up custom changes and replace the uploaded skill through the available management controls, enable it, then start a fresh conversation and confirm its VERSION. Do not merge two releases.

Read the installed VERSION, optional DISTRIBUTION.json, SKILL.md and task-route references. The Claude.ai profile retains all 46 families and original licenses, selecting normal 400/700 faces where supplied and expressive specimen faces; other faces remain in the complete repository. Its font filenames are normalized for upload; original paths and unchanged binary hashes remain recorded. Read the actual font manifest rather than assuming every full-pack weight is installed. The full 140-font archive exceeded the 30 MB uncompressed upload limit observed in the tested Claude.ai session. Record exactly which references and selected font/style resources were opened. If only a web copy can be read, say that native activation and bundled resources are unconfirmed.

Identify the tools actually exposed in this conversation: native Slides authoring/editing, container filesystem/code, web reader/search, image generation, HTTP acquisition, file-to-editor image import, native preview/export and local rendering. Probe relevant paths with real operations, without bypassing network policy. A text reader can work while container DNS/download is restricted. A file saved in a container is not yet inserted into Slides.

## Build in this environment

Follow the brief and creation/art-direction references. Use the supported native editor when appropriate. For a supplied website, try supported asset transfer and the optional collector when network/code permit it; inspect originals before use. If the host cannot transfer essential photos, record the blocked requirement instead of silently replacing documentary imagery with a drawn icon. Original vector illustration is appropriate for conceptual requests that allow it.

For native Slides, inspect the actual rendered slides and overview through exposed preview/screenshot tools. If the native editor cannot expose a verifiable result, create an editable PPTX **inside this Claude session** using available file-authoring tools, render it here and inspect every slide plus the overview. Keep the native deck's status separate. Consult the host's own available presentation-tool documentation; do not invent an editor API or assume a fixed filesystem location. No paid API is required by this skill. If neither route can render, deliver a partial, visually unverified artifact with the concrete missing capability.

Font names are not proof of font use. Load/register bundled faces through supported mechanisms; inspect actual rendered/exported typography and any reported substitution. If the editor cannot load a selected face, use a confirmed available alternative, reflow the slide and inspect again. For HTML, wait for document.fonts.ready and load the exact declared face/weight with representative text; require a resolved face, not merely document.fonts.check on an absent family. Native Slides font availability must be verified independently of HTML/PPTX.

## Close with evidence

Use [execution evidence](execution-evidence.md). Record native and exported formats independently, with actual preview locations, inspected slide IDs, fonts, inserted assets and corrections. A filename, tool success, uninspected export or local browser approximation is insufficient to verify the native editor. Never ask the user to inspect available previews in place of doing that work. Preserve useful partial work if a required operation is blocked.
