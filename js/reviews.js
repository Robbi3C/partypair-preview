/* Google reviews section (homepage): renders js/content/reviews.js into
   [data-reviews-slot]; css/reviews.css. Both layouts are rendered and
   css shows one:

   Cards   (desktop) a summary panel (score, stars, "Based on 12 Google
           reviews ↗") beside a row of review cards; arrows under the row.
   Photos  (60em and below) centred cards running off both edges, the
           middle one lifted: quote mark, review, stars, reviewer's photo
           (their initial when there is none), name.
   The count is the link to Google: a quiet text link, so the page's one
   button stays "Check your weekend".

   Every review shows, newest first; equal heights; long reviews
   clipped, "Read more" opens the whole review in a small dialog
   (opening it in the card would make the row jump); arrows or swipe,
   never moving on its own.
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

/* ---------- Cards ---------- */
const card = (r, i) => `
  <figure class="rv-card">
    ${starsImg()}
    <blockquote><p class="rv-card__text">${esc(r.text)}</p></blockquote>
    ${r.text.length > LONG
      ? `<button type="button" class="rv-more" data-review="${i}">Read more<span class="visually-hidden"> of ${esc(r.name)}’s review</span></button>`
      : ''}
    <figcaption class="rv-card__person">${face(r, i)}<span class="rv-card__name">${esc(r.name)}</span><span class="rv-card__when">${r.when}</span></figcaption>
  </figure>`;

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

const cards = () => `
  <div class="container rv-cards">
    <div class="rv-panel">
      <h2>Kind words</h2>
      <p class="rv-panel__score">${score}</p>
      ${starsImg()}
      <p class="rv-panel__count">${countLink()}</p>
    </div>
    <div class="rv-row">
      <ul class="rv-track" id="rv-track-cards" tabindex="0" aria-label="Google reviews: scroll sideways for more">
        ${reviews.map((r, i) => `<li>${card(r, i)}</li>`).join('')}
      </ul>
      ${arrows('rv-track-cards')}
    </div>
  </div>`;

/* Photo cards: centred cards, the middle one lifted */
const face = (r, i) => `
      <span class="rv-q__face rv-q__face--${i % 4}" aria-hidden="true">${esc(r.name[0])}${r.photo
        ? `<img src="${r.photo}" alt="" width="60" height="60" loading="lazy" referrerpolicy="no-referrer">`
        : ''}</span>`;
const photoCard = (r, i) => `
  <figure class="rv-q">
    <span class="rv-q__mark" aria-hidden="true">“</span>
    <blockquote><p class="rv-q__text">${esc(r.text)}</p></blockquote>
    <button type="button" class="rv-more" data-review="${i}" hidden>Read more<span class="visually-hidden"> of ${esc(r.name)}’s review</span></button>
    <div class="rv-q__foot">
      ${starsImg()}
      ${face(r, i)}
      <figcaption class="rv-q__by">${esc(r.name)}<span>${r.when}</span></figcaption>
    </div>
  </figure>`;
const photoCards = () => `
  <div class="rv-photos">
    <h2 class="container">Kind words</h2>
    <ul class="rv-track rv-track--q" id="rv-track-photos" tabindex="0" aria-label="Google reviews: scroll sideways for more">
      ${reviews.map((r, i) => `<li>${photoCard(r, i)}</li>`).join('')}
    </ul>
    <div class="container rv-photos__foot">
      ${arrows('rv-track-photos')}
      <div class="rv-sum">
        <p class="rv-sum__line"><span class="rv-sum__score">${score}</span>${starsImg()}</p>
        <p class="rv-panel__count">${countLink()}</p>
      </div>
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

/* Photo cards: the card nearest the middle is lifted; arrows move one
   card and stay focusable at the ends (aria-disabled, not disabled).
   "Read more" shows only on cards whose text is really cut off. */
function wirePhotos(root) {
  const list = root.querySelector('.rv-track');
  const items = [...list.children];
  const [prev, next] = root.querySelectorAll('.rv-arrow');
  prev.removeAttribute('disabled');
  const leftFor = (li) => li.offsetLeft - (list.clientWidth - li.offsetWidth) / 2;
  let active = -1;
  let pending = null;
  let settle;
  const update = () => {
    const mid = list.scrollLeft + list.clientWidth / 2;
    const dist = (li) => Math.abs(li.offsetLeft + li.offsetWidth / 2 - mid);
    const nearest = items.reduce((best, li, i) => (dist(li) < dist(items[best]) ? i : best), 0);
    if (nearest === active) return;
    items[active]?.classList.remove('is-centre');
    items[nearest].classList.add('is-centre');
    active = nearest;
    prev.setAttribute('aria-disabled', String(active === 0));
    next.setAttribute('aria-disabled', String(active === items.length - 1));
  };
  for (const b of [prev, next]) {
    b.addEventListener('click', () => {
      const to = Math.min(items.length - 1, Math.max(0, (pending ?? active) + Number(b.dataset.dir)));
      pending = to;
      list.scrollTo({ left: leftFor(items[to]), behavior: 'smooth' });
    });
  }
  list.addEventListener('scroll', () => {
    update();
    clearTimeout(settle);
    settle = setTimeout(() => { pending = null; }, 160);
  }, { passive: true });
  // the layout is display:none on desktop, so measure once it has a size;
  // start on the second card so there is a card either side
  let placed = false;
  new ResizeObserver(() => {
    if (!list.clientWidth) return;
    if (!placed) { list.scrollLeft = leftFor(items[1]); placed = true; }
    for (const li of items) {
      const text = li.querySelector('.rv-q__text');
      li.querySelector('.rv-more').hidden = text.scrollHeight <= text.clientHeight + 1;
    }
    update();
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
  slot.innerHTML = `<div class="rv-v rv-v--cards">${cards()}</div>`
    + `<div class="rv-v rv-v--photos">${photoCards()}</div>${dialog()}`;
  // a photo that no longer loads falls back to the initial behind it
  slot.addEventListener('error', (e) => { if (e.target.matches?.('.rv-q__face img')) e.target.remove(); }, true);
  wireRow(slot.querySelector('.rv-v--cards'));
  wirePhotos(slot.querySelector('.rv-v--photos'));
  wireDialog(slot);
}
