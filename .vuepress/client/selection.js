/**
 * Возвращает позицию каретки в contenteditable-узле в виде «текстового смещения».
 * Работает по всем текстовым узлам внутри root.
 * @param {HTMLElement} root
 * @returns {number|null}
 */
export function getCaretOffsetIn(root) {
  const sel = window.getSelection?.();
  if (!sel || sel.rangeCount === 0) return null;
  const r = sel.getRangeAt(0);
  if (!root.contains(r.startContainer)) return null;

  const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node,
    pos = 0;
  while ((node = tw.nextNode())) {
    if (node === r.startContainer) return pos + r.startOffset;
    pos += node.nodeValue.length;
  }
  return pos;
}

/**
 * Ставит каретку по «текстовому смещению» внутри root.
 * @param {HTMLElement} root
 * @param {number} offset
 */
export function setCaretOffsetIn(root, offset) {
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
  // За пределами — ставим в конец
  const r = document.createRange();
  r.selectNodeContents(root);
  r.collapse(false);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(r);
}
