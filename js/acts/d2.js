/* 소화계 2: 소화계의 구조와 기능 (교과서 p194~195, 그림 6-1) */
(function () {
  var TUBE = ['mouth', 'eso', 'stom', 'small', 'large', 'anus'];      // 소화관 (음식물이 지나가는 순서)
  var GLAND = ['saliv', 'liver', 'gall', 'panc'];                     // 소화샘
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), x = a[i]; a[i] = a[j]; a[j] = x; } return a; }

  /* 소화계 모형(인체 탐험 그림의 소화계만): 놓은 기관 표시 + 정답 뒤 음식물이 지나가는 움직임 */
  var POS = { mouth: [180, 94], eso: [192, 200], stom: [232, 330], small: [186, 428], large: [236, 430], anus: [186, 506] };
  function digFig() {
    var f = h('div', { class: 'heartfig digfig sel-dig', html: bodySVG() }), r = h('i', { class: 'orgring' }); r.hidden = true; f.append(r);
    f.mark = function (k) { if (!POS[k]) { r.hidden = true; return; } r.hidden = false; r.style.left = (POS[k][0] / 360 * 100) + '%'; r.style.top = (POS[k][1] / 640 * 100) + '%'; r.classList.remove('pop'); void r.offsetWidth; r.classList.add('pop'); };
    f.food = function () {
      r.hidden = true;
      var path = 'M180 94 Q192 200 214 300 Q244 328 206 346 L150 404 H222 V416 H150 V428 H222 V440 H150 V452 H222 L236 462 V392 H136 V470 Q160 478 186 478 V506', dots = '';
      for (var i = 0; i < 3; i++) dots += '<circle r="8" fill="#8d6e63" stroke="#fff" stroke-width="2"><animateMotion dur="6s" begin="' + (i * 2) + 's" repeatCount="indefinite" path="' + path + '"/></circle>';
      f.append(h('div', { class: 'airlayer', html: '<svg viewBox="0 0 360 640" xmlns="http://www.w3.org/2000/svg">' + dots + '</svg>' }));
    };
    return f;
  }
  ACT.d2 = { id: 'd2', title: 't_d2', steps: [
    /* ① 기관과 역할 짝짓기 */
    function (box, ctx) {
      var slots = {}, all = GLAND.concat(TUBE);
      all.forEach(function (o) { slots[o] = h('div', { 'data-slot': o, class: 'roleslot' }); });
      var board = dragBoard(shuffle(all).map(function (o) { return { id: o, k: 'd2_role_' + o }; }), all.map(function (o) { return slots[o]; }));
      function col(title, list) { return h('div', { class: 'panel' }, h('h3', { k: title }), list.map(function (o) { return h('div', { class: 'orgrow' }, h('b', { class: 'orgname', k: 'd2_o_' + o }), slots[o]); })); }
      var ck = btn('check', function () {
        var ok = true; all.forEach(function (o) { var g = board.get(o) === o; board.mark(o, g); if (!g) ok = false; });
        if (!ok) { ctx.miss(); toast(t('try_again'), 'bad'); return; }
        board.lock(); ck.remove(); box.append(note('d2_s1ok', 'result')); applyI18n(box); ctx.ready();
      }, 'btn primary');
      box.append(todo('d2_s1_todo'), note('d2_intro', 'strong'), h('div', { class: 'cols' }, col('d2_gland_t', GLAND), col('d2_tube_t', TUBE)), board.tray, ck);
    },
    /* ② 음식물이 지나가는 순서 + 소화액이 나오는 곳 */
    function (box, ctx) {
      var sl = TUBE.map(function (o, i) { return h('div', { 'data-slot': 'p' + i, class: 'pathslot' }); });
      var fig = digFig();
      var board = dragBoard(shuffle(TUBE).map(function (o) { return { id: o, k: 'd2_o_' + o }; }), sl, function () { var got = sl.map(function (x) { return board.get(x.dataset.slot); }).filter(Boolean); fig.mark(got[got.length - 1]); });
      var path = h('div', { class: 'foodpath' }); sl.forEach(function (s, i) { path.append(h('span', { class: 'pnum', dir: 'ltr' }, String(i + 1)), s); if (i < 5) path.append(h('b', { class: 'parr' }, '→')); });
      var fb = fillBlank('d2_sec', [{ opts: ['d2_o_mouth', 'd2_o_stom', 'd2_o_small'], ans: 'd2_o_mouth' }, { opts: ['d2_o_gall', 'd2_o_panc', 'd2_o_large'], ans: 'd2_o_gall' }, { opts: ['d2_o_stom', 'd2_o_small', 'd2_o_large'], ans: 'd2_o_small' }, { opts: ['d2_o_large', 'd2_o_small', 'd2_o_eso'], ans: 'd2_o_small' }]);
      var ck = btn('check', function () {
        var ok = true; TUBE.forEach(function (o, i) { var g = board.get('p' + i) === o; board.mark('p' + i, g); if (!g) ok = false; });
        if (!fb.check()) ok = false;
        if (!ok) { ctx.miss(); toast(t('try_again'), 'bad'); return; }
        board.lock(); fb.lock(); ck.remove(); fig.food(); App.send({ action: 'answer', act: 'd2', key: 'path', text: fb.text() });
        box.append(note('d2_s2ok', 'result')); applyI18n(box); ctx.ready();
      }, 'btn primary');
      box.append(todo('d2_s2_todo'), h('div', { class: 'cols wide1' }, h('div', {}, h('div', { class: 'panel' }, h('h3', { k: 'd2_path_t' }), path, board.tray), h('div', { class: 'panel' }, h('h3', { k: 'd2_sec_t' }), fb), ck), h('div', { class: 'panel' }, fig)));
    },
    /* ③ 연결 퀴즈 */
    function (box, ctx) {
      var q = oxQuiz([['d2_q1', 'X', 'd2_a1'], ['d2_q2', 'O', 'd2_a2'], ['d2_q3', 'O', 'd2_a3'], ['d2_q4', 'X', 'd2_a4'], ['d2_q5', 'O', 'd2_a5'], ['d2_q6', 'X', 'd2_a6']], ctx, function () {
        App.send({ action: 'answer', act: 'd2', key: 'summary', text: t('d2_summary') });
        box.append(note('d2_summary', 'result'), btn('finish', ctx.finish, 'btn primary big')); applyI18n(box);
      });
      box.append(todo('d2_s3_todo'), h('div', { class: 'panel' }, q));
    }
  ] };
})();
