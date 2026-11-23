import { mountGlassDock, mountGlassPopover, mountGlassSegmentedControl, mountGlassSurface } from "@ios-liquid-glass/web";

const get = (id) => document.getElementById(id);
const panels = Object.fromEntries(["chat", "files", "project"].map((key) => [key, get(key)]));
mountGlassSurface(document.querySelector(".workspace-actions"));
mountGlassDock(get("views-tabs"), { layout: document.querySelector("main") });
mountGlassSegmentedControl(get("views-tabs"), { panels });
const info = mountGlassPopover(get("details-trigger"), get("workspace-info"));
get("close-info").addEventListener("click", () => info.close());

const themeToggle = get("theme-toggle");
themeToggle.addEventListener("click", () => {
  const light = document.documentElement.dataset.lgTheme === "runflow-dark";
  document.documentElement.dataset.lgTheme = light ? "runflow-light" : "runflow-dark";
  themeToggle.setAttribute("aria-pressed", String(light));
});

const list = get("messages");
const input = get("message");
input.form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!input.value.trim()) return;
  const message = document.createElement("li");
  message.textContent = input.value;
  list.append(message);
  get("message-total").textContent = list.childElementCount;
  input.value = "";
  input.focus();
});

const fileItems = [...get("files-list").children];
get("file-search").addEventListener("input", (event) => {
  const query = event.currentTarget.value.trim().toLowerCase();
  for (const entry of fileItems) entry.hidden = !entry.textContent.toLowerCase().includes(query);
  get("files-empty").hidden = fileItems.some((entry) => !entry.hidden);
});

const checklist = get("checklist");
const tasks = [...checklist.querySelectorAll('input[type="checkbox"]')];
const progress = get("review-progress");
function updateProgress() {
  const complete = tasks.filter((task) => task.checked).length;
  progress.max = tasks.length;
  progress.value = complete;
  get("checklist-caption").textContent = `${complete} of ${tasks.length}`;
}
checklist.addEventListener("change", updateProgress);
updateProgress();
get("file-total").textContent = fileItems.length;
