import { boundSegment, interpolateSegment, stepSpring } from "./motion.js";

const mountedGroups = new WeakSet();

export function mountGlassSegmentedControl(group, { value, onValueChange, panels } = {}) {
  const view = group.ownerDocument.defaultView;
  const buttons = Array.from(group.querySelectorAll(":scope > button[data-lg-value]"));
  const values = buttons.map((button) => button.dataset.lgValue);
  const selectedIndex = value === undefined ? 0 : values.indexOf(value);
  const role = panels ? "tab" : "radio";
  if (!group.isConnected || !view || !buttons.length || new Set(values).size !== values.length ||
      values.some((key) => !key) || selectedIndex < 0 || mountedGroups.has(group)) {
    throw new Error("Glass segments need a connected, unmounted group with unique values and a valid selection.");
  }
  if (panels && (values.some((key) => !Object.hasOwn(panels, key) || !panels[key]?.id) ||
      buttons.some((button) => !button.id))) {
    throw new Error("Glass tabs require a button ID and corresponding panel ID for each value.");
  }
  if (buttons.some((button) => button.type !== "button" || button.disabled)) {
    throw new Error("Glass segments require enabled buttons with type=button.");
  }
  mountedGroups.add(group);
  const selectionAttribute = panels ? "aria-selected" : "aria-checked";
  const ownedAttributes = [
    [group, ["role"]],
    ...buttons.map((button) => [button, ["role", "tabindex", selectionAttribute, "aria-controls"]]),
    ...(panels ? values.map((key) => [panels[key], ["role", "aria-labelledby", "hidden"]]) : []),
  ].map(([element, names]) => [element, names.map((name) => [name, element.getAttribute(name)])]);
  const indicator = group.ownerDocument.createElement("span");
  indicator.className = "lg-segment-indicator";
  indicator.setAttribute("aria-hidden", "true");
  group.prepend(indicator);
  group.classList.add("lg-segments");
  group.setAttribute("role", panels ? "tablist" : "radiogroup");

  const events = new view.AbortController();
  const listen = { signal: events.signal };
  const reduced = view.matchMedia("(prefers-reduced-motion: reduce)");
  let selected = selectedIndex;
  let measured = [];
  let presentation;
  let velocity = 0;
  let widthVelocity = 0;
  let pointer;
  let frame = null;
  let lastFrame = null;
  let groupWidth;
  let suppressClick = false;
  let destroyed = false;

  function measure() {
    groupWidth = group.clientWidth;
    measured = buttons.map((button, index) => ({
      index,
      center: button.offsetLeft + button.offsetWidth / 2,
      width: button.offsetWidth,
    })).sort((left, right) => left.center - right.center);
  }

  function target() {
    return measured.find(({ index }) => index === selected);
  }

  function paint(shape) {
    presentation = boundSegment(shape, groupWidth);
    indicator.style.width = `${presentation.width}px`;
    indicator.style.transform = `translateX(${presentation.center - presentation.width / 2}px)`;
  }

  function stop() {
    if (frame !== null) view.cancelAnimationFrame(frame);
    frame = null;
    lastFrame = null;
  }

  function animate(time) {
    frame = null;
    const seconds = lastFrame === null ? 1 / 60 : Math.min(.05, (time - lastFrame) / 1000);
    lastFrame = time;
    const goal = boundSegment(target(), groupWidth);
    const position = stepSpring(presentation.center, velocity, goal.center, seconds);
    const size = stepSpring(presentation.width, widthVelocity, goal.width, seconds);
    velocity = position.velocity;
    widthVelocity = size.velocity;
    paint({ center: position.value, width: size.value });
    if (Math.abs(goal.center - presentation.center) < .25 && Math.abs(goal.width - presentation.width) < .25 &&
        Math.abs(velocity) < 3 && Math.abs(widthVelocity) < 3) {
      settle(true);
      return;
    }
    frame = view.requestAnimationFrame(animate);
  }

  function settle(immediate = false) {
    stop();
    if (immediate || reduced.matches) {
      velocity = widthVelocity = 0;
      paint(target());
    } else {
      frame = view.requestAnimationFrame(animate);
    }
  }

  function updateSelection() {
    buttons.forEach((button, index) => {
      button.tabIndex = selected === index ? 0 : -1;
      button.setAttribute("role", role);
      button.setAttribute(selectionAttribute, String(selected === index));
      if (panels) {
        const panel = panels[values[index]];
        button.setAttribute("aria-controls", panel.id);
        panel.setAttribute("role", "tabpanel");
        panel.setAttribute("aria-labelledby", button.id);
        panel.hidden = selected !== index;
      }
    });
  }

  function select(index, notify) {
    if (selected === index) return;
    selected = index;
    updateSelection();
    settle();
    if (notify) onValueChange?.(values[index]);
  }

  function release(nextIndex, event) {
    if (!pointer) return;
    const active = pointer;
    pointer = undefined;
    delete group.dataset.lgDragging;
    if (active.button.hasPointerCapture(active.id)) active.button.releasePointerCapture(active.id);
    if (!active.dragging) return;
    suppressClick = true;
    if (nextIndex === undefined) {
      velocity = widthVelocity = 0;
      settle();
      return;
    }
    velocity = event.timeStamp - active.time > 80 ? 0 : active.velocity;
    buttons[nextIndex].focus({ preventScroll: true });
    if (nextIndex === selected) settle();
    else select(nextIndex, true);
  }

  function indexAt(element) {
    return buttons.findIndex((button) => button.contains(element));
  }

  group.addEventListener("click", (event) => {
    if (suppressClick && event.detail > 0) {
      suppressClick = false;
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    const index = indexAt(event.target);
    if (index >= 0) select(index, true);
  }, { ...listen, capture: true });

  group.addEventListener("keydown", (event) => {
    const index = indexAt(event.target);
    if (index < 0) return;
    const order = measured.map((item) => item.index);
    const at = order.indexOf(index);
    const destinations = {
      ArrowLeft: order[(at + order.length - 1) % order.length],
      ArrowRight: order[(at + 1) % order.length],
      Home: 0,
      End: buttons.length - 1,
    };
    if (!Object.hasOwn(destinations, event.key)) return;
    event.preventDefault();
    release();
    const next = destinations[event.key];
    buttons[next].focus();
    select(next, true);
  }, listen);

  group.addEventListener("pointerdown", (event) => {
    if (pointer || !event.isPrimary || event.button !== 0) return;
    suppressClick = false;
    const index = indexAt(event.target);
    if (index < 0) return;
    measure();
    const button = buttons[index];
    const start = event.clientX - group.getBoundingClientRect().left - group.clientLeft;
    const overLens = Math.abs(start - presentation.center) <= presentation.width / 2;
    pointer = {
      id: event.pointerId, button, start, startY: event.clientY, x: start,
      time: event.timeStamp, velocity: 0, dragging: false,
      offset: overLens ? start - presentation.center : start - measured.find((item) => item.index === index).center,
    };
    if (overLens) {
      stop();
      velocity = widthVelocity = 0;
    }
  }, listen);

  function dragTo(event) {
    const x = event.clientX - group.getBoundingClientRect().left - group.clientLeft;
    const seconds = (event.timeStamp - pointer.time) / 1000;
    if (seconds > 0) {
      pointer.velocity = Math.max(-1400, Math.min(1400, (x - pointer.x) / seconds));
    }
    pointer.time = event.timeStamp;
    pointer.x = x;
    paint(interpolateSegment(measured, x - pointer.offset));
  }

  view.addEventListener("pointermove", (event) => {
    if (pointer?.id !== event.pointerId) return;
    if (!pointer.dragging) {
      const x = event.clientX - group.getBoundingClientRect().left - group.clientLeft;
      const horizontal = Math.abs(x - pointer.start);
      const vertical = Math.abs(event.clientY - pointer.startY);
      if (vertical >= 4 && vertical > horizontal) {
        release();
        settle();
        return;
      }
      if (horizontal < 4) return;
      pointer.dragging = true;
      pointer.button.setPointerCapture(event.pointerId);
      group.dataset.lgDragging = "";
      stop();
      widthVelocity = 0;
    }
    dragTo(event);
  }, listen);

  view.addEventListener("pointerup", (event) => {
    if (pointer?.id !== event.pointerId) return;
    if (!pointer.dragging) {
      release();
      settle();
      return;
    }
    const center = event.clientX - group.getBoundingClientRect().left - group.clientLeft - pointer.offset;
    const nearest = measured.reduce((best, item) =>
      Math.abs(item.center - center) < Math.abs(best.center - center) ? item : best);
    release(nearest.index, event);
  }, listen);

  const cancel = (event) => {
    if (pointer?.id !== event.pointerId) return;
    release();
    settle();
  };
  view.addEventListener("pointercancel", cancel, listen);
  group.addEventListener("lostpointercapture", cancel, listen);
  view.addEventListener("blur", () => { release(); settle(); }, listen);
  reduced.addEventListener("change", () => { if (!pointer?.dragging) settle(true); }, listen);
  const observer = new view.ResizeObserver(() => {
    release();
    measure();
    settle(true);
  });
  observer.observe(group);
  buttons.forEach((button) => observer.observe(button));
  measure();
  updateSelection();
  settle(true);

  return {
    get value() { return values[selected]; },
    setValue(next) {
      if (destroyed) return;
      const index = values.indexOf(next);
      if (index < 0) throw new RangeError(`Unknown glass segment: ${next}`);
      release();
      select(index, false);
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      release();
      stop();
      events.abort();
      observer.disconnect();
      indicator.remove();
      group.classList.remove("lg-segments");
      for (const [element, attributes] of ownedAttributes) {
        for (const [name, value] of attributes) {
          if (value === null) element.removeAttribute(name);
          else element.setAttribute(name, value);
        }
      }
      mountedGroups.delete(group);
    },
  };
}
