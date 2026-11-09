/* Renders the FAQ accordion from js/content/faq.js into [data-faq],
   and adds the matching FAQPage schema so the same copy feeds Google.
   Native <details> sharing one `name`, so opening one closes the others;
   works with keyboard and screen readers out of the box. */

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

/* the .plus turns into a × when its question is open (css/faq.css) */
const item = ({ q, a }) => `
      <details class="faq-item" name="faq">
        <summary><span class="faq-q">${escape(q)}</span><span class="plus" aria-hidden="true">+</span></summary>
        <div class="faq-item__body">${paragraphs(a).map((p) => `<p>${escape(p)}</p>`).join('')}</div>
      </details>`;

export function initFaq() {
  const slot = document.querySelector('[data-faq]');
  if (!slot) return;
  slot.innerHTML = `<div class="faq-list">${faqs.map(item).join('')}</div>`;
  addSchema();
}
