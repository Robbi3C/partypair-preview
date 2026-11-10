/* Preview only: switches between versions of a homepage section.
   Each choice is a flag on <html> (data-reviews), set before first paint
   by the script in index.html and remembered in this browser.
   ?reviews=b in the address forces one.
   Once a version is chosen, delete this file, that script, the
   .preview-switch markup and the losing layout. */

export function initPreviewSwitches() {
  const root = document.documentElement;
  const buttons = [...document.querySelectorAll('[data-preview]')];

  const paint = () => {
    for (const b of buttons) {
      b.setAttribute('aria-pressed', String(root.dataset[b.dataset.preview] === b.dataset.value));
    }
  };

  for (const b of buttons) {
    b.addEventListener('click', () => {
      root.dataset[b.dataset.preview] = b.dataset.value;
      try { localStorage.setItem(`pp-${b.dataset.preview}`, b.dataset.value); } catch { /* preview still works */ }
      paint();
    });
  }
  paint();
}
