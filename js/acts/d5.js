/* 소화계 5: 소화된 영양소의 흡수 (교과서 p199, 그림 6-3) */
(function () {
  var VILLUS = '<svg viewBox="0 0 320 260" xmlns="http://www.w3.org/2000/svg">'
    + '<path d="M20 250 Q20 120 70 110 Q120 100 120 250Z M120 250 Q120 60 170 50 Q220 60 220 250Z M220 250 Q220 120 270 110 Q300 115 300 250Z" fill="#f6b8a6" stroke="#3b2a2c" stroke-width="3"/>'
    + '<g class="part p-cap"><path d="M150 240 V90 Q170 60 190 90 V240" fill="none" stroke="#e53935" stroke-width="4"/><path d="M150 120 Q170 135 190 115 M150 150 Q170 165 190 145 M150 180 Q170 195 190 175 M150 210 Q170 225 190 205" fill="none" stroke="#e53935" stroke-width="2.5"/><path d="M158 240 V96 M182 240 V96" stroke="#1e63c9" stroke-width="3" fill="none"/></g>'
    + '<g class="part p-lac"><path d="M170 240 V100" stroke="#fff7cf" stroke-width="9" stroke-linecap="round"/><path d="M170 240 V100" stroke="#e0b84a" stroke-width="2" stroke-dasharray="4 4"/></g>'
    + '<g font-size="15" font-weight="700" fill="#3b2a2c"><text x="226" y="70">①</text><text x="24" y="100">②</text><text x="196" y="140">③</text><text x="176" y="250">④</text></g>'
    + '<path d="M222 66 L195 80" stroke="#3b2a2c" stroke-width="2"/></svg>';
  ACT.d5 = { id: 'd5', title: 't_d5', steps: [
    /* ① 융털의 구조와 흡수 경로 정리 */
    function (box, ctx) {
      var f1 = fillBlank('d5_sum1', [{ opts: ['d5_fold', 'd5_villus', 'd5_lact'], ans: 'd5_fold' }, { opts: ['d5_villus', 'd5_cap', 'd5_fold'], ans: 'd5_villus' }, { opts: ['d5_wide', 'd5_narrow'], ans: 'd5_wide' }]);
      var f2 = fillBlank('d5_sum2', [{ opts: ['d5_cap', 'd5_lact'], ans: 'd5_cap' }, { opts: ['d5_cap', 'd5_lact'], ans: 'd5_lact' }]);
      var f3 = fillBlank('d5_sum3', [{ opts: ['d2_o_large', 'd2_o_stom', 'd2_o_eso'], ans: 'd2_o_large' }, { opts: ['d5_water', 'n_protein', 'p_glu'], ans: 'd5_water' }]);
      var key = h('ol', { class: 'vkey' }, h('li', { k: 'd5_k1' }), h('li', { k: 'd5_k2' }), h('li', { k: 'd5_k3' }), h('li', { k: 'd5_k4' }));
      var ck = btn('check', function () {
        var ok = [f1, f2, f3].map(function (f) { return f.check(); }).every(Boolean);
        if (!ok) { ctx.miss(); toast(t('try_again'), 'bad'); return; }
        [f1, f2, f3].forEach(function (f) { f.lock(); }); ck.remove();
        App.send({ action: 'answer', act: 'd5', key: 'summary', text: [f1.text(), f2.text(), f3.text()].join(' ') });
        box.append(note('d5_s1ok', 'result')); applyI18n(box); ctx.ready();
      }, 'btn primary');
      box.append(todo('d5_s1_todo'), h('div', { class: 'cols' }, h('div', { class: 'panel' }, h('h3', { k: 'd5_fig_t' }), h('div', { class: 'villus', html: VILLUS }), key, note('d5_fig_note')),
        h('div', { class: 'panel' }, h('h3', { k: 'rule_t' }), f1, f2, f3, ck)));
    },
    /* ② 빠르게 분류하기 */
    function (box, ctx) {
      var ITEMS = [['p_glu', 'cap'], ['p_amino', 'cap'], ['d5_i_min', 'cap'], ['d5_i_wvit', 'cap'], ['d5_i_b', 'cap'], ['d5_i_c', 'cap'],
        ['d5_i_fatty', 'lac'], ['d5_i_mono', 'lac'], ['d5_i_fvit', 'lac'], ['d5_i_a', 'lac'], ['d5_i_d', 'lac'], ['d5_i_k', 'lac']];
      var secs = 30, left, score, cur, run = false, timer = null, best = 0;
      try { best = Number(localStorage.getItem('tt6-best-d5')) || 0; } catch (e) {}
      var item = h('div', { class: 'fallitem' }), clock = h('span', { class: 'lcd', dir: 'ltr' }, secs + 's'), sc = h('span', { class: 'lcd', dir: 'ltr' }, '0'), bestEl = h('b', { dir: 'ltr' }, String(best));
      var fin = btn('finish', ctx.finish, 'btn primary big'); fin.hidden = true; var endNote = note('d5_end', 'result'); endNote.hidden = true;
      function next() { var n; do { n = ITEMS[Math.floor(Math.random() * ITEMS.length)]; } while (cur && n === cur); cur = n; item.setAttribute('data-k', n[0]); item.textContent = t(n[0]); item.className = 'fallitem drop'; void item.offsetWidth; }
      function pick(where, el) {
        if (!run) return;
        if (cur[1] === where) { score++; sc.textContent = score; el.classList.add('hit'); setTimeout(function () { el.classList.remove('hit'); }, 200); next(); }
        else { el.classList.add('miss'); item.classList.add('wrong'); run = false; setTimeout(function () { el.classList.remove('miss'); run = true; next(); }, 600); }
      }
      var capB = h('button', { type: 'button', class: 'bucket b-cap' }, h('b', { k: 'd5_cap' }), h('small', { k: 'd5_cap_hint' }));
      var lacB = h('button', { type: 'button', class: 'bucket b-lac' }, h('b', { k: 'd5_lact' }), h('small', { k: 'd5_lac_hint' }));
      capB.addEventListener('click', function () { pick('cap', capB); }); lacB.addEventListener('click', function () { pick('lac', lacB); });
      var start = btn('d4_sq_start', function () {
        start.hidden = true; score = 0; left = secs; sc.textContent = '0'; clock.textContent = secs + 's'; run = true; next();
        timer = setInterval(function () { left--; clock.textContent = left + 's'; if (left <= 0) {
          clearInterval(timer); run = false; item.removeAttribute('data-k'); var nb = score > best;
          if (nb) { best = score; try { localStorage.setItem('tt6-best-d5', String(best)); } catch (e) {} bestEl.textContent = String(best); }
          item.className = 'fallitem'; item.textContent = t('d4_sq_end') + ' ' + score + (nb ? ' · ' + t('d4_sq_newbest') : '');
          App.send({ action: 'answer', act: 'd5', key: 'speed', text: String(best) });
          start.hidden = false; start.setAttribute('data-k', 'd4_sq_again'); start.textContent = t('d4_sq_again'); fin.hidden = false; endNote.hidden = false;
        } }, 1000);
      }, 'btn primary big');
      box.append(todo('d5_s2_todo'), h('div', { class: 'sq' }, h('div', { class: 'row sq-top' }, h('span', { k: 'd4_sq_time' }), clock, h('span', { k: 'd4_sq_score' }), sc, h('span', { k: 'd4_sq_best' }), bestEl),
        h('div', { class: 'sorter' }, capB, item, lacB), start), endNote, fin);
    }
  ] };
})();
