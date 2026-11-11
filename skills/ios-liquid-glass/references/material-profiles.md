# Material profiles

These are project-facing web profile names, not three official Apple variants. Apple discusses Regular and Clear variants; “Transient” here describes the role-specific treatment of a summoned surface, normally based on a regular material.

| Profile | Use | Visual/behavioral intent | Readability condition |
| --- | --- | --- | --- |
| Clear Glass | Small floating navigation or controls over suitable rich content | Low tint, restrained scattering, visible edge lensing | Use only if foreground remains clear; provide localized dimming or choose Regular otherwise |
| Regular Glass | Toolbars, filters and grouped controls over mixed content | Balanced tint, quiet rim, scattering/adaptation where needed | Default for analytical products and dense text |
| Transient Glass | Popovers, menus, settings sheets | Anchored motion, stronger depth/tint as the surface grows | Independent overlay bounds and sharp foreground labels |

Use explicit roles/classes such as material-clear, material-regular and material-transient, backed by a common token family. Do not let legacy global selectors put glass on all cards and then undo it later in the cascade. Refactor this incrementally and verify matching before/after states.

Do not prescribe Clear Glass for every tab bar regardless of background. A bar crossing dense numeric rows may need Regular treatment. Do not combine independent material layers simply because they share a profile name.

Verify each profile over actual text, charts, card boundaries and scrolling content. A black empty field cannot demonstrate much refraction. Do not invent noisy wallpaper to compensate for an unsuitable product composition.
