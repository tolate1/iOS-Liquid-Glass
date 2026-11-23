import { mountGlassSurface } from "./surface.js";

export function mountGlassPopover(trigger, panel, options = {}) {
  const view = panel.ownerDocument.defaultView;
  if (!view || !trigger.isConnected || !panel.isConnected || !panel.id ||
      trigger.ownerDocument !== panel.ownerDocument || !("popoverTargetElement" in trigger) ||
      typeof panel.showPopover !== "function") {
    throw new Error("GlassPopover requires a connected button, a panel ID and native Popover API support.");
  }
  const surface = mountGlassSurface(panel, { ...options, role: "transient" });
  const events = new view.AbortController();
  const listen = { signal: events.signal };
  const previousTarget = trigger.getAttribute("popovertarget");
  const previousExpanded = trigger.getAttribute("aria-expanded");
  const previousPopover = panel.getAttribute("popover");
  trigger.popoverTargetElement = panel;
  panel.popover = "auto";
  trigger.setAttribute("aria-expanded", "false");
  panel.classList.add("lg-popover");

  let frame;
  let layoutKey;

  function position(force = false) {
    if (!panel.matches(":popover-open")) return;
    const gap = 8;
    const anchor = trigger.getBoundingClientRect();
    const viewport = view.visualViewport;
    const left = viewport?.offsetLeft ?? 0;
    const top = viewport?.offsetTop ?? 0;
    const right = left + (viewport?.width ?? view.innerWidth);
    const bottom = top + (viewport?.height ?? view.innerHeight);
    const below = bottom - anchor.bottom - gap * 2;
    const above = anchor.top - top - gap * 2;
    const naturalHeight = panel.scrollHeight;
    const key = [anchor.left, anchor.top, anchor.bottom, left, top, right, bottom, naturalHeight].join();
    if (!force && key === layoutKey) return;
    layoutKey = key;
    const flip = below < naturalHeight && above > below;
    panel.style.setProperty("--lg-popover-max-width", `${Math.max(0, right - left - 2 * gap)}px`);
    panel.style.setProperty("--lg-popover-max-height", `${Math.max(0, flip ? above : below)}px`);
    const size = panel.getBoundingClientRect();
    panel.style.setProperty("--lg-popover-x", `${Math.max(left + gap, Math.min(anchor.left, right - size.width - gap))}px`);
    panel.style.setProperty("--lg-popover-y", `${Math.max(top + gap, flip ? anchor.top - size.height - gap : anchor.bottom + gap)}px`);
  }

  function followAnchor() {
    if (!panel.matches(":popover-open")) return;
    position();
    frame = view.requestAnimationFrame(followAnchor);
  }

  function sync() {
    view.cancelAnimationFrame(frame);
    const open = panel.matches(":popover-open");
    trigger.setAttribute("aria-expanded", String(open));
    if (open) {
      position(true);
      surface.refresh();
      frame = view.requestAnimationFrame(followAnchor);
    }
  }

  panel.addEventListener("toggle", sync, listen);
  const observer = new view.ResizeObserver(() => position(true));
  observer.observe(trigger);
  observer.observe(panel);

  function restore(element, attribute, value) {
    if (value === null) element.removeAttribute(attribute);
    else element.setAttribute(attribute, value);
  }

  return {
    get diagnostics() { return surface.diagnostics; },
    update(next) { return surface.update({ ...next, role: "transient" }); },
    close() { if (panel.matches(":popover-open")) panel.hidePopover(); },
    destroy() {
      if (panel.matches(":popover-open")) panel.hidePopover();
      events.abort();
      view.cancelAnimationFrame(frame);
      observer.disconnect();
      surface.destroy();
      restore(trigger, "popovertarget", previousTarget);
      restore(trigger, "aria-expanded", previousExpanded);
      restore(panel, "popover", previousPopover);
      panel.classList.remove("lg-popover");
      for (const property of ["x", "y", "max-width", "max-height"]) {
        panel.style.removeProperty(`--lg-popover-${property}`);
      }
    },
  };
}

export function mountGlassMenu(trigger, panel, options) {
  const items = [...panel.querySelectorAll('button[role="menuitem"]')];
  if (panel.getAttribute("role") !== "menu" || !items.some((item) => !item.disabled) ||
      items.some((item) => item.type !== "button")) {
    throw new Error("GlassMenu requires role=menu and enabled menuitem buttons with type=button.");
  }
  const popover = mountGlassPopover(trigger, panel, options);
  const events = new panel.ownerDocument.defaultView.AbortController();
  const listen = { signal: events.signal };
  const tabindex = items.map((item) => item.getAttribute("tabindex"));
  const previousPopup = trigger.getAttribute("aria-haspopup");
  trigger.setAttribute("aria-haspopup", "menu");
  items.forEach((item) => { item.tabIndex = -1; });
  const enabled = () => items.filter((item) => !item.disabled && !item.hidden);
  let openLast = false;

  trigger.addEventListener("keydown", (event) => {
    if (!["ArrowDown", "ArrowUp"].includes(event.key) || panel.matches(":popover-open")) return;
    event.preventDefault();
    openLast = event.key === "ArrowUp";
    trigger.click();
  }, listen);
  panel.addEventListener("toggle", () => {
    if (!panel.matches(":popover-open")) return;
    (openLast ? enabled().at(-1) : enabled()[0])?.focus();
    openLast = false;
  }, listen);
  panel.addEventListener("keydown", (event) => {
    const active = enabled();
    if (!active.length) return;
    const current = active.indexOf(event.target);
    const destination = {
      ArrowDown: active[(current + 1) % active.length],
      ArrowUp: active[(current <= 0 ? active.length : current) - 1],
      Home: active[0],
      End: active.at(-1),
    };
    if (Object.hasOwn(destination, event.key)) {
      event.preventDefault();
      destination[event.key].focus();
    }
    if (event.key === "Tab") popover.close();
  }, listen);
  panel.addEventListener("click", (event) => {
    if (items.includes(event.target.closest('button[role="menuitem"]')) && !event.defaultPrevented) {
      popover.close();
    }
  }, listen);

  return {
    get diagnostics() { return popover.diagnostics; },
    update: popover.update,
    close: popover.close,
    destroy() {
      events.abort();
      popover.destroy();
      if (previousPopup === null) trigger.removeAttribute("aria-haspopup");
      else trigger.setAttribute("aria-haspopup", previousPopup);
      items.forEach((item, index) => {
        if (tabindex[index] === null) item.removeAttribute("tabindex");
        else item.setAttribute("tabindex", tabindex[index]);
      });
    },
  };
}
