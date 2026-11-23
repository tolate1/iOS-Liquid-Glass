import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const cli = resolve("dist/cli.cjs");
const output = resolve("examples/vite-fixture/generated");
const fixture = await mkdtemp(join(tmpdir(), "liquid-glass-vite-"));
const npm = (args, cwd) => execFileSync(process.execPath, [process.env.npm_execpath, ...args], { cwd, encoding: "utf8" });
const git = (...args) => execFileSync("git", args, { cwd: fixture, stdio: "pipe" });
const tool = (...args) => JSON.parse(execFileSync(process.execPath, [cli, ...args], { cwd: fixture, encoding: "utf8" }));

try {
  const [{ filename }] = JSON.parse(npm(["pack", "--ignore-scripts", "--json", "--pack-destination", fixture]));
  for (const path of ["App.jsx", "index.html", "package.json"]) {
    await cp(`examples/vite-fixture/${path}`, join(fixture, path));
  }
  npm(["install", "--ignore-scripts", "--no-audit", "--no-fund", "--prefer-offline", join(fixture, filename)], fixture);
  git("init");
  git("add", "App.jsx", "index.html", "package.json");
  git("-c", "user.name=Liquid Glass Fixture", "-c", "user.email=fixture@example.invalid", "commit", "-m", "Baseline");
  await mkdir(output, { recursive: true });
  const source = join(fixture, "App.jsx");
  const baseline = await readFile(source, "utf8");
  npm(["run", "build", "--", "--base=/examples/vite-fixture/generated/baseline/", "--outDir=dist-baseline"], fixture);
  const plan = tool("plan", "--entry", "App.jsx", "--dry-run");
  await writeFile(join(fixture, "plan.json"), JSON.stringify(plan));
  assert.deepEqual(tool("apply", "--plan", "plan.json", "--dry-run").changed, []);
  assert.equal(await readFile(source, "utf8"), baseline);
  assert.deepEqual(tool("apply", "--plan", "plan.json").changed, ["App.jsx"]);
  assert.equal(tool("verify", "--plan", "plan.json").checks[0].status, "passed");
  npm(["run", "build", "--", "--base=/examples/vite-fixture/generated/migrated/", "--outDir=dist-migrated"], fixture);
  assert.deepEqual(tool("revert", "--plan", "plan.json").changed, ["App.jsx"]);
  assert.equal(await readFile(source, "utf8"), baseline);
  await cp(join(fixture, "dist-baseline"), join(output, "baseline"), { recursive: true });
  await cp(join(fixture, "dist-migrated"), join(output, "migrated"), { recursive: true });
  console.log("Vite baseline, controlled toolbar apply, production build, and byte-exact revert passed.");
} finally {
  await rm(fixture, { recursive: true, force: true });
}
