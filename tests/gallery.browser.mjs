import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { once } from "node:events";
import { chromium } from "playwright";
import { PNG } from "pngjs";
import { createDemoServer } from "../scripts/serve.mjs";

let browser;
let server;
let url;
before(async () => {
  server = createDemoServer().listen(0, "127.0.0.1");
  await once(server, "listening");
  url = `http://127.0.0.1:${server.address().port}/`;
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
  console.log(`Chromium ${browser.version()}`);
});
after(async () => {
  await browser?.close();
  if (server) await new Promise((done) => server.close(done));
});

async function visit(t, viewport, query = "") {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1.25 });
  page.setDefaultTimeout(5000);
  t.after(() => page.close());
  page.on("pageerror", (error) => assert.fail(error));
  await page.goto(url + query);
  await page.locator("#candidate[data-lg-renderer]").waitFor();
  return page;
}

function computedFilter(layer) {
  return layer.evaluate((node) => getComputedStyle(node).backdropFilter);
}

test("compiled CSS selects SVG, frost and opaque across the viewport matrix", async (t) => {
  for (const width of [390, 520, 768, 1440]) {
    const page = await visit(t, { width, height: 900 });
    const layer = page.locator("#candidate > .lg-backdrop");
    assert.match(await computedFilter(layer), /url\(.*lg-filter-/);
    assert.equal(await computedFilter(page.locator("#baseline > .lg-backdrop")), "blur(8px)");
    assert.equal(await computedFilter(page.locator("#reading > .lg-backdrop")), "none");
    assert.equal(await page.locator("#candidate span:last-child").evaluate((node) => getComputedStyle(node).filter), "none");
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width);
    await page.selectOption("#theme", "neutral-dark");
    assert.equal(await page.locator("#reading > .lg-backdrop").evaluate((node) => getComputedStyle(node).backgroundColor), "rgb(29, 29, 29)");
    await page.selectOption("#renderer", "opaque");
    assert.equal(await computedFilter(layer), "none");
    await page.close();
  }
  const page = await visit(t, { width: 390, height: 900 }, "?glass-fallback");
  assert.equal(await computedFilter(page.locator("#candidate > .lg-backdrop")), "blur(8px)");
  assert.equal(await page.locator("feDisplacementMap").count(), 0);
  await page.emulateMedia({ contrast: "more" });
  await page.locator('#candidate[data-lg-renderer="opaque"]').waitFor();
  assert.equal(await computedFilter(page.locator("#candidate > .lg-backdrop")), "none");
  await page.emulateMedia({ contrast: "no-preference", reducedTransparency: "reduce" });
  assert.equal(await computedFilter(page.locator("#candidate > .lg-backdrop")), "none");
});

test("SVG displacement changes backdrop pixels with the same tint, blur and foreground", async (t) => {
  const page = await visit(t, { width: 1080, height: 780 });
  const candidate = page.locator("#candidate");
  const before = PNG.sync.read(await candidate.screenshot());
  await page.locator("feDisplacementMap").evaluate((node) => node.setAttribute("scale", "0"));
  const baseline = PNG.sync.read(await candidate.screenshot());
  let changed = 0;
  for (let y = 8; y < before.height - 8; y++) {
    for (let x = 8; x < before.width - 8; x++) {
      const offset = (y * before.width + x) * 4;
      if (Math.abs(before.data[offset] - baseline.data[offset]) > 5) changed++;
    }
  }
  assert.ok(changed > 150, `Backdrop pixel deltas: ${changed}`);
  console.log(`Backdrop pixel deltas with displacement isolated: ${changed}`);
});

test("resize updates geometry and dispose removes every owned SVG definition", async (t) => {
  const page = await visit(t, { width: 900, height: 780 });
  const result = await page.evaluate(async () => {
    const { mountGlassSurface } = await import("/dist/index.js");
    const host = document.createElement("div");
    host.style.cssText = "width:205px;height:80px";
    document.body.append(host);
    const initial = document.querySelectorAll(".lg-filter-defs").length;
    const surface = mountGlassSurface(host);
    const ownId = host.firstElementChild.style.getPropertyValue("--lg-svg-filter").match(/#([^"]+)/)[1];
    const unique = document.querySelectorAll(`#${ownId}`).length;
    host.style.width = "260px";
    await new Promise((resolve, reject) => {
      const deadline = performance.now() + 1500;
      const check = () => {
        if (performance.now() > deadline) return reject(new Error("Resize did not update the filter"));
        if (document.getElementById(ownId).querySelector("feImage").getAttribute("width") === "260") resolve();
        else requestAnimationFrame(check);
      };
      requestAnimationFrame(check);
    });
    surface.destroy();
    for (let i = 0; i < 18; i++) {
      host.style.width = `${220 + i}px`;
      mountGlassSurface(host).destroy();
    }
    const final = document.querySelectorAll(".lg-filter-defs").length;
    return { unique, initial, final, children: host.children.length };
  });
  assert.deepEqual(result, { unique: 1, initial: 1, final: 1, children: 0 });
});
