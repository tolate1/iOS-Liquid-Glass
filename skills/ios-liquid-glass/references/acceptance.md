# Acceptance and evidence

## Verify these scenarios

- Real text, card boundaries and a chart cross behind a glass surface during scrolling.
- Slow drag, fast drag, reversal, release, cancel, second pointer and keyboard selection.
- Popover opens over every relevant neighboring surface; no clipped bounds or unclickable controls.
- Light/dark themes and both plain and busy backdrops.
- Mobile target width (for example 390px), narrow width, desktop and landscape.
- Forced non-refractive fallback; reduced motion/transparency and increased contrast when tooling supports them.
- Async load, empty data, single-point series and unknown baseline.

## Measure what matters

Inspect computed material styles and active renderer, count original versus duplicated foreground elements, compare clientWidth and scrollWidth, and record control/menu bounds. A nonempty CSS url is evidence of configuration, not sufficient proof of optical quality.

Inspect screenshots for crops, straight rectangular seams inside rounded surfaces, doubled glyphs, ghost text, missing icons and excessive rim contrast. Compare the same viewport and state before/after. Use data-only demo fixtures for user-facing proof when personal records are present.

Run checks appropriate to the implementation: type/build checks, meaningful math tests for new analytics or optics, and visible interaction checks. Do not test only whether certain source strings exist. The supplied core test checks map math; it does not test compositing, GPU output or Safari.

For animation, use continuous video or frame observations, not one still image. For performance, record actual frame intervals and texture age/capture cost independently. State the device/browser and software versus hardware rendering path. Do not infer hardware acceleration from a smooth screenshot.

## Evidence ladder

| Evidence | Supports | Does not support |
| --- | --- | --- |
| Source/type check | Implementation and syntax | Visible quality |
| Numerical test | Bounds, finite math, convergence | Browser compositing |
| Computed CSS | Selected rendering configuration | Actual pixel refraction |
| Screenshot | Appearance in that state/browser | Drag fluidity or 60 FPS |
| Continuous interaction recording | Behavior under the recorded gesture | Other browser/device parity |
| Physical device test | That device/OS/browser scenario | Universal compatibility |

When a required environment is unavailable, complete the checks you can, preserve the requested boundary (for example, keep an experiment isolated), and state the precise missing proof. Do not silently change the acceptance criterion or turn a software GPU into a hardware claim.

## Report briefly

Lead with the shipped change and link to the running result. Name what was tested and the material limitation that affects the user. Do not bury an unavailable Safari test under a long list of passing source checks.
