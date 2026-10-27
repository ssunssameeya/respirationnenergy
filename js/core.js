/* 6단원 공통 규칙 처리기: 브라우저(연습 모드)와 구글 Apps Script가 같은 코드를 씁니다.
   db = { students:{학번:obj}, settings:{}, progress:{반:{활동:'locked'|'open'|'reopen'}}, dirty:{}, answers:[], logs:[] } */
var SYS = { dig: ['d1', 'd2', 'd3', 'd4', 'd5'], cir: ['c1', 'c2', 'c3'], res: ['r1', 'r2', 'r3', 'r4'], exc: ['e1', 'e2', 'e3'], cel: ['s1', 's2', 's3'] };
var ACTS = [].concat(SYS.dig, SYS.cir, SYS.res, SYS.exc, SYS.cel);
var SICK_SYS = ['dig', 'cir', 'res', 'exc'];
var PX = { hair: 16 * 12, cloth: 16 * 14, shoe: 16 * 4, acc: 16 * 8 };   // 아이템 칸 수 (가로 16칸)
var KINDS = { f: 1, m: 1, a: 1 };
var SHARE = { r4: ['sim', 'diff'] };                   // 같은 반 친구의 의견을 볼 수 있는 활동과 답 항목 (모둠 활동)

function cJSON(v, d) { if (v && typeof v === 'object') return v; try { return v ? JSON.parse(v) : d; } catch (e) { return d; } }
function cNotices(db, cls) {                          // 우리 반(또는 전체) 공지, 최신순
  return cJSON(db.settings.notices, []).filter(function (n) { return !n.cls || !n.cls.length || n.cls.indexOf(String(cls)) >= 0; });
}
function cUrl(u) { u = String(u || '').trim().slice(0, 400); return /^https?:\/\/[^\s<>"']+$/.test(u) ? u : ''; }
function cNum(v, d) { var n = Number(v); return isNaN(n) || v === '' || v == null ? d : n; }
function cRules(db) {
  var s = db.settings;
  return { care: cNum(s.carexp, 1), done: cNum(s.donexp, 10), bonus: cNum(s.bonusxp, 5), coin: cNum(s.coin, 1), price: cNum(s.price, 1), sick: cNum(s.sickxp, 3), quiz: cNum(s.quizxp, 1) };
}
function cMask(n) { n = String(n || ''); if (n.length <= 1) return '*'; if (n.length === 2) return n.charAt(0) + '*'; return n.charAt(0) + new Array(n.length - 1).join('*') + n.charAt(n.length - 1); }
function cLook(s) {                                  // 다른 학생에게 보여 줄 모습 (승인된 아이템만)
  var eq = {}, items = s.items || [], e = s.eq || {};
  for (var k in e) for (var i = 0; i < items.length; i++) if (items[i].id === e[k] && items[i].st === 'ok') eq[k] = items[i].px;
  return { kind: s.kind || 'm', eq: eq };
}
function cPub(s) {
  return { id: s.id, name: s.name, cls: s.cls, grp: s.grp || '', nick: s.nick || '', kind: s.kind || '', xp: s.xp || 0, peak: s.peak || 0, coin: s.coin || 0,
    care: s.care || {}, done: s.done || {}, log: s.log || [], ans: s.ans || {}, items: s.items || [], eq: s.eq || {}, sick: s.sick || {}, fx: s.fx || {}, quiz: s.quiz || {}, wrong: s.wrong || [] };
}
function cAddXp(db, s, x, label, now) {
  s.xp = Math.max(0, (s.xp || 0) + x);
  s.peak = Math.max(s.peak || 0, s.xp);
  s.log = (s.log || []).concat([{ t: now, k: label, x: x }]).slice(-12);
  db.dirty[s.id] = 1;
  db.logs.push([now, s.id, s.name, s.cls, label, x, s.xp]);
}
function cSaveAns(db, s, act, key, text, now) {
  s.ans = s.ans || {}; var txt = String(text || '').slice(0, 1200);
  s.ans[act + '.' + key] = txt.slice(0, 400); db.dirty[s.id] = 1;     // 학생 자료에는 400자까지만 (시트 한 칸 한도), 전체는 '답' 시트에
  db.answers.push([now, s.id, s.name, s.cls, act, key, txt]);
}
function cPct(db, cls, act) {
  var n = 0, d = 0;
  for (var id in db.students) { var s = db.students[id]; if (String(s.cls) === String(cls)) { n++; if (s.done && s.done[act]) d++; } }
  return n ? Math.round(d / n * 100) : 0;
}
function cActState(db, cls, act) {                  // locked | open | done
  var st = (db.progress[cls] || {})[act] || 'locked';
  if (st === 'locked') return 'locked';
  if (st === 'reopen') return 'open';
  return cPct(db, cls, act) >= 80 ? 'done' : 'open';
}
function cSysDone(s, sys) { var d = s.done || {}; return SYS[sys].every(function (a) { return d[a]; }); }
function cRank(db, me, top) {
  var arr = [];
  for (var id in db.students) { var s = db.students[id]; if (s.nick) arr.push(s); }
  arr.sort(function (a, b) { return (b.xp || 0) - (a.xp || 0) || (b.peak || 0) - (a.peak || 0); });
  var my = 0;
  for (var i = 0; i < arr.length; i++) if (me && arr[i].id === me.id) my = i + 1;
  return { top: arr.slice(0, top || 10).map(function (s) { return { nick: s.nick, xp: s.xp || 0, peak: s.peak || 0, look: s.look || cLook(s), me: !!(me && s.id === me.id) }; }), my: my, total: arr.length };
}
function cRollSick(db, s, req) {                    // 하루 한 번, 완료한 기관계가 있을 때만 20% 확률
  if (s.sick && s.sick.d === req.today) return;
  var done = SICK_SYS.filter(function (k) { return cSysDone(s, k); });
  var r1 = req.rand1 != null ? req.rand1 : Math.random(), r2 = req.rand2 != null ? req.rand2 : Math.random();
  s.sick = { d: req.today };
  if (done.length && r1 < 0.2) s.sick = { d: req.today, sys: done[Math.floor(r2 * done.length)], r: Math.floor(Math.random() * 1000), st: 'q' };
  db.dirty[s.id] = 1;
}
function cState(db, s, req) {
  cRollSick(db, s, req);
  var open = {};
  for (var i = 0; i < ACTS.length; i++) open[ACTS[i]] = cActState(db, s.cls, ACTS[i]);
  return { ok: true, me: cPub(s), open: open, rules: cRules(db), rank: cRank(db, s, req.top), today: req.today,
    notices: cNotices(db, s.cls), shares: cJSON(db.settings.shares, {})[s.cls] || {} };
}
function cAuth(db, s, req) {                         // 5번 틀리면 10분 잠금. 없는 학번과 틀린 비밀번호는 같은 안내
  if (!s) return 'badlogin';
  var t = req.ts || 0; s.fail = s.fail || { n: 0, u: 0 };
  if (s.fail.u > t) return 'lock';
  if (s.pw !== req.pw) { s.fail.n = (s.fail.n || 0) + 1; if (s.fail.n >= 5) { s.fail.u = t + 600000; s.fail.n = 0; } db.dirty[s.id] = 1; return 'badlogin'; }
  if (s.fail.n) { s.fail.n = 0; db.dirty[s.id] = 1; }
  return null;
}

function coreHandle(db, req) {
  var a = String(req.action || ''), now = req.now, S = db.students, s, e;
  db.dirty = db.dirty || {}; db.answers = db.answers || []; db.logs = db.logs || [];

  /* ---------- 교사 ---------- */
  if (a.charAt(0) === 't') {
    if (!db.settings.teacherPw || String(req.tpw || '') !== String(db.settings.teacherPw)) return { ok: false, err: 'tpw' };
    if (a === 'tOverview') {
      var list = [], prog = {}, items = [];
      for (var id in S) {
        var p = cPub(S[id]); p.hasPw = !!S[id].pw; p.locked = !!(S[id].fail && S[id].fail.u > (req.ts || 0)); delete p.log; list.push(p);
        (S[id].items || []).forEach(function (it) { items.push({ owner: id, name: S[id].name, cls: S[id].cls, nick: S[id].nick || '', id: it.id, slot: it.slot, px: it.px, st: it.st, t: it.t }); });
      }
      (req.classes || []).forEach(function (c) { prog[c] = {}; ACTS.forEach(function (ac) { prog[c][ac] = { state: cActState(db, c, ac), pct: cPct(db, c, ac) }; }); });
      return { ok: true, students: list, items: items, progress: prog, settings: { notebook: db.settings.notebook || '' }, rules: cRules(db),
        notices: cJSON(db.settings.notices, []), shares: cJSON(db.settings.shares, {}) };
    }
    if (a === 'tOpen') { db.progress[req.cls] = db.progress[req.cls] || {}; db.progress[req.cls][req.act] = req.state; db.progDirty = 1; return { ok: true }; }
    if (a === 'tGive') {
      (req.ids || []).forEach(function (id) { var st = S[id]; if (!st) return; cAddXp(db, st, Number(req.x) || 0, req.label || '', now); if (req.x < 0) st.fx = { k: req.label, d: req.today }; });
      return { ok: true };
    }
    if (a === 'tItem') {                             // 그림 승인(ok) · 거절(no, 코인 환불) · 삭제(del, 환불 없음)
      s = S[req.id]; if (!s) return { ok: false, err: 'action' };
      var its = s.items || [], idx = -1;
      for (var j = 0; j < its.length; j++) if (its[j].id === req.item) idx = j;
      if (idx < 0) return { ok: false, err: 'action' };
      if (req.op === 'ok') its[idx].st = 'ok';
      else { var it = its.splice(idx, 1)[0]; if (req.op === 'no' && it.st === 'wait') s.coin = (s.coin || 0) + cRules(db).price; for (var k in (s.eq || {})) if (s.eq[k] === it.id) delete s.eq[k]; }
      s.items = its; db.dirty[s.id] = 1; return { ok: true };
    }
    if (a === 'tResetPw') { s = S[req.id]; if (s) { s.pw = ''; s.fail = { n: 0, u: 0 }; db.dirty[s.id] = 1; } return { ok: true }; }
    if (a === 'tResetNick') { s = S[req.id]; if (s) { s.nick = ''; db.dirty[s.id] = 1; } return { ok: true }; }
    if (a === 'tSet') { if (req.key !== 'notebook') return { ok: false, err: 'action' }; db.settings.notebook = req.value; db.setDirty = { notebook: 1 }; return { ok: true }; }
    if (a === 'tNotice') {                           // 공지 게시판: 글 올리기(add)·지우기(del). 링크는 http(s) 주소만
      var ns = cJSON(db.settings.notices, []);
      if (req.op === 'add') {
        var title = String(req.title || '').trim().slice(0, 80); if (!title) return { ok: false, err: 'action' };
        var cl = (req.cls || []).map(String).filter(function (c) { return c; }).slice(0, 20);
        ns.unshift({ id: 'n' + (req.ts || 0), d: String(now || '').slice(0, 10), t: title, b: String(req.body || '').slice(0, 600), u: cUrl(req.url), cls: cl });
        ns = ns.slice(0, 40);
      } else if (req.op === 'del') ns = ns.filter(function (n) { return n.id !== req.nid; });
      else return { ok: false, err: 'action' };
      db.settings.notices = ns; db.setDirty = { notices: 1 }; return { ok: true, notices: ns };
    }
    if (a === 'tShare') {                            // 모둠 의견 중 골라 반 전체에 공유: list = [{t:문장, c:'sim'|'diff'}]
      if (!SHARE[req.act]) return { ok: false, err: 'action' };
      var sh = cJSON(db.settings.shares, {}), cs = String(req.cls || '');
      sh[cs] = sh[cs] || {};
      sh[cs][req.act] = (req.list || []).slice(0, 20).map(function (x) { return { t: String(x.t || '').trim().slice(0, 200), c: SHARE[req.act].indexOf(x.c) >= 0 ? x.c : SHARE[req.act][0] }; }).filter(function (x) { return x.t; });
      db.settings.shares = sh; db.setDirty = { shares: 1 }; return { ok: true, shares: sh };
    }
    if (a === 'tResetYear') {
      for (var y in S) { var o = S[y]; ['pw', 'nick', 'kind'].forEach(function (f) { o[f] = ''; }); o.xp = 0; o.peak = 0; o.coin = 0; o.care = {}; o.done = {}; o.log = []; o.ans = {}; o.items = []; o.eq = {}; o.sick = {}; o.fx = {}; o.quiz = {}; o.wrong = []; o.fail = { n: 0, u: 0 }; db.dirty[y] = 1; }
      db.progress = {}; db.progDirty = 1; return { ok: true };
    }
    return { ok: false, err: 'action' };
  }

  /* ---------- 학생 ---------- */
  s = S[String(req.id || '').trim()];
  if (a === 'login' || a === 'setup') {
    if (!s) return { ok: false, err: 'badlogin' };
    if (!s.pw && a === 'login') return { ok: true, setup: true, name: cMask(s.name) };
    if (s.pw) { e = cAuth(db, s, req); if (e) return { ok: false, err: e }; }
    if (a === 'login') { if (!s.nick || !s.kind) return { ok: true, setup: true, name: cMask(s.name), hasPw: true, kind: s.kind || '' }; return cState(db, s, req); }
    var nick = String(req.nick || '').replace(/[<>&"']/g, '').trim().slice(0, 20);   // 별명 칸 = '나의 꿈' (친구와 같아도 됨)
    if (!nick) return { ok: false, err: 'nick' };
    if (s.nick && s.kind) return { ok: false, err: 'already' };
    if (!s.pw) { if (!req.pw) return { ok: false, err: 'action' }; s.pw = req.pw; }
    s.nick = nick; if (!s.kind) s.kind = KINDS[req.kind] ? req.kind : 'm';
    s.coin = s.coin || 0; s.items = s.items || []; s.eq = s.eq || {}; db.dirty[s.id] = 1;
    return cState(db, s, req);
  }
  e = cAuth(db, s, req); if (e) return { ok: false, err: e };
  var R = cRules(db);
  if (a === 'state') return cState(db, s, req);
  if (a === 'care') {
    var c = s.care || {}; if (c.d !== req.today) c = { d: req.today };
    if (!c[req.kind] && { f: 1, e: 1, h: 1 }[req.kind]) { c[req.kind] = 1; s.care = c; cAddXp(db, s, R.care, 'care_' + req.kind, now); }
    return cState(db, s, req);
  }
  if (a === 'done') {
    if (ACTS.indexOf(req.act) < 0) return { ok: false, err: 'action' };
    (req.answers || []).slice(0, 40).forEach(function (x) { cSaveAns(db, s, x.act, x.key, x.text, now); });
    if (cActState(db, s.cls, req.act) === 'locked') return { ok: false, err: 'locked' };
    s.done = s.done || {}; var gained = 0, coin = 0;
    if (!s.done[req.act]) { gained = R.done + (req.bonus ? R.bonus : 0); coin = R.coin; s.done[req.act] = { t: now, b: req.bonus ? 1 : 0 }; s.coin = (s.coin || 0) + coin; cAddXp(db, s, gained, 'done_' + req.act, now); }
    var r = cState(db, s, req); r.gained = gained; r.coinGained = coin; return r;
  }
  if (a === 'answer') { cSaveAns(db, s, req.act, req.key, req.text, now); return { ok: true }; }
  if (a === 'classAns') {                            // 같은 반 친구들의 모둠 의견 보기 (별명·모둠만, 이름은 보내지 않음)
    var keys = SHARE[req.act]; if (!keys) return { ok: false, err: 'action' };
    var pool = db.classAns || [], outA = [];
    if (!db.classAns) for (var sid in S) { var o2 = S[sid]; if (String(o2.cls) !== String(s.cls)) continue; var an = {}; keys.forEach(function (k) { an[k] = (o2.ans || {})[req.act + '.' + k] || ''; }); pool.push({ id: sid, nick: o2.nick || '', grp: o2.grp || '', ans: an }); }
    pool.forEach(function (x) { var has = keys.some(function (k) { return x.ans[k]; }); if (has) outA.push({ nick: x.nick, grp: x.grp, me: x.id === s.id, ans: x.ans }); });
    outA.sort(function (p, q) { return String(p.grp).localeCompare(String(q.grp), 'ko', { numeric: true }); });
    return { ok: true, list: outA };
  }
  if (a === 'answers') { (req.list || []).slice(0, 40).forEach(function (x) { cSaveAns(db, s, x.act, x.key, x.text, now); }); return { ok: true }; }
  if (a === 'cure') {                                // 돌발 질병: 어느 기관계 문제인지 맞히기
    var sk = s.sick || {};
    if (sk.d !== req.today || sk.st !== 'q') return cState(db, s, req);
    if (req.sys === sk.sys) { sk.st = 'ok'; cAddXp(db, s, R.sick, 'sick_ok', now); } else sk.st = 'bad';
    s.sick = sk; db.dirty[s.id] = 1;
    var rc = cState(db, s, req); rc.right = sk.st === 'ok'; return rc;
  }
  if (a === 'draw') {                                // 픽셀 아이템 제출 (교사 승인 전까지 '대기')
    if (!PX[req.slot] || typeof req.px !== 'string' || req.px.length !== PX[req.slot] || !/^[0-9a-f]+$/.test(req.px) || !/[1-9a-f]/.test(req.px)) return { ok: false, err: 'px' };
    s.items = s.items || [];
    if (s.items.filter(function (x) { return x.st === 'wait'; }).length >= 3) return { ok: false, err: 'waitmax' };
    if ((s.coin || 0) < R.price) return { ok: false, err: 'coin' };
    s.coin -= R.price; s.iseq = (s.iseq || 0) + 1;
    s.items.push({ id: 'i' + s.iseq, slot: req.slot, px: req.px, st: 'wait', t: now });
    db.dirty[s.id] = 1; db.logs.push([now, s.id, s.name, s.cls, 'draw_' + req.slot, 0, s.xp || 0]);
    return cState(db, s, req);
  }
  if (a === 'equip') {
    s.eq = s.eq || {};
    if (!PX[req.slot]) return { ok: false, err: 'action' };
    if (!req.item) delete s.eq[req.slot];
    else { var own = (s.items || []).filter(function (x) { return x.id === req.item && x.st === 'ok' && x.slot === req.slot; })[0]; if (!own) return { ok: false, err: 'action' }; s.eq[req.slot] = req.item; }
    db.dirty[s.id] = 1; return cState(db, s, req);
  }
  if (a === 'quizdone') {                            // 일일 퀴즈: 하루 한 번, 맞힌 문제당 경험치, 틀린 문제는 오답노트로
    var qz = s.quiz || {};
    if (qz.d === req.today) return cState(db, s, req);
    var res = req.res || {}, right = 0, wrong = (s.wrong || []).slice();
    for (var qid in res) {
      qid = String(qid).slice(0, 12);
      if (res[qid]) { right++; wrong = wrong.filter(function (w) { return w !== qid; }); }
      else if (wrong.indexOf(qid) < 0) wrong.push(qid);
    }
    right = Math.min(right, 3);
    s.quiz = { d: req.today, res: res }; s.wrong = wrong.slice(-60); db.dirty[s.id] = 1;
    if (right) cAddXp(db, s, right * R.quiz, 'quiz', now);
    var rq = cState(db, s, req); rq.gained = right * R.quiz; return rq;
  }
  return { ok: false, err: 'action' };
}
