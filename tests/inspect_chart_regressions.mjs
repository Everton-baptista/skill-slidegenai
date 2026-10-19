/** Browser checks of chart fixes using existing data, not a new demo deck. */
import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { chartSVG } from "../slidegenai/assets/visual-kit/html.mjs";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { chromium } = await import(
  process.env.SLIDEGENAI_PLAYWRIGHT || "playwright"
);
const model = JSON.parse(
  await fs.readFile(
    path.join(root, "slidegenai/references/visual-model-example.json"),
    "utf8",
  ),
);
const category = structuredClone(
  model.charts.find((c) => c.type === "grouped-bar"),
);
category.series = category.series.slice(0, 1);
const negative = structuredClone(category);
negative.series[0].values = negative.categories.map(
  (_, i) => i - negative.categories.length,
);
const stacked = model.charts.find((c) => c.type === "stacked-share");
const base = {
  id: "regression",
  x: 0,
  y: 0,
  width: 800,
  height: 400,
  color: "#172B4D",
  font_family: "sans-serif",
  palette: ["#AA0000", "#0000BB", "#23803F", "#AA6200"],
  orientation: "horizontal",
};
const cases = [
  {
    name: "negative-values",
    element: {
      ...base,
      orientation: "vertical",
      show_values: true,
      visual: negative,
    },
  },
  {
    name: "horizontal-category",
    element: { ...base, color_by_category: true, visual: category },
  },
  { name: "horizontal-stacked", element: { ...base, visual: stacked } },
];
const out = path.resolve(process.argv[2]);
await fs.mkdir(out);
const browser = await chromium.launch({
  headless: true,
  ...(process.env.SLIDEGENAI_BROWSER_EXECUTABLE
    ? { executablePath: process.env.SLIDEGENAI_BROWSER_EXECUTABLE }
    : {}),
});
try {
  const page = await browser.newPage({ viewport: { width: 820, height: 420 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route("**/*", (route) => {
    errors.push("Unexpected network request");
    return route.abort();
  });
  for (const c of cases) {
    await page.setContent(
      `<style>body{margin:10px;background:white}svg{width:800px;height:400px}</style>${chartSVG(c.element)}`,
    );
    const marks = await page.locator("rect[data-series]").evaluateAll((nodes) =>
      nodes.map((n) => ({
        x: +n.getAttribute("x"),
        y: +n.getAttribute("y"),
        width: +n.getAttribute("width"),
        height: +n.getAttribute("height"),
        fill: n.getAttribute("fill"),
        detail: n.getAttribute("data-detail"),
      })),
    );
    assert.ok(marks.length > 0);
    assert.ok(
      marks.every(
        (m) =>
          [m.x, m.y, m.width, m.height].every(Number.isFinite) &&
          m.width >= 0 &&
          m.height > 0 &&
          m.x >= 0 &&
          m.x + m.width <= 800.01 &&
          m.y + m.height <= 400,
      ),
    );
    if (c.name === "horizontal-category")
      assert.deepEqual(
        marks.map((m) => m.fill),
        category.categories.map(
          (_, i) => base.palette[i % base.palette.length],
        ),
      );
    else if (c.name === "horizontal-stacked") {
      for (let i = 0; i < stacked.categories.length; i++) {
        const row = marks.slice(
          i * stacked.series.length,
          (i + 1) * stacked.series.length,
        );
        assert.ok(row.every((m) => m.y === row[0].y));
        for (let j = 1; j < row.length; j++)
          assert.ok(
            Math.abs(row[j - 1].x + row[j - 1].width - row[j].x) < 1e-7,
          );
      }
    }
    if (c.name === "negative-values") {
      const regions = await page.locator("svg text").evaluateAll((nodes) => {
        const label = nodes
          .filter((n) => n.textContent === "-4")
          .map((n) => n.getBoundingClientRect().bottom);
        const category = nodes
          .find((n) => n.textContent === "North")
          .getBoundingClientRect();
        return { valueBottom: Math.max(...label), categoryTop: category.top };
      });
      assert.ok(regions.valueBottom < regions.categoryTop);
    }
    await page.screenshot({ path: path.join(out, `${c.name}.png`) });
  }
  assert.deepEqual(errors, []);
  await fs.writeFile(
    path.join(out, "browser-evidence.json"),
    JSON.stringify(
      {
        cases: cases.map((c) => c.name),
        browser: await browser.version(),
        errors,
        scope:
          "Existing chart data rendered in browser; not host authoring or aesthetic certification",
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
console.log(JSON.stringify({ passed: cases.length, output: out }));
