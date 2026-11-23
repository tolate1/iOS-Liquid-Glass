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

## Stage 1 web runtime

| Environment | Evidence |
| --- | --- |
| Chromium Headless Shell 153.0.8010.0, Linux | Minified CSS and computed SVG, frosted and opaque paths at 390, 520, 768 and 1440 CSS px, DPR 1.25. Dark solid material, contrast/reduced transparency and forced fallback checked. |
| Same Chromium | A grid scene with fixed tint, scattering and labels changed 4,166 pixels by more than 5 intensity levels when the displacement scale alone was set to zero. Reproduce with `npm run test:browser`. |
| Same Chromium | Resize updated the same filter's image geometry. Repeated mount and destroy restored the original SVG count. The map cache retains up to 12 rasters per document. |
| Safari, iOS browsers, Firefox and physical devices | No device-level validation. The eligibility heuristic selects fallback for known unsupported SVG paths. |
| Hardware performance and perceptual quality | No timing or hardware claims. The pixel assertion verifies material effect in the specified scene. |

The SVG path uses embedded PNG data in a same-document filter and needs the document's CSP to allow it. Shadow roots use the configured fallback, and very small or extremely wide surfaces can fall back when a usable bounded raster cannot be generated. Each surface is an HTML host with a uniform circular corner radius. Call `refresh()` after changing radius without resizing. Theme tokens are neutral. Colored backdrop content can still contribute color through transparent materials; use an opaque renderer where composited color must remain neutral.

## Stage 2 controls

Gallery browser checks cover an unequal-width three-tab mouse drag and reversal, one release commit, keyboard selection, native top-layer bounds, menu arrow/Home/End operation and Escape focus return. The independent messenger fixture at `/examples/messenger/index.html` checks file search, draft retention, sending a local message and the fixed dock during scrolling at 390 CSS px.

Tested with Chromium Headless Shell 153 on Linux. Popover support requires the native Popover API. Anchored enter/exit motion, physical touch, screen readers and virtual keyboard behavior remain open acceptance checks.

## Stage 3 consumer validation

The React 19 fixture installs the engine tarball into a fresh directory and runs React SSR plus hydration in Chromium. The fixture checks actual search results, input persistence and theme updates. A clean Next.js 16.4.6 project installed the same tarball, built a production static export via webpack, and verified the computed SVG backdrop and search result at 768 CSS px in Chromium. React 18 is in the peer dependency range and has not been exercised here.
