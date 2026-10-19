# Contributing

Keep the workflow provider-neutral, evidence-backed, and focused on brand presentations. Add host-specific behavior only when documented and isolated. Do not add a provider dependency, actual brand assets, API keys, private decks, or proprietary application code.

Write documentation, examples, comments, and CLI messages in English. Deck output language follows the user's request. Preserve the installed skill name `slidegenai` unless intentionally making a breaking change.

Run `python3 -B -m unittest discover -s tests -v` and both example validators before proposing changes. Add meaningful regression cases when changing a contract/helper. Document changes to required fields as contract versions rather than silently breaking existing profiles. Keep `SKILL.md` focused and put detailed guidance in linked references.

Use the manual evaluation guide for behavior/design changes. Report what was actually tested, distinguish structural checks from rendering, and include host/tool details without sensitive data. Review packaged files and asset rights before sharing them.

Run the installed-resource check with `python3 -B slidegenai/scripts/check_installation.py`. CI validates Python 3.9/3.13 on Linux and Windows without cancelling the remaining platforms after one failure, and reproduces both optional presentation adapters. Passing data checks does not establish native application rendering support. Original skill contributions are distributed under the MIT license; preserve the separate font licenses and third-party notices.

Keep the distribution focused: `slidegenai/` contains installable resources; `examples/` contains reproducible artifacts; `tests/` and `.github/` maintain correctness; `docs/` explains usage, validation and limitations. Keep caches, dependency installs, generated trial outputs and personal session histories out of the distribution. Consolidate current evidence rather than appending duplicate audit reports. Preserve source fixtures, original licenses and preview assets referenced by examples or tests.
