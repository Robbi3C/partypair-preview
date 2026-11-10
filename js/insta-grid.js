/* The homepage Instagram section: a polaroid strip of the latest posts,
   with the handle and arrows under it, rendered from
   js/content/insta-grid.js into [data-insta-grid]; css/insta-grid.css.

   Clicking a polaroid opens a full-screen viewer: the post on a dark ground
   with a blurred copy behind it and its caption over the bottom. Reels
   autoplay with sound (muted only if the browser refuses); carousels
   swipe through their slides; arrows, swipe and the arrow keys move
   between posts; nothing inside shows a scrollbar and the page behind
   can't scroll. Only the open post is in the DOM, so closing stops
   the video. */

import { tiles } from './content/insta-grid.js';
import { site } from './content/site.js';

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const handle = site.instagram.split('/').filter(Boolean).pop();
const chevron = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg>`;
const LEFT = chevron('M15 5l-7 7 7 7');
const RIGHT = chevron('M9 5l7 7-7 7');
const CLOSE = chevron('M6 6l12 12M18 6L6 18');
const PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
const SOUND_ON = chevron('M4 9v6h4l5 4V5L8 9H4zM16.5 9a4 4 0 0 1 0 6M19 6.5a8 8 0 0 1 0 11');
const SOUND_OFF = chevron('M4 9v6h4l5 4V5L8 9H4zM17 10l4 4M21 10l-4 4');

/* ---------- Polaroid strip (design guide §6.2, §11.2) ---------- */
const POLAROID_CAPTIONS = [
  'last toast, east coast', 'not just balloons', 'cape cod brides know', 'surprise, bestie',
  'pinterest, delivered', 'months of planning', 'some girls want vegas', 'the atlantic suite',
  'the text we live for', 'we love to see it',
];

const polaroid = (t, i) => `
  <button type="button" class="pol-card" data-tile="${i}" aria-label="Open post: ${esc(t.caption)}">
    <img src="${t.image}" alt="${esc(t.alt)}" loading="lazy" width="540" height="960">
    <span class="pol-card__cap" aria-hidden="true">${POLAROID_CAPTIONS[i] ?? ''}</span>
  </button>`;

/* the last polaroid: same frame, but the "photo" is a pink panel that
   sends people to the full feed */
const morePolaroid = () => `
  <a class="pol-card pol-card--more" href="${site.instagram}" rel="noopener" aria-label="See more weekends on Instagram, @${handle}">
    <span class="pol-more" aria-hidden="true">
      <span class="pol-more__seal"><img src="assets/img/pear.svg" alt="" width="26" height="29"></span>
      <span class="pol-more__title">more weekends on instagram</span>
      <span class="pol-more__handle">@${handle}</span>
    </span>
    <span class="pol-card__cap" aria-hidden="true">come say hi →</span>
  </a>`;

const strip = () => `
  <div class="pol-strip" tabindex="0" aria-label="Photos from recent weekends: scroll sideways for more">
    ${tiles.map(polaroid).join('')}
    ${morePolaroid()}
  </div>`;

const stripFoot = () => `
  <div class="pol-foot">
    <a class="pol-handle" href="${site.instagram}" rel="noopener">
      <span class="pol-handle__seal"><img src="assets/img/pear.svg" alt="" width="26" height="29"></span>
      <span><strong>The Party Pair</strong><span>@${handle} · follow on Instagram</span></span>
    </a>
    <div class="pol-arrows">
      <button type="button" data-pol-dir="-1" aria-label="Previous photos"><svg width="22" height="14" viewBox="0 0 22 14" aria-hidden="true"><path d="M21 7 C15 5 9 9 2 7 M7 2 L2 7 L7 12"/></svg></button>
      <button type="button" data-pol-dir="1" aria-label="Next photos"><svg width="22" height="14" viewBox="0 0 22 14" aria-hidden="true"><path d="M1 7 C7 9 13 5 20 7 M15 2 L20 7 L15 12"/></svg></button>
    </div>
  </div>`;

/* Each arrow press glides exactly one polaroid and rests at either end.
   Quick repeat presses queue up (two clicks = two cards) instead of
   restarting from wherever the glide had got to. Swipes stop at the
   next card too (scroll-snap-stop in insta-grid.css).

   The glide is animated here rather than with scrollTo({behavior:
   'smooth'}): Chrome's built-in smooth scroll covers ~90% of the distance
   in the first 150ms, which reads as a jump. Snapping is paused while it
   runs so the browser doesn't tug the strip mid-glide. */
const GLIDE_MS = 650;
// eases in and out, so the card drifts off and settles rather than jolting
const easeInOutCubic = (x) => (x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2);

function initStrip(slot) {
  const track = slot.querySelector('.pol-strip');
  const [prev, next] = slot.querySelectorAll('[data-pol-dir]');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let pending = null;   // card index a glide is heading to
  let raf = 0;
  const sync = () => {
    prev.disabled = track.scrollLeft < 10;
    next.disabled = track.scrollLeft > track.scrollWidth - track.clientWidth - 10;
  };
  // Where the strip rests with each card at the left edge, measured the way
  // scroll-snap measures (the tilted card's box), so nothing nudges after
  // the glide; the last few clamp to the end of the row.
  const stops = () => {
    const pad = parseFloat(getComputedStyle(track).scrollPaddingLeft) || 0;
    const left = track.getBoundingClientRect().left;
    const max = track.scrollWidth - track.clientWidth;
    return [...track.children].map((c) =>
      Math.max(0, Math.min(max, Math.round(c.getBoundingClientRect().left - left + track.scrollLeft - pad))));
  };
  const nearest = (list) => list.reduce((best, s, i) =>
    (Math.abs(s - track.scrollLeft) < Math.abs(list[best] - track.scrollLeft) ? i : best), 0);

  const release = () => {
    cancelAnimationFrame(raf);
    raf = 0;
    pending = null;
    track.style.scrollSnapType = '';
    track.style.scrollBehavior = '';
  };
  const glide = (to) => {
    cancelAnimationFrame(raf);
    if (reduce) { track.scrollLeft = to; pending = null; return; }
    const from = track.scrollLeft;
    const start = performance.now();
    track.style.scrollSnapType = 'none';
    track.style.scrollBehavior = 'auto';
    const frame = (now) => {
      const p = Math.min(1, (now - start) / GLIDE_MS);
      track.scrollLeft = from + (to - from) * easeInOutCubic(p);
      if (p < 1) raf = requestAnimationFrame(frame);
      else release();
    };
    raf = requestAnimationFrame(frame);
  };
  const step = (dir) => {
    const list = stops();
    const lastStop = list.findIndex((s) => s === list[list.length - 1]);
    const to = Math.max(0, Math.min(lastStop, (pending ?? nearest(list)) + dir));
    pending = to;
    glide(list[to]);
  };
  for (const b of [prev, next]) {
    b.addEventListener('click', () => step(Number(b.dataset.polDir)));
  }
  // a finger or mouse grabbing the strip takes over from any glide
  track.addEventListener('pointerdown', () => { if (raf) release(); });

  // Trackpads send a long stream of sideways wheel events (plus momentum)
  // that would skate past several cards. Treat each sideways gesture as one
  // step; the next gesture counts once the stream goes quiet. Up/down
  // scrolling is left alone so the page still scrolls over the strip.
  let swiping = false;
  let quiet;
  let pushed = 0;
  track.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    e.preventDefault();
    clearTimeout(quiet);
    quiet = setTimeout(() => { swiping = false; pushed = 0; }, 180);
    if (swiping) return;
    pushed += e.deltaX;
    if (Math.abs(pushed) < 12) return;   // ignore tiny accidental nudges
    swiping = true;
    step(Math.sign(pushed));
  }, { passive: false });
  track.addEventListener('scroll', sync, { passive: true });
  sync();
}

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
  slot.innerHTML = `${strip()}${stripFoot()}${viewer()}`;
  initStrip(slot);

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
