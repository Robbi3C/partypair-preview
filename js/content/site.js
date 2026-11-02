/* Site-wide content: navigation, contact details, CTA wording.
   Edit here and every page's header, mobile menu and footer updates.

   `id` matches <body data-page="…"> so the current page is highlighted.
   Menu = The Moment, Partners, Services, Itineraries. */

export const site = {
  name: 'The Party Pair',
  email: 'partypairinfo@gmail.com',
  instagram: 'https://www.instagram.com/partypairdecorations/',
  cta: 'Check your weekend',
  blurb: 'Pre-arrival bachelorette décor & concierge — helping bachelorette group chats across Cape Cod & beyond.',
  fineprint: 'Cape Cod, Massachusetts. Styled with love and an unreasonable number of balloons.',

  nav: [
    { id: 'home',      label: 'The Moment',       href: './' },
    { id: 'partners',  label: 'Partners',         href: 'partners.html' },
    { id: 'services',  label: 'Services',         href: 'services.html' },
    { id: 'itineraries', label: 'Itineraries',    href: 'itineraries.html' },
  ],
};
