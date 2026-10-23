/* Brickify homepage behaviour: the hero diagonal and the smartphone-to-brick phone animation.
   The phone menu is shared by every page and lives in /assets/site.js. */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Hero split: teal above, brick below, a stepped line always running between the two headline halves ---- */
  var hero = document.querySelector('.bk-hero');
  var brickBg = hero && hero.querySelector('.bk-pink');
  var half1 = hero && hero.querySelector('.bk-line-1'), half2 = hero && hero.querySelector('.bk-line-2');
  function textBox(el) { var r = document.createRange(); r.selectNodeContents(el); return r.getBoundingClientRect(); }
  function fitDiagonal() {
    var h = hero.getBoundingClientRect(), W = h.width, H = h.height;
    if (!W || !H) return;
    var N = W >= 900 ? 6 : 4;                           // brick-course steps across the hero
    var m = 12 + H * (W >= 900 ? 0.32 : 0.22) / (2 * N); // the steps sit up to half a riser off the line
    var a = textBox(half1), b = textBox(half2);
    var b1 = a.bottom - h.top, x1L = a.left - h.left;   // the line must pass below "Smartphone…" (worst at its left edge)
    var t2 = b.top - h.top, x2R = b.right - h.left;     // and above "…brick phone" (worst at its right edge)
    var dy = H * (W >= 900 ? 0.32 : 0.22);              // the designed slope, flattened only if it can't fit
    var room = t2 - b1 - 2 * m, span = Math.max(1, x2R - x1L);
    if (dy * span / W > room) dy = Math.max(0, room * W / span);
    var yL = ((b1 + m - dy * x1L / W) + (t2 - m - dy * x2R / W)) / 2;
    // a staircase along that line: each tread sits at the line's height at its midpoint
    var pts = [];
    for (var i = 0; i < N; i++) {
      var y = (yL + dy * (i + .5) / N).toFixed(1) + 'px';
      pts.push((100 * i / N).toFixed(2) + '% ' + y, (100 * (i + 1) / N).toFixed(2) + '% ' + y);
    }
    brickBg.style.clipPath = 'polygon(' + pts.join(',') + ',100% 100%,0 100%)';
  }
  if (hero && brickBg && half1 && half2) {
    fitDiagonal();
    if (window.ResizeObserver) new ResizeObserver(fitDiagonal).observe(hero);
    else window.addEventListener('resize', fitDiagonal);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitDiagonal);
  }

  /* ---- Phone animation ---- */
  var phone = document.getElementById('bk-phone');
  if (!phone) return;
  var chip = document.getElementById('bk-chip');
  var apps = phone.querySelector('.bk-apps');
  var dock = phone.querySelectorAll('.bk-dock i');
  var wall = phone.querySelector('.bk-wall');
  var tags = Array.prototype.slice.call(phone.querySelectorAll('.bk-tag'));
  var appCols = ['#F4E8D6', '#FFD166', '#7F3F2D', '#ffffff', '#2E3A38', '#F7A8C4', '#1C7B77', '#D9733F',
                 '#ffffff', '#B65A3D', '#FFE3A3', '#C23C6F', '#8FD3CE', '#2E3A38', '#F4E8D6', '#E2558A'];
  appCols.forEach(function (c) { var i = document.createElement('i'); i.style.background = c; apps.appendChild(i); });
  ['#ffffff', '#FFD166', '#7F3F2D', '#1C7B77'].forEach(function (c, k) { dock[k].style.background = c; });

  function setChip(brick) {
    if (!chip) return;
    chip.innerHTML = brick ? '<b>8:30pm</b> Brick phone' : '<b>4:00pm</b> Smartphone';
    chip.classList.toggle('is-brick', brick);
  }
  if (reduce) { phone.classList.add('is-bricked'); setChip(true); return; }

  var ROWS = 13, shades = ['#C8623A', '#B5532F', '#D9733F', '#A94B2B', '#CF6A3B'];
  var bricks = [];
  for (var r = 0; r < ROWS; r++) {
    var row = document.createElement('div'); row.className = 'bk-row';
    for (var b = 0; b < 4; b++) {
      var el = document.createElement('div'); el.className = 'bk-brick';
      el.style.setProperty('--c', shades[(r * 3 + b) % shades.length]);
      row.appendChild(el); bricks.push({ el: el, row: r });
    }
    wall.appendChild(row);
  }
  function wait(ms) { return new Promise(function (res) { setTimeout(res, ms); }); }
  function build() {
    return Promise.all(bricks.map(function (b, i) {
      var fromBottom = ROWS - 1 - b.row;
      return b.el.animate([{ transform: 'translateY(-260%)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }],
        { duration: 340, delay: fromBottom * 95 + (i % 4) * 30, easing: 'cubic-bezier(.3,1.35,.6,1)', fill: 'forwards' }).finished;
    }));
  }
  // the benefit callouts land with the wall, stay while the phone is bricked, and drop away when it opens again
  function tagsIn() {
    return Promise.all(tags.map(function (t, i) {
      return t.animate([{ transform: 'translateY(-320%)', opacity: 0 }, { transform: 'none', opacity: 1 }],
        { duration: 420, delay: 500 + i * 260, easing: 'cubic-bezier(.3,1.5,.6,1)', fill: 'forwards' }).finished;
    }));
  }
  function tagsOut() {
    return Promise.all(tags.map(function (t, i) {
      return t.animate([{ transform: 'none', opacity: 1 }, { transform: 'translateY(260%)', opacity: 0 }],
        { duration: 480, delay: i * 70, easing: 'cubic-bezier(.5,0,.9,.5)', fill: 'forwards' }).finished;
    }));
  }
  function tumble() {
    return Promise.all(bricks.map(function (b, i) {
      var dx = (Math.random() - .5) * 120, rot = (Math.random() - .5) * 70;
      return b.el.animate([{ transform: 'translate(0,0) rotate(0)', opacity: 1 },
                           { transform: 'translate(' + dx + '%,' + (420 + Math.random() * 200) + '%) rotate(' + rot + 'deg)', opacity: 0 }],
        { duration: 620, delay: (b.row * 22) + Math.random() * 120, easing: 'cubic-bezier(.5,0,.9,.5)', fill: 'forwards' }).finished;
    }));
  }
  tags.forEach(function (t) { t.style.opacity = '0'; });
  var running = true;
  document.addEventListener('visibilitychange', function () { running = !document.hidden; });
  async function loop() {
    while (true) {
      phone.classList.remove('is-bricked'); setChip(false);
      tagsOut();
      await wait(2200);
      await Promise.all([build(), tagsIn()]);
      phone.classList.add('is-bricked'); setChip(true);
      await wait(150);
      await tumble();
      await wait(3600);
      while (!running) await wait(500);
    }
  }
  loop();
})();
