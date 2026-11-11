# Failure patterns from a running diary redesign

Treat these as transferable failure modes, not as a fixed visual template.

| Symptom | Cause to inspect | Corrective direction |
| --- | --- | --- |
| Only the active tab looks like glass | The tray/cards remain opaque; style tokens do not control their real backgrounds | Inspect combined alpha and actual cascade; assign materials by layer |
| Intensity at 100% still looks solid | White gradients stack over an opaque fill | Reduce total opacity; connect the slider to visible material properties |
| “Liquid” indicator teleports | Logical selection is updated without continuous presentation motion | Repair the controller; preserve current position and signed velocity |
| Dragging follows the cursor but feels like rubber plastic | Motion exists, optical backdrop interaction does not | Separate physics proof from refraction proof |
| Icons disappear on mobile | Moving exclusion masks and cloned foreground strips disagree | Render one sharp icon layer; remove mask dependency |
| Popover is under the toolbar | A parent stacking/compositing boundary defeats the child's apparent z-index | Inspect ancestors; use an independent overlay/portal |
| Rounded glass contains a rectangular crop | Filter region and displacement image coordinates disagree | Validate capture bounds and mapping on text/grid content |
| Glass text becomes unreadable | Background text remains too sharp, tint too weak, or rim too bright | Add restrained scattering/tint; keep foreground sharp |
| A two-item legend looks like an empty container | Full-width glass enclosure is disproportionate | Use compact independent toggles; remove the enclosing glass |
| Every panel competes with every other panel | Glass was applied to content, controls and selections equally | Rebuild layer hierarchy; reduce surfaces before adding effects |
| Claimed live page refraction is actually an icon copy | Optical source is not the real page | Identify and report the source; choose supported backdrop processing |
| A 150ms capture throttle is called 60FPS | Lens FPS is confused with source freshness | Measure capture duration and texture age separately |
| Black theme still looks blue/green | Accent, shadow, background and chart tokens were not neutralized | Neutralize source tokens; disable chromatic dispersion |
| A workout is labeled worse without explanation | Composite score hides its speed/distance contributions | Explain the real formula and the dominant factor |

Retain useful existing data-entry behavior and storage. A material redesign must not break default distances, minute/second focus movement, backspace behavior, editable records, goals or comparison charts.

Do not overstate the maturity of these lessons: a verified Chromium web iteration does not establish native Apple parity or physical iPhone performance.

A dock unexpectedly appearing at the top can be a compositing/containing-block bug, not a spring-position bug. Inspect the mobile parent before rewriting a working drag controller. Verify empty, loading and demo states after hydration: a screenshot captured immediately after a click may still show the previous frame.
