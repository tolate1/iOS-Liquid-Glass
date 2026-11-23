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
  await page.emulateMedia({ contrast: "no-preference" });
  await page.locator('#candidate[data-lg-renderer="frosted-css"]').waitFor();
  const devtools = await page.context().newCDPSession(page);
  await devtools.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-transparency", value: "reduce" }],
  });
  await page.locator('#candidate[data-lg-renderer="opaque"]').waitFor();
  assert.equal(await computedFilter(page.locator("#candidate > .lg-backdrop")), "none");
});

test("SVG displacement changes backdrop pixels with the same tint, blur and foreground", async (t) => {
  const page = await visit(t, { width: 1080, height: 780 });
  const candidate = page.locator("#candidate");
  const before = PNG.sync.read(await candidate.screenshot());
  await candidate.evaluate((host) => {
    const id = host.firstElementChild.style.getPropertyValue("--lg-svg-filter").match(/#([^"]+)/)[1];
    document.getElementById(id).querySelector("feDisplacementMap").setAttribute("scale", "0");
  });
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
  assert.ok(result.initial > 0);
  assert.deepEqual(result, { unique: 1, initial: result.initial, final: result.initial, children: 0 });
});

test("tabs commit once on release after reversal and support keyboard in fallback", async (t) => {
  const page = await visit(t, { width: 520, height: 900 }, "?glass-fallback");
  const group = page.getByRole("tablist");
  const chat = page.getByRole("tab", { name: "Chat" });
  const files = page.getByRole("tab", { name: "Files" });
  const project = page.getByRole("tab", { name: "Project notes" });
  const first = await chat.boundingBox();
  const middle = await files.boundingBox();
  const last = await project.boundingBox();
  const center = (rect) => rect.x + rect.width / 2;
  const y = first.y + first.height / 2;
  await page.evaluate(() => {
    const panel = document.querySelector("#panel-files");
    window.reveals = 0;
    new MutationObserver((mutations) => {
      window.reveals += mutations.filter((record) => record.oldValue === "").length;
    }).observe(panel, { attributeFilter: ["hidden"], attributeOldValue: true });
  });
  await page.mouse.move(center(first), y);
  await page.mouse.down();
  await page.mouse.move(center(last), y, { steps: 8 });
  assert.equal(await group.getAttribute("data-lg-dragging"), "");
  assert.equal(await chat.getAttribute("aria-selected"), "true");
  await page.mouse.move(center(middle), y, { steps: 5 });
  await page.mouse.up();
  assert.equal(await files.getAttribute("aria-selected"), "true");
  assert.match(await page.getByRole("tabpanel").innerText(), /Release notes/);
  assert.equal(await page.evaluate(() => window.reveals), 1);
  await files.press("End");
  assert.equal(await project.getAttribute("aria-selected"), "true");
  assert.match(await page.getByRole("tabpanel").innerText(), /Design review/);
  await project.press("Home");
  assert.equal(await chat.getAttribute("aria-selected"), "true");
  const groupBox = await group.boundingBox();
  const indicator = await page.locator(".lg-segment-indicator").boundingBox();
  assert.ok(indicator.x >= groupBox.x - 1 && indicator.x + indicator.width <= groupBox.x + groupBox.width + 1);
});

test("popover is in the top layer, changes the toolbar and restores focus on Escape", async (t) => {
  const page = await visit(t, { width: 390, height: 900 });
  const trigger = page.getByRole("button", { name: "Material" });
  const panel = page.locator("#material-picker");
  await trigger.click();
  await panel.waitFor({ state: "visible" });
  await page.locator('#popover-trigger[aria-expanded="true"]').waitFor();
  const box = await panel.boundingBox();
  assert.ok(box.x >= 0 && box.x + box.width <= 390);
  await panel.getByRole("menuitem", { name: "Clear" }).click();
  await page.locator("#toolbar[data-lg-material=clear]").waitFor();
  assert.equal(await panel.isVisible(), false);
  await trigger.press("ArrowDown");
  await page.locator('#popover-trigger[aria-expanded="true"]').waitFor();
  await page.keyboard.press("End");
  assert.equal(await page.evaluate(() => document.activeElement.textContent), "Transient");
  await page.keyboard.press("ArrowUp");
  assert.equal(await page.evaluate(() => document.activeElement.textContent), "Regular");
  await page.keyboard.press("Escape");
  await page.locator('#popover-trigger[aria-expanded="false"]').waitFor();
  assert.equal(await trigger.evaluate((button) => button === document.activeElement), true);
});

test("independent messenger retains draft and messages and filters actual file results", async (t) => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  t.after(() => page.close());
  await page.goto(url + "examples/messenger/index.html?glass-fallback");
  const message = page.getByRole("textbox", { name: "Message" });
  await message.fill("A saved draft");
  await page.getByRole("tab", { name: "Files" }).click();
  await page.getByRole("searchbox", { name: "Search files" }).fill("layout");
  assert.equal(await page.locator("#files-list li:visible").allTextContents().then((items) => items.join()), "Layout-notes.txt");
  await page.getByRole("tab", { name: "Project" }).click();
  assert.match(await page.getByRole("tabpanel").innerText(), /Next milestone/);
  await page.getByRole("tab", { name: "Chat" }).click();
  assert.equal(await message.inputValue(), "A saved draft");
  await page.getByRole("button", { name: "Send" }).click();
  assert.equal(await page.locator("#messages li").last().textContent(), "A saved draft");
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), 390);
});

