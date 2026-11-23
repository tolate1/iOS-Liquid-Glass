import { mountGlassDock, mountGlassSegmentedControl, mountGlassSurface } from "../../dist/index.js";

const byId = (id) => document.getElementById(id);
const dayMs = 86_400_000;
const referenceDay = Date.UTC(2026, 10, 22);
const dateAt = (offset) => new Date(referenceDay - offset * dayMs);
const dateFormat = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short", timeZone: "UTC" });
const compactDate = new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "2-digit", timeZone: "UTC" });
const axisDecimal = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 });
const decimal = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 });
const pace = (seconds) => {
  const value = Math.round(seconds);
  return Math.floor(value / 60) + ":" + String(value % 60).padStart(2, "0");
};

function duration(run) {
  const totalSeconds = Math.round(run.seconds * run.km);
  const hours = Math.floor(totalSeconds / 3600);
  const rest = pace(totalSeconds % 3600);
  return hours ? hours + ":" + rest.padStart(5, "0") : rest;
}

const types = [
  ["Лёгкий бег", '<path d="M2 12h4l3-6 3 10 3-4h5"/>'],
  ["Длительная", '<path d="M3 15c3-10 6-10 9-5s5 5 8-2"/>'],
  ["Темповая", '<path d="m3 15 6-6 4 4 7-8"/>'],
  ["Интервалы", '<path d="M2 15h4V6h4v9h4V6h4v9h2"/>'],
];

const recent = [
  [0, 1, 12.4, 352, 1.8],
  [2, 0, 6.8, 345, 1.4],
  [4, 2, 8.2, 309, 2.1],
  [6, 0, 5.6, 366, 1.5],
];
// Deterministic sample workouts give each range and its previous period real totals.
const history = Array.from({ length: 173 }, (_, index) => index + 7)
  .filter((day) => ![1, 3, 5].includes(day % 7) && day % 17 !== 0)
  .map((day) => {
    const type = [0, 1, 0, 2, 0, 3, 0, 0][(day * 11 + Math.floor(day / 7) * 3) % 8];
    const load = 1 + .24 * Math.sin(day * .14) + .18 * Math.cos(day * .24);
    return [day, type, Math.round(([6.2, 12.6, 7.3, 5.8][type] + day % 4 * .55) * load * 10) / 10,
      [360, 355, 315, 299][type] + (day % 9) * 3, 1.4 + (day % 11) * .19];
  });
const workouts = [...recent, ...history].map(([day, type, km, seconds, cv]) => ({ day, type, km, seconds, cv }));
const total = (items, project) => items.reduce((sum, item) => sum + project(item), 0);
const distance = (items) => total(items, ({ km }) => km);
const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const center = Math.floor(sorted.length / 2);
  return (sorted[center] + sorted[sorted.length - 1 - center]) / 2;
};

const chart = byId("chart");
let visibleWorkouts = [];
let expanded = false;

function drawMetrics(items, previous) {
  const km = distance(items);
  const change = Math.round((km / distance(previous) - 1) * 100);
  const delta = change > 0 ? "+" + change : String(change).replace("-", "−");
  const metrics = [
    ["Дистанция", decimal.format(km), "км", delta + "% к предыдущему периоду"],
    ["Средний темп", pace(total(items, (run) => run.seconds * run.km) / km), "/км", ""],
    ["Тренировки", items.length, "", ""],
    ["Медиана CV", decimal.format(median(items.map((run) => run.cv))), "%", ""],
  ];
  byId("metrics").innerHTML = metrics.map(([label, value, unit, context]) =>
    '<dl class="an-panel metric"><dt>' + label + '</dt><dd class="metric-value">' + value +
    (unit ? ' <small>' + unit + '</small>' : '') + '</dd>' +
    (context ? '<dd class="metric-context">' + context + '</dd>' : '') + '</dl>').join("");
}

