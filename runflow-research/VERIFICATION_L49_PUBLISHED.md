# L49 verification

Source commit: a360f9c70c0c6446f2fe5422df97872ef15ec964.

The main Runflow uses L49 directly. The separate Dock lab retains L48 for comparison only.

Published Chromium measurements after hydration:

| Property | Observed |
| --- | --- |
| Main narrow viewport | 390 px, horizontal L49 |
| Dock height / button height | 76 px / 64 px |
| Shared material backdrop-filter | url("#runflow-material-1") in main; url("#runflow-material-2") in comparison |
| Active selection backdrop-filter | none |
| Content separation marker | data-dock-edge=true |
| Published stylesheets | CSSOM rule counts 706 and 36 on comparison page |
| Explicit fallback in local comparison | shared blur(3px), active none |

TypeScript, 14 numerical/contrast checks, production build and built-CSS filter assertions passed. A portable source export also passed TypeScript and its independent build using the same installed dependency versions; the export does not contain dependency files or a database.

Screenshots show real Chromium output with demo records. The recording contains 48 actual browser screenshots over about 3.4 seconds with original capture intervals; it is evidence of interaction, not a frame-rate benchmark. Drags, repeated same-target clicks and scrolling were exercised. No hardware iPhone, Safari or GPU/frame-time acceptance is claimed.
