# Universal UI engine architecture

The baseline at `5b0e967` is an agent skill, reusable inverse-lens math with browser helpers, starter CSS and research checkpoints. It has no package manager, component runtime, scanner or CLI. Runflow L49 is historical release evidence. L50 is a research checkpoint. See [source inventory](SOURCE_INVENTORY.md).

The first package uses npm, ESM and native browser APIs. JavaScript with TypeScript declarations keeps the vanilla runtime usable without a framework or transpiling application code. The public JS and scoped CSS ship together. The optics bundle includes the original MIT notice and upstream attribution. Repository-wide release rights are a separate packaging decision.

## Responsibility boundaries

| Layer | Contract |
| --- | --- |
| Optics | Infer syntax support independently of selected renderer. Render browser backdrop via SVG, frost or opaque. Report evidence independently of configuration. |
| Tokens | Explicit theme scope and semantic roles. Content, field and selection use solid/readable treatments independently of optical controls. |
| Surface | One decorative backdrop and an unfiltered foreground. Mount after DOM creation, update options, refresh geometry, destroy owned resources. |
| Controls | Native activation where possible. App owns committed values and business data. A drag preview stays local until release. Controls must handle cancellation and preserve keyboard operation. |
| Adapter | Preserve routes, forms, callbacks, refs, identity and SSR. Mount the shared browser runtime after hydration. |
| Tooling | Read-only inventory before planning. Writes belong to approved, reversible migrations confined to the verified project root. |

## Versioned tooling contracts

These are design contracts for the tooling stages. Validate JSON at every command boundary before using it.

- Configuration v1 declares framework, design mode, theme, renderer, fallback, project-relative include/exclude scopes and QA viewports. Unknown versions fail validation. Resolve real paths before reads or writes and reject paths outside the selected root.
- Inventory v1 carries project metadata, source records with relative paths and 1-based locations, and observations with evidence and confidence. Static evidence and runtime observations remain distinct.
- Plan v1 adds design mode, file scope, source identity, action, risk and checks for each proposed edit. Content and input stay readable. Application of a plan requires consent and stale-source detection.
- Verification reports carry per-check status (`passed`, `failed`, `blocked`, `not-tested`), context and evidence links. Browser output never establishes device support by inference.

See [compatibility](COMPATIBILITY.md) for the verification boundaries.

## Web component entry points

- `mountGlassSurface` owns the backdrop layer only. It may wrap existing toolbar or content HTML.
- `mountGlassSegmentedControl` accepts direct `button[type=button][data-lg-value]` children. Supply ID-bearing panels for tabs, or omit panels for a radio group. `setValue` synchronizes externally chosen values without calling `onValueChange`. Use a stable button list for the lifetime of a mount.
- `mountGlassPopover` uses the native top layer, dismissal and focus restoration. `mountGlassMenu` adds arrow/Home/End navigation and closes after menu-item activation. The app owns its item actions. Supply locally unique IDs and mark up the panel and menu items with their accessible names.
- `lg-button`, `lg-field`, `lg-toolbar` and `lg-dock` are CSS hooks for native elements. The application owns input validation, form submission and loading state. Pair a mobile Dock with the `lg-dock-layout` bottom reserve and keep its fixed positioning ancestors free of transforms and filters.

## Reviewable source changes

The React/Vite pilot binds one marked toolbar source to Git root, a deterministic transform and exact before/after SHA-256. Checked Git patches leave the index alone. Revert requires the exact transformed contents; user changes cause a refusal. The plan contains no copy of the application source.
