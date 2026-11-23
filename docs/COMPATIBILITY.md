# Compatibility

## Stage 0 baseline

The baseline map suite verifies numerical bounds and regression behavior. It supplies no browser or device acceptance for the new engine.

## Rendering policy

| Path | Pixel source | Evidence required |
| --- | --- | --- |
| SVG backdrop | Browser backdrop | Syntax probe, computed filter and pixel comparison against an equivalent same-scene baseline |
| Frosted CSS | Browser backdrop | Computed blur and readable foreground |
| Opaque | Surface fill | Readable foreground with no filter dependency |

A browser can parse a URL filter and omit its effect. Report syntax support, selected renderer and visual evidence independently. Keep physical Safari/iPhone, hardware performance and native Apple materials outside claims based on desktop Chromium.
