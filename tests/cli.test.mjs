import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const cli = fileURLToPath(new URL("../tooling/cli.js", import.meta.url));
const execute = promisify(execFile);
const run = (root, command, ...args) => execute(process.execPath, [cli, command, "--root", root, ...args]);

test("CLI dry-run and audit do not write, init is exclusive and plans keep file identity", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "lg-cli-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const file = join(root, "index.html");
  const content = "<main><nav><button>Toggle</button></nav></main>";
  await writeFile(file, content);
  const configPath = join(root, ".liquidglass.json");
  const preview = JSON.parse((await run(root, "init", "--dry-run")).stdout);
  assert.equal(preview.framework, "vanilla");
  await assert.rejects(readFile(configPath), { code: "ENOENT" });
  const inventory = JSON.parse((await run(root, "audit", "--json")).stdout);
  assert.equal(inventory.observations.length, 3);
  const command = ["plan", "--dry-run", "--mode", "ios-transform"];
  const plan = JSON.parse((await run(root, ...command)).stdout);
  assert.equal(plan.designMode, "ios-transform");
  assert.equal(new Set(plan.actions.map((action) => action.sourceHash)).size, 1);
  await assert.rejects(readFile(configPath), { code: "ENOENT" });
  await run(root, "init");
  const created = await readFile(configPath, "utf8");
  assert.deepEqual(JSON.parse(created), preview);
  await assert.rejects(run(root, "init"), /EEXIST/);
  assert.equal(await readFile(configPath, "utf8"), created);
  assert.equal(await readFile(file, "utf8"), content);
});

test("controlled toolbar rejects dirty source, edited output and projects inside another Git root", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "lg-migration-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const git = (...args) => execute("git", args, { cwd: root });
  const manifest = JSON.stringify({ dependencies: { react: "^19", vite: "^8" } });
  await writeFile(join(root, "package.json"), manifest);
  const source = join(root, "App.jsx");
  const baseline = 'export const Toolbar = () => <div data-lg-migrate="toolbar"><button>Filter</button></div>;\n';
  await writeFile(source, baseline);
  await git("init");
  await git("add", "App.jsx", "package.json");
  await git("-c", "user.name=Fixture", "-c", "user.email=fixture@example.invalid", "commit", "-m", "Baseline");
  const plan = JSON.parse((await run(root, "plan", "--entry", "App.jsx")).stdout);
  await writeFile(join(root, "plan.json"), JSON.stringify(plan));
  await assert.rejects(run(root, "apply", "--plan", "plan.json"), /could not be resolved/);
  assert.equal(await readFile(source, "utf8"), baseline);
  const localPackage = join(root, "node_modules", "@ios-liquid-glass", "web");
  await mkdir(localPackage, { recursive: true });
  await writeFile(join(localPackage, "package.json"), JSON.stringify({ exports: {
    "./react": "./react.js", "./styles.css": "./styles.css",
  } }));
  await writeFile(join(localPackage, "react.js"), "");
  await writeFile(join(localPackage, "styles.css"), "");

  await writeFile(source, baseline + "// local edit\n");
  await assert.rejects(run(root, "apply", "--plan", "plan.json"), /source changed/);
  assert.equal(await readFile(source, "utf8"), baseline + "// local edit\n");
  await writeFile(source, baseline);
  const applied = JSON.parse((await run(root, "apply", "--plan", "plan.json")).stdout);
  assert.deepEqual(applied.changed, ["App.jsx"]);
  const upgraded = await readFile(source, "utf8");
  assert.match(upgraded, /<LGReviewedToolbar data-lg-migrate=/);
  await writeFile(source, upgraded + "// local edit after apply\n");
  await assert.rejects(run(root, "revert", "--plan", "plan.json"), /source changed/);
  await writeFile(source, upgraded);
  await run(root, "revert", "--plan", "plan.json");
  assert.equal(await readFile(source, "utf8"), baseline);
  await mkdir(join(root, "nested"));
  const nested = join(root, "nested");
  await writeFile(join(nested, "package.json"), manifest);
  await writeFile(join(nested, "App.jsx"), baseline);
  await writeFile(join(nested, "plan.json"), JSON.stringify(plan));
  await assert.rejects(run(nested, "apply", "--plan", "plan.json"), /must match the Git root/);
});
