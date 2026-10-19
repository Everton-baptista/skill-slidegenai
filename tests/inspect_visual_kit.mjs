/** Maintainer browser regression of existing content. Not an aesthetic grader. */
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";
import assert from "node:assert/strict";
import { compile, json } from "../slidegenai/assets/visual-kit/core.mjs";
import { renderHTML } from "../slidegenai/assets/visual-kit/html.mjs";
import {
  analyticalFixture,
  compositionFixture,
} from "./visual-kit-fixtures.mjs";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { chromium } = await import(
  process.env.SLIDEGENAI_PLAYWRIGHT || "playwright"
);
const out = process.argv[2]
  ? path.resolve(process.argv[2])
  : await fs.mkdtemp(path.join(os.tmpdir(), "visual-kit-browser-"));
if (process.argv[2]) await fs.mkdir(out);
const browser = await chromium.launch({
  headless: true,
  ...(process.env.SLIDEGENAI_BROWSER_EXECUTABLE
    ? { executablePath: process.env.SLIDEGENAI_BROWSER_EXECUTABLE }
    : {}),
});
try {
  const page = await browser.newPage({
      viewport: { width: 1400, height: 1000 },
      deviceScaleFactor: 1,
    }),
    network = [],
    errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/*", (route) => {
    if (/^https?:/.test(route.request().url())) {
      network.push(route.request().url());
      return route.abort();
    }
    return route.continue();
  });
  const evidence = {
    kind: "Geometry and resource evidence; visual review pending",
    cases: [],
  };
  for (const name of ["portable", "analytical", "compositions"]) {
    const folder = path.join(root, "examples/portable-deck");
    const { plan, design, model } =
      name === "portable"
        ? {
            plan: await json(path.join(folder, "deck-plan.json")),
            design: await json(path.join(folder, "design-system.json")),
            model: null,
          }
        : name === "compositions"
          ? await compositionFixture(root)
          : await analyticalFixture(root);
    const scene = await compile(
        plan,
        design,
        model,
        name === "analytical" ? root : folder,
      ),
      file = path.join(out, name + ".html");
    await fs.writeFile(file, await renderHTML(scene));
    await page.goto(pathToFileURL(file).href);
    await page.evaluate(() => window.slidegenai.ready);
    const result = await page.evaluate(() => window.slidegenai.inspect());
    assert.equal(result.slides, plan.expected_slides);
    assert.deepEqual(result.failedImages, []);
    assert.deepEqual(result.issues, []);
    assert.ok(result.fontsUsed.every((f) => f.loaded));
    assert.ok(
      result.fonts.some((f) => f.family === "Manrope" && f.status === "loaded"),
    );
    assert.deepEqual(network, []);
    const frames = page.locator(".frame");
    for (let i = 0; i < (await frames.count()); i++)
      await frames
        .nth(i)
        .screenshot({ path: path.join(out, `${name}-${i + 1}.png`) });
    await page.locator("#overview").click();
    assert.deepEqual(
      (await page.evaluate(() => window.slidegenai.inspect())).issues,
      [],
    );
    await page.screenshot({
      path: path.join(out, name + "-overview.png"),
      fullPage: true,
    });
    await page.locator("#overview").click();
    // Exercise the actual offline player, not just emitted markup.
    await page.evaluate(() => {
      window.slidegenai.navigate(0);
      window.slidegenai.setMode("presenting");
    });
    assert.equal(await frames.filter({ visible: true }).count(), 1);
    await page.locator("#next").click();
    assert.equal(
      await page.evaluate(() => window.slidegenai.getState().index),
      1,
    );
    await page.keyboard.press("End");
    assert.equal(
      await page.evaluate(() => window.slidegenai.getState().index),
      plan.expected_slides - 1,
    );
    await page.keyboard.press("Home");
    assert.equal(
      await page.evaluate(() => window.slidegenai.getState().index),
      0,
    );
    assert.deepEqual(
      (await page.evaluate(() => window.slidegenai.inspect())).issues,
      [],
    );
    assert.equal(
      await page.evaluate(() => window.slidegenai.getState().mode),
      "presenting",
    );
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(
      () =>
        new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        ),
    );
    assert.ok(
      await frames.first().evaluate((e) => {
        const r = e.getBoundingClientRect(),
          nav = document.querySelector("nav").getBoundingClientRect();
        return (
          r.left >= 0 &&
          r.right <= innerWidth + 1 &&
          r.top >= nav.bottom - 1 &&
          r.bottom <= innerHeight + 1
        );
      }),
    );
    if (name === "analytical")
      await page.screenshot({ path: path.join(out, "mobile-present.png") });
    await page.emulateMedia({ media: "print" });
    assert.equal(
      await frames.filter({ visible: true }).count(),
      plan.expected_slides,
    );
    await page.emulateMedia({ media: "screen" });
    await page.setViewportSize({ width: 1400, height: 1000 });
    await page.keyboard.press("Escape");
    assert.equal(
      await page.evaluate(() => window.slidegenai.getState().mode),
      "reading",
    );
    if (name === "analytical") {
      const charts = scene.slides.flatMap((s) =>
        s.elements
          .filter((e) => e.kind === "chart")
          .map((e) => ({ slide: s.id, id: e.id })),
      );
      const chart = page.locator("svg.chart").first();
      const legend = chart.locator("[data-legend]").first();
      await legend.click();
      assert.equal(await legend.getAttribute("aria-pressed"), "true");
      assert.ok((await chart.locator(".series-muted").count()) > 0);
      await legend.press("Enter");
      assert.equal(await legend.getAttribute("aria-pressed"), "false");
      const mark = chart.locator("[data-detail]").first();
      await mark.focus();
      assert.equal(
        await page.locator("#chart-tooltip").innerText(),
        await mark.getAttribute("data-detail"),
      );
      await page.locator(".player-menu summary").click();
      await page.locator("#chart-data").click();
      assert.ok(await page.locator("#data-dialog").isVisible());
      assert.ok((await page.locator("#data-values td").count()) > 0);
      await page.screenshot({ path: path.join(out, "chart-data-dialog.png") });
      await page.locator("#close-data").click();
      for (const item of charts) {
        const update = await page.evaluate(({ slide, id }) => {
          const before = window.slidegenai.getChart(slide, id);
          const invalid = structuredClone(before);
          if (invalid.type === "scatter") invalid.series[0].points[0].y = null;
          else invalid.series[0].values[0] = "bad value";
          let rejected = false;
          try {
            window.slidegenai.updateChart(slide, id, invalid);
          } catch {
            rejected = true;
          }
          if (
            !rejected ||
            JSON.stringify(before) !==
              JSON.stringify(window.slidegenai.getChart(slide, id))
          )
            throw Error("Invalid chart changed model");
          const next = structuredClone(before);
          if (next.type === "scatter") next.series[0].points[0].y += 10;
          else if (next.type === "stacked-share") {
            next.series[0].values[0] += 1;
            next.series[1].values[0] -= 1;
          } else next.series[0].values[0] = -35;
          next.source.label = "</script><img src=x onerror=alert(1)>";
          const result = window.slidegenai.updateChart(slide, id, next);
          return {
            result,
            expected: next,
            actual: window.slidegenai.getChart(slide, id),
          };
        }, item);
        assert.deepEqual(update.actual, update.expected);
        assert.equal(update.result.persisted, false);
      }
      assert.equal(await page.locator("img[src=x]").count(), 0);
      assert.deepEqual(
        (await page.evaluate(() => window.slidegenai.inspect())).issues,
        [],
      );
      const chartSlide = scene.slides.findIndex((s) =>
        s.elements.some((e) => e.kind === "chart"),
      );
      await page.evaluate((i) => {
        window.slidegenai.navigate(i);
        window.slidegenai.setMode("presenting");
      }, chartSlide);
      await page.screenshot({ path: path.join(out, "interactive-chart.png") });
      await page.emulateMedia({ media: "print" });
      await page.pdf({
        path: path.join(out, "analytical-from-present-mode.pdf"),
        preferCSSPageSize: true,
        printBackground: true,
      });
      await page.emulateMedia({ media: "screen" });
      await page.evaluate(() => window.slidegenai.setMode("reading"));
      const adversarial = structuredClone(scene);
      const unsafeChart = adversarial.slides
        .flatMap((s) => s.elements)
        .find((e) => e.kind === "chart");
      unsafeChart.visual.source.label =
        '</script><img id="chart-injection" src=x onerror="window.chartInjected=true">';
      await page.setContent(await renderHTML(adversarial));
      await page.evaluate(() => window.slidegenai.ready);
      assert.equal(await page.locator("#chart-injection").count(), 0);
      assert.equal(
        await page.evaluate(() => Boolean(window.chartInjected)),
        false,
      );
      assert.deepEqual(network, []);
    }
    assert.deepEqual(errors, []);
    // Assert the inspector detects real long text instead of clipping it silently.
    await page
      .locator(".text")
      .first()
      .evaluate((e) => {
        e.textContent = "Ação, coração e informação. ".repeat(300);
      });
    assert.ok(
      (await page.evaluate(() => window.slidegenai.inspect())).issues.some(
        (i) => i.type === "text-or-content-overflow",
      ),
    );
    evidence.cases.push({ name, ...result, networkRequests: [] });
  }
  await fs.writeFile(
    path.join(out, "browser-evidence.json"),
    JSON.stringify(evidence, null, 2),
  );
  console.log(`Browser regressions passed; inspect screenshots in ${out}`);
} finally {
  await browser.close();
}
