/* 여러 활동이 함께 쓰는 부품: 스피드 퀴즈, O/X 퀴즈 */
(function () {
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  window.shuffle = shuffle;
  window.speedQuiz = function (box, bank, act, secs, onEnd) {
    var left = secs, score = 0, cur = null, run = false, timer = null, best = 0;
    try { best = Number(localStorage.getItem('tt6-best-' + act)) || 0; } catch (e) {}
    var q = h('p', { class: 'sq-q' }), opts = h('div', { class: 'sq-opts' }), clock = h('span', { class: 'lcd', dir: 'ltr' }, secs + 's'), sc = h('span', { class: 'lcd', dir: 'ltr' }, '0');
    var bestEl = h('b', { dir: 'ltr' }, String(best)), start = btn('d4_sq_start', go, 'btn primary big');
    function next() {
      var it = bank[Math.floor(Math.random() * bank.length)]; if (cur && it === cur && bank.length > 1) return next(); cur = it;
      q.setAttribute('data-k', it[0]); q.textContent = t(it[0]); opts.innerHTML = '';
      shuffle([it[1]].concat(it[2])).forEach(function (k) {
        var b = h('button', { type: 'button', class: 'opt', k: k });
        b.addEventListener('click', function () {
          if (!run) return;
          if (k === it[1]) { score++; sc.textContent = score; b.classList.add('good'); run = false; setTimeout(function () { run = true; next(); }, 220); }
          else { b.classList.add('bad'); [].forEach.call(opts.children, function (x) { if (x.getAttribute('data-k') === it[1]) x.classList.add('good'); }); run = false; setTimeout(function () { run = true; next(); }, 700); }
        });
        opts.append(b);
      });
    }
    function go() {
      start.hidden = true; score = 0; left = secs; sc.textContent = '0'; clock.textContent = secs + 's'; run = true; next();
      timer = setInterval(function () { left--; clock.textContent = left + 's'; if (left <= 0) end(); }, 1000);
    }
    function end() {
      clearInterval(timer); run = false; opts.innerHTML = ''; q.removeAttribute('data-k'); var nb = score > best;
      if (nb) { best = score; try { localStorage.setItem('tt6-best-' + act, String(best)); } catch (e) {} bestEl.textContent = String(best); }
      q.textContent = t('d4_sq_end') + ' ' + score + (nb ? ' · ' + t('d4_sq_newbest') : '');
      App.send({ action: 'answer', act: act, key: 'speed', text: String(best) });
      start.hidden = false; start.setAttribute('data-k', 'd4_sq_again'); start.textContent = t('d4_sq_again');
      onEnd && onEnd(score);
    }
    box.append(h('div', { class: 'sq' }, h('div', { class: 'row sq-top' }, h('span', { k: 'd4_sq_time' }), clock, h('span', { k: 'd4_sq_score' }), sc, h('span', { k: 'd4_sq_best' }), bestEl), q, opts, start));
    return { stop: function () { clearInterval(timer); } };
  };

  function oxQuiz(items, ctx, onDone) {                  // items: [[문장키, 'O'|'X', 해설키]]
    var box = h('div', { class: 'oxquiz' }), left = items.length;
    items.forEach(function (it) {
      var row = h('div', { class: 'oxrow' }, h('p', { k: it[0] })), btns = h('div', { class: 'row' }), done = false;
      ['O', 'X'].forEach(function (v) {
        var b = h('button', { type: 'button', class: 'oxbtn' }, v);
        b.addEventListener('click', function () {
          if (done) return;
          if (v === it[1]) { done = true; b.classList.add('good'); row.append(note(it[2], 'result')); applyI18n(row); if (--left === 0) onDone(); }
          else { b.classList.add('bad'); b.disabled = true; ctx.miss(); }
        });
        btns.append(b);
      });
      row.append(btns); box.append(row);
    });
    return box;
  }
  window.oxQuiz = oxQuiz;

  /* 선 잇기: 왼쪽 하나를 누르고 오른쪽 하나를 누르면 선이 이어집니다. pairs: [[왼쪽키, 오른쪽키]] (오른쪽은 섞어서 보여 줌) */
  window.lineMatch = function (pairs) {
    var wrap = h('div', { class: 'lmatch' }), L = h('div', { class: 'lm-col' }), R = h('div', { class: 'lm-col' }), svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    var link = {}, pick = null, lb = {}, rb = {};
    svg.setAttribute('class', 'lm-svg');
    pairs.forEach(function (p) { var b = h('button', { type: 'button', class: 'opt lm-l', k: p[0] }); lb[p[0]] = b; b.addEventListener('click', function () { if (wrap._lock) return; if (pick) pick.classList.remove('picked'); pick = b; b.classList.add('picked'); }); L.append(b); });
    shuffle(pairs).forEach(function (p) {
      var b = h('button', { type: 'button', class: 'opt lm-r', k: p[1] }); rb[p[1]] = b;
      b.addEventListener('click', function () {
        if (wrap._lock || !pick) return;
        var lk = pick.getAttribute('data-k');
        for (var x in link) if (link[x] === p[1]) delete link[x];      // 오른쪽 하나에는 선 하나만
        link[lk] = p[1]; pick.classList.remove('picked'); pick = null;
        [].forEach.call(wrap.querySelectorAll('.good,.bad'), function (e) { e.classList.remove('good', 'bad'); });
        draw();
      });
      R.append(b);
    });
    function draw() {
      var o = wrap.getBoundingClientRect(); svg.innerHTML = '';
      svg.setAttribute('width', o.width); svg.setAttribute('height', o.height);
      var rtl = document.documentElement.dir === 'rtl';
      Object.keys(link).forEach(function (lk) {
        var a = lb[lk].getBoundingClientRect(), b = rb[link[lk]].getBoundingClientRect();
        var ln = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        ln.setAttribute('x1', (rtl ? a.left : a.right) - o.left); ln.setAttribute('y1', a.top + a.height / 2 - o.top);
        ln.setAttribute('x2', (rtl ? b.right : b.left) - o.left); ln.setAttribute('y2', b.top + b.height / 2 - o.top);
        ln.setAttribute('class', 'lm-line' + (lb[lk].classList.contains('bad') ? ' bad' : lb[lk].classList.contains('good') ? ' good' : ''));
        svg.append(ln);
      });
    }
    wrap.append(L, svg, R);
    window.addEventListener('resize', draw);
    wrap.check = function () {
      var ok = true;
      pairs.forEach(function (p) { var g = link[p[0]] === p[1]; lb[p[0]].classList.toggle('good', g); lb[p[0]].classList.toggle('bad', !g); if (!g) ok = false; });
      draw(); return ok;
    };
    wrap.lock = function () { wrap._lock = true; };
    wrap.text = function () { return pairs.map(function (p) { return t(p[0]) + ' - ' + (link[p[0]] ? t(link[p[0]]) : '?'); }).join(' / '); };
    wrap.redraw = draw;
    return wrap;
  };
})();

