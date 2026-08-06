/* Scroll behaviors: reveal-on-scroll, header hide/show, sticky mobile CTA. */

export function initScrollEffects() {
  // Reveal elements as they enter the viewport.
  // Hidden documents (background tabs, prerender, print) throttle
  // IntersectionObserver and transitions — show everything at once there.
  const revealables = document.querySelectorAll('.reveal');
  if (document.hidden) {
    revealables.forEach((el) => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealables.forEach((el) => io.observe(el));
  }

  // Header: hide when scrolling down, show when scrolling up
  const header = document.querySelector('.site-header');
  let lastY = scrollY;
  let ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = scrollY;
      if (header) {
        header.classList.toggle('is-hidden', y > lastY && y > 300);
      }
      lastY = y;
      ticking = false;
    });
  }, { passive: true });

  // Sticky mobile CTA appears once the hero is scrolled past,
  // and hides near the footer (the finale section has its own CTA)
  const sticky = document.querySelector('.sticky-cta');
  const hero = document.querySelector('.hero') || document.querySelector('.guide-hero');
  const footer = document.querySelector('.site-footer');
  if (sticky && hero) {
    let heroGone = false;
    let footerNear = false;
    const update = () => sticky.classList.toggle('is-visible', heroGone && !footerNear);
    new IntersectionObserver(([e]) => { heroGone = !e.isIntersecting; update(); }, { threshold: 0.15 })
      .observe(hero);
    if (footer) {
      new IntersectionObserver(([e]) => { footerNear = e.isIntersecting; update(); })
        .observe(footer);
    }
  }
}
