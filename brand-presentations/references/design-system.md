# Design system contract, version 1

This optional file bridges identity and slide construction. Keep it beside the profile and plan. Existing profiles/plans remain valid without it. It is a design specification, not a renderer.

Required fields:

- `version`: integer 1.
- `canvas`: positive finite `width`, `height`, and `unit` (`px` or `pt`).
- `colors`: nonempty object mapping semantic names to opaque `#RRGGBB` values.
- `typography`: nonempty object mapping roles to `family`, positive `size`, positive `line_height` ratio, and optional boolean `bold`. Sizes use canvas units.
- `spacing`: object mapping names to finite nonnegative measures in canvas units.
- `logo`: `asset` (relative existing file or null), `clear_space` (nonnegative), and a `backgrounds` array of semantic color names. Null means unavailable, not permission to invent a logo.
- `layouts`: nonempty array of unique `id` and nonempty `slots`. Each slot has a per-layout unique `id`, `kind` (`text`, `image`, `logo`, `shape`, `chart`, `table`), x/y/width/height inside the canvas. Text slots reference `type_role`; optional `color_role` and `background_role` reference colors.
- `decisions`: nonempty array of `rule` and evidence using the brand profile's observed/inferred/user-approved contract. Layout choices may be inferred, never mislabeled as official.

A deck linked with `--design` must use the same canvas/unit, existing layout IDs, and compatible declared slot kinds when an element includes `slot_id`. Actual content/geometry stays in the deck plan; repair layouts intentionally rather than forcing every slide into one master.

The validator checks declared measures, references, assets, and evidence. It does not measure fonts, certify logo clear space visually, or enforce a universal aesthetic. See the repository example for complete data.

Optional `art_direction` working metadata is described in [adaptive art direction](art-direction.md). It records the concept and controlled latitude; it does not change version 1 or impose an additional required field. Layout coordinates remain the construction contract.
