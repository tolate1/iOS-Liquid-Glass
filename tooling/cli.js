#!/usr/bin/env node
import { parseArgs } from "node:util";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { makePlan, openProject, readConfig, scanProject } from "./scanner.js";

async function run() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      root: { type: "string", default: "." },
      mode: { type: "string" },
      json: { type: "boolean" },
      "dry-run": { type: "boolean" },
      help: { type: "boolean", short: "h" },
    },
  });
  if (values.help || !positionals.length) {
    console.log("Usage: ios-liquid-glass <init|audit|plan> [--root PATH] [--json] [--dry-run] [--mode preserve-brand|ios-transform]");
    return;
  }
  const [command] = positionals;
  if (positionals.length !== 1 || !["init", "audit", "plan"].includes(command)) throw new Error("Expected init, audit or plan.");
  if (values.mode !== undefined && (command !== "plan" || !["preserve-brand", "ios-transform"].includes(values.mode))) {
    throw new Error("--mode is supported by plan and accepts preserve-brand or ios-transform.");
  }
  const project = await openProject(values.root);
  const config = await readConfig(project);
  const json = (value) => JSON.stringify(value, null, 2);
  if (command === "init") {
    if (project.metadata.framework === "unsupported") throw new Error("No supported framework detected.");
    if (!values["dry-run"]) await writeFile(join(project.root, ".liquidglass.json"), json(config) + "\n", { flag: "wx" });
    console.log(json(config));
    return;
  }
  const { inventory, hashes } = await scanProject(project, config);
  const plan = command === "plan" ? makePlan(inventory, hashes, values.mode ?? config.designMode) : null;
  // Plans are consistently machine-readable, including dry runs.
  if (plan || values.json) console.log(json(plan ?? inventory));
  else {
    console.log(`${inventory.project.framework} / ${inventory.project.runtime} · ${inventory.observations.length} observations`);
    for (const { source, role, evidence } of inventory.observations) {
      console.log(`${source.path}:${source.line}:${source.column}  ${role}  ${evidence}`);
    }
    for (const detail of inventory.diagnostics) console.log(detail);
  }
}

run().catch((error) => {
  console.error(`ios-liquid-glass: ${error.message}`);
  process.exitCode = 1;
});
