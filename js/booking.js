/* How booking works (homepage band, css/booking.css).
   Renders the steps from js/content/booking.js into [data-booking-steps]:
   paper cards with flat die-cut stickers, numbered paper discs on a foam
   thread. As the band scrolls into place the thread fills, each disc
   gets a ring as it's reached, and when the band settles under the
   header the last disc fills Punch and the sparkle trio lands.
   Every step is readable before any motion; with reduced motion the
   same states simply switch without transitions. */

import { bookingSteps } from './content/booking.js';

const IMG = 'assets/img/';
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const escape = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/* ---------- Stickers: flat colour, die-cut paper edge (guide §10.3) ----------
   Fills read the --sticker-* colour roles (css/tokens.css) so each palette
   in css/palettes.css can recolour them; the paper die-cut edge stays paper. */
const SPARK = 'M28 0 L32 22 L56 28 L32 34 L28 56 L24 34 L0 28 L24 22 Z';
const spark = (x, y, s, fill) => `<path d="${SPARK}" transform="translate(${x} ${y}) scale(${s})" style="fill:var(--${fill})" stroke="none"/>`;
const EDGE = 'stroke="#fffdf8" stroke-width="5" stroke-linejoin="round" paint-order="stroke"';

const STICKERS = {
  calendar: `
    <g ${EDGE}>
      <rect x="20" y="24" width="80" height="78" rx="12" style="fill:var(--paper)"/>
      <path d="M20 36a12 12 0 0 1 12-12h56a12 12 0 0 1 12 12v12H20z" style="fill:var(--sticker-hot)"/>
    </g>
    <circle cx="42" cy="24" r="4.5" style="fill:var(--sticker-pin)"/><circle cx="78" cy="24" r="4.5" style="fill:var(--sticker-pin)"/>
    <text x="60" y="44" text-anchor="middle" font-family="Josefin Sans, sans-serif" font-size="10" letter-spacing="2" style="fill:var(--paper)">JUNE</text>
    <text x="60" y="89" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="900" font-size="36" style="fill:var(--ink)">14</text>`,
  chat: `
    <g ${EDGE}>
      <path d="M14 26a12 12 0 0 1 12-12h50a12 12 0 0 1 12 12v22a12 12 0 0 1-12 12H36l-14 12 2-12a12 12 0 0 1-10-12z" style="fill:var(--sticker-leaf)"/>
      <path d="M40 66a12 12 0 0 1 12-12h44a12 12 0 0 1 12 12v18a12 12 0 0 1-12 12h-2l2 12-14-12H52a12 12 0 0 1-12-12z" style="fill:var(--sticker-pink)"/>
    </g>
    <circle cx="38" cy="37" r="4" style="fill:var(--ink)"/><circle cx="51" cy="37" r="4" style="fill:var(--ink)"/><circle cx="64" cy="37" r="4" style="fill:var(--ink)"/>
    <path d="M74 66c-5-6-14-1-9 6l9 8 9-8c5-7-4-12-9-6z" style="fill:var(--paper)"/>`,
  balloons: `
    <g ${EDGE}>
      <ellipse cx="44" cy="46" rx="22" ry="26" style="fill:var(--sticker-pink)"/>
      <ellipse cx="78" cy="42" rx="20" ry="24" style="fill:var(--sticker-butter)"/>
      <ellipse cx="62" cy="68" rx="21" ry="25" style="fill:var(--sticker-leaf)"/>
    </g>
    <path d="M44 72l-3 5h6zM78 66l-3 5h6zM62 93l-3 5h6z" style="fill:var(--sticker-deep)"/>
    <path d="M62 98q-4 8 0 14" stroke="#4f5b6c" stroke-width="2" fill="none" stroke-linecap="round"/>
    <ellipse cx="37" cy="36" rx="5" ry="8" style="fill:var(--paper)" opacity=".55"/>`,
  seal: `
    <g ${EDGE}>
      <rect x="14" y="22" width="82" height="64" rx="8" style="fill:var(--paper)" transform="rotate(-6 55 54)"/>
    </g>
    <g transform="rotate(-6 55 54)">
      <rect x="24" y="36" width="50" height="6" rx="3" style="fill:var(--line)"/>
      <rect x="24" y="48" width="40" height="6" rx="3" style="fill:var(--line)"/>
      <rect x="24" y="66" width="30" height="5" rx="2.5" style="fill:var(--ink)"/>
    </g>
    <circle cx="86" cy="84" r="24" style="fill:var(--sticker-pink)" stroke="#fffdf8" stroke-width="5"/>
    <circle cx="86" cy="84" r="14" style="fill:var(--paper)"/>
    <image href="${IMG}pear.svg" x="78" y="73" width="16" height="22"/>`,
  door: `
    <g ${EDGE}>
      <path d="M30 108V50a30 30 0 0 1 60 0v58z" style="fill:var(--paper)"/>
      <path d="M38 108V52a22 22 0 0 1 44 0v56z" style="fill:var(--sticker-butter)"/>
      <path d="M38 108V50L18 42v72z" style="fill:var(--sticker-hot)"/>
    </g>
    <circle cx="23" cy="80" r="3" style="fill:var(--paper)"/>
    ${spark(50, 56, 0.42, 'sticker-hot')}${spark(68, 76, 0.26, 'sticker-spark2')}`,
};