function drawChart(items, days) {
  const step = { 7: 1, 30: 5, 90: 15 }[days];
  const bins = Array.from({ length: days / step }, (_, index) => {
    const from = days - 1 - index * step;
    const to = from - step + 1;
    const start = dateFormat.format(dateAt(from));
    const end = dateFormat.format(dateAt(to));
    const group = items.filter(({ day }) => day <= from && day >= to);
    return { label: start, compact: compactDate.format(dateAt(from)), range: step === 1 ? start : start + " — " + end,
      cv: group.length ? median(group.map((run) => run.cv)) : null };
  });
  byId("chart-description").textContent = step === 1 ? "CV, % · меньше — стабильнее" : "Медиана CV за " + step + " дней, %";
  const values = bins.flatMap(({ cv }) => cv === null ? [] : [cv]);
  const floor = Math.floor(Math.min(...values) * 2) / 2;
  const tick = Math.max(.25, Math.ceil((Math.max(...values) - floor) * 2) / 8);
  const base = 148;
  const points = bins.map(({ cv }, index) => cv === null ? null :
    [65 + (935 / bins.length) * (index + .5), base - ((cv - floor) / (tick * 4)) * 135]);
  const grid = Array.from({ length: 5 }, (_, index) => {
    const y = base - index * 135 / 4;
    return '<line class="chart-grid" x1="65" x2="1000" y1="' + y + '" y2="' + y + '"/>';
  }).join("");
  const plotted = points.filter(Boolean);
  const line = "M" + plotted.map((point) => point.join(",")).join(" L");
  chart.innerHTML = '<svg viewBox="0 0 1000 160" preserveAspectRatio="none" aria-hidden="true">' +
    grid + '<path class="chart-line" d="' + line + '"/>' + '</svg>' +
    '<div class="chart-axis" aria-hidden="true">' + [4, 3, 2, 1, 0].map((index) =>
      '<span style="--tick-y:' + ((base - index * 135 / 4) / 1.6) + '%">' + axisDecimal.format(floor + index * tick) + '</span>').join("") + '</div>' +
    '<div class="chart-targets" role="radiogroup" aria-label="Стабильность по отрезкам периода">' +
    bins.map(({ range, cv }, index) => '<button type="button" role="radio" class="chart-point" aria-label="' +
      range + ', ' + (cv === null ? "без тренировок" : decimal.format(cv) + "% CV") + '" style="--point-y:' + (points[index] ? points[index][1] / 1.6 + "%" : "100%") + '" data-point-state="' + (cv === null ? "empty" : "") + '"></button>').join("") +
    '</div><div class="chart-labels" aria-hidden="true">' + bins.map(({ label, compact }) =>
      '<span>' + (step === 1 ? label.split(" ")[0] : compact) + '</span>').join("") + '</div>';

  const markers = Array.from(chart.querySelectorAll(".chart-point"));
  function select(index) {
    markers.forEach((marker, i) => {
      marker.tabIndex = i === index ? 0 : -1;
      marker.setAttribute("aria-checked", String(i === index));
    });
    const { range, cv } = bins[index];
    byId("chart-readout").innerHTML = '<strong>' + (cv === null ? 'Без тренировок' : decimal.format(cv) + '% CV') + '</strong><span>' + range + '</span>';
  }
  select(markers.length - 1);
  markers.forEach((marker, index) => {
    marker.addEventListener("pointerenter", (event) => { if (event.pointerType === "mouse") select(index); });
    marker.addEventListener("click", () => select(index));
    marker.addEventListener("focus", () => select(index));
    marker.addEventListener("keydown", (event) => {
      const last = markers.length - 1;
      const next = { ArrowLeft: index - 1, ArrowDown: index - 1, ArrowRight: index + 1, ArrowUp: index + 1, Home: 0, End: last }[event.key];
      if (next === undefined) return;
      event.preventDefault();
      markers[(next + markers.length) % markers.length].focus();
    });
  });
  // Animate the newly rendered marks while keeping the panel and its headings still.
  chart.firstElementChild.dataset.animated = "";
}

function drawZones(items) {
  const km = distance(items);
  const parts = types.map((_, type) => 100 * distance(items.filter((run) => run.type === type)) / km);
  const rounding = parts.map(Math.floor);
  const remainder = 100 - total(rounding, (part) => part);
  const order = parts.map((part, index) => ({ index, fraction: part - rounding[index] })).sort((a, b) => b.fraction - a.fraction);
  order.slice(0, remainder).forEach(({ index }) => rounding[index]++);
  byId("zone-strip").innerHTML = parts.map((part, i) => part > 0
    ? '<span style="flex:' + part + ';--zone:var(--zone-' + (i + 1) + ')"></span>' : "").join("");
  byId("zones").innerHTML = types.map(([name], i) => '<li style="--zone:var(--zone-' + (i + 1) +
    ')"><i aria-hidden="true"></i><span>' + name + '</span><strong>' + rounding[i] + '%</strong></li>').join("");
}

