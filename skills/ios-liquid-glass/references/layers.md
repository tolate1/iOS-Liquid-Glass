# Layer architecture

## Map before tuning

Build a component table with: role, current fill, stacking parent, size, interaction, chosen material and verification. Follow the actual CSS cascade and active route, not component names alone. A global theme override can make many otherwise-correct components opaque.

| Role | Typical contents | Default treatment |
| --- | --- | --- |
| Content | Tables, charts, readings, records, prose | Solid or standard neutral surface; stable text contrast |
| Functional | Dock, toolbar, grouped actions, floating filters | Shared glass material where it crosses content |
| Transient | Menu, popover, action sheet | Anchored material with stronger scattering/tint as needed |
| Selection | Active tab, selected segment | Thin state inside its control plane; no second opaque capsule |
| Decoration | Orbits, patterns, ambient gradients | Restrained; remove if it competes with real data |

Use Apple's Materials guidance and WWDC25 as design principles, not as a claim that the web implementation is native:
- https://developer.apple.com/design/human-interface-guidelines/materials
- https://developer.apple.com/videos/play/wwdc2025/219/

Summarize the official hierarchy conservatively: use Liquid Glass for the floating control/navigation plane, ordinary materials for content, and avoid stacking independent glass surfaces. Build the remaining engineering choices from the actual platform and product.

## Compose one command plane

Group related actions; do not put every button in its own floating card. Let empty space remain empty. Split a sparse full-width toolbar into a compact mode group and a compact period/filter group, unless the full-width surface carries a real scrolling or navigation role.

Keep desktop and mobile purpose equivalent, not pixel-identical. A desktop sidebar can become a mobile bottom dock. Preserve safe areas, active indication and touch targets. Avoid a rectangular inner navigation border inside a rounded sidebar.

Use one focal content region and only the secondary groups needed by the current task. Do not repeat identical statistics in every tab. Preserve the user's familiar workflow rather than rebuilding the app as a showcase.

## Stacking and portals

Inspect ancestors for backdrop-filter, filter, opacity, transform, masks, clipping and containment. These can change compositing or positioning behavior. Raising z-index cannot repair every backdrop boundary.

Render a transient menu in an overlay portal when a filtered group would restrict its sampled background or clip it. Anchor to the trigger's measured rectangle. Reposition on viewport/scroll changes. Keep safe margins and dismiss/focus behavior.

An alternative for a small trigger group is a filtered background pseudo-element with unfiltered parent/foreground. Verify its stacking; never assume it is equivalent to a portal in every browser.

Keep SVG filter definitions out of flex/grid layout. Use unique stable IDs per surface and clean up observers and definitions on unmount. Check server/client hydration before trusting an initial screenshot.

## Fixed mobile navigation

Keep the ancestors of a viewport-fixed dock free from filter/backdrop-filter and transforms that establish a different containing block. A desktop sidebar may use a material while its mobile shell must become unfiltered. Verify the dock's bounding rectangle before and after scroll; checking position:fixed alone is insufficient. When a generic material selector reintroduces a filter, exclude the mobile shell at the renderer or in the final breakpoint cascade.
