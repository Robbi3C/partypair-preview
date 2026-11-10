/* The maid-of-honor group chat: when the panel scrolls into view, each
   message shows a "…" typing bubble for a beat, then pops in, one after
   another, like the thread is happening live. Plays once.

   Messages stay in the DOM the whole time (screen readers get them all at
   once). Without JS, with ?static, or with reduced motion, nothing is
   hidden: see the html.js / data-chat-ready gate in theme.css. */

const TYPING_MS = 650;   // how long the dots show before a message lands
const GAP_MS = 250;      // pause after a message before the next one types
const LAST_LINE_MS = 900; // the "You" punchline types a little longer

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function typingFor(stack, bubble) {
  const me = bubble.classList.contains('chat-bubble--me');
  const dots = document.createElement('div');
  dots.className = `chat-typing${me ? ' chat-typing--me' : ''}`;
  dots.setAttribute('aria-hidden', 'true');
  dots.innerHTML = '<span></span><span></span><span></span>';
  // stand on the message's bottom corner, on its side of the thread
  dots.style.top = `${bubble.offsetTop + bubble.offsetHeight}px`;
  if (me) dots.style.right = `${stack.clientWidth - bubble.offsetLeft - bubble.offsetWidth}px`;
  else dots.style.left = `${bubble.offsetLeft}px`;
  stack.appendChild(dots);
  return dots;
}

async function play(stack, bubbles) {
  for (const bubble of bubbles) {
    const dots = typingFor(stack, bubble);
    requestAnimationFrame(() => dots.classList.add('is-on'));
    await wait(bubble.classList.contains('chat-bubble--me') ? LAST_LINE_MS : TYPING_MS);
    dots.remove();
    bubble.classList.add('is-in');
    await wait(GAP_MS);
  }
}

export function initChat() {
  const stack = document.querySelector('.problem .chat-stack');
  if (!stack || !document.documentElement.classList.contains('js')) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  const bubbles = [...stack.querySelectorAll('.chat-bubble')];
  for (const b of bubbles) b.dataset.chatWait = '';
  stack.dataset.chatReady = '';
  const io = new IntersectionObserver((entries) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    io.disconnect();
    play(stack, bubbles);
  }, { threshold: 0.35 });
  io.observe(stack);
}
