import { mountGlassSurface } from "./surface.js";

// Runflow L49 separates the content under the dock from the material and labels.
export function mountGlassDock(dock, { content, layout, ...options } = {}) {
  const view = dock.ownerDocument.defaultView;
  if ((content && (content.ownerDocument !== dock.ownerDocument || content.contains(dock))) ||
      (layout && !layout.contains(dock))) {
    throw new Error("Use a content layer separate from the dock and a layout that contains the dock.");
  }
  const surface = mountGlassSurface(dock, options);
  dock.dataset.lgDock = "";
  const events = new view.AbortController();
  const listen = { signal: events.signal };
  const transparency = view.matchMedia("(prefers-reduced-transparency: reduce)");
  const contrast = view.matchMedia("(prefers-contrast: more), (forced-colors: active)");
  const supportsMask = view.CSS.supports("mask-composite", "exclude");
  let frame;
  let lastKey;

  function clearMask() {
    if (!content) return;
    delete content.dataset.lgDockOverlap;
    for (const variable of ["x", "y", "w", "h"]) content.style.removeProperty(`--lg-dock-${variable}`);
  }

  function refresh() {
    frame = undefined;
    const fixed = view.getComputedStyle(dock).position === "fixed";
    const rect = dock.getBoundingClientRect();
    if (layout) {
      if (fixed) layout.style.setProperty("--lg-dock-reserve", `${Math.ceil(rect.height + 36)}px`);
      else layout.style.removeProperty("--lg-dock-reserve");
    }
    if (!content || !fixed || !supportsMask || transparency.matches || contrast.matches || !rect.height) {
      clearMask();
      lastKey = undefined;
      return;
    }
    const target = content.getBoundingClientRect();
    const bounds = [rect.left - target.left - 12, rect.top - target.top - 10, rect.width + 24, rect.height + 20];
    const key = bounds.map(Math.round).join();
    if (key === lastKey) return;
    lastKey = key;
    content.dataset.lgDockOverlap = "";
    ["x", "y", "w", "h"].forEach((variable, index) => {
      content.style.setProperty(`--lg-dock-${variable}`, `${bounds[index]}px`);
    });
  }

  function schedule() {
    if (frame === undefined) frame = view.requestAnimationFrame(refresh);
  }

  view.addEventListener("scroll", schedule, { ...listen, capture: true, passive: true });
  view.addEventListener("resize", schedule, listen);
  transparency.addEventListener("change", schedule, listen);
  contrast.addEventListener("change", schedule, listen);
  const observer = new view.ResizeObserver(schedule);
  observer.observe(dock);
  if (content) observer.observe(content);
  refresh();

  return {
    get diagnostics() { return surface.diagnostics; },
    update: surface.update,
    destroy() {
      events.abort();
      observer.disconnect();
      view.cancelAnimationFrame(frame);
      clearMask();
      delete dock.dataset.lgDock;
      layout?.style.removeProperty("--lg-dock-reserve");
      surface.destroy();
    },
  };
}
