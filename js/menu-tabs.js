/* Segmented control for the services menu on mobile.
   Tap, arrow keys, or swipe the panel — the pastel pill slides to the
   active tab and the panel animates in from the direction of travel. */

export function initMenuTabs() {
  const tablist = document.querySelector('.menu-tabs');
  const groups = [...document.querySelectorAll('.menu-group')];
  if (!tablist || !groups.length) return;
  const tabs = [...tablist.querySelectorAll('.menu-tabs__tab')];
  let current = 0;

  function select(next, focus = false) {
    next = (next + tabs.length) % tabs.length;
    if (next === current) return;
    const fromRight = next > current;
    current = next;
    tablist.style.setProperty('--idx', next);
    tablist.dataset.idx = next;
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === next));
      tab.tabIndex = i === next ? 0 : -1;
    });
    groups.forEach((g, i) => {
      g.classList.toggle('is-active', i === next);
      g.classList.toggle('from-right', i === next && fromRight);
    });
    if (focus) tabs[next].focus();
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(i));
    tab.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { select(current + 1, true); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { select(current - 1, true); e.preventDefault(); }
      if (e.key === 'Home') { select(0, true); e.preventDefault(); }
      if (e.key === 'End') { select(tabs.length - 1, true); e.preventDefault(); }
    });
  });

  // swipe the panel area to change tabs (mobile gesture parity)
  const panels = document.querySelector('.menu-groups');
  let startX = null;
  panels.addEventListener('pointerdown', (e) => { startX = e.clientX; }, { passive: true });
  panels.addEventListener('pointerup', (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 44) select(current + (dx < 0 ? 1 : -1));
  }, { passive: true });
}
