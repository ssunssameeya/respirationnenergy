/* 세포호흡 3: 세포호흡과 기관계의 통합적 작용 (교과서 p217~219, 그림 6-12, 역할놀이 탐구) */
(function () {
  var SYS5 = ['dig', 'res', 'cir', 'exc', 'cel'];
  /* 그림 6-12를 간단히: 기관계 상자와 물질이 오가는 화살표 */
  function flowSvg() {
    var B = { dig: [20, 40], res: [360, 40], cir: [190, 170], exc: [360, 300], cel: [20, 300] }, o = '';
    var COL = { dig: '#f2c14e', res: '#90caf9', cir: '#ef9a9a', exc: '#ce93d8', cel: '#a5d6a7' };
    function arrow(x1, y1, x2, y2, txt, col, lx, ly) {                // lx, ly: 글자 위치 옮기기
      var a = Math.atan2(y2 - y1, x2 - x1), hx = x2 - 10 * Math.cos(a), hy = y2 - 10 * Math.sin(a);
      return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + hx + '" y2="' + hy + '" stroke="' + col + '" stroke-width="4"/>'
        + '<path d="M' + x2 + ' ' + y2 + ' L' + (hx - 6 * Math.sin(a)) + ' ' + (hy + 6 * Math.cos(a)) + ' L' + (hx + 6 * Math.sin(a)) + ' ' + (hy - 6 * Math.cos(a)) + 'Z" fill="' + col + '"/>'
        + (txt ? '<text x="' + ((x1 + x2) / 2 + (lx || 0)) + '" y="' + ((y1 + y2) / 2 - 6 + (ly || 0)) + '" text-anchor="middle" font-size="13" font-weight="700" fill="#3b2a2c" data-k="' + txt + '"></text>' : '');
    }
    o += arrow(80, 0, 80, 38, 's3_food', '#8d6e63', 34, 6) + arrow(380, 0, 380, 38, 'c3_o2', '#1e88e5', -26, 6) + arrow(480, 38, 480, 0, 'c3_co2', '#616161', -44, 6);
    o += arrow(110, 96, 200, 172, 's1_nut', '#f2a900') + arrow(372, 96, 300, 172, 'c3_o2', '#1e88e5', -22, 0) + arrow(330, 172, 410, 96, 'c3_co2', '#616161', 44, 14);
    o += arrow(200, 226, 120, 300, 's3_o2nut', '#e53935', -54, 0) + arrow(140, 312, 210, 236, 's3_co2waste', '#616161', 76, 14) + arrow(320, 226, 380, 300, 's3_waste', '#8e24aa');
    o += arrow(420, 356, 420, 400, 'e2_u', '#c9a227', 30, 14) + arrow(80, 356, 80, 400, 's1_energy', '#ff8f00', 40, 14);
    SYS5.forEach(function (k) { var p = B[k]; o += '<rect x="' + p[0] + '" y="' + p[1] + '" width="140" height="56" rx="14" fill="' + COL[k] + '" stroke="#3b2a2c" stroke-width="3"/><text x="' + (p[0] + 70) + '" y="' + (p[1] + 35) + '" text-anchor="middle" font-size="18" font-weight="900" data-k="s3_sys_' + k + '"></text>'; });
    return '<svg class="flowsvg" viewBox="0 0 520 410" xmlns="http://www.w3.org/2000/svg">' + o + '</svg>';
  }
  var ROLE = [['s3_r1', 'dig'], ['s3_r2', 'res'], ['s3_r3', 'cir'], ['s3_r4', 'cel'], ['s3_r5', 'cir'], ['s3_r6', 'exc'], ['s3_r7', 'dig'], ['s3_r8', 'res']];
  var CATS = ['s1_use_heat', 's1_use_brain', 's1_use_voice', 's1_use_muscle', 's1_use_grow'];

  ACT.s3 = { id: 's3', title: 't_s3', steps: [
    /* ① 그림 모형에서 기관계의 역할 짝짓기 */
    function (box, ctx) {
      var slots = SYS5.map(function (k) { return h('div', { 'data-slot': k, class: 'roleslot' }); });
      var board = dragBoard(shuffle(SYS5).map(function (k) { return { id: k, k: 's3_role_' + k }; }), slots);
      var rows = h('div', { class: 'panel' }, SYS5.map(function (k, i) { return h('div', { class: 'orgrow' }, h('b', { class: 'orgname sys-' + k, k: 's3_sys_' + k }), slots[i]); }));
      var ck = btn('check', function () {
        var ok = true; SYS5.forEach(function (k) { var g = board.get(k) === k; board.mark(k, g); if (!g) ok = false; });
        if (!ok) { ctx.miss(); toast(t('try_again'), 'bad'); return; }
        board.lock(); ck.remove(); box.append(note('s3_s1ok', 'result')); applyI18n(box); ctx.ready();
      }, 'btn primary');
      box.append(todo('s3_s1_todo'), h('div', { class: 'cols wide1' }, h('div', { class: 'panel', html: flowSvg() }), h('div', {}, rows, board.tray, ck)));
    },
    /* ② 역할놀이: "나는 누구일까?" */
    function (box, ctx) {
      var i = 0, list = shuffle(ROLE), area = h('div', { class: 'panel rolecard' }), prog = h('div', { class: 'qprog', dir: 'ltr' });
      function step() {
        area.innerHTML = ''; prog.textContent = (i + 1) + ' / ' + list.length;
        var it = list[i];
        area.append(h('p', { class: 'speech', k: it[0] }));
        area.append(choice(null, SYS5.map(function (k) { return 's3_sys_' + k; }), SYS5.indexOf(it[1]), function () {
          setTimeout(function () { i++; if (i < list.length) { step(); return; } area.innerHTML = ''; area.append(note('s3_s2ok', 'result')); applyI18n(area); ctx.ready(); }, 500);
        }, ctx.miss));
        applyI18n(area);
      }
      box.append(todo('s3_s2_todo'), prog, area); step();
    },
    /* ③ 에너지를 쓰는 나의 활동 + 생각해 보기 */
    function (box, ctx) {
      var rows = [0, 1, 2].map(function (n) {
        var inp = h('input', { type: 'text', class: 'ans', maxlength: '40', 'data-kp': 's3_ph' + n, placeholder: t('s3_ph' + n) });
        var sel = h('select', { class: 'blank' }); sel.append(h('option', { value: '' }, '( ? )')); CATS.forEach(function (c) { sel.append(h('option', { value: c, k: c })); });
        return { inp: inp, sel: sel, el: h('div', { class: 'row userow' }, h('b', { dir: 'ltr' }, (n + 1) + '.'), inp, sel) };
      });
      var after = h('div', { hidden: '' });
      var save = btn('r4_save', function () {
        var ok = rows.every(function (r) { return r.inp.value.trim().length >= 2 && r.sel.value; });
        if (!ok) { toast(t('s3_need'), 'bad'); return; }
        save.disabled = true;
        App.send({ action: 'answer', act: 's3', key: 'energy', text: rows.map(function (r) { return r.inp.value.trim() + ' (' + t(r.sel.value) + ')'; }).join(' / ') });
        after.hidden = false;
      }, 'btn primary');
      after.append(choice('s3_q1', ['s3_q1a', 's3_q1b', 's3_q1c'], 0, function () {
        App.send({ action: 'answer', act: 's3', key: 'summary', text: t('s3_summary') });
        after.append(note('s3_summary', 'result'), btn('finish', ctx.finish, 'btn primary big')); applyI18n(after);
      }, ctx.miss));
      box.append(todo('s3_s3_todo'), h('div', { class: 'panel' }, h('h3', { k: 's3_use_t' }), note('s3_use_desc'), rows.map(function (r) { return r.el; }), save), after);
    }
  ] };
})();
