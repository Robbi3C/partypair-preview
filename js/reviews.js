/* Google reviews section (homepage): renders js/content/reviews.js into
   [data-reviews-slot]. Preview layouts, picked with the Reviews switch on
   the section (js/look-switch.js → html[data-reviews="b|c"]; "a" is the
   default and sets no flag). css/reviews.css.

   a  One quote   a single line, set large, with a quiet "5.0 on Google"
   b  Cards A     a summary panel (score, stars, "Based on 12 Google
                  reviews ↗") beside a row of review cards; arrows under
                  the row.
   c  Cards B     "Kind words" above a full-width row of cards; under the
                  row, the summary (a smaller 5.0 with larger stars beside
                  it, "Based on 12 Google reviews ↗" below) with the
                  arrows at the right.
   In both, the count is the link to Google: a quiet text link, so the
   page's one button stays "Check your weekend".

   Cards: every review, newest first; equal heights; long reviews
   clipped, "Read more" opens the whole review in a small dialog
   (opening it in the card would make the row jump); arrows or swipe,
   never moving on its own.
   No review schema on purpose: Google shows no stars for reviews a
   business publishes about itself (LocalBusiness "self-serving" rule). */

import { reviews, google } from './content/reviews.js';

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const byName = (n) => reviews.find((r) => r.name === n);
const score = google.rating.toFixed(1);
const STARS = '★★★★★';
const starsImg = () => `<span class="rv-stars" role="img" aria-label="5 out of 5 stars">${STARS}</span>`;
const external = '<span class="visually-hidden"> (opens Google Maps)</span>';
const arrowOut = '<span aria-hidden="true"> ↗</span>';
const LONG = 170;   // characters before a card shows "Read more"

/* ---------- a. One quote ---------- */
const oneQuote = (r = byName('Keleigh B.')) => `
  <div class="container rv-one">
    <h2 class="visually-hidden">Reviews</h2>
    <figure>
      <blockquote><p>“${esc(r.pull)}”</p></blockquote>
      <figcaption class="rv-cite">${esc(r.name)} <span>· Google review</span></figcaption>
    </figure>
    <a class="rv-proof" href="${google.url}" rel="noopener" target="_blank">
      <span class="rv-proof__stars" aria-hidden="true">${STARS}</span>
      <span>${score} on Google · ${google.count} reviews</span>${external}
    </a>
  </div>`;

/* ---------- b. Cards ---------- */
const card = (r, i) => `
  <figure class="rv-card">
    ${starsImg()}
    <blockquote><p class="rv-card__text">${esc(r.text)}</p></blockquote>
    ${r.text.length > LONG
      ? `<button type="button" class="rv-more" data-review="${i}">Read more<span class="visually-hidden"> of ${esc(r.name)}’s review</span></button>`
      : ''}
    <figcaption class="rv-card__by">${esc(r.name)} <span>· ${r.when}</span></figcaption>
  </figure>`;

const countLink = () =>
  `Based on <a class="rv-panel__link" href="${google.url}" rel="noopener" target="_blank">${google.count} Google reviews${arrowOut}${external}</a>`;
const track = (id) => `
      <ul class="rv-track" id="${id}" tabindex="0" aria-label="Google reviews: scroll sideways for more">
        ${reviews.map((r, i) => `<li>${card(r, i)}</li>`).join('')}
      </ul>`;
const arrows = (id) => `
      <div class="rv-arrows">
        <button type="button" class="rv-arrow" data-dir="-1" aria-label="Previous reviews" aria-controls="${id}" disabled>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>
        </button>
        <button type="button" class="rv-arrow" data-dir="1" aria-label="Next reviews" aria-controls="${id}">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>
        </button>
      </div>`;

/* Cards A: panel beside the row */
const cards = () => `
  <div class="container rv-cards">
    <div class="rv-panel">
      <h2>Kind words</h2>
      <p class="rv-panel__score">${score}</p>
      ${starsImg()}
      <p class="rv-panel__count">${countLink()}</p>
    </div>
    <div class="rv-row">
      ${track('rv-track-a')}
      ${arrows('rv-track-a')}
    </div>
  </div>`;

/* Cards B: heading, full-width row, summary + arrows under it */
const cardsB = () => `
  <div class="container rv-cards-b">
    <h2>Kind words</h2>
    ${track('rv-track-b')}
    <div class="rv-under">
      <div class="rv-sum">
        <p class="rv-sum__line"><span class="rv-sum__score">${score}</span>${starsImg()}</p>
        <p class="rv-panel__count">${countLink()}</p>
      </div>
      ${arrows('rv-track-b')}
    </div>
  </div>`;

/* the whole review, opened from "Read more" */
const dialog = () => `
  <dialog class="modal rv-dialog" aria-labelledby="rv-dialog-name">
    <button type="button" class="modal__close" aria-label="Close review">✕</button>
    <div class="modal__body">
      <figure>
        ${starsImg()}
        <blockquote><p class="rv-dialog__text"></p></blockquote>
        <figcaption><span class="rv-dialog__name" id="rv-dialog-name"></span> <span class="rv-dialog__when"></span></figcaption>
      </figure>
      <a class="rv-proof" href="${google.url}" rel="noopener" target="_blank"><span class="rv-proof__stars" aria-hidden="true">${STARS}</span><span>See it on Google</span>${external}</a>
    </div>
  </dialog>`;

/* ---------- behaviour ---------- */
function wireRow(root) {
  const list = root.querySelector('.rv-track');
  const [prev, next] = root.querySelectorAll('.rv-arrow');
  const step = () => list.firstElementChild.offsetWidth + parseFloat(getComputedStyle(list).columnGap || 0);
  const update = () => {
    prev.disabled = list.scrollLeft < 4;
    next.disabled = list.scrollLeft + list.clientWidth > list.scrollWidth - 4;
    // which edges have more cards hidden behind them (css fades those)
    list.classList.toggle('has-before', !prev.disabled);
    list.classList.toggle('has-after', !next.disabled);
  };
  // one card per click, counted from the nearest card, so quick
  // repeated clicks keep moving instead of cancelling each other
  for (const b of [prev, next]) {
    b.addEventListener('click', () => {
      const s = step();
      list.scrollTo({ left: (Math.round(list.scrollLeft / s) + Number(b.dataset.dir)) * s, behavior: 'smooth' });
    });
  }
  list.addEventListener('scroll', update, { passive: true });
  new ResizeObserver(update).observe(list);
}

function wireDialog(slot) {
  const dlg = slot.querySelector('.rv-dialog');
  let opener = null;
  slot.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-review]');
    if (!btn) return;
    const r = reviews[Number(btn.dataset.review)];
    dlg.querySelector('.rv-dialog__text').textContent = r.text;
    dlg.querySelector('.rv-dialog__name').textContent = r.name;
    dlg.querySelector('.rv-dialog__when').textContent = `· Google review · ${r.when}`;
    opener = btn;
    dlg.showModal();
  });
  dlg.querySelector('.modal__close').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('close', () => opener?.focus());
}

export function initReviews() {
  const slot = document.querySelector('[data-reviews-slot]');
  if (!slot) return;
  slot.innerHTML = `<div class="rv-v rv-v--a">${oneQuote()}</div>`
    + `<div class="rv-v rv-v--b">${cards()}</div>`
    + `<div class="rv-v rv-v--c">${cardsB()}</div>${dialog()}`;
  wireRow(slot.querySelector('.rv-v--b'));
  wireRow(slot.querySelector('.rv-v--c'));
  wireDialog(slot);
}
