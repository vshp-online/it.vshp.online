import { defineClientConfig } from "vuepress/client";
import Layout from "./layouts/Layout.vue";
import RailroadDiagram from "./components/RailroadDiagram.vue";
import Pill from "./components/Pill.vue";
import BlogIndex from "./components/BlogIndex.vue";
import BlogPostMeta from "./components/BlogPostMeta.vue";

import { createPinia } from "pinia";

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

  enhance({ app, router }) {
    if (!isClient) return;

    app.use(createPinia());

    app.component("RailroadDiagram", RailroadDiagram);
    app.component("Pill", Pill);
    app.component("BlogIndex", BlogIndex);
    app.component("BlogPostMeta", BlogPostMeta);

    router.afterEach(() =>
      raf(() => {
        rescanEditablePrism(Prism, EDITABLE_SELECTOR);
        initSimpleMermaid();
      })
    );
  },
});
