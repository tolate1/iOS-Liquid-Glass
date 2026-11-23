import { mountGlassMenu, mountGlassSegmentedControl, mountGlassSurface } from "/dist/index.js";

const candidate = mountGlassSurface(document.querySelector("#candidate"));
mountGlassSurface(document.querySelector("#baseline"), { renderer: "frosted-css" });
mountGlassSurface(document.querySelector("#reading"), { role: "content" });

const toolbar = mountGlassSurface(document.querySelector("#toolbar"));
const picker = document.querySelector("#material-picker");
const popover = mountGlassMenu(document.querySelector("#popover-trigger"), picker);
mountGlassSegmentedControl(document.querySelector("#segments"), {
  panels: Object.fromEntries(["chat", "files", "project"].map((key) => [key, document.querySelector(`#panel-${key}`)])),
});
picker.addEventListener("click", (event) => {
  const material = event.target.closest("[data-material]")?.dataset.material;
  if (!material) return;
  toolbar.update({ material });
});

const renderer = document.querySelector("#renderer");
const theme = document.querySelector("#theme");
const status = document.querySelector("#status");
const renderStatus = () => {
  status.textContent = candidate.diagnostics.selected;
};

renderer.addEventListener("change", () => {
  candidate.update({ renderer: renderer.value });
  toolbar.update({ renderer: renderer.value });
  popover.update({ renderer: renderer.value });
  renderStatus();
});
theme.addEventListener("change", () => {
  document.documentElement.dataset.lgTheme = theme.value;
});
const statusObserver = new MutationObserver(renderStatus);
statusObserver.observe(document.querySelector("#candidate"), { attributeFilter: ["data-lg-renderer"] });
renderStatus();
