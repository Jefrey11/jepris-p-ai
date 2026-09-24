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
  var P = {"frameW":512,"frameH":554,"cols":8,"count":45,"gaze":[[0.0,0.0],[-0.149,0.248],[-0.345,0.523],[-0.601,0.63],[-0.774,0.378],[-0.835,0.225],[-0.883,0.013],[-0.809,-0.16],[-0.811,-0.213],[-0.799,-0.247],[-0.784,-0.371],[-0.792,-0.322],[-0.798,-0.312],[-0.793,-0.353],[-0.81,-0.333],[-0.811,-0.324],[-0.938,-0.158],[-0.964,-0.058],[-0.997,0.393],[-0.939,0.839],[-0.882,0.949],[-0.715,0.614],[-0.587,0.13],[-0.443,0.291],[-0.228,0.261],[0.007,0.091],[0.162,0.119],[0.416,0.442],[0.682,0.585],[0.804,0.475],[0.983,0.195],[0.95,0.283],[0.718,0.366],[0.591,0.426],[0.28,0.417],[0.111,0.351],[-0.191,0.284],[-0.419,0.338],[-0.582,0.38],[-0.44,0.258],[-0.244,-0.51],[-0.183,-0.87],[-0.037,-0.127],[0.056,0.629],[0.001,-0.007]],"sourceFrames":[0,20,22,24,26,27,28,29,30,31,34,36,41,42,43,44,45,46,48,51,67,72,86,96,99,103,119,123,126,128,134,150,153,154,156,157,159,161,165,178,182,194,199,206,239],"anchor":{"x":0.4971,"y":0.3513}};
  var SKIP = [2, 3, 4, 20];                /* squint and blink frames */
  var path = [];                           /* usable sprite slots, in clip order */
  for (var i = 0; i < P.count; i++) if (SKIP.indexOf(i) < 0) path.push(i);

  var head = 0, goal = 0, shown = 0, from = 0, fade = 1, tu = 0, tv = 0, lastInput = -1e9, visible = true, running = false, prev = 0;
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
  function score(k, u, v) {
    var g = P.gaze[path[k]], du = g[0] - u, dv = g[1] - v;
    return du * du + 0.12 * dv * dv + 0.003 * Math.abs(k - head);
  }
  function bestIndex(u, v) {               /* pose that matches the gaze, preferring ones near the playhead */
    var bi = goal, bs = score(goal, u, v) - 0.01;   /* small hysteresis so it does not flicker */
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
    var diff = goal - head;
    var speed = Math.min(20, 3 + Math.abs(diff) * 4);        /* poses per second, walking the clip */
    head += Math.sign(diff) * Math.min(Math.abs(diff), speed * dt);
    var k = Math.round(head);
    if (k !== shown) { from = shown; shown = k; fade = 0; }
    fade = Math.min(1, fade + dt / 0.09);                     /* short cross-fade between whole poses */
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
