/* ============================================================
   JWH Decorating — site scripts (no dependencies)
   1. Header + mobile menu
   2. Scroll reveals
   3. Hero roller (paints real jobs onto the wall)
   4. Services explorer
   5. Gallery lightbox
   6. Quote form validation
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  var year = $('[data-year]');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- 1. Header + mobile menu ---------- */
  var header = $('.site-header');
  var onScroll = function () { header.dataset.scrolled = window.scrollY > 12 ? 'true' : 'false'; };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var menuBtn = $('#menu-btn');
  var menu = $('#mobile-menu');
  var setMenu = function (open) {
    menu.dataset.open = open ? 'true' : 'false';
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    $('[data-menu-open]', menuBtn).classList.toggle('hidden', open);
    $('[data-menu-close]', menuBtn).classList.toggle('hidden', !open);
    if (open) header.dataset.scrolled = 'true'; else onScroll();
  };
  menuBtn.addEventListener('click', function () { setMenu(menu.dataset.open !== 'true'); });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.dataset.open === 'true') { setMenu(false); menuBtn.focus(); } });

  /* ---------- 2. Scroll reveals ---------- */
  var revealEls = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  // Footer roller paints the brand line once
  var footerPaint = $('.footer-paint');
  if (footerPaint) {
    if ('IntersectionObserver' in window && !reduceMotion) {
      var fio = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { footerPaint.classList.add('is-painted'); fio.disconnect(); }
      }, { threshold: 1 });
      fio.observe(footerPaint);
    } else footerPaint.classList.add('is-painted');
  }

  /* ---------- 3. Hero roller ----------
     The wall is split into vertical strips. The roller runs down the first
     strip, up the next and so on; each strip's clip-path opens in step with it,
     so the photo appears exactly where the roller has been. */
  var stage = $('#paint-stage');
  if (stage) (function () {
    var layers = $$('.paint-layer', stage);
    var roller = $('.roller', stage);
    var caption = $('.paint-caption', stage);
    var N = parseInt(stage.dataset.strips, 10) || 4;
    var EASE = 'cubic-bezier(.45,.05,.55,.95)';
    var z = 1;
    var pos = { i: N - 1, f: 0 }; // roller position: strip index + edge (0 = top, 1 = bottom)

    // Split every layer's photo into N strips
    layers.forEach(function (layer) {
      var img = $('img', layer);
      img.removeAttribute('loading');
      var strips = [];
      for (var i = 0; i < N; i++) {
        var s = document.createElement('div');
        s.className = 'paint-strip';
        var clone = img.cloneNode(true);
        if (i > 0) { clone.alt = ''; clone.setAttribute('aria-hidden', 'true'); clone.removeAttribute('fetchpriority'); }
        s.appendChild(clone);
        layer.appendChild(s);
        strips.push(s);
      }
      img.remove();
      layer._strips = strips;
    });

    var box = function (i) {
      var l = Math.max(0, i * 100 / N - 0.4);
      var r = Math.max(0, 100 - (i + 1) * 100 / N - 0.4);
      return { l: l, r: r };
    };
    var clipClosed = function (i, down) {
      var b = box(i);
      return down ? 'inset(0% ' + b.r + '% 100% ' + b.l + '%)' : 'inset(100% ' + b.r + '% 0% ' + b.l + '%)';
    };
    var clipOpen = function (i) { var b = box(i); return 'inset(0% ' + b.r + '% 0% ' + b.l + '%)'; };

    var geom = function () {
      var W = stage.clientWidth, H = stage.clientHeight;
      var s = W / N, rw = s * 1.18;
      return { W: W, H: H, s: s, rw: rw, yOff: rw * 31 / 200 };
    };
    var xy = function (i, f) {
      var g = geom();
      return { x: (i + 0.5) * g.s - g.rw / 2, y: f * g.H - g.yOff };
    };
    var sizeRoller = function () {
      roller.style.width = geom().rw + 'px';
      var p = xy(pos.i, pos.f);
      roller.style.transform = 'translate(' + p.x + 'px,' + p.y + 'px)';
    };
    sizeRoller();
    window.addEventListener('resize', sizeRoller);

    if (reduceMotion || !roller.animate) return; // photo stays as it is; roller parked

    var visible = true, inView = true, waiters = [];
    var flush = function () { if (visible && inView) { waiters.splice(0).forEach(function (fn) { fn(); }); } };
    document.addEventListener('visibilitychange', function () { visible = !document.hidden; flush(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { inView = en[0].isIntersecting; flush(); }).observe(stage);
    }
    var ready = function () { return new Promise(function (res) { if (visible && inView) res(); else waiters.push(res); }); };
    var wait = function (ms) { return new Promise(function (res) { setTimeout(res, ms); }); };

    var moveTo = function (i, f, dur) {
      var a = xy(pos.i, pos.f), b = xy(i, f);
      pos = { i: i, f: f };
      var anim = roller.animate([
        { transform: 'translate(' + a.x + 'px,' + a.y + 'px)' },
        { transform: 'translate(' + b.x + 'px,' + b.y + 'px)' }
      ], { duration: dur, easing: EASE, fill: 'forwards' });
      return anim.finished.then(function () {
        roller.style.transform = 'translate(' + b.x + 'px,' + b.y + 'px)';
        anim.cancel();
      });
    };

    var stroke = function (layer, i, down, dur) {
      var strip = layer._strips[i];
      roller.classList.add('is-rolling');
      roller.classList.toggle('is-up', !down);
      var a = strip.animate([{ clipPath: clipClosed(i, down) }, { clipPath: clipOpen(i) }], { duration: dur, easing: EASE, fill: 'forwards' });
      var done = a.finished.then(function () { strip.style.clipPath = clipOpen(i); a.cancel(); });
      return Promise.all([moveTo(i, down ? 1 : 0, dur), done]).then(function () { roller.classList.remove('is-rolling'); });
    };

    var paintLayer = function (layer) {
      layer.hidden = false;
      layer.style.zIndex = ++z;
      layer._strips.forEach(function (s, i) { s.style.clipPath = clipClosed(i, i % 2 === 0); });
      caption.dataset.show = 'false';
      var dur = stage.clientWidth < 500 ? 820 : 950;
      var chain = ready().then(function () { return moveTo(0, 0, pos.i === 0 ? 10 : 750); });
      for (var i = 0; i < N; i++) (function (i) {
        chain = chain.then(ready).then(function () {
          var p = i === 0 ? Promise.resolve() : moveTo(i, pos.f, 320);
          return p.then(function () { return stroke(layer, i, i % 2 === 0, dur); });
        });
      })(i);
      return chain.then(function () {
        caption.textContent = layer.dataset.caption || '';
        caption.dataset.show = 'true';
      });
    };

    // Start: the first job is painted onto a bare wall
    var current = 0;
    layers.forEach(function (l, k) { if (k) l.hidden = true; });
    layers[0]._strips.forEach(function (s, i) { s.style.clipPath = clipClosed(i, i % 2 === 0); });
    caption.dataset.show = 'false';

    var loop = function () {
      var layer = layers[current];
      var prev = layers[(current - 1 + layers.length) % layers.length];
      return paintLayer(layer).then(function () {
        if (prev !== layer) prev.hidden = true;
        current = (current + 1) % layers.length;
        return wait(3600);
      }).then(loop);
    };
    wait(650).then(loop);
  })();

  /* ---------- 4. Services explorer ---------- */
  var tabs = $$('[role="tab"]');
  var selectTab = function (tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      if (on) {
        panel.hidden = false;
        panel.classList.remove('is-entering');
        void panel.offsetWidth; // restart the entry animation
        panel.classList.add('is-entering');
      } else {
        panel.hidden = true;
      }
    });
    if (focus) tab.focus();
  };
  tabs.forEach(function (tab, idx) {
    tab.addEventListener('click', function () {
      selectTab(tab);
      // on small screens, bring the details into view
      if (window.innerWidth < 1024) {
        var panel = document.getElementById(tab.getAttribute('aria-controls'));
        var top = panel.getBoundingClientRect().top;
        if (top > window.innerHeight * 0.6) panel.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      }
    });
    tab.addEventListener('keydown', function (e) {
      var next = null;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = tabs[(idx + 1) % tabs.length];
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = tabs[(idx - 1 + tabs.length) % tabs.length];
      if (e.key === 'Home') next = tabs[0];
      if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); selectTab(next, true); }
    });
  });

  // "Ask about…" buttons pre-select the service in the form
  var serviceSelect = $('#f-service');
  $$('[data-pick]').forEach(function (a) {
    a.addEventListener('click', function () { if (serviceSelect) serviceSelect.value = a.dataset.pick; });
  });

  /* ---------- 5. Gallery lightbox ---------- */
  var lb = $('#lightbox');
  if (lb) (function () {
    var img = $('[data-lb-img]', lb), cap = $('[data-lb-caption]', lb), count = $('[data-lb-count]', lb);
    var closeBtn = $('[data-lb-close]', lb);
    var items = [], index = 0, lastFocus = null;

    var show = function (i, animate) {
      index = (i + items.length) % items.length;
      var it = items[index], thumb = $('img', it);
      var apply = function () {
        img.src = it.dataset.full;
        img.alt = thumb ? thumb.alt : '';
        if (thumb) { img.width = thumb.width; img.height = thumb.height; }
        cap.textContent = it.dataset.caption || '';
        count.textContent = (index + 1) + ' / ' + items.length;
      };
      if (animate && !reduceMotion) {
        lb.classList.add('is-swapping');
        setTimeout(function () { apply(); img.onload = function () { lb.classList.remove('is-swapping'); }; setTimeout(function () { lb.classList.remove('is-swapping'); }, 400); }, 160);
      } else apply();
    };
    var open = function (btn) {
      items = $$('[data-lightbox]').filter(function (b) { return b.offsetParent !== null; });
      lastFocus = btn;
      show(items.indexOf(btn));
      lb.setAttribute('aria-hidden', 'false');
      document.documentElement.style.overflow = 'hidden';
      closeBtn.focus();
    };
    var close = function () {
      lb.setAttribute('aria-hidden', 'true');
      document.documentElement.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    };

    $$('[data-lightbox]').forEach(function (b) { b.addEventListener('click', function () { open(b); }); });
    closeBtn.addEventListener('click', close);
    $('[data-lb-prev]', lb).addEventListener('click', function () { show(index - 1, true); });
    $('[data-lb-next]', lb).addEventListener('click', function () { show(index + 1, true); });
    $('[data-lb-stage]', lb).addEventListener('click', function (e) { if (e.target === e.currentTarget) close(); });

    document.addEventListener('keydown', function (e) {
      if (lb.getAttribute('aria-hidden') === 'true') return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(index - 1, true);
      else if (e.key === 'ArrowRight') show(index + 1, true);
      else if (e.key === 'Tab') {
        var f = $$('button', lb).filter(function (b) { return b.offsetParent !== null; });
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    // swipe on touch screens
    var sx = null, sy = null;
    lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) show(index + (dx < 0 ? 1 : -1), true);
      else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) close();
      sx = sy = null;
    });
  })();

  /* ---------- 6. Quote form ---------- */
  var form = $('#quote-form');
  if (form) (function () {
    var tried = false;
    var rules = {
      name: function (v) { return v.trim().length > 1; },
      phone: function (v) { return v.replace(/[^0-9]/g, '').length >= 6; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); },
      message: function (v) { return v.trim().length > 4; }
    };
    var check = function (field) {
      var ok = rules[field.name](field.value);
      field.setAttribute('aria-invalid', ok ? 'false' : 'true');
      var err = document.getElementById(field.getAttribute('aria-describedby'));
      if (err) err.classList.toggle('hidden', ok);
      return ok;
    };
    var fields = Object.keys(rules).map(function (n) { return form.elements[n]; });
    fields.forEach(function (f) {
      f.addEventListener('blur', function () { if (tried || f.value) check(f); });
      f.addEventListener('input', function () { if (tried || f.getAttribute('aria-invalid') === 'true') check(f); });
    });
    form.addEventListener('submit', function (e) {
      tried = true;
      var bad = fields.filter(function (f) { return !check(f); });
      if (bad.length) { e.preventDefault(); bad[0].focus(); return; }
      var btn = $('[data-submit]', form);
      btn.disabled = true;
      btn.classList.add('opacity-80', 'cursor-wait');
      $('[data-label]', btn).textContent = 'Sending…';
    });
    // Back/forward cache: re-enable the button if the visitor returns
    window.addEventListener('pageshow', function () {
      var btn = $('[data-submit]', form);
      btn.disabled = false;
      btn.classList.remove('opacity-80', 'cursor-wait');
      $('[data-label]', btn).textContent = 'Send enquiry';
    });
  })();
})();
