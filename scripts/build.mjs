import { copyFile, readFile, writeFile } from "node:fs/promises";
import { build } from "esbuild";

await build({
  entryPoints: { index: "src/index.js", styles: "src/tokens.css" },
  outdir: "dist",
  bundle: true,
  format: "esm",
  minify: true,
  target: ["chrome120", "safari17", "firefox120"],
});
await copyFile("src/index.d.ts", "dist/index.d.ts");
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