/* 혈액 순환 모식도 (교과서 그림과 같은 구성: 폐 위, 심장 가운데, 온몸 아래)
   대정맥 → 우심방, 우심실 → 폐동맥, 폐정맥 → 좌심방, 좌심실 → 대동맥. opt.hl = 강조할 곳(LUNG, BODY, RA, RV, LA, LV, PA, PV, AO, VC) */
window.LOOP_POS = { LUNG: [210, 70], BODY: [210, 500], RA: [185, 262], LA: [235, 262], RV: [185, 308], LV: [235, 308], PA: [110, 190], PV: [310, 190], AO: [360, 410], VC: [60, 410] };
window.loopSvg = function (opt) {
  opt = opt || {};
  var B = '#3f6fd1', R = '#e53935', o = '';
  function path(d, c, wd) { return '<path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="' + (wd || 16) + '" stroke-linejoin="round" stroke-linecap="round"/>'; }
  function arr(x, y, dir, c) { var r = { u: 0, d: 180, l: 270, r: 90 }[dir]; return '<path d="M0 -9 L8 6 L-8 6Z" fill="#fff" stroke="' + c + '" stroke-width="1.5" transform="translate(' + x + ' ' + y + ') rotate(' + r + ')"/>'; }
  function tx(x, y, k, sz, c, w, maxW) {                // maxW: 글자가 길면(다른 언어) 칸 너비에 맞게 줄임
    var s = String(t(k)), fit = maxW && s.length * (sz || 14) * .62 > maxW ? ' textLength="' + maxW + '" lengthAdjust="spacingAndGlyphs"' : '';
    return '<text x="' + x + '" y="' + y + '" font-size="' + (sz || 14) + '" font-weight="' + (w || 700) + '" fill="' + (c || '#3b2a2c') + '" text-anchor="middle"' + fit + '>' + s.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</text>';
  }
  o += '<rect x="20" y="4" width="380" height="140" rx="22" fill="#e3f4e7"/><rect x="20" y="430" width="380" height="126" rx="22" fill="#fde4ec"/>';
  /* 폐와 폐의 모세혈관 */
  o += '<path d="M200 30 Q140 10 125 70 Q118 110 150 118 Q190 112 200 80Z M220 30 Q280 10 295 70 Q302 110 270 118 Q230 112 220 80Z" fill="#f2b8c6" stroke="#b5476b" stroke-width="2"/>';
  o += '<path d="M150 95 q15 -12 30 0 t30 0 t30 0 t30 0" fill="none" stroke="#9c5ab8" stroke-width="3"/>';
  /* 온몸의 세포와 모세혈관 */
  o += '<rect x="150" y="470" width="120" height="58" rx="12" fill="#ffe0b2" stroke="#3b2a2c" stroke-width="2"/><path d="M160 515 q12 -10 25 0 t25 0 t25 0 t25 0" fill="none" stroke="#9c5ab8" stroke-width="3"/>';
  /* 혈관 (대정맥은 폐동맥 아래로 지나가도록 먼저 그림) */
  o += path('M150 500 H60 V262 H160', B);
  o += path('M160 308 H110 V120 Q110 96 140 92', '#fff', 26) + path('M160 308 H110 V120 Q110 96 140 92', B);
  o += path('M280 92 Q310 96 310 120 V262 H260', R);
  o += path('M260 308 H360 V500 H270', R);
  o += arr(60, 360, 'u', B) + arr(110, 200, 'u', B) + arr(310, 190, 'd', R) + arr(360, 420, 'd', R);
  /* 심장 네 칸 */
  o += '<g stroke="#3b2a2c" stroke-width="2.5"><rect x="160" y="240" width="50" height="44" rx="8" fill="#7aa7e6"/><rect x="210" y="240" width="50" height="44" rx="8" fill="#f28b82"/><rect x="160" y="286" width="50" height="46" rx="8" fill="#5b8fd9"/><rect x="210" y="286" width="50" height="46" rx="8" fill="#e8574a"/></g>';
  o += tx(185, 267, 'h_ra', 11, 0, 0, 44) + tx(235, 267, 'h_la', 11, 0, 0, 44) + tx(185, 314, 'h_rv', 11, 0, 0, 44) + tx(235, 314, 'h_lv', 11, 0, 0, 44);
  /* 혈관 이름 */
  o += '<g paint-order="stroke" stroke="#fff" stroke-width="4">' + tx(66, 160, 'h_pa', 13, B, 0, 80) + tx(354, 160, 'h_pv', 13, R, 0, 80) + tx(34, 330, 'h_vc', 13, B, 0, 56) + tx(388, 330, 'h_ao', 13, R, 0, 56) + '</g>';
  o += tx(210, 160, 'c3_pul', 16, '#2f7d4f', 900) + tx(210, 454, 'c3_sys', 16, '#c2185b', 900) + tx(210, 548, 'c3_bodycap', 13);
  o += tx(210, 134, 'c3_lungcap', 13);
  /* 물질 교환 화살표 */
  if (opt.ex !== false) {
    o += '<g font-size="11" font-weight="700"><path d="M150 60 l-26 -18" stroke="' + B + '" stroke-width="3" marker-end="url(#ah)"/><text x="92" y="36" fill="' + B + '">' + t('c3_co2') + '</text>';
    o += '<path d="M296 42 l-24 18" stroke="' + R + '" stroke-width="3" marker-end="url(#ah)"/><text x="300" y="36" fill="' + R + '">' + t('c3_o2') + '</text>';
    o += '<path d="M170 474 l-22 -18" stroke="' + B + '" stroke-width="3" marker-start="url(#ah)"/><text x="96" y="470" fill="' + B + '">' + t('card_co2w') + '</text>';
    o += '<path d="M248 456 l22 18" stroke="' + R + '" stroke-width="3" marker-end="url(#ah)"/><text x="276" y="470" fill="' + R + '">' + t('card_o2n') + '</text></g>';
  }
  if (opt.hl && LOOP_POS[opt.hl]) { var q = LOOP_POS[opt.hl]; o += '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="30" fill="none" stroke="#ffb300" stroke-width="6" class="hlring"/>'; }
  return '<svg class="loopsvg2" viewBox="0 0 420 560" xmlns="http://www.w3.org/2000/svg"><defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10z" fill="#3b2a2c"/></marker></defs>' + o + '</svg>';
};
