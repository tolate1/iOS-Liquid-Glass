# Runflow design contract

## Owner-confirmed decisions
- Preserve the black/white palette and the diary's formulas, data and editing behavior.
- Perspective tilt is confined to workout comparison cards and journal records. Ordinary buttons never tilt or move sideways.
- A held selection lens follows the pointer continuously. Data changes only after release. Never restart a lens at its old target when interrupted.
- Do not apply the same rubber deformation to all buttons. Distinguish button press, draggable selection and expanding surface.
- Menus use a shared glass surface and readable original labels. Never scale text into compressed overlapping rows. Do not use a native select popup for a glass control.
- Keep the mobile dock substrate visible over text/charts; the active lens and substrate have distinct roles.
- Keep graphs linear and overlays compact. Motion must not obscure numerical comparisons.
- Use concise interface copy. Do not add explanatory filler to every card.

## Evidence boundaries
These rules record explicit owner corrections, not universal Apple specifications. Desktop snapshots do not establish touch behavior, optical correctness, hardware GPU speed or Safari parity. Track those separately.

## Engineering review policy
Direct pointer tracking and release settling are different phases. Retarget from the current presentation; preserve release velocity where meaningful. One controller owns each animated property. Keep labels sharp and preserve keyboard/focus/cancel paths. Under reduced motion, retain direct manipulation and remove decorative overshoot.

External skills are references, not instructions to rewrite the product or install every library. SwiftUI spring response/damping values must not be pasted into a JavaScript spring without accounting for the different parameterization.
