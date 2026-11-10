/* Shared page chrome: header + mobile menu, footer, sticky mobile CTA
   and the inquiry modal. Each page marks where they go with
   <div data-partial="header|footer"></div>; the modal and sticky CTA are
   appended to <body>. Content comes from js/content/site.js.

   Pages without slots (the archived /original/ page) are left untouched.
   Netlify can't see JS-rendered forms, so netlify-forms.html carries a
   hidden copy of the inquiry form for its deploy-time scan. */

import { site } from './content/site.js';

const page = () => document.body.dataset.page || '';

const brand = () => `
  <a class="brand" href="./"><img class="brand__pear" src="assets/img/pear.svg" alt="" width="90" height="100"><span>The Party <em>Pair</em></span></a>`;

function navLinks(items = site.nav) {
  return items
    .map(({ id, label, href }) => `<a href="${href}"${id === page() ? ' aria-current="page"' : ''}>${label}</a>`)
    .join('');
}

function header() {
  return `
  <header class="site-header">
    <div class="site-header__inner">
      ${brand()}
      <nav class="site-nav" aria-label="Main">${navLinks()}</nav>
      <div class="site-header__actions">
        <button class="btn btn--primary" data-open-inquiry>${site.cta}</button>
        <button class="menu-toggle" aria-expanded="false" aria-controls="site-menu" aria-label="Menu">
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
            <path class="menu-toggle__top" d="M4 8.5h16" />
            <path class="menu-toggle__bottom" d="M4 15.5h16" />
          </svg>
          <span class="menu-toggle__label" aria-hidden="true">Menu</span>
        </button>
      </div>
    </div>
    <nav class="site-menu" id="site-menu" aria-label="Main" inert>
      ${navLinks()}
      <div class="site-menu__cta"><button class="btn btn--primary btn--lg" data-open-inquiry>${site.cta}</button></div>
    </nav>
  </header>`;
}

function footer() {
  return `
  <footer class="site-footer">
    <div class="container site-footer__grid">
      <div>
        ${brand()}
        <p class="site-footer__blurb">${site.blurb}</p>
      </div>
      <div>
        <p class="footer-title">Explore</p>
        <ul>${site.nav.map(({ label, href }) => `<li><a href="${href}">${label}</a></li>`).join('')}</ul>
      </div>
      <div>
        <p class="footer-title">Say hi</p>
        <ul>
          <li><a href="mailto:${site.email}">${site.email}</a></li>
          <li><a href="${site.instagram}" rel="noopener">Instagram</a></li>
        </ul>
      </div>
    </div>
    <div class="container fineprint">
      <p>© ${new Date().getFullYear()} ${site.name} · ${site.fineprint}</p>
    </div>
  </footer>`;
}

const stickyCta = () => `
  <div class="sticky-cta">
    <button class="btn btn--primary" data-open-inquiry>${site.cta}</button>
  </div>`;

const inquiryModal = () => `
  <dialog class="modal" id="inquiry-modal" aria-labelledby="inquiry-title">
    <div class="modal__body">
      <button class="modal__close" aria-label="Close">
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </button>
      <h2 id="inquiry-title" class="modal__title">Let's see if your weekend is open</h2>
      <p class="modal__lead">Tell us your weekend — we'll come back within 24 hours with availability and ideas. Two minutes, promise.</p>
      <form id="inquiry-form" class="modal__form" name="weekend-inquiry" method="POST" data-netlify="true">
        <input type="hidden" name="form-name" value="weekend-inquiry">
        <div class="field field--wide">
          <label for="inq-name">Your full name</label>
          <input id="inq-name" name="name" type="text" required autocomplete="name" placeholder="Sam Rivera">
        </div>
        <div class="field">
          <label for="inq-email">Email</label>
          <input id="inq-email" name="email" type="email" required autocomplete="email" placeholder="you@email.com">
        </div>
        <div class="field">
          <label for="inq-phone">Phone number</label>
          <input id="inq-phone" name="phone" type="tel" required autocomplete="tel" placeholder="(508) 555-0123">
        </div>
        <div class="field">
          <label for="inq-date">Event date</label>
          <input id="inq-date" name="date" type="date" required>
        </div>
        <div class="field">
          <label for="inq-guests">How many people</label>
          <input id="inq-guests" name="guests" type="number" required min="1" step="1" inputmode="numeric" placeholder="12">
        </div>
        <div class="field field--wide">
          <label for="inq-details">What you're looking for <span class="field__optional">(optional)</span></label>
          <textarea id="inq-details" name="details" rows="3" placeholder="Tell us what you're looking for and any special details!"></textarea>
        </div>
        <div class="modal__actions">
          <button class="btn btn--primary btn--lg" type="submit">Check availability</button>
          <p class="form-note">Sending this means you're okay with us texting you back — that's it, no strings. Message &amp; data rates may apply.</p>
        </div>
      </form>
    </div>
  </dialog>`;

const slots = { header, footer };

export function renderChrome() {
  const found = document.querySelectorAll('[data-partial]');
  if (!found.length) return;
  for (const slot of found) {
    const render = slots[slot.dataset.partial];
    if (render) slot.outerHTML = render();
  }
  document.body.insertAdjacentHTML('beforeend', stickyCta() + inquiryModal());
}
