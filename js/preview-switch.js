/* Preview only: switches between versions of a homepage section.
   Each choice is a flag on <html> (data-insta, data-reviews), set before
   first paint by the script in index.html and remembered in this browser.
   ?insta=v2 or ?reviews=b in the address forces one.
   Once a version is chosen, delete this file, that script, the
   .preview-switch markup and the losing layout. */

export function initPreviewSwitches() {
  const root = document.documentElement;
  const buttons = [...document.querySelectorAll('[data-preview]')];

  const paint = () => {
    for (const b of buttons) {
      b.setAttribute('aria-pressed', String(root.dataset[b.dataset.preview] === b.dataset.value));
    }
    // a hidden row measures as zero, so the rows re-check their arrows when shown
    for (const track of document.querySelectorAll('.gallery--insta, .pol-strip')) {
      track.dispatchEvent(new Event('scroll'));
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
