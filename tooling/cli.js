#!/usr/bin/env node
import { parseArgs } from "node:util";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { validate } from "./contracts.js";
import { prepareMigration, runMigration } from "./migration.js";
import { makePlan, openProject, readConfig, scanProject } from "./scanner.js";

async function run() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      root: { type: "string", default: "." },
      mode: { type: "string" },
      json: { type: "boolean" },
      entry: { type: "string" },
      plan: { type: "string" },
      "dry-run": { type: "boolean" },
      help: { type: "boolean", short: "h" },
    },
  });
  if (values.help || !positionals.length) {
    console.log("Usage: ios-liquid-glass <init|audit|plan|apply|verify|revert> [--root PATH] [--json] [--dry-run] [--entry PATH] [--plan FILE]");
    return;
  }
  const [command] = positionals;
  const migrationCommands = ["apply", "verify", "revert"];
  if (positionals.length !== 1 || !["init", "audit", "plan", ...migrationCommands].includes(command)) {
    throw new Error("Unknown command. Use --help for usage.");
  }
  if (values.entry && command !== "plan") throw new Error("--entry is supported by plan.");
  if (Boolean(values.plan) !== migrationCommands.includes(command)) {
    throw new Error("Apply, verify and revert require --plan FILE.");
  }
  if (values.mode !== undefined && (command !== "plan" || !["preserve-brand", "ios-transform"].includes(values.mode))) {
    throw new Error("--mode is supported by plan and accepts preserve-brand or ios-transform.");
  }
  const project = await openProject(values.root);
  const config = await readConfig(project);
  const json = (value) => JSON.stringify(value, null, 2);
  if (migrationCommands.includes(command)) {
    const result = await runMigration(command, project, config, values.plan, values["dry-run"]);
    console.log(json(result));
    if (result.checks?.some((check) => check.status === "failed")) process.exitCode = 1;
    return;
  }
  if (command === "init") {
    if (project.metadata.framework === "unsupported") throw new Error("No supported framework detected.");
    if (!values["dry-run"]) await writeFile(join(project.root, ".liquidglass.json"), json(config) + "\n", { flag: "wx" });
    console.log(json(config));
    return;
  }
  const { inventory, hashes } = await scanProject(project, config);
  const plan = command === "plan" ? makePlan(inventory, hashes, values.mode ?? config.designMode) : null;
  if (plan && values.entry) {
    plan.migration = await prepareMigration(project, config, values.entry);
    validate("plan", plan);
  }
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
