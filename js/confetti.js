/* Canvas confetti bursts in brand colors.
   One shared full-screen canvas, lazily created, removed when idle. */

const COLORS = ['#de64a5', '#f2a9cc', '#a9bce6', '#f5d98f', '#cde9df', '#8fc4b7'];
const GRAVITY = 0.16;
const DRAG = 0.992;

let canvas = null;
let ctx = null;
let particles = [];
let raf = 0;

function ensureCanvas() {
  if (canvas) return;
  canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, {
    position: 'fixed', inset: '0', width: '100%', height: '100%',
    pointerEvents: 'none', zIndex: '90',
  });
  document.body.appendChild(canvas);
  ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  ctx.scale(dpr, dpr);
}

function teardown() {
  cancelAnimationFrame(raf);
  raf = 0;
  canvas?.remove();
  canvas = null;
  ctx = null;
}

function tick() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  particles = particles.filter((p) => p.life > 0 && p.y < innerHeight + 40);
  if (!particles.length) { teardown(); return; }

  for (const p of particles) {
    p.vx *= DRAG;
    p.vy = p.vy * DRAG + GRAVITY;
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;
    p.life -= 1;
    // flutter: oscillate apparent width as the piece tumbles
    const flutter = Math.sin(p.rot * 2 + p.phase);
    const alpha = Math.min(1, p.life / 30);

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    if (p.shape === 'heart') {
      const s = p.size * 0.55;
      ctx.beginPath();
      ctx.moveTo(0, s * 0.35);
      ctx.bezierCurveTo(s, -s * 0.6, s * 2.2, s * 0.5, 0, s * 1.8);
      ctx.bezierCurveTo(-s * 2.2, s * 0.5, -s, -s * 0.6, 0, s * 0.35);
      ctx.fill();
    } else {
      ctx.fillRect(-p.size / 2, (-p.size / 2) * flutter, p.size, p.size * flutter);
    }
    ctx.restore();
  }
  raf = requestAnimationFrame(tick);
}

/** Burst from a point (viewport px). Call from CTA press handlers. */
export function burst(x, y, count = 90) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  ensureCanvas();
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 3 + Math.random() * 9;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 4,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.35,
      phase: Math.random() * Math.PI * 2,
      size: 5 + Math.random() * 7,
      color: COLORS[(Math.random() * COLORS.length) | 0],
      shape: Math.random() < 0.18 ? 'heart' : 'rect',
      life: 90 + Math.random() * 60,
    });
  }
  if (!raf) raf = requestAnimationFrame(tick);
}

/** Convenience: burst from the center of an element. */
export function burstFrom(el, count) {
  const r = el.getBoundingClientRect();
  burst(r.left + r.width / 2, r.top + r.height / 2, count);
}
