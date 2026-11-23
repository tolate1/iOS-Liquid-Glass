import { copyFile, readFile, rm, writeFile } from "node:fs/promises";
import { build } from "esbuild";

await rm("dist", { recursive: true, force: true });
await build({
  entryPoints: { index: "src/index.js", react: "src/react.js", styles: "src/tokens.css" },
  external: ["react"],
  splitting: true,
  outdir: "dist",
  bundle: true,
  format: "esm",
  minify: true,
  target: ["chrome120", "safari17", "firefox120"],
});
await copyFile("src/index.d.ts", "dist/index.d.ts");
await copyFile("src/react.d.ts", "dist/react.d.ts");
await copyFile("skills/ios-liquid-glass/assets/core/LICENSE", "dist/OPTICS-LICENSE");
await writeFile("dist/OPTICS-NOTICE", "Inverse-lens pixel math from xinlingfeiwu/liquid-glass-design-skill (MIT). See OPTICS-LICENSE.\nhttps://github.com/xinlingfeiwu/liquid-glass-design-skill\n");
const css = await readFile("dist/styles.css", "utf8");
for (const value of ["var(--lg-svg-filter)", "blur(var(--lg-frost))"]) {
  for (const prefix of ["", "-webkit-"]) {
    if (!css.includes(`{${prefix}backdrop-filter:${value}`) && !css.includes(`;${prefix}backdrop-filter:${value}`)) {
      throw new Error(`Missing compiled ${prefix}backdrop-filter: ${value}`);
    }
  }
}

await build({
  entryPoints: ["tooling/cli.js"],
  outfile: "dist/cli.cjs",
  bundle: true,
  platform: "node",
  format: "cjs",
  target: "node22",
});
