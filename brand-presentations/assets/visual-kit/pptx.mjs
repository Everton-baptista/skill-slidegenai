/** Optional native adapter. Does not flatten a complete slide. */
import { esc } from "./core.mjs";
export async function renderPPTX(scene, warnings) {
  let PptxGenJS, JSZip;
  try {
    PptxGenJS = (await import("pptxgenjs")).default;
    JSZip = (await import("jszip")).default;
  } catch {
    throw Error(
      "PPTX needs optional dependencies: run npm ci --ignore-scripts in assets/visual-kit. HTML needs no dependencies.",
    );
  }
  const p = new PptxGenJS(),
    dpi = scene.canvas.unit === "pt" ? 72 : 96,
    toIn = (n) => n / dpi,
    toPt = (n) => n * (72 / dpi),
    rgb = (c) => c.replace("#", "");
  p.defineLayout({
    name: "ADAPTIVE",
    width: toIn(scene.canvas.width),
    height: toIn(scene.canvas.height),
  });
  p.layout = "ADAPTIVE";
  p.title = scene.title;
  p.author = "SlideGenAI Skill";
  p.lang = scene.language;
  const patches = new Map(),
    position = (e) => ({
      x: toIn(e.x),
      y: toIn(e.y),
      w: toIn(e.width),
      h: toIn(e.height),
    });
  function text(s, e) {
    s.addText(e.text, {
      ...position(e),
      objectName: esc(e.id),
      fontFace: e.font_family,
      fontSize: toPt(e.font_size),
      bold: e.font_weight >= 600,
      italic: e.italic,
      color: rgb(e.color),
      align: e.align || "left",
      margin: 0,
      vertAnchor: "top",
      breakLine: false,
      lineSpacingMultiple: e.line_height,
      transparency: 0,
      ...(e.effect?.tag
        ? { fill: { color: rgb(e.fill) }, margin: toPt(8) }
        : {}),
    });
    if (![400, 700].includes(e.font_weight))
      warnings.push(
        `${e.id}: native weight ${e.font_weight} maps to ${e.font_weight >= 600 ? "bold" : "regular"}; inspect actual rendering`,
      );
    if (e.effect?.tag)
      warnings.push(
        `${e.id}: native tag uses an editable filled textbox; inspect padding and corners`,
      );
    if (e.effect?.outline)
      warnings.push(
        `${e.id}: PPTX uses filled editable text instead of CSS outline; inspect or replace in the native editor`,
      );
  }
  function shape(s, e) {
    s.addShape(
      e.shape === "diamond"
        ? p.ShapeType.diamond
        : e.effect?.mask === "ellipse"
          ? p.ShapeType.ellipse
          : p.ShapeType.rect,
      {
        ...position(e),
        objectName: esc(e.id),
        fill: { color: rgb(e.fill) },
        line: {
          color: rgb(e.line || e.fill),
          transparency: e.line ? 0 : 100,
          width: 1,
        },
        radius: e.effect?.radius ? toIn(e.effect.radius) : 0,
      },
    );
  }
  function nativeChart(s, e) {
    const v = e.visual;
    let data,
      type =
        v.type === "grouped-bar" || v.type === "stacked-share"
          ? p.ChartType.bar
          : v.type === "scatter"
            ? p.ChartType.scatter
            : p.ChartType.line;
    if (v.type === "scatter")
      data = [
        { name: v.x_unit || "X", values: v.series[0].points.map((p) => p.x) },
        ...v.series.map((s) => ({
          name: s.name,
          values: s.points.map((p) => p.y),
        })),
      ];
    else
      data = v.series.map((s) => ({
        name: s.name,
        labels: v.categories,
        values:
          v.type === "stacked-share" ? s.values.map((n) => n / 100) : s.values,
      }));
    const values = v.series.flatMap((s) =>
        v.type === "scatter" ? s.points.map((p) => p.y) : s.values,
      ),
      lo = Math.min(0, ...values),
      hi = Math.max(0, ...values);
    s.addChart(type, data, {
      ...position(e),
      objectName: esc(e.id),
      showTitle: false,
      showValAxisTitle: true,
      valAxisTitle:
        v.type === "scatter" ? v.y_unit || v.unit || "Y" : v.unit || "Values",
      valAxisTitleFontFace: e.font_family,
      valAxisTitleFontSize: toPt(e.font_size * 0.6),
      valAxisTitleColor: rgb(e.color),
      showCatAxisTitle: v.type === "scatter",
      catAxisTitle: v.x_unit || "X",
      catAxisTitleColor: rgb(e.color),
      catAxisTitleFontFace: e.font_family,
      catAxisTitleFontSize: toPt(e.font_size * 0.6),
      showLegend: v.series.length > 1,
      legendPos: "b",
      legendFontFace: e.font_family,
      legendFontSize: toPt(e.font_size * 0.65),
      legendColor: rgb(e.color),
      chartColors: e.palette.slice(0, v.series.length).map(rgb),
      catAxisLabelFontFace: e.font_family,
      catAxisLabelFontSize: toPt(e.font_size * 0.65),
      catAxisLabelColor: rgb(e.color),
      valAxisLabelFontFace: e.font_family,
      valAxisLabelFontSize: toPt(e.font_size * 0.65),
      valAxisLabelColor: rgb(e.color),
      valGridLine: { color: "DCE3EB", width: 0.5 },
      valAxisMinVal: lo,
      valAxisMaxVal: hi === lo ? hi + 1 : hi,
      showValue: false,
      showMarker: true,
      lineDataSymbol: "circle",
      lineSize: v.type === "scatter" ? 0 : 2,
      showCatName: false,
      chartArea: { fill: { color: rgb(e.slideBackground) } },
      plotArea: { fill: { color: rgb(e.slideBackground) } },
      ...(v.type === "grouped-bar"
        ? { barDir: "col", barGrouping: "clustered" }
        : {}),
      ...(v.type === "stacked-share"
        ? {
            barDir: "col",
            barGrouping: "stacked",
            barOverlapPct: 100,
            valAxisMinVal: 0,
            valAxisMaxVal: 1,
            valAxisMajorUnit: 0.25,
            valAxisLabelFormatCode: "0%",
          }
        : {}),
    });
  }
  for (const [index, spec] of scene.slides.entries()) {
    const s = p.addSlide();
    s.background = { color: rgb(spec.background) };
    s.addNotes(
      `Visual inspection pending. ${spec.elements
        .filter((e) => e.visual?.source)
        .map((e) => e.visual.source.label)
        .join(
          "; ",
        )}. Native font resolution must be checked in the actual viewer.`,
    );
    const edits = [];
    for (const raw of spec.elements) {
      const e = { ...raw, slideBackground: spec.background },
        f = e.effect || {};
      if (e.kind === "text") text(s, e);
      else if (e.image) {
        const pos = position(e);
        s.addImage({
          data: e.image.data,
          ...pos,
          sizing: { type: e.fit, w: pos.w, h: pos.h },
          objectName: esc(e.id),
          altText: e.alt || "",
        });
        if (e.focal_point && e.focal_point.some((v) => v !== 0.5))
          warnings.push(
            `${spec.id}/${e.id}: native image uses centered crop; adjust focal point in PowerPoint`,
          );
      } else if (e.kind === "table")
        s.addTable(
          e.values.map((row, i) =>
            row.map((value) => ({
              text: String(value),
              options: {
                fill: rgb(i ? e.body_fill : e.header_fill),
                color: rgb(i ? e.color : e.header_color),
                bold: i === 0,
              },
            })),
          ),
          {
            ...position(e),
            objectName: esc(e.id),
            fontFace: e.font_family,
            fontSize: toPt(e.font_size),
            rowH: toIn(e.height / e.values.length),
            colW: Array(e.values[0].length).fill(
              toIn(e.width / e.values[0].length),
            ),
            margin: toPt(10),
            autoPage: false,
            border: { type: "solid", color: "DCE3EB", pt: 0.5 },
          },
        );
      else if (e.kind === "chart") nativeChart(s, e);
      else if (e.primitives) {
        for (const q of e.primitives) {
          const child = {
            ...e,
            ...q,
            id: `${e.id}/${q.id}`,
            x: e.x + q.x,
            y: e.y + q.y,
            effect: {},
            primitives: null,
          };
          if (q.kind === "text") text(s, child);
          else if (q.kind === "shape") shape(s, child);
          else {
            const [x, y] = q.a,
              [u, v] = q.b;
            s.addShape(p.ShapeType.line, {
              objectName: esc(child.id),
              x: toIn(e.x + Math.min(x, u)),
              y: toIn(e.y + Math.min(y, v)),
              w: toIn(Math.abs(u - x)),
              h: toIn(Math.abs(v - y)),
              flipH: u < x,
              flipV: v < y,
              line: {
                color: rgb(q.color),
                width: 1.5,
                ...(q.arrow ? { endArrowType: "triangle" } : {}),
              },
            });
          }
        }
        warnings.push(
          `${spec.id}/${e.id}: native diagram lines are editable free segments; reroute them after moving nodes`,
        );
      } else shape(s, e);
      if (f.gradient || f.mask || f.radius)
        edits.push({ id: e.id, effect: f, kind: e.kind });
    }
    patches.set(`ppt/slides/slide${index + 1}.xml`, edits);
  }
  const zip = await JSZip.loadAsync(
    await p.write({ outputType: "nodebuffer" }),
  );
  for (const [name, edits] of patches) {
    let xml = await zip.file(name).async("string");
    for (const edit of edits) {
      let matched = false;
      xml = xml.replace(/<p:(sp|pic)>([\s\S]*?)<\/p:\1>/g, (block) => {
        if (!block.includes(`name="${esc(edit.id)}"`)) return block;
        matched = true;
        let output = block;
        if (edit.effect.gradient && edit.kind === "shape") {
          const g = edit.effect.gradient,
            stop = (at, c, alpha) =>
              `<a:gs pos="${at}"><a:srgbClr val="${rgb(c)}"><a:alpha val="${Math.round(alpha * 100000)}"/></a:srgbClr></a:gs>`;
          const fill = `<a:gradFill rotWithShape="1"><a:gsLst>${stop(0, g.from, g.from_opacity)}${stop(100000, g.to, g.to_opacity)}</a:gsLst><a:lin ang="${g.direction === "right" ? 0 : 5400000}" scaled="1"/></a:gradFill>`;
          output = output.replace(
            /<p:spPr>([\s\S]*?)<\/p:spPr>/,
            (all, body) =>
              "<p:spPr>" +
              body.replace(/<a:solidFill>[\s\S]*?<\/a:solidFill>/, fill) +
              "</p:spPr>",
          );
        }
        const mask = edit.effect.mask;
        if (mask === "ellipse" || mask === "organic" || edit.effect.radius) {
          const geom =
            mask === "organic"
              ? '<a:custGeom><a:avLst/><a:gdLst/><a:ahLst/><a:cxnLst/><a:rect l="0" t="0" r="r" b="b"/><a:pathLst><a:path w="100" h="100"><a:moveTo><a:pt x="8" y="9"/></a:moveTo>' +
                [
                  [58, 0],
                  [94, 16],
                  [100, 68],
                  [73, 100],
                  [20, 91],
                  [0, 52],
                ]
                  .map(([x, y]) => `<a:lnTo><a:pt x="${x}" y="${y}"/></a:lnTo>`)
                  .join("") +
                "<a:close/></a:path></a:pathLst></a:custGeom>"
              : `<a:prstGeom prst="${mask === "ellipse" ? "ellipse" : "roundRect"}"><a:avLst/></a:prstGeom>`;
          output = output.replace(
            /<a:prstGeom\b[^>]*>[\s\S]*?<\/a:prstGeom>/,
            geom,
          );
          if (edit.effect.radius)
            warnings.push(
              `${edit.id}: CSS radius maps to native roundRect preset; inspect corner geometry`,
            );
        }
        return output;
      });
      if (!matched)
        throw Error(`Could not translate native effect: ${edit.id}`);
    }
    zip.file(name, xml);
  }
  // Normalize only the library's dangling master declarations / one-level categories.
  const ct = await zip.file("[Content_Types].xml").async("string");
  zip.file(
    "[Content_Types].xml",
    ct.replace(/<Override\b[^>]*\/>/g, (t) => {
      const n = t.match(/PartName="([^"]+)"/)?.[1];
      return n &&
        /^\/ppt\/slideMasters\/slideMaster\d+\.xml$/.test(n) &&
        !zip.file(n.slice(1))
        ? ""
        : t;
    }),
  );
  for (const name of Object.keys(zip.files).filter((n) =>
    /^ppt\/charts\/chart\d+\.xml$/.test(n),
  )) {
    let x = await zip.file(name).async("string");
    x = x.replace(
      /<c:multiLvlStrRef>([\s\S]*?)<\/c:multiLvlStrRef>/g,
      (all, body) =>
        (body.match(/<c:lvl>/g) || []).length === 1
          ? "<c:strRef>" +
            body
              .replaceAll("c:multiLvlStrCache", "c:strCache")
              .replace(/<\/?c:lvl>/g, "") +
            "</c:strRef>"
          : all,
    );
    zip.file(name, x);
  }
  return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
}
