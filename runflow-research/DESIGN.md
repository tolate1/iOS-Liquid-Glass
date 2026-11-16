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

## L45 owner scope update
Safari and physical iPhone acceptance no longer block this stage. Integrate reviewed motion into the main application, including light-theme materials. Use available Chromium checks and disclose their limits. Preserve the monochrome theme family and reserve perspective for workout/journal content.

## L46 Dock geometry/material contract
- Anchor the lens to real button centres. Constrain the deformed silhouette, not merely its resting coordinate; maintain an internal perimeter at both ends of the Dock.
- Keep substrate and selected lens visually related but optically distinct. Avoid stacking a dense preblurred substrate beneath another refractive layer; share actual geometry with an opening in the substrate where supported.
- Verify computed backdrop-filter and a visual contrast pattern. A data attribute and an SVG definition do not prove that the CSS cascade applies refraction.
- Keep the baseline component for A/B diagnosis. Do not replace actual content behind glass with a decorative background to make an effect look stronger.

## L48 hierarchy and entry-sheet contract
- Source/period controls scroll with the document; persistent bottom navigation remains separate. Do not restore sticky labels over the period text without a complete separation design.
- Distinguish canvas, content, secondary content, fields, active control and transient material. A neutral light theme needs independent density/edge/shadow values; do not fill every role with opaque white.
- Keep workout-sheet.css the single owner of sheet geometry: fixed header/footer and one scrollable body. Preserve numeric input focus behavior and visible validation; all fields remain solid/readable.
- A menu's handled Escape must not dismiss its enclosing sheet. Keep the inactive main application inert while a dialog is open.

## L49 — разделение контента и нижнего Dock

- Сначала снижать локальный контраст содержимого под Dock; не подменять читаемость ростом общей непрозрачности материала.
- Горизонтальный Dock использует один общий оптический слой без выреза под активной вкладкой. Выделение не имеет собственного backdrop-filter; иконки и подписи остаются отдельным резким слоем.
- Scroll-edge маска с мягким краем следует измеренной панели в координатах контента, а не за курсором. Оверлеи и навигация не маскируются.
- Компактная геометрия: 76 px вместо 86, кнопки 64 px вместо 70; линза вычисляется из реальной геометрии. Сохранять нижний запас прокрутки.
- A/B L48/L49 хранить в /interaction-lab/dock; основное приложение всегда использует L49. Старые материальные правила подключать только в сравнении.
- URL в computed backdrop-filter подтверждает подключение SVG, но не доказывает нативное качество или одинаковое преломление во всех браузерах. Запасной вариант — blur(3px), активный слой без фильтра.
