import { mountGlassSurface } from "/dist/index.js";

const candidate = mountGlassSurface(document.querySelector("#candidate"));
mountGlassSurface(document.querySelector("#baseline"), { renderer: "frosted-css" });
mountGlassSurface(document.querySelector("#reading"), { role: "content" });

const renderer = document.querySelector("#renderer");
const theme = document.querySelector("#theme");
const status = document.querySelector("#status");
const renderStatus = () => {
  status.textContent = candidate.diagnostics.selected;
};

renderer.addEventListener("change", () => {
  candidate.update({ renderer: renderer.value });
  renderStatus();
});
theme.addEventListener("change", () => {
  document.documentElement.dataset.lgTheme = theme.value;
});
const statusObserver = new MutationObserver(renderStatus);
statusObserver.observe(document.querySelector("#candidate"), { attributeFilter: ["data-lg-renderer"] });
renderStatus();
