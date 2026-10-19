# Typography as an art-direction decision

Read this when choosing fonts, modernizing a presentation, building a style repertoire, or responding to requests for outlined type, editorial labels or typographic contrast. Typography changes the composition; replacing Arial with a fashionable name at the end does not establish a typographic system.

## Choose from evidence, then from the message

1. In faithful-template mode, retain the source fonts, weights, casing and title geometry. Record missing fonts; an approximation is not exact reproduction.
2. In creative-adaptation mode, identify what the typography should communicate: urgency, technical precision, fashion, hospitality, experimentation or accessible teaching. Choose one display voice and a quieter reading voice. A third family may support genuine code, timestamps or short labels. Do not add families merely to maximize their count.
3. Inspect available fonts and actual weights in the destination environment. Record preferred family, resolved family, actual weight, fallback, availability and license/source. Never claim a font was installed, embedded or tested because its name appears in JSON.
4. Compose a real title, body paragraph, accented Portuguese words (`Ação, frequência, órgão, decisão`), numerals, table and chart labels. Render them in the destination tool before applying the choice throughout the deck.
5. Rebuild line breaks and frames after a family change. Width, cap height, x-height, ascenders and weight affect layout. A nominally identical font size is not a visually identical size. Compare the cover, chapter and closing together, then inspect all affected slides.

The optional [pairing catalog](typography-pairings.json) gives nine starting directions using fonts available from official Google Fonts specimen pages. These are design suggestions, not bundled fonts, a font installer, confirmed glyph coverage or cross-provider certification. Available host fonts may be used instead after visual verification. Mac system fonts used in a local study are not portable dependencies and must not be copied into the public skill.

## Give each role a job

| Role | Treatment | Check |
| --- | --- | --- |
| Display / cover | Condensed poster, expressive geometric or high-contrast serif, chosen for the topic | The actual project name remains readable; no accidental word fragmentation |
| Chapter | Scale or weight contrast, a clear section name, optional chapter number | Recognizable at a glance and consistent with the same presentation |
| Editorial headline | One thought, intentional line breaks, distinct image relationship | Does not cover a face or rely on a lucky crop |
| Body | Calm family, open counters, appropriate case and comfortable leading | Read a real paragraph at presentation size; never solve overflow by arbitrary shrinking |
| Label / slide tag | Short section, format, status or topic label; optional small filled or outlined frame | Meaningful label, adequate padding and contrast; no badges on every element |
| Evidence | Neutral body/numeric face, clear units, tabular numerals when supported | `0/O`, `1/l`, minus signs, decimal separators and legends are unambiguous |
| Quotation / accent | Optional italic or serif contrast within the established family pair | Marks an editorial role rather than adding unrelated decoration |

Useful starting ratios, not universal limits: cover 2.5–5× body; content headline 1.5–2.4× body; tag about 0.7–0.9× body. Use the canvas unit from the design system. Avoid hairline display faces for small projected text. Prefer actual condensed, italic and bold font files to artificial horizontal scaling, shear or simulated weights.

## Outlined, filled and layered headlines

Outlined type means transparent glyph interiors with a visible glyph stroke. A colored rectangle behind text is not an outline, and painting glyph interiors in the background color fails over photographs and gradients.

Use real native text fill/outline where supported. A useful pattern for a music or movement cover is a filled word, an outlined repetition, then another filled word with a controlled horizontal shift. Keep these separate live text objects with consistent content, baselines and family. Use a modest stroke that survives preview downscaling; inspect on the actual background. Do not use outlined body copy, chart labels or dense table cells.

If the selected host cannot produce reliable editable outlined text, record the limitation and use a filled typographic treatment. An optional vector outline may be used for a display word only when permitted, clearly recorded as a vector object with lost text editability. Keep accessible text/notes as appropriate. Never flatten the whole slide to obtain this effect.

Layered color echoes can support a Cyberpunk title. They must not blur essential copy or replace readable evidence. Kinetic typography can express rhythm through repetition, placement and scale in a static slide; it does not imply an animation was exported.

## Labels that belong to the story

A slide tag should answer something useful: `01 / SYSTEM`, `VISUAL ESSAY`, `PILOT`, `CHAPTER 02`. Its words come from the presentation, and its language follows the user. Use sentence case or short uppercase deliberately. Avoid invented status claims, noisy capsule collections and implementation details in the slide.

Use a native editable shape and native text, either as one supported shape or as explicitly grouped objects. Set padding and vertical alignment; measure the longest actual label. Long labels become a plain eyebrow line or a wider region rather than unreadably small text. Track section changes consistently across batches.

## Record the resolved decision

The existing design-system contract stays compatible. Optional metadata can capture the typography decision without inventing new required fields:

```json
{
  "typography_decisions": {
    "mode": "creative-adaptation",
    "display": {
      "preferred_family": "Barlow Condensed",
      "resolved_family": "DIN Condensed",
      "reason": "Locally available condensed display face for a night essay",
      "availability": "verified-on-current-host",
      "weight": "bold",
      "fallback_requires_reflow": true
    },
    "body": {"resolved_family": "Helvetica Neue", "weight": "regular"},
    "label": {"resolved_family": "Menlo", "weight": "regular"},
    "outline": {"requested": false, "native_text_tested": false},
    "tested_host": "Record the actual host and render date"
  }
}
```

The measured `typography` roles still hold the actual family and sizes used in the deck. This optional metadata does not make the existing validator a font resolver. Do not imply the preferred font was used when a fallback was rendered. Record font licenses before bundling or embedding any binaries; an installed proprietary font is not permission to redistribute it.

## Review the repertoire

Do not use the same display/body pairing across every showcase by habit. Compare the typography with color hidden: is luxury still quiet, technology still precise, fashion still editorial, and education still approachable? Shared body fonts can improve reading; display geometry and editorial roles can provide the distinction. Do not force novelty into a faithful brand template.

For each final presentation verify font resolution, accents, weights, line breaks, overflow, outline transparency, tag padding, contrast over images, and evidence legibility. Keep text editable and inspect the exported format separately if an export was requested. Listing many families or passing schema tests is not evidence of visual quality.