test("mobile dock retains viewport bounds while the workspace scrolls", async (t) => {
  const page = await browser.newPage({ viewport: { width: 390, height: 480 } });
  t.after(() => page.close());
  await page.goto(url + "examples/messenger/index.html");
  const dock = page.getByRole("tablist");
  await dock.waitFor();
  const initial = await dock.boundingBox();
  await page.evaluate(() => {
    const list = document.querySelector("#messages");
    for (let i = 0; i < 30; i++) list.append(list.firstElementChild.cloneNode(true));
    window.scrollTo(0, document.body.scrollHeight);
  });
  assert.equal(await dock.boundingBox().then((box) => box.y), initial.y);
  assert.ok(await page.evaluate(() => window.scrollY > 0));
  const form = await page.locator("form").boundingBox();
  assert.ok(form.y + form.height < initial.y);
});

test("React SSR markup hydrates cleanly and retains input and callbacks across theme changes", async (t) => {
  const page = await browser.newPage();
  t.after(() => page.close());
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  const response = await page.goto(url + "examples/react-fixture/generated/index.html");
  const html = await response.text();
  assert.match(html, /Handoff\.md/);
  assert.doesNotMatch(html, /lg-backdrop/);
  await page.locator(".lg-react-toolbar[data-lg-renderer]").waitFor();
  await page.getByRole("searchbox").fill("layout");
  await page.getByRole("button", { name: "Change theme" }).click();
  assert.deepEqual(await page.getByRole("listitem").allTextContents(), ["Layout-notes.txt"]);
  assert.equal(await page.getByRole("searchbox").inputValue(), "layout");
  assert.equal(await page.locator("[data-lg-theme=neutral-dark]").count(), 1);
  assert.deepEqual(errors, []);
});

test("pointer cancellation leaves the selected panel and reduced motion still permits committed drag", async (t) => {
  const page = await visit(t, { width: 520, height: 830 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const chat = page.getByRole("tab", { name: "Chat" });
  const project = page.getByRole("tab", { name: "Project notes" });
  const initial = await chat.boundingBox();
  const final = await project.boundingBox();
  const y = initial.y + initial.height / 2;
  await page.evaluate(() => {
    document.addEventListener("pointerdown", (event) => {
      window.lastPointerId = event.pointerId;
    }, { once: true });
  });
  await page.mouse.move(initial.x + initial.width / 2, y);
  await page.mouse.down();
  await page.mouse.move(final.x + final.width / 2, y, { steps: 4 });
  await page.locator("[data-lg-dragging]").waitFor();
  await chat.evaluate((node) => node.dispatchEvent(new PointerEvent("pointercancel", {
    bubbles: true, pointerId: window.lastPointerId,
  })));
  await page.mouse.up();
  assert.equal(await chat.getAttribute("aria-selected"), "true");
  assert.equal(await page.locator("[data-lg-dragging]").count(), 0);

  await page.mouse.move(initial.x + initial.width / 2, y);
  await page.mouse.down();
  await page.mouse.move(final.x + final.width / 2, y, { steps: 5 });
  await page.mouse.up();
  assert.equal(await project.getAttribute("aria-selected"), "true");
  const indicator = await page.locator(".lg-segment-indicator").boundingBox();
  assert.ok(Math.abs(indicator.x - final.x) <= 1);
});

test("Vite dashboard keeps its real control and table behavior after controlled application", async (t) => {
  for (const state of ["baseline", "migrated"]) {
    const page = await browser.newPage({ viewport: { width: 390, height: 760 } });
    t.after(() => page.close());
    await page.goto(url + `examples/vite-fixture/generated/${state}/index.html`);
    const toolbar = page.locator("[data-lg-migrate=toolbar]");
    await toolbar.waitFor();
    if (state === "migrated") {
      await page.locator("[data-lg-migrate=toolbar][data-lg-renderer=svg-backdrop]").waitFor();
      assert.match(await computedFilter(toolbar.locator(".lg-backdrop")), /url\(/);
    } else {
      assert.equal(await toolbar.locator(".lg-backdrop").count(), 0);
    }
    assert.deepEqual(await page.locator("tbody th").allTextContents(), ["Desk stand", "Field kit"]);
    await page.getByRole("button", { name: "Low stock" }).press("Enter");
    assert.deepEqual(await page.locator("tbody th").allTextContents(), ["Field kit"]);
    assert.equal(await page.locator("tbody td").textContent(), "17");
  }
});

test("lab uses matching scenes and material profiles while exposing actual renderer and committed value", async (t) => {
  const page = await visit(t, { width: 768, height: 900 });
  for (const scene of ["text", "chart", "table", "plain", "grid"]) {
    await page.selectOption("#scene", scene);
    assert.equal(await page.locator(`.spectrum[data-scene=${scene}]`).count(), 2);
  }
  await page.getByRole("button", { name: "Material" }).click();
  await page.getByRole("menuitem", { name: "Clear" }).click();
  assert.equal(await page.locator(".lens[data-lg-material=clear]").count(), 2);
  await page.getByRole("tab", { name: "Files" }).click();
  await page.getByText("Renderer and interaction details").click();
  assert.equal(await page.locator("#optics-diagnostic").textContent(), "yes / yes");
  assert.equal(await page.locator("#tab-diagnostic").textContent(), "files");
  assert.equal(await page.locator("#commit-diagnostic").textContent(), "1");
});
