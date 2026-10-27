/* 호흡계 2: 폐의 구조적 특징 — 같은 공간 안에 원을 그려 모양을 만들고 테두리(공기와 닿는 면)와 기체 교환 속도 비교 (교과서 p209 해 보기)
   ② 기체 교환은 확산의 원리를 이용한다는 것을 농도 차이에 따라 움직이는 입자 모형으로 확인 (확산의 기본 개념은 도입에서 선생님과 확인) */
(function () {
  var RCM = 3;                                         // 공간(점선 원) 반지름 3 cm
  var SIZES = { L: .5, M: .3, S: .18 };                // 그릴 원 크기 (점선 원 반지름에 대한 비)
  var BIG = 2 * Math.PI * SIZES.L * RCM;               // 기준: '큰 원' 하나의 테두리 = 기체 교환 속도 ×1.00
  function perim(C) {                                  // 겹친 부분을 뺀 바깥 테두리 길이(반지름 1 기준) + 테두리 점들
    var len = 0, pts = [];
    C.forEach(function (c, ci) {
      var M = 240;
      for (var s = 0; s < M; s++) {
        var a = s / M * 2 * Math.PI, x = c.x + c.r * Math.cos(a), y = c.y + c.r * Math.sin(a);
        if (C.every(function (o, oi) { return oi === ci || Math.hypot(x - o.x, y - o.y) >= o.r - 1e-9; })) { len += 2 * Math.PI * c.r / M; pts.push([x, y, a]); }
      }
    });
    return { len: len, pts: pts };
  }
  ACT.r2 = { id: 'r2', title: 't_r2', steps: [
    /* ① 원으로 모양 만들기 → 테두리 재기 → 기체 교환 비교 */
    function (box, ctx) {
      var S = 340, cv = h('canvas', { class: 'alvcv', width: String(S), height: String(S) }), g = cv.getContext('2d'), C = [], size = 'M', gas = false, P = [], acc = 0, timer = null, rec = [];
      var lenOut = h('b', { class: 'lcd', dir: 'ltr' }, '0.0 cm'), cntOut = h('b', { class: 'lcd', dir: 'ltr' }, '0'), rateOut = h('b', { class: 'lcd', dir: 'ltr' }, '×0.00'), bar = h('i');
      var info = { len: 0, pts: [] };
      function toU(e) { var b = cv.getBoundingClientRect(); return [((e.clientX - b.left) / b.width * S - S / 2) / (S * .45), ((e.clientY - b.top) / b.height * S - S / 2) / (S * .45)]; }
      function update() { info = perim(C); var cm = info.len * RCM; lenOut.textContent = cm.toFixed(1) + ' cm'; cntOut.textContent = String(C.length); rateOut.textContent = '×' + (cm / BIG).toFixed(2); bar.style.width = Math.min(100, cm / BIG / 5 * 100) + '%'; }
      cv.addEventListener('pointerdown', function (e) {
        var q = toU(e);
        for (var i = C.length - 1; i >= 0; i--) if (Math.hypot(q[0] - C[i].x, q[1] - C[i].y) < C[i].r) { C.splice(i, 1); update(); return; }   // 누르면 지우기
        var r = SIZES[size];
        if (Math.hypot(q[0], q[1]) + r > 1.001) { toast(t('r2_inside'), 'bad'); return; }
        C.push({ x: q[0], y: q[1], r: r }); update();
      });
      function draw() {
        var c = S / 2, k = S * .45;
        g.clearRect(0, 0, S, S); g.fillStyle = gas ? '#fde4e4' : '#fff'; g.fillRect(0, 0, S, S);
        g.setLineDash([6, 6]); g.strokeStyle = '#9aa'; g.lineWidth = 2; g.beginPath(); g.arc(c, c, k, 0, 7); g.stroke(); g.setLineDash([]);
        g.fillStyle = '#f6c6d3'; C.forEach(function (o) { g.beginPath(); g.arc(c + o.x * k, c + o.y * k, o.r * k, 0, 7); g.fill(); });
        g.fillStyle = '#b5476b'; info.pts.forEach(function (p) { g.fillRect(c + p[0] * k - 1.5, c + p[1] * k - 1.5, 3, 3); });
        P.forEach(function (p) { g.fillStyle = 'rgba(30,136,229,' + Math.max(0, 1 - p.age / 40) + ')'; g.beginPath(); g.arc(c + p.x * k, c + p.y * k, 4, 0, 7); g.fill(); });
        if (gas) { g.fillStyle = '#c62828'; g.font = 'bold 13px sans-serif'; g.fillText(t('r2_capout'), 8, 18); }
      }
      (function loop() {
        if (!cv.isConnected && timer) return;
        if (gas && info.pts.length) {                // 테두리 길이에 비례해 산소가 테두리를 건너 혈액(바깥)으로
          acc += info.len * .9;
          while (acc >= 1) { acc -= 1; var p = info.pts[Math.floor(Math.random() * info.pts.length)]; P.push({ x: p[0], y: p[1], vx: Math.cos(p[2]) * .012, vy: Math.sin(p[2]) * .012, age: 0 }); }
        }
        P = P.filter(function (p) { p.x += p.vx; p.y += p.vy; p.age++; return p.age < 40; });
        draw(); timer = setTimeout(loop, 40);
      })();
      var sizes = pickOne(['r2_sz_l', 'r2_sz_m', 'r2_sz_s'], function (k) { size = { r2_sz_l: 'L', r2_sz_m: 'M', r2_sz_s: 'S' }[k]; }, 'inline');
      sizes.children[1].setAttribute('aria-pressed', 'true');
      var gasBtn = h('button', { type: 'button', class: 'btn toggle', 'aria-pressed': 'false' }, h('span', { k: 'r2_gas' }), ' ', h('b', { class: 'onoff' }, 'OFF'));
      gasBtn.addEventListener('click', function () { gas = !gas; gasBtn.setAttribute('aria-pressed', String(gas)); gasBtn.querySelector('.onoff').textContent = gas ? 'ON' : 'OFF'; rateBox.hidden = !gas; });
      var rateBox = h('div', { class: 'ratebox', hidden: '' }, h('span', { k: 'r2_rate' }), rateOut, h('div', { class: 'gbar' }, bar));
      var clr = btn('r2_clear', function () { C = []; update(); });
      var tb = h('table', { class: 'data' }, h('tr', {}, h('th', {}, '#'), h('th', { k: 'r2_count' }), h('th', { k: 'r2_len' }), h('th', { k: 'r2_rate' })));
      var after = h('div', { hidden: '' });
      var save = btn('r2_record', function () {
        if (!C.length) { toast(t('r2_needcircle'), 'bad'); return; }
        var cm = info.len * RCM; rec.push({ n: C.length, cm: cm });
        tb.append(h('tr', {}, h('td', { dir: 'ltr' }, String(rec.length)), h('td', { dir: 'ltr' }, String(C.length)), h('td', { dir: 'ltr' }, cm.toFixed(1) + ' cm'), h('td', { dir: 'ltr' }, '×' + (cm / BIG).toFixed(2))));
        var kinds = {}; rec.forEach(function (r) { kinds[r.n] = 1; });
        if (Object.keys(kinds).length >= 3 && after.hidden) { after.hidden = false; App.send({ action: 'answer', act: 'r2', key: 'shapes', text: rec.map(function (r) { return r.n + ':' + r.cm.toFixed(1); }).join(', ') }); }
      }, 'btn primary');
      var fb = fillBlank('r2_lung', [{ opts: ['r_alv', 'r_bron'], ans: 'r_alv' }, { opts: ['r2_area', 'r2_mass'], ans: 'r2_area' }, { opts: ['c3_gasex', 'r1_digest'], ans: 'c3_gasex' }]);
      after.append(choice('r2_q2', ['r2_up', 'r2_down', 'r2_same2'], 0, function () {
        var ck = btn('check', function () {
          if (!fb.check()) { ctx.miss(); toast(t('try_again'), 'bad'); return; }
          fb.lock(); ck.remove(); App.send({ action: 'answer', act: 'r2', key: 'lung', text: fb.text() });
          after.append(note('r2_fact', 'result')); applyI18n(after); ctx.ready();
        }, 'btn primary');
        after.append(h('div', { class: 'panel' }, fb, ck)); applyI18n(after);
      }, ctx.miss));
      update();
      box.append(todo('r2_s1_todo'), h('div', { class: 'cols' },
        h('div', { class: 'panel alvcard' }, cv, h('div', { class: 'row' }, h('span', { k: 'r2_count' }), cntOut, h('span', { k: 'r2_len' }), lenOut)),
        h('div', { class: 'panel' }, note('r2_how', 'strong'), h('b', { k: 'r2_size' }), sizes, h('div', { class: 'row' }, clr, gasBtn), rateBox, save, tb)), after);
    },
    /* ② 허파꽈리와 모세혈관 사이 기체 교환 — 농도 차이에 따라 입자가 움직이는 모형 */
    function (box, ctx) {
      var W = 460, H = 260, MID = W / 2, cv = h('canvas', { class: 'diffcv', width: String(W), height: String(H) }), g = cv.getContext('2d');
      var P = [], run = false, flow = false, timer = null, tick = 0, hist = [], seen = 0;
      function mk(o2, x0, x1, n) { for (var i = 0; i < n; i++) { var a = Math.random() * 6.28, sp = 1.4 + Math.random() * 1.2; P.push({ o: o2, x: x0 + Math.random() * (x1 - x0), y: 10 + Math.random() * (H - 20), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp }); } }
      function reset() { P = []; mk(1, 8, MID - 8, 44); mk(0, MID + 8, W - 8, 44); mk(1, MID + 8, W - 8, 4); mk(0, 8, MID - 8, 4); tick = 0; hist = []; }
      function pore(y) { return (y % 36) > 22; }       // 막의 구멍(점선 사이)
      function cnt() { var c = { aO: 0, aC: 0, bO: 0, bC: 0 }; P.forEach(function (p) { if (p.x < MID) p.o ? c.aO++ : c.aC++; else p.o ? c.bO++ : c.bC++; }); return c; }
      var bars = h('div', { class: 'cbars' }), net = h('p', { class: 'note strong', dir: 'auto' });
      function barRow(k, a, b, col) { var mx = 50; return h('div', { class: 'cbar' }, h('b', { k: k }), h('div', { class: 'cb2' }, h('span', { class: 'l' }, h('i', { style: 'width:' + Math.min(100, a / mx * 100) + '%;background:' + col }), h('em', { dir: 'ltr' }, String(a))), h('span', { class: 'r' }, h('i', { style: 'width:' + Math.min(100, b / mx * 100) + '%;background:' + col }), h('em', { dir: 'ltr' }, String(b))))); }
      function draw() {
        g.clearRect(0, 0, W, H);
        g.fillStyle = '#e8f4fb'; g.fillRect(0, 0, MID, H); g.fillStyle = '#fde4e4'; g.fillRect(MID, 0, MID, H);
        g.fillStyle = '#b5476b'; for (var y = 0; y < H; y += 36) g.fillRect(MID - 3, y, 6, 22);
        P.forEach(function (p) { g.fillStyle = p.o ? '#1e88e5' : '#616161'; g.beginPath(); if (p.o) g.arc(p.x, p.y, 5, 0, 7); else g.rect(p.x - 5, p.y - 5, 10, 10); g.fill(); });
        if (flow) { g.fillStyle = 'rgba(198,40,40,.8)'; g.font = 'bold 13px sans-serif'; g.fillText('↓ ' + t('r2_flowing'), MID + 10, H - 10); }
        if ((draw.n = (draw.n || 0) + 1) % 6) return;   // 막대·문장은 6번에 한 번만 새로 그림
        var c = cnt(); bars.innerHTML = '';
        bars.append(h('div', { class: 'cbar head' }, h('span'), h('div', { class: 'cb2' }, h('b', { k: 'r_alv' }), h('b', { k: 'r1_cap' }))), barRow('c3_o2', c.aO, c.bO, '#1e88e5'), barRow('c3_co2', c.aC, c.bC, '#616161'));
        applyI18n(bars);
        hist.push(c); if (hist.length > 60) hist.shift();
        var old = hist[0], dO = c.bO - old.bO, dC = c.aC - old.aC;
        net.textContent = t('r2_net') + ' ' + t('c3_o2') + ' ' + (dO > 0 ? '→ ' + t('r1_cap') : dO < 0 ? '← ' + t('r_alv') : '·') + ' / ' + t('c3_co2') + ' ' + (dC > 0 ? '→ ' + t('r_alv') : dC < 0 ? '← ' + t('r1_cap') : '·');
      }
      function step() {
        P.forEach(function (p) {
          var nx = p.x + p.vx, ny = p.y + p.vy;
          if (ny < 6 || ny > H - 6) { p.vy *= -1; ny = p.y + p.vy; }
          if (nx < 6 || nx > W - 6) { p.vx *= -1; nx = p.x + p.vx; }
          if ((p.x < MID) !== (nx < MID) && !pore(p.y)) { p.vx *= -1; nx = p.x + p.vx; }     // 막에 부딪히면 튕김, 구멍으로만 통과
          p.x = nx; p.y = ny;
          if (Math.random() < .03) { var a = Math.atan2(p.vy, p.vx) + (Math.random() - .5) * 1.2, sp = Math.hypot(p.vx, p.vy); p.vx = Math.cos(a) * sp; p.vy = Math.sin(a) * sp; }
        });
        if (flow && tick % 12 === 0) {                 // 혈액이 흘러 산소를 실어 가고 이산화 탄소를 새로 가져옴 → 농도 차이 유지
          var o = P.filter(function (p) { return p.o && p.x > MID; }); if (o.length > 4) P.splice(P.indexOf(o[0]), 1);
          if (P.filter(function (p) { return !p.o && p.x > MID; }).length < 40) mk(0, W - 30, W - 8, 1);
          if (P.filter(function (p) { return p.o && p.x < MID; }).length < 40) mk(1, 8, 30, 1);         // 숨을 쉬어 허파꽈리에 새 공기
          var cl = P.filter(function (p) { return !p.o && p.x < MID; }); if (cl.length > 4) P.splice(P.indexOf(cl[0]), 1);
        }
        tick++;
      }
      (function loop() { if (!cv.isConnected && timer) return; if (run) { step(); step(); if (tick > 500) seen = 1; } draw(); if (seen && quiz.hidden) quiz.hidden = false; timer = setTimeout(loop, 33); })();
      reset();
      var go = btn('r2_run', function () { run = !run; go.setAttribute('data-k', run ? 'r2_pause' : 'r2_run'); go.textContent = t(run ? 'r2_pause' : 'r2_run'); }, 'btn primary');
      var again = btn('r2_reset', function () { reset(); });
      var fl = h('button', { type: 'button', class: 'btn toggle', 'aria-pressed': 'false' }, h('span', { k: 'r2_flow' }), ' ', h('b', { class: 'onoff' }, 'OFF'));
      fl.addEventListener('click', function () { flow = !flow; fl.setAttribute('aria-pressed', String(flow)); fl.querySelector('.onoff').textContent = flow ? 'ON' : 'OFF'; });
      var quiz = h('div', { hidden: '' });
      var fb = fillBlank('r2_diff', [{ opts: ['r_alv', 'r1_cap'], ans: 'r_alv' }, { opts: ['r_alv', 'r1_cap'], ans: 'r1_cap' }, { opts: ['r_alv', 'r1_cap'], ans: 'r1_cap' }, { opts: ['r_alv', 'r1_cap'], ans: 'r_alv' }, { opts: ['r2_diffusion', 'r2_filtration', 'r2_photo'], ans: 'r2_diffusion' }]);
      var ck = btn('check', function () {
        if (!fb.check()) { ctx.miss(); toast(t('try_again'), 'bad'); return; }
        fb.lock(); ck.remove();
        quiz.append(choice('r2_q3', ['r2_q3a', 'r2_q3b', 'r2_q3c'], 0, function () {
          App.send({ action: 'answer', act: 'r2', key: 'summary', text: t('r2_summary') });
          quiz.append(note('r2_summary', 'result'), btn('finish', ctx.finish, 'btn primary big')); applyI18n(quiz);
        }, ctx.miss)); applyI18n(quiz);
      }, 'btn primary');
      quiz.append(h('div', { class: 'panel' }, fb, ck));
      box.append(todo('r2_s3_todo'), note('r2_diff_intro'), h('div', { class: 'cols wide1' }, h('div', { class: 'panel' }, h('div', { class: 'row' }, h('span', { class: 'lg o2' }, '● ', h('span', { k: 'c3_o2' })), h('span', { class: 'lg co2' }, '■ ', h('span', { k: 'c3_co2' }))), cv, h('div', { class: 'row' }, go, again, fl)),
        h('div', { class: 'panel' }, h('h3', { k: 'r2_conc_t' }), bars, net, note('r2_flow_desc'))), quiz);
    }
  ] };
})();
