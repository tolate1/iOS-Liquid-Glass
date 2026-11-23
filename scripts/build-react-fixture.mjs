import { execFileSync } from "node:child_process";
import { cp, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

const outdir = "examples/react-fixture/generated";
const fixture = await mkdtemp(join(tmpdir(), "liquid-glass-fixture-"));
const npm = (args, cwd) => execFileSync(process.execPath, [process.env.npm_execpath, ...args], {
  cwd, encoding: "utf8", stdio: ["ignore", "pipe", "inherit"],
});
try {
  const [{ filename }] = JSON.parse(npm(["pack", "--ignore-scripts", "--json", "--pack-destination", fixture]));
  for (const path of ["App.jsx", "client.jsx", "server.jsx", "package.json"]) {
    await cp(`examples/react-fixture/${path}`, join(fixture, path));
  }
  npm(["install", "--ignore-scripts", "--no-audit", "--no-fund", "--prefer-offline", join(fixture, filename)], fixture);
  await mkdir(outdir, { recursive: true });
  await build({
    entryPoints: [join(fixture, "client.jsx")],
    outdir,
    bundle: true,
    format: "esm",
  });
  const server = join(fixture, "render.mjs");
  await build({
    entryPoints: [join(fixture, "server.jsx")],
    outfile: server,
    bundle: true,
    packages: "external",
    platform: "node",
    format: "esm",
  });
  const { render } = await import(pathToFileURL(server));
  await writeFile(`${outdir}/index.html`, render());
} finally {
  await rm(fixture, { recursive: true, force: true });
}
