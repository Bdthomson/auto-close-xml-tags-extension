const voidElements = [
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr'
  ];
  
  function insertAtCursor(element, text, cursorOffset = 0) {
    if (element.value !== undefined) {
      const start = element.selectionStart;
      element.value = element.value.slice(0, start) + text + element.value.slice(start);
      element.selectionStart = element.selectionEnd = start + cursorOffset;
    } else if (element.isContentEditable) {
      const selection = window.getSelection();
      if (!selection.rangeCount) return;
      const range = selection.getRangeAt(0);
      range.deleteContents();
      const textNode = document.createTextNode(text);
      range.insertNode(textNode);
      range.setStart(textNode, cursorOffset);
      range.setEnd(textNode, cursorOffset);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }
  
  document.addEventListener('keydown', event => {
    if (event.key !== '>') return;
  
    const target = event.target;
    if (
      !target ||
      (!['TEXTAREA', 'INPUT'].includes(target.tagName) && !target.isContentEditable)
    ) {
      return;
    }
  
    // Timeout ensures the '>' character is already inserted.
    setTimeout(() => {
      let text, cursorPos;
      if (target.value !== undefined) {
        text = target.value;
        cursorPos = target.selectionStart;
      } else if (target.isContentEditable) {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        const range = selection.getRangeAt(0);
        cursorPos = range.startOffset;
        text = target.innerText;
      } else {
        return;
      }
  
      const lastOpen = text.lastIndexOf('<', cursorPos - 1);
      if (lastOpen === -1) return;
      
      const tagFragment = text.substring(lastOpen + 1, cursorPos - 1).trim();
      const match = tagFragment.match(/^([a-zA-Z][a-zA-Z0-9\.\-]*)/);
      if (!match) return;
      
      const tagName = match[1];
      if (voidElements.includes(tagName.toLowerCase())) return;
  
      const closingTag = `</${tagName}>`;
      insertAtCursor(target, closingTag, 0);
  
      // Move the cursor back to its original position.
      if (target.value !== undefined) {
        target.selectionStart = target.selectionEnd = cursorPos;
      } else if (target.isContentEditable) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.setStart(target.childNodes[0], cursorPos);
        range.setEnd(target.childNodes[0], cursorPos);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }, 0);
  });
