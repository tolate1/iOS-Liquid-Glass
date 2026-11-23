import { mountGlassDock, mountGlassPopover, mountGlassSegmentedControl, mountGlassSurface } from "@ios-liquid-glass/web";

const get = (id) => document.getElementById(id);
const panels = Object.fromEntries(["chat", "files", "project"].map((key) => [key, get(key)]));
for (const panel of Object.values(panels)) mountGlassSurface(panel, { role: "content" });
mountGlassDock(get("views-tabs"), { content: get("views"), layout: document.querySelector("main") });
mountGlassSegmentedControl(get("views-tabs"), { panels });
const info = mountGlassPopover(get("details-trigger"), get("workspace-info"));
get("close-info").addEventListener("click", () => info.close());

const input = get("message");
input.form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!input.value.trim()) return;
  const message = document.createElement("li");
  message.textContent = input.value;
  get("messages").append(message);
  input.value = "";
  input.focus();
});

const fileItems = [...get("files-list").children];
get("file-search").addEventListener("input", (event) => {
  const query = event.currentTarget.value.trim().toLowerCase();
  for (const entry of fileItems) entry.hidden = !entry.textContent.toLowerCase().includes(query);
  get("files-empty").hidden = fileItems.some((entry) => !entry.hidden);
});
