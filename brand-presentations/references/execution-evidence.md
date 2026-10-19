# Observable execution evidence

Keep a concise execution record in the working output, not inside the installed skill. This is a review trail, not an automatic beauty score. Do not manufacture observations to fill fields. Paths must identify real files or accessible artifact links; record unknowns explicitly.

At startup record the host/product and version when exposed, skill VERSION (and bundle/archive hash if available), installation mode (native / files read only / unconfirmed), resources actually read, and relevant tools. Probe capabilities through supported operations, not an unsupported claim that a product always has or lacks a tool.

For each deliverable record:

- Brief: purpose, audience, language, exact count, required content, imagery, editability and output formats; inferred choices separately.
- Artifact location, format and count actually produced. Different exports/native decks are different verification targets.
- Fonts: requested face/weight, resolved face, evidence from the real renderer/editor, substitutions and reflow. Unknown is valid; font names in source alone are not resolution evidence.
- Assets: source/provenance, local file when applicable, slide IDs where inserted and actual preview confirmation. Acquisition and import are separate stages. Record required missing assets.
- Editable content: objects and cells/series/connectors checked, inspection method, source data preserved and any flattening limitations.
- Visual inspection: renderer/tool, real preview paths or accessible views, every inspected slide ID and overview, observed issues, corrections and reinspection. Check crop, collisions, contrast, hierarchy, content fit and rhythm. Do not claim inspection by listing filenames alone.
- Remaining blockers with the actual failed operation and useful recovery; avoid dumping secrets or private session logs.

Completion states apply to each artifact:

| State | Meaning |
| --- | --- |
| Verified for this run | Essential brief requirements satisfied; actual artifact and previews inspected; remaining limitations disclosed |
| Partial | An essential content, imagery, object or format requirement is missing |
| Visually unverified | Artifact exists but final visual output could not be inspected; combine with Partial if applicable |
| Blocked | Required next operation cannot proceed with available permitted tools/access |

Report the strongest evidence actually obtained, not a provider-wide certification. A native deck can remain unverified while its inspected PPTX companion is verified for this run. Validators only check declared data. Do not ask the user to check layout when the session can inspect it itself.
