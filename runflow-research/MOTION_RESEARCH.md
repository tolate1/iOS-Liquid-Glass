# Motion research — 2026-11-15

Source baseline: 84443b31f89b77162b33fb1c2818aa5c98cb8e77.

## Verified repositories
- emilkowalski/skills: gestures, apple-design, mobile-native, review-animations, improve-animations, learn-taste exist. improve-animations is an advisor/planner; learn-taste records corrections and does not implement motion.
- YordiLorenzo/liquid-glass-skills: apple-motion-feel and liquid-glass-motion exist. Native SwiftUI behavior is a reference, not a browser rendering implementation or official numeric specification.
- jakubkrehel/skills: state-machine is a component workbench, not a state-management library.
- GetStream/awesome-liquid-glass provides native slider, Tab Bar and menu samples. FradSer/FluidInterfacesSwiftUI provides direct manipulation and interruptible spring examples.
- LottieFiles/motion-design-skill describes motion intent/choreography. A cascading dashboard entrance conflicts with this owner's explicit preference and is not adopted.

## Current-code findings
1. hooks/useGlassDrag.ts uses segmentPresentation's clamped center. No boundary resistance is modeled. First prototype comparison: bounded resistance outside endpoint, without changing the committed selection. Numerical bounds tests currently test the hard clamp; do not silently invalidate them.
2. The hook releases to the nearest current center; velocity is passed to the spring but does not affect target selection. A projected endpoint may suit navigation, but the journal/demo data switch needs an explicit comparison before adopting flick-to-switch.
3. lib/animate-glass-menu.ts avoids scaling foreground labels but animates layout bounds. This trades typography correctness for layout cost. Profile it rather than claiming it is compositor-only. A separate transformed material sibling with a clipped, unscaled foreground is the next candidate.
4. Menu shell and content use separate timing/opacity animations. Interruption samples current state, but a single progress driver would make them easier to keep synchronized. No claim that changing opacity reproduces native materialize.
5. useGlassDrag and GlassNavigation still have separate gesture controllers. Reconcile cancel, resize, release velocity and stale-speed handling before sharing code; preserve distinct selection policies.

## Prototype workbench
/interaction-lab imports real GlassSegment, GlassNavigation and GlassSelect. One family is shown at a time. Local state and commit count make unintended data changes observable without touching the diary database. This is a baseline harness, not an improved Apple-equivalent renderer.

## Acceptance
Record identical slow/fast/reversed gestures, hold-then-drag, cancel, interrupted release, Escape/outside click, light/dark and reduced-motion scenarios. Measure frame intervals and layout cost independently. Phone hardware/GPU and Safari/Telegram observations are separate from desktop execution. No physical-device result is claimed here.

## References
https://github.com/emilkowalski/skills
https://github.com/YordiLorenzo/liquid-glass-skills
https://github.com/jakubkrehel/skills
https://github.com/GetStream/awesome-liquid-glass
https://github.com/FradSer/FluidInterfacesSwiftUI
https://github.com/LottieFiles/motion-design-skill

## Pinned source revisions
- emilkowalski/skills: 0f2e23b32bb1265e84cff8d3e75785fec953fb1b
- YordiLorenzo/liquid-glass-skills: a6bac94c5a7a65ac42207452e3e63bb4eb7518e8
- jakubkrehel/skills: a72290d140249813898ba8648becf6415abcb059
- GetStream/awesome-liquid-glass: a797c7a1c78373005961ad73e05d378f4dcb4b34
- FradSer/FluidInterfacesSwiftUI: 26d9220318944cdd37c18c2a8c59e5872bd3f7fc
- LottieFiles/motion-design-skill: f9a8a041b85185ee4881b3471d3415e939aac772

GetStream's Tab Bar and menu samples delegate rendering/interaction to SwiftUI TabView/Menu. They are native-reference examples, not a portable spring/morph algorithm to copy into React.


Desktop preview: candidate checkbox and segment value/commit count updated; real menu opened and selected 30 days; navigation keyboard selection updated the local route state. This checks plumbing, not continuous gesture smoothness, edge resistance feel or physical-device performance. No new continuous video recorded.

## Experiment iteration — separate material plane
- GlassSelect motionMode=layer keeps final-size panel/labels fixed and transforms a separate backdrop shell. One progress spring controls shell transform, content clip/opacity and shadow. Bounds mode remains the default baseline. These are two experiments, not a native Apple implementation.
- Segment and optional navigation candidate share velocity sampling/release freshness conventions; navigation retains its own tab choice policy. Candidate navigation adds bounded boundary resistance. Lifecycle ownership remains per component; this is not a claim that both complete controllers have been unified.
- InteractionMetrics samples 240 RAF intervals, p50/p95 and >25ms counts; optional long-animation-frame records report only forced style/layout attributed in slow frames. It is not total layout cost, GPU time or hardware proof. Compare on one device with identical gestures. Zero does not establish absence of layout.
- Six numerical tests cover menu endpoints, interrupted progress spring continuity/settling, stale/cancel/reduced velocity and segment geometry bounds. TypeScript passes. Local preview infrastructure refused the connection despite stale dev-server registration, so the current iteration requires published-page verification. No iPhone acceptance or continuous recording is claimed.

## Mobile navigation correction after owner video
The owner reports the lab Dock was nonfunctional on the phone; the recording is failure evidence, not an inconclusive acceptance. The desktop screenshot only establishes desktop selection. Changes: move the mobile specimen into a body portal outside its panel, keep exactly one mounted specimen, resolve pointer-up taps by button rectangles rather than elementFromPoint after capture, and cancel a held gesture only for a real geometry change (not an unchanged ResizeObserver notification). A local accepted-selection counter makes subsequent video actionable. Two numerical tests cover five mobile hit regions and unchanged/changed geometry. These changes address fragile code paths; the exact original runtime cause and successful phone repair remain unverified until a new device recording. The menu occlusion and segment deformation reported in the previous audit remain open.
