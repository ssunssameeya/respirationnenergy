/* 세포호흡 1: 식물의 호흡에서 세포호흡으로 — 세포호흡 과정을 모형으로 정리 (교과서 p216~217, 오개념 지도: 식물의 호흡과 동물의 세포호흡은 같은 개념)
   세포호흡은 쉴 때도 멈추지 않고, 활동이 많을수록 더 활발해진다는 점이 드러나게 합니다. */
(function () {
  var SAME = ['s1_s1', 's1_s2', 's1_s3', 's1_s4'], DIFF = ['s1_d1', 's1_d2', 's1_d3', 's1_d4'];
  var USES = ['s1_use_heat', 's1_use_brain', 's1_use_voice', 's1_use_muscle', 's1_use_grow'];

  /* 세포 모형: 활동 정도(0 쉬기 ~ 1 달리기)에 따라 영양소·산소가 들어와 마이토콘드리아에서 반응하는 빠르기가 달라짐 */
  function cellModel() {
    var W = 420, H = 300, cv = h('canvas', { class: 'cellcv', width: String(W), height: String(H) }), g = cv.getContext('2d');
    var act = 0, P = [], acc = 0, energy = 0, sec = 0, rate = h('b', { class: 'lcd', dir: 'ltr' }, '0'), timer = null, tick = 0;
    var MI = [[170, 150], [260, 120], [250, 205]];                    // 마이토콘드리아 위치
    function spawn() {
      var m = MI[Math.floor(Math.random() * MI.length)];
      P.push({ k: 'nut', x: -10, y: 120 + Math.random() * 60, m: m, st: 0 });
      P.push({ k: 'o2', x: -10, y: 120 + Math.random() * 60, m: m, st: 0, d: 6 });
    }
    function draw() {
      g.clearRect(0, 0, W, H);
      g.fillStyle = '#fde4ec'; g.fillRect(0, 0, 60, H); g.fillStyle = '#c62828'; g.font = 'bold 13px sans-serif'; g.textAlign = 'center'; g.fillText(t('s1_blood'), 30, 20);
      g.fillStyle = '#fff6e0'; g.strokeStyle = '#3b2a2c'; g.lineWidth = 3; g.beginPath(); g.ellipse(230, 160, 160, 120, 0, 0, 7); g.fill(); g.stroke();
      g.fillStyle = '#b39ddb'; g.beginPath(); g.arc(320, 180, 26, 0, 7); g.fill(); g.fillStyle = '#3b2a2c'; g.fillText(t('s1_nucleus'), 320, 184);
      MI.forEach(function (m) { g.fillStyle = '#ffab91'; g.strokeStyle = '#bf360c'; g.lineWidth = 2; g.beginPath(); g.ellipse(m[0], m[1], 34, 18, -.3, 0, 7); g.fill(); g.stroke(); g.beginPath(); for (var i = -24; i <= 24; i += 8) { g.moveTo(m[0] + i, m[1] - 10); g.lineTo(m[0] + i + 4, m[1] + 10); } g.stroke(); });
      g.fillStyle = '#bf360c'; g.fillText(t('s1_mito'), MI[0][0], MI[0][1] + 36);
      P.forEach(function (p) {
        if (p.k === 'spark') { g.font = 'bold 20px sans-serif'; g.fillStyle = 'rgba(255,193,7,' + Math.max(0, 1 - p.age / 30) + ')'; g.fillText('⚡', p.x, p.y); return; }
        g.fillStyle = { nut: '#f2c14e', o2: '#1e88e5', co2: '#616161', h2o: '#4fc3f7' }[p.k]; g.beginPath();
        if (p.k === 'co2') g.rect(p.x - 5, p.y - 5, 10, 10); else g.arc(p.x, p.y, 5, 0, 7);
        g.fill();
      });
      g.fillStyle = '#3b2a2c'; g.font = 'bold 13px sans-serif'; g.textAlign = 'left'; g.fillText(t('s1_cell'), 90, 60);
    }
    function step() {
      tick++;
      acc += .02 + .16 * act;                                          // 쉬어도 0이 되지 않음
      while (acc >= 1) { acc -= 1; spawn(); }
      var out = [];
      P.forEach(function (p) {
        if (p.k === 'spark') { p.age++; p.y -= 1; if (p.age < 30) out.push(p); return; }
        if (p.k === 'co2' || p.k === 'h2o') { p.x -= 3; p.y += (p.k === 'h2o' ? 1 : -1) * .6; if (p.x > -10) out.push(p); return; }
        var dx = p.m[0] - p.x, dy = p.m[1] - p.y, d = Math.hypot(dx, dy);
        if (d < 8) {                                                   // 반응: 영양소+산소 → 물+이산화 탄소+에너지
          if (p.k === 'nut') { out.push({ k: 'co2', x: p.x, y: p.y }, { k: 'h2o', x: p.x, y: p.y + 6 }, { k: 'spark', x: p.x, y: p.y - 10, age: 0 }); energy++; }
          return;
        }
        p.x += dx / d * 4; p.y += dy / d * 4 + (p.d || 0) * Math.sin(tick / 5) * .1; out.push(p);
      });
      P = out;
      if (tick % 30 === 0) { sec++; rate.textContent = String(energy); energy = 0; }
      draw();
    }
    (function loop() { if (!cv.isConnected && timer) return; step(); timer = setTimeout(loop, 33); })();
    var seen = {}, rng = h('input', { type: 'range', min: '0', max: '100', value: '0', class: 'rng', 'aria-label': t('s1_act') }), onSeen = null;
    rng.addEventListener('input', function () { act = +rng.value / 100; if (act < .05) seen.lo = 1; if (act > .95) seen.hi = 1; if (seen.lo && seen.hi && onSeen) { onSeen(); onSeen = null; } });
    seen.lo = 1;
    var el = h('div', { class: 'panel' }, cv, h('div', { class: 'ctrl' }, h('b', { k: 's1_act' }), h('div', { class: 'row rngrow' }, h('small', { k: 's1_rest' }), rng, h('small', { k: 's1_run' }))),
      h('p', { class: 'note strong' }, h('span', { k: 's1_rate' }), ' ', rate),
      h('div', { class: 'row plegend' }, [['#f2c14e', 's1_nut'], ['#1e88e5', 'c3_o2'], ['#4fc3f7', 'e2_water'], ['#616161', 'c3_co2']].map(function (x) { return h('span', { class: 'pchip' }, h('i', { style: 'background:' + x[0] }), h('span', { k: x[1] })); }), h('span', { class: 'pchip' }, '⚡ ', h('span', { k: 's1_energy' }))));
    return { el: el, whenSeen: function (f) { onSeen = f; } };
  }

  ACT.s1 = { id: 's1', title: 't_s1', steps: [
    /* ① 식물의 호흡 → 세포호흡 */
    function (box, ctx) {
      var f1 = fillBlank('s1_plant', [{ opts: ['s1_always', 's1_dark'], ans: 's1_always' }, { opts: ['c3_o2', 'c3_co2'], ans: 'c3_o2' }, { opts: ['c3_o2', 'c3_co2'], ans: 'c3_co2' }]);
      var f2 = fillBlank('s1_def', [{ opts: ['s1_nut', 'c3_co2'], ans: 's1_nut' }, { opts: ['c3_o2', 'e1_urea'], ans: 'c3_o2' }, { opts: ['c3_co2', 'c3_o2'], ans: 'c3_co2' }, { opts: ['s1_energy', 'c3_o2'], ans: 's1_energy' }]);
      var after = h('div', { hidden: '' });
      var ck = btn('check', function () {
        var ok = [f1, f2].map(function (f) { return f.check(); }).every(Boolean);
        if (!ok) { ctx.miss(); toast(t('try_again'), 'bad'); return; }
        f1.lock(); f2.lock(); ck.remove(); after.hidden = false; App.send({ action: 'answer', act: 's1', key: 'def', text: f2.text() });
      }, 'btn primary');
      after.append(choice('s1_q1', ['s1_q1a', 's1_q1b', 's1_q1c'], 0, function () { after.append(note('s1_s1ok', 'result')); applyI18n(after); ctx.ready(); }, ctx.miss));
      box.append(todo('s1_s1_todo'), h('div', { class: 'cols' }, h('div', { class: 'panel' }, h('h3', { k: 's1_plant_t' }), f1), h('div', { class: 'panel' }, h('h3', { k: 's1_def_t' }), f2)), ck, after);
    },
    /* ② 식물의 호흡과 동물의 세포호흡: 공통점과 차이점 */
    function (box, ctx) {
      var ss = SAME.map(function (k, i) { return h('div', { 'data-slot': 's' + i, class: 'roleslot' }); }), ds = DIFF.map(function (k, i) { return h('div', { 'data-slot': 'd' + i, class: 'roleslot' }); });
      var board = dragBoard(shuffle(SAME.concat(DIFF)).map(function (k) { return { id: k, k: k }; }), ss.concat(ds));
      var ck = btn('check', function () {
        var ok = true;
        ss.forEach(function (s, i) { var g = SAME.indexOf(board.get('s' + i)) >= 0; board.mark('s' + i, g); if (!g) ok = false; });
        ds.forEach(function (s, i) { var g = DIFF.indexOf(board.get('d' + i)) >= 0; board.mark('d' + i, g); if (!g) ok = false; });
        if (!ok) { ctx.miss(); toast(t('try_again'), 'bad'); return; }
        board.lock(); ck.remove(); box.append(note('s1_s2ok', 'result')); applyI18n(box); ctx.ready();
      }, 'btn primary');
      box.append(todo('s1_s2_todo'), h('div', { class: 'cols' }, h('div', { class: 'panel sortg' }, h('h3', { k: 's1_same_t' }), ss), h('div', { class: 'panel sortd' }, h('h3', { k: 's1_diff_t' }), ds)), board.tray, ck);
    },
    /* ③ 세포호흡 모형: 식 완성 + 활동 정도에 따른 변화 + 에너지의 이용 */
    function (box, ctx) {
      var sl = [0, 1, 2, 3, 4].map(function (i) { return h('div', { 'data-slot': 'q' + i, class: 'eqslot' }); });
      var board = dragBoard(shuffle(['s1_nut', 'c3_o2', 'e2_water', 'c3_co2', 's1_energy', 's1_light']).map(function (k) { return { id: k, k: k }; }), sl);
      var eq = h('div', { class: 'eqrow' }, sl[0], h('b', {}, '+'), sl[1], h('b', {}, '→'), sl[2], h('b', {}, '+'), sl[3], h('b', {}, '+'), sl[4]);
      var model = cellModel(), part2 = h('div', { hidden: '' });
      var ck = btn('check', function () {
        var L = [board.get('q0'), board.get('q1')], R = [board.get('q2'), board.get('q3')], ok = true;
        [0, 1].forEach(function (i) { var g = ['s1_nut', 'c3_o2'].indexOf(L[i]) >= 0 && L[0] !== L[1]; board.mark('q' + i, g); if (!g) ok = false; });
        [0, 1].forEach(function (i) { var g = ['e2_water', 'c3_co2'].indexOf(R[i]) >= 0 && R[0] !== R[1]; board.mark('q' + (i + 2), g); if (!g) ok = false; });
        var ge = board.get('q4') === 's1_energy'; board.mark('q4', ge); if (!ge) ok = false;
        if (!ok) { ctx.miss(); toast(t('try_again'), 'bad'); return; }
        board.lock(); ck.remove(); part2.hidden = false;
      }, 'btn primary');
      var q = h('div', {});
      model.whenSeen(function () {
        q.append(choice('s1_q2', ['s1_q2a', 's1_q2b', 's1_q2c'], 0, function () {
          q.append(h('div', { class: 'panel' }, h('h3', { k: 's1_use_t' }), h('div', { class: 'uses' }, USES.map(function (k) { return h('span', { class: 'chip big', k: k }); })), note('s1_use_note')));
          App.send({ action: 'answer', act: 's1', key: 'summary', text: t('s1_summary') });
          q.append(note('s1_summary', 'result'), btn('finish', ctx.finish, 'btn primary big')); applyI18n(q);
        }, ctx.miss)); applyI18n(q);
      });
      part2.append(todo('s1_model_todo'), model.el, q);
      box.append(todo('s1_s3_todo'), h('div', { class: 'panel' }, h('h3', { k: 's1_eq_t' }), eq, board.tray, ck), part2);
    }
  ] };
})();
