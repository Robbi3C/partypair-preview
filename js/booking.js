/* How booking works (homepage band, css/booking.css).
   Renders the steps from js/content/booking.js into the plan card's
   [data-booking-steps] list (a two-digit number, a title and one line), and
   marks the band .is-in once it is a third on screen, which stamps the
   postmark down. */

import { bookingSteps } from './content/booking.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function initBooking() {
  const list = document.querySelector('[data-booking-steps]');
  if (!list) return;
  list.innerHTML = bookingSteps.map((s, i) => `
    <li class="plan__step">
      <span class="plan__num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
      <h4>${esc(s.title)}</h4>
      <p>${esc(s.line)}</p>
    </li>`).join('');

  const band = list.closest('[data-booking]');
  if (!band) return;

  // the line drawings' --icon paths, made absolute: a relative url() in a
  // custom property resolves against the stylesheet that uses it (css/)
  band.querySelectorAll('.booking__art').forEach((el) => {
    const m = el.getAttribute('style').match(/url\('([^']+)'\)/);
    if (m) el.style.setProperty('--icon', `url('${new URL(m[1], document.baseURI).href}')`);
  });

  if (!('IntersectionObserver' in window)) { band.classList.add('is-in'); return; }
  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) { band.classList.add('is-in'); io.disconnect(); }
  }, { threshold: 0.33 });
  io.observe(band);
}
