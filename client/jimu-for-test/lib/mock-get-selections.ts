// DOM Traversal is not implemented in JSDOM
// The best we can do is shim the functions
const getSelectionShim = () => {
  return {
    getRangeAt: () => null,
    removeAllRanges: () => null,
    setStart: () => null,
    setEnd: () => null,
    addRange: () => null
  }
}

/**
 * Get [selection](https://developer.mozilla.org/en-US/docs/Web/API/Selection) of document.
 */
export const mockGetSelection = (global) => {
  global.document = global.document || {}
  global.window = global.window || {};
  (document as any).getSelection = getSelectionShim;
  (document as any).createRange = document.getSelection.bind(this)
}
