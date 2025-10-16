/**
 * Улучшает UX для больших mermaid-диаграмм:
 * кликом разворачивает контейнер, мышью позволяет скроллить.
 * @param {string} sel селектор корневых контейнеров
 */
export function initSimpleMermaid(sel = ".mermaid-wrapper") {
  const isFine = window.matchMedia?.("(any-pointer: fine)")?.matches ?? true;

  document.querySelectorAll(sel).forEach((root) => {
    if (root.__inited) return;
    root.__inited = true;

    const scroller = root.querySelector(".mermaid-content") || root;
    if (!isFine) return;

    let downX = 0,
      downY = 0,
      downSL = 0,
      downST = 0;

    root.addEventListener("pointerdown", (e) => {
      downX = e.clientX;
      downY = e.clientY;
      downSL = scroller.scrollLeft;
      downST = scroller.scrollTop;
    });

    root.addEventListener("click", (e) => {
      if (e.target instanceof Element && e.target.closest(".mermaid-actions"))
        return;
      const moved = Math.hypot(e.clientX - downX, e.clientY - downY) > 3;
      const scrolled =
        Math.abs(scroller.scrollLeft - downSL) > 3 ||
        Math.abs(scroller.scrollTop - downST) > 3;
      if (moved || scrolled) return;
      const willExpand = !root.classList.contains("expanded");
      root.classList.toggle("expanded", willExpand);
      if (willExpand) scroller.focus?.();
    });
  });
}
