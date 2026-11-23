// Palette preview switcher (owner feedback: coastal blues + hydrangeas).
// Loaded as a classic script in <head> so the chosen palette is applied
// before first paint. Choice comes from ?palette=… then localStorage.
// Remove with css/palettes.css once a palette is picked.
(function () {
  var OPTIONS = [
    { id: '', name: 'Current', chips: ['#de4f96', '#ea9cc0', '#a2ccc6'] },
    { id: 'mophead', name: '1 · Mophead', chips: ['#423c82', '#c0bfea', '#f9e0ea', '#afc4b2'], hidden: true },   // off the bar; ?palette=mophead still works
    { id: 'pastel', name: '2 · Pastel', chips: ['#ab366e', '#f8bdd8', '#fde1ed', '#aad9d2'] },
    { id: 'harbor', name: '3 · Harbor & Hydrangea', chips: ['#18365b', '#b1c6e2', '#f8e3ea', '#b1c4b4'] },
    { id: 'coast', name: '4 · Pastel Coast', chips: ['#ab366e', '#f8bdd8', '#c0d8f8', '#e8f1fc'] },
  ];
  var KEY = 'pp-palette';
  var root = document.documentElement;
  var valid = function (id) { return OPTIONS.some(function (o) { return o.id === id; }); };

  function read() {
    var fromUrl = new URLSearchParams(location.search).get('palette');
    if (fromUrl !== null && valid(fromUrl)) return fromUrl;
    try { var s = localStorage.getItem(KEY); if (s !== null && valid(s)) return s; } catch (e) {}
    return '';
  }

  function apply(id) {
    if (id) root.setAttribute('data-palette', id);
    else root.removeAttribute('data-palette');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = getComputedStyle(root).getPropertyValue('--cream').trim() || '#fbf5ec';
  }

  var current = read();
  apply(current);
  root.classList.add('has-pal-bar');

  document.addEventListener('DOMContentLoaded', function () {
    var bar = document.createElement('div');
    bar.className = 'pal-bar';
    bar.setAttribute('role', 'toolbar');
    bar.setAttribute('aria-label', 'Colour palette preview');
    bar.innerHTML = '<span class="pal-bar__label">Palette preview</span>';

    OPTIONS.filter(function (o) { return !o.hidden; }).forEach(function (o) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-pressed', String(o.id === current));
      b.innerHTML = '<span class="pal-bar__chips">' +
        o.chips.map(function (c) { return '<i style="background:' + c + '"></i>'; }).join('') +
        '</span>' + o.name;
      b.addEventListener('click', function () {
        current = o.id;
        apply(current);
        try { localStorage.setItem(KEY, current); } catch (e) {}
        var url = new URL(location.href);
        if (current) url.searchParams.set('palette', current); else url.searchParams.delete('palette');
        history.replaceState(null, '', url);
        bar.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      });
      bar.appendChild(b);
    });
    document.body.prepend(bar);
  });
})();
