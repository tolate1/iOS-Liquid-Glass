# Rendering paths

## Pick the source before the shader

| Path | Image source | Honest scope |
| --- | --- | --- |
| CSS blur/tint | Browser backdrop | Translucent/frosted fallback; no custom lens refraction |
| SVG URL backdrop filter | Browser backdrop on supported engines | Actual backdrop displacement; browser-specific visual testing required |
| WebGL with image/video/canvas texture | Explicit texture | Refraction of that texture, not arbitrary DOM |
| WebGL with DOM reconstruction | Renderer-produced page approximation | Reconstructed content; CSS/SVG/media fidelity and update latency must be tested |
| Native platform material | Platform compositor | Native behavior on the relevant OS, using supported APIs |

WebGL cannot automatically sample arbitrary HTML pixels. Do not imply that installing Three.js solves the source problem. Request screen capture only when explicitly appropriate and authorized; do not add capture permission to a normal UI effect.

## CSS/SVG integration

Use assets/core/displacement-map.js to generate an inverse-lens field. It returns a data URL, measured displacement scale and cache key. Copy its sibling liquid-glass-core.js and LICENSE together. Keep imports relative. Call browser-dependent map generation only after mount; the core's pixel math is also usable in numerical checks.

For each actual glass surface:
1. Measure its CSS width, height and corner radius.
2. Generate and cache a map by geometry/profile, not pointer position.
3. Feed feImage into feDisplacementMap; use R/G for horizontal/vertical displacement and the returned calibrated scale.
4. Keep a neutral center, finite edge slope and bounded displacement. Clamp texture sampling in shaders.
5. Apply the filter to the backdrop, keeping labels outside image processing.
6. Use a tested filter region. An insufficient region can show rectangular crops or colored seams; blindly enlarging it can also change map alignment. Compare against a known grid/text scene.
7. Regenerate on shape/size changes. Coalesce ResizeObserver callbacks with requestAnimationFrame. Remove detached entries and bound cache growth.

Keep a forced fallback switch for QA. Gate known unsupported engines conservatively and retest browser versions when relevant. CSS.supports checks parsing, not image correctness. iOS browser branding alone does not establish a different rendering engine.

## Scattering and chromatic effects

If text under glass becomes a second readable foreground, increase scattering or tint before adding more rim brightness. A mild SourceGraphic blur before displacement preserves a sharp label layer while reducing background competition. Tune with real product text.

If color dispersion is desired, vary channel displacement only near the rim. Do not offset whole channels. In monochrome mode, use one displacement sample with no channel split: faster and exactly neutral.

## WebGL isolation

Prototype independently before replacing a working navigation controller. Verify context creation, vertex/fragment compilation and linking, then show a continuous interaction recording. Test context loss and an unavailable-GPU fallback.

Distinguish device hardware from llvmpipe/SwiftShader and other software paths. A successful software render can validate shader behavior but cannot establish hardware performance. Record what the environment actually proves.

A slow DOM capture is not made real-time by scheduling it every 150 ms. Separate source updates from lens frames: invalidate only on meaningful content/scroll changes, coalesce captures, retain the latest complete texture, and measure texture age. Do not claim 60 FPS of live page reconstruction from smooth animation over a stale texture.

## Attribution

The included map core and its regression script come from xinlingfeiwu/liquid-glass-design-skill (MIT), used as an optical foundation:
https://github.com/xinlingfeiwu/liquid-glass-design-skill
Preserve assets/core/LICENSE. Inspect current browser gates in the copied core rather than assuming permanent compatibility. The surrounding workflow and failure diagnosis derive from practical UI iterations; they are not Apple's implementation.
