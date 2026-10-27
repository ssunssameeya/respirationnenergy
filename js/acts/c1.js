/* 순환계 1: 심장의 구조와 심장에서의 혈액 이동 (교과서 p200~201, 그림 6-4) */
(function () {
  /* 심장 모식도 (앞에서 본 모습: 그림의 왼쪽이 몸의 오른쪽) */
  var P = { vc: [52, 92], ra: [116, 165], rv: [124, 296], pa: [104, 30], ao: [326, 84], pv: [348, 158], la: [288, 165], lv: [282, 296] };
  function heartSvg() {
    var o = 'stroke="#3b2a2c" stroke-width="3" stroke-linejoin="round"';
    return '<svg class="heartsvg" viewBox="0 0 400 360" xmlns="http://www.w3.org/2000/svg">'
      + '<path d="M70 20 V112 Q70 128 98 132 M70 330 V210 Q72 186 100 182" fill="none" stroke="#1e63c9" stroke-width="20" stroke-linecap="round"/>'
      + '<path d="M390 140 H300 M390 176 H300" fill="none" stroke="#ef5350" stroke-width="14" stroke-linecap="round"/>'
      + '<path d="M96 116 Q96 100 140 100 Q190 100 192 130 V205 H96Z" fill="#7aa7e6" ' + o + '/>'
      + '<path d="M96 210 H192 V320 Q150 345 112 300 Q96 270 96 210Z" fill="#5b8fd9" ' + o + '/>'
      + '<path d="M208 116 Q210 100 258 100 Q306 100 306 130 V205 H208Z" fill="#f28b82" ' + o + '/>'
      + '<path d="M208 210 H310 Q318 290 270 338 Q238 350 208 320Z" fill="#e8574a" ' + o + '/>'
      /* 폐동맥은 우심실에서, 대동맥은 좌심실에서 시작해 심방 앞을 지나 위로 (심방에서 나오는 것처럼 보이지 않게 테두리를 두르고 심방 위에 그림) */
      + '<path d="M176 272 V110 Q176 44 132 26" fill="none" stroke="#3b2a2c" stroke-width="25" stroke-linecap="round"/><path d="M176 272 V110 Q176 44 132 26" fill="none" stroke="#3f7fd6" stroke-width="18" stroke-linecap="round"/>'
      + '<path d="M224 272 V96 Q224 30 268 28 Q306 28 310 60" fill="none" stroke="#3b2a2c" stroke-width="29" stroke-linecap="round"/><path d="M224 272 V96 Q224 30 268 28 Q306 28 310 60" fill="none" stroke="#e53935" stroke-width="22" stroke-linecap="round"/>'
      + '<path d="M120 205 l12 12 l12 -12 M232 205 l12 12 l12 -12" fill="#fff" stroke="#3b2a2c" stroke-width="2"/>'
      + '<path d="M168 238 l8 -10 l8 10 M216 238 l8 -10 l8 10" fill="#fff" stroke="#3b2a2c" stroke-width="2"/>'
      + '<path class="thread" d="" fill="none" stroke="#8b0000" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 12"/>'
      + '</svg>';
  }
  function fig(extra) {
    var f = h('div', { class: 'heartfig', html: heartSvg() });
    (extra || []).forEach(function (e) { f.append(e); });
    return f;
  }
  function at(el, k) { el.style.left = (P[k][0] / 400 * 100) + '%'; el.style.top = (P[k][1] / 360 * 100) + '%'; return el; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  var PARTS = ['ra', 'rv', 'la', 'lv', 'vc', 'pa', 'pv', 'ao'];
  var BANK = [
    ['c1_sq1', 'h_ra', ['h_rv', 'h_la', 'h_lv']], ['c1_sq2', 'h_rv', ['h_ra', 'h_la', 'h_lv']], ['c1_sq3', 'h_la', ['h_ra', 'h_rv', 'h_lv']], ['c1_sq4', 'h_lv', ['h_ra', 'h_rv', 'h_la']],
    ['c1_sq5', 'c1_atrium', ['c1_ventricle', 'h_valve']], ['c1_sq6', 'c1_ventricle', ['c1_atrium', 'h_valve']], ['c1_sq7', 'h_valve', ['c1_atrium', 'c1_ventricle']],
    ['c1_sq8', 'h_rv', ['h_la', 'h_pa', 'h_ao']], ['c1_sq9', 'h_ao', ['h_pa', 'h_pv', 'h_vc']], ['c1_sq10', 'h_pa', ['h_ao', 'h_pv', 'h_vc']], ['c1_sq11', 'h_la', ['h_ra', 'h_lv', 'h_ao']],
    ['c1_sq12', 'c1_vent_thick', ['c1_atr_thick', 'c1_same_thick']]
  ];

  ACT.c1 = { id: 'c1', title: 't_c1', steps: [
    /* ① 심장 각 부분의 이름 붙이기 */
    function (box, ctx) {
      var slots = PARTS.map(function (k) { return at(h('div', { 'data-slot': k, class: 'hslot' }), k); });
      var board = dragBoard(shuffle(PARTS).map(function (k) { return { id: k, k: 'h_' + k }; }), slots);
      var ck = btn('check', function () {
        var ok = true; PARTS.forEach(function (k) { var g = board.get(k) === k; board.mark(k, g); if (!g) ok = false; });
        if (!ok) { ctx.miss(); toast(t('try_again'), 'bad'); return; }
        board.lock(); ck.remove(); box.append(note('c1_s1ok', 'result')); applyI18n(box); ctx.ready();
      }, 'btn primary');
      box.append(todo('c1_s1_todo'), note('c1_intro', 'strong'), h('div', { class: 'cols wide1' }, h('div', { class: 'panel' }, fig(slots), note('c1_view')), h('div', { class: 'panel' }, h('h3', { k: 'c1_cards_t' }), board.tray, ck)));
    },
    /* ② 심방 · 심실 · 판막 정리 */
    function (box, ctx) {
      var f1 = fillBlank('c1_sum1', [{ opts: ['c1_vein', 'c1_artery'], ans: 'c1_vein' }, { opts: ['c1_take', 'c1_send'], ans: 'c1_take' }]);
      var f2 = fillBlank('c1_sum2', [{ opts: ['c1_artery', 'c1_vein'], ans: 'c1_artery' }, { opts: ['c1_send', 'c1_take'], ans: 'c1_send' }, { opts: ['c1_thick', 'c1_thin'], ans: 'c1_thick' }]);
      var f3 = fillBlank('c1_sum3', [{ opts: ['h_valve', 'c1_atrium', 'c1_ventricle'], ans: 'h_valve' }, { opts: ['c1_back', 'c1_fast', 'c1_stop'], ans: 'c1_back' }]);
      var ck = btn('check', function () {
        var ok = [f1, f2, f3].map(function (f) { return f.check(); }).every(Boolean);
        if (!ok) { ctx.miss(); toast(t('try_again'), 'bad'); return; }
        [f1, f2, f3].forEach(function (f) { f.lock(); }); ck.remove(); App.send({ action: 'answer', act: 'c1', key: 'parts', text: [f1.text(), f2.text(), f3.text()].join(' ') });
        box.append(note('c1_s2ok', 'result')); applyI18n(box); ctx.ready();
      }, 'btn primary');
      box.append(todo('c1_s2_todo'), h('div', { class: 'cols' }, h('div', { class: 'panel' }, fig()), h('div', { class: 'panel' }, h('h3', { k: 'rule_t' }), f1, f2, f3, ck)));
    },
    /* ③ 실 잇기: 심장에서의 혈액 이동 경로 */
    function (box, ctx) {
      var ORDER = ['vc', 'ra', 'rv', 'pa', 'pv', 'la', 'lv', 'ao'], i = 0, pts = [];
      var f = fig(), line = f.querySelector('.thread'), msg = h('p', { class: 'note strong' });
      function say() { msg.setAttribute('data-k', i < 4 ? 'c1_trace1' : 'c1_trace2'); msg.textContent = t(msg.getAttribute('data-k')); }
      PARTS.forEach(function (k) {
        var b = at(h('button', { type: 'button', class: 'hbtn', k: 'h_' + k }), k);
        b.addEventListener('click', function () {
          if (i >= ORDER.length || b.classList.contains('on')) return;
          if (k !== ORDER[i]) { ctx.miss(); b.classList.add('bad'); setTimeout(function () { b.classList.remove('bad'); }, 500); toast(t('c1_trace_bad'), 'bad'); return; }
          b.classList.add('on'); pts.push(P[k]); i++;
          var seg1 = pts.slice(0, 4), seg2 = pts.slice(4), d = '';
          [seg1, seg2].forEach(function (s) { if (s.length) d += 'M' + s.map(function (p) { return p.join(' '); }).join(' L'); });
          line.setAttribute('d', d);
          if (i === 4) { f.append(h('span', { class: 'lungnote', k: 'c1_tolung' })); applyI18n(f); }
          say();
          if (i === ORDER.length) { f.classList.add('flowing'); App.send({ action: 'answer', act: 'c1', key: 'path', text: t('c1_pathtxt') }); box.append(note('c1_pathtxt', 'result')); applyI18n(box); ctx.ready(); }
        });
        f.append(b);
      });
      say();
      box.append(todo('c1_s3_todo'), h('div', { class: 'cols wide1' }, h('div', { class: 'panel' }, f), h('div', { class: 'panel' }, msg, note('c1_trace_hint'))));
    },
    /* ④ 스피드 퀴즈 */
    function (box, ctx) {
      var fin = btn('finish', function () { App.send({ action: 'answer', act: 'c1', key: 'summary', text: t('c1_summary') }); ctx.finish(); }, 'btn primary big'); fin.hidden = true;
      box.append(todo('c1_s4_todo'), note('c1_summary', 'result'));
      speedQuiz(box, BANK, 'c1', 45, function () { fin.hidden = false; });
      box.append(fin);
    }
  ] };
})();
