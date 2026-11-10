/* Entry point: wires up every interactive piece on the page. */

// Signal JS availability so reveal/stagger styles apply (see base.css).
// `?static` keeps everything visible — used for screenshots and testing.
if (!new URLSearchParams(location.search).has('static')) {
  document.documentElement.classList.add('js');
}

import { initHeroShader } from './shader.js';
import { initScrollEffects } from './scroll.js';
import { initForms } from './form.js';
import { initInstaFeed } from './instafeed.js';
import { initMenuTabs } from './menu-tabs.js';
import { burstFrom } from './confetti.js';
import { renderChrome } from './partials.js';
import { initNav } from './nav.js';
import { initFaq } from './faq.js';
import { initReviews } from './reviews.js';
import { initInstaGrid } from './insta-grid.js';
import { initChat } from './chat.js';
import { initPolaroids } from './polaroids.js';

// Width of the page scrollbar (0 on phones and overlay-scrollbar systems).
// Modals hide it while open, and CSS pads the page by this much so
// nothing behind the dim shifts sideways. Not measured while locked.
function trackScrollbarWidth() {
  const root = document.documentElement;
  const measure = () => {
    if (document.querySelector('dialog.modal[open]')) return;
    root.style.setProperty('--scrollbar-w', `${innerWidth - root.clientWidth}px`);
  };
  measure();
  addEventListener('resize', measure);
}

function initModal() {
  const modal = document.getElementById('inquiry-modal');
  if (!modal) return;

  for (const opener of document.querySelectorAll('[data-open-inquiry]')) {
    opener.addEventListener('click', (e) => {
      e.preventDefault();
      modal.showModal();
      // Mouse users start typing straight away; on touch screens the
      // keyboard would cover half the form, so let them pick a field.
      if (matchMedia('(pointer: fine)').matches) {
        modal.querySelector('input:not([type="hidden"])')?.focus();
      }
    });
  }
  modal.querySelector('.modal__close')?.addEventListener('click', () => modal.close());
  // click on the backdrop closes
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.close();
  });
}

function initMarquee() {
  // duplicate the track content once so the loop is seamless
  for (const track of document.querySelectorAll('.marquee__track')) {
    track.innerHTML += track.innerHTML;
  }
}

function initCelebrations() {
  // small pop on secondary celebratory elements
  for (const el of document.querySelectorAll('[data-confetti]')) {
    el.addEventListener('click', () => burstFrom(el, 60));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // shared chrome and data-driven content first, so the
  // listeners and reveal observers below can find them
  renderChrome();
  initReviews();
  initInstaGrid();
  initFaq();
  initNav();

  const heroCanvas = document.querySelector('.hero__canvas');
  if (heroCanvas) initHeroShader(heroCanvas);

  initScrollEffects();
  initChat();
  initPolaroids();
  initForms();
  trackScrollbarWidth();
  initModal();
  initMarquee();
  initCelebrations();

  initInstaFeed();
  initMenuTabs();
});
