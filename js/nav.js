/* Mobile / tablet menu: the toggle in the header opens a panel under
   the pill. Closes on Escape, outside click, link click, or when the
   viewport grows into the full inline nav. */

const WIDE = matchMedia('(min-width: 75em)');

export function initNav() {
  const header = document.querySelector('.site-header');
  const toggle = header?.querySelector('.menu-toggle');
  const menu = document.getElementById('site-menu');
  if (!toggle || !menu) return;

  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';
  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Menu');
    menu.inert = !open;
    header.classList.toggle('menu-open', open);
  };

  toggle.addEventListener('click', () => setOpen(!isOpen()));
  // links and the CTA inside the panel both dismiss it
  menu.addEventListener('click', (e) => { if (e.target.closest('a, button')) setOpen(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) { setOpen(false); toggle.focus(); }
  });
  document.addEventListener('click', (e) => {
    if (isOpen() && !header.contains(e.target)) setOpen(false);
  });
  WIDE.addEventListener('change', (e) => { if (e.matches) setOpen(false); });
}
