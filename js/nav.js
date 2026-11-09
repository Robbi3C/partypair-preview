/* Mobile / tablet menu: the toggle in the header opens a panel under
   the pill. Open, it behaves like a pop-up: the page behind is dimmed,
   stops scrolling and is inert (out of reach of keyboard and screen
   readers), and the sticky CTA steps aside so the panel's CTA is the
   only one (html.nav-open, css/nav.css). Closes on Escape, a tap on the
   dimmed page, a link, or when the viewport grows into the full nav.
   The button keeps one name ("Menu"); aria-expanded says open/closed. */

export function initNav() {
  const header = document.querySelector('.site-header');
  const toggle = header?.querySelector('.menu-toggle');
  const menu = document.getElementById('site-menu');
  if (!toggle || !menu) return;

  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';
  // the rest of the page goes inert while the menu is open (dialogs are
  // left alone: the panel's CTA opens the inquiry dialog as it closes)
  const outside = () => [...document.body.children].filter((el) => el !== header && el.tagName !== 'DIALOG');
  let madeInert = [];
  const setOpen = (open) => {
    if (open === isOpen()) return;
    toggle.setAttribute('aria-expanded', String(open));
    menu.inert = !open;
    header.classList.toggle('menu-open', open);
    document.documentElement.classList.toggle('nav-open', open);
    if (open) {
      madeInert = outside().filter((el) => !el.inert);
      madeInert.forEach((el) => { el.inert = true; });
    } else {
      madeInert.forEach((el) => { el.inert = false; });
      madeInert = [];
    }
  };

  toggle.addEventListener('click', () => setOpen(!isOpen()));
  // links and the CTA inside the panel both dismiss it
  menu.addEventListener('click', (e) => { if (e.target.closest('a, button')) setOpen(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) { setOpen(false); toggle.focus(); }
  });
  // a tap on the dimmed page (the header's own backdrop) closes it
  document.addEventListener('click', (e) => {
    if (isOpen() && (e.target === header || !header.contains(e.target))) setOpen(false);
  });
  fitHeader(header, () => setOpen(false));
}

/* Show as much of the header as fits (css/nav.css): try the full pill,
   then without its CTA, then logo + burger only. Measured, not guessed,
   so it follows the number of links, the fonts and the look. The result
   is html[data-nav="no-cta|collapsed"]; the menu closes whenever the
   links are back in the bar. */
function fitHeader(header, closeMenu) {
  const root = document.documentElement;
  const inner = header.querySelector('.site-header__inner');
  const nav = header.querySelector('.site-nav');
  // too wide, or the last link squeezed into the pill's right padding
  // (scroll sizes miss that: the links shrink the gap before they overflow)
  const intoPadding = () => {
    const last = nav.lastElementChild;
    if (!last || !last.offsetParent) return false;
    const edge = inner.getBoundingClientRect().right - parseFloat(getComputedStyle(inner).paddingRight);
    return last.getBoundingClientRect().right > edge + 1;
  };
  const overflows = () => inner.scrollWidth > inner.clientWidth + 1 || nav.scrollWidth > nav.clientWidth + 1 || intoPadding();
  const fit = () => {
    delete root.dataset.nav;
    for (const step of ['no-cta', 'collapsed']) {
      if (!overflows()) break;
      root.dataset.nav = step;
    }
    if (root.dataset.nav !== 'collapsed') closeMenu();
  };
  fit();
  new ResizeObserver(fit).observe(header);
  new MutationObserver(fit).observe(root, { attributes: true, attributeFilter: ['data-look'] });
  document.fonts?.ready.then(fit);
}
