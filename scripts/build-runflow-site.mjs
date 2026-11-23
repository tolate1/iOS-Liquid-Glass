import { cp, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const destination = process.argv[2];
if (!destination) throw new Error("Pass an output directory.");
const output = resolve(destination);
const root = new URL("../", import.meta.url);
const path = (relative) => new URL(relative, root);
await mkdir(output, { recursive: true });
for (const example of ["gallery", "messenger", "runflow-pulse"]) {
  await cp(path(`examples/${example}/`), resolve(output, "examples", example), { recursive: true });
}
await mkdir(resolve(output, "dist"), { recursive: true });
for (const file of await readdir(path("dist/"))) {
  if (file.endsWith(".js") || file.endsWith(".css") || file.startsWith("OPTICS-")) {
    await cp(path(`dist/${file}`), resolve(output, "dist", file));
  }
}
const gallery = resolve(output, "examples/gallery/index.html");
await writeFile(gallery, (await readFile(gallery, "utf8")).replace(
  '<a href="/examples/messenger/index.html">',
  '<a href="/guide/index.html">Справочник интерфейса</a>\n        <a href="/examples/messenger/index.html">',
));
const home = (await readFile(path("examples/runflow-pulse/index.html"), "utf8"))
  .replace("../../dist/styles.css", "/dist/styles.css")
  .replaceAll('href="./analytics.css"', 'href="/examples/runflow-pulse/analytics.css"')
  .replaceAll('src="./dashboard.js"', 'src="/examples/runflow-pulse/dashboard.js"');
await writeFile(resolve(output, "index.html"), home);
const guide = resolve(output, "guide");
await mkdir(guide, { recursive: true });
const reference = "skills/ios-liquid-glass/";
const files = ["SKILL.md", ...(await readdir(path(reference + "references/"))).sort().map((file) => "references/" + file)];
const escape = (value) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const entries = await Promise.all(files.map(async (file) => {
  const markdown = await readFile(path(reference + file), "utf8");
  const title = markdown.match(/^# (.+)$/m)?.[1] ?? file;
  return `<details><summary>${escape(title)}</summary><pre>${escape(markdown)}</pre></details>`;
}));
await writeFile(resolve(guide, "index.html"), `<!doctype html><html lang="ru" data-lg-theme="runflow-dark"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Справочник интерфейса · Runflow</title>
<link rel="stylesheet" href="/examples/runflow-pulse/analytics.css">
<style>
body{max-width:920px;padding:28px;margin:auto}nav{display:flex;flex-wrap:wrap;gap:18px;margin-bottom:32px}
h1{margin-bottom:24px}details{background:var(--panel);border:1px solid var(--edge);border-radius:12px;margin:8px 0;padding:14px 16px}
summary{cursor:pointer;font-weight:620}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:inherit;color:var(--muted)}
</style><nav><a href="/">Runflow</a><a href="/examples/gallery/index.html">Компоненты</a></nav>
<h1>Справочник интерфейса</h1>${entries.join("\n")}</html>`);
