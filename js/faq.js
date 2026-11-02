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

export function initFaq() {
  const list = document.querySelector('[data-faq]');
  if (!list) return;
  list.innerHTML = faqs
    .map(({ q, a }) => `
      <details class="faq-item reveal" name="faq">
        <summary>${escape(q)}</summary>
        <div class="faq-item__body">${paragraphs(a).map((p) => `<p>${escape(p)}</p>`).join('')}</div>
      </details>`)
    .join('');
  addSchema();
}
