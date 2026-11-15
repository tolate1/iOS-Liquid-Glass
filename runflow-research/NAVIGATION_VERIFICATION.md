# L42 — visible in-flow navigation specimen
The owner reports the previous portal repair still did not show navigation on the phone. Treat that repair as failed on device.

The lab now renders a single navigation specimen unconditionally inside its card. It does not use matchMedia to mount navigation, a body portal, or fixed positioning. Route-scoped mobile CSS retains five horizontal tabs. Desktop remains vertical. A visible L42 status marker distinguishes the revision. Production Dock placement is unchanged by this iteration.

Passed: TypeScript, production build and whitespace checks. No browser or new physical-device verification was available. Phone visibility and interaction acceptance remain open. Original runtime cause remains unknown. The menu occlusion and segment deformation remain open separately.
