import { mountGlassSurface, detectCapabilities, selectRenderer, type GlassRenderer } from "@ios-liquid-glass/web";

const renderer: GlassRenderer = selectRenderer(detectCapabilities(), { fallback: "opaque" });
const surface = mountGlassSurface(document.createElement("div"), { renderer, role: "transient" });
surface.update({ material: "clear", forceFallback: true });
surface.refresh().syntax.svg;
surface.destroy();

import { mountGlassPopover, mountGlassSegmentedControl } from "@ios-liquid-glass/web";

const segments = mountGlassSegmentedControl(document.createElement("div"), {
  onValueChange: (value) => value.toLowerCase(),
});
segments.setValue("chat");
const popover = mountGlassPopover(document.createElement("button"), document.createElement("div"));
popover.close();

import { createElement } from "react";
import { GlassProvider, GlassToolbar, GlassSearch } from "@ios-liquid-glass/web/react";

createElement(GlassProvider, { theme: "neutral-dark" },
  createElement(GlassToolbar, { material: "regular" }, createElement(GlassSearch, { "aria-label": "Search" })));
