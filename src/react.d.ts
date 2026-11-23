import type { ComponentPropsWithoutRef, ForwardRefExoticComponent, ReactElement, RefAttributes } from "react";
import type { GlassRendererPolicy, GlassSurfaceOptions } from "./index.js";

type DivProps = ComponentPropsWithoutRef<"div">;
type Forwarded<Props, Element> = ForwardRefExoticComponent<Props & RefAttributes<Element>>;

export interface GlassProviderProps extends DivProps, Pick<GlassRendererPolicy, "renderer" | "fallback" | "forceFallback"> {
  theme?: "neutral-light" | "neutral-dark";
}
export interface GlassSurfaceProps extends Omit<DivProps, "dangerouslySetInnerHTML">, Omit<GlassSurfaceOptions, "role"> {
  surfaceRole?: GlassSurfaceOptions["role"];
}
export function GlassProvider(props: GlassProviderProps): ReactElement;
export const GlassSurface: Forwarded<GlassSurfaceProps, HTMLDivElement>;
export const GlassToolbar: Forwarded<GlassSurfaceProps, HTMLDivElement>;
export const GlassButton: Forwarded<ComponentPropsWithoutRef<"button"> & { loading?: boolean }, HTMLButtonElement>;
export const GlassSearch: Forwarded<Omit<ComponentPropsWithoutRef<"input">, "type">, HTMLInputElement>;
export const GlassSwitch: Forwarded<Omit<ComponentPropsWithoutRef<"input">, "type" | "children"> & {
  children?: import("react").ReactNode;
}, HTMLInputElement>;
export const GlassSlider: Forwarded<Omit<ComponentPropsWithoutRef<"input">, "type">, HTMLInputElement>;
