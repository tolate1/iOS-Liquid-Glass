export type GlassRenderer = "svg-backdrop" | "frosted-css" | "opaque";
export type GlassMaterial = "clear" | "regular" | "transient";
export type GlassRole = "canvas" | "content" | "field" | "selection" | "functional-control" | "transient";

export interface GlassCapabilities {
  syntax: { svg: boolean; frosted: boolean };
  svgEligible: boolean;
}

export interface GlassRendererPolicy {
  renderer?: GlassRenderer | "auto";
  fallback?: "frosted-css" | "opaque";
  forceFallback?: boolean;
  reduceTransparency?: boolean;
  increaseContrast?: boolean;
}

export interface GlassSurfaceOptions extends Omit<GlassRendererPolicy, "reduceTransparency" | "increaseContrast"> {
  role?: GlassRole;
  material?: GlassMaterial;
}

export interface GlassDiagnostics extends GlassCapabilities {
  selected: GlassRenderer;
  visualEvidence: "not-tested";
}

export interface GlassSurfaceController {
  readonly diagnostics: GlassDiagnostics;
  refresh(): GlassDiagnostics;
  update(options: GlassSurfaceOptions): GlassDiagnostics;
  destroy(): void;
}

export function detectCapabilities(view?: Window): GlassCapabilities;
export function selectRenderer(capabilities: GlassCapabilities, policy?: GlassRendererPolicy): GlassRenderer;
export function mountGlassSurface(host: HTMLElement, options?: GlassSurfaceOptions): GlassSurfaceController;
