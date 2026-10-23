// Blog home: filter posts by marketing pillar (data-pillar on each .post-card) and search by text.
// Non-matching cards are taken out of the list rather than hidden, so the CSS nth-child rules
// (featured first card, colour cycle, wide last card) still apply to what's showing.
// ?topic=<pillar> and ?q=<text> in the URL preselect a filter, e.g. for links from social posts.
(function () {
  var list = document.querySelector('.post-list');
  var bar = document.querySelector('.blog-filter');
  if (!list || !bar) return;

  var cards = Array.prototype.slice.call(list.querySelectorAll('.post-card'));
  var chips = Array.prototype.slice.call(bar.querySelectorAll('[data-topic]'));
  var search = bar.querySelector('input[type="search"]');
  var empty = document.querySelector('.post-empty');
  var count = bar.querySelector('.filter-count');
  var params = new URLSearchParams(location.search);
  var topic = params.get('topic') || 'all';

  // hide pillars that have no posts yet (e.g. Christmas before November)
  chips.forEach(function (chip) {
    var t = chip.getAttribute('data-topic');
    if (t !== 'all' && !cards.some(function (c) { return (c.getAttribute('data-pillar') || '').split(' ').indexOf(t) > -1; })) chip.hidden = true;
  });
  if (!chips.some(function (c) { return !c.hidden && c.getAttribute('data-topic') === topic; })) topic = 'all';
  if (params.get('q')) search.value = params.get('q');

  function apply() {
    var q = search.value.trim().toLowerCase();
    var shown = 0;
    cards.forEach(function (card) {
      var pillars = (card.getAttribute('data-pillar') || '').split(' ');
      var ok = (topic === 'all' || pillars.indexOf(topic) > -1) && (!q || card.textContent.toLowerCase().indexOf(q) > -1);
      if (ok) { list.appendChild(card); shown++; } else if (card.parentNode) card.parentNode.removeChild(card);
    });
    chips.forEach(function (chip) { chip.setAttribute('aria-pressed', String(chip.getAttribute('data-topic') === topic)); });
    empty.hidden = shown > 0;
    count.textContent = shown === cards.length ? '' : shown + ' of ' + cards.length + ' posts';
    var p = new URLSearchParams(location.search);
    if (topic === 'all') p.delete('topic'); else p.set('topic', topic);
    if (q) p.set('q', search.value.trim()); else p.delete('q');
    var qs = p.toString();
    history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () { topic = chip.getAttribute('data-topic'); apply(); });
  });
  search.addEventListener('input', apply);
  empty.querySelector('button').addEventListener('click', function () { topic = 'all'; search.value = ''; apply(); search.focus(); });

  bar.hidden = false;
  apply();
})();
