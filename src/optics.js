import {
  createLiquidGlassDisplacementPixels,
  isKnownBackdropSvgFilterUnsupported,
} from "../skills/ios-liquid-glass/assets/core/liquid-glass-core.js";

const svgNamespace = "http://www.w3.org/2000/svg";
const profiles = { clear: "prominent", regular: "standard", transient: "soft" };
const cacheLimit = 12;
const caches = new WeakMap();
let nextId = 0;

export function detectCapabilities(view = globalThis) {
  const supports = (value) =>
    Boolean(view.CSS?.supports("backdrop-filter", value) ||
      view.CSS?.supports("-webkit-backdrop-filter", value));
  return {
    syntax: { svg: supports('url("#lg-probe")'), frosted: supports("blur(1px)") },
    svgEligible: Boolean(view.document && !isKnownBackdropSvgFilterUnsupported(view.navigator?.userAgent)),
  };
}

export function selectRenderer(capabilities, policy = {}) {
  const { renderer = "auto", fallback = "frosted-css", forceFallback, reduceTransparency, increaseContrast } = policy;
  if (reduceTransparency || increaseContrast || renderer === "opaque") return "opaque";
  const { syntax, svgEligible } = capabilities;
  if (!forceFallback && renderer !== "frosted-css" && syntax.svg && svgEligible) return "svg-backdrop";
  return (renderer === "frosted-css" || fallback === "frosted-css") && syntax.frosted
    ? "frosted-css" : "opaque";
}

// Quantize raster size while keeping SVG geometry in CSS pixels.
export function rasterGeometry(width, height, radius, dpr = 1) {
  if (![width, height, radius, dpr].every(Number.isFinite) ||
      Math.min(width, height) < 24 || dpr <= 0) return null;
  const density = Math.min(2, Math.max(1, dpr), 1024 / Math.max(width, height));
  const w = Math.round(width * density);
  const h = Math.round(height * density);
  if (Math.min(w, h) < 24) return null;
  const r = Math.round(Math.max(0, Math.min(radius, width / 2, height / 2)) * density);
  return { width: w, height: h, radius: r, density };
}

function rasterImage(document, { width, height, radius }, material) {
  let cache = caches.get(document);
  if (!cache) {
    cache = new Map();
    caches.set(document, cache);
  }
  const key = `${width}:${height}:${radius}:${material}`;
  const hit = cache.get(key);
  if (hit) {
    cache.delete(key);
    cache.set(key, hit);
    return hit;
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return null;
  const pixels = createLiquidGlassDisplacementPixels({ width, height, radius, profile: profiles[material] });
  const image = context.createImageData(width, height);
  image.data.set(pixels.data);
  context.putImageData(image, 0, 0);
  const url = canvas.toDataURL("image/png");
  const result = { url, scale: pixels.scale };
  if (cache.size >= cacheLimit) cache.delete(cache.keys().next().value);
  cache.set(key, result);
  return result;
}

export function createBackdropFilter(document, host) {
  const make = (name) => document.createElementNS(svgNamespace, name);
  const svg = make("svg");
  const filter = make("filter");
  const frost = make("feGaussianBlur");
  const image = make("feImage");
  const displacement = make("feDisplacementMap");
  do {
    filter.id = `lg-filter-${++nextId}`;
  } while (document.getElementById(filter.id));

  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("width", "0");
  svg.setAttribute("height", "0");
  svg.classList.add("lg-filter-defs");
  filter.setAttribute("color-interpolation-filters", "sRGB");
  for (const [attribute, value] of Object.entries({ x: 0, y: 0, width: 1, height: 1 })) {
    filter.setAttribute(attribute, String(value));
  }
  frost.setAttribute("in", "SourceGraphic");
  frost.setAttribute("edgeMode", "duplicate");
  frost.setAttribute("result", "scattered");
  image.setAttribute("preserveAspectRatio", "none");
  image.setAttribute("result", "lens");
  displacement.setAttribute("in", "scattered");
  displacement.setAttribute("in2", "lens");
  displacement.setAttribute("xChannelSelector", "R");
  displacement.setAttribute("yChannelSelector", "G");
  filter.append(frost, image, displacement);
  svg.append(filter);
  (document.body || host).append(svg);

  return {
    id: filter.id,
    render(width, height, radius, dpr, material, scattering) {
      const geometry = rasterGeometry(width, height, radius, dpr);
      if (!geometry) return false;
      const map = rasterImage(document, geometry, material);
      if (!map) return false;
      frost.setAttribute("stdDeviation", String(scattering));
      image.setAttribute("width", String(width));
      image.setAttribute("height", String(height));
      image.setAttribute("href", map.url);
      displacement.setAttribute("scale", String(map.scale / geometry.density));
      return true;
    },
    destroy() {
      svg.remove();
    },
  };
}
