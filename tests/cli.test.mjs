import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
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
