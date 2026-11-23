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

export interface GlassSheetController {
  open(): void;
  close(): void;
  update(options: Omit<GlassSurfaceOptions, "role">): GlassDiagnostics;
  destroy(): void;
}
export function mountGlassSheet(trigger: HTMLButtonElement, dialog: HTMLDialogElement, options?: Omit<GlassSurfaceOptions, "role">): GlassSheetController;

export interface GlassStepperOptions {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  onValueChange?: (value: number) => void;
}
export interface GlassStepperController {
  readonly value: number;
  setValue(value: number): void;
  destroy(): void;
}
export function mountGlassStepper(group: HTMLElement, options?: GlassStepperOptions): GlassStepperController;

export interface GlassDockOptions extends GlassSurfaceOptions {
  content?: HTMLElement;
  layout?: HTMLElement;
}
export function mountGlassDock(element: HTMLElement, options?: GlassDockOptions): Pick<GlassSurfaceController, "diagnostics" | "update" | "destroy">;
