# L44 — repeated selection does not stop the lens

Problem: pointer-down unconditionally jumped the positional spring to its current value, stopping travel even for a repeated tap. Pointer-up then restarted release with zero velocity. Repeated taps could continuously arrest movement.

Change: retain positional animation during tap/hold; acquire position only when movement exceeds the existing 3px drag threshold. At that handoff, rebase the grab origin to the current presentation. A tap retargets with set(), preserving the existing spring for an unchanged target. A release to an already-running identical target does not restart the Motion animation. Applies to navigation and journal/demo segments. Cancellation and reduced-motion paths remain available.

Validation: TypeScript and the existing ten numeric regression tests. These tests do not simulate repeated pointer input. Browser checks and physical-device scope are recorded in the release report. No new iPhone acceptance is claimed.

Chromium preview: six repeated clicks on Demo committed once and the lens reached Demo; eight repeated clicks on the same vertical/horizontal navigation target committed once and settled at that target. Repeated click followed by a one-second held click did not leave the positional lens frozen at the starting tab. Drag from the last horizontal tab to the first still selected the first tab after threshold acquisition was corrected to discard only the 3px dead zone, not the entire first movement sample. These checks are desktop pointer checks, not physical iPhone acceptance.
