import { mountGlassSurface, detectCapabilities, selectRenderer, type GlassRenderer } from "@ios-liquid-glass/web";

const renderer: GlassRenderer = selectRenderer(detectCapabilities(), { fallback: "opaque" });
const surface = mountGlassSurface(document.createElement("div"), { renderer, role: "transient" });
surface.update({ material: "clear", forceFallback: true });
surface.refresh().syntax.svg;
surface.destroy();
