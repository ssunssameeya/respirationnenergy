/* 소화계 4: 소화효소가 작용하는 소화 과정 (교과서 p198~199, 그림 6-2) */
(function () {
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  /* 스피드 퀴즈 문제 은행: [질문 키, 정답 키, 오답 키들] */
  var BANK = [
    ['d4_sq_amyl', 'n_starch', ['n_protein', 'n_fat']], ['d4_sq_pep', 'n_protein', ['n_starch', 'n_fat']], ['d4_sq_tryp', 'n_protein', ['n_starch', 'n_fat']],
    ['d4_sq_lip', 'n_fat', ['n_starch', 'n_protein']], ['d4_sq_starchend', 'p_glu', ['p_amino', 'p_fatty']], ['d4_sq_protend', 'p_amino', ['p_glu', 'p_fatty']],
    ['d4_sq_fatend', 'p_fatty', ['p_glu', 'p_amino']], ['d4_sq_pepjuice', 'j_gastric', ['j_saliva', 'j_panc']], ['d4_sq_trypjuice', 'j_panc', ['j_gastric', 'j_saliva']],
    ['d4_sq_lipjuice', 'j_panc', ['j_gastric', 'j_saliva']], ['d4_sq_bile', 'd4_bile_role', ['d4_bile_x1', 'd4_bile_x2']], ['d4_sq_mouth', 'n_starch', ['n_protein', 'n_fat']],
    ['d4_sq_stom', 'n_protein', ['n_starch', 'n_fat']], ['d4_sq_fatwhere', 'd2_o_small', ['d2_o_mouth', 'd2_o_stom']], ['d4_sq_saliva', 'e_amyl', ['e_pep', 'e_lip']],
    ['d4_sq_hcl', 'd4_hcl_role', ['d4_hcl_x1', 'd4_hcl_x2']]
  ];

  ACT.d4 = { id: 'd4', title: 't_d4', steps: [
    /* ① 기관 × 영양소 표에 효소 놓기 */
    function (box, ctx) {
      var CELLS = { mouth_starch: 'amyl', stom_protein: 'pep', small_starch: 'amyl', small_protein: 'tryp', small_fat: 'lip' };
      var slots = [], tb = h('table', { class: 'data enzt' }, h('tr', {}, h('th', {}), ['starch', 'protein', 'fat'].map(function (n) { return h('th', { k: 'n_' + n }); })));
      ['mouth', 'stom', 'small'].forEach(function (o) {
        var tr = h('tr', {}, h('th', { k: 'd2_o_' + o }));
        ['starch', 'protein', 'fat'].forEach(function (n) {
          var key = o + '_' + n;
          if (CELLS[key]) { var s = h('div', { 'data-slot': key }); slots.push(s); tr.append(h('td', {}, s)); }
          else tr.append(h('td', { class: 'nocell' }, '—'));
        });
        tb.append(tr);
      });
      var bileSlot = h('div', { 'data-slot': 'bile' }); slots.push(bileSlot);
      var board = dragBoard(shuffle([{ id: 'amyl_1', k: 'e_amyl' }, { id: 'amyl_2', k: 'e_amyl' }, { id: 'pep', k: 'e_pep' }, { id: 'tryp', k: 'e_tryp' }, { id: 'lip', k: 'e_lip' }, { id: 'bile', k: 'e_bile' }]), slots);
      var fb = fillBlank('d4_juice', [{ opts: ['j_saliva', 'j_gastric', 'j_panc'], ans: 'j_gastric' }, { opts: ['j_saliva', 'j_gastric', 'j_panc'], ans: 'j_panc' }]);
      var ck = btn('check', function () {
        var ok = true;
        Object.keys(CELLS).forEach(function (k) { var g = (board.get(k) || '').split('_')[0] === CELLS[k]; board.mark(k, g); if (!g) ok = false; });
        var gb = board.get('bile') === 'bile'; board.mark('bile', gb); if (!gb) ok = false;
        if (!fb.check()) ok = false;
        if (!ok) { ctx.miss(); toast(t('try_again'), 'bad'); return; }
        board.lock(); fb.lock(); ck.remove(); box.append(note('d4_s1ok', 'result')); applyI18n(box); ctx.ready();
      }, 'btn primary');
      box.append(todo('d4_s1_todo'), h('div', { class: 'cols' }, h('div', { class: 'panel' }, h('h3', { k: 'd4_table_t' }), tb, h('div', { class: 'orgrow' }, h('b', { class: 'orgname', k: 'd4_bile_t' }), bileSlot)),
        h('div', { class: 'panel' }, h('h3', { k: 'd4_juice_t' }), note('d4_juice_desc'), fb)), board.tray, ck);
    },
    /* ② 분해 순서 잇기 */
    function (box, ctx) {
      var S = { s1: 'p_malt', s2: 'p_glu', p1: 'p_amino', f1: 'p_fatty' }, el = {};
      Object.keys(S).forEach(function (k) { el[k] = h('div', { 'data-slot': k }); });
      var board = dragBoard(shuffle([{ id: 'p_malt', k: 'p_malt' }, { id: 'p_glu', k: 'p_glu' }, { id: 'p_amino', k: 'p_amino' }, { id: 'p_fatty', k: 'p_fatty' }, { id: 'n_protein', k: 'n_protein' }]), Object.keys(S).map(function (k) { return el[k]; }));
      function arrow(k, where) { return h('span', { class: 'carr' }, h('small', { k: k }), h('small', { class: 'where', k: where }), h('b', {}, '→')); }
      var chains = h('div', { class: 'chains' },
        h('div', { class: 'chainrow c-s' }, h('b', { class: 'nut', k: 'n_starch' }), arrow('e_amyl', 'd4_w_mouth'), el.s1, arrow('d4_e_small', 'd4_w_small'), el.s2),
        h('div', { class: 'chainrow c-p' }, h('b', { class: 'nut', k: 'n_protein' }), arrow('e_pep', 'd4_w_stom'), h('span', { class: 'mid', k: 'd4_mid' }), arrow('e_tryp', 'd4_w_small'), el.p1),
        h('div', { class: 'chainrow c-f' }, h('b', { class: 'nut', k: 'n_fat' }), arrow('e_bile', 'd4_w_bile'), h('span', { class: 'mid', k: 'd4_fatdrop' }), arrow('e_lip', 'd4_w_small'), el.f1));
      var ck = btn('check', function () {
        var ok = true; Object.keys(S).forEach(function (k) { var g = board.get(k) === S[k]; board.mark(k, g); if (!g) ok = false; });
        if (!ok) { ctx.miss(); toast(t('try_again'), 'bad'); return; }
        board.lock(); ck.remove(); App.send({ action: 'answer', act: 'd4', key: 'summary', text: t('d4_summary') });
        box.append(note('d4_summary', 'result')); applyI18n(box); ctx.ready();
      }, 'btn primary');
      box.append(todo('d4_s2_todo'), h('div', { class: 'panel' }, chains), board.tray, ck);
    },
    /* ③ 스피드 퀴즈 */
    function (box, ctx) {
      var fin = btn('finish', ctx.finish, 'btn primary big'); fin.hidden = true;
      box.append(todo('d4_s3_todo'), note('d4_sq_desc', 'strong'));
      speedQuiz(box, BANK, 'd4', 60, function () { fin.hidden = false; });
      box.append(fin);
    }
  ] };
})();
