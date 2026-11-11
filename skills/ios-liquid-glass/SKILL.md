---
name: ios-liquid-glass
description: "Build, refine, and audit layered Liquid Glass interfaces across existing websites, dashboards, mobile web apps, desktop apps, and native shells. Use for Apple-like glass, weak or excessive glass, floating navigation, draggable tab indicators, material systems, blur versus refraction, Safari fallbacks, monochrome glass, compact chart controls, and verified responsive UI polish. Preserve the product, its data and brand; deliver working UI rather than mockups."
---

# iOS Liquid Glass

Create one coherent system of surfaces, motion, and readable controls. Adapt it to the product instead of turning the product into a glass demo. Keep the distinction between implementing an effect and proving it works.

## Workflow

1. Inspect the actual rendering surface and current application. Read relevant components, theme files, storage boundaries, and existing controllers. Capture the complaint at the user's viewport. Preserve working routes, formulas, data and input flows.
2. Make a short component map before edits. Classify each element as content, functional control, transient surface, or decoration. Identify nested material and oversized containers. Read [layers](references/layers.md).
3. Choose the design response before optical tuning. State the focal content, command group, transient anchor, palette and target browsers. For an existing app, change the smallest shared surface that fixes the complaint. Avoid a framework rewrite.
4. Pick a rendering path explicitly. Read [rendering](references/rendering.md). Reuse the supplied inverse-lens map core when appropriate. Keep a documented non-refractive fallback. Never imply a native Apple implementation exists in CSS.
5. Define shared tokens and per-size profiles. Read [material](references/material.md), and adapt [starter tokens](assets/material-tokens.css). Treat these numeric ranges as web tuning examples, not Apple's proprietary constants.
6. Preserve direct manipulation. Read [motion](references/motion.md) for continuous dragging, release velocity, geometry and interruptibility. Fix tab teleporting in the controller, not by adding a cursor glow.
7. Keep the product useful. Replace ornamental charts with actual available data only when asked. Read [product patterns](references/product-patterns.md) for legends, summaries, numeric explanations and empty states.
8. Verify the current rendered result using [acceptance](references/acceptance.md). Test both the refractive path and forced fallback, bright/dark content, mobile width, overlays, and scrolling. Use only browser tooling authorized by the current environment.
9. Deliver the changed application through its supported publishing flow when authorized. Report what was tested and what remains unverified. Do not finish at screenshots or a design description when the user requested working code.

## Non-negotiable boundaries

- Keep data tables, charts and content cards visually calm. Put glass chiefly on controls that overlap content. Do not interpret “more glass” as “every container is transparent.”
- Avoid glass inside glass. Use one material group, with a thin selected state and sharp foreground labels. Keep a popover's backdrop independent of a filtered trigger ancestor, usually through a portal.
- Filter the real backdrop on supported web paths. Label a reconstructed DOM texture as reconstruction. Label duplicated artwork as artwork. A cloned icon strip is not refraction of the page.
- Keep icons and labels in one original foreground layer. Do not rely on subtractive CSS masks and refracted text clones to maintain navigation visibility across browsers.
- Do not add an enclosing full-width glass tray around two small chart toggles. Size the control group to its contents or omit the enclosing material entirely.
- Separate optical blur from fallback blur. Large blur can hide the very edge detail needed to perceive a lens.
- Preserve the requested palette. Monochrome means neutral tokens, charts, status treatments, shadows and highlights; disable chromatic channel offsets. Do not apply a root grayscale filter that changes fixed-position or backdrop behavior.
- Do not claim Safari parity from Chromium or hardware GPU performance from a software renderer. A syntax probe alone does not prove the browser renders a filter correctly.
- Prefer reducing conflicting surfaces over adding another glow. Keep the functional hierarchy legible before tuning spectacle.

## Accumulating knowledge

Treat this skill as a maintained, reusable knowledge base. After meaningful UI iterations, record a concise, generalized finding in references/knowledge-log.md: observation, mechanism, fix, environment, evidence and remaining uncertainty. Exclude personal records, account identifiers and project secrets. Deduplicate entries; replace disproved guidance instead of collecting contradictory rules. Separate verified implementation facts, platform design principles and untested proposals. Read references/terminology.md when choosing vocabulary and references/material-profiles.md when defining surfaces. Do not imply that future conversations automatically update this skill: save substantive findings through the personal-skill workflow when working on it.

## Completion and handoff

After each completed implementation stage, persist substantive UI findings through the personal-skill update workflow. Follow [completion](references/completion.md) to capture verified behavior, failed explanations, browser limits and open acceptance work. Keep project-specific source maps and release state in the project context instead of embedding private records in the skill.

For this owner's UI projects, provide an updated project source ZIP at completion and update the owner's configured GitHub skill mirror. Preserve distinct destinations: a skill repository receives reusable skill content; an application repository receives application source. Never put application source into a skill repository merely because it is the only configured destination. Report each delivery's actual result and any missing destination.

## Resources

| Need | Read/use |
| --- | --- |
| Surface inventory and composition | references/layers.md |
| CSS/SVG, WebGL and source-texture decisions | references/rendering.md |
| Shared profiles, neutral/brand variants | references/material.md; assets/material-tokens.css |
| Drag, springs and anchored transitions | references/motion.md |
| Chart legends and real analytical UI | references/product-patterns.md |
| Browser/device and evidence gates | references/acceptance.md |
| Failure diagnosis from real iterations | references/lessons.md |
| Stage completion, knowledge capture and delivery | references/completion.md |
| Ready optical math | assets/core/displacement-map.js and liquid-glass-core.js |
| Numerical regression check | node scripts/test-displacement-map.mjs |

Use the references selectively. Do not install every related library. The included optical core is MIT-licensed third-party code; retain its LICENSE and attribution when copying it. It supplies map generation and compatibility helpers, not a complete native Apple material.
