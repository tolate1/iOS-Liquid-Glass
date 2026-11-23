import { parse } from "@babel/parser";
import { parse as parseHtml } from "parse5";
import postcss from "postcss";
import { createHash } from "node:crypto";
import { lstat, readFile, readdir, realpath } from "node:fs/promises";
import { basename, extname, isAbsolute, relative, resolve, sep } from "node:path";
import { validate } from "./contracts.js";

const ignored = new Set(["node_modules", "dist", "build", "coverage", "generated", "vendor", "secrets", "credentials"]);
const jsxExtensions = new Set([".js", ".jsx", ".mjs", ".ts", ".tsx"]);
const sourceExtensions = new Set([...jsxExtensions, ".css", ".html"]);
const roles = {
  button: "functional-control", nav: "functional-control", a: "functional-control",
  form: "field", input: "field", textarea: "field", select: "field",
  main: "content", article: "content", table: "content", canvas: "content",
  dialog: "transient",
};
const cssComposite = new Set(["filter", "backdrop-filter", "-webkit-backdrop-filter", "transform", "contain", "overflow", "mask", "clip-path"]);
const composite = new Set(["filter", "backdropFilter", "WebkitBackdropFilter", "transform", "contain", "overflow", "mask", "clipPath"]);

export function safeRelative(root, target) {
  const path = relative(root, target);
  if (path === ".." || path.startsWith(".." + sep) || isAbsolute(path)) {
    throw new Error("Project path escaped the selected root.");
  }
  return path.split(sep).join("/") || ".";
}

async function readProjectFile(root, filename, maximum) {
  const absolute = resolve(root, filename);
  safeRelative(root, absolute);
  const stats = await lstat(absolute);
  if (!stats.isFile() || stats.size > maximum) return null;
  safeRelative(root, await realpath(absolute));
  return readFile(absolute, "utf8");
}

export async function openProject(directory) {
  const root = await realpath(directory);
  if (!(await lstat(root)).isDirectory()) throw new Error("Select a project directory.");
  const names = new Set(await readdir(root));
  if (!names.has("package.json") && !names.has("index.html")) {
    throw new Error("Select a project root containing package.json or index.html.");
  }
  const manifest = names.has("package.json") ? await readProjectFile(root, "package.json", 512_000) : null;
  if (names.has("package.json") && manifest === null) throw new Error("Cannot read the project's package.json.");
  const pkg = manifest ? JSON.parse(manifest) : {};
  const dependencies = { ...pkg.dependencies, ...pkg.devDependencies };
  const framework = dependencies.next ? "next" : dependencies.react ? "react" :
    !dependencies.vue && !dependencies.svelte && names.has("index.html") ? "vanilla" : "unsupported";
  const [packageManager = "unknown"] = [
    ["pnpm", "pnpm-lock.yaml"], ["yarn", "yarn.lock"], ["npm", "package-lock.json"], ["bun", "bun.lock"],
  ].find(([, file]) => names.has(file)) || [];
  return {
    root,
    metadata: {
      root: ".", framework, packageManager,
      runtime: framework === "next" ? "next" : dependencies.vite ? "vite" :
        framework === "react" ? "react" : framework === "vanilla" ? "static" : "unknown",
    },
  };
}

export async function readConfig(project) {
  const defaults = {
    schemaVersion: 1, framework: project.metadata.framework, designMode: "preserve-brand",
    preset: "ios-neutral-light", renderer: "auto", fallback: "frosted-css",
    scope: ["."], exclude: ["src/api", "src/data", "src/generated"],
  };
  try {
    const content = await readProjectFile(project.root, ".liquidglass.json", 64_000);
    if (!content) throw new Error("Cannot read .liquidglass.json as a regular configuration file.");
    return validate("config", JSON.parse(content));
  } catch (error) {
    if (error.code === "ENOENT") return validate("config", defaults);
    throw error;
  }
}

export function walkAst(node, callback) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const item of node) walkAst(item, callback);
    return;
  }
  if (typeof node.type !== "string") return;
  callback(node);
  for (const value of Object.values(node)) walkAst(value, callback);
}

