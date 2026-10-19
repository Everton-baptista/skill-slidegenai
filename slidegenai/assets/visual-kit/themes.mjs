/** Authored catalog treatments. Shared geometry, never a claim of faithful masters. */
const families = {
  analytical: {
    layout: "rail",
    paper: "#F2F4F8",
    ink: "#17202C",
    accent: "#365CF5",
    secondary: "#8A65E5",
    surface: "#E2E8F2",
  },
  technical: {
    layout: "engineered",
    paper: "#0D1218",
    ink: "#F0F4F8",
    accent: "#C4EF55",
    secondary: "#77C8EC",
    surface: "#1C2632",
  },
  editorial: {
    layout: "editorial",
    paper: "#F7F4EC",
    ink: "#28201C",
    accent: "#B43F2E",
    secondary: "#8B745F",
    surface: "#E9E2D5",
  },
  photographic: {
    layout: "atelier",
    paper: "#0B1A21",
    ink: "#F7F0E3",
    accent: "#D1B783",
    secondary: "#93B7B6",
    surface: "#1D3037",
  },
  organic: {
    layout: "offset",
    paper: "#F3F0E5",
    ink: "#303A31",
    accent: "#556E4B",
    secondary: "#AE624D",
    surface: "#E2E5D6",
  },
  minimal: {
    layout: "open",
    paper: "#FAFAF7",
    ink: "#181918",
    accent: "#333B3A",
    secondary: "#727C78",
    surface: "#E9EBE7",
  },
  experimental: {
    layout: "poster",
    paper: "#101011",
    ink: "#F4F2E9",
    accent: "#DAF85A",
    secondary: "#BFA3F7",
    surface: "#28282A",
  },
  institutional: {
    layout: "band",
    paper: "#F6F5EF",
    ink: "#24342E",
    accent: "#37634E",
    secondary: "#BA6345",
    surface: "#E1E7DC",
  },
  custom: {
    layout: "open",
    paper: "#F6F5F0",
    ink: "#252623",
    accent: "#4B6355",
    secondary: "#A77152",
    surface: "#E5E5DE",
  },
};
const directions = {
  "acid-graphix": {
    layout: "poster",
    paper: "#10110C",
    ink: "#F4F7DF",
    accent: "#CCFF00",
    secondary: "#BAA1FF",
    surface: "#25291A",
  },
  default: {
    layout: "engineered",
    paper: "#0F0F0F",
    ink: "#DDDDDD",
    accent: "#CBF400",
    secondary: "#A1B8C4",
    surface: "#252824",
  },
  cyberpunk: {
    layout: "engineered",
    paper: "#080C12",
    ink: "#F0F0F0",
    accent: "#FF0055",
    secondary: "#00E5FF",
    surface: "#1B2131",
  },
  "fashion-editorial": {
    layout: "editorial",
    paper: "#FCF9F3",
    ink: "#242222",
    accent: "#E53935",
    secondary: "#FFC107",
    surface: "#EAE5DD",
  },
  "premium-travel": {
    layout: "atelier",
    paper: "#002B45",
    ink: "#FFFFFF",
    accent: "#D4AF37",
    secondary: "#7CB8C4",
    surface: "#163D51",
  },
  "luxury-gold-black": {
    layout: "atelier",
    paper: "#11100E",
    ink: "#F5F0E3",
    accent: "#CDB47C",
    secondary: "#A98A6A",
    surface: "#28241D",
  },
  "urban-vivid": {
    layout: "engineered",
    paper: "#11101B",
    ink: "#F1ECFA",
    accent: "#EC4899",
    secondary: "#8B9AFF",
    surface: "#29243F",
  },
  bauhaus: {
    layout: "geometric",
    paper: "#F1F0E6",
    ink: "#151719",
    accent: "#CC0000",
    secondary: "#1E44AA",
    tertiary: "#F2C300",
    surface: "#DFDED3",
  },
  kinetic: {
    layout: "poster",
    paper: "#EAB308",
    ink: "#111111",
    accent: "#111111",
    secondary: "#6C3612",
    surface: "#F2CD58",
  },
  "education-modern": {
    layout: "band",
    paper: "#F7F5EC",
    ink: "#15382E",
    accent: "#29644C",
    secondary: "#D47D47",
    surface: "#E3E9DA",
  },
};
export function readable(background, preferred) {
  const lum = (hex) =>
    [1, 3, 5]
      .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
      .reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0);
  const b = lum(background),
    p = lum(preferred);
  if ((Math.max(b, p) + 0.05) / (Math.min(b, p) + 0.05) >= 4.5)
    return preferred;
  return (b + 0.05) / 0.05 >= 1.05 / (b + 0.05) ? "#000000" : "#FFFFFF";
}
export function catalogVisual(entry) {
  let treatment = { ...families[entry.family] };
  const source = [
    ...new Set([
      ...(entry.rule_hex_colors || []),
      ...(entry.preview_hex_colors || []),
    ]),
  ];
  // Missing semantic color roles are creative inferences; never invent source evidence.
  if (source.length) {
    const neutral = source.find((c) => {
      const rgb = [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
      return Math.max(...rgb) - Math.min(...rgb) < 45;
    });
    if (neutral) treatment.paper = neutral;
    treatment.ink = readable(treatment.paper, treatment.ink);
    const accents = source.filter((c) => {
      const rgb = [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
      return Math.max(...rgb) - Math.min(...rgb) >= 45;
    });
    if (accents[0]) treatment.accent = accents[0];
    if (accents[1]) treatment.secondary = accents[1];
  }
  treatment = { ...treatment, ...directions[entry.id] };
  return {
    ...treatment,
    palette: [
      treatment.accent,
      treatment.secondary,
      treatment.tertiary || "#8A9D9D",
    ],
    display_weight: ["atelier", "editorial"].includes(treatment.layout)
      ? 400
      : 700,
    source_colors: source,
    provenance:
      "Authored creative adaptation. Source color inventory retained; semantic roles, fallback colors and geometry are inferred. Not an imported or certified template master.",
  };
}
export function composeCatalog(slide, canvas, design) {
  const c = slide.composition,
    t = design.visual_tokens;
  if (!t)
    throw Error(
      "Catalog composition requires catalog_treatment: true and template_id",
    );
  const k = canvas.width / 1280,
    ky = canvas.height / 720;
  const C = design.colors,
    ink = readable(slide.background || C.paper, C.ink),
    accent = C.accent;
  const out = [];
  const box = ([x, y, w, h]) => ({
    x: x * k,
    y: y * ky,
    width: w * k,
    height: h * ky,
  });
  const shape = (id, b, fill, effect = {}) =>
    out.push({ id, kind: "shape", ...box(b), fill, effect });
  const text = (id, value, b, size, role = "body", foreground = ink) => {
    if (value)
      out.push({
        id,
        kind: "text",
        text: String(value),
        ...box(b),
        font_size: size * k,
        type_role: role,
        font_weight: role === "headline" ? t.display_weight : 400,
        line_height: role === "headline" ? 1.02 : 1.25,
        color: foreground,
      });
  };
  const image = (b, effect = {}) => {
    if (c.image?.asset)
      out.push({
        ...c.image,
        id: "composition-image",
        kind: "image",
        ...box(b),
        effect,
      });
  };
  const label = (foreground = accent) =>
    text(
      "composition-eyebrow",
      c.eyebrow,
      [64, 44, 1080, 36],
      16,
      "caption",
      readable(slide.background || C.paper, foreground),
    );
  const heading =
    c.type === "topic-cover" &&
    c.number &&
    slide.title.startsWith(`${c.number} / `)
      ? slide.title.slice(String(c.number).length + 3)
      : slide.title;
  const title = (b, size, foreground = ink) =>
    text("composition-title", heading, b, size, "headline", foreground);
  const body = (b, size = 25, foreground = ink) =>
    text("composition-body", c.body, b, size, "body", foreground);
  if (c.type === "evidence") {
    if (!c.object || !["chart", "diagram", "table"].includes(c.object.kind))
      throw Error(
        "Evidence composition needs a chart, diagram or table object",
      );
    const side =
      ["poster", "rail", "offset", "atelier"].includes(t.layout) &&
      c.object.kind === "chart";
    label();
    title(side ? [64, 122, 360, 280] : [64, 108, 1148, 142], side ? 64 : 68);
    body(side ? [68, 440, 340, 170] : [68, 238, 1120, 58], side ? 24 : 23);
    if (t.layout === "geometric")
      shape("composition-rule", [64, 288, 1152, 5], C.secondary);
    const region = side ? [474, 110, 742, 510] : [64, 322, 1152, 316];
    if (c.object.kind === "table") region.splice(1, 3, 328, 1152, 310);
    out.push({
      ...c.object,
      id: "composition-visual",
      kind: c.object.kind === "diagram" ? "shape" : c.object.kind,
      ...box(region),
      type_role: "body",
      font_size: 27 * k,
      chart_label_size: 18 * k,
      color: ink,
      fill: C.surface,
      node_color: readable(C.surface, C.ink),
      palette: [C.accent, C.secondary, C.tertiary || t.palette[2]],
      header_fill: C.accent,
      header_color: readable(C.accent, C.ink),
      body_fill: C.paper,
      diagram_radius: ["offset", "band"].includes(t.layout) ? 12 * k : 0,
    });
    text("composition-caption", c.caption, [64, 676, 1100, 24], 15, "caption");
    return out;
  }
  if (c.type === "topic-cover") {
    shape("composition-field", [0, 0, 1280, 720], accent);
    const fg = readable(accent, C.paper);
    if (t.layout === "poster" || t.layout === "geometric") {
      text(
        "composition-topic",
        c.number,
        [64, 72, 300, 190],
        170,
        "headline",
        fg,
      );
      title([400, 208, 800, 320], 100, fg);
      body([400, 562, 770, 105], 25, fg);
    } else {
      text(
        "composition-topic",
        c.number,
        [940, 64, 270, 200],
        148,
        "headline",
        fg,
      );
      title([64, 280, 1110, 250], 96, fg);
      body([68, 560, 950, 110], 26, fg);
    }
    text(
      "composition-eyebrow",
      c.eyebrow,
      [64, 42, 900, 36],
      16,
      "caption",
      fg,
    );
    return out;
  }
  if (c.type === "closing" || c.type === "statement") {
    label();
    title(
      [64, 142, 1120, 330],
      t.layout === "atelier" ? 92 : t.layout === "geometric" ? 88 : 104,
    );
    body([68, 552, 790, 115], 27);
    image([960, 508, 256, 160]);
    shape("composition-rule", [64, 500, 720, 2], accent);
    return out;
  }
  if (!["cover", "editorial"].includes(c.type))
    throw Error(
      "Catalog treatment supports cover, topic-cover, editorial, statement, closing and evidence; use explicit geometry for other compositions",
    );
  label();
  if (t.layout === "poster") {
    title([64, 108, 1152, 266], 128);
    image([64, 414, 544, 244]);
    body([704, 426, 480, 190], 27);
    shape("composition-rule", [64, 374, 1152, 3], accent);
  } else if (t.layout === "editorial") {
    image([728, 0, 552, 720]);
    shape("composition-spine", [0, 0, 12, 720], C.secondary);
    title([64, 180, 620, 300], 86, accent);
    body([68, 548, 584, 120], 25);
  } else if (t.layout === "atelier") {
    image([720, 72, 480, 558]);
    title([80, 142, 560, 310], 94);
    body([84, 508, 500, 120], 24);
    shape("composition-rule", [80, 664, 1120, 1], accent);
  } else if (t.layout === "geometric") {
    shape("composition-circle", [924, 54, 286, 286], accent, {
      mask: "ellipse",
    });
    shape("composition-block", [784, 400, 432, 272], C.secondary);
    image([856, 414, 310, 244]);
    title([64, 138, 700, 320], 100);
    body([68, 524, 620, 124], 26);
    shape("composition-rule", [64, 676, 520, 12], C.tertiary || t.palette[2]);
  } else if (t.layout === "offset") {
    image([64, 120, 570, 490]);
    title([704, 140, 480, 300], 78);
    body([720, 500, 464, 160], 25);
  } else if (t.layout === "engineered") {
    shape("composition-spine", [0, 0, 10, 720], accent);
    title([64, 104, 1152, 176], 96);
    image([64, 316, 600, 340]);
    body([736, 362, 456, 240], 27);
    shape("composition-rule", [64, 282, 1152, 1], accent);
  } else if (t.layout === "band") {
    title([64, 124, 680, 300], 86);
    shape("composition-band", [816, 0, 464, 720], C.surface);
    image([848, 128, 368, 456]);
    body([68, 512, 650, 140], 27);
  } else {
    title([64, 138, 1120, 250], 92);
    image([800, 410, 416, 248]);
    body([68, 460, 620, 180], 26);
  }
  return out;
}
