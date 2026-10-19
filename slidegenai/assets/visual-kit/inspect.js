/* Geometry checks are evidence, never an automatic beauty or inspection score. */
(() => {
  const frames = [...document.querySelectorAll(".frame")];
  function resize() {
    const overview = document.body.classList.contains("overview"),
      presenting = document.body.classList.contains("presenting"),
      toolbarHeight = document
        .querySelector("nav")
        .getBoundingClientRect().height,
      availableHeight = Math.max(1, innerHeight - toolbarHeight - 48),
      available = Math.max(1, document.documentElement.clientWidth - 48),
      track = overview
        ? parseFloat(
            getComputedStyle(document.querySelector("main"))
              .gridTemplateColumns,
          )
        : available;
    document.documentElement.style.setProperty(
      "--toolbar-height",
      toolbarHeight + "px",
    );
    for (const f of frames) {
      const s = f.firstElementChild,
        w = parseFloat(s.style.width),
        h = parseFloat(s.style.height),
        scale = Math.min(
          1,
          (overview ? Math.min(available, track, 420) : available) / w,
          presenting ? availableHeight / h : 1,
        );
      f.style.width = w * scale + "px";
      f.style.height = h * scale + "px";
      s.style.transform = `scale(${scale})`;
    }
  }
  addEventListener("resize", resize);
  resize();
  const readiness = (async () => {
    await document.fonts.ready;
    await Promise.all(
      [...document.images].map((i) => i.decode().catch(() => {})),
    );
    await new Promise((r) =>
      requestAnimationFrame(() => requestAnimationFrame(r)),
    );
  })();
  window.slidegenai = {
    ...window.slidegenai,
    ready: readiness,
    async inspect() {
      await readiness;
      const previousMode = window.slidegenai.getState().mode;
      if (previousMode === "presenting") window.slidegenai.setMode("reading");
      try {
        const issues = [];
        for (const s of document.querySelectorAll(".slide")) {
          const stage = s.getBoundingClientRect();
          for (const e of s.querySelectorAll("[data-element]")) {
            const b = e.getBoundingClientRect();
            if (
              e.scrollWidth > e.clientWidth + 1 ||
              e.scrollHeight > e.clientHeight + 1
            )
              issues.push({
                slide: s.dataset.slide,
                element: e.dataset.element,
                type: "text-or-content-overflow",
              });
            if (
              b.left < stage.left - 1 ||
              b.top < stage.top - 1 ||
              b.right > stage.right + 1 ||
              b.bottom > stage.bottom + 1
            )
              issues.push({
                slide: s.dataset.slide,
                element: e.dataset.element,
                type: "outside-stage",
              });
          }
          for (const t of s.querySelectorAll("svg text")) {
            const b = t.getBoundingClientRect();
            if (
              b.left < stage.left - 1 ||
              b.right > stage.right + 1 ||
              b.bottom > stage.bottom + 1
            )
              issues.push({
                slide: s.dataset.slide,
                type: "svg-label-outside-stage",
                text: t.textContent,
              });
          }
        }
        if (document.body.classList.contains("overview")) {
          const boxes = frames.map((f) => f.getBoundingClientRect());
          boxes.forEach((a, i) =>
            boxes.slice(i + 1).forEach((b, j) => {
              if (
                Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 &&
                Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1
              )
                issues.push({
                  type: "overview-frame-overlap",
                  frames: [i + 1, i + j + 2],
                });
            }),
          );
        }
        const fontFaces = [...document.fonts].map((f) => ({
          family: f.family,
          style: f.style,
          weight: f.weight,
          status: f.status,
        }));
        const fontsUsed = [
          ...new Map(
            [...document.querySelectorAll(".text,table,svg.chart")].map((e) => {
              const s = getComputedStyle(e),
                key = `${s.fontStyle} ${s.fontWeight} ${s.fontSize} ${s.fontFamily}`;
              return [key, { css: key, loaded: document.fonts.check(key) }];
            }),
          ).values(),
        ];
        return {
          slides: frames.length,
          fonts: fontFaces,
          fontsUsed,
          failedImages: [...document.images]
            .filter((i) => !i.complete || !i.naturalWidth)
            .map((i) => i.alt),
          issues,
          visuallyInspected: false,
          limits:
            "Inspect every slide and overview for hierarchy, collisions, crop and contrast. DOM measurements do not certify beauty.",
        };
      } finally {
        if (previousMode === "presenting")
          window.slidegenai.setMode(previousMode);
      }
    },
  };
  document.getElementById("check").onclick = async () => {
    const r = await window.slidegenai.inspect();
    document.getElementById("result").textContent =
      `${r.slides} slides; ${r.issues.length} geometry warnings; ${r.failedImages.length} failed images. Visual inspection pending.`;
    console.log(r);
  };
})();
