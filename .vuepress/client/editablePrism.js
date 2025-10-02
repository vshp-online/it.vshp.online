// .vuepress/client/editablePrism.js
import { debounce } from "./debounce.js";
import { getCaretOffsetIn, setCaretOffsetIn } from "./selection.js";

/**
 * Живая подсветка Prism + стабильные line-numbers для редактируемых <code>.
 * Поведение Enter: перехватываем beforeinput (cancelable для CE), вставляем '\n' в текстовую модель,
 * подсвечиваем адресно и восстанавливаем каретку по точному оффсету.
 *
 * Ссылки по используемым API:
 * - beforeinput (cancelable для contenteditable): MDN
 * - Selection/Range (позиционирование и вставка, но здесь работаем со строкой): MDN
 * - Prism.highlightElement: https://prismjs.com/docs/prism#.highlightElement
 */
export function initEditablePrism({ Prism, selector, debounceMs = 250 }) {
  /** IME-композиция */
  let composing = false;
  /** Короткий «гард» от конкурентных пересветов сразу после нашего Enter */
  let enterGuard = false;

  // ---------- небольшие утилиты ----------

  /** requestAnimationFrame с резервом на таймаут */
  const rAF = (fn) =>
    typeof window !== "undefined" && window.requestAnimationFrame
      ? window.requestAnimationFrame(fn)
      : setTimeout(fn, 0);

  /**
   * Надёжно достаём редактируемый <code> из события (в т.ч. когда target — текстовый узел).
   * @param {Event} e
   * @param {string} sel CSS-селектор редактируемых code-блоков
   * @returns {HTMLElement|null}
   */
  function codeFromEvent(e, sel) {
    if (typeof e.composedPath === "function") {
      for (const n of e.composedPath()) {
        if (n && n.nodeType === 1) {
          const el = /** @type {Element} */ (n);
          if (el.matches?.(sel)) return /** @type {HTMLElement} */ (el);
          const hit = el.closest?.(sel);
          if (hit) return /** @type {HTMLElement} */ (hit);
        }
      }
    }
    const el =
      e.target instanceof Element
        ? e.target
        : /** @type {any} */ (e.target)?.parentElement;
    return /** @type {HTMLElement|null} */ (el?.closest?.(sel) || null);
  }

  /**
   * Отображаемое число строк в тексте: не считаем одну хвостовую пустую.
   * Минимум 1.
   */
  function visibleLineCount(text) {
    const parts = (text ?? "").split("\n");
    if (parts.length === 0) return 1;
    const endsEmpty = parts[parts.length - 1] === "";
    const n = endsEmpty ? parts.length - 1 : parts.length;
    return Math.max(1, n);
  }

  /**
   * Находим соответствующий .line-numbers для данного <pre> (соседний узел).
   * @param {HTMLElement} preEl
   */
  function findWrapperFor(preEl) {
    if (!preEl || !preEl.parentElement) return null;
    const parent = preEl.parentElement;
    for (const el of Array.from(parent.children)) {
      if (el !== preEl && el.classList?.contains("line-numbers")) return el;
    }
    return null;
  }

  /**
   * Перестраивает .line-numbers для переданного <pre>/<code>.
   * Никогда не оставляет wrapper пустым: сначала дети, затем класс ln-runtime.
   * @param {HTMLElement} preEl
   * @param {HTMLElement} codeEl
   */
  function syncLineNumbers(preEl, codeEl) {
    const wrapper =
      findWrapperFor(preEl) ||
      preEl.parentElement?.querySelector(":scope > .line-numbers");
    if (!wrapper) return;

    const need = visibleLineCount(codeEl.textContent || "");
    const first = wrapper.firstElementChild;
    const hasOurChildren =
      !!first &&
      first.classList.contains("line-number") &&
      first.hasAttribute("data-line");

    if (!hasOurChildren || wrapper.childElementCount !== need) {
      const frag = document.createDocumentFragment();
      for (let i = 1; i <= need; i++) {
        const d = document.createElement("div");
        d.className = "line-number";
        d.setAttribute("data-line", String(i));
        frag.appendChild(d);
      }
      wrapper.replaceChildren(frag);
    }

    wrapper.classList.add("ln-runtime");
  }

  /**
   * Адресная подсветка + восстановление каретки; синхронизация номеров — в rAF.
   * @param {HTMLElement} codeEl
   * @param {number|null} forcedCaretOffset если задан — позиция каретки, которую надо восстановить
   */
  function rehighlight(codeEl, forcedCaretOffset = null) {
    const selInside =
      document.activeElement &&
      (codeEl === document.activeElement ||
        codeEl.contains(document.activeElement));

    const caret =
      forcedCaretOffset != null
        ? forcedCaretOffset
        : selInside
        ? getCaretOffsetIn(codeEl)
        : null;

    Prism.highlightElement(codeEl, false); // адресная подсветка (sync)
    if (caret != null) setCaretOffsetIn(codeEl, caret);

    const pre = codeEl.closest("pre");
    if (pre) rAF(() => syncLineNumbers(pre, codeEl));
  }

  // ---------- События ----------

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

  // Готовим wrapper заранее на первый контакт мыши/пальца
  document.addEventListener(
    "pointerdown",
    (e) => {
      const code = codeFromEvent(e, selector);
      if (!code) return;
      const pre = code.closest("pre");
      if (pre) syncLineNumbers(pre, code);
    },
    true
  );

  // При входе в редактирование: сразу номера, затем подсветка
  document.addEventListener(
    "focusin",
    (e) => {
      if (enterGuard) return;
      const code = codeFromEvent(e, selector);
      if (!code) return;
      const pre = code.closest("pre");
      if (pre) syncLineNumbers(pre, code);
      rehighlight(code);
    },
    true
  );

  // Полный контроль Enter: правим текстовую модель (cancel default), восстанавливаем каретку
  document.addEventListener(
    "beforeinput",
    (e) => {
      const code = codeFromEvent(e, selector);
      if (!code) return;

      const it = /** @type {InputEvent} */ (e).inputType;
      const isEnter =
        it === "insertParagraph" ||
        it === "insertLineBreak" ||
        (it === "insertText" && /** @type {any} */ (e).data === "\n");

      if (isEnter && e.cancelable) {
        e.preventDefault(); // CE beforeinput — отменяемо (кроме composition) :contentReference[oaicite:3]{index=3}

        const offset = getCaretOffsetIn(code);
        const text = code.textContent ?? "";
        const nextText = text.slice(0, offset) + "\n" + text.slice(offset);

        code.textContent = nextText; // чистая текстовая модель
        enterGuard = true;
        rAF(() => {
          rehighlight(code, offset + 1); // адресная подсветка + возврат каретки
          rAF(() => {
            enterGuard = false;
          }); // короткая «шторка» — гасит конкурирующие пересветы
        });
        return;
      }

      // Удаления — пересвет после фактической мутации
      if (it && it.startsWith("delete")) {
        rAF(() => rehighlight(code));
      }
    },
    true
  );

  // Обычный ввод — на паузе; каретку и числа не дёргаем во время Enter-guard/IME
  const onInput = debounce((e) => {
    if (composing || enterGuard) return;
    const code = codeFromEvent(e, selector);
    if (code) rehighlight(code);
  }, debounceMs);
  document.addEventListener("input", onInput, true);

  // Подстраховка на blur
  document.addEventListener(
    "blur",
    (e) => {
      if (enterGuard) return;
      const code = codeFromEvent(e, selector);
      if (code) rehighlight(code);
    },
    true
  );
}