/* Sparkle trio (§9.6): Punch, Butter deep, and Paper on pink; 40 / 24 / 16 px */
const TRIO = [['sticker-hot', 40], ['sticker-pin', 24], ['paper', 16]]
  .map(([c, s], i) => `<svg class="booking__spark booking__spark--${i + 1}" viewBox="0 0 56 56" width="${s}" height="${s}"><path d="${SPARK}" style="fill:var(--${c})"/></svg>`).join('');

export function initBooking() {
  const band = document.querySelector('[data-booking]');
  const stage = band?.querySelector('[data-booking-steps]');
  if (!stage) return;

  const steps = bookingSteps;
  const n = steps.length;
  band.style.setProperty('--n', n);

  stage.innerHTML = `
    <ol class="booking__steps">${steps.map((s, i) => `
      <li class="booking__step" style="--i:${i + 1}">
        <span class="booking__anchor" aria-hidden="true"></span>
        <div class="booking__card">
          <svg class="booking__sticker" viewBox="0 0 120 120" aria-hidden="true">${STICKERS[s.sticker] || ''}</svg>
          <h3>${escape(s.title)}</h3>
          <p>${escape(s.line)}</p>
          ${i === n - 1 ? `<span class="booking__trio" aria-hidden="true">${TRIO}</span>` : ''}
        </div>
      </li>`).join('')}
    </ol>
    <div class="booking__rail" aria-hidden="true">
      <svg class="booking__thread"><path class="booking__track"/><path class="booking__fill" pathLength="1"/></svg>
      ${steps.map((_, i) => `<span class="booking__dot">${i + 1}</span>`).join('')}
    </div>`;

  const svg = stage.querySelector('.booking__thread');
  const [track, fill] = svg.querySelectorAll('path');
  const dots = [...stage.querySelectorAll('.booking__dot')];
  const anchors = [...stage.querySelectorAll('.booking__anchor')];
  const header = document.querySelector('.site-header__inner');
  let marks = [];

  // Dots sit on each step's anchor; the thread wobbles between them
  function layout() {
    const sr = stage.getBoundingClientRect();
    const pts = anchors.map((a) => {
      const r = a.getBoundingClientRect();
      return [r.left + r.width / 2 - sr.left, r.top + r.height / 2 - sr.top];
    });
    pts.forEach(([x, y], i) => { dots[i].style.left = `${x}px`; dots[i].style.top = `${y}px`; });
    svg.setAttribute('width', sr.width);
    svg.setAttribute('height', sr.height);
    let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    let dist = 0;
    const cum = [0];
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      const len = Math.hypot(x1 - x0, y1 - y0) || 1;
      const ux = (x1 - x0) / len;
      const uy = (y1 - y0) / len;
      for (let t = 4; t <= len; t += 4) {
        const w = 4 * Math.sin(((dist + t) / 46) * 2 * Math.PI);
        d += ` L${(x0 + ux * t - uy * w).toFixed(1)} ${(y0 + uy * t + ux * w).toFixed(1)}`;
      }
      d += ` L${x1.toFixed(1)} ${y1.toFixed(1)}`;
      dist += len;
      cum.push(dist);
    }
    marks = cum.map((c) => c / (dist || 1));
    track.setAttribute('d', d);
    fill.setAttribute('d', d);
    update();
  }

  // Side by side (one screen): 0 when the band's top is 75% down the screen,
  // 1 once it has settled just under the header (or the top, if the header
  // has tucked away). Stacked: follows the steps themselves down the screen.
  const stacked = matchMedia('(max-width: 63.75em)');
  function update() {
    const vh = innerHeight;
    let p;
    if (stacked.matches) {
      const r = stage.getBoundingClientRect();
      p = clamp((vh * 0.85 - r.top) / Math.max(r.height - vh * 0.1, 1));
    } else {
      const top = band.getBoundingClientRect().top;
      const under = Math.max(0, header?.getBoundingClientRect().bottom ?? 0);
      p = clamp((vh * 0.75 - top) / Math.max(vh * 0.75 - under - 8, 1));
    }
    fill.style.strokeDashoffset = 1 - p;
    dots.forEach((dot, i) => dot.classList.toggle('is-on', p >= marks[i] - 0.001));
    band.classList.toggle('is-done', p >= 1);
  }

  new ResizeObserver(layout).observe(stage);
  addEventListener('scroll', update, { passive: true });
  document.fonts?.ready.then(layout);
}
