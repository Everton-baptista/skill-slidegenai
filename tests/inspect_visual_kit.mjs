/** Maintainer browser regression of existing content. Not an aesthetic grader. */
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";
import assert from "node:assert/strict";
import {
  compile,
  json,
} from "../brand-presentations/assets/visual-kit/core.mjs";
import { renderHTML } from "../brand-presentations/assets/visual-kit/html.mjs";
import { analyticalFixture } from "./visual-kit-fixtures.mjs";
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
    network = [];
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
  for (const name of ["portable", "analytical"]) {
    const folder = path.join(root, "examples/portable-deck");
    const { plan, design, model } =
      name === "portable"
        ? {
            plan: await json(path.join(folder, "deck-plan.json")),
            design: await json(path.join(folder, "design-system.json")),
            model: null,
          }
        : await analyticalFixture(root);
    const scene = await compile(
        plan,
        design,
        model,
        name === "portable" ? folder : root,
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
