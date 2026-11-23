import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { makePlan, openProject, readConfig, safeRelative, scanProject } from "../tooling/scanner.js";

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), "lg-scan-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, "app", "settings"), { recursive: true });
  await writeFile(join(root, "package.json"), JSON.stringify({ dependencies: { react: "^19", next: "^16" } }));
  await writeFile(join(root, "pnpm-lock.yaml"), "");
  await writeFile(join(root, "app", "page.tsx"), `import Link from "next/link";
const handle = () => {};
export const Page = () => <main><nav style={{ transform: "scale(1)" }}>
  <Link href="/settings">Settings</Link><button onClick={handle}>Send</button>
  <form><input /></form></nav></main>;`);
  await writeFile(join(root, "app", "settings", "page.tsx"), "export const Page = () => <article />;");
  await writeFile(join(root, "theme.css"), ".layout { contain: paint; }");
  await writeFile(join(root, ".env"), "SECRET=never-read");
  return root;
}

test("scanner locates Next routes and JSX/CSS evidence, and differentiates content in the plan", async (t) => {
  const path = await fixture(t);
  const project = await openProject(path);
  const config = await readConfig(project);
  const { inventory, hashes } = await scanProject(project, config);
  assert.equal(inventory.project.runtime, "next");
  assert.equal(inventory.project.packageManager, "pnpm");
  assert.deepEqual(inventory.routes, ["app/page.tsx", "app/settings/page.tsx"]);
  const button = inventory.observations.find((item) => item.evidence === "JSX <button>");
  assert.equal(button.source.line, 4);
  assert.ok(button.source.column > 1);
  assert.ok(inventory.observations.some((item) => item.evidence === "CSS property contain" && item.confidence === "inferred"));
  assert.ok(!JSON.stringify(inventory).includes("never-read"));
  const plan = makePlan(inventory, hashes, config.designMode);
  assert.ok(plan.actions.some(({ role, action }) => role === "content" && action === "preserve"));
  assert.ok(plan.actions.some(({ role, action }) => role === "functional-control" && action === "wrap-and-restyle"));
  assert.ok(plan.actions.every(({ sourceHash }) => /^[a-f0-9]{64}$/.test(sourceHash)));
  await assert.rejects(readFile(join(path, ".liquidglass.json")), { code: "ENOENT" });
});

test("scopes cannot escape the root or follow symlinked directories", async (t) => {
  const root = await fixture(t);
  const sibling = await fixture(t);
  const project = await openProject(root);
  const config = await readConfig(project);
  await symlink(sibling, join(root, "outside"), process.platform === "win32" ? "junction" : "dir");
  assert.throws(() => safeRelative(root, sibling), /escaped/);
  await assert.rejects(scanProject(project, { ...config, scope: [".."] }), /escaped/);
  const { inventory } = await scanProject(project, { ...config, scope: ["outside/app"] });
  assert.deepEqual(inventory.observations, []);
  await writeFile(join(root, ".liquidglass.json"), JSON.stringify({ ...config, schemaVersion: 2 }));
  await assert.rejects(readConfig(project), /schemaVersion/);
});

test("plain HTML reports structural evidence without reading inline values", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "lg-scan-html-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(join(root, "index.html"), '<main><form><input value="not-in-report"><button>Send</button></form></main>');
  const project = await openProject(root);
  const { inventory } = await scanProject(project, await readConfig(project));
  assert.equal(inventory.project.framework, "vanilla");
  assert.deepEqual(inventory.observations.map(({ role }) => role), ["content", "field", "field", "functional-control"]);
  assert.ok(!JSON.stringify(inventory).includes("not-in-report"));
});
