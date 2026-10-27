/* 배설계 3 (심화): 오줌 검사로 알아보는 콩팥의 이상 — 당뇨병, 단백뇨, 혈뇨를 도식화하고 여과·재흡수·분비 중 관련 과정 고르기 (교과서 p214 보충, p215) */
(function () {
  var CASES = [
    { id: 'dia', pad: 'glu', proc: 'reab', col: '#f2c14e' },
    { id: 'prot', pad: 'prot', proc: 'filter', col: '#43a047' },
    { id: 'blood', pad: 'blood', proc: 'filter', col: '#e53935' }
  ];
  /* 간단한 네프론 그림: 문제의 입자가 오줌으로 빠져나가는 길을 움직임으로 보여 줌 */
  function nephSvg(c, show) {
    function dot(path, begin) { return '<circle cx="90" cy="72" r="9" fill="' + c.col + '" stroke="#3b2a2c" stroke-width="2"><animateMotion dur="3s" begin="' + begin + 's" repeatCount="indefinite" path="' + path + '"/></circle>'; }
    var mv = !show ? '' : dot('M0 0 V214', 0) + (c.id === 'dia' ? dot('M0 0 V100 H96', 1) : '') + dot('M0 0 V214', 2);    // 당뇨: 일부는 재흡수되고 나머지가 오줌으로
    return '<svg class="nephmini" viewBox="0 0 300 310" xmlns="http://www.w3.org/2000/svg">'
      + '<path d="M0 40 Q50 40 70 58 M110 58 Q186 30 186 70" fill="none" stroke="#e57373" stroke-width="12" stroke-linecap="round"/>'
      + '<path d="M44 72 A46 46 0 0 0 136 72" fill="none" stroke="#fde9a8" stroke-width="20"/>'
      + '<rect x="76" y="110" width="28" height="160" fill="#fde9a8" stroke="#c9a227" stroke-width="2"/>'
      + '<rect x="172" y="70" width="28" height="200" fill="#f8c9c9" stroke="#e57373" stroke-width="2"/>'
      + '<circle cx="90" cy="72" r="26" fill="#f28b82" stroke="#c62828" stroke-width="2"/>'
      + '<rect x="62" y="272" width="56" height="30" rx="6" fill="#fff3b0" stroke="#c9a227" stroke-width="2"/>'
      + '<g font-size="12" font-weight="700" text-anchor="middle" fill="#3b2a2c"><text x="90" y="291" data-k="e2_u"></text><text x="90" y="22" data-k="e2_g"></text><text x="230" y="250" fill="#c62828" data-k="e2_c"></text><text x="44" y="200" data-k="e2_t"></text></g>'
      + mv + '</svg>';
  }
  var HOT = { filter: [14, 33], reab: [46, 52], secr: [46, 72] };     // 과정 버튼 위치(%)
  function strip(c) {
    return h('div', { class: 'ustrip' }, ['glu', 'prot', 'blood'].map(function (k) {
      var bad = c.pad === k;
      return h('div', { class: 'upad' }, h('i', { class: 'pad-' + k + (bad ? ' pos' : '') }), h('b', { k: 'e3_pad_' + k }), h('span', { class: bad ? 'posv' : '', k: bad ? 'e3_pos' : 'e3_neg' }));
    }));
  }
  function caseStep(c) {
    return function (box, ctx) {
      var fig = h('div', { class: 'heartfig nephfig' }), art = h('div', { html: nephSvg(c, false) }); fig.append(art);
      var chainBox = h('div', { hidden: '' }), picked = false;
      Object.keys(HOT).forEach(function (p) {
        var b = h('button', { type: 'button', class: 'hbtn', k: 'e3_hot_' + p });
        b.style.left = HOT[p][0] + '%'; b.style.top = HOT[p][1] + '%';
        b.addEventListener('click', function () {
          if (picked) return;
          if (p !== c.proc) { ctx.miss(); b.classList.add('bad'); toast(t('try_again'), 'bad'); return; }
          picked = true; b.classList.add('on'); chainBox.hidden = false;
          App.send({ action: 'answer', act: 'e3', key: c.id + '_proc', text: t('e3_hot_' + p) });
        });
        fig.append(b);
      });
      var CH = ['c1', 'c2', 'c3', 'c4'], sl = CH.map(function (k, i) { return h('div', { 'data-slot': 'p' + i, class: 'pathslot' }); });
      var board = dragBoard(shuffle(CH).map(function (k) { return { id: k, k: 'e3_' + c.id + '_' + k }; }), sl);
      var path = h('div', { class: 'foodpath chain' }); sl.forEach(function (s, i) { path.append(h('span', { class: 'pnum', dir: 'ltr' }, String(i + 1)), s); if (i < 3) path.append(h('b', { class: 'parr' }, '→')); });
      var ck = btn('check', function () {
        var ok = true; CH.forEach(function (k, i) { var g = board.get('p' + i) === k; board.mark('p' + i, g); if (!g) ok = false; });
        if (!ok) { ctx.miss(); toast(t('try_again'), 'bad'); return; }
        board.lock(); ck.remove(); art.innerHTML = nephSvg(c, true); applyI18n(art);
        App.send({ action: 'answer', act: 'e3', key: c.id, text: CH.map(function (k) { return t('e3_' + c.id + '_' + k); }).join(' → ') });
        chainBox.append(note('e3_' + c.id + '_ok', 'result'), note('e3_' + c.id + '_note')); applyI18n(chainBox); ctx.ready();
      }, 'btn primary');
      chainBox.append(h('h3', { k: 'e3_chain_t' }), path, board.tray, ck);
      box.append(todo('e3_case_todo'), h('div', { class: 'cols wide1' },
        h('div', { class: 'panel' }, h('h3', { k: 'e3_' + c.id + '_t' }), note('e3_' + c.id + '_story', 'strong'), strip(c), chainBox),
        h('div', { class: 'panel' }, note('e3_hot_q', 'strong'), fig)));
    };
  }

  ACT.e3 = { id: 'e3', title: 't_e3', steps: CASES.map(caseStep).concat([
    /* ④ 콩팥 건강 지키기 */
    function (box, ctx) {
      box.append(todo('e3_s4_todo'), note('e3_kidney'), h('div', { class: 'panel' }, oxQuiz([['e3_q1', 'O', 'e3_a1'], ['e3_q2', 'X', 'e3_a2'], ['e3_q3', 'O', 'e3_a3'], ['e3_q4', 'O', 'e3_a4']], ctx, function () {
        App.send({ action: 'answer', act: 'e3', key: 'summary', text: t('e3_summary') });
        box.append(note('e3_summary', 'result'), btn('finish', ctx.finish, 'btn primary big')); applyI18n(box);
      })));
    }
  ]) };
})();
