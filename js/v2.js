/* V2 entry point: modal, forms (shared with V1), service-tile ripple,
   sticky mobile CTA. The editorial aesthetic is hover-driven — no
   scroll-reveal choreography here on purpose. */

import { initForms } from './form.js';

function initModal() {
  const modal = document.getElementById('inquiry-modal');
  if (!modal) return;
  for (const opener of document.querySelectorAll('[data-open-inquiry]')) {
    opener.addEventListener('click', (e) => {
      e.preventDefault();
      modal.showModal();
      modal.querySelector('input')?.focus();
    });
  }
  modal.querySelector('.close')?.addEventListener('click', () => modal.close());
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.close(); });
}

function initTileRipple() {
  // LBB mechanic: the flood circle grows outward from the cursor's entry point
  for (const tile of document.querySelectorAll('.svc-tile')) {
    const circle = tile.querySelector('.anime-circle');
    tile.addEventListener('mouseenter', (e) => {
      const r = tile.getBoundingClientRect();
      circle.style.left = (e.clientX - r.left) + 'px';
      circle.style.top = (e.clientY - r.top) + 'px';
    });
  }
}

function initStickyCta() {
  const sticky = document.querySelector('.v2-sticky');
  const hero = document.querySelector('.v2-hero');
  const footer = document.querySelector('.v2-footer');
  if (!sticky || !hero) return;
  let heroGone = false;
  let footerNear = false;
  const update = () => sticky.classList.toggle('is-visible', heroGone && !footerNear);
  new IntersectionObserver(([e]) => { heroGone = !e.isIntersecting; update(); }, { threshold: 0.1 })
    .observe(hero);
  if (footer) {
    new IntersectionObserver(([e]) => { footerNear = e.isIntersecting; update(); }).observe(footer);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initModal();
  initForms();
  initTileRipple();
  initStickyCta();
});
