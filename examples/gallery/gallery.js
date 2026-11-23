import { mountGlassMenu, mountGlassSegmentedControl, mountGlassSheet, mountGlassStepper, mountGlassSurface } from "/dist/index.js";

const candidate = mountGlassSurface(document.querySelector("#candidate"));
const baseline = mountGlassSurface(document.querySelector("#baseline"), { renderer: "frosted-css" });
mountGlassSurface(document.querySelector("#reading"), { role: "content" });
mountGlassSurface(document.querySelector("#control-sample"), { role: "content" });
const sheet = mountGlassSheet(document.querySelector("#sheet-trigger"), document.querySelector("#settings-sheet"));

const toolbar = mountGlassSurface(document.querySelector("#toolbar"));
const picker = document.querySelector("#material-picker");
const popover = mountGlassMenu(document.querySelector("#popover-trigger"), picker);
const group = document.querySelector("#segments");
let commits = 0;
const segments = mountGlassSegmentedControl(group, {
  onValueChange(value) {
    document.querySelector("#tab-diagnostic").textContent = value;
    document.querySelector("#commit-diagnostic").textContent = ++commits;
  },
  panels: Object.fromEntries(["chat", "files", "project"].map((key) => [key, document.querySelector(`#panel-${key}`)])),
});
picker.addEventListener("click", (event) => {
  const material = event.target.closest("[data-material]")?.dataset.material;
  if (!material) return;
  [toolbar, candidate, baseline].forEach((surface) => surface.update({ material }));
  for (const label of document.querySelectorAll(".lens > :last-child")) {
    label.textContent = `${material[0].toUpperCase()}${material.slice(1)} glass`;
  }
});

const renderer = document.querySelector("#renderer");
const theme = document.querySelector("#theme");
const status = document.querySelector("#status");
const renderStatus = () => {
  const { selected, syntax, svgEligible } = candidate.diagnostics;
  status.textContent = selected;
  document.querySelector("#optics-diagnostic").textContent = `${syntax.svg ? "yes" : "no"} / ${svgEligible ? "yes" : "no"}`;
};

renderer.addEventListener("change", () => {
  candidate.update({ renderer: renderer.value });
  toolbar.update({ renderer: renderer.value });
  popover.update({ renderer: renderer.value });
  sheet.update({ renderer: renderer.value });
  renderStatus();
});
const scene = document.querySelector("#scene");
const backdrops = [...document.querySelectorAll(".spectrum")];

function drawChart(canvas) {
  const context = canvas.getContext("2d");
  const { width, height } = canvas;
  const muted = getComputedStyle(document.documentElement).getPropertyValue("--lg-muted").trim();
  context.lineWidth = 2;
  context.strokeStyle = muted;
  context.globalAlpha = .3;
  context.beginPath();
  for (let y = 40; y < height; y += 35) {
    context.moveTo(0, y);
    context.lineTo(width, y);
  }
  context.stroke();
  context.globalAlpha = 1;
  context.lineWidth = 4;
  context.beginPath();
  const series = [8, 4, 13, 9, 16, 14, 22, 11, 19, 17, 28, 23, 31];
  series.forEach((value, index) => {
    context.lineTo(20 + index * (width - 40) / (series.length - 1), height - 30 - value * 7);
  });
  context.stroke();
}

function updateScene() {
  const template = document.getElementById(`scene-${scene.value}`);
  for (const backdrop of backdrops) {
    backdrop.dataset.scene = scene.value;
    backdrop.replaceChildren(...(template ? [template.content.cloneNode(true)] : []));
    const canvas = backdrop.querySelector("canvas");
    if (canvas) drawChart(canvas);
  }
}
theme.addEventListener("change", () => {
  document.documentElement.dataset.lgTheme = theme.value;
  updateScene();
});
scene.addEventListener("change", updateScene);
document.querySelector("#tab-diagnostic").textContent = segments.value;
const renderPointer = () => {
  document.querySelector("#pointer-diagnostic").textContent = group.hasAttribute("data-lg-dragging") ? "dragging" : "idle";
};
new MutationObserver(renderPointer).observe(group, { attributeFilter: ["data-lg-dragging"] });
renderPointer();
const statusObserver = new MutationObserver(renderStatus);
statusObserver.observe(document.querySelector("#candidate"), { attributeFilter: ["data-lg-renderer"] });
renderStatus();


const snap = document.querySelector("#grid-snap");
const brightness = document.querySelector("#brightness");
const previewScenes = document.querySelector(".scenes");
const divisions = mountGlassStepper(document.querySelector("#grid-stepper"), {
  min: 4, max: 24, value: 12, onValueChange: renderGrid,
});

function renderGrid() {
  const interval = snap.checked ? Math.round(132 / divisions.value) : 132 / divisions.value;
  previewScenes.style.setProperty("--grid-size", `${interval}px`);
  previewScenes.style.setProperty("--grid-opacity", brightness.value / 100);
  document.querySelector("#snap-value").value = snap.checked ? "On" : "Off";
  document.querySelector("#brightness-value").value = `${brightness.value}%`;
}

snap.addEventListener("change", renderGrid);
brightness.addEventListener("input", renderGrid);
document.querySelector("#compact-layout").addEventListener("change", (event) => {
  document.querySelector("main").classList.toggle("compact", event.target.checked);
});
renderGrid();
