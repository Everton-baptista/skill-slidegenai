/** Regression conversion of the existing ten-slide study, not new demo content. */
import fs from "node:fs/promises";
import path from "node:path";
export async function analyticalFixture(root) {
  const layout = JSON.parse(
    await fs.readFile(
      path.join(root, "examples/analytical-patterns/layout.json"),
      "utf8",
    ),
  );
  const model = JSON.parse(
    await fs.readFile(
      path.join(root, "slidegenai/references/visual-model-example.json"),
      "utf8",
    ),
  );
  const design = {
    version: 1,
    canvas: layout.canvas,
    colors: { ink: "#172B4D", paper: "#FFFFFF", accent: "#243A63" },
    typography: { body: { family: "Manrope", size: 24, line_height: 1.15 } },
  };
  const plan = {
    version: 1,
    unit: "px",
    title: "Editable analytical patterns",
    language: "en",
    expected_slides: layout.slides.length,
    slide_size: { width: layout.canvas.width, height: layout.canvas.height },
    slides: layout.slides.map((s, i) => {
      const elements = s.elements.map((e) => ({
        ...e,
        font_family: "Manrope",
      }));
      if (s.kind === "table")
        elements.push({
          id: "comparison",
          kind: "table",
          ...s.table,
          font_size: 25,
          color: "#172B4D",
          header_fill: "#243A63",
        });
      else if (s.kind === "chart")
        elements.push({
          id: s.visual_id,
          kind: "chart",
          ...s.chart_box,
          visual_id: s.visual_id,
          font_size: 23,
          palette: s.palette,
          color: s.background === "#FFFFFF" ? "#172B4D" : "#FFFFFF",
        });
      else {
        const box =
          s.kind === "roadmap"
            ? { x: 64, y: 300, width: 1152, height: 320 }
            : s.kind === "matrix"
              ? { x: 64, y: 300, width: 1152, height: 320 }
              : { x: 40, y: 300, width: 1190, height: 345 };
        const positions = s.nodes
          ? Object.fromEntries(
              Object.entries(s.nodes).map(([id, b]) => [
                id,
                { x: b[0] - box.x, y: b[1] - box.y, width: b[2], height: b[3] },
              ]),
            )
          : undefined;
        elements.push({
          id: s.visual_id,
          kind: "shape",
          ...box,
          visual_id: s.visual_id,
          node_positions: positions,
          routes: s.routes?.map((r) => ({
            ...r,
            waypoints: r.waypoints?.map(([x, y]) => [x - box.x, y - box.y]),
            label_box: [
              r.label_box[0] - box.x,
              r.label_box[1] - box.y,
              r.label_box[2],
              r.label_box[3],
            ],
          })),
          font_size: 24,
          color: s.background === "#FFFFFF" ? "#172B4D" : "#DAE5F0",
          node_color: "#172B4D",
          fill: "#EAF0F6",
        });
      }
      return {
        id: s.id,
        position: i + 1,
        title: s.title,
        background: s.background,
        elements,
      };
    }),
  };
  return { plan, design, model };
}

/** Alternate geometry with existing portable-study content, not a new authored deck. */
export async function compositionFixture(root) {
  const folder = path.join(root, "examples/portable-deck");
  const plan = JSON.parse(
    await fs.readFile(path.join(folder, "deck-plan.json"), "utf8"),
  );
  const design = JSON.parse(
    await fs.readFile(path.join(folder, "design-system.json"), "utf8"),
  );
  const original = plan.slides[0];
  const variants = [
    ["cover", "image-right"],
    ["topic-cover", "image-right"],
    ["closing", "image-right"],
    ["editorial", "inset-image"],
    ["full-image", "bottom-caption"],
    ["statement", "offset"],
    ["closing", "offset"],
    ["comparison", "open-columns"],
  ];
  const texts = original.elements.filter((e) => e.kind === "text");
  const rows = plan.slides[4].elements.find((e) => e.kind === "table").values;
  plan.slides = variants.map(([type, variant], i) => ({
    ...original,
    id: `variant-${i + 1}`,
    position: i + 1,
    status: "generated",
    composition: {
      type,
      variant,
      eyebrow: texts[0].text,
      body: texts[2].text,
      number: "01",
      image: {
        asset: plan.slides[2].elements.find((e) => e.kind === "image").asset,
        alt: "Existing portable study image",
      },
      panels: [1, 2].map((column) => ({
        title: rows[0][column],
        body: rows
          .slice(1)
          .map((row) => row[column])
          .join("\n"),
      })),
    },
    elements: [],
  }));
  plan.expected_slides = plan.slides.length;
  return { plan, design, model: null, folder };
}

/** Same existing source fragments under authored catalog treatments; no new content. */
export async function catalogFixture(root, templateId) {
  const folder = path.join(root, "examples/portable-deck");
  const portable = JSON.parse(
    await fs.readFile(path.join(folder, "deck-plan.json"), "utf8"),
  );
  const analytical = await analyticalFixture(root);
  const prose = (s) =>
    s.elements.find((e) => e.id === "body" || e.id === "subtitle")?.text;
  const label = (s) =>
    s.elements.find((e) => ["brand", "label"].includes(e.id))?.text;
  const photo = portable.slides[2].elements.find((e) => e.kind === "image");
  const create = (s, type, extra = {}) => ({
    title: s.title,
    composition: { type, eyebrow: label(s), body: prose(s), ...extra },
    elements: [],
  });
  const evidence = (index, kind) => {
    const s = analytical.plan.slides[index];
    const original = s.elements.find((e) => e.visual_id || e.kind === "table");
    return create(s, "evidence", {
      caption: s.elements.find((e) => e.id === "source")?.text,
      object: {
        kind,
        visual_id: original.visual_id,
        values: original.values,
        ...(kind === "diagram"
          ? {
              node_positions: Object.fromEntries(
                Object.entries(original.node_positions || {}).map(([id, p]) => [
                  id,
                  {
                    x: (p.x * 1152) / original.width,
                    y: (p.y * 316) / original.height,
                    width: (p.width * 1152) / original.width,
                    height: (p.height * 316) / original.height,
                  },
                ]),
              ),
              routes: original.routes?.map((r) => ({
                ...r,
                waypoints: r.waypoints?.map(([x, y]) => [
                  (x * 1152) / original.width,
                  (y * 316) / original.height,
                ]),
                label_box: r.label_box.map(
                  (n, i) =>
                    n * (i % 2 ? 316 / original.height : 1152 / original.width),
                ),
              })),
            }
          : {}),
      },
    });
  };
  const slides = [
    create(portable.slides[0], "cover", {
      image: { asset: photo.asset, alt: photo.alt },
    }),
    create(portable.slides[1], "topic-cover", { number: "01" }),
    create(portable.slides[2], "editorial", {
      image: { asset: photo.asset, alt: photo.alt },
    }),
    evidence(0, "chart"),
    evidence(1, "chart"),
    evidence(4, "diagram"),
    evidence(9, "table"),
    create(portable.slides[7], "closing"),
  ].map((s, i) => ({ ...s, id: `catalog-${i + 1}`, position: i + 1 }));
  return {
    plan: {
      version: 1,
      unit: "px",
      template_id: templateId,
      title: `Existing content / ${templateId}`,
      language: "en",
      expected_slides: slides.length,
      slide_size: portable.slide_size,
      slides,
    },
    design: {
      version: 1,
      canvas: { ...portable.slide_size, unit: "px" },
      catalog_treatment: true,
      colors: {},
      typography: {},
    },
    model: analytical.model,
    folder,
  };
}
