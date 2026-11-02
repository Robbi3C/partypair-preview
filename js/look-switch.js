/* Preview switches — three independent choices, each a flag on <html>:
     look: current | new  → (shown as Original | Evelynn Choices) html[data-look="new"]  (css/look-new.css: fonts + colours)
     menu: a | b | c      → html[data-menu="b|c"]  (css/menu-b.css, css/menu-c.css)
     hero: a | a2 | b | c1 | c2 | c3 | c4 → html[data-hero="…"] (css/hero-a2.css, hero-b.css, hero-c.css)
   The first option is the default and sets no flag; any other option sets
   html[data-<key>="<value>"]. Add an option here + a matching stylesheet
   (and allow the value in the inline <head> script) to add a variant.
   Menu B and the hero variants render in whichever look is selected. Choices are remembered
   in localStorage; the inline script in <head> applies them before first
   paint. Only rendered on pages with <body data-look-switch>.

   Switches without `mount` sit in the fixed strip at the top of the page.
   A switch with `mount: '<selector>'` floats inside that element instead:
   the Hero switch is a pill inside the hero, just under the header. It
   overlays the hero (no layout space) and is always shown, even while
   the strip is hidden, so heroes can be compared at any time.

   The strip starts hidden (so the page reads as a visitor sees it).
   A pulsing dot, top-left, shows it: html[data-preview="open"]; the
   strip's Hide button puts it away. The open/closed state is
   remembered (pp-preview) and applied before paint by the <head> script. */

const SWITCHES = [
  { key: 'look', label: 'Look', storage: 'pp-look',
    options: [{ value: 'current', text: 'Original' }, { value: 'new', text: 'Evelynn Choices' }] },
  { key: 'menu', label: 'Menu', storage: 'pp-menu',
    options: [{ value: 'a', text: 'A' }, { value: 'b', text: 'B' }, { value: 'c', text: 'C' }] },
  { key: 'hero', label: 'Hero', storage: 'pp-hero', mount: '.hero',
    options: [
      { value: 'a', text: 'A1' }, { value: 'a2', text: 'A2' }, { value: 'b', text: 'B' },
      { value: 'c1', text: 'C1' }, { value: 'c2', text: 'C2' }, { value: 'c3', text: 'C3' },
      { value: 'c4', text: 'C4' },
    ] },
];

const group = ({ key, label, options }) => `
  <span class="look-switch__label" id="switch-${key}">${label}</span>
  <span class="look-switch__group" role="group" aria-labelledby="switch-${key}">
    ${options.map((o) => `<button type="button" data-switch="${key}" data-value="${o.value}">${o.text}</button>`).join('')}
  </span>`;

export function initLookSwitch() {
  if (!document.body.hasAttribute('data-look-switch')) return;
  const root = document.documentElement;

  const item = (s) => `<span class="look-switch__item">${group(s)}</span>`;
  document.body.insertAdjacentHTML('afterbegin', `
    <button type="button" class="preview-dot" aria-label="Show preview switches" aria-controls="preview-bar" aria-expanded="false"></button>
    <div class="look-switch look-switch--bar" id="preview-bar" aria-label="Preview">
      ${SWITCHES.filter((s) => !s.mount).map(item).join('')}
      <button type="button" class="look-switch__hide">Hide</button>
    </div>`);
  for (const s of SWITCHES.filter((x) => x.mount)) {
    document.querySelector(s.mount)?.insertAdjacentHTML('afterbegin', `
      <div class="look-switch look-switch--float" aria-label="Preview: ${s.label.toLowerCase()}">${item(s)}</div>`);
  }

  const buttons = document.querySelectorAll('[data-switch]');
  const sync = () => {
    for (const b of buttons) {
      const s = SWITCHES.find((x) => x.key === b.dataset.switch);
      const active = root.dataset[s.key] ?? s.options[0].value;
      b.setAttribute('aria-pressed', String(b.dataset.value === active));
    }
  };

  for (const b of buttons) {
    b.addEventListener('click', () => {
      const s = SWITCHES.find((x) => x.key === b.dataset.switch);
      if (b.dataset.value === s.options[0].value) delete root.dataset[s.key];
      else root.dataset[s.key] = b.dataset.value;
      try { localStorage.setItem(s.storage, b.dataset.value); } catch { /* private mode: switch still works */ }
      sync();
    });
  }
  sync();

  // show / hide the switches
  // the strip wraps to more rows on narrow screens: publish its real
  // height as --switch-h, which the page, header and hero offset by
  const bar = document.getElementById('preview-bar');
  const fitStrip = () => {
    if (root.dataset.preview === 'open') document.body.style.setProperty('--switch-h', `${bar.offsetHeight}px`);
    else document.body.style.removeProperty('--switch-h');
  };
  new ResizeObserver(fitStrip).observe(bar);

  const dot = document.querySelector('.preview-dot');
  const setOpen = (open) => {
    if (open) root.dataset.preview = 'open';
    else delete root.dataset.preview;
    fitStrip();
    dot.setAttribute('aria-expanded', String(open));
    try { localStorage.setItem('pp-preview', open ? 'open' : 'closed'); } catch { /* private mode */ }
  };
  dot.setAttribute('aria-expanded', String(root.dataset.preview === 'open'));
  dot.addEventListener('click', () => {
    setOpen(true);
    document.querySelector('.look-switch--bar button')?.focus();
  });
  document.querySelector('.look-switch__hide').addEventListener('click', () => {
    setOpen(false);
    dot.focus();
  });
}
