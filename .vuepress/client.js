import { defineClientConfig } from "vuepress/client";
// https://ecosystem.vuejs.press/themes/default/extending.html#layout-slots
import Layout from "./layouts/Layout.vue";

if (typeof window !== "undefined" && import.meta.env.DEV) {
  console.log(`Версия сайта: ${__APP_VERSION__}`);
}

function initSimpleMermaid(sel = ".custom-container.mermaid-wide") {
  // мышь/трекпад? (любой «точный» указатель)
  const isFine = window.matchMedia?.("(any-pointer: fine)")?.matches ?? true;

  document.querySelectorAll(sel).forEach((root) => {
    if (root.__inited) return;
    root.__inited = true;

    const scroller = root.querySelector(".mermaid-content, .mermaid") || root;

    // Мобайл/тач — ничего не навешиваем: нативный свайп
    if (!isFine) return;

    // --- Desktop: клик = expand/collapse ---
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
      // не реагируем на клики по preview/download
      if (e.target instanceof Element && e.target.closest(".mermaid-actions")) {
        return;
      }

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

export default defineClientConfig({
  layouts: { Layout },
  setup() {
    if (typeof __VUEPRESS_SSR__ !== "undefined" && __VUEPRESS_SSR__) return;
    const raf = (fn) =>
      typeof window !== "undefined" &&
      typeof window.requestAnimationFrame === "function"
        ? window.requestAnimationFrame(fn)
        : setTimeout(fn, 0);
    raf(() => initSimpleMermaid());
  },
  enhance({ router }) {
    if (typeof __VUEPRESS_SSR__ !== "undefined" && __VUEPRESS_SSR__) return;
    const raf = (fn) =>
      typeof window !== "undefined" &&
      typeof window.requestAnimationFrame === "function"
        ? window.requestAnimationFrame(fn)
        : setTimeout(fn, 0);
    router.afterEach(() => raf(() => initSimpleMermaid()));
  },
});
