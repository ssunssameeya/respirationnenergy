/* 호흡계 3: 호흡 운동의 원리 — 들숨과 날숨을 나누어 흉강·폐의 부피, 폐의 압력, 공기 이동을 입자와 화살표로 (교과서 p210, 그림 6-9, 표 6-1)
   교과서 지도 방향에 따라 흉강 안의 압력은 다루지 않고, 흉강의 부피와 폐의 부피·압력만 보여 줍니다. */
(function () {
  var CW = 360, CH = 440, CX = 180;
  function sim(full) {
    var cv = h('canvas', { class: 'breathcv', width: String(CW), height: String(CH) }), g = cv.getContext('2d');
    var st = { d: full ? 1 : 0, rb: full ? 1 : 0, td: full ? 1 : 0, trb: full ? 1 : 0 }, lungs = [], fly = [], outside = [], acc = 0, rho = 0, flow = 0, pd = st.d, prb = st.rb;
    function W() { return 118 + 16 * st.rb; }
    function diaY(x) { var w = W(), tt = Math.max(0, Math.min(1, (x - (CX - w)) / (2 * w))), C = 252 + 110 * st.d; return 372 - 2 * tt * (1 - tt) * (372 - C); }
    function lungX(side) { var w = W(); return side ? [CX + 26, CX + w - 14] : [CX - w + 14, CX - 26]; }
    function topY(side, x) { var r = lungX(side), u = side ? (x - r[0]) / (r[1] - r[0]) : (r[1] - x) / (r[1] - r[0]); return 168 + 46 * u * u; }
    function vol(lung) {                                // 폐의 부피(lung) 또는 흉강의 부피 — 그림의 넓이로 계산
      var v = 0;
      if (lung) [0, 1].forEach(function (s) { var r = lungX(s); for (var x = r[0]; x < r[1]; x += 2) v += Math.max(0, diaY(x) - 8 - topY(s, x)) * 2; });
      else { var w = W(); for (var x = CX - w; x < CX + w; x += 2) v += Math.max(0, diaY(x) - 150) * 2; }
      return v;
    }
    function lp(p) { var r = lungX(p.s), x = r[0] + p.u * (r[1] - r[0]), t0 = topY(p.s, x), b = diaY(x) - 8; return [x, t0 + 5 + p.v * Math.max(0, b - t0 - 10)]; }
    function addLung() { lungs.push({ s: Math.random() < .5 ? 0 : 1, u: .06 + Math.random() * .88, v: Math.random() }); }
    rho = 64 / vol(true);
    for (var i = 0, n = Math.round(rho * vol(true)); i < n; i++) addLung();
    for (var j = 0; j < 30; j++) outside.push([10 + Math.random() * (CW - 20), 8 + Math.random() * 30]);
    var V0 = { c: [0, 0], l: [0, 0] };
    (function range() { var s = { d: st.d, rb: st.rb }; st.d = 0; st.rb = 0; V0.c[0] = vol(false); V0.l[0] = vol(true); st.d = 1; st.rb = 1; V0.c[1] = vol(false); V0.l[1] = vol(true); st.d = s.d; st.rb = s.rb; })();
    function arrow(x, y, dy, wid, col) {
      if (Math.abs(dy) < 4) return;
      var s = dy > 0 ? 1 : -1, hl = Math.min(14, Math.abs(dy) * .6);
      g.strokeStyle = col; g.fillStyle = col; g.lineWidth = wid; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + dy - s * hl); g.stroke();
      g.beginPath(); g.moveTo(x - wid * 1.6, y + dy - s * hl); g.lineTo(x + wid * 1.6, y + dy - s * hl); g.lineTo(x, y + dy); g.closePath(); g.fill();
    }
    function draw() {
      var w = W();
      g.clearRect(0, 0, CW, CH);
      g.fillStyle = '#e8f4fb'; g.fillRect(0, 0, CW, 44);
      g.fillStyle = '#1f2a24'; g.font = 'bold 13px sans-serif'; g.textAlign = 'left'; g.fillText(t('r3_air'), 8, 58);
      outside.forEach(function (p) { g.fillStyle = '#1e88e5'; g.beginPath(); g.arc(p[0] + (Math.random() - .5) * 2, p[1] + (Math.random() - .5) * 2, 3.5, 0, 7); g.fill(); });
      /* 흉강 */
      g.fillStyle = '#fdf1ea'; g.strokeStyle = '#3b2a2c'; g.lineWidth = 3;
      g.beginPath(); g.moveTo(CX - 40, 120); g.quadraticCurveTo(CX - w, 130, CX - w, 210); g.lineTo(CX - w, 372);
      for (var x = CX - w; x <= CX + w; x += 4) g.lineTo(x, diaY(x));
      g.lineTo(CX + w, 210); g.quadraticCurveTo(CX + w, 130, CX + 40, 120); g.closePath(); g.fill(); g.stroke();
      /* 폐 */
      [0, 1].forEach(function (s) {
        var r = lungX(s); g.fillStyle = 'rgba(201,149,184,.55)'; g.strokeStyle = '#8e4a73'; g.lineWidth = 2; g.beginPath();
        for (var x = r[0]; x <= r[1]; x += 2) { var y = topY(s, x); if (x === r[0]) g.moveTo(x, y); else g.lineTo(x, y); }
        for (var x2 = r[1]; x2 >= r[0]; x2 -= 2) g.lineTo(x2, diaY(x2) - 8);
        g.closePath(); g.fill(); g.stroke();
      });
      /* 숨관과 숨관가지 */
      g.strokeStyle = '#e57373'; g.lineWidth = 14; g.lineCap = 'round'; g.beginPath(); g.moveTo(CX, 40); g.lineTo(CX, 150); g.moveTo(CX, 150); g.lineTo(CX - 40, 190); g.moveTo(CX, 150); g.lineTo(CX + 40, 190); g.stroke();
      /* 갈비뼈: 올라가면 더 수평이 됨 */
      g.strokeStyle = 'rgba(214,196,150,.95)'; g.lineWidth = 6;
      for (var k = 0; k < 6; k++) { var y0 = 150 + k * 32, drop = 10 + 34 * (1 - st.rb); g.beginPath(); g.moveTo(CX - 12, y0); g.quadraticCurveTo(CX - w * .7, y0 - 4, CX - w, y0 + drop); g.moveTo(CX + 12, y0); g.quadraticCurveTo(CX + w * .7, y0 - 4, CX + w, y0 + drop); g.stroke(); }
      g.lineCap = 'butt';
      /* 가로막 */
      g.strokeStyle = '#c0392b'; g.lineWidth = 9; g.beginPath(); for (var x3 = CX - w; x3 <= CX + w; x3 += 4) { if (x3 === CX - w) g.moveTo(x3, diaY(x3)); else g.lineTo(x3, diaY(x3)); } g.stroke();
      g.fillStyle = '#c0392b'; g.font = 'bold 13px sans-serif'; g.textAlign = 'center'; g.fillText(t('r_dia'), CX, diaY(CX) + 26);
      /* 기체 입자 */
      g.fillStyle = '#1e88e5';
      lungs.forEach(function (p) { p.u = Math.max(.04, Math.min(.96, p.u + (Math.random() - .5) * .02)); p.v = Math.max(0, Math.min(1, p.v + (Math.random() - .5) * .03)); var q = lp(p); g.beginPath(); g.arc(q[0], q[1], 3.5, 0, 7); g.fill(); });
      fly.forEach(function (f) { g.beginPath(); g.arc(f.x, f.y, 3.5, 0, 7); g.fill(); });
      /* 움직임 화살표: 가로막, 갈비뼈, 공기 */
      arrow(CX, diaY(CX) + 34, (st.d - pd) * 4000, 4, '#c0392b');
      arrow(CX - w - 14, 260, -(st.rb - prb) * 4000, 4, '#a08850'); arrow(CX + w + 14, 260, -(st.rb - prb) * 4000, 4, '#a08850');
      arrow(CX + 34, flow > 0 ? 50 : 130, flow * 90, 3 + Math.min(6, Math.abs(flow) * 6), '#1565c0');
    }
    function step() {
      pd = st.d; prb = st.rb;
      st.d += Math.max(-.006, Math.min(.006, st.td - st.d)); st.rb += Math.max(-.006, Math.min(.006, st.trb - st.rb));
      var eq = rho * vol(true), N = lungs.length + fly.filter(function (f) { return f.in; }).length;
      flow = (eq - N) / 10;                          // 양수: 몸 밖 → 폐, 음수: 폐 → 몸 밖
      acc += (eq - N) * .03;
      while (acc >= 1) { acc -= 1; fly.push({ in: true, x: CX + (Math.random() - .5) * 8, y: 40, s: Math.random() < .5 ? 0 : 1 }); }
      while (acc <= -1 && lungs.length) { acc += 1; var p = lungs.splice(Math.floor(Math.random() * lungs.length), 1)[0], q = lp(p); fly.push({ in: false, x: q[0], y: q[1] }); }
      fly = fly.filter(function (f) {
        if (f.in) {
          if (f.y < 150) { f.y += 4; return true; }
          var tx = CX + (f.s ? 40 : -40), ty = 190; f.x += (tx - f.x) * .25; f.y += (ty - f.y) * .25;
          if (Math.abs(f.y - ty) < 3) { lungs.push({ s: f.s, u: f.s ? .05 + Math.random() * .3 : .65 + Math.random() * .3, v: Math.random() * .4 }); return false; }
          return true;
        }
        if (Math.abs(f.x - CX) > 3 || f.y > 152) { f.x += (CX - f.x) * .2; f.y += (150 - f.y) * .2; if (Math.abs(f.x - CX) < 3 && Math.abs(f.y - 150) < 4) f.y = 150; return true; }
        f.y -= 4; return f.y > 38;
      });
      draw();
    }
    function info() {
      var vc = vol(false), vl = vol(true), N = lungs.length + fly.filter(function (f) { return f.in; }).length;
      return { c: (vc - V0.c[0]) / (V0.c[1] - V0.c[0]), l: (vl - V0.l[0]) / (V0.l[1] - V0.l[0]), p: N / (rho * vl), d: st.d, rb: st.rb, moving: Math.abs(st.td - st.d) > .001 || Math.abs(st.trb - st.rb) > .001 };
    }
    /* 화면 오른쪽 계기판 */
    function bar(k) { var fill = h('i'), val = h('b', { class: 'gv' }); return { el: h('div', { class: 'gauge' }, h('span', { k: k }), h('div', { class: 'gbar' }, fill), val), fill: fill, val: val }; }
    var gc = bar('r3_vc'), gl = bar('r3_vl'), pf = h('i', { class: 'pfill' }), pv = h('b', { class: 'gv' });
    var gp = h('div', { class: 'gauge' }, h('span', { k: 'r3_pl' }), h('div', { class: 'gbar pbar' }, h('em', { class: 'patm', k: 'r3_atm' }), pf), pv);
    var flowTxt = h('p', { class: 'note strong flowtxt' });
    function gauges() {
      var f = info();
      gc.fill.style.width = (25 + 75 * f.c) + '%'; gl.fill.style.width = (25 + 75 * f.l) + '%';
      gc.val.textContent = Math.round(100 + 40 * f.c) + ''; gl.val.textContent = Math.round(100 + 40 * f.l) + '';
      var dp = Math.max(-1, Math.min(1, (f.p - 1) * 6));
      pf.style.width = Math.abs(dp) * 50 + '%'; pf.style.left = dp < 0 ? (50 + dp * 50) + '%' : '50%'; pf.className = 'pfill ' + (dp < -.15 ? 'low' : dp > .15 ? 'high' : '');
      pv.setAttribute('data-k', dp < -.15 ? 'r3_low' : dp > .15 ? 'r3_high' : 'r3_eq'); pv.textContent = t(pv.getAttribute('data-k'));
      flowTxt.setAttribute('data-k', flow > .25 ? 'r3_flow_in' : flow < -.25 ? 'r3_flow_out' : 'r3_flow_no'); flowTxt.textContent = t(flowTxt.getAttribute('data-k'));
    }
    var raf = null;
    (function loop() { if (!cv.isConnected && raf) return; step(); gauges(); raf = setTimeout(loop, 33); })();
    /* 들이쉬기·내쉬기 버튼: 가로막과 갈비뼈가 함께 움직임 */
    var pressed = {}, nowK = h('b', { class: 'breathnow' });
    function breathe(inh) { st.td = st.trb = inh ? 1 : 0; pressed[inh ? 'in' : 'out'] = 1; nowK.setAttribute('data-k', inh ? 'r3_in_t' : 'r3_out_t'); nowK.textContent = t(inh ? 'r3_in_t' : 'r3_out_t'); }
    var bIn = btn('r3_btn_in', function () { breathe(true); }, 'btn primary big'), bOut = btn('r3_btn_out', function () { breathe(false); }, 'btn big');
    var el = h('div', { class: 'cols breath' }, h('div', { class: 'panel' }, cv),
      h('div', { class: 'panel' }, h('div', { class: 'row' }, bIn, bOut), h('p', { class: 'note strong' }, h('span', { k: 'r3_now' }), ' ', nowK), gc.el, gl.el, gp, flowTxt, note('r3_legend')));
    return { el: el, info: info, pressed: pressed };
  }

  /* 표 정리: 들숨·날숨 × 가로막·갈비뼈·흉강 부피·폐 부피·폐 압력·공기 이동 */
  var COLS = [['r_dia', ['r3_down2', 'r3_up2']], ['r_rib', ['r3_up2', 'r3_down2']], ['r3_vc', ['r3_big', 'r3_small']], ['r3_vl', ['r3_big', 'r3_small']], ['r3_pl_cmp', ['r3_lower', 'r3_higher']], ['card_air', ['r3_in', 'r3_out']]];
  function breathTable() {
    var sels = [], tb = h('table', { class: 'data brtable' }, h('tr', {}, h('th', { k: 'card_kind' }), COLS.map(function (c) { return h('th', { k: c[0] }); })));
    [['r3_in_t', 0], ['r3_out_t', 1]].forEach(function (r) {
      var tr = h('tr', {}, h('th', { k: r[0] }));
      COLS.forEach(function (c) {
        var sel = h('select', { class: 'blank' }); sel.append(h('option', { value: '' }, '( ? )'));
        shuffle(c[1]).forEach(function (o) { sel.append(h('option', { value: o, k: o })); });
        sel._ans = c[1][r[1]]; sel.addEventListener('change', function () { sel.classList.remove('good', 'bad'); }); sels.push(sel); tr.append(h('td', {}, sel));
      });
      tb.append(tr);
    });
    tb.check = function () { var ok = true; sels.forEach(function (x) { var g = x.value === x._ans; x.classList.toggle('good', g); x.classList.toggle('bad', !g); if (!g) ok = false; }); return ok; };
    tb.lock = function () { sels.forEach(function (x) { x.disabled = true; }); };
    tb.text = function () { return sels.map(function (x) { return x.value ? t(x.value) : '?'; }).join(', '); };
    return tb;
  }

  ACT.r3 = { id: 'r3', title: 't_r3', steps: [
    /* ① 들이쉬기·내쉬기를 눌러 관찰하고 표로 정리 */
    function (box, ctx) {
      var s = sim(false), tb = breathTable();
      var ck = btn('check', function () {
        if (!s.pressed.in || !s.pressed.out) { toast(t('r3_needboth'), 'bad'); return; }
        if (!tb.check()) { ctx.miss(); toast(t('try_again'), 'bad'); return; }
        tb.lock(); ck.remove(); App.send({ action: 'answer', act: 'r3', key: 'table', text: tb.text() });
        box.append(note('r3_inok', 'result'), note('r3_outok', 'result')); applyI18n(box); ctx.ready();
      }, 'btn primary');
      box.append(todo('r3_s1_todo'), s.el, h('div', { class: 'panel' }, h('h3', { k: 'r3_tab_t' }), h('div', { class: 'scroll' }, tb), ck));
    },
    /* ③ 원인과 결과 순서 + 생각해 보기 */
    function (box, ctx) {
      var CH = ['c1', 'c2', 'c3', 'c4', 'c5'], sl = CH.map(function (k, i) { return h('div', { 'data-slot': 'p' + i, class: 'pathslot' }); });
      var board = dragBoard(shuffle(CH).map(function (k) { return { id: k, k: 'r3_' + k }; }), sl);
      var path = h('div', { class: 'foodpath chain' }); sl.forEach(function (s, i) { path.append(h('span', { class: 'pnum', dir: 'ltr' }, String(i + 1)), s); if (i < 4) path.append(h('b', { class: 'parr' }, '→')); });
      var after = h('div', { hidden: '' });
      var ck = btn('check', function () {
        var ok = true; CH.forEach(function (k, i) { var g = board.get('p' + i) === k; board.mark('p' + i, g); if (!g) ok = false; });
        if (!ok) { ctx.miss(); toast(t('try_again'), 'bad'); return; }
        board.lock(); ck.remove(); after.hidden = false;
      }, 'btn primary');
      after.append(h('div', { class: 'panel' }, h('h3', { k: 'r3_think_t' }), choice('r3_think', ['r3_th1', 'r3_th2', 'r3_th3'], 0, function () {
        App.send({ action: 'answer', act: 'r3', key: 'summary', text: t('r3_summary') });
        after.append(note('r3_th_ok', 'result'), note('r3_summary', 'result'), btn('finish', ctx.finish, 'btn primary big')); applyI18n(after);
      }, ctx.miss)));
      box.append(todo('r3_s3_todo'), h('div', { class: 'panel' }, h('h3', { k: 'r3_chain_t' }), path, board.tray, ck), after);
    }
  ] };
})();
