import { defineClientConfig } from "vuepress/client";
import Layout from "./layouts/Layout.vue";
import RailroadDiagram from "./components/RailroadDiagram.vue";
import Pill from "./components/Pill.vue";

// Prism core + нужные языки и (если нужно) плагины
import Prism from "prismjs";
import "prismjs/components/prism-python";
import "prismjs/components/prism-sql";
import "prismjs/plugins/line-numbers/prism-line-numbers"; // тема VuePress использует свой div, но плагин не конфликтует

// Наши модули
import { initEditablePrism } from "./client/editablePrism";
import { initSimpleMermaid } from "./client/mermaidTouch";

export default defineClientConfig({
  layouts: { Layout },

  setup() {
    // Если это SSR — ничего не делаем
    if (
      typeof window === "undefined" ||
      (typeof __VUEPRESS_SSR__ !== "undefined" && __VUEPRESS_SSR__)
    ) {
      return;
    }

    // Грузим Codapi только в браузере
    import("@antonz/codapi/dist/snippet.js");

    // Инициализируем «живую» подсветку только в браузере
    // (если ты вынес в ./client/editablePrism)
    import("./client/editablePrism").then(({ initEditablePrism }) => {
      initEditablePrism({
        Prism,
        selector: 'pre > code[contenteditable="true"][class*="language-"]',
        debounceMs: 250,
      });
    });

    // Остальной чисто-клиентский код — тоже после проверки
    requestAnimationFrame(() => initSimpleMermaid());
  },

  enhance({ app, router }) {
    app.component("RailroadDiagram", RailroadDiagram);
    app.component("Pill", Pill);

    if (typeof __VUEPRESS_SSR__ !== "undefined" && __VUEPRESS_SSR__) return;
    const raf = (fn) =>
      window.requestAnimationFrame ? requestAnimationFrame(fn) : setTimeout(fn);
    router.afterEach(() => raf(() => initSimpleMermaid()));
  },
});
