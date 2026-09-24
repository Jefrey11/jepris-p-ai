/* JEPRIS-P AI: page motion + hero robot (a real clip cut into 45 poses; the pointer picks the pose). */
(function () {
  document.documentElement.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* scroll reveal */
  var sel = '.section-head, .svc-card, .panel, .diff-row, .about-lede, .service-card, .capability-card, .process-card, .why-card, .quickfacts, .fit-list, .contact-block, .close-block';
  if (!reduce && 'IntersectionObserver' in window) {
    var ro = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -6% 0px' });
    document.querySelectorAll(sel).forEach(function (el, i) {
      el.classList.add('rv'); el.style.transitionDelay = (i % 4) * 70 + 'ms'; ro.observe(el);
    });
  }

  /* card tilt on hover (fine pointers only) */
  if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.svc-card, .panel, .service-card, .capability-card, .process-card, .why-card, .preview-item').forEach(function (c) {
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transitionDelay = '0ms';
        c.style.transform = 'perspective(900px) rotateX(' + (-y * 4).toFixed(2) + 'deg) rotateY(' + (x * 5).toFixed(2) + 'deg) translateY(-3px)';
      });
      c.addEventListener('pointerleave', function () { c.style.transform = ''; });
    });
  }

  /* robot */
  var box = document.querySelector('.hero-bot');
  if (!box || reduce) return;              /* reduced motion keeps the static poster */
  var cv = box.querySelector('canvas'), ctx = cv.getContext('2d');
  var P = __POSES__;
  var SKIP = [2, 3, 4, 20];                /* squint and blink frames */
  var path = [];                           /* usable sprite slots, in clip order */
  for (var i = 0; i < P.count; i++) if (SKIP.indexOf(i) < 0) path.push(i);

  var goal = 0, shown = 0, from = 0, fade = 1, dur = 0.1, tu = 0, tv = 0, lastInput = -1e9, visible = true, running = false, prev = 0;
  var img = new Image();
  img.decoding = 'async';

  function fit() {
    var r = cv.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(r.width * d); cv.height = Math.round(r.height * d);
  }
  function aim(x, y) {                     /* screen point -> gaze target in [-1, 1] */
    var r = cv.getBoundingClientRect();
    var ax = r.left + r.width * P.anchor.x, ay = r.top + r.height * P.anchor.y;
    tu = Math.max(-1, Math.min(1, (x - ax) / Math.max(240, r.width * 0.85)));
    tv = Math.max(-1, Math.min(1, (y - ay) / Math.max(240, r.height * 0.85)));
    lastInput = performance.now();
    box.classList.add('moved');
  }
  function score(k, u, v) {               /* P.look = measured pupil direction of each pose */
    var g = P.look[path[k]], du = g[0] - u, dv = g[1] - 0.6 * v;   /* the clip's up/down eye range is small */
    return 1.6 * du * du + dv * dv;        /* left/right matters most: the clip has few up/down looks */
  }
  function bestIndex(u, v) {
    var bi = goal, bs = score(goal, u, v) - 0.03;   /* hysteresis so it does not flicker */
    for (var k = 0; k < path.length; k++) { var s = score(k, u, v); if (s < bs) { bs = s; bi = k; } }
    return bi;
  }
  function slot(k, a) {
    var s = path[k], c = s % P.cols, r = (s / P.cols) | 0;
    ctx.globalAlpha = a;
    ctx.drawImage(img, c * P.frameW, r * P.frameH, P.frameW, P.frameH, 0, 0, cv.width, cv.height);
  }
  function frame(t) {
    if (!visible) { running = false; return; }
    var dt = Math.min(0.05, Math.max(0.001, (t - prev) / 1000)); prev = t;
    if (t - lastInput > 2600) {            /* idle: let the gaze wander slowly */
      var s = t / 1000;
      tu = 0.85 * Math.sin(s * 0.42); tv = 0.3 * Math.sin(s * 0.63 + 1.3);
    }
    goal = bestIndex(tu, tv);
    if (fade >= 1 && shown !== goal) {     /* short hops play the clip; long ones cut straight to the pose */
      var d = goal - shown, near = Math.abs(d) <= 3;
      from = shown; shown = near ? shown + Math.sign(d) : goal; fade = 0; dur = near ? 0.06 : 0.14;
    }
    fade = Math.min(1, fade + dt / dur);
    ctx.clearRect(0, 0, cv.width, cv.height);
    if (fade < 1) slot(from, 1);
    slot(shown, fade < 1 ? fade : 1);
    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }
  function start() {
    if (!running && visible && img.complete && img.naturalWidth) { running = true; prev = performance.now(); requestAnimationFrame(frame); }
  }

  img.onload = function () { fit(); box.classList.add('live'); start(); };
  img.src = box.getAttribute('data-sprite');
  window.addEventListener('resize', fit);
  window.addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse') aim(e.clientX, e.clientY); }, { passive: true });
  window.addEventListener('pointerdown', function (e) { aim(e.clientX, e.clientY); }, { passive: true });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting && !document.hidden; start(); }).observe(box);
  }
  document.addEventListener('visibilitychange', function () { visible = !document.hidden; start(); });
})();
