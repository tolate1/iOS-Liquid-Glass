# Source inventory at 5b0e967

| Source | Existing implementation | Reuse |
| --- | --- | --- |
| `skills/ios-liquid-glass/SKILL.md`, `agents/openai.yaml` | Agent entry points | Point agents to working runtime and checks as they land |
| `skills/ios-liquid-glass/references/` | Layers, rendering, motion, product patterns, pitfalls, acceptance and observations | Preserve and use during implementation |
| `skills/ios-liquid-glass/assets/core/` | MIT inverse-lens pixels, canvas serialization, adaptive color estimates, support heuristic | Reuse the pixel generator with its license and attribution |
| `skills/ios-liquid-glass/assets/material-tokens.css` | Starter CSS | Keep the standalone skill API, use scoped semantic tokens in the engine |
| `skills/ios-liquid-glass/scripts/` | Map generation and numerical regression suite | Run unchanged as the baseline |
| `runflow-research/`, `Runflow-open-source.zip` | Historical experiments and evidence | Preserve; engine builds do not depend on them |

The baseline numerical check passed on Node 24.22.3. The baseline has no package-wide license. The optical core is attributed to [xinlingfeiwu/liquid-glass-design-skill](https://github.com/xinlingfeiwu/liquid-glass-design-skill) under its accompanying MIT license.
