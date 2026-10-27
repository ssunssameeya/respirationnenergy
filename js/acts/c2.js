/* 순환계 2: 혈관과 혈액 (교과서 p202~203, 그림 6-5·6-6) */
(function () {
  function vesselSvg(kind) {
    var wall = { a: 16, v: 8, c: 3 }[kind], col = { a: '#e53935', v: '#3f6fd1', c: '#9c5ab8' }[kind], r = kind === 'c' ? 18 : 46;
    return '<svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="' + r + '" fill="#f6c9b8" stroke="#3b2a2c" stroke-width="2"/><circle cx="60" cy="60" r="' + (r - wall) + '" fill="' + col + '"/>'
      + (kind === 'v' ? '<path d="M38 70 Q60 40 82 70" fill="none" stroke="#fff" stroke-width="4"/>' : '') + '</svg>';
  }
  ACT.c2 = { id: 'c2', title: 't_c2', steps: [
    /* ① 혈관의 종류와 특징 */
    function (box, ctx) {
      var CARDS = { a1: 'a', a2: 'a', c1: 'c', c2: 'c', v1: 'v', v2: 'v' }, slots = {};
      ['a', 'c', 'v'].forEach(function (k) { slots[k] = [h('div', { 'data-slot': k + '_1' }), h('div', { 'data-slot': k + '_2' })]; });
      var board = dragBoard(shuffle(Object.keys(CARDS)).map(function (id) { return { id: id, k: 'c2_card_' + id }; }), [].concat(slots.a, slots.c, slots.v));
      var row = h('div', { class: 'vessels' });
      ['a', 'c', 'v'].forEach(function (k) { row.append(h('div', { class: 'panel vcard v-' + k }, h('h3', { k: 'c2_v_' + k }), h('div', { class: 'vsec', html: vesselSvg(k) }), slots[k][0], slots[k][1])); });
      var fb = fillBlank('c2_order', [{ opts: ['c2_v_a', 'c2_v_v', 'c2_v_c'], ans: 'c2_v_a' }, { opts: ['c2_v_a', 'c2_v_v', 'c2_v_c'], ans: 'c2_v_v' }, { opts: ['c2_v_a', 'c2_v_v', 'c2_v_c'], ans: 'c2_v_c' }, { opts: ['c2_v_a', 'c2_v_v', 'c2_v_c'], ans: 'c2_v_c' }]);
      var ck = btn('check', function () {
        var ok = true;
        ['a', 'c', 'v'].forEach(function (k) { [1, 2].forEach(function (n) { var got = board.get(k + '_' + n), g = !!got && CARDS[got] === k; board.mark(k + '_' + n, g); if (!g) ok = false; }); });
        if (!fb.check()) ok = false;
        if (!ok) { ctx.miss(); toast(t('try_again'), 'bad'); return; }
        board.lock(); fb.lock(); ck.remove(); App.send({ action: 'answer', act: 'c2', key: 'vessel', text: fb.text() });
        box.append(note('c2_s1ok', 'result')); applyI18n(box); ctx.ready();
      }, 'btn primary');
      var flow = h('div', { class: 'vflow' }, h('span', { class: 'vf heart', k: 'org_heart' }), h('b', {}, '→'), h('span', { class: 'vf art', k: 'c2_v_a' }), h('b', {}, '→'),
        h('span', { class: 'vf cap', k: 'c2_v_c' }), h('b', {}, '→'), h('span', { class: 'vf vein', k: 'c2_v_v' }), h('b', {}, '→'), h('span', { class: 'vf heart', k: 'org_heart' }));
      box.append(todo('c2_s1_todo'), h('div', { class: 'panel' }, note('c2_flow_t', 'strong'), flow), row, board.tray, h('div', { class: 'panel' }, fb), ck);
    },
    /* ② 물구나무 판막 모형 */
    function (box, ctx) {
      var valve = true, flip = false, pump = false, P = [], seen = {}, raf = null;
      for (var i = 0; i < 16; i++) P.push(0.08 + i * 0.05);
      var cv = h('canvas', { class: 'veincv', width: '220', height: '400' }), g = cv.getContext('2d');
      var VAL = [0.3, 0.55, 0.8];
      function frame() {
        var gdir = flip ? 1 : -1;                                       // 심장 쪽 = s 증가. 서 있으면 중력이 심장 반대쪽(-), 물구나무면 심장 쪽(+)
        P = P.map(function (s, i) {
          var v = (pump ? 0.006 : 0) + gdir * 0.004, ns = s + v;
          if (valve && ns < s) VAL.forEach(function (vy) { if (s >= vy && ns < vy) ns = vy + 0.001; });   // 판막: 심장 반대쪽으로는 못 지나감
          if (ns > 1) ns -= 0.92; if (ns < 0.03) ns = 0.03 + (i % 4) * 0.004;
          return ns;
        });
        if (!cv.isConnected && raf) return; draw(); raf = setTimeout(frame, 33);
      }
      function y(s) { return flip ? 20 + s * 360 : 380 - s * 360; }
      function draw() {
        g.clearRect(0, 0, 220, 400);
        g.fillStyle = '#f6c9b8'; g.fillRect(70, 10, 80, 380); g.fillStyle = '#5a7fd6'; g.fillRect(80, 10, 60, 380);
        g.fillStyle = '#3b2a2c'; g.font = 'bold 15px sans-serif'; g.textAlign = 'center';
        var hy = flip ? 398 : 14; g.fillText(t('c2_toheart'), 110, flip ? 396 : 14);
        if (valve) VAL.forEach(function (vy) { var yy = y(vy), d = flip ? -14 : 14; g.strokeStyle = '#fff'; g.lineWidth = 5; g.beginPath(); g.moveTo(80, yy + d); g.lineTo(108, yy); g.moveTo(140, yy + d); g.lineTo(112, yy); g.stroke(); });
        P.forEach(function (s, i) { g.fillStyle = '#d32f2f'; g.beginPath(); g.arc(95 + (i % 3) * 15, y(s), 6, 0, 7); g.fill(); });
        g.fillStyle = '#3b2a2c'; g.font = '14px sans-serif'; g.fillText('↓ ' + t('c2_gravity'), 110, flip ? 30 : 396);
      }
      frame();
      var state = h('p', { class: 'note strong' });
      function setState() { state.textContent = t(valve ? 'c2_withvalve' : 'c2_novalve'); seen[valve ? 1 : 0] = 1; }
      var vb = btn('c2_toggle_valve', function () { valve = !valve; setState(); });   /* 물구나무 비교는 오개념 우려로 뺌 */
      var pb = h('button', { type: 'button', class: 'btn primary', k: 'c2_pump' });
      ['pointerdown'].forEach(function (e) { pb.addEventListener(e, function () { pump = true; }); });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (e) { pb.addEventListener(e, function () { pump = false; }); });
      setState();
      /* 관찰 기록 */
      var cells = [], tb = h('table', { class: 'data oxtable' }, h('tr', {}, h('th', {}), h('th', { k: 'c2_backflow' })));
      [['c2_withvalve', ['X']], ['c2_novalve', ['O']]].forEach(function (r) {
        var tr = h('tr', {}, h('th', { k: r[0] }));
        r[1].forEach(function (a) { var b = h('button', { type: 'button', class: 'ox' }, '?'); b._ans = a; b._v = '?'; b.addEventListener('click', function () { b._v = b._v === 'O' ? 'X' : 'O'; b.textContent = b._v; b.classList.remove('bad', 'good'); }); cells.push(b); tr.append(h('td', {}, b)); });
        tb.append(tr);
      });
      var after = h('div', { hidden: '' });
      var ck = btn('check', function () {
        if (Object.keys(seen).length < 2) { toast(t('c2_tryall'), 'bad'); return; }
        var ok = true; cells.forEach(function (b) { var gd = b._v === b._ans; b.classList.toggle('good', gd); b.classList.toggle('bad', !gd); if (!gd) ok = false; });
        if (!ok) { ctx.miss(); toast(t('try_again'), 'bad'); return; }
        ck.remove(); after.hidden = false;
      }, 'btn primary');
      var q1 = choice('c2_vq', ['c2_v1', 'c2_v2', 'c2_v3'], 0, function () {
        after.append(h('div', { class: 'panel' }, h('h3', { k: 'c2_arm_t' }), note('c2_arm'), choice('c2_armq', ['c2_arm1', 'c2_arm2', 'c2_arm3'], 0, function () { after.append(note('c2_armok', 'result')); applyI18n(after); clearTimeout(raf); ctx.ready(); }, ctx.miss)));
        applyI18n(after);
      }, ctx.miss);
      after.append(q1);
      box.append(todo('c2_s2_todo'), h('div', { class: 'cols' }, h('div', { class: 'panel veinpanel' }, cv, state, h('div', { class: 'row' }, pb, vb)),
        h('div', { class: 'panel' }, h('h3', { k: 'c2_rec_t' }), note('c2_rec_desc'), tb, ck)), after);
    },
    /* ③ 혈액의 구성 */
    function (box, ctx) {
      var tube = h('div', { class: 'bloodtube' }, h('i', { class: 'plasma' }), h('i', { class: 'cells' }));
      var spin = btn('c2_spin', function () { spin.disabled = true; tube.classList.add('spin'); setTimeout(function () { tube.classList.remove('spin'); tube.classList.add('sep'); part.hidden = false; }, 1600); }, 'btn primary');
      var KS = ['plasma', 'rbc', 'wbc', 'plt'], slots = KS.map(function (k) { return h('div', { 'data-slot': k }); });
      var board = dragBoard(shuffle(KS).map(function (k) { return { id: k, k: 'c2_role_' + k }; }), slots);
      var ART = { plasma: '<svg viewBox="0 0 40 40"><rect x="8" y="6" width="24" height="28" rx="6" fill="#ffe08a" stroke="#3b2a2c" stroke-width="2"/></svg>', rbc: '<svg viewBox="0 0 40 40"><ellipse cx="20" cy="20" rx="16" ry="12" fill="#e53935" stroke="#3b2a2c" stroke-width="2"/><ellipse cx="20" cy="20" rx="7" ry="4" fill="#b71c1c"/></svg>',
        wbc: '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="15" fill="#f5f0e6" stroke="#3b2a2c" stroke-width="2" stroke-dasharray="3 2"/><circle cx="20" cy="20" r="6" fill="#9575cd"/></svg>', plt: '<svg viewBox="0 0 40 40"><path d="M10 22 l6 -8 l5 6 l7 -4 l2 9 l-9 5z" fill="#ffb74d" stroke="#3b2a2c" stroke-width="2"/></svg>' };
      var part = h('div', { hidden: '' }, h('div', { class: 'cols' }, KS.map(function (k, i) { return h('div', { class: 'panel bcell' }, h('span', { class: 'bart', html: ART[k] }), h('b', { k: 'c2_' + k }), slots[i]); })), board.tray);
      var fb = fillBlank('c2_hb', [{ opts: ['c2_many', 'c2_few'], ans: 'c2_many' }, { opts: ['c2_many', 'c2_few'], ans: 'c2_few' }]);
      var ck = btn('check', function () {
        if (part.hidden) { toast(t('c2_spinfirst'), 'bad'); return; }
        var ok = true; KS.forEach(function (k) { var g = board.get(k) === k; board.mark(k, g); if (!g) ok = false; }); if (!fb.check()) ok = false;
        if (!ok) { ctx.miss(); toast(t('try_again'), 'bad'); return; }
        board.lock(); fb.lock(); ck.remove(); App.send({ action: 'answer', act: 'c2', key: 'summary', text: t('c2_summary') + ' ' + fb.text() });
        box.append(note('c2_summary', 'result'), btn('finish', ctx.finish, 'btn primary big')); applyI18n(box);
      }, 'btn primary');
      box.append(todo('c2_s3_todo'), h('div', { class: 'cols wide1' }, h('div', { class: 'panel' }, h('h3', { k: 'c2_blood_t' }), h('div', { class: 'row' }, tube, spin), part), h('div', { class: 'panel' }, h('h3', { k: 'c2_hb_t' }), fb)), ck);
    }
  ] };
})();
