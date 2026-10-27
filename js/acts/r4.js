/* 호흡계 4: 호흡 운동 모형과 실제 비교하기 — 모형이 나타내는 점과 나타내지 못하는 점 (교과서 p211 해 보기) */
(function () {
  var P = { straw: [330, 40], balloon: [334, 168], space: [334, 262], glove: [56, 350], ring: [44, 214] };
  var LEAD = { straw: [190, 40], balloon: [206, 176], space: [226, 280], glove: [132, 338], ring: [112, 222] };
  function at(el, k) { el.style.left = (P[k][0] / 400 * 100) + '%'; el.style.top = (P[k][1] / 420 * 100) + '%'; return el; }
  /* ring: 0(내림)~1(올림), pull: 0~1(장갑 당김) */
  function modelSvg(ring, pull) {
    var wx = 8 * ring, by = 330, br = 1 + .35 * ring + .45 * pull, ry = 230 - 26 * ring, lines = '';
    Object.keys(P).forEach(function (k) { lines += '<line x1="' + P[k][0] + '" y1="' + P[k][1] + '" x2="' + LEAD[k][0] + '" y2="' + LEAD[k][1] + '" stroke="#3b2a2c" stroke-width="1.5" stroke-dasharray="4 3"/>'; });
    return '<svg class="modelsvg" viewBox="0 0 400 420" xmlns="http://www.w3.org/2000/svg">'
      + '<path d="M' + (120 - wx) + ' ' + by + ' V130 Q' + (120 - wx) + ' 96 166 90 V70 H194 V90 Q' + (240 + wx) + ' 96 ' + (240 + wx) + ' 130 V' + by + '" fill="rgba(200,230,245,.55)" stroke="#5a8fb0" stroke-width="4"/>'
      + '<rect x="160" y="56" width="40" height="18" rx="4" fill="#3f6fd1" stroke="#3b2a2c" stroke-width="2"/>'
      + '<rect x="176" y="14" width="8" height="140" fill="#fff" stroke="#3b2a2c" stroke-width="2"/>'
      + '<ellipse cx="180" cy="' + (150 + 28 * br) + '" rx="' + (22 * br) + '" ry="' + (28 * br) + '" fill="#f27a6a" stroke="#3b2a2c" stroke-width="3"/>'
      + [0, 1, 2].map(function (i) { return '<ellipse cx="180" cy="' + (ry + i * 16) + '" rx="' + (66 + wx) + '" ry="9" fill="none" stroke="#7b7b7b" stroke-width="5"/>'; }).join('')
      + '<path d="M' + (120 - wx) + ' ' + by + ' Q180 ' + (by + 8 + 60 * pull) + ' ' + (240 + wx) + ' ' + by + '" fill="#f6b8c9" stroke="#3b2a2c" stroke-width="3"/>'
      + '<path d="M180 ' + (by + 4 + 30 * pull) + ' V' + (by + 30 + 50 * pull) + '" stroke="#f6b8c9" stroke-width="12" stroke-linecap="round"/>'
      + lines + '</svg>';
  }
  var PARTS = { straw: 'r_trach', balloon: 'r_lung', space: 'r4_cavity', glove: 'r_dia', ring: 'r_rib' };
  var GOOD = ['r4_g1', 'r4_g2', 'r4_g3', 'r4_g4'], DIFF = ['r4_d1', 'r4_d2', 'r4_d3', 'r4_d4'];

  ACT.r4 = { id: 'r4', title: 't_r4', steps: [
    /* ① 모형 작동해 보고 실제 기관과 짝짓기 */
    function (box, ctx) {
      var ring = 0, pull = 0, seen = {}, fig = h('div', { class: 'heartfig modelfig' }), art = h('div');
      var slots = Object.keys(PARTS).map(function (k) { return at(h('div', { 'data-slot': k, class: 'hslot' }), k); });
      var board = dragBoard(shuffle(Object.keys(PARTS)).map(function (k) { return { id: k, k: PARTS[k] }; }), slots);
      fig.append(art); slots.forEach(function (s) { fig.append(s); });
      function draw() { art.innerHTML = modelSvg(ring, pull); if (ring > .9) seen.r = 1; if (pull > .9) seen.p = 1; }
      function sl(k, lo, hi, set) { var r = h('input', { type: 'range', min: '0', max: '100', value: '0', class: 'rng', 'aria-label': t(k) }); r.addEventListener('input', function () { set(+r.value / 100); draw(); }); return h('div', { class: 'ctrl' }, h('b', { k: k }), h('div', { class: 'row rngrow' }, h('small', { k: lo }), r, h('small', { k: hi }))); }
      draw();
      var q = h('div', {});
      var ck = btn('check', function () {
        if (!seen.r || !seen.p) { toast(t('r4_tryall'), 'bad'); return; }
        var ok = true; Object.keys(PARTS).forEach(function (k) { var g = board.get(k) === k; board.mark(k, g); if (!g) ok = false; });
        if (!ok) { ctx.miss(); toast(t('try_again'), 'bad'); return; }
        board.lock(); ck.remove();
        q.append(choice('r4_q1', ['r4_q1a', 'r4_q1b', 'r4_q1c'], 0, function () { q.append(note('r4_s1ok', 'result')); applyI18n(q); ctx.ready(); }, ctx.miss)); applyI18n(q);
      }, 'btn primary');
      box.append(todo('r4_s1_todo'), h('div', { class: 'cols wide1' }, h('div', { class: 'panel' }, fig),
        h('div', { class: 'panel' }, sl('r4_ring', 'r3_down', 'r3_up', function (v) { ring = v; }), sl('r4_glove', 'r4_rest', 'r4_pull', function (v) { pull = v; }), board.tray, ck)), q);
    },
    /* ② 모둠 활동: 닮은 점·다른 점을 직접 찾아 쓰고, 같은 반 친구들의 의견 보기 */
    function (box, ctx) {
      var prev = App.me.ans || {};
      function inputs(key) {
        var old = String(prev['r4.' + key] || '').split('\n');
        return [0, 1, 2].map(function (i) { return h('input', { class: 'ans opin', maxlength: '120', 'data-kp': 'r4_ph_' + key, placeholder: t('r4_ph_' + key), value: old[i] || '' }); });
      }
      var sim = inputs('sim'), diff = inputs('diff'), board = h('div', { class: 'opboard' });
      function vals(a) { return a.map(function (x) { return x.value.trim(); }).filter(function (v) { return v.length >= 4; }); }
      function show() {
        board.innerHTML = ''; board.append(note('loading')); applyI18n(board);
        App.send({ action: 'classAns', act: 'r4' }).then(function (r) {
          board.innerHTML = '';
          if (!r.ok) { board.append(h('p', { class: 'note warn' }, App.errMsg(r))); return; }
          if (!r.list.length) { board.append(note('r4_noop')); applyI18n(board); return; }
          var byG = {}; r.list.forEach(function (x) { (byG[x.grp || '-'] = byG[x.grp || '-'] || []).push(x); });
          Object.keys(byG).forEach(function (gk) {
            var card = h('div', { class: 'opcard' }, h('b', { class: 'opg' }, h('span', { k: 'r4_grp' }), ' ' + gk));
            byG[gk].forEach(function (x) {
              ['sim', 'diff'].forEach(function (k) {
                String(x.ans[k] || '').split('\n').filter(Boolean).forEach(function (line) {
                  card.append(h('p', { class: 'op op-' + k + (x.me ? ' me' : '') }, h('i', { k: k === 'sim' ? 'r4_tag_sim' : 'r4_tag_diff' }), ' ' + line + ' ', h('small', {}, '— ' + x.nick)));
                });
              });
            });
            board.append(card);
          });
          applyI18n(board);
        });
      }
      var sub = btn('r4_submit', function () {
        var a = vals(sim), b = vals(diff);
        if (!a.length || !b.length) { toast(t('r4_need_each'), 'bad'); return; }
        sub.disabled = true; App.me.ans = App.me.ans || {}; App.me.ans['r4.sim'] = a.join('\n'); App.me.ans['r4.diff'] = b.join('\n');
        API.call({ action: 'answers', id: App.id, pw: App.pw, list: [{ act: 'r4', key: 'sim', text: a.join('\n') }, { act: 'r4', key: 'diff', text: b.join('\n') }] }).then(function (r) {
          sub.disabled = false; if (!r || !r.ok) { toast(App.errMsg(r), 'bad'); return; }
          toast(t('r4_sent')); show(); ctx.ready();
        });
      }, 'btn primary');
      box.append(todo('r4_s2_todo'), note('r4_analogy'), h('div', { class: 'cols' },
        h('div', { class: 'panel sortg' }, h('h3', { k: 'r4_good_t' }), sim), h('div', { class: 'panel sortd' }, h('h3', { k: 'r4_diff_t' }), diff)),
        h('div', { class: 'row' }, sub, btn('r4_seeall', show)), h('div', { class: 'panel' }, h('h3', { k: 'r4_class_t' }), board));
      if (prev['r4.sim']) { ctx.ready(); show(); }
    },
    /* ③ 최종 정리: 선생님이 반에 공유한 의견을 끌어서 닮은 점·다른 점으로 나누기 (공유 전이면 기본 문장) */
    function (box, ctx) {
      var area = h('div', {});
      function build(shared) {
        area.innerHTML = '';
        var on = !!(shared && shared.length);
        var items = on ? shared.map(function (x, i) { return { id: 'x' + i, txt: x.t, c: x.c }; })
          : GOOD.map(function (k) { return { id: k, k: k, c: 'sim' }; }).concat(DIFF.map(function (k) { return { id: k, k: k, c: 'diff' }; }));
        var ns = items.filter(function (x) { return x.c === 'sim'; }).length, nd = items.length - ns, gs = [], ds = [];
        for (var i = 0; i < ns; i++) gs.push(h('div', { 'data-slot': 'g' + i, class: 'roleslot' }));
        for (var j = 0; j < nd; j++) ds.push(h('div', { 'data-slot': 'd' + j, class: 'roleslot' }));
        var bd = dragBoard(shuffle(items).map(function (x) { return { id: x.id, k: x.k || 'r4_blank' }; }), gs.concat(ds));
        var cat = {}; items.forEach(function (x) { cat[x.id] = x.c; });
        function fixText() { items.forEach(function (x) { if (x.k) return; var sp = area.querySelector('[data-id="' + x.id + '"] [data-k]'); if (sp) { sp.removeAttribute('data-k'); sp.textContent = x.txt; } }); }
        var ck = btn('check', function () {
          var ok = true;
          gs.forEach(function (s, i) { var g = cat[bd.get('g' + i)] === 'sim'; bd.mark('g' + i, g); if (!g) ok = false; });
          ds.forEach(function (s, i) { var g = cat[bd.get('d' + i)] === 'diff'; bd.mark('d' + i, g); if (!g) ok = false; });
          if (!ok) { ctx.miss(); toast(t('try_again'), 'bad'); return; }
          bd.lock(); ck.remove();
          ACT.r4._diff = items.filter(function (x) { return x.c === 'diff'; }).map(function (x) { return x.txt || t(x.k); });
          App.send({ action: 'answer', act: 'r4', key: 'sorted', text: items.map(function (x) { return (x.c === 'sim' ? '+ ' : '- ') + (x.txt || t(x.k)); }).join('\n') });
          area.append(note('r4_s2ok', 'result')); applyI18n(area); fixText(); ctx.ready();
        }, 'btn primary');
        area.append(note(on ? 'r4_shared_on' : 'r4_shared_off', on ? 'strong' : 'warn'),
          h('div', { class: 'cols' }, h('div', { class: 'panel sortg' }, h('h3', { k: 'r4_good_t' }), gs), h('div', { class: 'panel sortd' }, h('h3', { k: 'r4_diff_t' }), ds)), bd.tray, ck);
        applyI18n(area); fixText();
      }
      var reload = btn('r4_reload', function () { App.send({ action: 'state' }).then(function () { build(((App.st || {}).shares || {}).r4); }); });
      box.append(todo('r4_s3_todo'), h('div', { class: 'row' }, reload), area);
      build(((App.st || {}).shares || {}).r4);
    },
    /* ④ 과학적 태도: 모형의 한계를 알고 고쳐 보기 */
    function (box, ctx) {
      var list = ACT.r4._diff || DIFF.map(function (k) { return t(k); }), chosen = null, pick = h('div', { class: 'pickone' });
      list.forEach(function (txt) {
        var b = h('button', { type: 'button', class: 'opt', 'aria-pressed': 'false' }, txt);
        b.addEventListener('click', function () { chosen = txt; [].forEach.call(pick.children, function (x) { x.setAttribute('aria-pressed', String(x === b)); }); });
        pick.append(b);
      });
      var ta = answerBox('r4', 'improve', 'r4_ph', 10), after = h('div', { hidden: '' });
      var save = btn('r4_save', function () {
        if (!chosen) { toast(t('r4_pickfirst'), 'bad'); return; }
        if (!ta.ok()) { toast(t('need_write'), 'bad'); return; }
        save.disabled = true;
        App.send({ action: 'answer', act: 'r4', key: 'limit', text: chosen });
        ta.save(); after.hidden = false;
      }, 'btn primary');
      after.append(choice('r4_q2', ['r4_q2a', 'r4_q2b', 'r4_q2c'], 0, function () {
        App.send({ action: 'answer', act: 'r4', key: 'summary', text: t('r4_summary') });
        after.append(note('r4_summary', 'result'), btn('finish', ctx.finish, 'btn primary big')); applyI18n(after);
      }, ctx.miss));
      box.append(todo('r4_s4_todo'), h('div', { class: 'panel' }, h('h3', { k: 'r4_pick_t' }), pick, h('h3', { k: 'r4_fix_t' }), ta, save), after);
    }
  ] };
})();
