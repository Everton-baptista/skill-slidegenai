/** Visual regression of existing source content, never 177 beauty certifications. */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import assert from "node:assert/strict";
import { compile, json } from "../slidegenai/assets/visual-kit/core.mjs";
import { catalogFixture } from "./visual-kit-fixtures.mjs";
import { renderHTML } from "../slidegenai/assets/visual-kit/html.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.resolve(process.argv[2]);
await fs.mkdir(out);
const names = { "acid-graphix":"Acid Rave", default:"Neo-Tech", cyberpunk:"Cyberpunk", "fashion-editorial":"NOVA", "premium-travel":"Ultimate Luxury", bauhaus:"Bauhaus", "urban-vivid":"Neo Tokyo", kinetic:"Kinetic", "education-modern":"Corporate & Education" };
const ids = [
  "acid-graphix",
  "default",
  "cyberpunk",
  "fashion-editorial",
  "premium-travel",
  "bauhaus",
  "urban-vivid",
  "kinetic",
  "education-modern",
];
const { chromium } = await import(
  process.env.SLIDEGENAI_PLAYWRIGHT || "playwright"
);
const browser = await chromium.launch({
  headless: true,
  ...(process.env.SLIDEGENAI_BROWSER_EXECUTABLE
    ? { executablePath: process.env.SLIDEGENAI_BROWSER_EXECUTABLE }
    : {}),
});
const evidence = [];
try {
  const page = await browser.newPage({
    viewport: { width: 1400, height: 1000 },
    deviceScaleFactor: 1,
  });
  const errors = [];
  const requests = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route("**/*", (r) => {
    if (/^https?:/.test(r.request().url())) {
      requests.push(r.request().url());
      return r.abort();
    }
    return r.continue();
  });
  for (const id of ids) {
    const shared = process.argv[3] === "shared";
    const fixture = shared ? await catalogFixture(root, id) : null;
    const folder =
      fixture?.folder || path.join(root, "slidegenai/assets/style-references");
    const plan =
      fixture?.plan || (await json(path.join(folder, id + ".plan.json")));
    const design =
      fixture?.design || (await json(path.join(folder, id + ".design.json")));
    const model =
      fixture?.model || (await json(path.join(folder, id + ".visuals.json")));
    const scene = await compile(plan, design, model, folder);
    if (shared) await page.setContent(await renderHTML(scene));
    else {
      await fs.writeFile(path.join(out, id + ".html"), await renderHTML(scene));
      await page.goto(pathToFileURL(path.join(out, id + ".html")).href);
    }
    await page.evaluate(() => window.slidegenai.ready);
    const report = await page.evaluate(() => window.slidegenai.inspect());
    evidence.push({
      id,
      fontFamilies: scene.fonts.map((f) => f.family),
      layout: scene.style.visual.layout,
      ...report,
    });
    const frames = page.locator(".frame");
    for (let i = 0; i < plan.slides.length; i++)
      if (!shared || i === 0 || i === 3 || report.issues.length)
        await frames
          .nth(i)
          .screenshot({ path: path.join(out, `${id}-${i + 1}.png`) });
    await page.locator("#overview").click();
    await page.screenshot({
      path: path.join(out, id + "-overview.png"),
      fullPage: true,
    });
  }
  await fs.writeFile(
    path.join(out, "catalog-evidence.json"),
    JSON.stringify({ evidence, errors, requests }, null, 2),
  );
  await fs.writeFile(
    path.join(out, "index.html"),
    `<!doctype html><html lang="en"><meta name="viewport" content="width=device-width"><title>Catalog treatment review</title><style>body{margin:0;background:#101217;color:#f3f2ee;font:16px system-ui;padding:40px}h1{font-size:48px;letter-spacing:-2px;margin:0 0 16px}p{max-width:900px;color:#bec3cf;line-height:1.6}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(380px,100%),1fr));gap:28px;margin-top:40px}a{color:inherit;text-decoration:none}img{width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:4px}h2{font-weight:500;font-size:22px}a:focus-visible{outline:3px solid #caff50}</style><h1>Nine visual directions.</h1><p>Explore image direction, expressive typography and data components. These two-slide reference pairs reproduce the existing fictional studies with portable fonts. The shared catalog system covers 177 IDs; this gallery is a selected visual reference collection.</p><main>${ids.map((id) => `<a href="${id}.html"><img src="${id}-1.png" alt="${id} cover composition"><h2>${names[id]}</h2></a>`).join("")}</main></html>`,
  );
  console.log(
    JSON.stringify(
      evidence.map((e) => ({
        id: e.id,
        issues: e.issues,
        failedImages: e.failedImages,
      })),
      null,
      2,
    ),
  );
  assert.deepEqual(errors, []);
  assert.deepEqual(requests, []);
  assert.ok(
    evidence.every(
      (e) => e.failedImages.length === 0 && e.fontsUsed.every((f) => f.loaded),
    ),
  );
  assert.ok(
    evidence.every((e) => e.issues.length === 0),
    "Inspect and repair catalog fit issues; screenshots were retained.",
  );
} finally {
  await browser.close();
}
