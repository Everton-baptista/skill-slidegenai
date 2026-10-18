# Adaptive art direction

Use for a new composition, a creative adaptation, or a request for more authored, organic, distinctive work. For exact reproduction or a small edit, preserve the chosen template and avoid an unsolicited redesign.

## Start with the subject

Read the actual content and identify the audience's task: understand evidence, feel a place, compare alternatives, follow a mechanism, or consider a proposition. Note the evidence available and the emotional register appropriate to the situation. A clinical result, a garden proposal, and a cultural essay should not inherit the same composition simply because all belong to one brand.

Write a short private concept in concrete language. Example: “An open field notebook about places for learning, with images observed closely and generous pauses.” Translate that concept into specific choices: a photo crop that preserves the reading table, a serif headline with conversational line breaks, and an offset caption linked to the visible subject. “Premium,” “beautiful,” “organic,” and “Awwwards” alone are not executable directions.

Keep brand invariants and creative latitude separate. The user and reference control colors, logo usage, required fonts, factual content, and requested structure. Composition can adapt within those constraints. Do not import a fashionable palette or serif font just because a direction calls for warmth.

## Explore where a real choice exists

For a new deck direction, consider two or three meaningfully different compositions for one representative slide before building the entire deck. Keep the same factual proposition, source data, and qualifications. Change the visual argument: image-led observation, typographic proposition, or structured evidence. Different colors on the same card grid are not different concepts.

Choose and continue autonomously when the user has delegated design. Do not add an approval gate or require a paid image-generation batch. For strict templates or trivial edits, skip this exploration. Reuse supplied imagery when comparing compositions; this is a controlled comparison, not a rule to repeat one photo throughout a deck.

## Choose a grammar by meaning

| Content need | Possible visual argument | What would undermine it |
| --- | --- | --- |
| Evidence or operational decision | Aligned native evidence, explicit units, calm hierarchy | Decorative cropping of labels, fake metrics, gratuitous textures |
| Place, experience, people, culture | Specific documentary image, human scale, irregular spacing when useful | Generic handshake imagery or an irrelevant nature metaphor |
| Editorial proposition | Dominant type, intentional line breaks, a strong crop or deliberate empty area | Repeated stock subtitles and a compulsory photograph |
| Relationship or mechanism | Native diagram with deliberate grouping/paths | Decorative arrows that imply unsupported causality |
| Material, ecological, tactile context | Observed texture or image edge, soft cadence, grounded proportions | Automatic beige/green palette, floating blobs, fake paper distress |
| Institutional reference | Measured brand hierarchy with controlled variations | Forcing softness, disorder, or a different institution's signature |

These are lenses, not a closed theme menu. Combine or depart from them when the content warrants it. Creativity should come from a specific relationship among message, image, and space, not random layout selection.

## Photograph-led pages and typographic contrast

When the subject or user calls for immersive imagery, consider a full-canvas photograph with live text over a directional gradient. Choose this because the photograph carries the idea, not to meet a quota. Keep quieter text/evidence pages so the overview has pauses. A full-page image, a split editorial page, a typographic statement and a native evidence page can belong to the same brand without becoming random themes.

Choose the crop and reading region together. Identify faces, products, signage and factual evidence before placing text. Leave the main subject visible; move the text, change the crop or choose another image if they compete. Do not infer the contents from an asset filename. A historical anniversary banner must not silently become a current age claim.

Use the gradient as a reading layer: strongest behind text, fading toward the photograph's focal area. A bottom gradient may protect a low headline; a lateral gradient may protect a left or right column. Check every line, logo and page marker against its actual local background. Start with brand-compatible colors and the least opacity that gives reliable reading. A visible rectangular panel is also valid when the reference or export constraints call for it.

Create contrast through size, weight, line breaks and whitespace first. Pair families only when supported by the brand or the user's direction. A brand built on sans-serif type should not inherit a previous client's serif. Large numerals, a light headline and a bold key phrase can provide contrast within one family. Confirm accents and mathematical symbols in the final export; replace ambiguous notation with explicit words while preserving its meaning.

Keep image, overlay and text independently editable when the host supports them. Do not flatten a whole slide to achieve the look. See the reading-surface recipe in [components](component-system.md) and export inspection in [quality review](quality-review.md).

## Organic when appropriate

Organic can mean a gentle change in density, asymmetry balanced by whitespace, a crop that follows the subject, a soft image edge supported by the reference, or typography with a natural reading cadence. It need not involve a leaf, blob, handwritten font, rounded card, or earthy palette.

Use one justified gesture rather than accumulating effects. Keep a stable invisible alignment structure so irregular composition remains legible. Place irregularity in a photograph, contour, spacing, or image/text relationship while keeping charts, tables, units, and logos precise. Do not distort factual geometry or brand assets.

Use actual source material for illustrative/decorative imagery. Do not draw fake botanical illustrations, simulated paper, or “handwritten” human evidence to suggest authenticity. When a tool cannot export a mask or texture faithfully, use a permitted pre-rendered image layer and preserve native text/evidence; record the limitation. Do not install a dependency merely to add decoration.

## Make the whole deck intentional

Plan a rhythm appropriate to the narrative: establish, develop, substantiate, pause, conclude. It may contain repeated evidence layouts and a restrained closing. Avoid a rigid light/dark alternation, a fixed quota of photographs, or forced novelty on every slide.

Choose one or two recurring relationships as the deck's signature, such as a shared baseline between captions and image edges or a recurring typographic proportion. Allow the composition around them to change. Topic covers act as real pauses, not empty repeated pages that consume required content.

Optionally record `art_direction` in `design-system.json`: `concept`, `audience`, `register`, `signature`, `fixed`, `flexible`, and `avoid`. The last four are arrays of specific decisions. An optional `organic` object uses boolean `use` and nonempty `reason`. This working record is not an official brand guideline or a new required schema version.

For a non-obvious slide choice, add `visual_intent` to that slide in the plan: `purpose`, `focal_point`, `composition`, `density` (`sparse`, `balanced`, `dense`), `image_role` (`none`, `evidence`, `context`, `metaphor`, `texture`), boolean `organic`, and `rationale`. Add `repeat_intent` when repeated imagery/layout is a deliberate comparison or recurring evidence frame. Use concise records only when they improve the work; do not turn a quick edit into a questionnaire.

## Write in a specific voice

Use the subject's real names, useful distinctions, supported observations, and appropriate level of detail. A title may name a topic, explain a finding, or make a clearly interpretive proposition. Keep an existing title when it works. Do not convert every slide into a slogan, a forced three-part list, or a “journey” frame. Shorten abstract promotional language into the actual claim, and remove subtitles added only to fill a slot. Natural language may be formal, technical, warm, or spare according to the audience; there is no universal punctuation blacklist that makes writing human.

## Editorial critique

After rendering, ask:

- What is the first thing a reader sees, and is it the point of the slide?
- Does the image contribute something specific that the text cannot?
- Are line breaks, crop, spacing, and hierarchy deliberate at final viewing size?
- Does an irregular gesture help this subject, and do facts remain precise?
- Could this unchanged composition be pasted onto any unrelated subject? If so, identify the specific missing relationship rather than adding decoration.
- Is any headline, quote, number, annotation, or badge generic filler or invented human evidence?
- Does the overview have meaningful changes of pace while keeping identity coherent?

Remove what does not support the message. Cards, symmetry, grids, and large type remain valid when they serve the request. Do not enforce a universal ban or equate minimalism with originality. There is no automatic “looks human” test, beauty score, or guarantee of total novelty. Report actual decisions and inspected results, not those claims.
