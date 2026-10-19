import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  compile,
  json,
  resolveStyle,
  validateChart,
  validateDiagram,
  image,
  local,
  compose,
} from "../brand-presentations/assets/visual-kit/core.mjs";
import {
  renderHTML,
  chartSVG,
} from "../brand-presentations/assets/visual-kit/html.mjs";
import { build } from "../brand-presentations/assets/visual-kit/build.mjs";
import { analyticalFixture } from "./visual-kit-fixtures.mjs";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."),
  example = path.join(root, "examples/portable-deck");
const source = async () => ({
  plan: await json(path.join(example, "deck-plan.json")),
  design: await json(path.join(example, "design-system.json")),
});
const temp = async (fn) => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "visual-kit-test-"));
  try {
    return await fn(dir);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
};
test("existing eight-slide plan compiles without mutating source or inheriting verification", async () => {
  const { plan, design } = await source(),
    before = JSON.stringify(plan),
    scene = await compile(plan, design, null, example);
  assert.equal(scene.slides.length, 8);
  assert.equal(JSON.stringify(plan), before);
  assert.ok(scene.warnings.some((w) => w.includes("Arial")));
  assert.equal(scene.fonts[0].family, "Manrope");
  await temp(async (dir) => {
    const out = path.join(dir, "html");
    const report = await build({
      plan: path.join(example, "deck-plan.json"),
      design: path.join(example, "design-system.json"),
      format: "html",
      out,
    });
    assert.equal(report.visually_inspected, false);
    assert.equal(report.rendered, false);
    const html = await fs.readFile(path.join(out, "presentation.html"), "utf8");
    assert.match(html, /data:font\/ttf;base64/);
    assert.match(html, /data:image\/png;base64/);
    assert.doesNotMatch(html, /<(?:script|link)[^>]+(?:src|href)=/);
    await assert.rejects(
      () =>
        build({
          plan: path.join(example, "deck-plan.json"),
          design: path.join(example, "design-system.json"),
          format: "html",
          out,
        }),
      /EEXIST/,
    );
  });
});
test("all 177 styles resolve executable font defaults without 177 renderers", async () => {
  const catalog = await json(
    path.join(root, "brand-presentations/references/template-catalog.json"),
  );
  for (const entry of catalog.templates) {
    const style = await resolveStyle(entry.id);
    assert.equal(style.family, entry.family);
    assert.ok(style.body && style.display && style.label);
  }
  assert.equal(catalog.templates.length, 177);
  await assert.rejects(() => resolveStyle("does-not-exist"), /Unknown/);
});
test("legacy px and explicit pt preserve physical size; mismatches fail", async () => {
  const { plan, design } = await source();
  delete plan.unit;
  assert.equal((await compile(plan, design, null, example)).unitScale, 1);
  plan.unit = "pt";
  await assert.rejects(
    () => compile(plan, design, null, example),
    /units differ/,
  );
  design.canvas.unit = "pt";
  assert.equal((await compile(plan, design, null, example)).unitScale, 96 / 72);
});
test("count, geometry, duplicate IDs and font scale reject invalid data", async () => {
  for (const mutate of [
    (p) => p.expected_slides++,
    (p) => (p.slides[0].elements[0].x = -1),
    (p) => (p.slides[0].elements[0].font_size = NaN),
    (p) => p.slides[0].elements.push(p.slides[0].elements[0]),
    (p) => (p.slides[0].elements[0].width = 9000),
  ]) {
    const { plan, design } = await source();
    mutate(plan);
    await assert.rejects(() => compile(plan, design, null, example));
  }
});
test("all composition recipes produce measured content and required images are enforced", async () => {
  const { plan, design } = await source();
  for (const type of [
    "cover",
    "topic-cover",
    "editorial",
    "full-image",
    "statement",
    "comparison",
    "closing",
  ]) {
    const slide = {
      ...plan.slides[0],
      elements: [],
      composition: {
        type,
        body: "Existing content",
        number: "01",
        image: { asset: "assets/editorial.png" },
        panels: [
          { title: "A", body: "One" },
          { title: "B", body: "Two" },
        ],
      },
    };
    const els = compose(slide, design.canvas, design);
    assert.ok(els.length >= 2);
    assert.ok(els.every((e) => e.width > 0 && e.height > 0));
  }
  assert.throws(
    () =>
      compose({ composition: { type: "full-image" } }, design.canvas, design),
    /requires/,
  );
});
test("local assets reject traversal, network and active SVG; retain passive SVG", async () => {
  await temp(async (dir) => {
    for (const name of [
      "../outside.png",
      "https://example.com/x.png",
      "/etc/passwd",
      ".env",
    ])
      await assert.rejects(() => local(dir, name));
    for (const svg of [
      "<svg><script>foo()</script></svg>",
      '<svg><image href="https://example.com/a"/></svg>',
      "<svg><style>text{fill:red}</style></svg>",
    ]) {
      await fs.writeFile(path.join(dir, "bad.svg"), svg);
      await assert.rejects(() => image(dir, "bad.svg"), /passive/);
    }
    await fs.writeFile(
      path.join(dir, "safe.svg"),
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10" fill="#fff"/></svg>',
    );
    assert.equal((await image(dir, "safe.svg")).mime, "image/svg+xml");
  });
});
test("text and style input cannot execute HTML or JavaScript", async () => {
  const { plan, design } = await source();
  plan.slides[0].elements[0].text =
    "</script><script>alert(1)</script> Ação e coração";
  const scene = await compile(plan, design, null, example),
    html = await renderHTML(scene);
  assert.match(html, /&lt;\/script&gt;&lt;script&gt;/);
  assert.match(html, /Ação e coração/);
  plan.slides[0].elements[0].effect = { radius: "1;bad()" };
  await assert.rejects(() => compile(plan, design, null, example));
});
test("analytical fixtures retain four chart models and every diagram relationship", async () => {
  const { plan, design, model } = await analyticalFixture(root),
    scene = await compile(plan, design, model, root);
  assert.equal(scene.slides.length, 10);
  assert.equal(
    scene.slides.flatMap((s) => s.elements).filter((e) => e.kind === "chart")
      .length,
    4,
  );
  for (const e of scene.slides
    .flatMap((s) => s.elements)
    .filter((e) => e.primitives)) {
    const labels = e.primitives
      .filter((p) => p.kind === "text")
      .map((p) => p.text);
    for (const n of e.visual.nodes)
      assert.ok(labels.some((x) => x.includes(n.label)));
    for (const [i, edge] of (e.visual.edges || []).entries())
      assert.ok(e.primitives.some((p) => p.id.startsWith(`edge-${i}-`)));
  }
  const html = await renderHTML(scene);
  assert.match(html, /<table /);
  assert.equal((html.match(/<svg role="img"/g) || []).length, 4);
});
test("negative data, unequal lengths, shares and independent scatter are handled explicitly", () => {
  const chart = {
    type: "grouped-bar",
    categories: ["A", "B"],
    series: [{ name: "Values", values: [-10, 20] }],
    source: { status: "illustrative", label: "Test" },
  };
  validateChart(chart);
  assert.match(
    chartSVG({
      visual: chart,
      width: 700,
      height: 360,
      x: 0,
      y: 0,
      color: "#000000",
      palette: ["#FF0000"],
    }),
    />-10</,
  );
  chart.series[0].values = [1];
  assert.throws(() => validateChart(chart), /length/);
  chart.series[0].values = [40, 50];
  chart.type = "stacked-share";
  assert.throws(() => validateChart(chart), /total/);
  assert.throws(
    () =>
      validateChart({
        type: "scatter",
        series: [
          { name: "A", points: [{ x: 1, y: 2 }] },
          { name: "B", points: [{ x: 2, y: 3 }] },
        ],
        source: chart.source,
      }),
    /common X/,
  );
});
test("diagram invalid endpoints, dates, lanes and matrix indices fail", () => {
  for (const d of [
    {
      type: "process",
      nodes: [{ id: "a", label: "A" }],
      edges: [{ from: "a", to: "missing" }],
    },
    {
      type: "roadmap",
      nodes: [{ id: "a", label: "A", start: "no-date", end: "2027-01-01" }],
    },
    {
      type: "swimlane",
      lanes: ["One"],
      nodes: [{ id: "a", label: "A", lane: "Other" }],
    },
    {
      type: "matrix",
      rows: ["A"],
      columns: ["B"],
      nodes: [{ id: "a", label: "A", row: 3, column: 0 }],
    },
  ])
    assert.throws(() => validateDiagram(d));
});
test("missing required photo fails before writing output", async () => {
  await temp(async (dir) => {
    const { plan, design } = await source();
    plan.slides[0].elements = [
      {
        id: "missing",
        kind: "image",
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        asset: "no-image.png",
      },
    ];
    await fs.writeFile(path.join(dir, "plan.json"), JSON.stringify(plan));
    await fs.writeFile(path.join(dir, "design.json"), JSON.stringify(design));
    const out = path.join(dir, "output");
    await assert.rejects(() =>
      build({
        plan: path.join(dir, "plan.json"),
        design: path.join(dir, "design.json"),
        format: "html",
        out,
      }),
    );
    await assert.rejects(() => fs.access(out));
  });
});
test(
  "optional native adapter produces a native artifact from the existing analytical fixture",
  { skip: !process.env.SLIDEGENAI_NATIVE_KIT },
  async () => {
    const { plan, design, model } = await analyticalFixture(root),
      scene = await compile(plan, design, model, root);
    const { renderPPTX } = await import(
      pathToFileURL(path.join(process.env.SLIDEGENAI_NATIVE_KIT, "pptx.mjs"))
    );
    const warnings = [];
    const bytes = await renderPPTX(scene, warnings);
    assert.ok(bytes.length > 10000);
    assert.ok(warnings.some((w) => w.includes("free segments")));
    await temp(async (dir) => {
      await fs.writeFile(path.join(dir, "native.pptx"), bytes);
    });
  },
);
test(
  "native images, gradients, masks, table and chart stay separate editable objects",
  { skip: !process.env.SLIDEGENAI_NATIVE_KIT },
  async () => {
    const { createRequire } = await import("node:module");
    const require = createRequire(
        path.join(process.env.SLIDEGENAI_NATIVE_KIT, "package.json"),
      ),
      JSZip = require("jszip");
    const { plan, design } = await source();
    plan.slides[0].elements.push({
      id: "reading-gradient",
      kind: "shape",
      x: 0,
      y: 0,
      width: 1280,
      height: 100,
      fill: "#000000",
      effect: {
        gradient: {
          from: "#000000",
          to: "#000000",
          from_opacity: 0.8,
          to_opacity: 0,
          direction: "right",
        },
      },
    });
    const photo = plan.slides
      .flatMap((s) => s.elements)
      .find((e) => e.kind === "image");
    photo.effect = { mask: "organic" };
    const scene = await compile(plan, design, null, example),
      { renderPPTX } = await import(
        pathToFileURL(path.join(process.env.SLIDEGENAI_NATIVE_KIT, "pptx.mjs"))
      ),
      zip = await JSZip.loadAsync(await renderPPTX(scene, []));
    const slides = Object.keys(zip.files).filter((n) =>
      /^ppt\/slides\/slide\d+\.xml$/.test(n),
    );
    assert.equal(slides.length, 8);
    const xml = (
      await Promise.all(slides.map((n) => zip.file(n).async("string")))
    ).join("");
    assert.match(xml, /<a:gradFill/);
    assert.match(xml, /<a:custGeom/);
    assert.match(xml, /<p:pic>/);
    assert.match(xml, /<a:tbl>/);
    assert.match(xml, /<c:chart/);
    assert.match(xml, /Learning/);
    assert.ok(Object.keys(zip.files).some((n) => n.endsWith(".xlsx")));
  },
);

test("composition foreground contrasts with dark slide and comparison surfaces", async () => {
  const { plan, design } = await source();
  design.colors.accent = "#172B4D";
  const cover = compose(
    {
      ...plan.slides[0],
      background: "#172B4D",
      composition: { type: "cover" },
    },
    design.canvas,
    design,
  );
  assert.equal(cover.find((e) => e.kind === "text").color, "#FFFFFF");
  const comparison = compose(
    {
      ...plan.slides[0],
      composition: {
        type: "comparison",
        panels: [
          { title: "A", body: "One" },
          { title: "B", body: "Two" },
        ],
      },
    },
    design.canvas,
    design,
  );
  assert.equal(
    comparison.find((e) => e.id === "panel-title-1").color,
    "#FFFFFF",
  );
  assert.equal(
    comparison.find((e) => e.id === "panel-body-1").color,
    "#FFFFFF",
  );
});
