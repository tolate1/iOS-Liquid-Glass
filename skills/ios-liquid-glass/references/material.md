# A shared material, not independent decorations

Define a small family of tokens: surface tint/alpha, fallback blur, refractive blur, refraction strength, rim opacity, highlight position, shadow depth, content ink, focus ring and motion response. Derive control-size profiles from that family. Do not reuse the same bezel and dispersion for a tiny button and a full sidebar.

## Tuning order

1. Remove opaque fills that cover the backdrop.
2. Set adequate foreground contrast.
3. Tune edge displacement using visible text/lines behind the surface.
4. Add only the scattering needed for legibility.
5. Tune rim, highlight and elevation together.
6. Add interaction feedback without moving the layout.

Tint gradients and solid tint combine: a translucent white gradient on top of a 60% white fill can be almost opaque. Calculate/inspect the combined result. A slider labeled “intensity” must change the visible material, not merely increase a blur hidden under solid paint.

Use light and dark profiles with the same physical family, not unrelated designs. Keep branded tint optional. Preserve existing typography and product color unless the user requests a new palette.

## Initial web ranges

Use these as hypotheses to test, not acceptance thresholds:
- Refractive blur about 0.2–1 px when optical detail should remain crisp.
- Frosted fallback about 4–12 px; text-heavy menus may need more.
- A thin quiet rim plus localized glints; avoid equally bright borders everywhere.
- Moderate tint over plain content; stronger tint/scattering over dense text.
- A clear center and constrained edge displacement, calibrated to surface size.

Choose a readable regular material for dashboards. Reserve a very clear material for scenes with sufficient visual support; do not make dense data ghost through labels.

## Strict monochrome

Replace colored theme tokens, gradients, shadows, status fills and chart strokes at source. Check light and dark themes separately. Use a true black ground when asked, and neutral white/gray layers. Preserve signs, words, line styles and shapes so meaning survives without color.

Do not grayscale the entire app root: a filter can create a containing/compositing boundary and alter fixed navigation/backdrop behavior. Disable chromatic dispersion. Keep neutral focus indication visible. Use a theme-aware gray palette plus dashes/markers for multiple chart series.

## Accessibility

Keep independent policies for reduced motion, reduced transparency and increased contrast. Make controls sufficiently opaque in reduced transparency; disable elastic motion when requested; strengthen boundaries/foreground in increased contrast. Verify that late CSS overrides do not defeat these modes.

Do not make a universal clear material mandatory. Let system preferences and actual readability win over optical purity.
