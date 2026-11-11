# Motion and direct manipulation

Preserve an existing working controller before swapping material renderers. Pointer-aware highlights are not tab transition animation. Changing width/height symmetrically is not automatically liquid motion.

## A draggable selection indicator

Use Pointer Events and pointer capture. Track only the primary pointer ID. Record pointer origin and grab offset. Update the dragged presentation continuously rather than waiting for click/release. Keep a short position/time history for signed velocity.

On release, choose the intended target using position and, when appropriate, projected velocity. Hand current presentation and velocity into the spring. Retarget from the current position when interrupted. Never restart from an old logical tab coordinate.

Handle pointercancel, lost capture, viewport resize, keyboard activation and repeated gestures. Reset press/stretch state on every exit path. Prevent a synthetic click from reactivating the wrong tab after a drag, while preserving keyboard clicks.

Translate velocity into modest signed deformation: the leading and trailing sides should differ. Verify the displacement in pixels at real size; a signed coefficient producing less than one pixel may technically exist but remain invisible. Keep icons and text outside geometric distortion.

Use motion values for transform/size. Avoid React state updates for every pointer frame. Regenerate a displacement map only when necessary; do not allocate canvases per pointermove.

## Transient surfaces

Grow a popover from the trigger's location. Enter and exit on the same spatial path. Prefer interruptible transitions/springs to repeated entrance keyframes when the user can reverse midway. Keep text sharp as the material settles.

Use brief press feedback, clear active state, and consistent easing. Reuse an already-installed animation library; do not install several competing spring engines.

## Product motion budget

Navigation and transient controls can express material. Content should stay stable: do not animate all async panels from opacity zero on every refresh. A new fetch should not replay the entire screen.

Reduced motion: keep selection and focus obvious, remove stretch/parallax/overshoot, and use immediate or restrained state changes. Keep every action available without dragging.
