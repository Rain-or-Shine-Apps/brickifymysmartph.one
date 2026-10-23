/* Brickify blog step slider: arrows, numbered dots, swipe and arrow keys for every .step-slider on the page. */
(function () {
  document.querySelectorAll('.step-slider').forEach(function (root) {
    var track = root.querySelector('.slider-track');
    var slides = track.querySelectorAll('.slide');
    var prev = root.querySelector('.arrow.prev'), next = root.querySelector('.arrow.next');
    var dotsBox = root.querySelector('.slider-dots');
    var dots = [];
    slides.forEach(function (s, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.textContent = i + 1;
      b.setAttribute('aria-label', 'Go to step ' + (i + 1));
      b.addEventListener('click', function () { go(i); });
      dotsBox.appendChild(b); dots.push(b);
    });
    function current() { return Math.round(track.scrollLeft / track.clientWidth); }
    function go(i) { track.scrollTo({ left: i * track.clientWidth }); }
    function update() {
      var i = Math.min(slides.length - 1, Math.max(0, current()));
      prev.disabled = i === 0; next.disabled = i === slides.length - 1;
      dots.forEach(function (d, j) { d.setAttribute('aria-current', j === i ? 'true' : 'false'); });
      slides.forEach(function (s, j) { s.setAttribute('aria-hidden', j === i ? 'false' : 'true'); s.inert = j !== i; });
    }
    prev.addEventListener('click', function () { go(Math.max(0, current() - 1)); });
    next.addEventListener('click', function () { go(Math.min(slides.length - 1, current() + 1)); });
    track.addEventListener('scroll', function () { window.requestAnimationFrame(update); }, { passive: true });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); next.click(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev.click(); }
    });
    window.addEventListener('resize', function () { go(current()); });
    update();
  });
})();