/**
 * Разовый проход для всех редактируемых code-блоков:
 * подсветить и синхронизировать .line-numbers по переданному селектору.
 * @param {any} Prism
 * @param {string} selector
 */
export function rescanEditablePrism(Prism, selector) {
  const rAF = (fn) =>
    typeof window !== "undefined" && window.requestAnimationFrame
      ? window.requestAnimationFrame(fn)
      : setTimeout(fn, 0);

  rAF(() => {
    document.querySelectorAll(selector).forEach((codeEl) => {
      Prism.highlightElement(codeEl, false);
      const pre = codeEl.closest("pre");
      if (!pre) return;
      rAF(() => {
        // используем те же правила подсчёта и перестройки, что и в runtime
        const wrapper =
          (function findWrapperFor(preEl) {
            if (!preEl || !preEl.parentElement) return null;
            const parent = preEl.parentElement;
            for (const el of Array.from(parent.children)) {
              if (el !== preEl && el.classList?.contains("line-numbers"))
                return el;
            }
            return null;
          })(pre) || pre.parentElement?.querySelector(":scope > .line-numbers");
        if (!wrapper) return;

        const parts = (codeEl.textContent || "").split("\n");
        const endsEmpty = parts[parts.length - 1] === "";
        const need = Math.max(1, endsEmpty ? parts.length - 1 : parts.length);

        const first = wrapper.firstElementChild;
        const hasOurChildren =
          !!first &&
          first.classList.contains("line-number") &&
          first.hasAttribute("data-line");

        if (!hasOurChildren || wrapper.childElementCount !== need) {
          const frag = document.createDocumentFragment();
          for (let i = 1; i <= need; i++) {
            const d = document.createElement("div");
            d.className = "line-number";
            d.setAttribute("data-line", String(i));
            frag.appendChild(d);
          }
          wrapper.replaceChildren(frag);
        }

        wrapper.classList.add("ln-runtime");
      });
    });
  });
}
