/* 순환계 3: 혈액이 순환하는 경로 — 허파순환과 온몸순환 (교과서 p204~205, 그림 6-7)
   ③ 적혈구 미로: 실제 혈관 연결이 아니라 바른 순환 경로를 찾는 미로입니다(화면에 주의 문구). */
(function () {
  var SYSP = ['h_lv', 'h_ao', 'c3_bodycap', 'h_vc', 'h_ra'], PULP = ['h_rv', 'h_pa', 'c3_lungcap', 'h_pv', 'h_la'];
  var NODE = { h_lv: 'LV', h_ao: 'AO', c3_bodycap: 'BODY', h_vc: 'VC', h_ra: 'RA', h_rv: 'RV', h_pa: 'PA', c3_lungcap: 'LUNG', h_pv: 'PV', h_la: 'LA' };
  function figure(hl) { return h('div', { class: 'panel loopbox', html: loopSvg({ hl: hl }) }); }

  /* ---------- 미로 ---------- */
  var M = {                                           // 방(장소) 위치: 순환 모식도와 같은 배치
    LV: [430, 320], AO: [620, 390], BODY: [380, 470], VC: [140, 390], RA: [330, 240], RV: [330, 320], PA: [180, 140], LUNG: [380, 60], PV: [580, 140], LA: [430, 240]
  };
  var ROUTE = ['LV', 'AO', 'BODY', 'VC', 'RA', 'RV', 'PA', 'LUNG', 'PV', 'LA', 'LV'];
  var KEY = { LV: 'h_lv', AO: 'h_ao', BODY: 'c3_bodycap', VC: 'h_vc', RA: 'h_ra', RV: 'h_rv', PA: 'h_pa', LUNG: 'c3_lungcap', PV: 'h_pv', LA: 'h_la' };
  var PIPE = {                                        // 바른 길(굽은 통로)
    'LV-AO': [[430, 320], [620, 320], [620, 390]], 'AO-BODY': [[620, 390], [620, 470], [380, 470]], 'BODY-VC': [[380, 470], [140, 470], [140, 390]],
    'VC-RA': [[140, 390], [140, 240], [330, 240]], 'RA-RV': [[330, 240], [330, 320]], 'RV-PA': [[330, 320], [250, 320], [250, 140], [180, 140]],
    'PA-LUNG': [[180, 140], [180, 60], [380, 60]], 'LUNG-PV': [[380, 60], [580, 60], [580, 140]], 'PV-LA': [[580, 140], [580, 240], [430, 240]], 'LA-LV': [[430, 240], [430, 320]]
  };
  var RED = { 'LV-AO': 1, 'AO-BODY': 1, 'PV-LA': 1, 'LA-LV': 1, 'LUNG-PV': 1 };
  var WRONG = {                                       // 막다른 길: [가려는 곳, 막힌 까닭, 통로 방향]
    LV: [['h_vc', 'c3_why_lvout', [0, 70]], ['h_la', 'c3_why_valve', [70, 0]]],
    AO: [['c3_lungcap', 'c3_why_ao', [70, 0]], ['h_lv', 'c3_why_back', [0, -60]]],
    BODY: [['h_pv', 'c3_why_body', [0, 40]], ['h_ao', 'c3_why_back', [70, -50]]],
    VC: [['h_la', 'c3_why_vc', [-70, 0]], ['h_rv', 'c3_why_vc', [60, 40]]],
    RA: [['h_la', 'c3_why_wall', [40, -60]], ['h_vc', 'c3_why_back', [-40, -60]]],
    RV: [['h_ao', 'c3_why_rvout', [40, 60]], ['h_ra', 'c3_why_valve', [-60, 40]]],
    PA: [['c3_bodycap', 'c3_why_pa', [-70, 30]], ['h_rv', 'c3_why_back', [0, 70]]],
    LUNG: [['h_vc', 'c3_why_lung', [0, -40]], ['h_pa', 'c3_why_back', [-70, 0]]],
    PV: [['h_ra', 'c3_why_pv', [70, 0]], ['h_lv', 'c3_why_pv', [60, 50]]],
    LA: [['h_ra', 'c3_why_wall', [0, -60]], ['h_pv', 'c3_why_back', [70, -40]]]
  };
  function poly(pts) { return pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0] + ' ' + p[1]; }).join(' '); }
  function mazeSvg() {
    var o = '<rect x="0" y="0" width="760" height="530" rx="20" fill="#2b2230"/>';
    Object.keys(WRONG).forEach(function (n) { WRONG[n].forEach(function (w) { var a = M[n], b = [a[0] + w[2][0], a[1] + w[2][1]]; o += '<path d="' + poly([a, b]) + '" stroke="#5c4b60" stroke-width="22" stroke-linecap="round"/><text x="' + b[0] + '" y="' + (b[1] + 5) + '" font-size="16" text-anchor="middle" fill="#ff8a80">✕</text>'; }); });
    Object.keys(PIPE).forEach(function (k) { o += '<path d="' + poly(PIPE[k]) + '" fill="none" stroke="#1d171f" stroke-width="30" stroke-linejoin="round" stroke-linecap="round"/><path d="' + poly(PIPE[k]) + '" fill="none" stroke="' + (RED[k] ? '#b71c1c' : '#1e4fa3') + '" stroke-width="22" stroke-linejoin="round" stroke-linecap="round" opacity=".85"/>'; });
    Object.keys(M).forEach(function (n) {
      var p = M[n], big = n === 'LUNG' || n === 'BODY', heart = /^(RA|RV|LA|LV)$/.test(n);
      o += '<g class="room room-' + n + '"><rect x="' + (p[0] - (big ? 80 : 46)) + '" y="' + (p[1] - 24) + '" width="' + (big ? 160 : 92) + '" height="48" rx="12" fill="' + (big ? (n === 'LUNG' ? '#c8e6c9' : '#ffe0b2') : heart ? '#f3e5f5' : '#eceff1') + '" stroke="#ffd54f" stroke-width="3"/>'
        + '<text x="' + p[0] + '" y="' + (p[1] + 6) + '" font-size="15" font-weight="800" text-anchor="middle" fill="#2b2230"' + (String(t(KEY[n])).length * 9.3 > (big ? 150 : 84) ? ' textLength="' + (big ? 150 : 84) + '" lengthAdjust="spacingAndGlyphs"' : '') + '>' + String(t(KEY[n])).replace(/</g, '') + '</text></g>';
    });
    return '<svg class="mazesvg" viewBox="0 0 760 530" xmlns="http://www.w3.org/2000/svg">' + o + '<g class="rbcg"><ellipse rx="20" ry="13" fill="#ef3b2d" stroke="#fff" stroke-width="3"/><ellipse rx="8" ry="4" fill="#9b1c13"/></g></svg>';
  }
  /* 모세혈관에서 물질 교환 장면 (모션그래픽) */
  function exchangeSvg(lung) {
    var o = '<rect width="420" height="170" rx="16" fill="' + (lung ? '#e3f4e7' : '#fff3e0') + '"/>';
    o += '<rect x="0" y="70" width="420" height="34" fill="#f8c9c9"/><text x="10" y="92" font-size="13" font-weight="700" fill="#b71c1c">' + t('c2_v_c') + '</text>';
    o += lung ? '<circle cx="210" cy="30" r="26" fill="#f2b8c6" stroke="#b5476b" stroke-width="2"/><text x="210" y="35" font-size="12" text-anchor="middle" font-weight="700">' + t('r_alv') + '</text>'
      : [60, 160, 260, 360].map(function (x) { return '<rect x="' + (x - 30) + '" y="122" width="60" height="40" rx="10" fill="#ffe0b2" stroke="#8d6e63" stroke-width="2"/><text x="' + x + '" y="147" font-size="12" text-anchor="middle">' + t('s1_cell') + '</text>'; }).join('');
    function mv(x1, y1, x2, y2, c, lbl, d) { return '<g><circle r="9" fill="' + c + '" stroke="#3b2a2c" stroke-width="1.5"><animateMotion dur="1.6s" begin="' + d + 's" fill="freeze" path="M' + x1 + ' ' + y1 + ' L' + x2 + ' ' + y2 + '"/></circle><text font-size="9" font-weight="900" text-anchor="middle" dy="3" fill="#fff"><animateMotion dur="1.6s" begin="' + d + 's" fill="freeze" path="M' + x1 + ' ' + y1 + ' L' + x2 + ' ' + y2 + '"/>' + lbl + '</text></g>'; }
    if (lung) o += mv(190, 30, 170, 86, '#1e88e5', 'O₂', 0) + mv(230, 30, 250, 86, '#1e88e5', 'O₂', .4) + mv(300, 86, 236, 22, '#616161', 'CO₂', .2) + mv(120, 86, 186, 22, '#616161', 'CO₂', .6);
    else o += mv(60, 86, 60, 140, '#1e88e5', 'O₂', 0) + mv(160, 86, 160, 140, '#f2c14e', String(t('c3_nut')).charAt(0), .3) + mv(260, 140, 260, 86, '#616161', 'CO₂', .2) + mv(360, 140, 360, 86, '#795548', String(t('c3_waste')).charAt(0), .5);
    return '<svg class="exsvg" viewBox="0 0 420 170" xmlns="http://www.w3.org/2000/svg">' + o + '</svg>';
  }

  ACT.c3 = { id: 'c3', title: 't_c3', steps: [
    /* ① 두 순환 경로 완성 — 카드를 놓을 때마다 옆 모식도에 그곳이 표시됨 */
    function (box, ctx) {
      var fig = figure(null);
      var sS = SYSP.map(function (k, i) { return h('div', { 'data-slot': 's' + i }); }), pS = PULP.map(function (k, i) { return h('div', { 'data-slot': 'p' + i }); });
      var last = {};
      var board = dragBoard(shuffle(SYSP.concat(PULP)).map(function (k) { return { id: k, k: k }; }), sS.concat(pS), function () {
        var ids = sS.concat(pS).map(function (s) { return board.get(s.dataset.slot); }), nw = ids.filter(function (x) { return x && !last[x]; })[0];
        last = {}; ids.forEach(function (x) { if (x) last[x] = 1; });
        if (nw) fig.innerHTML = loopSvg({ hl: NODE[nw] });
      });
      function row(title, cls, slots) { var r = h('div', { class: 'cpath ' + cls }, h('b', { class: 'ctitle', k: title })); slots.forEach(function (s, i) { r.append(h('span', { class: 'pnum', dir: 'ltr' }, String(i + 1)), s); if (i < 4) r.append(h('b', { class: 'parr' }, '→')); }); return r; }
      var ck = btn('check', function () {
        var ok = true;
        SYSP.forEach(function (k, i) { var g = board.get('s' + i) === k; board.mark('s' + i, g); if (!g) ok = false; });
        PULP.forEach(function (k, i) { var g = board.get('p' + i) === k; board.mark('p' + i, g); if (!g) ok = false; });
        if (!ok) { ctx.miss(); toast(t('try_again'), 'bad'); return; }
        board.lock(); ck.remove(); App.send({ action: 'answer', act: 'c3', key: 'path', text: t('c3_pathtxt') }); box.append(note('c3_pathtxt', 'result')); applyI18n(box); ctx.ready();
      }, 'btn primary');
      box.append(todo('c3_s1_todo'), h('div', { class: 'cols wide1' }, h('div', { class: 'panel' }, row('c3_sys', 'cs', sS), row('c3_pul', 'cp', pS), board.tray, ck), fig));
    },
    /* ② 모세혈관에서 일어나는 교환 */
    function (box, ctx) {
      var f1 = fillBlank('c3_ex1', [{ opts: ['c3_o2', 'c3_co2', 'c3_nut'], ans: 'c3_co2' }, { opts: ['c3_o2', 'c3_co2', 'c3_waste'], ans: 'c3_o2' }, { opts: ['c3_gasex', 'c3_matex'], ans: 'c3_gasex' }]);
      var f2 = fillBlank('c3_ex2', [{ opts: ['c3_o2', 'c3_co2'], ans: 'c3_o2' }, { opts: ['c3_o2', 'c3_co2'], ans: 'c3_co2' }, { opts: ['c3_gasex', 'c3_matex'], ans: 'c3_matex' }]);
      var ck = btn('check', function () {
        var ok = [f1, f2].map(function (f) { return f.check(); }).every(Boolean);
        if (!ok) { ctx.miss(); toast(t('try_again'), 'bad'); return; }
        f1.lock(); f2.lock(); ck.remove(); App.send({ action: 'answer', act: 'c3', key: 'exchange', text: f1.text() + ' ' + f2.text() });
        box.append(note('c3_s2ok', 'result')); applyI18n(box); ctx.ready();
      }, 'btn primary');
      box.append(todo('c3_s2_todo'), h('div', { class: 'cols wide1' }, h('div', { class: 'panel' }, h('h3', { k: 'rule_t' }), h('div', { class: 'exbox', html: exchangeSvg(true) }), f1, h('div', { class: 'exbox', html: exchangeSvg(false) }), f2, ck), figure(null)));
    },
    /* ③ 적혈구 미로 탈출 + O/X */
    function (box, ctx) {
      var i = 0, rich = true, busy = false, wrap = h('div', { class: 'mazewrap', html: mazeSvg() }), svg = wrap.firstChild, rbc = svg.querySelector('.rbcg');
      var doors = h('div', { class: 'doors' }), here = h('b', { class: 'here' }), msg = h('div', { class: 'mazemsg' }), side = figure(ROUTE[0]), scene = h('div', { class: 'exbox' });
      function put(p) { rbc.setAttribute('transform', 'translate(' + p[0] + ' ' + p[1] + ')'); }
      function paint() { rbc.firstChild.setAttribute('fill', rich ? '#ef3b2d' : '#8e2424'); }
      function walk(pts, done) {                     // 통로를 따라 적혈구 이동
        var seg = [], tot = 0; for (var k = 1; k < pts.length; k++) { var l = Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]); seg.push(l); tot += l; }
        var d = 0, sp = 9;
        (function go() {
          d = Math.min(tot, d + sp); var acc = 0;
          for (var k = 0; k < seg.length; k++) { if (d <= acc + seg[k]) { var f = (d - acc) / seg[k]; put([pts[k][0] + (pts[k + 1][0] - pts[k][0]) * f, pts[k][1] + (pts[k + 1][1] - pts[k][1]) * f]); break; } acc += seg[k]; }
          if (d < tot && wrap.isConnected) setTimeout(go, 30); else done();
        })();
      }
      function at() {
        var n = ROUTE[i]; here.setAttribute('data-k', KEY[n]); here.textContent = t(KEY[n]); paint(); put(M[n]);
        side.innerHTML = loopSvg({ hl: n });
        [].forEach.call(svg.querySelectorAll('.room'), function (r) { r.classList.toggle('now', r.classList.contains('room-' + n)); });
        doors.innerHTML = '';
        if (i === ROUTE.length - 1) { msg.innerHTML = ''; msg.append(note('c3_tripdone', 'result')); quiz.hidden = false; applyI18n(msg); return; }
        var nx = ROUTE[i + 1], opts = [{ k: KEY[nx], ok: true }].concat(WRONG[n].map(function (w) { return { k: w[0], why: w[1], dir: w[2] }; }));
        shuffle(opts).forEach(function (o) {
          var b = h('button', { type: 'button', class: 'door' }, '🚪 ', h('span', { k: o.k }));
          b.addEventListener('click', function () {
            if (busy) return; busy = true; msg.innerHTML = '';
            if (!o.ok) {                             // 막다른 길: 들어갔다가 되돌아옴
              ctx.miss(); var a = M[n], end = [a[0] + o.dir[0] * .8, a[1] + o.dir[1] * .8];
              walk([a, end], function () { msg.append(note(o.why, 'warn')); applyI18n(msg); walk([end, a], function () { busy = false; }); b.disabled = true; b.classList.add('bad'); });
              return;
            }
            walk(PIPE[n + '-' + nx], function () {
              i++;
              if (nx === 'LUNG' || nx === 'BODY') {   // 모세혈관 도착: 교환 장면
                rich = nx === 'LUNG'; scene.innerHTML = exchangeSvg(nx === 'LUNG'); scene.prepend(h('b', { k: nx === 'LUNG' ? 'c3_ev_lung' : 'c3_ev_body' })); applyI18n(scene);
                msg.append(scene);
                setTimeout(function () { busy = false; at(); }, 2400);
              } else { busy = false; at(); }
            });
          });
          doors.append(b);
        });
        applyI18n(doors);
      }
      var quiz = h('div', { hidden: '' }, oxQuiz([['c3_q1', 'X', 'c3_a1'], ['c3_q2', 'O', 'c3_a2'], ['c3_q3', 'O', 'c3_a3'], ['c3_q4', 'X', 'c3_a4']], ctx, function () {
        App.send({ action: 'answer', act: 'c3', key: 'summary', text: t('c3_summary') });
        quiz.append(note('c3_summary', 'result'), btn('finish', ctx.finish, 'btn primary big')); applyI18n(quiz);
      }));
      box.append(todo('c3_s3_todo'), h('div', { class: 'cols wide1' }, h('div', { class: 'panel trip' }, wrap, h('div', { class: 'row' }, h('span', { k: 'c3_now' }), here), h('p', { class: 'q', k: 'c3_where' }), doors, msg),
        side), h('p', { class: 'mazewarn', k: 'c3_mazewarn' }), quiz);
      at();
    }
  ] };
})();
