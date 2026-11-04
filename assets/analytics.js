/* Rain or Shine Apps — Google Analytics 4 with opt-in consent.
   Nothing is loaded and no cookies are set until the visitor clicks Accept.
   Each app has its own GA4 property, chosen by <body data-app="...">. Pages whose app has
   no ID listed here show no banner and send nothing. Loaded with `defer`, so <body> exists.
   Also loads Umami for everyone: cookieless (nothing stored on the device), so it needs no
   banner. Described in /website-privacy.html. */
(function () {
  var um = document.createElement('script');
  um.defer = true;
  um.src = 'https://cloud.umami.is/script.js';
  um.setAttribute('data-website-id', 'e0d84b60-73f0-4238-8816-88b297d3b799');
  um.setAttribute('data-domains', 'brickifymysmartph.one'); // local previews don't count
  document.head.appendChild(um);
  function umTrack(name, data) { if (window.umami) window.umami.track(name, data); }

  var GA_IDS = {
    brickify: 'G-4P3DCEHQSD'
  };
  var GA_ID = GA_IDS[document.body && document.body.getAttribute('data-app')] || '';
  var KEY = 'ros-analytics-consent'; // 'granted' | 'denied'
  var enabled = /^G-[A-Z0-9]{6,}$/.test(GA_ID);

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  function getChoice() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function setChoice(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  var loaded = false;
  function loadGA() {
    if (!enabled || loaded) return;
    loaded = true;
    gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    gtag('js', new Date());
    gtag('config', GA_ID, { anonymize_ip: true });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
  }

  function clearGACookies() {
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (/^_ga/.test(name)) {
        var host = location.hostname.replace(/^www\./, '');
        ['', '; domain=' + host, '; domain=.' + host].forEach(function (d) {
          document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + d;
        });
      }
    });
  }

  function showBanner() {
    if (document.querySelector('.consent')) return;
    var el = document.createElement('div');
    el.className = 'consent';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Cookie preferences');
    el.innerHTML =
      '<p><strong>Can we use Google Analytics?</strong> We’d like to use Google Analytics cookies to see which pages help people most. ' +
      'This covers this website only, not our apps. You can change your mind any time from “Cookie settings” at the bottom of the page. ' +
      '<a href="/website-privacy.html">Privacy policy</a></p>' +
      '<div class="consent-actions">' +
      '<button type="button" class="btn btn-ghost btn-sm" data-consent="denied">No thanks</button>' +
      '<button type="button" class="btn btn-sm" data-consent="granted">Accept</button>' +
      '</div>';
    el.addEventListener('click', function (e) {
      var v = e.target.getAttribute && e.target.getAttribute('data-consent');
      if (!v) return;
      var previous = getChoice();
      setChoice(v);
      el.remove();
      if (v === 'granted') loadGA();
      else if (previous === 'granted') { clearGACookies(); location.reload(); }
    });
    document.body.appendChild(el);
  }

  function track(name, params) { if (loaded) gtag('event', name, params); }

  function init() {
    // Store badge clicks: <a data-store="ios|android"> inside elements with data-location and data-app
    // (data-app falls back to <body data-app>).
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('[data-store]');
      if (!a) return;
      var loc = a.closest('[data-location]');
      var params = {
        store: a.getAttribute('data-store'),
        app: (a.closest('[data-app]') || document.body).getAttribute('data-app') || 'site',
        location: loc ? loc.getAttribute('data-location') : 'other'
      };
      track('store_click', params);
      umTrack('store_click', params);
    });

    // Every other link click, for Umami's click count (store badges are counted above).
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || a.closest('[data-store]')) return;
      umTrack('click', {
        text: (a.textContent || a.getAttribute('aria-label') || '').trim().slice(0, 60),
        href: a.getAttribute('href').slice(0, 200)
      });
    });

    document.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('[data-cookie-settings]')) { e.preventDefault(); showBanner(); }
    });

    if (!enabled) return;
    var choice = getChoice();
    if (choice === 'granted') loadGA();
    else if (choice !== 'denied') showBanner();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
