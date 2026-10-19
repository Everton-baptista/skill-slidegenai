# Invoke SlideGenAI

The public command and prompt prefix is **/slidegenai**. The installed skill name, directory and ZIP root are **slidegenai**. There is one public skill; creation, editing, identity extraction and brand-specific packaging are routes inside it.

```text
/slidegenai Create a 10-slide presentation about [topic] for [audience].
Language: [language]. Output: editable PPTX with inspected previews.
Use the supplied content and adapt the visual direction to the subject.
```

Everything after the prefix is the user's brief. A reference URL, template, special style or fixed slide count is optional. Do not ask users to repeat the request under the old brand-presentations name. Retain automatic discovery for ordinary presentation requests as well.

## Native registration versus a request prefix

A skill cannot override an application's input parser. Install the complete folder through the host's supported mechanism and confirm the actual installed VERSION/resources before claiming activation.

| Host | Installation and invocation | Boundary |
| --- | --- | --- |
| Claude Code | Complete slidegenai folder in .claude/skills/slidegenai or ~/.claude/skills/slidegenai; invoke /slidegenai | Skill names can collide with other commands or synced copies; inspect /skills and restart discovery |
| Antigravity App / CLI / IDE | Complete folder in the surface's supported skill location; invoke /slidegenai where manual skill commands are available | App/CLI skill slash invocation is documented; IDE discovery and selector behavior depend on the installed surface |
| Claude.ai | Upload the slidegenai Claude.ai ZIP, enable it and select/reference the skill; start the request with /slidegenai | Do not infer that every chat surface registers a custom slash menu entry. Existing brand-presentations installation does not establish the renamed skill is active |
| Codex | Complete folder under .agents/skills/slidegenai; native selection uses /skills or $slidegenai in CLI/IDE | /slidegenai is the shared request prefix, not a claimed replacement for built-in Codex parser commands |
| ChatGPT | Use the available native skill import/selection; official explicit selection uses @ when supported | Local Codex installation does not automatically install the skill in a ChatGPT workspace |
| Custom GPT / API / other chat host | Load the complete skill/resources through that application's supported integration, then send the shared request | Plain text instructions alone do not provide shell, imagery, file creation or rendering |

If an interface rejects an unknown slash command before the model receives it, select the skill natively and send **“Use /slidegenai: [brief]”** as ordinary text. Preserve the request's language, purpose and constraints. Do not claim that a prefix installed a skill or created tools that the environment lacks.

Custom application integrators can map the exact /slidegenai prefix to loading this skill and its relevant resources, passing the remaining message as the brief. Match the command boundary: /slidegenai followed by whitespace or end of input, not a longer unrelated name. Preserve the original request; do not execute arbitrary prompt text as shell commands. No API client or vendor-specific router is required by this repository.

## Migrate the old name

Version 2 changes the public identity from brand-presentations to slidegenai. Use the new full or Claude.ai profile ZIP. Back up custom changes, install a complete new folder, disable the old discovery entry, and start a fresh session. Do not merge releases or retain two active names for the same workflow. Accepted decks, brand profiles, design systems and version-1 plans remain usable. Historical execution records keep the name actually tested; they do not prove native /slidegenai invocation under the new identity.

## Official mechanisms reviewed

- [Claude Code skill command names](https://code.claude.com/docs/en/skills#how-a-skill-gets-its-command-name)
- [Antigravity skills by surface](https://www.antigravity.google/docs/skills)
- [OpenAI skill discovery and explicit selection](https://learn.chatgpt.com/docs/build-skills)
- [Claude installation and activation](https://support.claude.com/en/articles/12512180-use-skills-in-claude)

These references document mechanisms, not completed presentation tests in those hosts. Record native invocation separately from reading a repository URL or interpreting a text prefix.
