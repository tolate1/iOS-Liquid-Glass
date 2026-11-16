# L50 — implementation checkpoint, NOT a published release

## Current delivery state

The last saved application version and the root Runflow-open-source.zip are L49.
Base application source commit: a360f9c70c0c6446f2fe5422df97872ef15ec964.
L50 was edited and exercised in a local Chromium preview before the execution environment became unavailable. Its full production build, source push, new archive and publication have NOT completed. Do not label the current public application L50.

## Owner feedback being addressed

During scrolling the owner sees a displaced/trailing shadow following the bottom Dock. The owner also rejects the material as insufficiently glass-like and asks for coherent motion.

The L49 implementation moves a feathered alpha mask across the actual page subtree from a scroll handler. This is a plausible source of the reported detached shadow; no new owner recording isolated causality. Remove this mechanism instead of tuning its scroll-following spring.

## Implemented local changes to recover

1. Delete lib/dock-separation.ts. Remove its import, edgeTargets/edgeKeys, the entire liveEdges mask-position update and cleanup from components/RunflowGlass.tsx. Remove the data-dock-edge CSS mask rules. Main content must compute mask-image:none and have no --dock-edge-y or data-dock-edge marker.
2. Change the main GlassNavigation marker from l49 to l50, together with the corresponding renderer selectors and app/dock-material.css selectors. Keep the existing gesture controller, release choice, repeat-tap threshold, cancellation, reduced motion and label layer.
3. In the existing layout-effect that subscribes to renderX/renderY/width/height/stretch/pressed, dispatch the same actual presentation to the material node (horizontal only):

```ts
const optics=material.current;
if(optics&&horizontal.current)
 optics.dispatchEvent(new CustomEvent('runflow:dock-presentation',{
  bubbles:true,
  detail:{...presentation.get(),baseWidth:baseW.get(),baseHeight:baseH.get()}
 }));
```

4. One shared material filter combines the outer Dock vector map and a translated local lens vector map BEFORE a single feDisplacementMap. The selected foreground surface still computes backdrop-filter:none.

Pipeline:
- SourceGraphic -> Gaussian blur -> theme-aware RGB contrast compression -> displacement.
- Outer map result: map.
- feFlood neutral RGB(128,128,128), result neutral.
- feImage data-dock-field, result localLens, preserveAspectRatio none.
- feComposite localLens OVER neutral -> localField.
- Arithmetic composition map + .6*localField - .6*(128/255) -> dockField.
- The single displacement reads scatteredBackdrop and dockField, R/G channels.

The RGB compression uses slope .32 for each channel and intercept .045 in dark / .66 in light. Update on theme changes; include data-theme in the renderer's observed attribute list. This reduces competing backdrop text inside the material rather than modifying the page itself.

5. A runflow:dock-presentation listener sets the local feImage x/y/width/height directly from the presentation event. It is not a second spring and never follows scroll coordinates.
   Generate its texture only on base-button size changes, or when a recreated filter has no href. Local map settings used in the preview: profile soft, magnify 1.075, bend .04, spread .58, bezelRatio .38, supersample 2, radius min(baseWidth,baseHeight)/2. Cache key rounded baseWidth:baseHeight.
   On initial registration use the current rendered lens rectangle relative to nav, not the logical selected tab. Remove the listener during renderer cleanup.
6. Shared dock profile tested locally:
```ts
dock:{maxScale:16,magnify:1.065,bend:.045,bezelRatio:.26,preblur:2.2}
```
   These are experimental web tuning values, not Apple constants. Inspect the combined-map calibration visually; do not infer optical equivalence from matching DOM coordinates.
7. app/dock-material.css: remove all page masks; retain one shared substrate and sharp original icons. Tint alpha light .20/dark .24; attached nav shadow 0 3px 10px; fallback blur(6px); nonfiltering selection with a restrained linear fill and edge. No caustic/cursor spotlight. Preserve 76 px Dock / 64 px buttons.
8. Exclude the l50 nav from the existing scroll-overlap density updater. Other header/toolbar behavior remains unchanged.
9. The existing A/B route keeps A=L48 and updates B=L50; do not mislabel A as L49. Update the route labels and scoped compact CSS selectors.

## Evidence actually collected before interruption

- Initial TypeScript check succeeded. Fourteen existing numerical/contrast tests passed after the last material edit. A final TypeScript invocation was started in the same terminal sequence, but its completion was not collected before the environment interruption.
- Chromium local main application at 390 and 768 px; demo Journal; both themes; end-of-Journal scrolling; drag/release and repeated same-target clicks.
- Main Dock rectangle before and after scrolling: x=10,y=754,width=353,height=76 within the 390 px review frame. Computed shadow was unchanged: rgba(0,0,0,.14) 0px 3px 10px 0px.
- Main content: mask-image:none, no data-dock-edge, empty --dock-edge-y.
- Main shared filter computed url("#runflow-material-1"); selection computed none.
- After drag to Goals, local map x=289.123042 / y=6 / width=70.86958 / height=64; rendered lens x=289.123047 / y=6 / width=70.859375 / height=64. This establishes alignment within rounding, not perceived native quality.
- Contrasting graph-line preview visibly changed at the material boundary. Background numbers were still too competitive in the first version, so the RGB compression above was added afterward.
- Raw actual main-app screenshots were recorded during scroll, drag and repeated clicks: 26 frames over about 1.9 seconds. These were not encoded/exported, and are not a frame-rate benchmark.
- Final fallback review was opened but NOT completed. The 768 px frame extended below the visible browser viewport; do not use the last screenshot as proof of full-panel visibility at that width.
- No hardware iPhone/Safari, GPU or frame-time acceptance.

## Remaining work before calling this complete

Recover the exact local edits if the workspace returns; otherwise reconstruct the candidate against the L49 base using this checkpoint. Do not replace the existing full application archive with notes.

Re-read the final diff; complete TypeScript, production build, built-CSS assertions, and Chromium fallback/scroll/drag/theme checks. Inspect the numerical backdrop after RGB compression, and check optical-field alignment during interruptions and responsive resize. Confirm no mask or moving page shadow remains.

Revise DESIGN.md and the reusable knowledge entry: the owner rejected L49's page-mask strategy, so it must not remain recommended as the current default. Preserve the public skill mirror unchanged as requested by the owner.

Then publish the main application, verify its real production filters, export a working source ZIP with real screenshots/recording, and update the application archive on GitHub. Do not claim any of these pending steps already happened.
