/* 소화계 3: 침의 소화 작용 탐구하기 (교과서 p196~197) */
(function () {
  var COL = { starch: '#ece0bd', water: '#cfe7f8', saliva: '#f1e7c6' };
  function tubeSvg(layers, label) {                    // layers: 색 배열 (아래부터)
    var s = '<svg viewBox="0 0 50 140"><path d="M10 6 V116 Q10 132 25 132 Q40 132 40 116 V6" fill="#fafdff" stroke="#5b6b75" stroke-width="3"/>', y = 128;
    layers.forEach(function (c) { s += '<rect x="12" y="' + (y - 34) + '" width="26" height="34" fill="' + c + '"/>'; y -= 34; });
    return s + '<text x="25" y="20" text-anchor="middle" font-size="14" font-weight="700" fill="#3b2a2c">' + label + '</text></svg>';
  }
  function dish(c) { return '<svg viewBox="0 0 90 60"><ellipse cx="45" cy="34" rx="40" ry="20" fill="#f7fbfd" stroke="#5b6b75" stroke-width="3"/><circle cx="45" cy="34" r="9" fill="' + (c || '#eef3f6') + '"/></svg>'; }

  ACT.d3 = { id: 'd3', title: 't_d3', steps: [
    /* ① 예상 */
    function (box, ctx) {
      var pk = pickOne(['d3_h1', 'd3_h2', 'd3_h3'], function (k) { App.send({ action: 'answer', act: 'd3', key: 'predict', text: t(k) }); ctx.ready(); });
      box.append(todo('d3_s1_todo'), h('div', { class: 'panel' }, h('p', { class: 'q', k: 'd3_q' }), pk));
    },
    /* ② 침 희석액 만들기 + 시험관 준비 */
    function (box, ctx) {
      var saliva = false, sel = null, T = { ga: [], na: [] }, steps = h('div', { class: 'row' });
      [['d3_m1', 600], ['d3_m2', 1800], ['d3_m3', 600]].forEach(function (x, i) {
        var b = btn(x[0], function () { b.disabled = true; b.classList.add('donebtn'); setTimeout(function () { if (steps.children[i + 1]) steps.children[i + 1].disabled = false; else { saliva = true; toast(t('d3_saliva_ok')); liq.querySelector('[data-l="saliva"]').disabled = false; } }, x[1]); }, i ? 'btn' : 'btn primary');
        b.disabled = i > 0; steps.append(b);
      });
      var view = h('div', { class: 'tubes2' });
      function draw() {
        view.innerHTML = '';
        [['ga', t('d3_tA')], ['na', t('d3_tB')]].forEach(function (x) {
          var b = h('button', { type: 'button', class: 'tubebtn' + (sel === x[0] ? ' sel' : ''), html: tubeSvg(T[x[0]].map(function (l) { return COL[l]; }), x[1]) });
          b.append(h('small', {}, T[x[0]].map(function (l) { return t('d3_l_' + l); }).join(' + ') || '-'));
          b.addEventListener('click', function () { sel = x[0]; draw(); });
          view.append(b);
        });
      }
      var liq = h('div', { class: 'row' });
      ['starch', 'water', 'saliva'].forEach(function (l) {
        var b = h('button', { type: 'button', class: 'btn', 'data-l': l, k: 'd3_l_' + l, disabled: l === 'saliva' ? '' : null });
        b.addEventListener('click', function () {
          if (!sel) { toast(t('d3_pick'), 'bad'); return; }
          if (T[sel].length >= 2) { toast(t('d3_full'), 'bad'); return; }
          T[sel].push(l); draw();
        });
        liq.append(b);
      });
      var reset = btn('d3_reset', function () { T = { ga: [], na: [] }; draw(); }, 'btn small');
      var ck = btn('check', function () {
        var a = T.ga.slice().sort().join(), b = T.na.slice().sort().join();
        if (a === 'starch,water' && b === 'saliva,starch') { ck.remove(); box.append(note('d3_s2ok', 'result')); applyI18n(box); ctx.ready(); }
        else { ctx.miss(); box.append(note('d3_s2hint', 'warn')); applyI18n(box); }
      }, 'btn primary');
      draw();
      box.append(todo('d3_s2_todo'), h('div', { class: 'cols' },
        h('div', { class: 'panel' }, h('h3', { k: 'd3_saliva_t' }), note('d3_saliva_desc'), steps),
        h('div', { class: 'panel' }, h('h3', { k: 'd3_tube_t' }), note('d3_tube_desc'), view, h('b', { k: 'd3_add' }), liq, h('div', { class: 'row' }, reset, ck))));
    },
    /* ③ 물에 담그기 (온도) */
    function (box, ctx) {
      var bath = h('div', { class: 'bath2' }, h('span', { class: 'thermo', dir: 'ltr' }, '? ℃'), h('div', { class: 'tubes2', html: tubeSvg([COL.starch, COL.water], t('d3_tA')) + tubeSvg([COL.starch, COL.saliva], t('d3_tB')) }));
      var clock = h('span', { class: 'lcd', dir: 'ltr' }, '00:00');
      var wait = btn('d3_wait', function () {
        wait.disabled = true; var s = 0, iv = setInterval(function () { s += 30; clock.textContent = String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); if (s >= 600) { clearInterval(iv); box.append(note('d3_waitdone', 'result')); applyI18n(box); ctx.ready(); } }, 90);
      }, 'btn primary'); wait.disabled = true;
      var q = choice('d3_tq', ['d3_t1', 'd3_t2', 'd3_t3'], 1, function () { bath.querySelector('.thermo').textContent = '35~40 ℃'; bath.classList.add('warm'); q.append(note('d3_tok', 'result')); applyI18n(q); wait.disabled = false; }, ctx.miss);
      box.append(todo('d3_s3_todo'), h('div', { class: 'cols' }, h('div', { class: 'panel' }, q), h('div', { class: 'panel' }, bath, h('div', { class: 'row' }, wait, clock))));
    },
    /* ④ 검출 */
    function (box, ctx) {
      var d1 = h('div', { class: 'dish', html: dish() }), d2 = h('div', { class: 'dish', html: dish() });
      var tb = h('div', { class: 'tubes2', html: tubeSvg([COL.starch, COL.water], t('d3_tA')) + tubeSvg([COL.starch, COL.saliva], t('d3_tB')) });
      var iod = btn('d3_iod', function () { iod.disabled = true; d1.innerHTML = dish('#2c3f8f'); d2.innerHTML = dish('#d9a54a'); ben.disabled = false; }, 'btn primary');
      var ben = btn('d3_ben', function () { ben.disabled = true; tb.innerHTML = tubeSvg(['#4a90d9', '#4a90d9'], t('d3_tA')) + tubeSvg(['#e8752a', '#e8752a'], t('d3_tB')); table.hidden = false; }); ben.disabled = true;
      var cells = [], table = h('div', { hidden: '' });
      var tbl = h('table', { class: 'data oxtable' }, h('tr', {}, h('th', { k: 'd1_rcol' }), h('th', {}, t('d3_tA')), h('th', {}, t('d3_tB'))));
      [['d1_r_starch', ['O', 'X']], ['d1_r_sugar', ['X', 'O']]].forEach(function (r) {
        var tr = h('tr', {}, h('th', { k: r[0] }));
        r[1].forEach(function (a) { var b = h('button', { type: 'button', class: 'ox' }, '?'); b._ans = a; b._v = '?'; b.addEventListener('click', function () { b._v = b._v === 'O' ? 'X' : 'O'; b.textContent = b._v; b.classList.remove('bad', 'good'); }); cells.push(b); tr.append(h('td', {}, b)); });
        tbl.append(tr);
      });
      var ck = btn('check', function () {
        var ok = true; cells.forEach(function (b) { var g = b._v === b._ans; b.classList.toggle('good', g); b.classList.toggle('bad', !g); if (!g) ok = false; });
        if (!ok) { ctx.miss(); toast(t('try_again'), 'bad'); return; }
        ck.remove();
        var q = choice('d3_wq', ['d3_w1', 'd3_w2', 'd3_w3'], 0, function () { q.append(note('d3_wok', 'result')); applyI18n(q); ctx.ready(); }, ctx.miss);
        table.append(q); applyI18n(table);
      }, 'btn primary');
      table.append(note('d1_ox_desc'), tbl, ck);
      box.append(todo('d3_s4_todo'), h('div', { class: 'cols' },
        h('div', { class: 'panel' }, h('h3', { k: 'd3_iod_t' }), h('div', { class: 'row dishes' }, h('figure', {}, d1, h('figcaption', {}, t('d3_tA'))), h('figure', {}, d2, h('figcaption', {}, t('d3_tB')))), iod),
        h('div', { class: 'panel' }, h('h3', { k: 'd3_ben_t' }), tb, ben)), table);
    },
    /* ⑤ 가위 모형 + 정리 */
    function (box, ctx) {
      var cut = {}, chain = h('div', { class: 'chain' }), msg = h('p', { class: 'note' });
      function draw() {
        chain.innerHTML = '';
        for (var i = 0; i < 8; i++) {
          chain.append(h('span', { class: 'hex' }));
          if (i < 7) (function (g) { var b = h('button', { type: 'button', class: 'gap' + (cut[g] ? ' cut' : ''), 'aria-label': '✂' }, cut[g] ? '✂' : ''); b.addEventListener('click', function () { if (done) return; cut[g] = !cut[g]; draw(); checkCut(); }); chain.append(b); })(i);
        }
      }
      var done = false, after = h('div', { hidden: '' });
      function checkCut() {
        var sizes = [], n = 1; for (var g = 0; g < 7; g++) { if (cut[g]) { sizes.push(n); n = 1; } else n++; } sizes.push(n);
        if (sizes.length === 4 && sizes.every(function (x) { return x === 2; })) { done = true; chain.classList.add('done'); msg.setAttribute('data-k', 'd3_cutok'); msg.textContent = t('d3_cutok'); after.hidden = false; }
        else if (sizes.some(function (x) { return x === 1; })) { msg.setAttribute('data-k', 'd3_cutbad'); msg.textContent = t('d3_cutbad'); }
        else { msg.removeAttribute('data-k'); msg.textContent = ''; }
      }
      draw();
      var fb = fillBlank('d3_sum', [{ opts: ['e_amyl', 'e_pep', 'e_lip'], ans: 'e_amyl' }, { opts: ['n_starch', 'n_protein', 'n_fat'], ans: 'n_starch' }, { opts: ['p_malt', 'p_amino', 'p_fatty'], ans: 'p_malt' }]);
      var ck = btn('check', function () {
        if (!fb.check()) { ctx.miss(); toast(t('try_again'), 'bad'); return; }
        fb.lock(); ck.remove(); App.send({ action: 'answer', act: 'd3', key: 'summary', text: fb.text() });
        after.append(note('d3_end', 'result'), btn('finish', ctx.finish, 'btn primary big')); applyI18n(after);
      }, 'btn primary');
      after.append(fb, ck);
      box.append(todo('d3_s5_todo'), h('div', { class: 'panel' }, h('div', { class: 'legend' }, h('span', {}, h('i', { class: 'hex' }), h('i', { class: 'hex' }), h('i', { class: 'hex' }), ' ', h('b', { k: 'd3_lg_starch' })), h('span', {}, h('i', { class: 'hex' }), h('i', { class: 'hex' }), ' ', h('b', { k: 'd3_lg_malt' })), h('span', {}, '✂ ', h('b', { k: 'd3_lg_enz' }))),
        chain, msg, btn('d3_reset', function () { if (done) return; cut = {}; draw(); checkCut(); }, 'btn small')), after);
    }
  ] };
})();
