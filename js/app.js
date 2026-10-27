/* 로그인 · 내 방 · 돌발 질병 · 옷장 · 랭킹 (인체 탐험과 일일 퀴즈는 body.js, quiz.js) */
var ACT = {};                      // 활동 모듈: 누를 때 js/acts/활동ID.js 를 불러와 여기에 등록됩니다
var SYSNAME = { dig: 'sys_dig', cir: 'sys_cir', res: 'sys_res', exc: 'sys_exc', cel: 'sys_cel' };
var App = {
  me: null, st: null, id: '', pw: '', tab: 'room', queue: [], lastSync: 0,
  spread: function (ms) { return new Promise(function (r) { setTimeout(r, API.local ? 0 : Math.random() * ms); }); },
  /* 답은 모아 두었다가 활동을 마칠 때 한 번에 보냅니다 */
  send: function (req) {
    if (req.action === 'answer') { App.queue.push({ act: req.act, key: req.key, text: req.text }); if (App.queue.length >= 10) App.flush(); return Promise.resolve({ ok: true }); }
    var sent = null;
    if (req.action === 'done' && App.queue.length) { sent = App.queue; App.queue = []; req.answers = sent; }
    req.id = App.id; req.pw = App.pw;
    return API.call(req).then(function (r) {
      if (r && r.ok && r.me) { App.st = r; App.me = r.me; App.lastSync = Date.now(); App.me.ans = App.me.ans || {}; App.queue.forEach(function (q) { App.me.ans[q.act + '.' + q.key] = q.text; }); }
      else if (sent && !(r && r.ok)) App.queue = sent.concat(App.queue);
      return r;
    });
  },
  flush: function () {
    if (!App.queue.length || !App.id) return;
    var q = App.queue; App.queue = [];
    API.call({ action: 'answers', id: App.id, pw: App.pw, list: q }).then(function (r) { if (!(r && r.ok)) App.queue = q.concat(App.queue); });
  },
  errMsg: function (r) { return t('err_' + (r && r.err || 'net')); },
  today: function () { return App.st && App.st.today; },
  stage: function () { return stageOf(App.me.peak); },
  mood: function () {
    var me = App.me, d = App.today(), c = me.care || {};
    if (me.sick && me.sick.d === d && (me.sick.st === 'q' || me.sick.st === 'bad')) return 'sick';
    if (c.d === d && c.f && c.e && c.h) return 'happy';
    return 'normal';
  },
  look: function (eqOverride) {
    var me = App.me, eq = {}, e = eqOverride || me.eq || {};
    (me.items || []).forEach(function (it) { for (var k in e) if (e[k] === it.id && (it.st === 'ok' || eqOverride)) eq[k] = it.px; });
    return { kind: me.kind, eq: eq };
  },

  /* ---------- 로그인 ---------- */
  login: function () {
    var root = $('#app'); root.className = 'view-login';
    var id = h('input', { id: 'f-id', inputmode: 'numeric', autocomplete: 'off', 'data-kp': 'ph_id', placeholder: t('ph_id') });
    var pw = h('input', { id: 'f-pw', type: 'password', 'data-kp': 'ph_pw', placeholder: t('ph_pw') });
    var msg = h('p', { class: 'formmsg' }), busy = false;
    function go() {
      if (busy) return; App.id = id.value.trim(); if (!App.id) return;
      App.pw = API.hashPw(App.id, pw.value); msg.textContent = t('loading'); busy = true;
      App.spread(3000).then(function () { return App.send({ action: 'login' }); }).then(function (r) {
        busy = false;
        if (!r.ok) { msg.textContent = App.errMsg(r); return; }
        try { sessionStorage.setItem('tt6-sess', JSON.stringify({ id: App.id, pw: App.pw })); } catch (e) {}
        if (r.setup) App.setup(r); else App.home('room');
      });
    }
    pw.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
    var art = h('div', { class: 'login-art' }); ['f', 'm', 'a'].forEach(function (k, i) { art.append(charCanvas({ kind: k }, { stage: [3, 5, 4][i], scale: 3, mood: 'happy' })); });
    root.innerHTML = '';
    root.append(h('div', { class: 'login-card' }, art, h('h1', { k: 'site' }), h('p', { class: 'sub', k: 'site_sub' }),
      h('label', { for: 'f-id', k: 'lb_id' }), id, h('label', { for: 'f-pw', k: 'lb_pw' }), pw,
      h('p', { class: 'hint', k: 'first_hint' }), btn('enter', go, 'btn primary big'), msg,
      API.local ? h('p', { class: 'localnote', k: 'local_note' }) : null));
  },
  setup: function (r) {
    var root = $('#app'); root.className = 'view-login'; root.innerHTML = '';
    var pw1 = h('input', { type: 'password', 'data-kp': 'ph_newpw', placeholder: t('ph_newpw') }), pw2 = h('input', { type: 'password', 'data-kp': 'ph_newpw2', placeholder: t('ph_newpw2') });
    var nick = h('input', { maxlength: '20', 'data-kp': 'ph_nick', placeholder: t('ph_nick') }), msg = h('p', { class: 'formmsg' }), kind = r.kind || '';
    var picks = h('div', { class: 'picks' });
    ['f', 'm', 'a'].forEach(function (k) {
      var b = h('button', { type: 'button', class: 'pick', 'aria-pressed': 'false' }, charCanvas({ kind: k }, { stage: 3, scale: 4, mood: 'happy' }), h('b', { k: 'kind_' + k }));
      b.addEventListener('click', function () { kind = k; [].forEach.call(picks.children, function (x) { x.setAttribute('aria-pressed', x === b); }); });
      picks.append(b);
    });
    function go() {
      if (!r.hasPw) { if (pw1.value.length < 4) { msg.textContent = t('err_pwshort'); return; } if (pw1.value !== pw2.value) { msg.textContent = t('err_pwdiff'); return; } App.pw = API.hashPw(App.id, pw1.value); }
      if (!nick.value.trim()) { msg.textContent = t('err_nick'); return; }
      if (nick.value.trim().length < 4) { msg.textContent = t('err_nickshort'); return; }
      if (!kind) { msg.textContent = t('err_kind'); return; }
      App.send({ action: 'setup', nick: nick.value.trim(), kind: kind }).then(function (x) {
        if (!x.ok) { msg.textContent = App.errMsg(x); return; }
        try { sessionStorage.setItem('tt6-sess', JSON.stringify({ id: App.id, pw: App.pw })); } catch (e) {}
        App.home('room');
      });
    }
    root.append(h('div', { class: 'login-card wide' }, h('h1', {}, (r.name || '') + ' ', h('span', { k: 'welcome' })), h('p', { class: 'hint', k: 'name_hint' }),
      r.hasPw ? null : [h('label', { k: 'lb_newpw' }), pw1, pw2],
      h('label', { k: 'lb_nick' }), nick, h('p', { class: 'hint', k: 'nick_hint' }),
      r.kind ? null : [h('label', { k: 'lb_kind' }), picks, h('p', { class: 'hint', k: 'kind_hint' })],
      btn('startGrow', go, 'btn primary big'), msg));
  },
  logout: function () { App.flush(); try { sessionStorage.removeItem('tt6-sess'); } catch (e) {} App.me = null; App.login(); },

  /* ---------- 홈 (탭) ---------- */
  home: function (tab) {
    App.tab = tab || App.tab;
    var root = $('#app'); root.className = 'view-home'; root.innerHTML = '';
    var tabs = h('nav', { class: 'tabs' });
    [['room', 'tab_room'], ['body', 'tab_body'], ['closet', 'tab_closet'], ['quiz', 'tab_quiz'], ['rank', 'tab_rank'], ['notice', 'tab_notice']].forEach(function (x) {
      var tb = h('button', { type: 'button', 'aria-pressed': String(App.tab === x[0]), on: { click: function () { App.home(x[0]); } } }, h('span', { k: x[1] }));
      if (x[0] === 'notice' && App.tab !== 'notice' && App.newNotice()) tb.append(h('i', { class: 'newdot' }, 'N'));
      tabs.append(tb);
    });
    var who = h('div', { class: 'who' }, h('b', {}, App.me.nick), h('span', { class: 'xpmini', dir: 'ltr' }, App.me.xp + ' XP'), h('span', { class: 'coin', dir: 'ltr' }, '🪙 ' + (App.me.coin || 0)), btn('logout', App.logout, 'btn ghost small'));
    var pane = h('div', { class: 'pane pane-' + App.tab });
    root.append(h('header', { class: 'topbar' }, h('h1', { k: 'site' }), tabs, who), pane);
    function draw() { pane.innerHTML = ''; (App['draw_' + App.tab] || App.draw_soon)(pane); applyI18n(root); who.children[1].textContent = App.me.xp + ' XP'; who.children[2].textContent = '🪙 ' + (App.me.coin || 0); }
    draw(); App.flush();
    if (Date.now() - App.lastSync > 15000) App.send({ action: 'state' }).then(function (r) { if (r.ok && $('#app').className === 'view-home') draw(); App.checkSick(); });
    else App.checkSick();
  },
  draw_soon: function (pane) { pane.append(h('p', { class: 'note strong', k: 'soon' })); },
  logLabel: function (k) {
    var all = CFG.ITEMS.concat(CFG.DEBUFFS).filter(function (x) { return x.id === k; })[0];
    if (all) return all.icon + ' ' + cfgName(all.name);
    if (k.indexOf('done_') === 0) return t('log_done') + ' · ' + t('t_' + k.slice(5));
    return t('log_' + k);
  },

  /* ---------- 내 방 ---------- */
  draw_room: function (pane) {
    if (App.newNotice()) { var nn = App.notices()[0]; pane.append(h('button', { type: 'button', class: 'nbanner', on: { click: function () { App.home('notice'); } } }, '📢 ', h('b', { k: 'notice_new' }), ' ', nn.t)); }
    var me = App.me, st = App.stage(), L = CFG.LEVELS, cur = L[st - 1], nxt = L[st], d = App.today();
    var pct = nxt ? Math.min(100, Math.max(0, (me.peak - cur.need) / (nxt.need - cur.need) * 100)) : 100;
    var room = h('div', { class: 'room' }, roomCanvas(), h('div', { class: 'fx' }));
    var ch = charCanvas(App.look(), { stage: st, mood: App.mood(), scale: 7 }); ch.classList.add('me-char');
    room.append(ch);
    var fxNow = me.fx && me.fx.d === d && CFG.DEBUFFS.filter(function (x) { return x.id === me.fx.k; })[0];
    if (fxNow) room.append(h('div', { class: 'debuff' }, h('span', {}, fxNow.icon), h('b', {}, cfgName(fxNow.name))));
    if (App.mood() === 'sick') room.append(h('div', { class: 'sicktag', k: me.sick.st === 'q' ? 'sick_now' : 'sick_today' }));
    var c = (me.care && me.care.d === d) ? me.care : {};
    var cares = h('div', { class: 'cares' });
    [['f', '🍚', 'care_f'], ['e', '🏃', 'care_e'], ['h', '🤗', 'care_h']].forEach(function (x) {
      var b = h('button', { type: 'button', class: 'care', disabled: c[x[0]] ? '' : null }, h('span', { class: 'ico' }, x[1]), h('span', { k: x[2] }), h('small', { dir: 'ltr' }, c[x[0]] ? '✓' : '+' + App.st.rules.care + ' XP'));
      b.addEventListener('click', function () {
        b.disabled = true; room.classList.add('fx-' + x[0]);
        App.send({ action: 'care', kind: x[0] }).then(function (r) { setTimeout(function () { if (r.ok) App.home('room'); else toast(App.errMsg(r), 'bad'); }, 1300); });
      });
      cares.append(b);
    });
    var log = h('ul', { class: 'loglist' });
    (me.log || []).slice().reverse().slice(0, 6).forEach(function (e) { log.append(h('li', { class: e.x < 0 ? 'neg' : '' }, h('span', {}, App.logLabel(e.k)), h('b', { dir: 'ltr' }, (e.x > 0 ? '+' : '') + e.x))); });
    if (!log.children.length) log.append(h('li', { class: 'empty', k: 'log_empty' }));
    pane.append(
      h('section', { class: 'roomcard' }, room,
        h('div', { class: 'pinfo' },
          h('h2', {}, me.nick + ' ', h('small', { k: 'kind_' + me.kind })),
          h('div', { class: 'lv' }, h('b', { dir: 'ltr' }, 'Lv.' + st), h('span', {}, cfgName(cur.name))),
          h('div', { class: 'xpbar', dir: 'ltr' }, h('i', { style: 'width:' + pct + '%' })),
          h('p', { class: 'xptxt', dir: 'ltr' }, nxt ? me.peak + ' / ' + nxt.need + ' XP' : me.peak + ' XP · MAX'),
          todo('todo_care'), cares)),
      h('aside', { class: 'side' }, h('h3', { k: 'log_title' }), log, h('h3', { k: 'tab_rank' }), App.rankList(5)));
  },

  /* ---------- 돌발 질병 ---------- */
  checkSick: function () {
    var me = App.me, sk = me.sick || {};
    if (sk.d !== App.today() || sk.st !== 'q' || $('.modal')) return;
    var list = CFG.DISEASES[sk.sys] || [], dz = list.length ? list[(sk.r || 0) % list.length] : null;
    var box = h('div', { class: 'sickbox' }, h('h2', { k: 'sick_title' }), charCanvas(App.look(), { stage: App.stage(), mood: 'sick', scale: 5 }),
      h('p', { class: 'dz' }, dz ? cfgName(dz) : ''), h('p', { class: 'q', k: 'sick_q' }));
    var opts = h('div', { class: 'sysopts' });
    ['dig', 'cir', 'res', 'exc'].forEach(function (k) {
      opts.append(h('button', { type: 'button', class: 'opt', k: SYSNAME[k], on: { click: function () {
        [].forEach.call(opts.children, function (b) { b.disabled = true; });
        App.send({ action: 'cure', sys: k }).then(function (r) {
          if (!r.ok) { toast(App.errMsg(r), 'bad'); m.remove(); return; }
          opts.remove();
          box.append(h('p', { class: 'note ' + (r.right ? 'result' : 'warn') }, h('span', { k: r.right ? 'sick_ok' : 'sick_bad' }), r.right ? '' : ' ' + t(SYSNAME[sk.sys])),
            btn('close', function () { m.remove(); App.home(App.tab); }, 'btn primary big'));
          applyI18n(box);
        });
      } } }));
    });
    box.append(opts);
    var m = h('div', { class: 'modal' }, box); document.body.append(m); applyI18n(m);
  },

  /* ---------- 옷장 ---------- */
  draw_closet: function (pane) {
    var me = App.me, prev = h('div', { class: 'closet-prev' });
    function preview() { prev.innerHTML = ''; prev.append(charCanvas(App.look(), { stage: App.stage(), mood: 'happy', scale: 7 })); }
    preview();
    var slots = h('div', { class: 'slots' });
    ['hair', 'acc', 'cloth', 'shoe'].forEach(function (sl) {
      var row = h('div', { class: 'itemrow' });
      var base = h('button', { type: 'button', class: 'itembtn' + (!me.eq[sl] ? ' on' : ''), k: 'item_none' });
      base.addEventListener('click', function () { equip(sl, null); }); row.append(base);
      (me.items || []).filter(function (it) { return it.slot === sl; }).forEach(function (it) {
        var c = document.createElement('canvas'); itemPaint(c, sl, it.px, 3);
        var b = h('button', { type: 'button', class: 'itembtn' + (me.eq[sl] === it.id ? ' on' : '') + (it.st === 'wait' ? ' wait' : '') }, c, it.st === 'wait' ? h('small', { k: 'item_wait' }) : null);
        if (it.st === 'ok') b.addEventListener('click', function () { equip(sl, it.id); }); else b.disabled = true;
        row.append(b);
      });
      var nb = h('button', { type: 'button', class: 'itembtn new' }, h('span', { k: 'item_new' }), h('small', { dir: 'ltr' }, '🪙 ' + App.st.rules.price));
      nb.addEventListener('click', function () { if ((me.coin || 0) < App.st.rules.price) { toast(t('err_coin'), 'bad'); return; } Editor.open(sl); });
      row.append(nb);
      slots.append(h('section', { class: 'slot-' + sl }, h('h3', { k: 'slot_' + sl }), row));
    });
    function equip(sl, id) { App.send({ action: 'equip', slot: sl, item: id }).then(function (r) { if (r.ok) App.home('closet'); else toast(App.errMsg(r), 'bad'); }); }
    pane.append(h('section', { class: 'closet' }, h('div', { class: 'closet-left' }, prev, h('p', { class: 'coinbig', dir: 'ltr' }, '🪙 ' + (me.coin || 0)), note('closet_note')), h('div', { class: 'closet-right' }, todo('todo_closet'), slots)));
  },

  /* ---------- 랭킹 ---------- */
  rankList: function (n) {
    var R = App.st.rank, ol = h('ol', { class: 'rank' });
    R.top.slice(0, n).forEach(function (r, i) {
      ol.append(h('li', { class: (r.me ? 'me ' : '') + 'r' + (i + 1) }, h('b', { class: 'no', dir: 'ltr' }, String(i + 1)), charCanvas(r.look, { stage: stageOf(r.peak), scale: 1.5 }), h('span', { class: 'nick' }, r.nick), h('b', { class: 'xp', dir: 'ltr' }, r.xp + ' XP')));
    });
    var wrap = h('div', {}, ol);
    if (R.my) wrap.append(h('p', { class: 'myrank' }, h('span', { k: 'my_rank' }), h('b', { dir: 'ltr' }, ' ' + R.my + ' / ' + R.total)));
    return wrap;
  },
  /* 공지 게시판: 선생님이 올린 공지(링크 포함)를 최신순으로 */
  notices: function () { return (App.st && App.st.notices) || []; },
  newNotice: function () { var n = App.notices()[0]; if (!n) return false; var seen = ''; try { seen = localStorage.getItem('tt6-seen-' + App.id) || ''; } catch (e) {} return seen !== n.id; },
  noticeCard: function (n) {
    return h('article', { class: 'ncard' }, h('div', { class: 'nhead' }, h('b', { class: 'ntitle' }, n.t), h('small', { dir: 'ltr' }, n.d)),
      n.b ? h('p', { class: 'nbody' }, n.b) : null,
      n.u ? h('a', { class: 'btn nlink', href: n.u, target: '_blank', rel: 'noopener noreferrer' }, '🔗 ', h('span', { k: 'notice_open' })) : null);
  },
  draw_notice: function (pane) {
    var list = App.notices();
    if (list[0]) { try { localStorage.setItem('tt6-seen-' + App.id, list[0].id); } catch (e) {} }
    pane.append(h('section', { class: 'nboard' }, h('h2', { k: 'tab_notice' }), h('p', { class: 'note', k: 'notice_desc' }),
      list.length ? h('div', { class: 'nlist' }, list.map(App.noticeCard)) : h('p', { class: 'note strong', k: 'notice_empty' })));
  },
  draw_rank: function (pane) { pane.append(h('section', { class: 'rankcard' }, h('h2', { k: 'rank_title' }), h('p', { class: 'note', k: 'rank_note' }), App.rankList(CFG.RANK_TOP))); },

  /* ---------- 활동 ---------- */
  open: function (act) {
    function run() { var root = $('#app'); root.className = 'view-act'; runActivity(root, ACT[act]); applyI18n(root); }
    if (ACT[act]) { run(); return; }
    var s = document.createElement('script'); s.src = 'js/acts/' + act + '.js?v=' + (window.BUILD || '1');
    s.onload = function () { if (ACT[act]) run(); else toast(t('soon')); };
    s.onerror = function () { toast(t('err_net'), 'bad'); };
    document.body.append(s);
  },
  finish: function (act, bonus) {
    App.send({ action: 'done', act: act, bonus: bonus }).then(function (r) {
      if (!r.ok) { toast(App.errMsg(r), 'bad'); return; }
      var m = h('div', { class: 'modal' }, h('div', { class: 'reward' },
        h('h2', { k: r.gained ? 'reward_title' : 'reward_again' }),
        charCanvas(App.look(), { stage: App.stage(), mood: 'happy', scale: 6 }),
        r.gained ? h('p', { class: 'gain', dir: 'ltr' }, '+' + r.gained + ' XP  🪙+' + r.coinGained) : null,
        r.gained && bonus ? h('p', { class: 'note', k: 'reward_bonus' }) : null,
        btn('toBody', function () { m.remove(); App.home('body'); }, 'btn primary big')));
      document.body.append(m); applyI18n(m);
    });
  }
};

