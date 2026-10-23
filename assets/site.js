/* Rain or Shine Apps — shared page behaviour. */
(function () {
  // Put the visitor's own store badge first and give it a soft highlight. Both badges stay visible.
  var ua = navigator.userAgent || '';
  var isIOS = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  var platform = isIOS ? 'ios' : /Android/.test(ua) ? 'android' : null;
  if (!platform) return;

  function apply() {
    document.querySelectorAll('.badges').forEach(function (group) {
      var match = group.querySelector('[data-store="' + platform + '"]');
      if (!match) return;
      group.insertBefore(match, group.firstChild);
      match.classList.add('is-suggested');
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply);
  else apply();
})();

(function () {
  // Phone menu: the button toggles the nav it controls; picking a link, Escape or a tap outside closes it.
  function init() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = toggle && document.getElementById(toggle.getAttribute('aria-controls'));
    if (!nav) return;
    function setOpen(open) {
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
    }
    toggle.addEventListener('click', function () { setOpen(toggle.getAttribute('aria-expanded') !== 'true'); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { setOpen(false); toggle.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('is-open') && !nav.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
