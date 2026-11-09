/* Renders the FAQ accordion from js/content/faq.js into [data-faq],
   and adds the matching FAQPage schema so the same copy feeds Google.
   Native <details> sharing one `name`, so opening one closes the others;
   works with keyboard and screen readers out of the box.

   Preview layouts (FAQ switch on the section, js/look-switch.js →
   html[data-faqv="…"]: nowb, 1, 1b, 2–4, 4b, 5; css/faq-variants.css). The flag is data-faqv,
   not data-faq, so it never collides with the [data-faq] slot.
   Two lists are rendered: the plain list (every layout but 3) and the
   same questions filed under their topics (layout 3). The schema is
   added once. */

import { faqs } from './content/faq.js';

const escape = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const paragraphs = (a) => [].concat(a);

function addSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: paragraphs(a).join(' ') },
    })),
  };
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

/* the .faq-icon span is drawn by css/faq-variants.css (a plus that
   becomes a minus, or a caret that flips); the current design keeps its
   own "+" and hides it */
const item = ({ q, a }, name) => `
      <details class="faq-item reveal" name="${name}">
        <summary><span class="faq-q">${escape(q)}</span><span class="faq-icon" aria-hidden="true"></span></summary>
        <div class="faq-item__body">${paragraphs(a).map((p) => `<p>${escape(p)}</p>`).join('')}</div>
      </details>`;

function grouped() {
  const topics = [...new Set(faqs.map((f) => f.group))];
  return topics.map((t) => `
    <div class="faq-group">
      <h3 class="faq-group__title">${escape(t)}</h3>
      ${faqs.filter((f) => f.group === t).map((f) => item(f, 'faq-grouped')).join('')}
    </div>`).join('');
}

export function initFaq() {
  const slot = document.querySelector('[data-faq]');
  if (!slot) return;
  slot.innerHTML = `
    <div class="faq-list">${faqs.map((f) => item(f, 'faq')).join('')}</div>
    <div class="faq-groups">${grouped()}</div>`;
  addSchema();
}
