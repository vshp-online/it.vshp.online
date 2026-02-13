import { defineClientConfig } from "vuepress/client";
import { defineAsyncComponent } from "vue";
import { createPinia } from "pinia";
import Layout from "./layouts/Layout.vue";
import RailroadDiagram from "./components/RailroadDiagram.vue";
import Pill from "./components/Pill.vue";

import BlogPostMeta from "./components/BlogPostMeta.vue";

import BlogIndexPage from "./pages/BlogIndexPage.vue";
import AuthPage from "./pages/AuthPage.vue";
import AccountPage from "./pages/AccountPage.vue";
import HomeworkTestPage from "./components/HomeworkTestPage.vue";

import Prism from "prismjs";
import "prismjs/components/prism-python";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-http";
import "prismjs/plugins/line-numbers/prism-line-numbers";

import { initEditablePrism, rescanEditablePrism } from "./client/editablePrism";
import { initSimpleMermaid } from "./client/mermaidTouch";

const EDITABLE_SELECTOR =
  'pre > code[contenteditable="true"][class*="language-"]';
const isClient =
  typeof window !== "undefined" &&
  !(typeof __VUEPRESS_SSR__ !== "undefined" && __VUEPRESS_SSR__);
const raf = (fn) =>
  isClient && window.requestAnimationFrame
    ? window.requestAnimationFrame(fn)
    : setTimeout(fn, 0);

export default defineClientConfig({
  layouts: { Layout },

  setup() {
    if (!isClient) return;

    import("@antonz/codapi/dist/snippet.js");

    initEditablePrism({ Prism, selector: EDITABLE_SELECTOR, debounceMs: 250 });

    raf(() => {
      rescanEditablePrism(Prism, EDITABLE_SELECTOR);
      initSimpleMermaid();
    });
  },

  async enhance({ app, router }) {
    const pinia = createPinia();
    app.use(pinia);

    const Quiz = defineAsyncComponent(() => import("./components/Quiz.vue"));

    app.component("AuthPage", AuthPage);
    app.component("AccountPage", AccountPage);
    app.component("RailroadDiagram", RailroadDiagram);
    app.component("Pill", Pill);
    app.component("Quiz", Quiz);
    app.component("BlogIndexPage", BlogIndexPage);
    app.component("BlogPostMeta", BlogPostMeta);
    app.component("HomeworkTestPage", HomeworkTestPage);

    if (isClient) {
      router.afterEach(() =>
        raf(() => {
          rescanEditablePrism(Prism, EDITABLE_SELECTOR);
          initSimpleMermaid();
        })
      );
    }
  },
});