function inspectSource(content, path, observations) {
  const extension = extname(path);
  const record = (line, column, role, evidence, confidence = "observed") => {
    observations.push({ source: { path, line, column }, role, evidence, confidence });
  };
  if (extension === ".css") {
    postcss.parse(content).walkDecls((declaration) => {
      if (!cssComposite.has(declaration.prop.toLowerCase())) return;
      const { line, column } = declaration.source.start;
      record(line, column, "compositing-risk", `CSS property ${declaration.prop}`, "inferred");
    });
    return;
  }
  if (extension === ".html") {
    function inspectHtml(node) {
      const point = node.sourceCodeLocation?.startTag;
      if (point && Object.hasOwn(roles, node.tagName)) {
        record(point.startLine, point.startCol, roles[node.tagName], `HTML <${node.tagName}>`);
      }
      for (const child of node.childNodes ?? []) inspectHtml(child);
    }
    inspectHtml(parseHtml(content, { sourceCodeLocationInfo: true }));
    return;
  }
  const plugins = extension.startsWith(".ts") ? ["typescript"] : [];
  if (extension !== ".ts") plugins.push("jsx");
  const ast = parse(content, { sourceType: "unambiguous", plugins });
  const recordNode = (node, ...rest) => record(node.loc.start.line, node.loc.start.column + 1, ...rest);
  walkAst(ast, (node) => {
    if (node.type === "ImportDeclaration" &&
        ["react-router-dom", "next/link", "next/navigation"].includes(node.source.value)) {
      recordNode(node, "routing", `Import of ${node.source.value}`);
    }
    if (node.type !== "JSXOpeningElement") return;
    const name = node.name.name;
    if (Object.hasOwn(roles, name)) recordNode(node, roles[name], `JSX <${name}>`);
    const jsxRole = node.attributes.find((attribute) => attribute.name?.name === "role")?.value?.value;
    if (jsxRole === "toolbar" || jsxRole === "tablist" || jsxRole === "navigation") {
      recordNode(node, "functional-control", `Explicit JSX role=${jsxRole}`);
    }
    if (jsxRole === "menu" || jsxRole === "dialog") recordNode(node, "transient", `Explicit JSX role=${jsxRole}`);
    const style = node.attributes.find((attribute) => attribute.name?.name === "style")?.value?.expression;
    if (style?.type === "ObjectExpression") {
      for (const attribute of style.properties) {
        const key = attribute.key?.name ?? attribute.key?.value;
        if (composite.has(key)) recordNode(attribute, "compositing-risk", `Inline style property ${key}`, "inferred");
      }
    }
  });
}

export async function scanProject(project, config) {
  const { root, metadata } = project;
  const inventory = { schemaVersion: 1, project: metadata, observations: [], routes: [], diagnostics: [] };
  const hashes = new Map();
  const exclude = config.exclude.map((path) => safeRelative(root, resolve(root, path)));
  const scopes = config.scope.map((path) => safeRelative(root, resolve(root, path)));
  const seen = new Set();
  let visited = 0;
  async function scan(path) {
    if (seen.has(path) || exclude.some((item) => item === "." || path === item || path.startsWith(item + "/"))) return;
    if (path !== "." && path.split("/").some((part) => part.startsWith(".") || ignored.has(part.toLowerCase()))) return;
    const absolute = resolve(root, path);
    const stats = await lstat(absolute);
    if (stats.isSymbolicLink() || await realpath(absolute) !== absolute) return;
    seen.add(path);
    if (stats.isDirectory()) {
      for (const name of (await readdir(absolute)).sort()) await scan(path === "." ? name : `${path}/${name}`);
      return;
    }
    if (!sourceExtensions.has(extname(path)) || /(?:secret|credential|password)/i.test(basename(path))) return;
    if (++visited > 2000) throw new Error("Audit exceeded 2000 eligible source files. Set a narrower scope in .liquidglass.json.");
    if (metadata.framework === "next" &&
        /^(?:src\/)?(?:app\/(?:.*\/)?page|pages\/(?!api\/|_)[^]+)\.[jt]sx?$/.test(path)) {
      inventory.routes.push(path);
    }
    try {
      const content = await readProjectFile(root, path, 512_000);
      if (content === null) {
        inventory.diagnostics.push(`Skipped non-regular or oversized source: ${path}`);
        return;
      }
      hashes.set(path, createHash("sha256").update(content).digest("hex"));
      inspectSource(content, path, inventory.observations);
    } catch (error) {
      if (!(error instanceof SyntaxError) && error.name !== "CssSyntaxError") throw error;
      inventory.diagnostics.push(`Could not parse ${path} at line ${error.loc?.line ?? error.line ?? "unknown"}.`);
    }
  }
  for (const path of scopes) await scan(path);
  return { inventory: validate("inventory", inventory), hashes };
}

export function makePlan(inventory, hashes, mode) {
  const rules = {
    "functional-control": ["wrap-and-restyle", "medium", ["pointer-activation", "keyboard-focus", "mobile-overflow"]],
    content: ["preserve", "low", ["readability", "scroll-and-selection"]],
    field: ["retokenize", "medium", ["focus", "validation", "submit-and-IME"]],
    transient: ["manual-review", "high", ["escape-and-focus-return", "overlay-bounds"]],
    "compositing-risk": ["manual-review", "high", ["backdrop-and-fixed-position"]],
    routing: ["manual-review", "medium", ["existing-routes"]],
  };
  return validate("plan", {
    schemaVersion: 1, designMode: mode, routes: inventory.routes,
    actions: inventory.observations.map(({ role, source }) => {
      const [action, risk, checks] = rules[role];
      return { source, sourceHash: hashes.get(source.path), role, action, risk, checks };
    }),
  });
}
