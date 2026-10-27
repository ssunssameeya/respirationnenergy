/* 세포호흡 2: 1분 제자리 달리기 전후 체온·심박수·호흡수 측정 (교과서 p216 해 보기)
   측정값은 답 'run'에 JSON으로 저장하고, 교사 페이지 "달리기 통계"에서 반 평균을 냅니다. */
(function () {
  var MS = [
    { k: 't', name: 's2_temp', step: '0.1', lo: 30, hi: 45 },                 // lo~hi: 생리적으로 가능한 범위 (teacher.js 통계와 같게)
    { k: 'h', name: 's2_heart', step: '1', lo: 20, hi: 300 },
    { k: 'b', name: 's2_breath', step: '1', lo: 4, hi: 200 }
  ];
  function getRun() { try { return JSON.parse((App.me && App.me.ans && App.me.ans['s2.run']) || '{}'); } catch (e) { return {}; } }

  ACT.s2 = { id: 's2', title: 't_s2', steps: [
    /* ① 측정값 입력 */
    function (box, ctx) {
      var prev = getRun(), inp = {};
      var tb = h('table', { class: 'data runt' }, h('tr', {}, h('th', {}), h('th', { k: 's2_before' }), h('th', { k: 's2_after' })));
      MS.forEach(function (m) {
        var tr = h('tr', {}, h('th', {}, h('span', { k: m.name }), ' ', h('small', { k: 's2_unit_' + m.k })));
        ['0', '1'].forEach(function (w) {
          var i = h('input', { type: 'number', inputmode: 'decimal', step: m.step, class: 'numin', dir: 'ltr', 'aria-label': t(m.name) });
          if (prev[m.k + w] != null) i.value = prev[m.k + w];
          inp[m.k + w] = i; tr.append(h('td', {}, i));
        });
        tb.append(tr);
      });
      var ck = btn('s2_save', function () {
        var data = {}, bad = [], empty = false;
        MS.forEach(function (m) {
          ['0', '1'].forEach(function (w) {
            var i = inp[m.k + w], v = parseFloat(i.value);
            i.classList.remove('bad');
            if (isNaN(v)) { empty = true; i.classList.add('bad'); return; }
            if (v < m.lo || v > m.hi) { bad.push(t(m.name)); i.classList.add('bad'); }
            data[m.k + w] = v;
          });
        });
        if (empty) { toast(t('s2_fillall'), 'bad'); return; }
        if (bad.length) { toast(t('s2_range') + ' ' + bad.join(', '), 'bad'); return; }
        App.me.ans = App.me.ans || {}; App.me.ans['s2.run'] = JSON.stringify(data);
        App.send({ action: 'answer', act: 's2', key: 'run', text: JSON.stringify(data) });
        toast(t('s2_saved')); ctx.ready();
      }, 'btn primary');
      box.append(todo('s2_s1_todo'), h('div', { class: 'cols' },
        h('div', { class: 'panel' }, h('h3', { k: 's2_how_t' }), h('ol', { class: 'howto' }, ['s2_how1', 's2_how2', 's2_how3', 's2_how4'].map(function (k) { return h('li', { k: k }); })), note('s2_tip', 'warn')),
        h('div', { class: 'panel' }, h('h3', { k: 's2_rec_t' }), tb, ck)));
      if (prev.t0 != null) ctx.ready();
    },
    /* ② 내 결과 비교 */
    function (box, ctx) {
      var d = getRun(), rows = h('div', { class: 'runbars' }), up = 0;
      MS.forEach(function (m) {
        var a = d[m.k + '0'], b = d[m.k + '1'], mx = Math.max(a, b), base = m.k === 't' ? 34 : 0;
        function bar(v, cls) { return h('div', { class: 'rbar ' + cls }, h('i', { style: 'width:' + Math.max(4, (v - base) / (mx - base) * 100) + '%' }), h('b', { dir: 'ltr' }, String(v))); }
        var diff = Math.round((b - a) * 10) / 10; if (diff > 0) up++;
        rows.append(h('div', { class: 'runrow' }, h('b', { k: m.name }), bar(a, 'before'), bar(b, 'after'), h('span', { class: 'chip', dir: 'ltr' }, (diff > 0 ? '▲ +' : diff < 0 ? '▼ ' : '= ') + diff)));
      });
      var q = choice('s2_q1', ['s2_q1a', 's2_q1b', 's2_q1c'], 0, function () {
        box.append(note(up === 3 ? 's2_s2ok' : 's2_s2err', 'result')); applyI18n(box); ctx.ready();
      }, ctx.miss);
      box.append(todo('s2_s2_todo'), h('div', { class: 'panel' }, h('div', { class: 'row plegend' }, h('span', { class: 'pchip' }, h('i', { class: 'lg-before' }), h('span', { k: 's2_before' })), h('span', { class: 'pchip' }, h('i', { class: 'lg-after' }), h('span', { k: 's2_after' }))), rows, note('s2_textbook')), q);
    },
    /* ③ 달라진 까닭을 세포호흡과 관련짓기 */
    function (box, ctx) {
      var fb = fillBlank('s2_why', [{ opts: ['s2_more', 's2_less', 's2_stop'], ans: 's2_more' }, { opts: ['s2_heart', 's2_breath'], ans: 's2_heart' }, { opts: ['s2_heart', 's2_breath'], ans: 's2_breath' }, { opts: ['s2_heat', 's2_sound'], ans: 's2_heat' }]);
      var after = h('div', { hidden: '' });
      var ck = btn('check', function () {
        if (!fb.check()) { ctx.miss(); toast(t('try_again'), 'bad'); return; }
        fb.lock(); ck.remove(); after.hidden = false; App.send({ action: 'answer', act: 's2', key: 'why', text: fb.text() });
      }, 'btn primary');
      after.append(choice('s2_q2', ['s2_q2a', 's2_q2b', 's2_q2c'], 0, function () {
        App.send({ action: 'answer', act: 's2', key: 'summary', text: t('s2_summary') });
        after.append(note('s2_summary', 'result'), btn('finish', ctx.finish, 'btn primary big')); applyI18n(after);
      }, ctx.miss));
      box.append(todo('s2_s3_todo'), h('div', { class: 'panel' }, fb, ck), after);
    }
  ] };
})();
