/* 소화계 1: 영양소 검출 반응 (교과서 p192~193)
   검출 용액을 먼저 넣어 용액 본래의 색을 본 뒤 음식물을 넣어 색 변화를 관찰합니다(갑자기 색이 생기는 오개념 방지). */
(function () {
  var FOODS = ['water', 'rice', 'soy', 'oil'];                      // 증류수, 쌀 음료수, 두유, 식용유
  var NUTS = ['starch', 'protein', 'fat', 'sugar'];
  var COLK = { starch: 'c_navy', protein: 'c_purple', fat: 'c_red', sugar: 'c_orange' };
  var R = {                                                           // 검출 용액: 용액 본래 색(neg), 반응 색(pos), 반응하는 음식
    starch:  { pos: '#2c3f8f', neg: '#c8862a', hit: { rice: 1 } },
    protein: { pos: '#8e44ad', neg: '#7fb3e0', hit: { soy: 1 } },
    fat:     { pos: '#e8344a', neg: '#f3b38a', hit: { soy: 1, oil: 1 } },
    sugar:   { pos: '#e8752a', neg: '#4a90d9', hit: { rice: 1 } }
  };
  var CONTAINS = { water: [], rice: ['starch', 'sugar'], soy: ['protein', 'fat'], oil: ['fat'] };
  var REC = {};                                                       // "실험 결과 기록하기"로 남긴 결과 (결과 표 단계에서 참고)
  function well(c, lvl) { return '<svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="24" fill="#f4f8fb" stroke="#5b6b75" stroke-width="3"/>' + (c ? '<circle cx="30" cy="30" r="' + (lvl || 20) + '" fill="' + c + '" style="transition:fill .9s"/>' : '') + '<ellipse cx="22" cy="22" rx="7" ry="4" fill="#fff" opacity=".55"/></svg>'; }
  function tube(c, lvl) { return '<svg viewBox="0 0 40 120"><path d="M8 4 V100 Q8 116 20 116 Q32 116 32 100 V4" fill="#f7fbfd" stroke="#5b6b75" stroke-width="3"/>' + (c ? '<path d="M10 ' + (110 - lvl) + ' V100 Q10 114 20 114 Q30 114 30 100 V' + (110 - lvl) + 'Z" fill="' + c + '"/>' : '') + '</svg>'; }
  function swatch(c) { return h('span', { class: 'drop', style: 'background:' + c }); }
  /* 기록한 결과를 작게 다시 그리기 */
  function miniPlate(p) {
    var g = h('div', { class: 'plate12 mini' }, h('span'), FOODS.map(function (f) { return h('b', { class: 'colh', k: 'd1_f_' + f }); }));
    ['starch', 'protein', 'fat'].forEach(function (r) { g.append(h('b', { class: 'rowh', k: 'd1_r_' + r })); FOODS.forEach(function (f) { g.append(h('span', { class: 'well', html: well(p[r + f]) })); }); });
    return g;
  }
  function miniTubes(tc) { return h('div', { class: 'tubes mini' }, FOODS.map(function (f) { return h('span', { class: 'tube', html: tube(tc[f], 60) }, h('small', { k: 'd1_f_' + f })); })); }
  function recBtn(key, data, ctx, holder) {
    var b = btn('d1_rec', function () { REC[key] = data(); b.disabled = true; toast(t('d1_recok')); holder.append(note('d1_recok', 'result')); applyI18n(holder); ctx.ready(); }, 'btn primary big recbtn');
    return b;
  }

  ACT.d1 = { id: 'd1', title: 't_d1', steps: [
    /* ① 검출 용액 알아보기 + 안전 */
    function (box, ctx) {
      REC = {};
      var cards = h('div', { class: 'reagents' });
      NUTS.forEach(function (k) {
        cards.append(h('div', { class: 'rcard' }, h('b', { k: 'd1_r_' + k }), h('span', { class: 'rs', k: 'd1_rs_' + k }),
          h('div', { class: 'chg' }, h('span', { class: 'chgi' }, swatch(R[k].neg), h('small', { k: 'd1_before' })), h('b', { class: 'arr' }, '→'), h('span', { class: 'chgi' }, swatch(R[k].pos), h('small', { k: 'd1_after' }))),
          h('span', { class: 'rc', k: 'd1_rc_' + k })));
      });
      var q = choice('d1_safeq', ['d1_safe1', 'd1_safe2', 'd1_safe3'], 0, function () { box.append(note('d1_safeok', 'result')); applyI18n(box); ctx.ready(); }, ctx.miss);
      box.append(todo('d1_s1_todo'), note('d1_intro', 'strong'), cards, h('div', { class: 'panel' }, h('h3', { k: 'd1_safe_t' }), q));
    },
    /* ② 개념 정리: 검출할 영양소 – 검출 용액 – 색 변화 3단 짝짓기 */
    function (box, ctx) {
      var slots = [], tokens = [];
      NUTS.forEach(function (n) { slots.push(h('div', { 'data-slot': 's_' + n, class: 'mslot' }), h('div', { 'data-slot': 'c_' + n, class: 'mslot' })); tokens.push({ id: 's_' + n, k: 'd1_rs_' + n }, { id: 'c_' + n, k: COLK[n], html: '<i class="cdot" style="background:' + R[n].pos + '"></i>' }); });
      var board = dragBoard(shuffle(tokens), slots);
      var tb = h('div', { class: 'match3' }, h('b', { class: 'mh', k: 'd1_m_nut' }), h('b', { class: 'mh', k: 'd1_m_sol' }), h('b', { class: 'mh', k: 'd1_m_col' }));
      NUTS.forEach(function (n, i) { tb.append(h('b', { class: 'mnut', k: 'n_' + n }), slots[i * 2], slots[i * 2 + 1]); });
      var ck = btn('check', function () {
        var ok = true;
        NUTS.forEach(function (n) { ['s_', 'c_'].forEach(function (p) { var g = board.get(p + n) === p + n; board.mark(p + n, g); if (!g) ok = false; }); });
        if (!ok) { ctx.miss(); toast(t('try_again'), 'bad'); return; }
        board.lock(); ck.remove(); box.append(note('d1_m_ok', 'result')); applyI18n(box); ctx.ready();
      }, 'btn primary');
      box.append(todo('d1_m_todo'), h('div', { class: 'panel' }, h('h3', { k: 'd1_m_t' }), tb, board.tray, ck));
    },
    /* ③ 12홈 판: 검출 용액을 먼저 넣고 → 음식물 넣기 */
    function (box, ctx) {
      var cur = null, food = null, filled = {}, added = {}, W = {}, plate = h('div', { class: 'plate12' }), msg = h('p', { class: 'note strong' }), rec = h('div');
      var tools = pickOne(['d1_r_starch', 'd1_r_protein', 'd1_r_fat'], function (k) { cur = k.slice(5); }, 'inline');
      var foods = pickOne(FOODS.map(function (f) { return 'd1_f_' + f; }), function (k) { food = k.slice(5); }, 'inline');
      var p2 = h('div', { class: 'ph2 off' }, h('b', { k: 'd1_phase2' }), foods);
      plate.append(h('span')); FOODS.forEach(function (f) { plate.append(h('b', { class: 'colh', k: 'd1_f_' + f })); });
      ['starch', 'protein', 'fat'].forEach(function (r) {
        plate.append(h('b', { class: 'rowh', k: 'd1_r_' + r }));
        FOODS.forEach(function (f) {
          var w = h('button', { type: 'button', class: 'well', html: well(), 'aria-label': t('d1_f_' + f) }); W[r + f] = w;
          w.addEventListener('click', function () {
            if (Object.keys(filled).length < 12) {                       // 1단계: 검출 용액
              if (!cur) { toast(t('d1_pick'), 'bad'); return; }
              if (cur !== r) { toast(t('d1_wrongrow'), 'bad'); return; }
              if (filled[r + f]) return; filled[r + f] = R[r].neg;
              w.classList.add('dropping'); setTimeout(function () { w.innerHTML = well(R[r].neg, 14); w.classList.remove('dropping'); }, 350);
              if (Object.keys(filled).length === 12) setTimeout(function () { msg.setAttribute('data-k', 'd1_reagentdone'); applyI18n(msg.parentNode); p2.classList.remove('off'); }, 500);
              return;
            }
            if (!food) { toast(t('d1_pickfood'), 'bad'); return; }   // 2단계: 음식물
            if (food !== f) { toast(t('d1_wrongcol'), 'bad'); return; }
            if (added[r + f]) return; added[r + f] = R[r].hit[f] ? R[r].pos : R[r].neg;
            w.innerHTML = well(R[r].neg, 20); w.classList.add('pour');
            setTimeout(function () { var c = w.querySelector('circle:nth-of-type(2)'); if (c) c.setAttribute('fill', added[r + f]); }, 80);
            if (Object.keys(added).length === 12) setTimeout(function () { box.append(note('d1_platedone', 'result'), rec); rec.append(recBtn('plate', function () { return Object.assign({}, added); }, ctx, rec)); applyI18n(box); }, 900);
          });
          plate.append(w);
        });
      });
      msg.setAttribute('data-k', 'd1_reagentfirst');
      box.append(todo('d1_s2_todo'), h('div', { class: 'cols' }, h('div', { class: 'panel' }, h('h3', { k: 'd1_plate_t' }), note('d1_plate_desc'), h('b', { k: 'd1_phase1' }), tools, p2, msg), h('div', { class: 'panel' }, plate)));
    },
    /* ④ 당 검출: 베네딕트 용액 → 음식물 → 가열 */
    function (box, ctx) {
      var tubes = h('div', { class: 'tubes' }), st = {}, heated = false, lab = h('div', { class: 'bath' }), TB = {}, rec = h('div');
      function paint(f, c, lvl) { TB[f].innerHTML = tube(c, lvl); TB[f].append(h('small', { k: 'd1_f_' + f })); applyI18n(TB[f]); }
      FOODS.forEach(function (f) {
        var tb = h('button', { type: 'button', class: 'tube', html: tube(null, 0) }, h('small', { k: 'd1_f_' + f })); TB[f] = tb;
        tb.addEventListener('click', function () { if (st[f]) return; st[f] = 1; paint(f, R.sugar.neg, 26); if (Object.keys(st).length === 4) addf.disabled = false; });
        tubes.append(tb);
      });
      var info = h('div', {});
      var addf = btn('d1_addfood', function () { addf.disabled = true; FOODS.forEach(function (f) { paint(f, R.sugar.neg, 60); }); info.append(note('d1_foodin', 'warn')); applyI18n(info); heat.disabled = false; }, 'btn'); addf.disabled = true;
      var heat = btn('d1_heat', function () {
        heat.disabled = true; heated = true; lab.classList.add('on');
        setTimeout(function () {
          var tc = {}; FOODS.forEach(function (f) { tc[f] = R.sugar.hit[f] ? R.sugar.pos : R.sugar.neg; paint(f, tc[f], 60); });
          box.append(note('d1_heatdone', 'result'));
          var q = choice('d1_heatq', ['d1_heat1', 'd1_heat2', 'd1_heat3'], 1, function () { q.append(note('d1_heatok', 'result'), rec); rec.append(recBtn('tubes', function () { return tc; }, ctx, rec)); applyI18n(q); }, ctx.miss);
          box.append(q); applyI18n(box);
        }, 2200);
      }, 'btn primary'); heat.disabled = true;
      lab.append(tubes);
      box.append(todo('d1_s3_todo'), h('div', { class: 'cols' }, h('div', { class: 'panel' }, h('h3', { k: 'd1_sugar_t' }), note('d1_sugar_desc'), lab, h('div', { class: 'row' }, addf, heat), info), h('div', { class: 'panel scaffold' }, h('h3', { k: 'd1_tip_t' }), h('ul', {}, h('li', { k: 'd1_tip1' }), h('li', { k: 'd1_tip2' })))));
    },
    /* ⑤ 결과 표 O/X (기록한 실험 결과를 보며) + 대조 질문 */
    function (box, ctx) {
      var cells = [], tb = h('table', { class: 'data oxtable' }, h('tr', {}, h('th', { k: 'd1_rcol' }), FOODS.map(function (f) { return h('th', { k: 'd1_f_' + f }); })));
      NUTS.forEach(function (r) {
        var tr = h('tr', {}, h('th', { k: 'd1_r_' + r }));
        FOODS.forEach(function (f) {
          var b = h('button', { type: 'button', class: 'ox' }, '?'); b._ans = R[r].hit[f] ? 'O' : 'X'; b._v = '?';
          b.addEventListener('click', function () { b._v = b._v === 'O' ? 'X' : 'O'; b.textContent = b._v; b.classList.remove('bad', 'good'); });
          cells.push(b); tr.append(h('td', {}, b));
        });
        tb.append(tr);
      });
      var ref = h('div', { class: 'panel refbox' }, h('h3', { k: 'd1_ref_t' }));
      if (REC.plate) ref.append(h('b', { k: 'd1_ref_plate' }), miniPlate(REC.plate)); else ref.append(note('d1_ref_none', 'warn'));
      if (REC.tubes) ref.append(h('b', { k: 'd1_ref_tube' }), miniTubes(REC.tubes));
      var after = h('div', { hidden: '' });
      var ck = btn('check', function () {
        var ok = true; cells.forEach(function (b) { var g = b._v === b._ans; b.classList.toggle('good', g); b.classList.toggle('bad', !g); if (!g) ok = false; });
        if (!ok) { ctx.miss(); toast(t('try_again'), 'bad'); return; }
        ck.remove(); after.hidden = false;
      }, 'btn primary');
      after.append(choice('d1_ctrlq', ['d1_ctrl1', 'd1_ctrl2', 'd1_ctrl3'], 0, function () { after.append(note('d1_ctrlok', 'result')); applyI18n(after); ctx.ready(); }, ctx.miss));
      box.append(todo('d1_s4_todo'), h('div', { class: 'cols wide1' }, h('div', { class: 'panel' }, note('d1_ox_desc'), tb, ck), ref), after);
    },
    /* ⑥ 결론: 음식물마다 들어 있는 영양소를 4개 중 모두 고르기 */
    function (box, ctx) {
      var groups = ['rice', 'soy', 'oil'].map(function (f) {
        var sel = {}, row = h('div', { class: 'multi' });
        NUTS.forEach(function (n) {
          var b = h('button', { type: 'button', class: 'opt mopt', 'aria-pressed': 'false', k: 'n_' + n });
          b.addEventListener('click', function () { if (row._lock) return; sel[n] = !sel[n]; b.setAttribute('aria-pressed', String(!!sel[n])); b.classList.remove('good', 'bad'); });
          b._n = n; row.append(b);
        });
        return { f: f, sel: sel, row: row, el: h('div', { class: 'panel mgroup' }, h('h3', { k: 'd1_pick_' + f }), note('d1_pick_all'), row) };
      });
      var q2 = h('div', {});
      var ck = btn('check', function () {
        var ok = true;
        groups.forEach(function (g) {
          [].forEach.call(g.row.children, function (b) { var want = CONTAINS[g.f].indexOf(b._n) >= 0, has = !!g.sel[b._n]; if (has) { b.classList.toggle('good', want); b.classList.toggle('bad', !want); } if (want !== has) ok = false; });
        });
        if (!ok) { ctx.miss(); toast(t('try_again'), 'bad'); return; }
        groups.forEach(function (g) { g.row._lock = true; }); ck.remove();
        App.send({ action: 'answer', act: 'd1', key: 'contains', text: groups.map(function (g) { return t('d1_f_' + g.f) + ': ' + CONTAINS[g.f].map(function (n) { return t('n_' + n); }).join(', '); }).join(' / ') });
        q2.append(choice('d1_q_ball', ['n_starch', 'n_protein', 'n_fat', 'n_sugar'], 0, function () {
          q2.append(choice('d1_q_candy', ['n_sugar', 'n_starch', 'n_protein', 'n_fat'], 0, function () {
            App.send({ action: 'answer', act: 'd1', key: 'summary', text: t('d1_summary') });
            q2.append(note('d1_summary', 'result'), note('d1_end'), btn('finish', ctx.finish, 'btn primary big')); applyI18n(q2);
          }, ctx.miss)); applyI18n(q2);
        }, ctx.miss)); applyI18n(q2);
      }, 'btn primary');
      box.append(todo('d1_s5_todo'), h('div', { class: 'cols' }, groups.map(function (g) { return g.el; })), ck, q2);
    }
  ] };
})();
