const voidElements = [
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr'
];

document.addEventListener('keydown', event => {
  // Only trigger on ">" key
  if (event.key !== '>') return;

  const target = event.target;
  if (
    !target ||
    (!['TEXTAREA', 'INPUT'].includes(target.tagName) && !target.isContentEditable)
  ) {
    return;
  }

  // Delay execution so the ">" is already inserted.
  setTimeout(() => {
    // Case 1: For textarea / input elements.
    if (target.value !== undefined) {
      let text = target.value;
      let cursorPos = target.selectionStart;
      if (cursorPos === 0 || text[cursorPos - 1] !== '>') return;
      const lastOpen = text.lastIndexOf('<', cursorPos - 1);
      if (lastOpen === -1) return;
      const tagFragment = text.substring(lastOpen, cursorPos);
      // Ensure it's an opening tag and not self-closing or already a closing tag.
      if (tagFragment.length < 2 || tagFragment[1] === '/' || /\s*\/\s*>$/.test(tagFragment)) return;
      const match = tagFragment.match(/^<\s*([a-zA-Z][a-zA-Z0-9\.\-\:]*)/);
      if (!match) return;
      const tagName = match[1];
      if (voidElements.includes(tagName.toLowerCase())) return;
      const closingTag = `</${tagName}>`;
      // Insert the closing tag immediately after the current cursor position.
      const newText = text.slice(0, cursorPos) + closingTag + text.slice(cursorPos);
      target.value = newText;
      // Restore selection to be right after the opening tag's ">"
      target.selectionStart = target.selectionEnd = cursorPos;
      return;
    }

    // Case 2: For contenteditable elements.
    if (target.isContentEditable) {
      const sel = window.getSelection();
      if (!sel.rangeCount) return;
      let node = sel.focusNode;
      let offset = sel.focusOffset;
      // Ensure we're working with a text node.
      if (node.nodeType !== Node.TEXT_NODE) {
        // If not, try to use the first child that is a text node.
        node = node.firstChild;
        if (!node || node.nodeType !== Node.TEXT_NODE) return;
        offset = node.textContent.length;
      }
      const text = node.textContent;
      if (offset === 0 || text[offset - 1] !== '>') return;
      const lastOpen = text.lastIndexOf('<', offset - 1);
      if (lastOpen === -1) return;
      const tagFragment = text.slice(lastOpen, offset);
      // Check that the fragment is a proper opening tag.
      if (tagFragment.length < 2 || tagFragment[1] === '/' || /\s*\/\s*>$/.test(tagFragment)) return;
      const match = tagFragment.match(/^<\s*([a-zA-Z][a-zA-Z0-9\.\-\:]*)/);
      if (!match) return;
      const tagName = match[1];
      if (voidElements.includes(tagName.toLowerCase())) return;
      const closingTag = `</${tagName}>`;
      // Insert the closing tag into the current text node.
      const newText = text.slice(0, offset) + closingTag + text.slice(offset);
      node.textContent = newText;
      // Calculate the new cursor position: it should be right after the opening tag's ">".
      const newCursorPos = lastOpen + tagFragment.length;
      // Restore the selection in the same text node.
      const range = document.createRange();
      range.setStart(node, newCursorPos);
      range.setEnd(node, newCursorPos);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }, 0);
});