/* 방 배경 (픽셀) */
function roomCanvas() {
  var c = document.createElement('canvas'), W = 120, H = 70, s = 6; c.width = W * s; c.height = H * s; c.className = 'roombg';
  var x = c.getContext('2d'); x.imageSmoothingEnabled = false;
  function r(a, b, w, hh, col) { x.fillStyle = col; x.fillRect(a * s, b * s, w * s, hh * s); }
  r(0, 0, W, 44, '#f3e3c3'); for (var i = 0; i < W; i += 6) r(i, 0, 3, 44, '#efd9b2');                 // 벽지
  r(0, 44, W, 26, '#c8935f'); for (var j = 46; j < H; j += 5) r(0, j, W, 1, '#b07d4d');                  // 마룻바닥
  for (var k = 0; k < W; k += 17) r(k, 44, 1, 26, '#b07d4d');
  r(0, 42, W, 2, '#8d5f37');
  r(46, 6, 28, 20, '#6d4c41'); r(48, 8, 24, 16, '#9fd8f5'); r(59, 8, 2, 16, '#6d4c41'); r(48, 15, 24, 2, '#6d4c41');   // 창문
  r(51, 10, 6, 2, '#ffffff'); r(64, 18, 5, 2, '#ffffff'); r(66, 10, 3, 3, '#ffe082');
  r(4, 30, 30, 14, '#5c6bc0'); r(4, 26, 9, 6, '#ffffff'); r(2, 24, 3, 22, '#795548'); r(33, 32, 3, 14, '#795548');     // 침대
  r(13, 30, 21, 3, '#7986cb');
  r(86, 30, 30, 3, '#8d6e63'); r(88, 33, 3, 13, '#6d4c41'); r(111, 33, 3, 13, '#6d4c41');                              // 책상
  r(90, 24, 3, 6, '#e53935'); r(93, 25, 3, 5, '#43a047'); r(96, 23, 3, 7, '#1e88e5'); r(104, 20, 2, 10, '#455a64'); r(101, 18, 8, 3, '#fdd835');
  r(20, 8, 14, 12, '#ffffff'); r(21, 9, 12, 10, '#ffccbc'); r(25, 11, 4, 3, '#e53935'); r(24, 12, 6, 3, '#e53935'); r(26, 15, 2, 2, '#e53935');   // 하트 액자
  r(40, 56, 40, 10, '#ef9a9a'); r(42, 58, 36, 6, '#f8bbd0');                                                           // 러그
  return c;
}
window.addEventListener('pagehide', function () { App.flush(); });
window.addEventListener('DOMContentLoaded', function () {
  buildLangBar();
  var s = null; try { s = JSON.parse(sessionStorage.getItem('tt6-sess')); } catch (e) {}
  if (s && s.id) {
    App.id = s.id; App.pw = s.pw; $('#app').className = 'view-login'; $('#app').append(h('p', { class: 'note strong', k: 'loading' }));
    App.spread(1500).then(function () { return App.send({ action: 'login' }); }).then(function (r) { if (r.ok && !r.setup) App.home('room'); else App.login(); });
  } else App.login();
});
