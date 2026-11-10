/* "Her kind of party" polaroid pile: the first photo is already down;
   once the pile scrolls into view, the rest drop onto it one every 1.5s
   (straight down, already at their resting angle: pile-drop in theme.css).
   Plays once.

   Without JS, with ?static, or with reduced motion, nothing is hidden:
   see the data-pile-ready gate in theme.css. */

const DROP_EVERY_MS = 1500;

export function initPolaroids() {
  const pile = document.querySelector('.her-party .polaroids');
  if (!pile || !document.documentElement.classList.contains('js')) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  const [, ...waiting] = pile.querySelectorAll('.polaroid');
  for (const p of waiting) p.dataset.pileWait = '';
  pile.dataset.pileReady = '';

  const io = new IntersectionObserver((entries) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    io.disconnect();
    waiting.forEach((p, i) => {
      setTimeout(() => {
        delete p.dataset.pileWait;
        p.classList.add('is-landing');
      }, DROP_EVERY_MS * (i + 1));
    });
  }, { threshold: 0.35 });
  io.observe(pile);
}
