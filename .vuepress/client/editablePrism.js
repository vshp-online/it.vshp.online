import { debounce } from "./debounce.js";
import { getCaretOffsetIn, setCaretOffsetIn } from "./selection.js";

export function initEditablePrism({ Prism, selector, debounceMs = 250 }) {
  let composing = false;
  let enterGuard = false;

  function getEditableCodeFromEvent(e, sel) {
    if (typeof e.composedPath === "function") {
      for (const n of e.composedPath()) {
        if (n && n.nodeType === 1) {
          const el = /** @type {Element} */ (n);
          if (el.matches?.(sel)) return el;
          const hit = el.closest?.(sel);
          if (hit) return hit;
        }
      }
    }
    const el = e.target instanceof Element ? e.target : e.target?.parentElement;
    return el?.closest?.(sel) || null;
  }

  const visibleLineCount = (text) => {
    const parts = (text ?? "").split("\n");
    if (parts.length === 0) return 1;
    const endsEmpty = parts[parts.length - 1] === "";
    const n = endsEmpty ? parts.length - 1 : parts.length;
    return Math.max(1, n);
  };

  function findWrapperFor(preEl) {
    if (!preEl || !preEl.parentElement) return null;
    const parent = preEl.parentElement;
    for (const el of Array.from(parent.children)) {
      if (el !== preEl && el.classList?.contains("line-numbers")) return el;
    }
    return null;
  }

  function syncVuePressLineNumbers(preEl, codeEl) {
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

    Prism.highlightElement(codeEl, false);
    if (caret != null) setCaretOffsetIn(codeEl, caret);

    const pre = codeEl.closest("pre");
    if (pre) requestAnimationFrame(() => syncVuePressLineNumbers(pre, codeEl));
  }

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

  document.addEventListener(
    "pointerdown",
    (e) => {
      const code = getEditableCodeFromEvent(e, selector);
      if (!code) return;
      const pre = code.closest("pre");
      if (pre) syncVuePressLineNumbers(pre, code);
    },
    true
  );

  document.addEventListener(
    "focusin",
    (e) => {
      if (enterGuard) return;
      const code = getEditableCodeFromEvent(e, selector);
      if (!code) return;
      const pre = code.closest("pre");
      if (pre) syncVuePressLineNumbers(pre, code);
      rehighlight(code);
    },
    true
  );

  document.addEventListener(
    "beforeinput",
    (e) => {
      const code = getEditableCodeFromEvent(e, selector);
      if (!code) return;

      const it = /** @type {InputEvent} */ (e).inputType;
      const isEnter =
        it === "insertParagraph" ||
        it === "insertLineBreak" ||
        (it === "insertText" && /** @type {any} */ (e).data === "\n");

      if (isEnter && e.cancelable) {
        e.preventDefault();

        const offset = getCaretOffsetIn(code);
        const text = code.textContent ?? "";
        const newText = text.slice(0, offset) + "\n" + text.slice(offset);
        code.textContent = newText;

        enterGuard = true;
        requestAnimationFrame(() => {
          rehighlight(code, offset + 1);
          requestAnimationFrame(() => {
            enterGuard = false;
          });
        });
        return;
      }

      if (it && it.startsWith("delete")) {
        requestAnimationFrame(() => rehighlight(code));
      }
    },
    true
  );

  const onInput = debounce((e) => {
    if (composing || enterGuard) return;
    const code = getEditableCodeFromEvent(e, selector);
    if (code) rehighlight(code);
  }, debounceMs);
  document.addEventListener("input", onInput, true);

  document.addEventListener(
    "blur",
    (e) => {
      if (enterGuard) return;
      const code = getEditableCodeFromEvent(e, selector);
      if (code) rehighlight(code);
    },
    true
  );
}

export function rescanEditablePrism(Prism, selector) {
  requestAnimationFrame(() => {
    document.querySelectorAll(selector).forEach((el) => {
      Prism.highlightElement(el, false);
      const pre = el.closest("pre");
      if (!pre) return;
      requestAnimationFrame(() => {
        const wrapper =
          findWrapperFor(pre) ||
          pre.parentElement?.querySelector(":scope > .line-numbers");
        if (!wrapper) return;

        const need = (el.textContent ?? "").split("\n");
        const endsEmpty = need[need.length - 1] === "";
        const n = Math.max(1, endsEmpty ? need.length - 1 : need.length);

        const first = wrapper.firstElementChild;
        const hasOurChildren =
          !!first &&
          first.classList.contains("line-number") &&
          first.hasAttribute("data-line");

        if (!hasOurChildren || wrapper.childElementCount !== n) {
          const frag = document.createDocumentFragment();
          for (let i = 1; i <= n; i++) {
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
