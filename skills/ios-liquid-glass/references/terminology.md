# Liquid Glass terminology

Use these terms precisely in briefs, components and reviews. Preserve the product's own names for user-facing features; technical material terms usually belong in development notes.

| Term | Meaning | Avoid confusing it with |
| --- | --- | --- |
| Content layer | Records, charts, media and readable data | A collection of floating glass cards |
| Functional/control layer | Navigation and actions floating over content | Every container with a border |
| Transient surface | A menu, popover or sheet summoned by a control | A new global style for the whole app |
| Backdrop | Actual composited content behind a surface | A cloned icon strip or a fixed wallpaper |
| Refraction / lensing | Geometry-dependent displacement or concentration of background detail | Blur, tint, bloom or pointer glow |
| Scattering / frost | Diffusion that reduces competing backdrop detail | Evidence of custom refraction |
| Bezel / rim | Curved edge band that defines the material's thickness | An equally bright outline everywhere |
| Specular highlight | A localized reflection responding to geometry/light | A full-width gradient stripe |
| Fresnel response | View-angle-dependent reflection, often approximated on web | Any white border |
| Adaptive tint | Contrast/tonal treatment responding to the backdrop | Merely switching the global theme |
| Displacement map | Field encoding sampling-coordinate offsets | The source image itself |
| SDF | Signed distance to a shape, useful for edge profiles | Physical glass simulation by itself |
| Material profile | Shared tuning for size, role and backdrop density | A separate unrelated component style |
| Direct manipulation | Continuous tracking from pointer-down through release | Switching on click with a CSS transition |
| Spring | A stateful motion model preserving current position/velocity | A repeated entrance animation |
| Morphing | Coherent shape change between states | Independently stretching width and height |
| Backdrop root / containing block | Compositing/positioning boundaries to inspect | A z-index number that can fix every problem |
| Fallback | An explicitly limited alternative rendering path | Native parity on an untested browser |
| Evidence gate | A specific test required to support a claim | The amount of written code |

Name an approximation as an approximation. Native Apple materials combine behaviors the browser does not expose automatically. A useful web reproduction can still be precise and attractive without claiming equivalence.
