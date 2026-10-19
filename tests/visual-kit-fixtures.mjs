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
      path.join(
        root,
        "slidegenai/references/visual-model-example.json",
      ),
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