function drawJournal() {
  const count = visibleWorkouts.length;
  const showAll = byId("show-all");
  showAll.hidden = count <= 3;
  showAll.setAttribute("aria-expanded", String(expanded));
  showAll.textContent = expanded ? "Свернуть" : "Показать все (" + count + ")";
  byId("workouts").innerHTML = visibleWorkouts.slice(0, expanded ? count : 3).map(({ day, type, km, seconds }, index) =>
    '<button class="workout-row" type="button" data-workout="' + index + '"><span class="workout-icon" aria-hidden="true">' +
    '<svg viewBox="0 0 22 22">' + types[type][1] + '</svg></span><span class="workout-name"><strong>' + types[type][0] +
    '</strong><small>' + dateFormat.format(dateAt(day)) + '</small></span><span class="workout-number">' +
    decimal.format(km) + ' км</span><span class="workout-number workout-pace">' + pace(seconds) +
    ' /км</span><span class="workout-arrow" aria-hidden="true">›</span></button>').join("");
}

function render(value) {
  const days = Number(value);
  visibleWorkouts = workouts.filter(({ day }) => day < days);
  const previous = workouts.filter(({ day }) => day >= days && day < days * 2);
  byId("period-dates").textContent = dateFormat.format(dateAt(days - 1)) + " — " + dateFormat.format(dateAt(0));
  drawMetrics(visibleWorkouts, previous);
  drawChart(visibleWorkouts, days);
  drawZones(visibleWorkouts);
  drawJournal();
}
const defaultPeriod = "30";
mountGlassSegmentedControl(byId("period"), { value: defaultPeriod, onValueChange: render });
mountGlassSurface(byId("period"), { material: "regular", role: "functional-control" });
render(defaultPeriod);

const dock = byId("progress-dock");
let dockScroll;
function scrollFromDock(value) {
  cancelAnimationFrame(dockScroll);
  dockScroll = requestAnimationFrame(() => {
    byId(value).scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  });
}
mountGlassSegmentedControl(dock, { value: "overview", onValueChange: scrollFromDock });
dock.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-lg-value]");
  if (button) scrollFromDock(button.dataset.lgValue);
});
mountGlassDock(dock, { layout: byId("main") });

byId("show-all").addEventListener("click", () => {
  expanded = !expanded;
  drawJournal();
});

const dialog = byId("workout-dialog");

function workoutStats(run, includeVariation = true) {
  const pairs = [["Время", duration(run)], ["Темп", pace(run.seconds) + " /км"]];
  if (includeVariation) pairs.push(["CV", decimal.format(run.cv) + "%"]);
  return pairs.map(([label, value]) => '<div><dt>' + label + '</dt><dd>' + value + '</dd></div>').join("");
}

function showWorkout(run) {
  byId("workout-title").textContent = types[run.type][0];
  byId("workout-date").textContent = dateFormat.format(dateAt(run.day));
  byId("workout-details").innerHTML = '<div><dt>Дистанция</dt><dd>' + decimal.format(run.km) +
    ' км</dd></div>' + workoutStats(run);
  dialog.showModal();
}

const latest = workouts[0];
const latestDate = byId("latest-date");
latestDate.dateTime = dateAt(latest.day).toISOString().slice(0, 10);
latestDate.textContent = dateFormat.format(dateAt(latest.day));
byId("latest-name").textContent = types[latest.type][0];
byId("latest-distance").innerHTML = decimal.format(latest.km) + ' <small>км</small>';
byId("latest-splits").innerHTML = workoutStats(latest, false);
mountGlassSurface(byId("latest-details"), { material: "regular", role: "functional-control" });
byId("latest-details").addEventListener("click", () => showWorkout(latest));
byId("workouts").addEventListener("click", (event) => {
  const row = event.target.closest("[data-workout]");
  if (row) showWorkout(visibleWorkouts[Number(row.dataset.workout)]);
});

byId("theme").addEventListener("click", (event) => {
  const root = document.documentElement;
  const toLight = root.dataset.lgTheme === "runflow-dark";
  root.dataset.lgTheme = toLight ? "runflow-light" : "runflow-dark";
  event.currentTarget.setAttribute("aria-label", toLight ? "Включить тёмную тему" : "Включить светлую тему");
});

function syncNavigation() {
  const hash = location.hash || "#overview";
  document.querySelectorAll(".rail-nav a").forEach((link) => {
    if (link.hash === hash) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
}
window.addEventListener("hashchange", syncNavigation);
syncNavigation();
