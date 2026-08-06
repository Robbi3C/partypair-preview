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
import { burstFrom } from './confetti.js';

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
  const heroCanvas = document.querySelector('.hero__canvas');
  if (heroCanvas) initHeroShader(heroCanvas);

  initScrollEffects();
  initForms();
  initModal();
  initMarquee();
  initCelebrations();

  initInstaFeed();
});
