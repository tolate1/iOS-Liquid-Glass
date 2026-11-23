import { mountGlassSurface } from "./surface.js";

export function mountGlassSheet(trigger, dialog, options = {}) {
  if (typeof dialog.showModal !== "function" || !dialog.id || trigger.ownerDocument !== dialog.ownerDocument) {
    throw new Error("GlassSheet needs a native dialog with an ID and a trigger in its document.");
  }
  const handle = dialog.querySelector("[data-lg-sheet-handle]");
  if (!handle) throw new Error("GlassSheet needs a [data-lg-sheet-handle] element.");

  const view = dialog.ownerDocument.defaultView;
  const events = new view.AbortController();
  const listen = { signal: events.signal };
  const reduced = view.matchMedia("(prefers-reduced-motion: reduce)");
  const surface = mountGlassSurface(dialog, { ...options, role: "transient" });
  const closeButtons = dialog.querySelectorAll("[data-lg-sheet-close]");
  const previousControls = trigger.getAttribute("aria-controls");
  const previousPopup = trigger.getAttribute("aria-haspopup");
  trigger.setAttribute("aria-controls", dialog.id);
  trigger.setAttribute("aria-haspopup", "dialog");
  dialog.classList.add("lg-sheet");

  let animation;
  let pointer;
  let closing = false;
  let destroyed = false;
  let returnFocus;

  function currentOffset() {
    return Number.parseFloat(view.getComputedStyle(dialog).translate.split(" ")[1]) || 0;
  }

  function animate(from, to, duration, finish) {
    animation?.cancel();
    dialog.style.removeProperty("translate");
    if (reduced.matches) {
      finish?.();
      return;
    }
    const run = dialog.animate(
      [{ translate: `0 ${from}px` }, { translate: `0 ${to}px` }],
      { duration, easing: "cubic-bezier(.2,.75,.25,1)", fill: "both" },
    );
    animation = run;
    run.onfinish = () => {
      animation = undefined;
      run.cancel();
      finish?.();
    };
  }

  function open() {
    if (destroyed || (dialog.open && !closing)) return;
    const start = dialog.open ? currentOffset() : null;
    if (!dialog.open) {
      returnFocus = dialog.ownerDocument.activeElement;
      dialog.showModal();
      surface.refresh();
    }
    closing = false;
    dialog.dataset.lgSheetState = "open";
    animate(start ?? dialog.offsetHeight, 0, 340);
  }

  function close() {
    if (!dialog.open || closing) return;
    closing = true;
    const start = currentOffset();
    const active = pointer;
    pointer = undefined;
    if (active && handle.hasPointerCapture(active.id)) handle.releasePointerCapture(active.id);
    delete dialog.dataset.lgSheetDragging;
    dialog.dataset.lgSheetState = "closing";
    animate(start, dialog.offsetHeight + 28, 240, () => {
      dialog.close();
      closing = false;
    });
  }

  function cancelDrag(event, allowDismiss = false) {
    if (event.pointerId !== pointer?.id) return;
    const active = pointer;
    pointer = undefined;
    delete dialog.dataset.lgSheetDragging;
    const offset = currentOffset();
    if (allowDismiss && (offset > Math.min(dialog.offsetHeight * .28, 118) ||
        (offset > 22 && event.timeStamp - active.time < 80 && active.velocity > .6))) {
      close();
    } else {
      animate(offset, 0, 260);
    }
  }

  handle.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary || event.button !== 0 || closing || pointer) return;
    const offset = currentOffset();
    animation?.cancel();
    dialog.style.translate = `0 ${offset}px`;
    pointer = { id: event.pointerId, y: event.clientY, start: event.clientY, offset, time: event.timeStamp, velocity: 0 };
    dialog.dataset.lgSheetDragging = "";
    handle.setPointerCapture(event.pointerId);
  }, listen);
  handle.addEventListener("pointermove", (event) => {
    if (event.pointerId !== pointer?.id) return;
    const elapsed = event.timeStamp - pointer.time;
    if (elapsed > 0) pointer.velocity = (event.clientY - pointer.y) / elapsed;
    Object.assign(pointer, { time: event.timeStamp, y: event.clientY });
    const offset = Math.max(0, Math.min(dialog.offsetHeight, pointer.offset + event.clientY - pointer.start));
    dialog.style.translate = `0 ${offset}px`;
  }, listen);
  handle.addEventListener("pointerup", (event) => cancelDrag(event, true), listen);
  handle.addEventListener("pointercancel", cancelDrag, listen);
  handle.addEventListener("lostpointercapture", cancelDrag, listen);
  trigger.addEventListener("click", open, listen);
  closeButtons.forEach((button) => button.addEventListener("click", close, listen));
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    close();
  }, listen);
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) close();
  }, listen);
  dialog.addEventListener("close", () => {
    delete dialog.dataset.lgSheetState;
    if (returnFocus?.isConnected) returnFocus.focus();
  }, listen);

  return {
    open,
    close,
    update(next) { return surface.update({ ...next, role: "transient" }); },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      animation?.cancel();
      if (dialog.open) dialog.close();
      if (returnFocus?.isConnected) returnFocus.focus();
      events.abort();
      surface.destroy();
      dialog.classList.remove("lg-sheet");
      dialog.style.removeProperty("translate");
      delete dialog.dataset.lgSheetState;
      delete dialog.dataset.lgSheetDragging;
      if (previousControls === null) trigger.removeAttribute("aria-controls");
      else trigger.setAttribute("aria-controls", previousControls);
      if (previousPopup === null) trigger.removeAttribute("aria-haspopup");
      else trigger.setAttribute("aria-haspopup", previousPopup);
    },
  };
}
