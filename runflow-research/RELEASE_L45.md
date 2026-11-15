# L45 — main-app motion and two-theme material system

## Components and ownership
- GlassSegment / GlassNavigation: bounded edge resistance is now the default in the main application; directional deformation is smaller and whole-object shear is zero. L44 repeat-tap handling remains.
- GlassSelect / GlassActionMenu / useMenuLayer: one spring-driven bounded surface, original-size labels, reversible opening/closing, trigger fades into the expanding surface and returns at closure. This path is the default in the main app, not lab-only. It animates bounds and incurs layout work.
- material-system.css owns the light/dark palette, content surfaces, controls, active lenses and transient material. Legacy paint/token declarations were removed from seven style files instead of piling new important overrides on top. An ambient element is separate from actual content and controls. Mobile Dock has its own noninteractive substrate child; the navigation root is unfiltered.
- useTabTransition: one brief 140ms content-plane entrance only on section changes, cancelable by subsequent navigation and absent under reduced motion; navigation, header and filters stay mounted. Per-section scroll memory is preserved.
- The viewport review route renders the actual main app in a narrow Chromium iframe; it is layout QA, not a phone emulator.

## Verification
TypeScript, production build and numerical/contrast checks are recorded by the release workflow. Main app was exercised in light/dark: demo overview, journal/action menu, progress charts/scale menu, reversible menus and keyboard Escape. 390px main-app iframe checked light and dark journal and visible fixed Dock; its vertical bounds were stable before/after scroll. Local preview has no production diary records; demonstration data was used. No workout was saved or deleted. The selected theme is applied before content paint and is not overwritten by the initial default state during hydration.

## Limits
No physical iPhone/Safari/GPU acceptance or new video recording. Existing SVG-backdrop refraction still has its browser-dependent fallback; the redesign is not native Apple Liquid Glass. Frame/layout performance was not benchmarked. Data formulas, storage endpoints and chart calculations are unchanged.
