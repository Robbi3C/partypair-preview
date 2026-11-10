/* Google reviews section (homepage): renders js/content/reviews.js into
   [data-reviews-slot] as a row of landscape postcards; css/reviews.css.

   Each postcard: the review on the left, the "address side" on the right
   with the reviewer's photo, name and date on ruled lines and the pear
   seal where a stamp would go. Above the row: the headline, a 5.0 burst
   sticker and the review count, which links to Google (a quiet text
   link, so the page's one button stays "Check your weekend").

   Every review shows, newest first; long reviews clipped, "Read more"
   opens the whole review in a small dialog; arrows or swipe, never
   moving on its own.
   No review schema on purpose: Google shows no stars for reviews a
   business publishes about itself (LocalBusiness "self-serving" rule). */

import { reviews, google } from './content/reviews.js';

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const score = google.rating.toFixed(1);
const STARS = '★★★★★';
const starsImg = () => `<span class="rv-stars" role="img" aria-label="5 out of 5 stars">${STARS}</span>`;
const external = '<span class="visually-hidden"> (opens Google Maps)</span>';
const arrowOut = '<span aria-hidden="true"> ↗</span>';
const LONG = 170;   // characters before a card shows "Read more"

const countLink = () =>
  `Based on <a class="rv-panel__link" href="${google.url}" rel="noopener" target="_blank">${google.count} Google reviews${arrowOut}${external}</a>`;
const arrows = (id) => `
      <div class="rv-arrows">
        <button type="button" class="rv-arrow" data-dir="-1" aria-label="Previous reviews" aria-controls="${id}" disabled>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>
        </button>
        <button type="button" class="rv-arrow" data-dir="1" aria-label="Next reviews" aria-controls="${id}">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>
        </button>
      </div>`;

/* the reviewer's photo; their initial sits behind it and shows when there is none */
const face = (r, i) => `
      <span class="rv-q__face rv-q__face--${i % 4}" aria-hidden="true">${esc(r.name[0])}${r.photo
        ? `<img src="${r.photo}" alt="" width="60" height="60" loading="lazy" referrerpolicy="no-referrer">`
        : ''}</span>`;
/* ---------- Landscape postcards ----------
   The message on the left, the "address side" on the right with the
   name written on its lines and the pear seal where a stamp would go.
   Burst shape: the guide's soft 9-petal flower (§10.3). */
const burstPath = (() => {
  const pts = Array.from({ length: 96 }, (_, i) => {
    const t = (2 * Math.PI * i) / 96;
    const r = 48 * (1 + 0.09 * Math.cos(9 * t));
    return `${(60 + r * Math.cos(t)).toFixed(1)} ${(60 + r * Math.sin(t)).toFixed(1)}`;
  });
  return `M${pts.join(' L')} Z`;
})();

const postcard = (r, i) => `
  <figure class="rvb-card">
    <div class="rvb-card__message">
      ${starsImg()}
      <blockquote><p class="rvb-card__text">${esc(r.text)}</p></blockquote>
      <button type="button" class="rv-more" data-review="${i}" hidden>Read more<span class="visually-hidden"> of ${esc(r.name)}’s review</span></button>
    </div>
    <figcaption class="rvb-card__address">
      <span class="rvb-card__seal" aria-hidden="true"><img src="assets/img/pear.svg" alt="" width="20" height="22"></span>
      ${face(r, i)}
      <span class="rvb-card__name">${esc(r.name)}</span>
      <span class="rvb-card__line">${r.when}</span>
      <span class="rvb-card__line">Google review</span>
    </figcaption>
  </figure>`;

const postcards = () => `
  <p class="rvb-script" aria-hidden="true">10/10</p>
  <div class="container rvb-head">
    <h2>Kind words</h2>
    <div class="rvb-burst">
      <svg viewBox="0 0 120 120" aria-hidden="true"><path d="${burstPath}"/></svg>
      <p><b>${score}</b>${starsImg()}</p>
    </div>
    <p class="rv-panel__count rvb-count">${countLink()}</p>
  </div>
  <ul class="rv-track rvb-track" id="rv-track-postcards" tabindex="0" aria-label="Google reviews: scroll sideways for more">
    ${reviews.map((r, i) => `<li>${postcard(r, i)}</li>`).join('')}
  </ul>
  <div class="container rvb-foot">${arrows('rv-track-postcards')}</div>`;

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

/* "Read more" appears only on postcards whose text is really cut off */
function wirePostcards(root) {
  const list = root.querySelector('.rv-track');
  new ResizeObserver(() => {
    if (!list.clientWidth) return;
    for (const li of list.children) {
      const text = li.querySelector('.rvb-card__text');
      li.querySelector('.rv-more').hidden = text.scrollHeight <= text.clientHeight + 1;
    }
  }).observe(list);
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
  slot.innerHTML = `<div class="rv-v rv-v--b">${postcards()}</div>${dialog()}`;
  // a photo that no longer loads falls back to the initial behind it
  slot.addEventListener('error', (e) => { if (e.target.matches?.('.rv-q__face img')) e.target.remove(); }, true);
  wireRow(slot.querySelector('.rv-v--b'));
  wirePostcards(slot.querySelector('.rv-v--b'));
  wireDialog(slot);
}
