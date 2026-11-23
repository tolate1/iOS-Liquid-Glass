export function mountGlassStepper(group, options = {}) {
  const minus = group.querySelector("button[data-lg-stepper-decrease]");
  const plus = group.querySelector("button[data-lg-stepper-increase]");
  const output = group.querySelector("output");
  const { min = 0, max = 100, step = 1, value = min, onValueChange } = options;
  if (!minus || !plus || !output || minus.type !== "button" || plus.type !== "button" ||
      ![min, max, step, value].every(Number.isSafeInteger) || max < min || step < 1) {
    throw new Error("GlassStepper needs two type=button controls, an output and safe integer bounds.");
  }
  const events = new AbortController();
  const initial = { output: output.value, minus: minus.disabled, plus: plus.disabled };
  let current = Math.max(min, Math.min(max, value));

  function render() {
    output.value = String(current);
    minus.disabled = current <= min;
    plus.disabled = current >= max;
  }

  function set(next, notify) {
    if (!Number.isSafeInteger(next)) throw new RangeError("GlassStepper expects a safe integer.");
    const bounded = Math.max(min, Math.min(max, next));
    if (bounded === current) return;
    current = bounded;
    render();
    if (notify) onValueChange?.(current);
  }

  minus.addEventListener("click", () => set(Math.max(min, current - step), true), { signal: events.signal });
  plus.addEventListener("click", () => set(Math.min(max, current + step), true), { signal: events.signal });
  render();

  return {
    get value() { return current; },
    setValue(next) { if (!events.signal.aborted) set(next, false); },
    destroy() {
      if (events.signal.aborted) return;
      events.abort();
      output.value = initial.output;
      minus.disabled = initial.minus;
      plus.disabled = initial.plus;
    },
  };
}
