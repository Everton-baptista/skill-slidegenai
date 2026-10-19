/** Actual browser interaction checks for the portable player's compact controls. */
import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
const { chromium } = await import(
  process.env.SLIDEGENAI_PLAYWRIGHT || "playwright"
);
const file = path.resolve(process.argv[2]),
  out = path.resolve(process.argv[3]);
await fs.mkdir(out);
const browser = await chromium.launch({
  headless: true,
  ...(process.env.SLIDEGENAI_BROWSER_EXECUTABLE
    ? { executablePath: process.env.SLIDEGENAI_BROWSER_EXECUTABLE }
    : {}),
});
try {
  const page = await browser.newPage({
      viewport: { width: 1400, height: 1000 },
    }),
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route("**/*", (r) =>
    /^https?:/.test(r.request().url())
      ? (errors.push("Unexpected network request"), r.abort())
      : r.continue(),
  );
  await page.goto(pathToFileURL(file).href);
  await page.evaluate(() => window.slidegenai.ready);
  const pt = await page.evaluate(() =>
    document.documentElement.lang.startsWith("pt"),
  );
  assert.equal(
    await page.locator("#present").getAttribute("aria-label"),
    pt ? "Apresentar" : "Present",
  );
  await page.locator("#present").click();
  assert.equal(
    await page.locator("#present").getAttribute("aria-label"),
    pt ? "Sair" : "Exit",
  );
  assert.equal(await page.locator("#previous").isDisabled(), true);
  await page.locator("#next").focus();
  await page.keyboard.press("Enter");
  assert.equal(
    await page.evaluate(() => window.slidegenai.getState().index),
    1,
  );
  await page.keyboard.press("Home");
  assert.equal(
    await page.evaluate(() => window.slidegenai.getState().index),
    0,
  );
  await page.locator(".player-menu summary").focus();
  await page.keyboard.press("Enter");
  assert.equal(await page.locator(".player-menu").getAttribute("open"), "");
  await page.keyboard.press("Escape");
  assert.equal(
    await page.evaluate(() => document.querySelector(".player-menu").open),
    false,
  );
  assert.equal(
    await page.evaluate(() => window.slidegenai.getState().mode),
    "presenting",
  );
  await page.locator("#fullscreen").click();
  await page.waitForFunction(
    () =>
      !!document.fullscreenElement &&
      document.getElementById("fullscreen").getAttribute("aria-pressed") ===
        "true",
  );
  assert.equal(
    await page.locator("#fullscreen").getAttribute("aria-pressed"),
    "true",
  );
  await page.locator("#fullscreen").click();
  await page.waitForFunction(
    () =>
      !document.fullscreenElement &&
      document.getElementById("fullscreen").getAttribute("aria-pressed") ===
        "false",
  );
  assert.equal(
    await page.locator("#fullscreen").getAttribute("aria-pressed"),
    "false",
  );
  await page
    .locator("nav")
    .screenshot({ path: path.join(out, "toolbar-desktop.png") });
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await page.evaluate(
      () =>
        new Promise((r) =>
          requestAnimationFrame(() => requestAnimationFrame(r)),
        ),
    );
    const bounds = await page.locator("nav").boundingBox();
    assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= width + 1);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
    );
    assert.ok(await page.locator("#next").isVisible());
    await page.screenshot({ path: path.join(out, `mobile-${width}.png`) });
  }
  await page.setViewportSize({ width: 1400, height: 1000 });
  await page.locator("#overview").click();
  assert.equal(
    await page.evaluate(() => window.slidegenai.getState().mode),
    "overview",
  );
  await page.locator("#overview").click();
  assert.equal(
    await page.evaluate(() => window.slidegenai.getState().mode),
    "reading",
  );
  await page.locator("#present").click();
  await page.emulateMedia({ media: "print" });
  assert.equal(await page.locator("nav").isVisible(), false);
  assert.equal(
    await page.locator(".frame:visible").count(),
    await page.evaluate(() => window.slidegenai.getState().slides),
  );
  assert.deepEqual(errors, []);
  await fs.writeFile(
    path.join(out, "evidence.json"),
    JSON.stringify(
      {
        browser: await browser.version(),
        locale: pt ? "pt" : "en",
        fullscreen: "Entered and exited through real button gestures",
        widths: [1400, 390, 320],
        keyboard:
          "Enter navigation; Home; Escape closes options without exiting presentation",
        print: "All slides visible; toolbar hidden",
        errors,
      },
      null,
      2,
    ),
  );
  console.log("Player control browser checks passed.");
} finally {
  await browser.close();
}
