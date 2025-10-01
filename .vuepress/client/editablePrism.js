import { debounce } from "./debounce.js";
import { getCaretOffsetIn, setCaretOffsetIn } from "./selection.js";

function insertNewlineAtCaret(codeEl) {
  const sel = window.getSelection?.();
  if (!sel || sel.rangeCount === 0) return false;
  const r0 = sel.getRangeAt(0);
  if (!codeEl.contains(r0.startContainer)) return false;

  const nl = document.createTextNode("\n");
  const r = r0.cloneRange();
  r.deleteContents();
  r.insertNode(nl);

  const after = document.createRange();
  after.setStartAfter(nl);
  after.collapse(true);
  sel.removeAllRanges();
  sel.addRange(after);
  return true;
}

export function initEditablePrism({ Prism, selector, debounceMs = 250 }) {
  let composing = false;
  let enterJustHappened = false;

  function getEditableCodeFromEvent(e, selector) {
    if (typeof e.composedPath === "function") {
      for (const node of e.composedPath()) {
        if (node && node.nodeType === 1) {
          const el = /** @type {Element} */ (node);
          if (el.matches?.(selector)) return el;
          const hit = el.closest?.(selector);
          if (hit) return hit;
        }
      }
    }
    const el = e.target instanceof Element ? e.target : e.target?.parentElement;
    return el?.closest?.(selector) || null;
  }

  function lineCount(text) {
    return (text ?? "").split("\n").length;
  }

  function syncVuePressLineNumbers(preEl, codeEl) {
    const wrapper = preEl.parentElement?.querySelector(
      ":scope > .line-numbers"
    );
    if (!wrapper) return;
    wrapper.classList.add("ln-runtime");

    const need = lineCount(codeEl.textContent || "") - 1;
    if (wrapper.childElementCount === need) return;

    const frag = document.createDocumentFragment();
    for (let i = 1; i <= need; i++) {
      const div = document.createElement("div");
      div.className = "line-number";
      div.setAttribute("data-line", String(i));
      frag.appendChild(div);
    }
    wrapper.replaceChildren(frag);
  }

  function rehighlight(codeEl) {
    const activeInside =
      document.activeElement &&
      (codeEl === document.activeElement ||
        codeEl.contains(document.activeElement));
    const caret = activeInside ? getCaretOffsetIn(codeEl) : null;

    Prism.highlightElement(codeEl, false); // адресная подсветка. Док: prismjs highlightElement :contentReference[oaicite:0]{index=0}
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

  // НЕМЕДЛЕННО при фокусе — подсветка и пересчёт (без добавления/скрытия строк)
  document.addEventListener(
    "focusin",
    (e) => {
      const code = getEditableCodeFromEvent(e, selector);
      if (code) rehighlight(code);
    },
    true
  );

  // До мутаций: переносы и удаления — переносим пересвет на следующий кадр
  // beforeinput работает для contenteditable. Док: MDN beforeinput, Input Events L2 :contentReference[oaicite:1]{index=1}
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
        e.preventDefault(); // глушим нативные <div>/<br> на Enter (CE) :contentReference[oaicite:1]{index=1}
        if (insertNewlineAtCaret(code)) {
          // даём движку зафиксировать новую каретку → потом подсветка и пересчёт
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              rehighlight(code); // Prism.highlightElement + восстановление каретки
            });
          });
        }
        return;
      }

      if (it && it.startsWith("delete")) {
        requestAnimationFrame(() => rehighlight(code));
      }
    },
    true
  );

  // Обычный ввод — с дебаунсом; цель ищем через composedPath (надёжно для Safari/моб. Chrome). Док: MDN composedPath :contentReference[oaicite:2]{index=2}
  const onInput = debounce((e) => {
    if (composing || enterJustHappened) return;
    const code = getEditableCodeFromEvent(e, selector);
    if (code) rehighlight(code);
  }, debounceMs);
  document.addEventListener("input", onInput, true);

  document.addEventListener(
    "blur",
    (e) => {
      const code = getEditableCodeFromEvent(e, selector);
      if (code) rehighlight(code);
    },
    true
  );
}

export function rescanEditablePrism(Prism, selector) {
  requestAnimationFrame(() => {
    document
      .querySelectorAll('pre > code[class*="language-"]')
      .forEach((el) => {
        Prism.highlightElement(el, false);
        const pre = el.closest("pre");
        if (pre)
          requestAnimationFrame(() => {
            const wrapper = pre.parentElement?.querySelector(
              ":scope > .line-numbers"
            );
            if (!wrapper) return;
            const need = (el.textContent ?? "").split("\n").length;
            if (wrapper.childElementCount !== need) {
              const frag = document.createDocumentFragment();
              for (let i = 1; i <= need; i++) {
                const d = document.createElement("div");
                d.className = "line-number";
                d.setAttribute("data-line", String(i));
                frag.appendChild(d);
              }
              wrapper.replaceChildren(frag);
            }
          });
      });

    document.querySelectorAll(selector).forEach((el) => {
      const pre = el.closest("pre");
      if (pre)
        requestAnimationFrame(() => {
          const wrapper = pre.parentElement?.querySelector(
            ":scope > .line-numbers"
          );
          if (!wrapper) return;
          const need = (el.textContent ?? "").split("\n").length - 1;
          if (wrapper.childElementCount !== need) {
            const frag = document.createDocumentFragment();
            for (let i = 1; i <= need; i++) {
              const d = document.createElement("div");
              d.className = "line-number";
              d.setAttribute("data-line", String(i));
              frag.appendChild(d);
            }
            wrapper.replaceChildren(frag);
          }
        });
    });
  });
}
