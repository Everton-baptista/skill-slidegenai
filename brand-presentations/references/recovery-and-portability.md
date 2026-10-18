# Recovery and portability

Use only the host's available capabilities. A model switch does not provide a browser, an image generator, filesystem access, or an exporter. Portable instructions cannot guarantee identical output across providers.

## Checkpoints

Keep profile, source/asset inventory, deck plan, output paths, accepted slide IDs, global order, current section, unresolved issues, and existing remote job IDs. Avoid secrets in these records. Resume from accepted work and repair affected slides rather than regenerating the deck.

If a brand profile changes, review the change before updating its hash and applying it to accepted slides. Treat formatting-only edits as a new hash too. Do not silently mix versions between batches.

## Batch normalization

A new opening cover in a middle batch may become a section cover if the meaning fits. An early closing may become an insight. Renumber global positions, keep stable IDs, reconcile total count, and preserve required content. Do not blindly concatenate independent decks.

## Failure handling

Inspect the actual error and existing output. For interrupted remote responses, check job state before retrying to avoid duplicated charges. Use no more than three targeted repair attempts per affected slide/export issue. Stop repeating an unchanged failure, preserve useful files, and report the remaining cause.

A watermark or provider logo can come from current service behavior. Inspect actual files and provider requirements; do not assume a parameter guarantees clean output. Choose permitted alternative assets/providers when available. Do not remove required attribution or promise free/unlimited generation.

## Format fallbacks

Prefer native editable text/charts. When an exporter cannot reproduce a critical gradient or visual effect, use a supported equivalent or rasterized background with editable foreground text where possible. Disclose rasterization, font substitutions, external dependencies, and remaining export differences.

Without rendering, deliver a storyboard/source or unverified draft. Without file creation, deliver usable instructions and content in the response. Clearly distinguish completed output from intended output.
