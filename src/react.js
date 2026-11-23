"use client";

import { createContext, createElement, forwardRef, useContext, useEffect, useImperativeHandle, useRef } from "react";
import { mountGlassSurface } from "./surface.js";

const Policy = createContext({});

export function GlassProvider({ theme = "neutral-light", renderer, fallback, forceFallback, ...props }) {
  return createElement(Policy.Provider, { value: { renderer, fallback, forceFallback } },
    createElement("div", { ...props, "data-lg-theme": theme }));
}

export const GlassSurface = forwardRef(function GlassSurface(props, ref) {
  const context = useContext(Policy);
  const {
    renderer = context.renderer,
    fallback = context.fallback,
    forceFallback = context.forceFallback,
    surfaceRole = "functional-control",
    material,
    children,
    ...nativeProps
  } = props;
  const host = useRef(null);
  useImperativeHandle(ref, () => host.current, []);
  useEffect(() => {
    const surface = mountGlassSurface(host.current, { role: surfaceRole, renderer, fallback, forceFallback, material });
    return () => surface.destroy();
  }, [surfaceRole, renderer, fallback, forceFallback, material]);
  return createElement("div", { ...nativeProps, ref: host },
    createElement("div", { className: "lg-react-foreground" }, children));
});

export const GlassToolbar = forwardRef(function GlassToolbar({ className = "", role = "group", ...props }, ref) {
  return createElement(GlassSurface, { ...props, role, className: `lg-react-toolbar ${className}`, ref });
});

export const GlassButton = forwardRef(function GlassButton(
  { type = "button", className = "", loading, disabled, ...props }, ref,
) {
  return createElement("button", {
    ...props, type, className: `lg-button ${className}`, ref,
    disabled: disabled || loading,
    "aria-busy": loading || props["aria-busy"],
  });
});

export const GlassSearch = forwardRef(function GlassSearch({ className = "", ...props }, ref) {
  return createElement("input", { ...props, type: "search", className: `lg-field ${className}`, ref });
});
