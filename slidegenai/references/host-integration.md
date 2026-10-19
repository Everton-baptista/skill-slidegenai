# Host integration and the shared skill format

The portable core follows [Agent Skills](https://agentskills.io/specification): one folder named slidegenai, SKILL.md with name and description, and relative references/scripts/assets loaded as needed. Keep engine-specific instructions in the applicable reference. Do not add tool preapprovals, proprietary paths, network bypasses, paid dependencies or a second public skill just for another host.

Use **/slidegenai** as the shared request prefix. Native activation varies; read [invocation by host](invocation.md) for supported selectors, parser limits and migration from brand-presentations.

## Antigravity

Current official locations are <workspace>/.agents/skills/slidegenai or ~/.gemini/config/skills/slidegenai. The older .agent/skills location remains backward compatible; prefer the current path. Copy the whole folder, start/refresh skill discovery and invoke /slidegenai where supported when testing activation. Read actual files and VERSION before claiming activation. [Official Antigravity skills](https://antigravity.google/docs/skills?app=antigravity-ide).

Use exposed filesystem, authoring and browser/render tools, checking capabilities in this workspace. Browser access does not imply the shell can retrieve every image; screenshots do not establish editable objects. Run the creation/editing and execution-evidence workflow with real exports and previews. Installation documentation has been reviewed; Antigravity authoring has not been tested by this repository.

## Codex

Local discovery uses <project>/.agents/skills/slidegenai or ~/.agents/skills/slidegenai. Invoke $slidegenai or select the available skill. The optional agents/openai.yaml is Codex UI metadata; other hosts need not interpret it. It does not replace SKILL.md. Use available presentation tools and native format inspection, keeping asset download, image insertion and export verification distinct. [Official Codex skill documentation](https://learn.chatgpt.com/docs/build-skills).

## ChatGPT and GPT-based integrations

GPT is a model family, not an installation directory. Identify whether the user means ChatGPT, Codex or an API application. In eligible ChatGPT workspaces, use the available Skills creation/upload controls and confirm activation; availability and installation vary by workspace/product. Do not assume a local Codex folder syncs into ChatGPT, or that an ordinary Custom GPT instruction field installs a multi-file skill. If native import is absent, make SKILL.md and the relevant references available as context and label this context-only use. The host still needs tools to create and inspect files. [Official OpenAI skill concepts](https://developers.openai.com/plugins/concepts/skills).

For API/custom agents, integrate only through the application's documented skill/file discovery and tool interfaces. No API client, key or paid service is required to read this skill. Do not advertise an API implementation as tested merely because the shared manifest is valid.

## Other hosts

Consult the host's current official documentation for discovery paths, accepted archive shape, supporting files, invocation, dependencies and tools. Install the full directory through that supported mechanism; do not invent a shared universal path. If it only reads text, provide a storyboard or a clearly limited draft, not a claimed PPTX. Updates replace a backed-up complete version; avoid mixing releases or duplicating a skill name across discovery paths.

Across hosts, verify activation, resource reads, fonts, assets, authoring, native editability, rendering and correction separately. Use [execution evidence](execution-evidence.md) to record the actual environment; compatibility of the instruction format is separate from tested output quality.
