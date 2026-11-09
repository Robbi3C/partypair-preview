/* The homepage Instagram section: a one-row carousel of the latest posts,
   uncropped, with the profile bar under it, rendered from
   js/content/insta-grid.js into [data-insta-grid]; css/insta-grid.css.

   Clicking a tile opens a full-screen viewer: the post on a dark ground
   with a blurred copy behind it and its caption over the bottom. Reels
   autoplay with sound (muted only if the browser refuses); carousels
   swipe through their slides; arrows, swipe and the arrow keys move
   between posts; nothing inside shows a scrollbar and the page behind
   can't scroll. Only the open post is in the DOM, so closing stops
   the video. */

import { tiles } from './content/insta-grid.js';
import { site } from './content/site.js';
import { initCarousel } from './instafeed.js';

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const handle = site.instagram.split('/').filter(Boolean).pop();
const icon = `<svg class="ig-tile__icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="0.6"/></svg>`;
const chevron = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg>`;
const LEFT = chevron('M15 5l-7 7 7 7');
const RIGHT = chevron('M9 5l7 7-7 7');
const CLOSE = chevron('M6 6l12 12M18 6L6 18');
const PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
const SOUND_ON = chevron('M4 9v6h4l5 4V5L8 9H4zM16.5 9a4 4 0 0 1 0 6M19 6.5a8 8 0 0 1 0 11');
const SOUND_OFF = chevron('M4 9v6h4l5 4V5L8 9H4zM17 10l4 4M21 10l-4 4');

const head = () => `
  <div class="ig-head">
    <div class="ig-head__who">
      <img class="ig-head__avatar" src="assets/img/pear.svg" alt="" width="56" height="56">
      <div>
        <p class="ig-head__name">The Party Pair</p>
        <p class="ig-head__handle">@${handle}</p>
      </div>
    </div>
    <a class="btn btn--ghost" href="${site.instagram}" rel="noopener">Follow</a>
  </div>`;

const tile = (t, i) => `
  <button type="button" class="ig-tile" data-tile="${i}" aria-label="Open post: ${esc(t.caption)}">
    <img src="${t.image}" alt="${esc(t.alt)}" loading="lazy" width="540" height="960">
    <span class="ig-tile__caption" aria-hidden="true">${esc(t.caption)}</span>
    ${icon}
  </button>`;

/* one row, built from the shared carousel classes for swipe and arrows */
const row = () => `
  <div class="insta-carousel ig-row">
    <button class="insta-carousel__btn insta-carousel__btn--prev" aria-label="Previous posts">←</button>
    <div class="gallery gallery--insta" tabindex="0" aria-label="Latest Instagram posts: swipe or use the arrow buttons">
      ${tiles.map(tile).join('')}
    </div>
    <button class="insta-carousel__btn insta-carousel__btn--next" aria-label="Next posts">→</button>
  </div>`;

const viewer = () => `
  <dialog class="ig-viewer" aria-label="Instagram post">
    <div class="ig-viewer__card"></div>
    <button type="button" class="ig-viewer__btn ig-viewer__close" aria-label="Close post">${CLOSE}</button>
    <button type="button" class="ig-viewer__btn ig-viewer__prev" data-step="-1" aria-label="Previous post">${LEFT}</button>
    <button type="button" class="ig-viewer__btn ig-viewer__next" data-step="1" aria-label="Next post">${RIGHT}</button>
  </dialog>`;

const blurred = (src) => `<div class="ig-viewer__blur" style="background-image:url('${src}')"></div>`;

const slidesOf = (t) => Array.from({ length: t.slides }, (_, i) => t.image.replace('.jpg', `-${i + 1}.jpg`));

function media(t) {
  if (t.video) {
    return `
      ${blurred(t.image)}
      <video class="ig-viewer__media" src="${t.video}" poster="${t.image}" playsinline></video>
      <button type="button" class="ig-viewer__toggle" aria-label="Pause video">${PLAY}</button>
      <button type="button" class="ig-viewer__btn ig-viewer__sound" aria-label="Mute">${SOUND_ON}</button>`;
  }
  if (t.slides) {
    return `
      ${blurred(t.image)}
      <div class="ig-viewer__slides" tabindex="0" aria-label="Photos in this post: swipe for more">
        ${slidesOf(t).map((s, i) => `<img src="${s}" alt="${i ? `Slide ${i + 1} of ${t.slides} from this post` : esc(t.alt)}" ${i ? 'loading="lazy"' : ''}>`).join('')}
      </div>
      <button type="button" class="ig-viewer__slide-btn ig-viewer__slide-btn--prev" data-slide="-1" aria-label="Previous photo" hidden>${LEFT}</button>
      <button type="button" class="ig-viewer__slide-btn ig-viewer__slide-btn--next" data-slide="1" aria-label="Next photo">${RIGHT}</button>`;
  }
  return `
    ${blurred(t.image)}
    <img class="ig-viewer__media" src="${t.image}" alt="${esc(t.alt)}">
    ${t.watch ? `<a class="btn btn--light ig-viewer__watch" href="${t.post}" rel="noopener" target="_blank">Watch on Instagram</a>` : ''}`;
}

const card = (t) => `
  ${media(t)}
  <div class="ig-viewer__info">
    <div class="ig-viewer__scroll">
      <a class="ig-viewer__who" href="${t.post}" rel="noopener" target="_blank">
        <img src="assets/img/pear.svg" alt="" width="46" height="46">
        <span>${handle}</span>
      </a>
      <p class="ig-viewer__preview">${esc(t.text.replace(/\n+/g, ' '))}</p>
      <div class="ig-viewer__text" hidden>${t.text.split(/\n+/).map((p) => `<p>${esc(p)}</p>`).join('')}</div>
    </div>
    <button type="button" class="ig-viewer__more" aria-expanded="false" hidden>more</button>
  </div>`;

/* the caption starts as two lines; "more" swaps in the whole thing, and
   only appears when the two lines actually cut something off */
function wireCaption(box) {
  const preview = box.querySelector('.ig-viewer__preview');
  const full = box.querySelector('.ig-viewer__text');
  const more = box.querySelector('.ig-viewer__more');
  more.hidden = preview.scrollHeight <= preview.clientHeight + 1;
  more.addEventListener('click', () => {
    const open = full.hidden;
    full.hidden = !open;
    preview.hidden = open;
    more.textContent = open ? 'less' : 'more';
    more.setAttribute('aria-expanded', String(open));
    box.querySelector('.ig-viewer__scroll').scrollTop = 0;
  });
}

function play(video) {
  video.play().catch(() => {
    // browser refused sound without a gesture: play silently instead
    video.muted = true;
    video.play().catch(() => {});
  });
}

/* our own minimal controls, so the caption can sit at the very bottom:
   tap the video to pause, and a sound button.
   Muting carries over to the next reel. */
let soundOff = false;

function wireVideo(box, video) {
  const toggle = box.querySelector('.ig-viewer__toggle');
  const sound = box.querySelector('.ig-viewer__sound');

  const syncPlay = () => {
    toggle.classList.toggle('is-paused', video.paused);
    toggle.setAttribute('aria-label', video.paused ? 'Play video' : 'Pause video');
  };
  const syncSound = () => {
    sound.innerHTML = video.muted ? SOUND_OFF : SOUND_ON;
    sound.setAttribute('aria-label', video.muted ? 'Unmute' : 'Mute');
  };
  video.addEventListener('play', syncPlay);
  video.addEventListener('pause', syncPlay);
  video.addEventListener('volumechange', syncSound);
  toggle.addEventListener('click', () => { if (video.paused) play(video); else video.pause(); });
  sound.addEventListener('click', () => {
    video.muted = !video.muted;
    soundOff = video.muted;
  });

  video.muted = soundOff;
  syncSound();
  play(video);
}

function wireSlides(box) {
  const track = box.querySelector('.ig-viewer__slides');
  if (!track) return;
  const prev = box.querySelector('[data-slide="-1"]');
  const next = box.querySelector('[data-slide="1"]');
  const update = () => {
    prev.hidden = track.scrollLeft < 4;
    next.hidden = track.scrollLeft + track.clientWidth > track.scrollWidth - 4;
  };
  for (const b of [prev, next]) {
    b.addEventListener('click', () => {
      const w = track.clientWidth;
      track.scrollTo({ left: (Math.round(track.scrollLeft / w) + Number(b.dataset.slide)) * w, behavior: 'smooth' });
    });
  }
  track.addEventListener('scroll', update, { passive: true });
}

export function initInstaGrid() {
  const slot = document.querySelector('[data-insta-grid]');
  if (!slot) return;
  slot.innerHTML = `${row()}${head()}${viewer()}`;
  initCarousel(slot.querySelector('.gallery--insta'));

  const dlg = slot.querySelector('.ig-viewer');
  const box = dlg.querySelector('.ig-viewer__card');
  const prev = dlg.querySelector('.ig-viewer__prev');
  const next = dlg.querySelector('.ig-viewer__next');
  let current = 0;
  let opener = null;

  const show = (i) => {
    current = i;
    box.innerHTML = card(tiles[i]);
    prev.hidden = i === 0;
    next.hidden = i === tiles.length - 1;
    wireSlides(box);
    wireCaption(box);
    const video = box.querySelector('video');
    if (video) wireVideo(box, video);
  };
  const step = (d) => {
    const i = current + d;
    if (i >= 0 && i < tiles.length) show(i);
  };

  slot.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-tile]');
    if (!btn) return;
    opener = btn;
    dlg.showModal();
    show(Number(btn.dataset.tile));
  });
  dlg.querySelector('.ig-viewer__close').addEventListener('click', () => dlg.close());
  for (const b of [prev, next]) b.addEventListener('click', () => step(Number(b.dataset.step)));
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  // on the document: focus falls to <body> when the focused arrow hides at the end of the row
  document.addEventListener('keydown', (e) => {
    if (!dlg.open || e.target.closest('.ig-viewer__slides')) return;   // arrows scroll the photos there
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });
  dlg.addEventListener('close', () => {
    box.innerHTML = '';
    opener?.focus();
  });

  // swipe between posts (a carousel keeps its own swipe)
  let startX = null;
  box.addEventListener('touchstart', (e) => {
    startX = e.target.closest('.ig-viewer__slides, video') ? null : e.touches[0].clientX;
  }, { passive: true });
  box.addEventListener('touchend', (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
  }, { passive: true });
}
