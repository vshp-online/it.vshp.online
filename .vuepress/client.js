import { defineClientConfig } from "vuepress/client";

// https://ecosystem.vuejs.press/themes/default/extending.html#layout-slots
import Layout from "./layouts/Layout.vue";

// Кастомный компонент рендера Railroad-диаграмм
import RailroadDiagram from "./components/RailroadDiagram.vue";

// Кастомный компонент для markdown-ext
import Pill from "./components/Pill.vue";

// Сниппет Codapi
import "@antonz/codapi/dist/snippet.js";

// Для повторной подсветки Prism
import Prism from "prismjs";
import "prismjs/components/prism-python";
import "prismjs/components/prism-sql";
import "prismjs/plugins/line-numbers/prism-line-numbers";
import "prismjs/plugins/line-numbers/prism-line-numbers.css";

const LIVE_SELECTOR = 'pre > code[contenteditable="true"][class*="language-"]';
const DEBOUNCE_MS = 250;

// --- утилиты для каретки (offset по текстовым узлам) ---
function getCaretOffsetIn(root) {
  const sel = window.getSelection?.();
  if (!sel || sel.rangeCount === 0) return null;
  const r = sel.getRangeAt(0);
  if (!root.contains(r.startContainer)) return null;
  // считаем суммарную длину текстовых узлов до каретки
  const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node,
    pos = 0;
  while ((node = tw.nextNode())) {
    if (node === r.startContainer) return pos + r.startOffset;
    pos += node.nodeValue.length;
  }
  return pos;
}

function setCaretOffsetIn(root, offset) {
  const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node,
    pos = 0;
  while ((node = tw.nextNode())) {
    const next = pos + node.nodeValue.length;
    if (next >= offset) {
      const r = document.createRange();
      r.setStart(node, offset - pos);
      r.collapse(true);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(r);
      return;
    }
    pos = next;
  }
  // если ушли за предел — поставим в конец
  const r = document.createRange();
  r.selectNodeContents(root);
  r.collapse(false);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(r);
}

// простой дебаунсер
const debounce = (fn, ms = DEBOUNCE_MS) => {
  let t;
  return (...a) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), ms);
  };
};

let composing = false; // IME guard

function countLinesOf(codeEl) {
  const t = codeEl.textContent ?? "";
  return t.replace(/\n$/, '').split("\n").length; // хочешь игнорить финальный \n → t.replace(/\n$/, '')
}

function syncVuePressLineNumbers(preEl, codeEl) {
  const wrapper = preEl.nextElementSibling;
  if (!wrapper || !wrapper.classList.contains("line-numbers")) return;

  wrapper.classList.add("ln-runtime"); // флаг для наших стилей

  const need = countLinesOf(codeEl);
  const have = wrapper.childElementCount;
  if (have === need) return;

  // пересобираем разметку "как у темы": <span class="line"></span>...
  const frag = document.createDocumentFragment();
  for (let i = 1; i <= need; i++) {
    const s = document.createElement("div");
    s.className = "line-number";
    s.setAttribute("data-line", String(i)); // цифру берём отсюда
    frag.appendChild(s);
  }
  wrapper.replaceChildren(frag);
}

function safeRehighlight(codeEl) {
  const activeInside =
    document.activeElement &&
    (codeEl === document.activeElement ||
      codeEl.contains(document.activeElement));
  const caret = activeInside ? getCaretOffsetIn(codeEl) : null;

  Prism.highlightElement(codeEl, false);

  if (caret != null) setCaretOffsetIn(codeEl, caret);

  // внутри safeRehighlight после highlightElement(...) и восстановления каретки:
  const pre = codeEl.closest("pre");
  if (pre) requestAnimationFrame(() => syncVuePressLineNumbers(pre, codeEl));
}

if (typeof window !== "undefined" && import.meta.env.DEV) {
  console.log(`Версия сайта: ${__APP_VERSION__}`);
}

function initSimpleMermaid(sel = ".mermaid-wrapper") {
  // мышь/трекпад? (любой «точный» указатель)
  const isFine = window.matchMedia?.("(any-pointer: fine)")?.matches ?? true;

  document.querySelectorAll(sel).forEach((root) => {
    if (root.__inited) return;
    root.__inited = true;

    const scroller = root.querySelector(".mermaid-content") || root;

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
    document.addEventListener(
      "compositionstart",
      () => {
        composing = true;
      },
      true
    );
    document.addEventListener(
      "compositionend",
      () => {
        composing = false;
      },
      true
    );

    // Подсветка на паузе: сохраняем/восстанавливаем каретку → не теряем фокус
    const onInput = debounce((e) => {
      if (composing) return;
      const code = e.target?.closest?.(LIVE_SELECTOR);
      if (code) safeRehighlight(code);
    }, DEBOUNCE_MS);

    document.addEventListener("input", onInput, true);

    // Гарантированно подсветить при уходе фокуса
    document.addEventListener(
      "blur",
      (e) => {
        const code = e.target?.closest?.(LIVE_SELECTOR);
        if (code) safeRehighlight(code);
      },
      true
    );

    // Разовая подсветка при загрузке (правит стартовую разметку)
    requestAnimationFrame(() => {
      document
        .querySelectorAll(LIVE_SELECTOR)
        .forEach((el) => safeRehighlight(el));
    });

    if (typeof __VUEPRESS_SSR__ !== "undefined" && __VUEPRESS_SSR__) return;
    const raf = (fn) =>
      typeof window !== "undefined" &&
      typeof window.requestAnimationFrame === "function"
        ? window.requestAnimationFrame(fn)
        : setTimeout(fn, 0);
    raf(() => initSimpleMermaid());
  },
  enhance({ app, router }) {
    // прокидывает компонент RailroadDiagram
    app.component("RailroadDiagram", RailroadDiagram);

    // Кастомный компонент Pill
    app.component("Pill", Pill);

    if (typeof __VUEPRESS_SSR__ !== "undefined" && __VUEPRESS_SSR__) return;
    const raf = (fn) =>
      typeof window !== "undefined" &&
      typeof window.requestAnimationFrame === "function"
        ? window.requestAnimationFrame(fn)
        : setTimeout(fn, 0);
    router.afterEach(() => raf(() => initSimpleMermaid()));
  },
});
