/* 배설계 1: 배설계의 구조와 기능 (교과서 p212, 그림 6-10) */
(function () {
  /* 왼쪽: 몸 속 배설계, 오른쪽: 콩팥 단면. 이름표 자리 P, 이름표에서 기관까지 잇는 선 LEAD */
  var P = { kid: [40, 120], ure: [40, 250], blad: [40, 330], uret: [150, 400], cortex: [400, 60], medul: [410, 330], pelvis: [262, 380] };
  var LEAD = { kid: [92, 140], ure: [104, 250], blad: [130, 325], uret: [140, 368], cortex: [356, 96], medul: [352, 270], pelvis: [318, 300] };
  function excSvg() {
    var o = 'stroke="#3b2a2c" stroke-width="3" stroke-linejoin="round"', lines = '';
    Object.keys(P).forEach(function (k) { lines += '<line x1="' + P[k][0] + '" y1="' + P[k][1] + '" x2="' + LEAD[k][0] + '" y2="' + LEAD[k][1] + '" stroke="#3b2a2c" stroke-width="1.5" stroke-dasharray="4 3"/>'; });
    return '<svg class="excsvg" viewBox="0 0 460 420" xmlns="http://www.w3.org/2000/svg">'
      + '<path d="M70 20 Q140 0 210 20 V400 H70Z" fill="#f9e3d6" ' + o + '/>'
      + '<path d="M100 120 Q84 150 100 178 Q118 186 122 160 Q116 150 122 136 Q118 112 100 120Z" fill="#b5476b" ' + o + '/>'
      + '<path d="M180 120 Q196 150 180 178 Q162 186 158 160 Q164 150 158 136 Q162 112 180 120Z" fill="#b5476b" ' + o + '/>'
      + '<path d="M120 160 Q118 250 128 300 M160 160 Q162 250 152 300" fill="none" stroke="#f2c14e" stroke-width="5"/>'
      + '<path d="M118 300 Q140 290 162 300 Q170 330 140 346 Q110 330 118 300Z" fill="#f6d36b" ' + o + '/>'
      + '<path d="M140 346 V384" stroke="#f2c14e" stroke-width="6"/>'
      + '<rect x="98" y="148" width="84" height="44" fill="none" stroke="#2f7d4f" stroke-width="2" stroke-dasharray="5 4"/>'
      + '<line x1="182" y1="160" x2="246" y2="90" stroke="#2f7d4f" stroke-width="2" stroke-dasharray="5 4"/>'
      + '<path d="M300 40 Q420 40 430 190 Q420 350 300 350 Q250 340 262 250 Q290 200 262 150 Q250 50 300 40Z" fill="#c2577a" ' + o + '/>'
      + '<path d="M300 66 Q396 70 402 190 Q396 320 300 324 Q278 300 290 250 Q312 200 290 150 Q278 90 300 66Z" fill="#e58aa5"/>'
      + [[330, 110], [360, 150], [372, 200], [360, 250], [330, 290]].map(function (c) { return '<path d="M' + (c[0] + 20) + ' ' + c[1] + ' L' + (c[0] - 12) + ' ' + (c[1] - 14) + ' L' + (c[0] - 12) + ' ' + (c[1] + 14) + 'Z" fill="#a83a5e"/>'; }).join('')
      + '<path d="M318 140 Q296 200 318 260 Q300 280 290 300 L276 380 L262 380 L272 296 Q282 260 300 200 Q286 160 318 140Z" fill="#f6d36b" stroke="#3b2a2c" stroke-width="2"/>'
      + '<path d="M218 170 H272 M218 210 H272" stroke="#e53935" stroke-width="10"/><path d="M240 190 H286" stroke="#3f6fd1" stroke-width="10"/>'
      + lines + '</svg>';
  }
  function at(el, k) { el.style.left = (P[k][0] / 460 * 100) + '%'; el.style.top = (P[k][1] / 420 * 100) + '%'; return el; }
  var PARTS = ['kid', 'ure', 'blad', 'uret', 'cortex', 'medul', 'pelvis'];

  ACT.e1 = { id: 'e1', title: 't_e1', steps: [
    /* ① 배설계 기관 이름 붙이기 */
    function (box, ctx) {
      var slots = PARTS.map(function (k) { return at(h('div', { 'data-slot': k, class: 'hslot' }), k); });
      var board = dragBoard(shuffle(PARTS).map(function (k) { return { id: k, k: 'x_' + k }; }), slots);
      var fig = h('div', { class: 'heartfig excfig', html: excSvg() }); slots.forEach(function (s) { fig.append(s); });
      var ck = btn('check', function () {
        var ok = true; PARTS.forEach(function (k) { var g = board.get(k) === k; board.mark(k, g); if (!g) ok = false; });
        if (!ok) { ctx.miss(); toast(t('try_again'), 'bad'); return; }
        board.lock(); ck.remove(); box.append(note('e1_s1ok', 'result')); applyI18n(box); ctx.ready();
      }, 'btn primary');
      box.append(todo('e1_s1_todo'), note('e1_intro', 'strong'), h('div', { class: 'cols wide1' }, h('div', { class: 'panel' }, fig), h('div', { class: 'panel' }, board.tray, ck)));
    },
    /* ② 노폐물이 만들어지는 과정과 오줌이 나가는 길 */
    function (box, ctx) {
      var fb = fillBlank('e1_waste', [{ opts: ['e1_amm', 'e1_urea', 'c3_co2'], ans: 'e1_amm' }, { opts: ['e1_liver', 'x_kid', 'x_blad'], ans: 'e1_liver' }, { opts: ['e1_amm', 'e1_urea', 'c3_co2'], ans: 'e1_urea' }, { opts: ['e1_liver', 'x_kid', 'd2_o_large'], ans: 'x_kid' }]);
      var PATH = ['pelvis', 'ure', 'blad', 'uret'], sl = PATH.map(function (k, i) { return h('div', { 'data-slot': 'p' + i, class: 'pathslot' }); });
      var board = dragBoard(shuffle(PATH.concat(['cortex'])).map(function (k) { return { id: k, k: 'x_' + k }; }), sl);
      var path = h('div', { class: 'foodpath' }); sl.forEach(function (s, i) { path.append(h('span', { class: 'pnum', dir: 'ltr' }, String(i + 1)), s); if (i < 3) path.append(h('b', { class: 'parr' }, '→')); });
      var ck = btn('check', function () {
        var ok = fb.check(); PATH.forEach(function (k, i) { var g = board.get('p' + i) === k; board.mark('p' + i, g); if (!g) ok = false; });
        if (!ok) { ctx.miss(); toast(t('try_again'), 'bad'); return; }
        board.lock(); fb.lock(); ck.remove(); App.send({ action: 'answer', act: 'e1', key: 'waste', text: fb.text() });
        box.append(note('e1_s2ok', 'result')); applyI18n(box); ctx.ready();
      }, 'btn primary');
      box.append(todo('e1_s2_todo'), h('div', { class: 'panel' }, h('h3', { k: 'e1_waste_t' }), fb), h('div', { class: 'panel' }, h('h3', { k: 'e1_path_t' }), path, board.tray), ck);
    },
    /* ③ 짝짓기 퀴즈 + O/X */
    function (box, ctx) {
      var lm = lineMatch([['x_kid', 'e1_f_kid'], ['x_ure', 'e1_f_ure'], ['x_blad', 'e1_f_blad'], ['x_uret', 'e1_f_uret'], ['x_pelvis', 'e1_f_pelvis'], ['x_neph', 'e1_f_neph']]);
      var after = h('div', { hidden: '' });
      var ck = btn('check', function () {
        if (!lm.check()) { ctx.miss(); toast(t('try_again'), 'bad'); return; }
        lm.lock(); ck.remove(); App.send({ action: 'answer', act: 'e1', key: 'match', text: lm.text() }); after.hidden = false;
      }, 'btn primary');
      after.append(h('div', { class: 'panel' }, oxQuiz([['e1_q1', 'X', 'e1_a1'], ['e1_q2', 'O', 'e1_a2'], ['e1_q3', 'X', 'e1_a3']], ctx, function () {
        App.send({ action: 'answer', act: 'e1', key: 'summary', text: t('e1_summary') });
        after.append(note('e1_summary', 'result'), btn('finish', ctx.finish, 'btn primary big')); applyI18n(after);
      })));
      box.append(todo('e1_s3_todo'), h('div', { class: 'panel' }, lm), ck, after);
      setTimeout(lm.redraw, 50);
    }
  ] };
})();
