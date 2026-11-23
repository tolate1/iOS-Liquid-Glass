import { parse } from "@babel/parser";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { lstat, readFile, realpath } from "node:fs/promises";
import { resolve } from "node:path";
import { createTwoFilesPatch } from "diff";
import { validate } from "./contracts.js";
import { safeRelative, walkAst } from "./scanner.js";

const upgradedTag = "LGReviewedToolbar";
const imports = `import "@ios-liquid-glass/web/styles.css";\nimport { GlassToolbar as ${upgradedTag} } from "@ios-liquid-glass/web/react";\n`;
const hash = (content) => createHash("sha256").update(content).digest("hex");
const gitEnv = { ...process.env };
delete gitEnv.GIT_DIR;
delete gitEnv.GIT_WORK_TREE;
delete gitEnv.GIT_INDEX_FILE;

async function safeFile(root, filename, maximum = 512_000) {
  const path = resolve(root, filename);
  safeRelative(root, path);
  const stats = await lstat(path);
  if (!stats.isFile() || stats.size > maximum || await realpath(path) !== path) {
    throw new Error("Expected a regular project file within the selected root.");
  }
  return readFile(path, "utf8");
}

function findToolbar(content, filename, tag) {
  const plugins = filename.endsWith(".tsx") ? ["jsx", "typescript"] : ["jsx"];
  const ast = parse(content, { sourceType: "module", plugins });
  if (ast.program.directives.length || content.startsWith("#!")) {
    throw new Error("The experimental transform requires a JSX module without top-level directives.");
  }
  const matches = [];
  walkAst(ast, (node) => {
    if (node.type !== "JSXElement" || node.openingElement.name.name !== tag || !node.closingElement) return;
    const attributes = node.openingElement.attributes;
    if (!attributes.some((attr) => attr.name?.name === "data-lg-migrate" && attr.value?.value === "toolbar")) return;
    const supported = new Set(["data-lg-migrate", "aria-label", "aria-labelledby", "id", "className"]);
    if (attributes.some((attr) => !supported.has(attr.name?.name))) {
      throw new Error("The marked toolbar has attributes that require manual review.");
    }
    matches.push([node.openingElement.name, node.closingElement.name]);
  });
  if (matches.length !== 1) throw new Error("Expected exactly one paired toolbar marked data-lg-migrate=\"toolbar\".");
  return matches[0];
}

function replaceTag(content, names, replacement) {
  for (const { start, end } of names.slice().reverse()) {
    content = content.slice(0, start) + replacement + content.slice(end);
  }
  return content;
}

function transform(content, filename) {
  if (!content.endsWith("\n") || content.includes("\r") || content.includes(upgradedTag)) {
    throw new Error("Expected LF-terminated JSX and an unused migration import name.");
  }
  return imports + replaceTag(content, findToolbar(content, filename, "div"), upgradedTag);
}

function reverse(content, filename) {
  if (!content.startsWith(imports)) throw new Error("The migration imports have changed.");
  const body = content.slice(imports.length);
  return replaceTag(body, findToolbar(body, filename, upgradedTag), "div");
}

function validateTarget(project, config, filename) {
  const target = safeRelative(project.root, resolve(project.root, filename));
  const normalized = (path) => safeRelative(project.root, resolve(project.root, path));
  const contains = (parent) => parent === "." || target === parent || target.startsWith(parent + "/");
  if (project.metadata.framework !== "react" || project.metadata.runtime !== "vite") {
    throw new Error("The toolbar transform is available for React/Vite projects.");
  }
  if (!/^[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_.-]+)*\.[jt]sx$/.test(target) ||
      target.split("/").some((part) => part.startsWith(".") || ["node_modules", "dist", "build", "generated"].includes(part)) ||
      !config.scope.map(normalized).some(contains) || config.exclude.map(normalized).some(contains)) {
    throw new Error("The toolbar entry must be a scoped JSX or TSX source file.");
  }
  return target;
}

export async function prepareMigration(project, config, entry) {
  const path = validateTarget(project, config, entry);
  const before = await safeFile(project.root, path);
  const after = transform(before, path);
  return { operation: "react-vite-toolbar", path, before: hash(before), after: hash(after) };
}

function git(root, args, input) {
  const result = spawnSync("git", ["--literal-pathspecs", ...args], { cwd: root, encoding: "utf8", input, env: gitEnv });
  if (result.status !== 0) {
    throw new Error(`Git ${args[0]} failed: ${result.stderr?.trim() || result.error?.message || "unknown error"}`);
  }
  return result.stdout;
}

async function verifyRoot(root) {
  const actual = await realpath(git(root, ["rev-parse", "--show-toplevel"]).trim());
  if (actual !== root) throw new Error("The selected directory must match the Git root for source changes.");
}

export async function runMigration(command, project, config, planPath, dryRun) {
  const plan = validate("plan", JSON.parse(await safeFile(project.root, planPath, 4_000_000)));
  if (!plan.migration) throw new Error("The supplied plan does not describe a supported source change.");
  const migration = plan.migration;
  const path = validateTarget(project, config, migration.path);
  const current = await safeFile(project.root, path);
  const digest = hash(current);
  if (command === "verify") {
    return {
      schemaVersion: 1,
      checks: [
        { name: "planned-source", status: digest === migration.after ? "passed" : "failed", path },
        { name: "consumer-browser", status: "not-tested" },
      ],
    };
  }
  await verifyRoot(project.root);
  git(project.root, ["ls-files", "--error-unmatch", "--", path]);
  const reverting = command === "revert";
  const expected = reverting ? migration.after : migration.before;
  if (digest !== expected) throw new Error("The source changed after the reviewed plan. No change was applied.");
  const status = git(project.root, ["status", "--porcelain=v1", "--untracked-files=all", "--", path]);
  if ((!reverting && status) || (reverting && status && !status.startsWith(" M "))) {
    throw new Error("The planned source has pending Git changes.");
  }
  const updated = reverting ? reverse(current, path) : transform(current, path);
  if (hash(updated) !== (reverting ? migration.before : migration.after)) {
    throw new Error("The change could not reproduce the reviewed source fingerprint.");
  }
  // The full source is an in-memory patch; keep it out of reports and plan files.
  const patch = createTwoFilesPatch(`a/${path}`, `b/${path}`, current, updated, "", "", { context: Infinity });
  git(project.root, ["apply", "--check", "--whitespace=nowarn", "-"], patch);
  if (!dryRun) {
    git(project.root, ["apply", "--whitespace=nowarn", "-"], patch);
    if (hash(await safeFile(project.root, path)) !== hash(updated)) throw new Error("The resulting source fingerprint did not match.");
  }
  return { operation: command, status: dryRun ? "checked" : "passed", changed: dryRun ? [] : [path] };
}
