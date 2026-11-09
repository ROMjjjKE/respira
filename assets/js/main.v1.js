/* ООО «Респира» — меню, деталь, расчёт гибки, заявка */
(function () {
  'use strict';
  var WA = 'https://wa.me/375333241694';
  var NS = 'http://www.w3.org/2000/svg';

  /* ---------- шапка ---------- */
  var head = document.querySelector('.head');
  function onScroll() {
    if (!head) return;
    head.classList.toggle('is-stuck', window.scrollY > 30 || head.classList.contains('head--solid'));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- меню ---------- */
  var burger = document.getElementById('burger');
  var drawer = document.getElementById('drawer');
  var closeBtn = document.getElementById('drawer-close');
  var lastFocus = null;
  function focusables() {
    if (!drawer) return [];
    return Array.prototype.slice.call(drawer.querySelectorAll('a[href],button:not([disabled]),input,select,textarea'))
      .filter(function (el) { return el.offsetParent !== null; });
  }
  function openDrawer() {
    if (!drawer) return;
    lastFocus = document.activeElement;
    drawer.hidden = false;
    document.body.classList.add('is-locked');
    if (burger) burger.setAttribute('aria-expanded', 'true');
    var f = focusables(); if (f.length) f[0].focus();
  }
  function closeDrawer() {
    if (!drawer) return;
    drawer.hidden = true;
    document.body.classList.remove('is-locked');
    if (burger) burger.setAttribute('aria-expanded', 'false');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  if (burger) burger.addEventListener('click', function () { (drawer && drawer.hidden) ? openDrawer() : closeDrawer(); });
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (drawer) {
    drawer.addEventListener('click', function (e) { if (e.target === drawer) closeDrawer(); });
    drawer.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var f = focusables(); if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    drawer.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        document.body.classList.remove('is-locked');
        if (burger) burger.setAttribute('aria-expanded', 'false');
      });
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && drawer && !drawer.hidden) closeDrawer();
  });

  /* ---------- появление ---------- */
  var rv = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window && rv.length) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    rv.forEach(function (el) { io.observe(el); });
  } else { rv.forEach(function (el) { el.classList.add('is-in'); }); }

  function el(tag, attrs, text) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) if (Object.prototype.hasOwnProperty.call(attrs, k)) e.setAttribute(k, attrs[k]);
    if (text) e.textContent = text;
    return e;
  }
  function nf(v, d) { return v.toFixed(d).replace('.', ','); }

  /* ---------- деталь ---------- */
  var svg = document.getElementById('partSvg');
  if (svg) {
    var MAT = {
      steel: { name: 'сталь', d: 7.85 },
      stainless: { name: 'нержавейка', d: 7.9 },
      alu: { name: 'алюминий', d: 2.7 },
      brass: { name: 'латунь', d: 8.5 }
    };
    var NOTES = {
      plate: 'Пластина: рез идёт по контуру и вокруг четырёх отверстий Ø6. Вес считаем по плотности материала, без учёта окалины и защитной плёнки.',
      flange: 'Фланец: рез по наружному диаметру и по отверстию. Если отверстие близко к краю, в производстве уточняем перемычку — она влияет на геометрию.',
      angle: 'Уголок: длина реза считается по внешнему контуру развёртки, вес — по толщине листа. Перед гибкой деталь разворачивается на плоскость.'
    };
    var shape = 'plate', mat = 'steel', t = 2;

    var dimA = document.getElementById('dimA'), dimB = document.getElementById('dimB');
    var outA = document.getElementById('outA'), outB = document.getElementById('outB');
    var labA = document.getElementById('labA'), labB = document.getElementById('labB');
    var oCut = document.getElementById('o-cut'), oArea = document.getElementById('o-area');
    var oWeight = document.getElementById('o-weight'), oBatch = document.getElementById('o-batch');
    var oNote = document.getElementById('o-note'), send = document.getElementById('part-send');

    function boundsW() {
      var a = parseFloat(dimA.value), b = parseFloat(dimB.value);
      if (shape === 'flange') return { w: a, h: a };
      return { w: a, h: b };
    }

    function draw() {
      var a = parseFloat(dimA.value), b = parseFloat(dimB.value);
      var bb = boundsW();
      var s = Math.min(430 / bb.w, 280 / bb.h);
      var W = bb.w * s, H = bb.h * s;
      var x0 = (660 - W) / 2, y0 = 150 - H / 2;

      while (svg.firstChild) svg.removeChild(svg.firstChild);

      var fill = '#B7C0C6', cut = '#FF5A1F';
      var g ;

      if (shape === 'plate' || shape === 'angle') {
        if (shape === 'plate') {
          svg.appendChild(el('rect', { x: x0, y: y0, width: W, height: H, fill: fill, stroke: cut, 'stroke-width': 1.6 }));
          var inset = Math.min(20, Math.min(a, b) * 0.12), r = 3 * s;
          [[x0 + inset * s, y0 + inset * s], [x0 + W - inset * s, y0 + inset * s],
           [x0 + inset * s, y0 + H - inset * s], [x0 + W - inset * s, y0 + H - inset * s]].forEach(function (p) {
            svg.appendChild(el('circle', { cx: p[0], cy: p[1], r: Math.max(2.4, r), fill: '#13171A', stroke: cut, 'stroke-width': 1.2 }));
          });
        } else {
          var tv = Math.max(8, Math.min(30, t * s * 1.6));
          var pts = [[0, 0], [W, 0], [W, tv], [tv, tv], [tv, H], [0, H]]
            .map(function (p) { return (x0 + p[0]) + ',' + (y0 + p[1]); }).join(' ');
          svg.appendChild(el('polygon', { points: pts, fill: fill, stroke: cut, 'stroke-width': 1.6 }));
        }
        /* размеры */
        svg.appendChild(el('line', { x1: x0, y1: y0 + H + 34, x2: x0 + W, y2: y0 + H + 34, class: 'dimline' }));
        svg.appendChild(el('line', { x1: x0, y1: y0 + H + 28, x2: x0, y2: y0 + H + 40, class: 'dim' }));
        svg.appendChild(el('line', { x1: x0 + W, y1: y0 + H + 28, x2: x0 + W, y2: y0 + H + 40, class: 'dim' }));
        svg.appendChild(el('text', { x: x0 + W / 2, y: y0 + H + 52, 'text-anchor': 'middle' }, 'A = ' + Math.round(a) + ' мм'));

        svg.appendChild(el('line', { x1: x0 - 34, y1: y0, x2: x0 - 34, y2: y0 + H, class: 'dimline' }));
        svg.appendChild(el('line', { x1: x0 - 40, y1: y0, x2: x0 - 28, y2: y0, class: 'dim' }));
        svg.appendChild(el('line', { x1: x0 - 40, y1: y0 + H, x2: x0 - 28, y2: y0 + H, class: 'dim' }));
        var ty = el('text', { x: x0 - 44, y: y0 + H / 2, 'text-anchor': 'middle' }, 'B = ' + Math.round(b) + ' мм');
        ty.setAttribute('transform', 'rotate(-90 ' + (x0 - 44) + ' ' + (y0 + H / 2) + ')');
        svg.appendChild(ty);
      } else {
        var rOut = W / 2, rIn = Math.min(W / 2 - 12, b * s / 2);
        svg.appendChild(el('circle', { cx: 330, cy: 150, r: rOut, fill: fill, stroke: cut, 'stroke-width': 1.6 }));
        svg.appendChild(el('circle', { cx: 330, cy: 150, r: Math.max(4, rIn), fill: '#13171A', stroke: cut, 'stroke-width': 1.2 }));
        svg.appendChild(el('line', { x1: 330 - rOut, y1: 150 + rOut + 34, x2: 330 + rOut, y2: 150 + rOut + 34, class: 'dimline' }));
        svg.appendChild(el('line', { x1: 330 - rOut, y1: 150 + rOut + 28, x2: 330 - rOut, y2: 150 + rOut + 40, class: 'dim' }));
        svg.appendChild(el('line', { x1: 330 + rOut, y1: 150 + rOut + 28, x2: 330 + rOut, y2: 150 + rOut + 40, class: 'dim' }));
        svg.appendChild(el('text', { x: 330, y: 150 + rOut + 52, 'text-anchor': 'middle' }, 'Ø A = ' + Math.round(a) + ' мм'));
        svg.appendChild(el('text', { x: 330, y: 150 - rIn - 8, 'text-anchor': 'middle' }, 'Ø B = ' + Math.round(b) + ' мм'));
      }

      /* подпись материала и толщины */
      svg.appendChild(el('text', { x: 30, y: 30 }, MAT[mat].name.toUpperCase() + ' · ' + nf(t, 1) + ' ММ'));
      svg.appendChild(el('text', { x: 30, y: 396 }, 'КОНТУР РЕЗА — ' + (shape === 'flange' ? 'НАРУЖНЫЙ И ВНУТРЕННИЙ' : 'ПО ПЕРИМЕТРУ')));

      /* числа */
      var perim, area;
      if (shape === 'plate') {
        perim = 2 * (a + b) + 4 * Math.PI * 6;
        area = a * b - 4 * Math.PI * 9;
      } else if (shape === 'flange') {
        var bIn = Math.min(b, a - 10);
        perim = Math.PI * (a + bIn);
        area = Math.PI / 4 * (a * a - bIn * bIn);
      } else {
        perim = 2 * (a + b);
        area = t * (a + b - t);
      }
      var weight = area * t * MAT[mat].d / 1e6;

      oCut.textContent = nf(perim / 1000, 2);
      oArea.textContent = Math.round(area / 100);
      oWeight.textContent = weight < 1 ? nf(weight, 3) : nf(weight, 2);
      oBatch.textContent = weight * 100 < 10 ? nf(weight * 100, 1) : Math.round(weight * 100);
      oNote.textContent = NOTES[shape];

      send.href = WA + '?text=' + encodeURIComponent(
        'Расчёт детали с сайта\nДеталь: ' + (shape === 'plate' ? 'пластина' : shape === 'flange' ? 'фланец' : 'уголок') +
        '\nМатериал: ' + MAT[mat].name + '\nТолщина: ' + nf(t, 1) + ' мм' +
        '\nA = ' + Math.round(a) + ' мм, B = ' + Math.round(b) + ' мм' +
        '\nДлина реза: ' + nf(perim / 1000, 2) + ' м\nПлощадь: ' + Math.round(area / 100) + ' см²' +
        '\nВес одной детали: ' + nf(weight, 3) + ' кг\nХочу уточнить стоимость и сроки.');
    }

    var shapeBtns = Array.prototype.slice.call(document.querySelectorAll('[data-shape]'));
    var matBtns = Array.prototype.slice.call(document.querySelectorAll('[data-mat]'));
    var thBtns = Array.prototype.slice.call(document.querySelectorAll('[data-t]'));

    function labels() {
      if (shape === 'flange') { labA.textContent = 'Наружный диаметр'; labB.textContent = 'Отверстие'; }
      else if (shape === 'angle') { labA.textContent = 'Полка A'; labB.textContent = 'Полка B'; }
      else { labA.textContent = 'Сторона A'; labB.textContent = 'Сторона B'; }
    }
    function outs() {
      outA.textContent = Math.round(parseFloat(dimA.value)) + ' мм';
      outB.textContent = Math.round(parseFloat(dimB.value)) + ' мм';
    }
    function press(btns, btn) {
      btns.forEach(function (o) { o.setAttribute('aria-pressed', 'false'); });
      btn.setAttribute('aria-pressed', 'true');
    }
    shapeBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        press(shapeBtns, b); shape = b.getAttribute('data-shape');
        if (shape === 'flange') {
          if (parseFloat(dimB.value) > parseFloat(dimA.value) - 20) {
            dimB.value = Math.max(30, parseFloat(dimA.value) - 60);
          }
        }
        labels(); outs(); draw();
      });
    });
    matBtns.forEach(function (b) {
      b.addEventListener('click', function () { press(matBtns, b); mat = b.getAttribute('data-mat'); draw(); });
    });
    thBtns.forEach(function (b) {
      b.addEventListener('click', function () { press(thBtns, b); t = parseFloat(b.getAttribute('data-t')); draw(); });
    });
    dimA.addEventListener('input', function () {
      if (shape === 'flange' && parseFloat(dimB.value) > parseFloat(dimA.value) - 20) {
        dimB.value = Math.max(30, parseFloat(dimA.value) - 40);
        outB.textContent = Math.round(parseFloat(dimB.value)) + ' мм';
      }
      outs(); draw();
    });
    dimB.addEventListener('input', function () { outs(); draw(); });
    labels(); outs(); draw();
  }

  /* ---------- гибка ---------- */
  var bendSvg = document.getElementById('bendSvg');
  if (bendSvg) {
    var bAngle = document.getElementById('b-angle'), bThick = document.getElementById('b-thick');
    var bA = document.getElementById('b-a'), bB = document.getElementById('b-b');
    var bAngleOut = document.getElementById('b-angleOut'), bThickOut = document.getElementById('b-thickOut');
    var bAOut = document.getElementById('b-aOut'), bBOut = document.getElementById('b-bOut');
    var bBa = document.getElementById('b-ba'), bBd = document.getElementById('b-bd');
    var bFlat = document.getElementById('b-flat'), bR = document.getElementById('b-r');
    var bendSend = document.getElementById('bend-send');
    var K = 0.44;

    function paintBend() {
      var al = parseFloat(bAngle.value), T = parseFloat(bThick.value);
      var A = parseFloat(bA.value), B = parseFloat(bB.value);
      var alRad = al * Math.PI / 180;
      var R = T;
      var BA = Math.PI * (al / 180) * (R + K * T);
      var SB = (R + T) * Math.tan(alRad / 2);
      var BD = 2 * SB - BA;
      var flat = A + B - BD;

      bAngleOut.textContent = Math.round(al) + '°';
      bThickOut.textContent = nf(T, 1) + ' мм';
      bAOut.textContent = Math.round(A) + ' мм';
      bBOut.textContent = Math.round(B) + ' мм';
      bBa.textContent = nf(BA, 1);
      bBd.textContent = nf(BD, 1);
      bFlat.textContent = nf(flat, 1);
      bR.textContent = nf(R, 1);

      /* геометрия схемы */
      var s = Math.min(250 / Math.max(A, B), 380 / (A + B), 1.1);
      var bx = 250, by = 240;
      var ax = bx - A * s, ay = by;
      var bxx = bx + B * s * Math.cos(alRad), byy = by - B * s * Math.sin(alRad);
      var minX = Math.min(ax, bx, bxx), maxX = Math.max(ax, bx, bxx);
      var minY = Math.min(ay, by, byy), maxY = Math.max(ay, by, byy);
      var dx = (560 - (maxX - minX)) / 2 - minX;
      var dy = (300 - (maxY - minY)) / 2 - minY + 20;
      ax += dx; bx += dx; bxx += dx;
      ay += dy; by += dy; byy += dy;

      while (bendSvg.firstChild) bendSvg.removeChild(bendSvg.firstChild);

      var sw = Math.max(7, T * s * 1.7);
      bendSvg.appendChild(el('path', {
        d: 'M' + ax + ' ' + ay + ' L' + bx + ' ' + by + ' L' + bxx + ' ' + byy,
        fill: 'none', stroke: '#1B2024', 'stroke-width': sw, 'stroke-linejoin': 'round', 'stroke-linecap': 'butt'
      }));
      /* осевая линия */
      bendSvg.appendChild(el('path', {
        d: 'M' + ax + ' ' + (ay) + ' L' + bx + ' ' + by + ' L' + bxx + ' ' + byy,
        fill: 'none', stroke: '#FF5A1F', 'stroke-width': 1, 'stroke-dasharray': '7 6', opacity: '.9'
      }));

      /* дуга угла */
      var r = 52;
      var a1 = Math.atan2(ay - by, ax - bx);
      var a2 = Math.atan2(byy - by, bxx - bx);
      var p1x = bx + r * Math.cos(a1), p1y = by + r * Math.sin(a1);
      var p2x = bx + r * Math.cos(a2), p2y = by + r * Math.sin(a2);
      var diff = Math.abs(a1 - a2);
      var large = diff > Math.PI ? 1 : 0;
      bendSvg.appendChild(el('path', {
        d: 'M' + p1x + ' ' + p1y + ' A' + r + ' ' + r + ' 0 ' + large + ' 0 ' + p2x + ' ' + p2y,
        fill: 'none', stroke: '#FF5A1F', 'stroke-width': 1.4
      }));
      var midA = (a1 + a2) / 2;
      bendSvg.appendChild(el('text', {
        x: bx + (r + 22) * Math.cos(midA), y: by + (r + 22) * Math.sin(midA) + 3,
        'text-anchor': 'middle', fill: '#B33A0B'
      }, Math.round(al) + '°'));

      /* подписи полок */
      bendSvg.appendChild(el('text', { x: (ax + bx) / 2, y: ay + 26, 'text-anchor': 'middle' }, 'A = ' + Math.round(A) + ' мм'));
      var lx = bx + (bxx - bx) * 0.55, ly = by + (byy - by) * 0.55;
      var lb = el('text', { x: lx + 18, y: ly, text: '' }, 'B = ' + Math.round(B) + ' мм');
      lb.textContent = 'B = ' + Math.round(B) + ' мм';
      bendSvg.appendChild(lb);

      /* радиус у гиба */
      bendSvg.appendChild(el('text', { x: bx + 14, y: by - 14 }, 'R' + nf(R, 1)));

      bendSend.href = WA + '?text=' + encodeURIComponent(
        'Расчёт гибки с сайта\nУгол: ' + Math.round(al) + '°\nТолщина: ' + nf(T, 1) + ' мм' +
        '\nПолка A: ' + Math.round(A) + ' мм\nПолка B: ' + Math.round(B) + ' мм' +
        '\nПрипуск на гиб: ' + nf(BA, 1) + ' мм\nДлина развёртки: ' + nf(flat, 1) + ' мм' +
        '\nХочу уточнить стоимость и сроки.');
    }
    [bAngle, bThick, bA, bB].forEach(function (i) { i.addEventListener('input', paintBend); });
    paintBend();
  }

  /* ---------- заявка ---------- */
  var form = document.getElementById('lead');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var g = function (sel) { var el2 = form.querySelector(sel); return el2 ? el2.value : ''; };
      var name = g('#f-name'), phone = g('#f-phone'), mat2 = g('#f-mat'), what = g('#f-what'), note = g('#f-note');
      var ok = form.querySelector('.form__ok');
      if (name.trim().length < 2 || phone.replace(/\D/g, '').length < 9) {
        if (ok) { ok.hidden = false; ok.textContent = 'Укажите имя и телефон, чтобы мы могли ответить.'; }
        return;
      }
      var text = 'Заявка на расчёт\nИмя: ' + name.trim() + '\nТелефон: ' + phone.trim() +
        (mat2 ? '\nМатериал: ' + mat2 : '') + (what ? '\nЧто нужно: ' + what : '') +
        (note.trim() ? '\nКомментарий: ' + note.trim() : '');
      var url = WA + '?text=' + encodeURIComponent(text);
      if (ok) {
        ok.hidden = false;
        ok.innerHTML = 'Заявка собрана. Если WhatsApp не открылся, <a href="' + url + '" target="_blank" rel="noopener">нажмите здесь</a>. Файл детали можно приложить в чате.';
      }
      window.open(url, '_blank', 'noopener');
    });
  }
})();
