import fs from "node:fs/promises";
import { esc, home, validateChart } from "./core.mjs";
import path from "node:path";
const rgba = (hex, opacity) =>
  `rgba(${[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(",")},${opacity})`;
const box = (e) =>
  `left:${e.x}px;top:${e.y}px;width:${e.width}px;height:${e.height}px;`;
function css(e) {
  const f = e.effect || {},
    g = f.gradient;
  return `${box(e)}color:${e.color};font-family:${JSON.stringify(e.font_family || "sans-serif")};font-size:${e.font_size || 24}px;font-weight:${e.font_weight || 400};font-style:${e.italic ? "italic" : "normal"};line-height:${e.line_height || 1.15};text-align:${e.align || "left"};${f.outline ? `-webkit-text-stroke:${f.outline}px ${e.color};color:transparent;` : ""}${f.tag ? `background:${e.fill};padding:8px 14px;border-radius:999px;` : ""}${f.radius ? `border-radius:${f.radius}px;` : ""}${f.mask === "ellipse" ? "clip-path:ellipse(50% 50% at 50% 50%);" : f.mask === "organic" ? "clip-path:polygon(8% 9%,58% 0%,94% 16%,100% 68%,73% 100%,20% 91%,0% 52%);" : ""}${g ? `background:linear-gradient(to ${g.direction},${rgba(g.from, g.from_opacity)},${rgba(g.to, g.to_opacity)});` : ""}`;
}
export function chartSVG(e) {
  // Keep this renderer self-contained: the browser uses this exact function.
  const esc = (v) =>
    String(v ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const box = (v) =>
    `left:${v.x}px;top:${v.y}px;width:${v.width}px;height:${v.height}px;`;
  const mark = (series, label) =>
    `data-series="${series}" data-detail="${esc(label)}" tabindex="0" role="img" aria-label="${esc(label)}"`;

  const v = e.visual,
    W = e.width,
    H = e.height,
    L = 60,
    T = 24,
    R = W - 30,
    B = H - 78,
    PW = R - L,
    PH = B - T,
    font = Math.min(17, H / 18),
    palette = e.palette;
  let low = 0,
    high = 0,
    xlow = 0,
    xhigh = 1;
  const vals = v.series.flatMap((s) =>
    v.type === "scatter" ? s.points.map((p) => p.y) : s.values,
  );
  low = Math.min(0, ...vals);
  high = v.type === "stacked-share" ? 100 : Math.max(0, ...vals);
  if (high === low) high = low + 1;
  if (v.type === "scatter") {
    const xs = v.series.flatMap((s) => s.points.map((p) => p.x));
    xlow = Math.min(0, ...xs);
    xhigh = Math.max(0, ...xs);
    if (xlow === xhigh) xhigh = xlow + 1;
  }
  const Y = (n) => B - ((n - low) / (high - low)) * PH,
    X = (n) => L + ((n - xlow) / (xhigh - xlow)) * PW;
  let svg = `<svg role="group" data-chart="${esc(e.id)}" aria-roledescription="interactive chart" aria-label="${esc(v.source.label)}; ${esc(v.unit || "Values")}" viewBox="0 0 ${W} ${H}" class="chart" style="${box(e)}color:${e.color};font-family:${esc(e.font_family)}"><title>${esc(v.id)}</title>`;
  const text = (x, y, s, anchor = "middle", fill = e.color) =>
    `<text x="${x}" y="${y}" font-size="${font}" fill="${fill}" text-anchor="${anchor}">${esc(s)}</text>`;
  for (let i = 0; i <= 4; i++) {
    const value = low + ((high - low) * i) / 4,
      y = Y(value);
    svg +=
      `<path d="M ${L} ${y} H ${R}" stroke="${e.color}" stroke-opacity=".18"/>` +
      text(L - 8, y + font / 3, Number(value.toFixed(2)), "end");
  }
  if (low < 0 && high > 0) {
    svg += `<path d="M ${L} ${Y(0)} H ${R}" stroke="${e.color}" stroke-opacity=".65"/>`;
    if (
      !Array.from({ length: 5 }, (_, i) => low + ((high - low) * i) / 4).some(
        (n) => Math.abs(n) < 1e-8,
      )
    )
      svg += text(L - 8, Y(0) + font / 3, "0", "end");
  }
  const N = v.categories?.length || 1;
  if (v.type !== "scatter")
    v.categories.forEach((c, i) => {
      svg += text(L + ((i + 0.5) * PW) / N, B + font * 1.5, c);
    });
  if (v.type === "grouped-bar")
    v.series.forEach((s, j) =>
      s.values.forEach((value, i) => {
        const slot = PW / N,
          bw = (slot * 0.72) / v.series.length,
          x = L + i * slot + slot * 0.14 + j * bw;
        svg += `<rect ${mark(j, `${s.name} / ${v.categories[i]}: ${value} ${v.unit || ""}`)} x="${x}" y="${Math.min(Y(value), Y(0))}" width="${bw * 0.9}" height="${Math.abs(Y(value) - Y(0))}" fill="${palette[j % palette.length]}"><title>${esc(s.name)} / ${esc(v.categories[i])}: ${value}</title></rect>`;
      }),
    );
  if (v.type === "stacked-share")
    v.categories.forEach((_, i) => {
      let sum = 0;
      v.series.forEach((s, j) => {
        const val = s.values[i],
          y = Y(sum + val),
          height = Y(sum) - y;
        svg += `<rect ${mark(j, `${s.name} / ${v.categories[i]}: ${val}%`)} x="${L + ((i + 0.15) * PW) / N}" y="${y}" width="${(PW / N) * 0.7}" height="${height}" fill="${palette[j % palette.length]}"><title>${esc(s.name)}: ${val}%</title></rect>`;
        sum += val;
      });
    });
  if (v.type === "line")
    v.series.forEach((s, j) => {
      const points = s.values.map((n, i) => [L + ((i + 0.5) * PW) / N, Y(n)]);
      svg += `<polyline data-series="${j}" points="${points.map((p) => p.join(",")).join(" ")}" fill="none" stroke="${palette[j % palette.length]}" stroke-width="3"/>`;
      points.forEach(
        ([x, y], i) =>
          (svg += `<circle ${mark(j, `${s.name} / ${v.categories[i]}: ${s.values[i]} ${v.unit || ""}`)} cx="${x}" cy="${y}" r="4" fill="${palette[j % palette.length]}"><title>${esc(s.name)}: ${s.values[i]}</title></circle>`),
      );
    });
  if (v.type === "scatter") {
    for (let i = 0; i <= 4; i++) {
      const n = xlow + ((xhigh - xlow) * i) / 4;
      svg += text(X(n), B + font * 1.5, Number(n.toFixed(2)));
    }
    v.series.forEach((s, j) =>
      s.points.forEach(
        (p) =>
          (svg += `<circle ${mark(j, `${s.name}: ${p.x} ${v.x_unit || "X"}, ${p.y} ${v.y_unit || "Y"}`)} cx="${X(p.x)}" cy="${Y(p.y)}" r="5" fill="${palette[j % palette.length]}"><title>${esc(s.name)}: ${p.x}, ${p.y}</title></circle>`),
      ),
    );
  }
  v.series.forEach((s, j) => {
    const x = L + (j * PW) / v.series.length;
    svg +=
      `<g class="chart-legend" data-legend="${j}" role="button" tabindex="0" aria-pressed="false" aria-label="${esc(`Highlight ${s.name}`)}"><rect x="${x}" y="${B + font * 2.4}" width="${font * 0.65}" height="${font * 0.65}" fill="${palette[j % palette.length]}"/>` +
      text(x + font, B + font * 3, s.name, "start") +
      "</g>";
  });
  svg += text(
    L,
    font,
    v.type === "scatter"
      ? `${v.y_unit || "Y"} / X: ${v.x_unit || "X"}`
      : v.unit || "Values",
    "start",
  );
  return svg + "</svg>";
}
function primitive(p, parent) {
  const e = {
    ...parent,
    ...p,
    x: parent.x + p.x,
    y: parent.y + p.y,
    effect: {},
  };
  if (p.kind === "text")
    return `<div class="element text" data-element="${esc(parent.id + "/" + p.id)}" style="${esc(css(e))}">${esc(p.text)}</div>`;
  if (p.kind === "shape")
    return `<div class="element" style="${esc(box(e))}background:${p.fill};border:1px solid ${p.line || p.fill};${p.shape === "diamond" ? "clip-path:polygon(50% 0%,100% 50%,50% 100%,0% 50%);" : ""}"></div>`;
  const x1 = parent.x + p.a[0],
    y1 = parent.y + p.a[1],
    x2 = parent.x + p.b[0],
    y2 = parent.y + p.b[1],
    angle = Math.atan2(y2 - y1, x2 - x1),
    length = Math.hypot(x2 - x1, y2 - y1);
  return `<div class="segment" style="left:${x1}px;top:${y1}px;width:${length}px;background:${p.color};transform:rotate(${angle}rad)">${p.arrow ? `<i style="border-left-color:${p.color}"></i>` : ""}</div>`;
}
function element(e) {
  const attrs = `class="element ${e.kind === "text" ? "text" : ""}" data-element="${esc(e.id)}" style="${esc(css(e))}`;
  if (e.kind === "text") return `<div ${attrs}">${esc(e.text)}</div>`;
  if (e.image)
    return `<img ${attrs}object-fit:${e.fit};object-position:${(e.focal_point?.[0] ?? 0.5) * 100}% ${(e.focal_point?.[1] ?? 0.5) * 100}%;" alt="${esc(e.alt || "")}" src="${e.image.data}">`;
  if (e.kind === "chart")
    return (
      chartSVG(e) + `<span class="sr-only">${esc(e.visual.source.label)}</span>`
    );
  if (e.primitives) return e.primitives.map((p) => primitive(p, e)).join("");
  if (e.kind === "table")
    return `<table ${attrs}border-collapse:collapse;"><tbody>${e.values.map((r, i) => `<tr>${r.map((c) => `<${i ? "td" : "th"} style="background:${i ? e.body_fill : e.header_fill};color:${i ? e.color : e.header_color}">${esc(c)}</${i ? "td" : "th"}>`).join("")}</tr>`).join("")}</tbody></table>`;
  return `<div ${attrs}${e.effect.gradient ? "" : `background:${e.fill};`}"></div>`;
}
export async function renderHTML(scene) {
  const cssFile = await fs.readFile(path.join(home, "visual.css"), "utf8"),
    runtime = await fs.readFile(path.join(home, "inspect.js"), "utf8"),
    player = await fs.readFile(path.join(home, "player.js"), "utf8");
  const faces = [];
  for (const font of scene.fonts) {
    const bytes = await fs.readFile(font.file),
      r = font.record;
    faces.push(
      `@font-face{font-family:${JSON.stringify(font.family)};src:url(data:font/ttf;base64,${bytes.toString("base64")}) format('truetype');font-style:${r.style};font-weight:${r.weight_range.join(" ")};font-display:block}`,
    );
  }
  const sections = scene.slides
    .map(
      (s) =>
        `<article class="frame" aria-label="${esc(s.title)}"><section class="slide" data-slide="${esc(s.id)}" aria-label="${esc(s.title)}" style="width:${scene.canvas.width}px;height:${scene.canvas.height}px;background:${s.background}">${s.elements.map(element).join("")}</section></article>`,
    )
    .join("");
  const chartData = scene.slides.flatMap((s) =>
    s.elements
      .filter((e) => e.kind === "chart")
      .map((e) => ({ slide: s.id, element: e })),
  );
  const data = JSON.stringify(chartData)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
  return `<!doctype html><html lang="${esc(scene.language)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(scene.title)}</title><style>${faces.join("\n")}\n${cssFile}\n@media print{@page{size:${(scene.canvas.width * scene.unitScale) / 96}in ${(scene.canvas.height * scene.unitScale) / 96}in;margin:0}.frame{width:${scene.canvas.width * scene.unitScale}px!important;height:${scene.canvas.height * scene.unitScale}px!important}.slide{transform:scale(${scene.unitScale})!important}}</style></head><body><nav aria-label="Presentation controls"><button id="present" aria-pressed="false">Present</button><button id="previous" aria-label="Previous slide">←</button><output id="position" aria-live="polite"></output><button id="next" aria-label="Next slide">→</button><button id="overview" aria-pressed="false">Overview / reading</button><button id="chart-data" ${chartData.length ? "" : "hidden"}>Chart data</button><button id="fullscreen">Fullscreen</button><button id="check">Check fonts and fit</button><output id="result" role="status">Visual inspection pending</output></nav><main>${sections}</main><div id="chart-tooltip" role="status" hidden></div><dialog id="data-dialog" aria-labelledby="data-title"><h2 id="data-title">Chart data</h2><label>Chart <select id="chart-select"></select></label><div id="data-values"></div><button id="close-data">Close</button></dialog><script type="application/json" id="chart-model">${data}</script><script>${chartSVG.toString()}\n${validateChart.toString()}\n${player}\n${runtime}</script></body></html>`;
}
