#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { compile, json, skill, local } from "./core.mjs";
import { renderHTML } from "./html.mjs";
export async function build({
  plan: planFile,
  design: designFile,
  visuals: visualFile,
  format,
  out: output,
}) {
  if (!["html", "pptx"].includes(format))
    throw Error("Use --format html or pptx");
  const destination = path.resolve(output),
    source = path.dirname(path.resolve(planFile));
  if (destination === skill || destination.startsWith(skill + path.sep))
    throw Error("Output must be outside the installed skill");
  // Resolve existing ancestors as well as lexical paths: an output parent can
  // be a symlink into the installed skill even when its spelling is outside it.
  let ancestor = path.dirname(destination);
  const suffix = [path.basename(destination)];
  while (true) {
    try {
      ancestor = await fs.realpath(ancestor);
      break;
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      const parent = path.dirname(ancestor);
      if (parent === ancestor) throw error;
      suffix.unshift(path.basename(ancestor));
      ancestor = parent;
    }
  }
  const canonicalDestination = path.join(ancestor, ...suffix),
    canonicalSkill = await fs.realpath(skill);
  if (
    canonicalDestination === canonicalSkill ||
    canonicalDestination.startsWith(canonicalSkill + path.sep)
  )
    throw Error(
      "Output must be outside the installed skill, including symlinked parents",
    );
  if (path.dirname(path.resolve(designFile)) !== source)
    throw Error("Keep plan and design in the same working folder");
  const plan = await json(planFile),
    design = await json(designFile),
    visuals = visualFile ? await json(visualFile) : null;
  const scene = await compile(plan, design, visuals, source),
    warnings = [...scene.warnings];
  const content =
    format === "html"
      ? await renderHTML(scene)
      : await (await import("./pptx.mjs")).renderPPTX(scene, warnings);
  // The complete artifact is prepared before any output mutation. Directory creation
  // is exclusive; failure removes only the directory created by this invocation.
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.mkdir(destination);
  try {
    const artifact =
      format === "html" ? "presentation.html" : "presentation.pptx";
    await fs.writeFile(path.join(destination, artifact), content, {
      flag: "wx",
    });
    await fs.mkdir(path.join(destination, "licenses"));
    for (const file of new Set(scene.fonts.map((f) => f.license))) {
      const source = await local(path.join(skill, "assets/fonts"), file);
      await fs.writeFile(
        path.join(destination, "licenses", file.replaceAll("/", "-")),
        await fs.readFile(source),
        { flag: "wx" },
      );
    }
    const report = {
      skill_version: (
        await fs.readFile(path.join(skill, "VERSION"), "utf8")
      ).trim(),
      format,
      artifact,
      artifact_sha256: createHash("sha256").update(content).digest("hex"),
      slides: scene.slides.map((s) => s.id),
      style: {
        id: scene.style.id,
        family: scene.style.family,
        visual_treatment: scene.catalog_treatment
          ? "authored catalog treatment"
          : "explicit scene",
        provenance: scene.catalog_treatment
          ? scene.style.visual.provenance
          : "Explicit scene geometry and design; template_id alone supplies font suggestions",
      },
      fonts: scene.fonts.map((f) => ({
        family: f.family,
        path: f.record.path,
        sha256: f.record.sha256,
        style: f.record.style,
        weight_range: f.record.weight_range,
      })),
      font_verification:
        format === "html"
          ? "Embedded original faces; run window.slidegenai.inspect() in the actual browser"
          : "Requested native font families; register bundled fonts and inspect actual viewer/export; fonts are not embedded",
      warnings: [...new Set(warnings)],
      rendered: false,
      visually_inspected: false,
      remaining: [
        "Inspect all slides and overview; fix fit, hierarchy, crop and contrast.",
        "For PPTX render the actual export and verify font substitutions and native objects.",
      ],
    };
    await fs.writeFile(
      path.join(destination, "render-report.json"),
      JSON.stringify(report, null, 2) + "\n",
      { flag: "wx" },
    );
    return report;
  } catch (error) {
    await fs.rm(destination, { recursive: true, force: true });
    throw error;
  }
}
let invokedDirectly = false;
if (process.argv[1]) {
  try {
    invokedDirectly =
      (await fs.realpath(process.argv[1])) ===
      (await fs.realpath(fileURLToPath(import.meta.url)));
  } catch {
    /* Importing from stdin/test hosts does not invoke the CLI. */
  }
}
if (invokedDirectly) {
  try {
    const args = process.argv.slice(2);
    if (args.includes("--help")) {
      console.log(
        "node build.mjs --plan FILE --design FILE [--visuals FILE] --format html|pptx --out NEW_DIRECTORY",
      );
      process.exit(0);
    }
    const options = {};
    for (let i = 0; i < args.length; i += 2) {
      if (
        !["--plan", "--design", "--visuals", "--format", "--out"].includes(
          args[i],
        ) ||
        !args[i + 1] ||
        args[i + 1].startsWith("--") ||
        args[i].slice(2) in options
      )
        throw Error("Unknown, duplicate or missing option");
      options[args[i].slice(2)] = args[i + 1];
    }
    for (const k of ["plan", "design", "format", "out"])
      if (!options[k]) throw Error(`Missing --${k}`);
    console.log(JSON.stringify(await build(options), null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
