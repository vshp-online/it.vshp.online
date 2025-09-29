import { debounce } from "./debounce.js";
import { getCaretOffsetIn, setCaretOffsetIn } from "./selection.js";

/**
 * Инициализирует «живую» подсветку Prism для редактируемых code-блоков
 * с сохранением каретки и синхронизацией vuepress line-numbers.
 *
 * Основано на официальном API Prism: Prism.highlightElement(el).
 * https://prismjs.com/#basic-usage (manual / highlightElement)
 *
 * @param {Object} opts
 * @param {typeof import('prismjs')} opts.Prism Prism инстанс
 * @param {string} opts.selector CSS-селектор редактируемых блоков (code[contenteditable])
 * @param {number} [opts.debounceMs=250] задержка перед rehighlight при вводе
 */
export function initEditablePrism({ Prism, selector, debounceMs = 250 }) {
  let composing = false;

  const safeRehighlight = (codeEl) => {
    // 1) сохранить каретку, если редактируем прямо сейчас
    const activeInside =
      document.activeElement &&
      (codeEl === document.activeElement ||
        codeEl.contains(document.activeElement));
    const caret = activeInside ? getCaretOffsetIn(codeEl) : null;

    // 2) подсветить этот конкретный узел
    Prism.highlightElement(codeEl, /* async */ false);

    // 3) вернуть каретку
    if (caret != null) setCaretOffsetIn(codeEl, caret);

    // 4) синхронизировать стандартный vuepress-обёрточный блок с номерами
    const pre = codeEl.closest("pre");
    if (pre) requestAnimationFrame(() => syncVuePressLineNumbers(pre, codeEl));
  };

  // --- события ввода/композиции ---
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

  const onInput = debounce((e) => {
    if (composing) return;
    const code = e.target?.closest?.(selector);
    if (code) safeRehighlight(code);
  }, debounceMs);

  document.addEventListener("input", onInput, true);
  document.addEventListener(
    "blur",
    (e) => {
      const code = e.target?.closest?.(selector);
      if (code) safeRehighlight(code);
    },
    true
  );

  // начальная подсветка уже имеющихся editable-блоков
  requestAnimationFrame(() => {
    document.querySelectorAll(selector).forEach((el) => safeRehighlight(el));
  });
}

/**
 * Возвращает текущее число строк в тексте кода.
 * Вариант без учёта финального пустого переноса (как у тебя сейчас).
 * @param {HTMLElement} codeEl
 * @returns {number}
 */
function countLinesOf(codeEl) {
  const t = codeEl.textContent ?? "";
  return t.replace(/\n$/, "").split("\n").length || 1;
}

/**
 * Синхронизирует соседний vuepress-обёрточный DIV с номерами строк
 * с фактическим количеством строк в редактируемом <code>.
 *
 * Структура темы: <pre>...</pre><div class="line-numbers"><span class="line"></span>...</div>
 * Числа выводим через data-line, чтобы не зависеть от CSS-счётчиков.
 *
 * @param {HTMLElement} preEl
 * @param {HTMLElement} codeEl
 */
function syncVuePressLineNumbers(preEl, codeEl) {
  const wrapper = preEl.nextElementSibling;
  if (!wrapper || !wrapper.classList.contains("line-numbers")) return;

  wrapper.classList.add("ln-runtime"); // флаг для CSS ::before { content: attr(data-line) }

  const need = countLinesOf(codeEl);
  const have = wrapper.childElementCount;
  if (have === need) return;

  const frag = document.createDocumentFragment();
  for (let i = 1; i <= need; i++) {
    const span = document.createElement("div");
    span.className = "line-number";
    span.setAttribute("data-line", String(i));
    frag.appendChild(span);
  }
  wrapper.replaceChildren(frag);
}
