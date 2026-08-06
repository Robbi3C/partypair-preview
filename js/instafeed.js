/* "From the gram" feed grid.

   Reads data/posts.json. Two entry kinds:
   - { embed: "<public post/reel URL>" } → native Instagram embed iframe.
     Videos play inline. Needs no login, API or token — the account is
     public. Refresh by pasting new post URLs into posts.json.
   - { image, caption, href } → local photo card (offline fallback, or
     the Behold JSON path if a live feed URL is configured later). */

const FEED_URL = 'data/posts.json';
const MAX_POSTS = 6;

function embedCard(url) {
  // Instagram's embed endpoint only accepts the canonical form
  // instagram.com/{p|reel}/{shortcode}/embed — strip any username prefix.
  const m = url.match(/\/(p|reel|tv)\/([A-Za-z0-9_-]+)/);
  if (!m) return '';
  const isReel = m[1] !== 'p';
  return `
    <div class="insta-embed ${isReel ? 'insta-embed--reel' : ''}">
      <iframe src="https://www.instagram.com/${m[1]}/${m[2]}/embed/" loading="lazy" allowfullscreen
        allow="autoplay; encrypted-media"
        title="Instagram ${isReel ? 'reel' : 'post'} from The Party Pair"></iframe>
    </div>`;
}

function photoCard(p, profileUrl) {
  const caption = (p.caption || '').split('\n')[0];
  return `
    <a class="photo-card insta-card" href="${p.href || profileUrl}" rel="noopener" aria-label="View this post on Instagram">
      <img src="${p.image}" alt="${caption.replace(/"/g, '&quot;')}" loading="lazy" width="600" height="750">
      <span class="insta-card__caption">${caption}</span>
    </a>`;
}

/* Instagram embed iframes postMessage their exact rendered height
   (type MEASURE) — the same mechanism their official embed.js uses.
   Applying it removes the aspect-ratio guess, so the social footer
   (likes, comments) is fully visible on every card, posts and reels alike. */
function initEmbedResize(grid) {
  window.addEventListener('message', (e) => {
    if (e.origin !== 'https://www.instagram.com') return;
    let msg;
    try { msg = typeof e.data === 'string' ? JSON.parse(e.data) : e.data; } catch { return; }
    if (msg?.type !== 'MEASURE' || !msg.details?.height) return;
    for (const frame of grid.querySelectorAll('.insta-embed iframe')) {
      if (frame.contentWindow === e.source) {
        frame.style.aspectRatio = 'auto';
        frame.style.height = msg.details.height + 'px';
        break;
      }
    }
  });
}

function initCarousel(grid) {
  const wrap = grid.closest('.insta-carousel');
  if (!wrap) return;
  const prev = wrap.querySelector('.insta-carousel__btn--prev');
  const next = wrap.querySelector('.insta-carousel__btn--next');
  const step = () => (grid.firstElementChild?.getBoundingClientRect().width || 300) + 22;

  prev?.addEventListener('click', () => grid.scrollBy({ left: -step(), behavior: 'smooth' }));
  next?.addEventListener('click', () => grid.scrollBy({ left: step(), behavior: 'smooth' }));

  const sync = () => {
    if (prev) prev.disabled = grid.scrollLeft < 10;
    if (next) next.disabled = grid.scrollLeft > grid.scrollWidth - grid.clientWidth - 10;
  };
  grid.addEventListener('scroll', sync, { passive: true });
  sync();
}

export async function initInstaFeed() {
  const grid = document.getElementById('insta-grid');
  if (!grid) return;
  try {
    const res = await fetch(FEED_URL);
    const data = await res.json();
    const posts = (data.posts || []).slice(0, MAX_POSTS);
    if (posts.length) {
      grid.innerHTML = posts
        .map((p) => p.embed ? embedCard(p.embed) : (p.image ? photoCard(p, data.profileUrl) : ''))
        .join('');
    }
  } catch {
    /* feed unreachable — the static markup stays in place */
  }
  initEmbedResize(grid);
  initCarousel(grid);
}
