/* 호흡계 1: 호흡계의 구조와 기능 (교과서 p208~209, 그림 6-8) */
(function () {
  /* 호흡계 그림 (앞에서 본 모습). 이름표 자리 P, 이름표에서 기관까지 잇는 선 LEAD */
  var P = { nose: [88, 58], trach: [88, 140], bron: [352, 214], lung: [356, 300], alv: [392, 176], rib: [60, 384], dia: [210, 404] };
  var LEAD = { nose: [196, 66], trach: [196, 140], bron: [252, 236], lung: [290, 290], alv: [392, 150], rib: [84, 318], dia: [200, 312] };
  function ribs() {
    var s = '';
    for (var i = 0; i < 6; i++) {
      var y = 150 + i * 28;
      s += '<path d="M188 ' + y + ' Q70 ' + (y - 4) + ' 74 ' + (y + 44) + ' M212 ' + y + ' Q330 ' + (y - 4) + ' 326 ' + (y + 44) + '" fill="none" stroke="#efe3c4" stroke-width="7" stroke-linecap="round" opacity=".9"/>';
    }
    return s;
  }
  function resSvg() {
    var o = 'stroke="#3b2a2c" stroke-width="3" stroke-linejoin="round"', lines = '';
    Object.keys(P).forEach(function (k) { lines += '<line x1="' + P[k][0] + '" y1="' + P[k][1] + '" x2="' + LEAD[k][0] + '" y2="' + LEAD[k][1] + '" stroke="#3b2a2c" stroke-width="1.5" stroke-dasharray="4 3"/>'; });
    var alv = '';
    [[392, 100], [372, 88], [412, 88], [380, 116], [404, 116], [392, 80], [366, 106], [418, 106]].forEach(function (c) { alv += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="11" fill="#f2b8c6" stroke="#b5476b" stroke-width="2"/>'; });
    return '<svg class="ressvg" viewBox="0 0 440 420" xmlns="http://www.w3.org/2000/svg">'
      + '<path d="M170 96 V122 Q92 130 66 186 V420 H334 V186 Q308 130 230 122 V96Z" fill="#f9e3d6" ' + o + '/>'
      + '<circle cx="200" cy="56" r="44" fill="#f6d5c3" ' + o + '/>'
      + '<path d="M200 46 L189 72 H211Z" fill="#f4a7a7" stroke="#3b2a2c" stroke-width="2"/><path d="M200 72 Q196 88 200 104" fill="none" stroke="#e57373" stroke-width="7"/>'
      + '<path d="M190 150 Q120 134 100 230 Q92 290 100 326 Q150 296 190 298Z" fill="#c995b8" ' + o + '/>'
      + '<path d="M210 150 Q280 134 300 230 Q308 290 300 326 Q250 296 210 298Z" fill="#c995b8" ' + o + '/>'
      + ribs()
      + '<rect x="192" y="100" width="16" height="88" rx="6" fill="#f7c6c6" stroke="#3b2a2c" stroke-width="2"/>'
      + '<path d="M194 112 H206 M194 124 H206 M194 136 H206 M194 148 H206 M194 160 H206 M194 172 H206" stroke="#c97a7a" stroke-width="2"/>'
      + '<path d="M200 186 L160 214 L138 252 M160 214 L170 262 M148 232 L120 250 M200 186 L240 214 L262 252 M240 214 L230 262 M252 232 L280 250" fill="none" stroke="#e57373" stroke-width="7" stroke-linecap="round"/>'
      + '<path d="M84 342 Q200 266 316 342" fill="none" stroke="#c0392b" stroke-width="9" stroke-linecap="round"/>'
      + '<line x1="136" y1="254" x2="356" y2="112" stroke="#b5476b" stroke-width="1.5" stroke-dasharray="2 4"/><circle cx="136" cy="254" r="9" fill="none" stroke="#fff" stroke-width="3"/>'
      + '<circle cx="392" cy="100" r="42" fill="#fff" stroke="#3b2a2c" stroke-width="2"/>' + alv
      + '<path d="M354 96 Q392 140 430 96" fill="none" stroke="#e53935" stroke-width="3" opacity=".7"/>'
      + lines + '</svg>';
  }
  function at(el, k) { el.style.left = (P[k][0] / 440 * 100) + '%'; el.style.top = (P[k][1] / 420 * 100) + '%'; return el; }
  var PARTS = ['nose', 'trach', 'bron', 'lung', 'alv', 'rib', 'dia'];
  /* 갈비뼈는 호흡계가 아니지만 호흡 운동에 중요해서 함께 배운다는 안내 창 */
  function ribPop() {
    var m = h('div', { class: 'modal' }, h('div', { class: 'reward popnote' }, h('h2', {}, '🦴 ', h('span', { k: 'r1_rib_t' })), h('p', { class: 'note strong', k: 'r1_rib_pop' }), btn('close', function () { m.remove(); }, 'btn primary')));
    document.body.append(m); applyI18n(m);
  }
  /* 그림 위 강조 고리와 공기 입자 이동 (공기가 들어가는 길) */
  function ring(fig) { var r = h('i', { class: 'orgring' }); r.hidden = true; fig.append(r); return function (k) { if (!k || !P[k]) { r.hidden = true; return; } r.hidden = false; r.style.left = (LEAD[k][0] / 440 * 100) + '%'; r.style.top = (LEAD[k][1] / 420 * 100) + '%'; r.classList.remove('pop'); void r.offsetWidth; r.classList.add('pop'); }; }
  function airAnim(fig) {
    var dots = '';
    for (var i = 0; i < 4; i++) dots += '<circle r="7" fill="#4fc3f7" stroke="#0277bd" stroke-width="2"><animateMotion dur="3.2s" begin="' + (i * .7) + 's" repeatCount="indefinite" path="M200 40 V66 Q196 88 200 104 V186 L160 214 L138 252 L356 112 L392 100"/></circle>';
    fig.append(h('div', { class: 'airlayer', html: '<svg viewBox="0 0 440 420" xmlns="http://www.w3.org/2000/svg">' + dots + '</svg>' }));
  }

  ACT.r1 = { id: 'r1', title: 't_r1', steps: [
    /* ① 호흡계 기관 이름 붙이기 */
    function (box, ctx) {
      var slots = PARTS.map(function (k) { return at(h('div', { 'data-slot': k, class: 'hslot' }), k); });
      var board = dragBoard(shuffle(PARTS).map(function (k) { return { id: k, k: 'r_' + k }; }), slots);
      var fig = h('div', { class: 'heartfig resfig', html: resSvg() }); slots.forEach(function (s) { fig.append(s); });
      var ck = btn('check', function () {
        var ok = true; PARTS.forEach(function (k) { var g = board.get(k) === k; board.mark(k, g); if (!g) ok = false; });
        if (!ok) { ctx.miss(); toast(t('try_again'), 'bad'); return; }
        board.lock(); ck.remove(); box.append(note('r1_s1ok', 'result')); applyI18n(box); ribPop(); ctx.ready();
      }, 'btn primary');
      box.append(todo('r1_s1_todo'), note('r1_intro', 'strong'), h('div', { class: 'cols wide1' }, h('div', { class: 'panel' }, fig), h('div', { class: 'panel' }, board.tray, ck)));
    },
    /* ② 공기가 들어가는 길 + 허파꽈리에서 일어나는 일 */
    function (box, ctx) {
      var PATH = ['nose', 'trach', 'bron', 'alv'], sl = PATH.map(function (k, i) { return h('div', { 'data-slot': 'p' + i, class: 'pathslot' }); });
      var fig = h('div', { class: 'heartfig resfig', html: resSvg() }), mark = ring(fig);
      var board = dragBoard(shuffle(PATH.concat(['eso'])).map(function (k) { return { id: k, k: k === 'eso' ? 'd2_o_eso' : 'r_' + k }; }), sl, function () { var got = sl.map(function (x) { return board.get(x.dataset.slot); }).filter(Boolean); mark(got[got.length - 1] === 'eso' ? null : got[got.length - 1]); });
      var path = h('div', { class: 'foodpath' }); sl.forEach(function (s, i) { path.append(h('span', { class: 'pnum', dir: 'ltr' }, String(i + 1)), s); if (i < 3) path.append(h('b', { class: 'parr' }, '→')); });
      var fb = fillBlank('r1_ex', [{ opts: ['c3_o2', 'c3_co2'], ans: 'c3_o2' }, { opts: ['c3_o2', 'c3_co2'], ans: 'c3_co2' }, { opts: ['r1_cap', 'r1_vein', 'r1_trach2'], ans: 'r1_cap' }, { opts: ['c3_gasex', 'r1_digest'], ans: 'c3_gasex' }]);
      var ck = btn('check', function () {
        var ok = true; PATH.forEach(function (k, i) { var g = board.get('p' + i) === k; board.mark('p' + i, g); if (!g) ok = false; });
        if (!fb.check()) ok = false;
        if (!ok) { ctx.miss(); toast(t('try_again'), 'bad'); return; }
        board.lock(); fb.lock(); ck.remove(); mark(null); airAnim(fig); App.send({ action: 'answer', act: 'r1', key: 'path', text: fb.text() });
        box.append(note('r1_s2ok', 'result')); applyI18n(box); ctx.ready();
      }, 'btn primary');
      box.append(todo('r1_s2_todo'), h('div', { class: 'cols wide1' }, h('div', {}, h('div', { class: 'panel' }, h('h3', { k: 'r1_path_t' }), path, board.tray), h('div', { class: 'panel' }, h('h3', { k: 'r1_alv_t' }), fb), ck), h('div', { class: 'panel' }, fig)));
    },
    /* ③ 연결하기 퀴즈: 기관과 하는 일을 선으로 잇기 */
    function (box, ctx) {
      var lm = lineMatch([['r_nose', 'r1_f_nose'], ['r_trach', 'r1_f_trach'], ['r_bron', 'r1_f_bron'], ['r_lung', 'r1_f_lung'], ['r_alv', 'r1_f_alv'], ['r_dia', 'r1_f_dia']]);
      var ck = btn('check', function () {
        if (!lm.check()) { ctx.miss(); toast(t('try_again'), 'bad'); return; }
        lm.lock(); ck.remove(); App.send({ action: 'answer', act: 'r1', key: 'match', text: lm.text() });
        App.send({ action: 'answer', act: 'r1', key: 'summary', text: t('r1_summary') });
        box.append(note('r1_summary', 'result'), btn('finish', ctx.finish, 'btn primary big')); applyI18n(box);
      }, 'btn primary');
      box.append(todo('r1_s3_todo'), h('div', { class: 'panel' }, lm), ck);
      setTimeout(lm.redraw, 50);
    }
  ] };
})();
