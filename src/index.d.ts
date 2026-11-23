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

export interface GlassSegmentOptions {
  value?: string;
  onValueChange?: (value: string) => void;
  panels?: Readonly<Record<string, HTMLElement>>;
}
export interface GlassSegmentController {
  readonly value: string;
  setValue(value: string): void;
  destroy(): void;
}
export function mountGlassSegmentedControl(group: HTMLElement, options?: GlassSegmentOptions): GlassSegmentController;

export interface GlassPopoverController {
  readonly diagnostics: GlassDiagnostics;
  update(options: Omit<GlassSurfaceOptions, "role">): GlassDiagnostics;
  close(): void;
  destroy(): void;
}
export function mountGlassPopover(trigger: HTMLButtonElement, panel: HTMLElement, options?: Omit<GlassSurfaceOptions, "role">): GlassPopoverController;
export function mountGlassMenu(trigger: HTMLButtonElement, panel: HTMLElement, options?: Omit<GlassSurfaceOptions, "role">): GlassPopoverController;
