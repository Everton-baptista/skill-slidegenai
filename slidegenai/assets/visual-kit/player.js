/* Offline interaction only. No requests, analytics, automatic data feeds or animation. */
(() => {
  const frames = [...document.querySelectorAll(".frame")];
  const models = JSON.parse(document.getElementById("chart-model").textContent);
  const key = (slide, id) => JSON.stringify([slide, id]);
  const registry = new Map(
    models.map(({ slide, element }) => [
      key(slide, element.id),
      { slide, element },
    ]),
  );
  const tooltip = document.getElementById("chart-tooltip");
  const dialog = document.getElementById("data-dialog");
  const select = document.getElementById("chart-select");
  let mode = "reading",
    current = 0;
  const announce = (value) => {
    document.getElementById("result").textContent = value;
  };
  function showPosition() {
    document.getElementById("position").textContent =
      `${current + 1} / ${frames.length}`;
    document.getElementById("previous").disabled = current === 0;
    document.getElementById("next").disabled = current === frames.length - 1;
  }
  function refresh() {
    frames.forEach((frame, i) => {
      frame.hidden = mode === "presenting" && i !== current;
    });
    document.body.classList.toggle("presenting", mode === "presenting");
    document.body.classList.toggle("overview", mode === "overview");
    document
      .getElementById("present")
      .setAttribute("aria-pressed", String(mode === "presenting"));
    document
      .getElementById("overview")
      .setAttribute("aria-pressed", String(mode === "overview"));
    showPosition();
    tooltip.hidden = true;
    window.dispatchEvent(new Event("resize"));
  }
  function setMode(next) {
    if (!["reading", "overview", "presenting"].includes(next))
      throw Error("Unknown presentation mode");
    const previousMode = mode;
    mode = next;
    refresh();
    if (mode === "presenting") window.scrollTo(0, 0);
    else if (previousMode === "presenting")
      frames[current].scrollIntoView({ block: "start" });
  }
  function navigate(index) {
    if (!Number.isInteger(index) || index < 0 || index >= frames.length)
      throw Error("Slide index outside presentation");
    current = index;
    refresh();
    if (mode !== "presenting")
      frames[current].scrollIntoView({ block: "start" });
  }
  function syncReadingPosition() {
    if (mode !== "reading") return;
    const toolbar = document
      .querySelector("nav")
      .getBoundingClientRect().bottom;
    let best = -1;
    frames.forEach((frame, i) => {
      const b = frame.getBoundingClientRect();
      const visible = Math.max(
        0,
        Math.min(b.bottom, innerHeight) - Math.max(b.top, toolbar),
      );
      if (visible > best) {
        best = visible;
        current = i;
      }
    });
  }
  let scrollPending = false;
  addEventListener("scroll", () => {
    if (mode !== "reading" || scrollPending) return;
    scrollPending = true;
    requestAnimationFrame(() => {
      scrollPending = false;
      if (mode === "reading") {
        syncReadingPosition();
        showPosition();
      }
    });
  });
  const step = (n) =>
    navigate(Math.max(0, Math.min(frames.length - 1, current + n)));
  document.getElementById("present").onclick = () => {
    syncReadingPosition();
    setMode(mode === "presenting" ? "reading" : "presenting");
  };
  document.getElementById("overview").onclick = () =>
    setMode(mode === "overview" ? "reading" : "overview");
  document.getElementById("previous").onclick = () => step(-1);
  document.getElementById("next").onclick = () => step(1);
  document.getElementById("fullscreen").onclick = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else {
        setMode("presenting");
        await document.documentElement.requestFullscreen();
      }
    } catch {
      announce("Fullscreen unavailable. Present mode is still available.");
    }
  };
  document.addEventListener("keydown", (event) => {
    if (
      mode !== "presenting" ||
      dialog.open ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.target.closest(
        "input,textarea,select,[contenteditable=true],svg.chart",
      )
    )
      return;
    const actions = {
      ArrowRight: () => step(1),
      PageDown: () => step(1),
      ArrowLeft: () => step(-1),
      PageUp: () => step(-1),
      Home: () => navigate(0),
      End: () => navigate(frames.length - 1),
      Escape: () => setMode("reading"),
    };
    if (actions[event.key]) {
      event.preventDefault();
      actions[event.key]();
    }
  });
  function highlight(legend) {
    const chart = legend.closest("svg.chart");
    const selected = legend.getAttribute("aria-pressed") !== "true";
    chart
      .querySelectorAll("[data-legend]")
      .forEach((item) =>
        item.setAttribute("aria-pressed", String(selected && item === legend)),
      );
    chart
      .querySelectorAll("[data-series]")
      .forEach((item) =>
        item.classList.toggle(
          "series-muted",
          selected && item.dataset.series !== legend.dataset.legend,
        ),
      );
    announce(
      selected
        ? `${legend.getAttribute("aria-label")}. All values and axes retained.`
        : "All chart series emphasized equally.",
    );
  }
  document.addEventListener("click", (event) => {
    const legend = event.target.closest("[data-legend]");
    if (legend) highlight(legend);
  });
  document.addEventListener("keydown", (event) => {
    const legend = event.target.closest("[data-legend]");
    if (legend && ["Enter", " "].includes(event.key)) {
      event.preventDefault();
      highlight(legend);
    }
  });
  function showDetail(target, x, y) {
    tooltip.textContent = target.dataset.detail;
    tooltip.hidden = false;
    const bounds = tooltip.getBoundingClientRect();
    tooltip.style.left = `${Math.max(8, Math.min(x + 12, innerWidth - bounds.width - 8))}px`;
    tooltip.style.top = `${Math.max(8, Math.min(y + 12, innerHeight - bounds.height - 8))}px`;
  }
  document.addEventListener("pointerover", (event) => {
    const mark = event.target.closest("[data-detail]");
    if (mark) showDetail(mark, event.clientX, event.clientY);
  });
  document.addEventListener("pointerout", (event) => {
    if (event.target.closest("[data-detail]")) tooltip.hidden = true;
  });
  document.addEventListener("focusin", (event) => {
    const mark = event.target.closest("[data-detail]");
    if (mark) {
      const b = mark.getBoundingClientRect();
      showDetail(mark, b.left, b.bottom);
    }
  });
  document.addEventListener("focusout", (event) => {
    if (event.target.closest("[data-detail]")) tooltip.hidden = true;
  });
  for (const [id, model] of registry) {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = `${model.slide} / ${model.element.visual.id || model.element.id}`;
    select.append(option);
  }
  function showData() {
    const model = registry.get(select.value);
    if (!model) return;
    const v = model.element.visual;
    const rows =
      v.type === "scatter"
        ? [
            ["Series", v.x_unit || "X", v.y_unit || "Y"],
            ...v.series.flatMap((s) => s.points.map((p) => [s.name, p.x, p.y])),
          ]
        : [
            [v.unit || "Values", ...v.series.map((s) => s.name)],
            ...v.categories.map((c, i) => [
              c,
              ...v.series.map((s) => s.values[i]),
            ]),
          ];
    const table = document.createElement("table");
    const caption = table.createCaption();
    caption.textContent = `${v.source.status}: ${v.source.label}`;
    for (const [index, row] of rows.entries()) {
      const tr = table.insertRow();
      row.forEach((value) => {
        const cell = document.createElement(index === 0 ? "th" : "td");
        if (index === 0) cell.scope = "col";
        cell.textContent = String(value);
        tr.append(cell);
      });
    }
    document.getElementById("data-values").replaceChildren(table);
  }
  select.onchange = showData;
  document.getElementById("chart-data").onclick = () => {
    const onSlide = [...registry.entries()].find(
      ([, model]) =>
        model.slide === frames[current].firstElementChild.dataset.slide,
    );
    if (onSlide) select.value = onSlide[0];
    showData();
    dialog.showModal();
  };
  document.getElementById("close-data").onclick = () => dialog.close();
  function updateChart(slide, id, visual) {
    const model = registry.get(key(slide, id));
    if (!model) throw Error("Unknown slide/chart ID");
    const candidate = structuredClone(visual);
    validateChart(candidate);
    if (
      model.element.color_by_category &&
      (candidate.type !== "grouped-bar" || candidate.series.length !== 1)
    )
      throw Error("Category colors require one grouped-bar series");
    const element = { ...model.element, visual: candidate };
    const svg = [...document.querySelectorAll("svg.chart")].find(
      (e) =>
        e.dataset.chart === id && e.closest(".slide").dataset.slide === slide,
    );
    if (!svg) throw Error("Chart not found in presentation");
    const html = chartSVG(element);
    svg.outerHTML = html;
    registry.set(key(slide, id), { slide, element });
    tooltip.hidden = true;
    if (dialog.open) showData();
    announce("Chart updated for this session. Rebuild to save changes.");
    return { slide, chart: id, updated: true, persisted: false };
  }
  window.slidegenai = {
    setMode,
    navigate,
    updateChart,
    getChart: (slide, id) => {
      const model = registry.get(key(slide, id));
      if (!model) throw Error("Unknown slide/chart ID");
      return structuredClone(model.element.visual);
    },
    getState: () => ({ mode, index: current, slides: frames.length }),
  };
  refresh();
})();
