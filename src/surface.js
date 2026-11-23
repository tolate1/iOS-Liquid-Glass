import { createBackdropFilter, detectCapabilities, selectRenderer } from "./optics.js";

export { detectCapabilities, selectRenderer } from "./optics.js";

const imageSupport = new WeakMap();

function probeMapImage(document) {
  let probe = imageSupport.get(document);
  if (!probe) {
    probe = { allowed: undefined };
    const image = document.createElement("img");
    probe.ready = new Promise((resolve) => {
      const finish = (allowed) => {
        probe.allowed = allowed;
        resolve();
      };
      image.addEventListener("load", () => finish(true), { once: true });
      image.addEventListener("error", () => finish(false), { once: true });
      // Same PNG transport as feImage so a restrictive page policy can select frost.
      image.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==";
    });
    imageSupport.set(document, probe);
  }
  return probe;
}

const mountedSurfaces = new WeakSet();
const solidRoles = new Set(["canvas", "content", "field", "selection"]);
const scattering = { clear: 0.22, regular: 0.48, transient: 0.9 };

export function mountGlassSurface(host, options = {}, ownedLayer) {
  const document = host.ownerDocument;
  const view = document.defaultView;
  if (!view || !host.isConnected) throw new Error("Mount GlassSurface on a connected element.");
  if (mountedSurfaces.has(host)) throw new Error("GlassSurface is already mounted on this element.");
  mountedSurfaces.add(host);

  const layer = ownedLayer ?? document.createElement("span");
  if (!ownedLayer) {
    layer.className = "lg-backdrop";
    layer.setAttribute("aria-hidden", "true");
    host.prepend(layer);
  }
  host.classList.add("lg-surface");

  const transparency = view.matchMedia("(prefers-reduced-transparency: reduce)");
  const contrast = view.matchMedia("(prefers-contrast: more)");
  const forcedColors = view.matchMedia("(forced-colors: active)");
  let frame = null;
  let filter;
  let diagnostics;
  let destroyed = false;
  let lastOpticsKey;
  let checkingImage = false;

  function clearFilter() {
    filter?.destroy();
    filter = undefined;
    lastOpticsKey = undefined;
    layer.style.removeProperty("--lg-svg-filter");
  }

  function refresh() {
    if (destroyed) return diagnostics;
    const role = options.role ?? "functional-control";
    const material = options.material ?? (role === "transient" ? "transient" : "regular");
    host.dataset.lgRole = role;
    host.dataset.lgMaterial = material;

    const capabilities = detectCapabilities(view);
    if (host.getRootNode() !== document) capabilities.svgEligible = false;
    const forceFallback = options.forceFallback ??
      new URLSearchParams(view.location.search).has("glass-fallback");
    const policy = {
      ...options,
      renderer: solidRoles.has(role) ? "opaque" : options.renderer,
      forceFallback,
      reduceTransparency: transparency.matches,
      increaseContrast: contrast.matches || forcedColors.matches,
    };
    if (selectRenderer(capabilities, policy) === "svg-backdrop") {
      const probe = probeMapImage(document);
      if (probe.allowed === undefined && !checkingImage) {
        checkingImage = true;
        probe.ready.then(schedule);
      }
      if (probe.allowed === false) capabilities.svgEligible = false;
    }
    let selected = selectRenderer(capabilities, policy);
    if (selected === "svg-backdrop") {
      const style = view.getComputedStyle(layer);
      const { width, height, borderTopLeftRadius } = style;
      const w = Number.parseFloat(width);
      const h = Number.parseFloat(height);
      const r = borderTopLeftRadius.endsWith("%")
        ? Number.parseFloat(borderTopLeftRadius) * Math.min(w, h) / 100
        : Number.parseFloat(borderTopLeftRadius);
      const key = JSON.stringify([w, h, r, view.devicePixelRatio, material]);
      try {
        if (lastOpticsKey !== key) {
          filter ??= createBackdropFilter(document, host);
          if (!filter.render(w, h, r, view.devicePixelRatio, material, scattering[material])) {
            selected = selectRenderer(capabilities, { ...policy, forceFallback: true });
          } else {
            layer.style.setProperty("--lg-svg-filter", `url("#${filter.id}")`);
            lastOpticsKey = key;
          }
        }
      } catch {
        selected = selectRenderer(capabilities, { ...policy, forceFallback: true });
      }
    }
    if (selected !== "svg-backdrop") clearFilter();
    host.dataset.lgRenderer = selected;
    diagnostics = { ...capabilities, selected, visualEvidence: "not-tested" };
    return diagnostics;
  }

  function schedule() {
    if (destroyed || frame !== null) return;
    frame = view.requestAnimationFrame(() => {
      frame = null;
      refresh();
    });
  }

  const observer = view.ResizeObserver ? new view.ResizeObserver(schedule) : null;
  observer?.observe(host, { box: "border-box" });
  view.addEventListener("resize", schedule);
  transparency.addEventListener("change", schedule);
  contrast.addEventListener("change", schedule);
  forcedColors.addEventListener("change", schedule);
  refresh();

  return {
    get diagnostics() { return diagnostics; },
    refresh,
    update(next) {
      if (destroyed) return diagnostics;
      options = { ...options, ...next };
      return refresh();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      observer?.disconnect();
      view.removeEventListener("resize", schedule);
      transparency.removeEventListener("change", schedule);
      contrast.removeEventListener("change", schedule);
      forcedColors.removeEventListener("change", schedule);
      if (frame !== null) view.cancelAnimationFrame(frame);
      clearFilter();
      if (!ownedLayer) layer.remove();
      host.classList.remove("lg-surface");
      delete host.dataset.lgMaterial;
      delete host.dataset.lgRole;
      delete host.dataset.lgRenderer;
      mountedSurfaces.delete(host);
    },
  };
}
