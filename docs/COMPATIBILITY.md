# Compatibility

## Stage 0 baseline

The baseline map suite verifies numerical bounds and regression behavior. It supplies no browser acceptance for the new engine.

## Rendering policy

| Path | Pixel source | Evidence required |
| --- | --- | --- |
| SVG backdrop | Browser backdrop | Syntax probe, computed filter and pixel comparison against an equivalent same-scene baseline |
| Frosted CSS | Browser backdrop | Computed blur and readable foreground |
| Opaque | Surface fill | Readable foreground with no filter dependency |

A browser can parse a URL filter and omit its effect. Report syntax support, selected renderer and visual evidence independently. Describe verified rendering per browser engine, viewport and input method.

## Stage 1 web runtime

| Environment | Evidence |
| --- | --- |
| Chromium Headless Shell 153.0.8010.0, Linux | Minified CSS and computed SVG, frosted and opaque paths at 390, 520, 768 and 1440 CSS px, DPR 1.25. Dark solid material, contrast/reduced transparency and forced fallback checked. |
| Same Chromium | A grid scene with fixed tint, scattering and labels changed 4,166 pixels by more than 5 intensity levels when the displacement scale alone was set to zero. Reproduce with `npm run test:browser`. |
| Same Chromium | Resize updated the same filter's image geometry. Repeated mount and destroy restored the original SVG count. The map cache retains up to 12 rasters per document. |
| Other browser engines | The eligibility heuristic selects fallback for known unsupported SVG paths. |
| Hardware performance and perceptual quality | No timing or hardware claims. The pixel assertion verifies material effect in the specified scene. |

The SVG path uses embedded PNG data in a same-document filter and needs the document's CSP to allow it. Shadow roots use the configured fallback, and very small or extremely wide surfaces can fall back when a usable bounded raster cannot be generated. Each surface is an HTML host with a uniform circular corner radius. Call `refresh()` after changing radius without resizing. Theme tokens are neutral. Colored backdrop content can still contribute color through transparent materials; use an opaque renderer where composited color must remain neutral.

## Stage 2 controls

Gallery browser checks cover an unequal-width three-tab mouse drag and reversal, one release commit, keyboard selection, native top-layer bounds, menu arrow/Home/End operation and Escape focus return. The independent messenger fixture at `/examples/messenger/index.html` checks file search, draft retention, sending a local message and the fixed dock during scrolling at 390 CSS px.

Tested with Chromium Headless Shell 153 on Linux. Popover support requires the native Popover API. Use browser QA for positioning, keyboard behavior and pointer cancellation.

## Stage 3 consumer validation

The React 19 fixture installs the engine tarball into a fresh directory and runs React SSR plus hydration in Chromium. The fixture checks actual search results, input persistence and theme updates. A clean Next.js 16.4.6 project installed the same tarball, built a production static export via webpack, and verified the computed SVG backdrop and search result at 768 CSS px in Chromium. Its emitted CSS preserved both SVG backdrop declarations. React 18 is in the peer dependency range and has not been exercised here.

## Stage 4 migration pilot

The independent Vite 8 dashboard was built both before and after the reviewed transform. Headless Chromium verified the computed SVG toolbar, keyboard activation of the stock filter and the same surviving row with 17 units. The fixture reverted to byte-identical source. CLI tests cover rejection of a modified target, modified migrated output and a nested directory whose enclosing Git root differs. This is one marked toolbar transform, and the CLI's source check reports browser verification separately.

## Stage 5 laboratory slice

Gallery compares SVG, frost and opaque candidates against a matched frosted reference on grid, text, chart, table and plain scenes. The browser test checks shared scene and profile selection plus renderer and committed-tab diagnostics. Manual screenshots were reviewed at 1200 CSS px in light mode and 390 CSS px in dark mode. Per-component visual baselines and compositor profiling remain open.

## Responsive controls and motion

GlassSheet uses native modal dialog semantics, restores focus on dismiss, and uses a dedicated drag handle. The Gallery includes a stateful switch, slider and stepper. Motion is reduced when the system requests it. Acceptance uses compact and wide browser layouts, keyboard actions and representative pointer gestures with fallback renderers. Source migration requires resolving both engine exports before applying and retains direct-child selectors for the original controls. Browser image policy restrictions on the displacement-map image select a supported fallback.
