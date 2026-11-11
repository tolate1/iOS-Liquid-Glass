# Useful glass UI

## Chart toggles

For two or three legend toggles, use a content-sized group or plain inline buttons. Keep at least 44px touch height without a huge tray around them. Use aria-pressed for independent series, not radio/segmented semantics if several may be enabled simultaneously.

Keep label and line swatch; distinguish hidden state through muted treatment and explicit pressed state. Avoid making struck-through text the sole indicator. Preserve the user's default visibility. If all series are hidden, offer a clear inline hint. Keep charts linear if the user rejects smoothing. Do not let tooltips cover the whole chart.

## Analytical cards

Show measured data, not decoration posing as data. Do not invent a route without GPS. A lap-pace sparkline or a clear stability measure can replace a decorative orbit when actual lap records exist.

Name the window and comparison baseline. Distinguish calendar periods from “the last N runs.” Missing baseline is not 0% improvement. Use time-weighted aggregate speed (total distance / total time), and specify aggregation of variability scores. For zero/invalid denominators, show an explicit empty state.

Explain a composite verdict using the formula actually in the application. If score = speed^a × distance^b, compare a·log(speed ratio) with b·log(distance ratio) to identify the dominant factor. Do not call a shorter recovery run a failed workout. Separate measured performance from training value or medical readiness.

Keep user data, goals and definitions unchanged during visual polish. Do not replace a median-based metric with an average because it is easier to graph. Preserve charts' labels, units and editing flows.

## Microcharts

Use real series with units and accessible text. Do not smooth away variation. Name whether bars represent runs, days or cumulative totals. Do not exaggerate a tiny change with an unlabeled cropped axis. Show an honest empty state when only one point exists.

## Responsive hierarchy

Make secondary labels readable on the target device; do not solve density solely by shrinking text. Let a desktop two-column hero become stacked mobile content. Keep buttons reachable above the dock and virtual keyboard. Respect safe areas.

Keep one content focus per tab. Summaries should answer what happened, how it compares and what is uncertain. Do not add badges or charts merely to fill an empty area.
