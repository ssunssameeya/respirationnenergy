/* 공통 화면 부품 */
window.LANG = window.LANG || {};
var LANGS = [['ko', '한국어'], ['zh', '中文'], ['ru', 'Русский'], ['en', 'English'], ['ar', 'العربية'], ['vi', 'Tiếng Việt']];
var lang = 'ko';
function tRaw(k) { var d = LANG[lang] || {}; return d[k] != null ? d[k] : (LANG.ko[k] != null ? LANG.ko[k] : k); }
function t(k) { return String(tRaw(k)).replace(/\*\*/g, ''); }
/* 문장 속 **용어** 는 굵고 크게 강조해서 보여 줍니다 (외워야 하는 용어·용액 이름) */
function setT(e, k) {
  var raw = String(tRaw(k));
  if (raw.indexOf('**') < 0 || /^(OPTION|TEXTAREA|INPUT|TITLE)$/.test(e.tagName)) { e.textContent = raw.replace(/\*\*/g, ''); return; }
  e.textContent = '';
  raw.split('**').forEach(function (part, i) { if (!part) return; if (i % 2) { var b = document.createElement('b'); b.className = 'term'; b.textContent = part; e.append(b); } else e.append(part); });
}
function cfgName(o) { return o ? (o[lang] || o.en || o.ko || '') : ''; }
function $(s, r) { return (r || document).querySelector(s); }
function h(tag, attrs) {
  var e = document.createElement(tag), kids = Array.prototype.slice.call(arguments, 2);
  attrs = attrs || {};
  for (var k in attrs) {
    var v = attrs[k];
    if (k === 'on') { for (var ev in v) e.addEventListener(ev, v[ev]); }
    else if (k === 'k') { e.setAttribute('data-k', v); setT(e, v); }
    else if (k === 'html') e.innerHTML = v;
    else if (k === 'class') e.className = v;
    else if (v !== false && v != null) e.setAttribute(k, v);
  }
  (function add(a) { a.forEach(function (c) { if (c == null || c === false) return; if (Array.isArray(c)) add(c); else e.append(c.nodeType ? c : document.createTextNode(c)); }); })(kids);
  return e;
}
function applyI18n(root) {
  (root || document).querySelectorAll('[data-k]').forEach(function (e) { setT(e, e.getAttribute('data-k')); });
  (root || document).querySelectorAll('[data-kp]').forEach(function (e) { e.placeholder = t(e.getAttribute('data-kp')); });
  (root || document).querySelectorAll('[data-kfn]').forEach(function (e) { if (e._kfn) e._kfn(); });
}
function setLang(l) {
  lang = l; document.documentElement.lang = l; document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
  document.querySelectorAll('#langbar button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.l === l); });
  try { localStorage.setItem('tt6-lang', l); } catch (e) {}
  applyI18n();
}
function buildLangBar() {
  var bar = $('#langbar'); if (!bar) return;
  LANGS.forEach(function (L) { bar.append(h('button', { type: 'button', 'data-l': L[0], lang: L[0], on: { click: function () { setLang(L[0]); } } }, L[1])); });
  var saved = 'ko'; try { saved = localStorage.getItem('tt6-lang') || 'ko'; } catch (e) {}
  setLang(saved);
}
function toast(msg, kind) {
  var b = h('div', { class: 'toast ' + (kind || '') }, msg); document.body.append(b);
  setTimeout(function () { b.classList.add('out'); }, 2200); setTimeout(function () { b.remove(); }, 2800);
}
function btn(k, fn, cls) { return h('button', { type: 'button', class: cls || 'btn', k: k, on: { click: fn } }); }

/* 지시문 상자: 디자인 요소와 구분되는 굵고 큰 글씨 */
function todo(k) { return h('div', { class: 'todo' }, h('b', { class: 'todo-tag', k: 'todo' }), h('span', { class: 'todo-txt', k: k })); }
function note(k, cls) { return h('p', { class: 'note ' + (cls || ''), k: k }); }

/* 빈칸 채우기 문장. tplKey 문장 안의 {0},{1}… 자리에 선택 상자가 들어갑니다. */
function fillBlank(tplKey, blanks) {
  var box = h('p', { class: 'fill', 'data-kfn': '1' }), sels = [];
  blanks.forEach(function (b, i) {
    var s = h('select', { class: 'blank', 'aria-label': String(i + 1) });
    var o = b.opts.slice(); for (var r = o.length - 1; r > 0; r--) { var j = Math.floor(Math.random() * (r + 1)), x = o[r]; o[r] = o[j]; o[j] = x; }
    s._b = { opts: o, ans: b.ans }; sels.push(s);                  // 선택지 순서 섞기
    s.addEventListener('change', function () { s.classList.remove('bad', 'good'); });
  });
  function draw() {
    var keep = sels.map(function (s) { return s.value; });
    box.innerHTML = '';
    var parts = t(tplKey).split(/(\{\d\})/);
    parts.forEach(function (p) {
      var m = p.match(/^\{(\d)\}$/);
      if (!m) { box.append(p); return; }
      var s = sels[+m[1]]; s.innerHTML = '';
      s.append(h('option', { value: '' }, '( ? )'));
      s._b.opts.forEach(function (o) { s.append(h('option', { value: o }, t(o))); });
      s.value = keep[+m[1]] || ''; box.append(s);
    });
  }
  box._kfn = draw; draw();
  box.check = function () { var ok = true; sels.forEach(function (s) { var g = s.value === s._b.ans; s.classList.toggle('good', g); s.classList.toggle('bad', !g); if (!g) ok = false; }); return ok; };
  box.text = function () { return t(tplKey).replace(/\{(\d)\}/g, function (m, n) { var s = sels[+n]; return s.value ? t(s.value) : '( )'; }); };
  box.lock = function () { sels.forEach(function (s) { s.disabled = true; }); };
  return box;
}

/* 선택형 질문 */
function choice(qKey, optKeys, ans, onOk, onMiss) {
  var box = h('div', { class: 'choice' }, qKey ? h('p', { class: 'q', k: qKey }) : null), done = false;
  var order = optKeys.map(function (k, i) { return i; });
  for (var r = order.length - 1; r > 0; r--) { var j = Math.floor(Math.random() * (r + 1)), x = order[r]; order[r] = order[j]; order[j] = x; }   // 보기 순서 섞기
  order.forEach(function (i) {
    var k = optKeys[i];
    var b = h('button', { type: 'button', class: 'opt', k: k });
    b.addEventListener('click', function () {
      if (done) return;
      if (i === ans) { done = true; b.classList.add('good'); box.classList.add('solved'); onOk && onOk(); }
      else { b.classList.add('bad'); b.disabled = true; onMiss && onMiss(); }
    });
    box.append(b);
  });
  return box;
}

/* 끌어서 놓기: tokens [{id, k(라벨 키), html}] 를 slots [{id, label}] 에 놓습니다. 터치 끌기와 "누르고 → 칸 누르기" 모두 됩니다. */
function dragBoard(tokens, slotEls, onChange) {
  var tray = h('div', { class: 'tray' }), picked = null, placed = {};
  function mk(tok) {
    var el = h('div', { class: 'tok', 'data-id': tok.id, tabindex: '0' }, tok.html ? h('span', { class: 'tok-art', html: tok.html }) : null, h('span', { k: tok.k }));
    el._tok = tok;
    var sx, sy, moved, ghost;
    el.addEventListener('pointerdown', function (e) { if (el.classList.contains('locked')) return; sx = e.clientX; sy = e.clientY; moved = false; el.setPointerCapture(e.pointerId); });
    el.addEventListener('pointermove', function (e) {
      if (sx == null) return;
      if (!moved && Math.hypot(e.clientX - sx, e.clientY - sy) > 8) { moved = true; ghost = el.cloneNode(true); ghost.classList.add('ghost'); document.body.append(ghost); el.classList.add('dragging'); }
      if (ghost) { ghost.style.left = e.clientX + 'px'; ghost.style.top = e.clientY + 'px'; }
    });
    el.addEventListener('pointerup', function (e) {
      if (sx == null) return; sx = null; el.classList.remove('dragging');
      if (ghost) { ghost.remove(); ghost = null; }
      if (moved) { var under = document.elementFromPoint(e.clientX, e.clientY); var slot = under && under.closest('.slot'); if (slot) put(el, slot); else if (under && under.closest('.tray')) back(el); }
      else pick(el);
    });
    el.addEventListener('keydown', function (e) { if (e.key === 'Enter') pick(el); });
    return el;
  }
  function pick(el) { if (el.classList.contains('locked')) return; if (picked) picked.classList.remove('picked'); picked = picked === el ? null : el; if (picked) picked.classList.add('picked'); }
  function back(el) { for (var s in placed) if (placed[s] === el) delete placed[s]; tray.append(el); el.classList.remove('picked'); picked = null; onChange && onChange(); }
  function put(el, slot) {
    var sid = slot.dataset.slot, old = placed[sid];
    for (var s in placed) if (placed[s] === el) delete placed[s];
    if (old && old !== el) tray.append(old);
    placed[sid] = el; slot.innerHTML = ''; slot.append(el); el.classList.remove('picked'); picked = null; onChange && onChange();
  }
  slotEls.forEach(function (s) { s.classList.add('slot'); s.addEventListener('click', function (e) { if (picked && !e.target.closest('.tok')) put(picked, s); else if (picked && e.target.closest('.tok') !== picked) put(picked, s); }); });
  tokens.forEach(function (tk) { tray.append(mk(tk)); });
  tray.addEventListener('click', function (e) { if (picked && !e.target.closest('.tok') && picked.parentNode !== tray) back(picked); });
  return { tray: tray, get: function (sid) { return placed[sid] ? placed[sid]._tok.id : null; }, lock: function () { document.querySelectorAll('.tok').forEach(function (x) { x.classList.add('locked'); }); },
    mark: function (sid, ok) { var s = slotEls.filter(function (x) { return x.dataset.slot === sid; })[0]; if (s) { s.classList.toggle('good', ok); s.classList.toggle('bad', !ok); } } };
}

/* 글 입력 + 저장 */
function answerBox(act, key, phKey, minLen) {
  var ta = h('textarea', { class: 'ans', rows: '3', 'data-kp': phKey, placeholder: t(phKey), maxlength: '300' });
  var prev = App.me && App.me.ans && App.me.ans[act + '.' + key]; if (prev) ta.value = prev;
  ta.ok = function () { return ta.value.trim().length >= (minLen || 5); };
  ta.save = function () { var v = ta.value.trim(); if (App.me) { App.me.ans = App.me.ans || {}; App.me.ans[act + '.' + key] = v; } return App.send({ action: 'answer', act: act, key: key, text: v }); };
  return ta;
}

/* 문장들을 그림 파일로 만들어 내려받기 */
function makeCard(title, lines, footer) {
  var W = 1200, pad = 70, c = document.createElement('canvas'), x = c.getContext('2d');
  x.font = 'bold 40px "Noto Sans KR", sans-serif';
  var wrapped = [];
  lines.forEach(function (ln) { var words = ln.split(''), cur = ''; words.forEach(function (ch) { if (x.measureText(cur + ch).width > W - pad * 2 - 40) { wrapped.push(cur); cur = ch; } else cur += ch; }); wrapped.push(cur); wrapped.push(''); });
  c.width = W; c.height = 260 + wrapped.length * 58 + 90;
  x.fillStyle = '#fffaf0'; x.fillRect(0, 0, c.width, c.height);
  x.fillStyle = '#2f7d4f'; x.fillRect(0, 0, c.width, 150);
  x.fillStyle = '#fff'; x.font = 'bold 54px "Jua","Noto Sans KR",sans-serif'; x.textBaseline = 'middle'; x.fillText(title, pad, 78);
  x.fillStyle = '#23301f'; x.font = 'bold 40px "Noto Sans KR", sans-serif'; x.textBaseline = 'top';
  wrapped.forEach(function (w, i) { x.fillText(w, pad, 200 + i * 58); });
  x.fillStyle = '#7a5230'; x.font = '30px "Noto Sans KR", sans-serif'; x.fillText(footer || '', pad, c.height - 70);
  return c;
}
function downloadCanvas(c, name) {
  var a = document.createElement('a'); a.download = name; a.href = c.toDataURL('image/png'); document.body.append(a); a.click(); a.remove();
}

/* 활동 틀: 단계가 하나씩 열립니다. steps = [function(box, ctx){...}], 각 단계에서 ctx.ready()를 부르면 "다음"이 켜집니다. */
function runActivity(root, def) {
  var i = 0, misses = 0, body = h('div', { class: 'act-body' }), dots = h('div', { class: 'dots' });
  var leave = null, next = btn('next', function () { if (leave) { var f = leave; leave = null; f(); } go(i + 1); }, 'btn primary big'); next.disabled = true;
  var ctx = { onNext: function (f) { leave = f; }, ready: function () { next.disabled = false; next.classList.add('pulse'); }, miss: function () { misses++; }, misses: function () { return misses; },
    finish: function () { App.finish(def.id, misses <= (def.bonusMax == null ? 2 : def.bonusMax)); } };
  root.innerHTML = '';
  root.className = 'act act-' + def.id + (def.theme ? ' ' + def.theme : '');
  root.append(h('header', { class: 'act-head' }, btn('toBody', function () { App.home('body'); }, 'btn ghost'), h('h2', { k: def.title }), dots), body, h('footer', { class: 'act-foot' }, next));
  def.steps.forEach(function () { dots.append(h('i')); });
  function go(n) {
    if (n >= def.steps.length) return;
    i = n; next.disabled = true; next.classList.remove('pulse');
    [].forEach.call(dots.children, function (d, j) { d.className = j < i ? 'past' : j === i ? 'now' : ''; });
    next.style.visibility = i === def.steps.length - 1 ? 'hidden' : '';
    body.innerHTML = ''; var box = h('section', { class: 'step' }); body.append(box);
    def.steps[i](box, ctx); applyI18n(box); body.scrollTop = 0; window.scrollTo(0, 0);
  }
  go(0);
}

/* 정답 없이 하나 고르는 버튼 묶음 */
function pickOne(optKeys, onPick, cls) {
  var box = h('div', { class: 'pickone ' + (cls || '') }), val = null;
  optKeys.forEach(function (k) {
    var b = h('button', { type: 'button', class: 'opt', k: k, 'aria-pressed': 'false' });
    b.addEventListener('click', function () { val = k; [].forEach.call(box.children, function (x) { x.setAttribute('aria-pressed', x === b); }); onPick && onPick(k); });
    box.append(b);
  });
  box.val = function () { return val; };
  return box;
}
