# Static audit and migration planning

From the engine checkout, run `npm ci` and `npm run build`. After a local tarball install, use `npx --no-install ios-liquid-glass` in the consumer project, or invoke `node dist/cli.cjs` from the engine checkout.

```bash
node dist/cli.cjs init --dry-run --root examples/react-fixture
node dist/cli.cjs audit --json --root examples/react-fixture
node dist/cli.cjs plan --dry-run --root examples/next-fixture --mode preserve-brand
```

- `init` creates a single versioned `.liquidglass.json` and fails when that name already exists. `--dry-run` prints the configuration without writing.
- `audit` reads the selected project and reports source-relative locations. JSX, HTML and CSS are parsed. Semantic evidence includes native elements, explicit JSX roles, recognized routing imports and inferred compositing risks.
- `plan` emits a reviewable JSON plan derived from the current inventory. Actions include role, precise location, source SHA-256, risk and checks. The mode is recorded for the reviewing agent. The current rule set gives the same action recommendations in both modes.
- Both audit and plan are read-only. Use `scope` and `exclude` from [config v1](../schemas/config.schema.json) to narrow discovery. Symlinks, dot paths, recognized generated directories and likely credential filenames are excluded.

The scanner does not resolve the React component tree, execute the target project, assess computed CSS, or infer runtime behavior from arbitrary bindings. Next route results are file candidates by convention. Runtime screenshots remain a separate browser verification step. The reviewed toolbar pilot is described below.

## React and Next integration

Import the CSS in a global stylesheet entry appropriate to the application, then install a theme scope. Use the optional React entry point in React 18.3 or 19. The installed package owns its DOM decoration through a post-mount effect. The SSR markup renders the application content and is stable through hydration. Use `surfaceRole` for the material layer and the native `role` prop for ARIA.

```jsx
import "@ios-liquid-glass/web/styles.css";
import { GlassProvider, GlassToolbar, GlassSearch } from "@ios-liquid-glass/web/react";

export function FileActions({ query, onQueryChange }) {
  return (
    <GlassProvider theme="neutral-dark">
      <GlassToolbar aria-label="File actions">
        <GlassSearch aria-label="Filter files" value={query} onChange={(event) => onQueryChange(event.target.value)} />
      </GlassToolbar>
    </GlassProvider>
  );
}
```

The React fixture is built and hydrated by `npm run test:browser` after installing the packed engine into a temporary project. To run the [Next fixture](../examples/next-fixture), copy that folder to a clean directory, install the engine's local tarball there with `npm install /path/to/ios-liquid-glass-web-0.1.0.tgz`, then run `npm run build -- --webpack`. The static output is in `out/`.

## Reviewed toolbar pilot

The pilot requires an installed engine, a React/Vite project at the Git root, and exactly one paired `<div data-lg-migrate="toolbar">` in the selected module. The plan binds the change to a file and exact before/after fingerprints. The transform changes the marked element to `GlassToolbar` and adds its imports. It preserves children and their bindings. Existing CSS that depends on the original direct-child structure requires separate review.

```bash
npx --no-install ios-liquid-glass plan --entry App.jsx --dry-run > glass-plan.json
npx --no-install ios-liquid-glass apply --plan glass-plan.json --dry-run
npx --no-install ios-liquid-glass apply --plan glass-plan.json
npx --no-install ios-liquid-glass verify --plan glass-plan.json
npx --no-install ios-liquid-glass revert --plan glass-plan.json
```

Review the plan and dry-run before applying. The target must be tracked and clean. Revert checks the exact result fingerprint and refuses staged changes to that file. Verify reports source identity and leaves browser checks pending. The public browser suite builds the staged and baseline copies of the [Vite dashboard](../examples/vite-fixture) and checks that the inventory filter still updates the actual rows and units.
