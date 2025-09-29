/**
 * Простой debounce.
 * @template {(...args:any[])=>any} F
 * @param {F} fn
 * @param {number} ms
 * @returns {F}
 */
export function debounce(fn, ms = 250) {
  let t;
  return function (...a) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, a), ms);
  };
}
