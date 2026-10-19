/** Portable scene compilation. No evaluation of source scripts, HTML or CSS. */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
export const home = path.dirname(fileURLToPath(import.meta.url));
export const skill = path.resolve(home, "../..");
export const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export const finite = (v, name, low = 0) => {
  if (typeof v !== "number" || !Number.isFinite(v) || v < low)
    throw Error(`Invalid ${name}`);
  return v;
};
export function color(v) {
  if (!/^#[\da-f]{6}$/i.test(v))
    throw Error(`Expected opaque #RRGGBB color: ${v}`);
  return v;
}
export async function json(file) {
  return JSON.parse(await fs.readFile(file, "utf8"));
}
export async function local(root, name) {
  if (
    typeof name !== "string" ||
    !name ||
    path.isAbsolute(name) ||
    name.includes("\\") ||
    name.split("/").some((p) => p === ".." || p.startsWith(".")) ||
    /^[a-z]+:/i.test(name)
  )
    throw Error("Asset must be a local relative path");
  const base = await fs.realpath(root),
    file = await fs.realpath(path.resolve(base, name));
  if (!file.startsWith(base + path.sep) || !(await fs.stat(file)).isFile())
    throw Error("Asset escapes its source folder");
  return file;
}
export async function image(root, name) {
  const file = await local(root, name),
    ext = path.extname(file).toLowerCase(),
    mime = {
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".svg": "image/svg+xml",
    }[ext];
  if (!mime) throw Error("Only PNG, JPEG and passive SVG images are supported");
  const bytes = await fs.readFile(file);
  if (bytes.length > 25_000_000) throw Error("Image exceeds 25 MB");
  if (ext === ".svg") {
    const s = bytes.toString("utf8");
    if (
      !/<svg[\s>]/i.test(s) ||
      /<\s*(?:script|foreignObject|iframe|object|embed|style|animate\w*|set)\b|<!DOCTYPE|<!ENTITY|\son[a-z]+\s*=/i.test(
        s,
      ) ||
      /(?:href\s*=\s*["']\s*(?!#)|url\(\s*["']?(?!#))/i.test(s)
    )
      throw Error(
        "SVG must be passive and self-contained; use a permitted flattened working copy for complex SVG",
      );
  }
  return {
    file,
    mime,
    data: `data:${mime};base64,${bytes.toString("base64")}`,
  };
}
export async function resolveStyle(id) {
  const catalog = await json(
    path.join(skill, "references/template-catalog.json"),
  );
  const system = await json(
    path.join(skill, "references/template-system.json"),
  );
  const pairs = await json(
    path.join(skill, "references/typography-pairings.json"),
  );
  if (!id) return { id: null, family: "custom", ...system.families.custom };
  const entry = catalog.templates.find((t) => t.id === id);
  if (!entry) throw Error(`Unknown template_id: ${id}`);
  const base = system.families[entry.family];
  if (!base) throw Error("Missing style family");
  const override = pairs.pairings.find((p) => p.source_id === id);
  return { ...base, ...(override || {}), id, family: entry.family };
}
export function readable(background, preferred) {
  const lum = (hex) =>
    [1, 3, 5]
      .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
      .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
  const b = lum(background),
    p = lum(preferred),
    ratio = (Math.max(b, p) + 0.05) / (Math.min(b, p) + 0.05);
  return ratio >= 4.5
    ? preferred
    : (b + 0.05) / 0.05 >= 1.05 / (b + 0.05)
      ? "#000000"
      : "#FFFFFF";
}
const recipes = new Set([
  "cover",
  "topic-cover",
  "editorial",
  "full-image",
  "statement",
  "comparison",
  "closing",
]);
export function compose(slide, canvas, design) {
  const c = slide.composition;
  if (!c) return [];
  if (!recipes.has(c.type)) throw Error(`Unsupported composition: ${c.type}`);
  const variants = {
    cover: ["default", "image-right"],
    "topic-cover": ["default", "image-right"],
    editorial: ["default", "inset-image"],
    "full-image": ["default", "bottom-caption"],
    statement: ["default", "offset"],
    comparison: ["default", "open-columns"],
    closing: ["default", "image-right", "offset"],
  };
  const variant = c.variant ?? "default";
  if (!variants[c.type].includes(variant))
    throw Error(`Unsupported ${c.type} variant: ${variant}`);
  const W = canvas.width,
    H = canvas.height,
    k = W / 1280,
    ky = H / 720,
    ink = readable(
      slide.background || design.colors.paper || "#FFFFFF",
      design.colors.ink || "#172B4D",
    ),
    paper = design.colors.paper || "#FFFFFF";
  const out = [],
    box = (x, y, w, h) => ({
      x: x * k,
      y: y * ky,
      width: w * k,
      height: h * ky,
    });
  const text = (id, value, b, size, role = "body", foreground = ink) => {
    if (value)
      out.push({
        id,
        kind: "text",
        text: String(value),
        ...box(...b),
        font_size: size * k,
        type_role: role,
        color: foreground,
      });
  };
  const picture = (b) => {
    if (!c.image?.asset)
      throw Error(`${c.type} requires composition.image.asset`);
    out.push({
      id: "composition-image",
      kind: "image",
      ...box(...b),
      ...c.image,
    });
  };
  if (variant === "image-right") {
    picture([704, 0, 576, 720]);
    text("composition-eyebrow", c.eyebrow, [64, 64, 576, 40], 17, "caption");
    text("composition-title", slide.title, [64, 184, 568, 280], 62, "headline");
    text("composition-body", c.body, [68, 500, 560, 140], 26);
    if (c.type === "topic-cover")
      text("composition-topic", c.number, [64, 116, 576, 48], 32, "caption");
  } else if (variant === "offset") {
    text("composition-eyebrow", c.eyebrow, [64, 64, 1056, 40], 17, "caption");
    text(
      "composition-title",
      slide.title,
      [256, 190, 928, 300],
      80,
      "headline",
    );
    text("composition-body", c.body, [640, 538, 544, 112], 26);
  } else if (c.type === "full-image") {
    picture([0, 0, 1280, 720]);
    out.push({
      id: "composition-shade",
      kind: "shape",
      ...box(0, 0, 1280, 720),
      fill: "#000000",
      effect: {
        gradient: {
          from: "#000000",
          to: "#000000",
          from_opacity: variant === "bottom-caption" ? 0.08 : 0.88,
          to_opacity: variant === "bottom-caption" ? 0.92 : 0.05,
          direction: variant === "bottom-caption" ? "bottom" : "right",
        },
      },
    });
    text(
      "composition-title",
      slide.title,
      variant === "bottom-caption" ? [64, 416, 1152, 150] : [64, 285, 920, 245],
      variant === "bottom-caption" ? 62 : 76,
      "headline",
    );
    text(
      "composition-body",
      c.body,
      variant === "bottom-caption" ? [68, 590, 1100, 78] : [68, 570, 850, 85],
      27,
    );
    out.filter((e) => e.kind === "text").forEach((e) => (e.color = "#FFFFFF"));
  } else if (c.type === "editorial") {
    if (variant === "inset-image") {
      picture([704, 96, 512, 528]);
      text("composition-eyebrow", c.eyebrow, [64, 96, 560, 40], 17, "caption");
      text(
        "composition-title",
        slide.title,
        [64, 182, 560, 230],
        58,
        "headline",
      );
      text("composition-body", c.body, [68, 460, 544, 180], 26);
      return out;
    }
    picture([0, 0, 580, 720]);
    text("composition-eyebrow", c.eyebrow, [640, 72, 560, 40], 17, "caption");
    text(
      "composition-title",
      slide.title,
      [640, 165, 570, 225],
      58,
      "headline",
    );
    text("composition-body", c.body, [640, 440, 530, 205], 26);
  } else if (c.type === "comparison") {
    if (
      !Array.isArray(c.panels) ||
      c.panels.length !== 2 ||
      c.panels.some(
        (p) =>
          typeof p.title !== "string" ||
          !p.title.trim() ||
          typeof p.body !== "string" ||
          !p.body.trim(),
      )
    )
      throw Error("comparison needs exactly two panels");
    text("composition-title", slide.title, [64, 58, 1152, 150], 58, "headline");
    c.panels.forEach((p, i) => {
      const x = 64 + i * 592;
      const open = variant === "open-columns";
      const panelFill = i ? design.colors.accent || "#DCE3EB" : paper;
      const panelInk = open ? ink : readable(panelFill, ink);
      if (!open)
        out.push({
          id: `panel-${i}`,
          kind: "shape",
          ...box(x, 245, 560, 390),
          fill: panelFill,
        });
      text(
        `panel-title-${i}`,
        p.title,
        [x + 24, 275, 512, 85],
        35,
        "headline",
        panelInk,
      );
      text(
        `panel-body-${i}`,
        p.body,
        [x + 24, 385, 512, 210],
        25,
        "body",
        panelInk,
      );
    });
  } else {
    text("composition-eyebrow", c.eyebrow, [68, 75, 1080, 40], 18, "caption");
    text(
      "composition-title",
      slide.title,
      [64, 215, 1140, 250],
      c.type === "statement" ? 88 : 78,
      "headline",
    );
    text("composition-body", c.body, [68, 535, 1040, 110], 29);
    if (c.type === "topic-cover")
      text("composition-topic", c.number, [1010, 58, 200, 100], 72, "headline");
  }
  return out;
}
export async function compile(plan, design, model, root) {
  if (plan.version !== 1 || design.version !== 1)
    throw Error("Plan and design version must be 1");
  const unit = plan.unit ?? "px",
    canvas = { ...plan.slide_size, unit };
  if (
    !["px", "pt"].includes(unit) ||
    design.canvas?.unit !== unit ||
    canvas.width !== design.canvas.width ||
    canvas.height !== design.canvas.height
  )
    throw Error("Plan/design canvas or units differ");
  finite(canvas.width, "canvas width", 1);
  finite(canvas.height, "canvas height", 1);
  if (
    !Array.isArray(plan.slides) ||
    !plan.slides.length ||
    plan.expected_slides !== plan.slides.length
  )
    throw Error("Slide count differs from expected_slides");
  if (typeof plan.title !== "string" || !plan.title.trim())
    throw Error("Plan title is required");
  const style = await resolveStyle(plan.template_id ?? design.template_id),
    warnings = [],
    fonts = [],
    sids = new Set();
  for (const v of Object.values(design.colors || {})) color(v);
  const manifest = await json(path.join(skill, "assets/fonts/manifest.json"));
  async function face(request, size, weight, italic) {
    let family = manifest.families.find((f) => f.family === request),
      fallback = false;
    if (!family) {
      family = manifest.families.find((f) => f.family === "Manrope");
      fallback = true;
    }
    let record = family.files.find(
      (f) =>
        f.style === (italic ? "italic" : "normal") &&
        f.weight_range[0] <= weight &&
        f.weight_range[1] >= weight,
    );
    if (!record) {
      record =
        family.files.find((f) => f.style === "normal") || family.files[0];
      fallback = true;
    }
    const resolvedWeight = Math.max(
      record.weight_range[0],
      Math.min(record.weight_range[1], weight),
    );
    const resolvedStyle = record.style;
    if (fallback)
      warnings.push(
        `Font substitution: ${request} ${weight} ${italic ? "italic" : "normal"} → ${family.family} ${resolvedWeight} ${resolvedStyle}`,
      );
    const key = `${family.family}/${record.path}`;
    if (!fonts.some((f) => f.key === key))
      fonts.push({
        key,
        family: family.family,
        record,
        license: family.license_file,
        file: await local(path.join(skill, "assets/fonts"), record.path),
      });
    return {
      font_family: family.family,
      font_size: size,
      font_weight: resolvedWeight,
      italic: resolvedStyle === "italic",
    };
  }
  const slides = [];
  for (const [index, s] of plan.slides.entries()) {
    if (
      typeof s.id !== "string" ||
      !s.id ||
      sids.has(s.id) ||
      s.position !== index + 1
    )
      throw Error("Slide IDs must be unique and positions sequential");
    sids.add(s.id);
    const ids = new Set(),
      elements = [];
    for (const raw of [...compose(s, canvas, design), ...(s.elements || [])]) {
      let e = { ...raw };
      if (typeof e.id !== "string" || !e.id || ids.has(e.id))
        throw Error(`Duplicate/missing element ID: ${s.id}/${e.id}`);
      ids.add(e.id);
      if (
        !["text", "image", "logo", "shape", "table", "chart"].includes(e.kind)
      )
        throw Error(`Unsupported element kind: ${e.kind}`);
      for (const key of ["x", "y", "width", "height"])
        finite(
          e[key],
          `${e.id}.${key}`,
          ["width", "height"].includes(key) ? Number.EPSILON : 0,
        );
      if (
        e.x + e.width > canvas.width + 0.01 ||
        e.y + e.height > canvas.height + 0.01
      )
        throw Error(`Element exceeds canvas: ${s.id}/${e.id}`);
      const role = design.typography?.[e.type_role || "body"] || {};
      if (e.type_role && !design.typography?.[e.type_role])
        throw Error("Unknown typography role");
      if (e.font_weight !== undefined) {
        finite(e.font_weight, "font weight", 1);
        if (e.font_weight > 1000) throw Error("Font weight exceeds 1000");
      }
      if (e.node_color) e.node_color = color(e.node_color);
      const defaultRole =
        e.type_role === "headline"
          ? "display"
          : e.type_role === "caption"
            ? "label"
            : "body";
      if (["text", "table", "chart", "shape"].includes(e.kind)) {
        const size = e.font_size ?? role.size ?? 24;
        finite(size, "font size", 1);
        Object.assign(
          e,
          await face(
            e.font_family || role.family || style[defaultRole],
            size,
            e.font_weight ?? ((e.bold ?? role.bold) ? 700 : 400),
            !!(e.italic ?? role.italic),
          ),
        );
        e.line_height =
          e.line_height ?? (e.type_role ? role.line_height : undefined) ?? 1.05;
        finite(e.line_height, "line height", 0.5);
      }
      e.color = color(e.color || design.colors.ink || "#172B4D");
      e.fill = color(
        e.fill || e.background || design.colors.paper || "#FFFFFF",
      );
      if (e.kind === "text" && (typeof e.text !== "string" || !e.text.trim()))
        throw Error("Text must be nonempty");
      if (e.align && !["left", "center", "right"].includes(e.align))
        throw Error("Unsupported text alignment");
      e.effect = validateEffect(e.effect || {});
      if (e.effect.gradient && e.kind !== "shape")
        throw Error("Gradient requires a separate shape reading surface");
      if ((e.effect.outline || e.effect.tag) && e.kind !== "text")
        throw Error("Outline/tag effects require text");
      if (
        (e.effect.mask || e.effect.radius) &&
        !["image", "logo", "shape"].includes(e.kind)
      )
        throw Error("Masks/corners require an image, logo or shape");
      if (["image", "logo"].includes(e.kind)) {
        e.image = await image(root, e.asset);
        e.fit = e.fit || (e.kind === "logo" ? "contain" : "cover");
        if (!["contain", "cover"].includes(e.fit))
          throw Error("Image fit must be contain or cover");
        if (e.focal_point) {
          if (
            !Array.isArray(e.focal_point) ||
            e.focal_point.length !== 2 ||
            e.focal_point.some((v) => !Number.isFinite(v) || v < 0 || v > 1)
          )
            throw Error("Focal point is [x,y] between 0 and 1");
        }
      }
      if (e.kind === "table") {
        if (
          !Array.isArray(e.values) ||
          !e.values.length ||
          !Array.isArray(e.values[0]) ||
          !e.values[0].length ||
          e.values.some(
            (r) =>
              !Array.isArray(r) ||
              r.length !== e.values[0].length ||
              r.some((v) => !["string", "number"].includes(typeof v)),
          )
        )
          throw Error("Table must have a nonempty rectangular values array");
        e.header_fill = color(
          e.header_fill || design.colors.accent || "#243A63",
        );
        e.header_color = color(e.header_color || "#FFFFFF");
        e.body_fill = color(e.body_fill || "#FFFFFF");
      }
      if (e.kind === "chart") {
        e.visual =
          model?.charts?.find((v) => v.id === e.visual_id) ||
          (!e.visual_id && e.values
            ? {
                id: e.id,
                type: "grouped-bar",
                unit: e.unit || e.series_name || "Values",
                categories: e.categories,
                series: [{ name: e.series_name || "Value", values: e.values }],
                source: {
                  status: s.data_status,
                  label: s.citation || "Illustrative data",
                },
              }
            : null);
        validateChart(e.visual);
        if (e.palette && (!Array.isArray(e.palette) || !e.palette.length))
          throw Error("Chart palette must be a nonempty array");
        e.palette = (
          e.palette || [
            design.colors.accent || "#243A63",
            "#B64B30",
            "#798E61",
            "#99749C",
          ]
        ).map(color);
      }
      if (e.kind === "shape" && e.visual_id) {
        e.visual = model?.diagrams?.find((v) => v.id === e.visual_id);
        if (!e.visual) throw Error(`Missing diagram: ${e.visual_id}`);
        validateDiagram(e.visual);
        e.primitives = diagram(e.visual, e);
      }
      elements.push(e);
    }
    if (!elements.length) throw Error("Every slide needs content");
    slides.push({
      ...s,
      status: "generated",
      background: color(s.background || design.colors.paper || "#FFFFFF"),
      elements,
    });
  }
  return {
    title: plan.title,
    language: plan.language || "en",
    canvas,
    style,
    slides,
    fonts,
    warnings: [...new Set(warnings)],
    unitScale: unit === "pt" ? 96 / 72 : 1,
  };
}
function validateEffect(e) {
  const allowed = ["mask", "outline", "tag", "radius", "gradient"];
  if (Object.keys(e).some((k) => !allowed.includes(k)))
    throw Error("Unsupported effect");
  if (e.mask && !["ellipse", "organic"].includes(e.mask))
    throw Error("Unsupported mask");
  for (const k of ["outline", "radius"])
    if (e[k] !== undefined) finite(e[k], k);
  if (e.tag !== undefined && typeof e.tag !== "boolean")
    throw Error("tag must be boolean");
  if (e.gradient) {
    const g = e.gradient;
    color(g.from);
    color(g.to);
    if (!["right", "bottom"].includes(g.direction))
      throw Error("Gradient direction is right or bottom");
    for (const key of ["from_opacity", "to_opacity"]) {
      finite(g[key], key);
      if (g[key] > 1) throw Error("Opacity must be <= 1");
    }
  }
  return e;
}
export function validateChart(v) {
  // Self-contained so the same validation can run in the offline HTML player.
  const finite = (n, name, low) => {
    if (typeof n !== "number" || !Number.isFinite(n) || n < low)
      throw Error(`Invalid ${name}`);
  };
  if (
    !v ||
    !["grouped-bar", "line", "stacked-share", "scatter"].includes(v.type)
  )
    throw Error(
      "Supported chart types: grouped-bar, line, stacked-share, scatter",
    );
  if (
    !v.source ||
    !["sourced", "illustrative"].includes(v.source.status) ||
    !v.source.label?.trim()
  )
    throw Error("Chart source status and label are required");
  if (!Array.isArray(v.series) || !v.series.length)
    throw Error("Chart series required");
  if (
    v.type !== "scatter" &&
    (!Array.isArray(v.categories) || !v.categories.length)
  )
    throw Error("Chart categories required");
  for (const s of v.series) {
    if (typeof s.name !== "string" || !s.name.trim())
      throw Error("Series name required");
    const values = v.type === "scatter" ? s.points : s.values;
    if (
      !Array.isArray(values) ||
      !values.length ||
      (v.type !== "scatter" && values.length !== v.categories.length)
    )
      throw Error("Chart series length mismatch");
    for (const n of values) {
      if (v.type === "scatter") {
        finite(n.x, "scatter x", -Number.MAX_VALUE);
        finite(n.y, "scatter y", -Number.MAX_VALUE);
      } else
        finite(
          n,
          "chart value",
          v.type === "stacked-share" ? 0 : -Number.MAX_VALUE,
        );
    }
  }
  if (v.type === "scatter") {
    const x = v.series[0].points.map((p) => p.x);
    if (
      v.series.some(
        (s) =>
          s.points.length !== x.length || s.points.some((p, i) => p.x !== x[i]),
      )
    )
      throw Error(
        "Native paired scatter requires a common X vector; use the host for independent samples",
      );
  }
  if (v.type === "stacked-share")
    v.categories.forEach((_, i) => {
      if (
        Math.abs(v.series.reduce((sum, s) => sum + s.values[i], 0) - 100) > 0.01
      )
        throw Error("Stacked-share columns must total 100 percent");
    });
}
export function validateDiagram(d) {
  if (
    ![
      "process",
      "decision-flow",
      "swimlane",
      "architecture",
      "roadmap",
      "matrix",
    ].includes(d.type)
  )
    throw Error("Unsupported diagram type");
  if (!Array.isArray(d.nodes) || !d.nodes.length)
    throw Error("Diagram nodes required");
  const ids = new Set();
  for (const n of d.nodes) {
    if (!n.id || ids.has(n.id) || typeof n.label !== "string" || !n.label)
      throw Error("Diagram node IDs/labels required and unique");
    ids.add(n.id);
  }
  for (const e of d.edges || [])
    if (!ids.has(e.from) || !ids.has(e.to))
      throw Error("Unknown diagram edge endpoint");
  if (
    d.type === "swimlane" &&
    (!d.lanes?.length || d.nodes.some((n) => !d.lanes.includes(n.lane)))
  )
    throw Error("Unknown/missing lane");
  if (d.type === "roadmap")
    for (const n of d.nodes)
      if (
        !Number.isFinite(Date.parse(n.start)) ||
        !Number.isFinite(Date.parse(n.end)) ||
        Date.parse(n.start) > Date.parse(n.end)
      )
        throw Error("Invalid roadmap dates");
  if (
    d.type === "matrix" &&
    (!d.rows?.length ||
      !d.columns?.length ||
      d.nodes.some(
        (n) =>
          !Number.isInteger(n.row) ||
          !Number.isInteger(n.column) ||
          n.row < 0 ||
          n.column < 0 ||
          n.row >= d.rows.length ||
          n.column >= d.columns.length,
      ))
  )
    throw Error("Invalid matrix cell");
}
/** Diagrams become text/shapes/lines in both formats, preserving topology. */
export function diagram(d, e) {
  const W = e.width,
    H = e.height,
    parts = [],
    nodes = new Map(),
    ink = e.color,
    fill = e.fill,
    F = e.font_size;
  const nodeInk =
    e.node_color ||
    (parseInt(fill.slice(1, 3), 16) * 0.299 +
      parseInt(fill.slice(3, 5), 16) * 0.587 +
      parseInt(fill.slice(5, 7), 16) * 0.114 >
    145
      ? "#172B4D"
      : "#FFFFFF");
  const text = (id, text, x, y, w, h, size = F, textColor = ink) =>
    parts.push({
      id,
      kind: "text",
      text,
      x,
      y,
      width: w,
      height: h,
      font_size: size,
      color: textColor,
    });
  if (d.type === "roadmap") {
    const start = Math.min(...d.nodes.map((n) => Date.parse(n.start))),
      end = Math.max(...d.nodes.map((n) => Date.parse(n.end) + 86400000)),
      labelW = W * 0.23,
      plotW = W - labelW;
    text(
      "dates",
      `${new Date(start).toISOString().slice(0, 10)} — ${new Date(end - 86400000).toISOString().slice(0, 10)}`,
      labelW,
      0,
      plotW,
      H * 0.12,
      F * 0.7,
    );
    d.nodes.forEach((n, i) => {
      const y = H * 0.18 + i * ((H * 0.8) / d.nodes.length),
        h = (H * 0.5) / d.nodes.length,
        x = labelW + ((Date.parse(n.start) - start) / (end - start)) * plotW,
        w =
          ((Date.parse(n.end) + 86400000 - Date.parse(n.start)) /
            (end - start)) *
          plotW;
      parts.push({ id: n.id, kind: "shape", x, y, width: w, height: h, fill });
      text(`label-${n.id}`, n.label, 0, y, labelW * 0.94, h, F * 0.8);
    });
    return parts;
  }
  if (d.type === "matrix") {
    const gapX = W * 0.2,
      gapY = H * 0.15,
      cw = (W - gapX) / d.columns.length,
      rh = (H - gapY) / d.rows.length;
    d.rows.forEach((r, i) =>
      text(`row-${i}`, r, 0, gapY + i * rh, gapX * 0.95, rh, F * 0.7),
    );
    d.columns.forEach((c, i) =>
      text(`col-${i}`, c, gapX + i * cw, 0, cw, gapY, F * 0.7),
    );
    d.rows.forEach((_, r) =>
      d.columns.forEach((_, c) => {
        parts.push({
          id: `cell-${r}-${c}`,
          kind: "shape",
          x: gapX + c * cw,
          y: gapY + r * rh,
          width: cw,
          height: rh,
          fill,
          line: ink,
        });
        const labels = d.nodes
          .filter((n) => n.row === r && n.column === c)
          .map((n) => n.label)
          .join("\n");
        if (labels)
          text(
            `labels-${r}-${c}`,
            labels,
            gapX + c * cw + cw * 0.06,
            gapY + r * rh + rh * 0.15,
            cw * 0.88,
            rh * 0.75,
            F * 0.75,
            nodeInk,
          );
      }),
    );
    return parts;
  }
  const lane = d.type === "swimlane",
    n = d.nodes.length,
    columns = Math.min(n, 4),
    rows = lane ? d.lanes.length : Math.ceil(n / columns),
    stepX = W / (lane ? n : columns),
    stepY = H / rows;
  if (lane)
    d.lanes.forEach((name, i) => {
      parts.push({
        id: `lane-${i}`,
        kind: "shape",
        x: 0,
        y: i * stepY,
        width: W,
        height: stepY,
        fill,
        line: ink,
      });
      text(
        `lane-name-${i}`,
        name,
        4,
        i * stepY + 4,
        W * 0.23,
        stepY * 0.22,
        F * 0.65,
        nodeInk,
      );
    });
  d.nodes.forEach((node, i) => {
    const override = e.node_positions?.[node.id];
    if (override)
      for (const k of ["x", "y", "width", "height"])
        finite(
          override[k],
          `node ${k}`,
          ["width", "height"].includes(k) ? Number.EPSILON : 0,
        );
    const x = override?.x ?? (i % (lane ? n : columns)) * stepX + stepX * 0.08,
      y =
        override?.y ??
        (lane ? d.lanes.indexOf(node.lane) : Math.floor(i / columns)) * stepY +
          stepY * 0.33,
      w = override?.width ?? stepX * 0.78,
      h = override?.height ?? Math.min(stepY * 0.48, H * 0.22);
    if (x < 0 || y < 0 || x + w > W || y + h > H)
      throw Error("Diagram node exceeds its region");
    nodes.set(node.id, { x, y, width: w, height: h });
    parts.push({
      id: node.id,
      kind: "shape",
      x,
      y,
      width: w,
      height: h,
      fill,
      line: ink,
      shape: node.role === "decision" ? "diamond" : "rect",
    });
    text(
      `label-${node.id}`,
      node.label,
      x + w * 0.09,
      y + h * 0.18,
      w * 0.82,
      h * 0.7,
      F * 0.75,
      nodeInk,
    );
  });
  // Author explicit ports/waypoints for complex topology. Default ports choose
  // horizontal versus vertical separation; no edge or label is silently omitted.
  const port = (b, side) =>
    side === "left"
      ? [b.x, b.y + b.height / 2]
      : side === "right"
        ? [b.x + b.width, b.y + b.height / 2]
        : side === "top"
          ? [b.x + b.width / 2, b.y]
          : [b.x + b.width / 2, b.y + b.height];
  if (
    e.routes &&
    (!Array.isArray(e.routes) || e.routes.length !== (d.edges || []).length)
  )
    throw Error("Diagram routes must match edge count");
  (d.edges || []).forEach((edge, i) => {
    const a = nodes.get(edge.from),
      b = nodes.get(edge.to),
      route = e.routes?.[i];
    let points;
    if (route) {
      if (
        !["left", "right", "top", "bottom"].includes(route.fromSide) ||
        !["left", "right", "top", "bottom"].includes(route.toSide)
      )
        throw Error("Invalid route port");
      const start = port(a, route.fromSide),
        end = port(b, route.toSide);
      if (route.waypoints) points = [start, ...route.waypoints, end];
      else if (
        ["top", "bottom"].includes(route.fromSide) &&
        ["top", "bottom"].includes(route.toSide)
      ) {
        const mid = (start[1] + end[1]) / 2;
        points = [start, [start[0], mid], [end[0], mid], end];
      } else if (
        route.fromSide === route.toSide &&
        ["left", "right"].includes(route.fromSide)
      ) {
        const mid =
          route.fromSide === "left"
            ? Math.max(1, Math.min(start[0], end[0]) - W * 0.03)
            : Math.min(W - 1, Math.max(start[0], end[0]) + W * 0.03);
        points = [start, [mid, start[1]], [mid, end[1]], end];
      } else {
        const mid = (start[0] + end[0]) / 2;
        points = [start, [mid, start[1]], [mid, end[1]], end];
      }
    } else {
      const dx = b.x + b.width / 2 - a.x - a.width / 2,
        dy = b.y + b.height / 2 - a.y - a.height / 2;
      if (Math.abs(dx) > Math.max(a.width, b.width)) {
        const start = port(a, dx > 0 ? "right" : "left"),
          end = port(b, dx > 0 ? "left" : "right"),
          mid = (start[0] + end[0]) / 2;
        points = [start, [mid, start[1]], [mid, end[1]], end];
      } else {
        const start = port(a, dy >= 0 ? "bottom" : "top"),
          end = port(b, dy >= 0 ? "top" : "bottom"),
          mid = (start[1] + end[1]) / 2;
        points = [start, [start[0], mid], [end[0], mid], end];
      }
    }
    if (
      points.some(
        (p) =>
          !Array.isArray(p) ||
          p.length !== 2 ||
          p.some((v, j) => !Number.isFinite(v) || v < 0 || v > (j ? H : W)),
      )
    )
      throw Error("Diagram route exceeds its region");
    const segments = points
      .slice(1)
      .map((p, j) => ({ a: points[j], b: p }))
      .filter((p) => p.a[0] !== p.b[0] || p.a[1] !== p.b[1]);
    segments.forEach((p, j) =>
      parts.push({
        id: `edge-${i}-${j}`,
        kind: "line",
        ...p,
        color: ink,
        arrow: edge.directed !== false && j === segments.length - 1,
      }),
    );
    if (edge.label) {
      const longest = segments.reduce(
        (best, s) =>
          Math.hypot(s.b[0] - s.a[0], s.b[1] - s.a[1]) >
          Math.hypot(best.b[0] - best.a[0], best.b[1] - best.a[1])
            ? s
            : best,
        segments[0],
      );
      const b = route?.label_box || [
        Math.max(0, (longest.a[0] + longest.b[0]) / 2 - W * 0.06),
        Math.max(0, (longest.a[1] + longest.b[1]) / 2 - F),
        W * 0.12,
        F * 1.2,
      ];
      if (
        b.length !== 4 ||
        b.some((v) => !Number.isFinite(v) || v < 0) ||
        b[0] + b[2] > W ||
        b[1] + b[3] > H
      )
        throw Error("Diagram label exceeds its region");
      if (route?.label_font_size !== undefined)
        finite(route.label_font_size, "route label font size", 1);
      text(
        `edge-label-${i}`,
        edge.label,
        ...b,
        route?.label_font_size || F * 0.55,
      );
    }
  });
  return parts;
}
