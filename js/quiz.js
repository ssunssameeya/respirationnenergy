/* 일일 퀴즈 탭: 하루 3문제, 완료한 활동 범위에서, 틀린 문제는 다음 날 다시 / 오답노트 */
var Quiz = {
  byId: function (id) { for (var i = 0; i < QUIZ.length; i++) if (QUIZ[i].id === id) return QUIZ[i]; return null; },
  seed: function (str) { var h1 = 1779033703; for (var i = 0; i < str.length; i++) { h1 = Math.imul(h1 ^ str.charCodeAt(i), 3432918353); h1 = h1 << 13 | h1 >>> 19; } return function () { h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507); h1 = Math.imul(h1 ^ (h1 >>> 13), 3266489909); return ((h1 ^= h1 >>> 16) >>> 0) / 4294967296; }; },
  /* 오늘의 3문제: 어제 틀린 문제(최대 2개)를 먼저, 나머지는 학번+날짜로 정해진 순서에서 */
  today: function () {
    var me = App.me, done = me.done || {}, pool = QUIZ.filter(function (q) { return done[q.act]; });
    if (!pool.length) return [];
    var pick = [], wrong = (me.wrong || []).map(Quiz.byId).filter(function (q) { return q && done[q.act]; });
    var rnd = Quiz.seed(App.id + '|' + App.today());
    wrong.sort(function () { return rnd() - .5; }).slice(0, 2).forEach(function (q) { pick.push(q); });
    var rest = pool.filter(function (q) { return pick.indexOf(q) < 0; }).sort(function () { return rnd() - .5; });
    while (pick.length < 3 && rest.length) pick.push(rest.shift());
    return pick;
  },
  ask: function (q, box, onAns) {                      // 문제 하나 보여 주고 답을 받으면 onAns(맞음?)
    var wrap = h('div', { class: 'qcard' }, h('p', { class: 'qq', k: 'qz_' + q.id })), opts = h('div', { class: 'qopts' + (q.t === 'ox' ? ' ox2' : '') }), done = false;
    var ans = q.t === 'ox' ? q.a : q.o[q.a];                  // 정답 보기의 값 (보기 순서는 섞어서 보여 줌)
    var list = q.t === 'ox' ? ['O', 'X'] : shuffle(q.o);
    list.forEach(function (o) {
      var b = q.t === 'ox' ? h('button', { type: 'button', class: 'oxbtn big' }, o) : h('button', { type: 'button', class: 'opt', k: o });
      b._v = o;
      b.addEventListener('click', function () {
        if (done) return; done = true;
        var right = o === ans;
        b.classList.add(right ? 'good' : 'bad');
        if (!right) [].forEach.call(opts.children, function (x) { if (x._v === ans) x.classList.add('good'); });
        wrap.append(h('p', { class: 'note ' + (right ? 'result' : 'warn') }, h('b', { k: right ? 'qz_right' : 'qz_wrong' }), ' ', h('span', { k: 'qz_' + q.id + '_x' })));
        applyI18n(wrap); onAns(right);
      });
      opts.append(b);
    });
    wrap.append(opts); box.append(wrap); applyI18n(wrap);
  }
};
App.draw_quiz = function (pane) {
  var me = App.me, d = App.today(), qz = me.quiz || {}, set = Quiz.today();
  var head = h('div', { class: 'quizhead' }, h('h2', { k: 'tab_quiz' }), btn('qz_note', function () { Quiz.note(pane); }, 'btn'));
  pane.append(head);
  if (!set.length) { pane.append(h('p', { class: 'note strong', k: 'qz_none' })); return; }
  if (qz.d === d) {
    var res = qz.res || {}, n = Object.keys(res).filter(function (k) { return res[k]; }).length;
    pane.append(h('div', { class: 'panel qdone' }, h('p', { class: 'note strong' }, h('span', { k: 'qz_done' }), h('b', { dir: 'ltr' }, ' ' + n + ' / ' + Object.keys(res).length)), h('p', { class: 'note', k: 'qz_tomorrow' })));
    return;
  }
  var i = 0, res2 = {}, area = h('div', { class: 'qarea' }), prog = h('div', { class: 'qprog', dir: 'ltr' });
  pane.append(todo('qz_todo'), prog, area);
  function step() {
    prog.textContent = (i + 1) + ' / ' + set.length; area.innerHTML = '';
    var q = set[i];
    if ((me.wrong || []).indexOf(q.id) >= 0) area.append(h('span', { class: 'chip', k: 'qz_again' }));
    Quiz.ask(q, area, function (right) {
      res2[q.id] = right ? 1 : 0;
      var last = i === set.length - 1;
      area.append(btn(last ? 'qz_submit' : 'next', function (e) {
        if (!last) { i++; step(); return; }
        e.target.disabled = true;
        App.send({ action: 'quizdone', res: res2 }).then(function (r) {
          if (!r.ok) { e.target.disabled = false; toast(App.errMsg(r), 'bad'); return; }
          toast(t('qz_gain') + ' +' + (r.gained || 0) + ' XP'); App.home('quiz');
        });
      }, 'btn primary big'));
      applyI18n(area);
    });
  }
  step();
};
/* 오답노트: 틀린 문제를 모아 보고, 경험치 없이 다시 풀기 */
Quiz.note = function (pane) {
  pane.innerHTML = '';
  var list = (App.me.wrong || []).map(Quiz.byId).filter(Boolean);
  pane.append(h('div', { class: 'quizhead' }, h('h2', { k: 'qz_note' }), btn('qz_back', function () { App.home('quiz'); }, 'btn')));
  if (!list.length) { pane.append(h('p', { class: 'note strong', k: 'qz_note_empty' })); applyI18n(pane); return; }
  pane.append(h('p', { class: 'note', k: 'qz_note_desc' }));
  list.forEach(function (q) {
    var card = h('div', { class: 'panel' }, h('span', { class: 'chip', k: 't_' + q.act }));
    Quiz.ask(q, card, function () {});
    pane.append(card);
  });
  applyI18n(pane);
};
