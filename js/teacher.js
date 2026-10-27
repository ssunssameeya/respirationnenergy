/* 교사 전용 페이지 (한국어) */
(function () {
  var SYSN = { dig: '소화계', cir: '순환계', res: '호흡계', exc: '배설계', cel: '세포호흡' };
  var STATE = { locked: '잠김', open: '활동 중', done: '활동 끝남' };
  var SLOTN = { hair: '머리카락', acc: '헤어 아이템', cloth: '옷', shoe: '신발' };
  var T = { pw: '', data: null, tab: 'prog', sys: 'dig', classes: CFG.CLASSES.slice(), cls: CFG.CLASSES[0], act: 'd1', sel: {} };
  function nm(a) { return a.toUpperCase() + ' ' + (LANG.ko['t_' + a] || ''); }
  function clsLabel(c) { return c === '' ? '반 미입력' : (/^\d+$/.test(c) ? c + '반' : c); }
  function call(req) { req.tpw = T.pw; req.classes = T.classes; return API.call(req); }
  var el = function () { return h.apply(null, arguments); };
  function load() {                                   // 시트에 적힌 반 이름을 그대로 진도표에 씁니다
    return call({ action: 'tOverview' }).then(function (r) {
      if (!r.ok) return r;
      var seen = {}, found = [];
      r.students.forEach(function (s) { var c = String(s.cls == null ? '' : s.cls); if (!seen[c]) { seen[c] = 1; found.push(c); } });
      found.sort(function (a, b) { return a.localeCompare(b, 'ko', { numeric: true }); });
      if (found.length && found.join('|') !== T.classes.join('|')) {
        T.classes = found; if (found.indexOf(T.cls) < 0) T.cls = found[0];
        return call({ action: 'tOverview' }).then(function (r2) { if (r2.ok) T.data = r2; return r2; });
      }
      T.data = r; return r;
    });
  }
  function inCls() { return T.data.students.filter(function (s) { return String(s.cls) === String(T.cls); }).sort(function (a, b) { return a.id < b.id ? -1 : 1; }); }
  function clsPick(onChange) {
    var s = el('select', { class: 'tsel' }); T.classes.forEach(function (c) { s.append(el('option', { value: c }, clsLabel(c))); }); s.value = T.cls;
    s.addEventListener('change', function () { T.cls = s.value; T.sel = {}; onChange(); }); return s;
  }
  function sysPick(onChange) {
    var r = el('div', { class: 'row' });
    Object.keys(SYS).forEach(function (k) { r.append(el('button', { class: 'btn small', 'aria-pressed': String(T.sys === k), on: { click: function () { T.sys = k; onChange(); } } }, SYSN[k])); });
    return r;
  }
  function lookOf(s) { var eq = {}; (s.items || []).forEach(function (it) { for (var k in (s.eq || {})) if (s.eq[k] === it.id && it.st === 'ok') eq[k] = it.px; }); return { kind: s.kind || 'm', eq: eq }; }

  function login() {
    var root = $('#app'); root.innerHTML = '';
    var pw = el('input', { type: 'password', placeholder: '교사 비밀번호' }), msg = el('p', { class: 'formmsg' });
    function go() { T.pw = pw.value; load().then(function (r) { if (!r.ok) { msg.textContent = r.err === 'tpw' ? '비밀번호가 맞지 않습니다.' : '연결 오류: ' + (r.msg || r.err); return; } try { sessionStorage.setItem('tt6-t', T.pw); } catch (e) {} draw(); }); }
    pw.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
    root.append(el('div', { class: 'login-card' }, el('h1', {}, '교사 페이지'), el('p', { class: 'sub' }, '동물과 에너지, 튼튼맨 되기'), pw, el('button', { class: 'btn primary big', on: { click: go } }, '들어가기'), msg,
      API.local ? el('p', { class: 'localnote' }, '연습 모드입니다(구글 시트 미연결). 교사 비밀번호: 1234') : null));
  }
  function draw() {
    var root = $('#app'); root.innerHTML = '';
    var tabs = el('nav', { class: 'tabs' }), wait = T.data.items.filter(function (i) { return i.st === 'wait'; }).length;
    [['prog', '진도표'], ['give', '점수 주기'], ['draw', '그림 승인' + (wait ? ' (' + wait + ')' : '')], ['done', '현황표'], ['ans', '학생 답'], ['run', '달리기 통계'], ['notice', '공지'], ['share', '모둠 의견 공유'], ['admin', '관리']].forEach(function (x) {
      tabs.append(el('button', { 'aria-pressed': String(T.tab === x[0]), on: { click: function () { T.tab = x[0]; draw(); } } }, x[1]));
    });
    var pane = el('div', { class: 'pane tpane' });
    root.append(el('header', { class: 'topbar' }, el('h1', {}, '교사 페이지'), tabs, el('button', { class: 'btn small', on: { click: function () { load().then(draw); } } }, '새로 고침')), pane);
    VIEW[T.tab](pane);
  }

  var VIEW = {
    prog: function (p) {
      var acts = SYS[T.sys];
      var tb = el('table', { class: 'data ttable' }, el('tr', {}, el('th', {}, '반'), acts.map(function (a) { return el('th', {}, nm(a)); })));
      T.classes.forEach(function (c) {
        var tr = el('tr', {}, el('th', {}, clsLabel(c)));
        acts.forEach(function (a) {
          var g = T.data.progress[c][a], td = el('td', { class: 'pc st-' + g.state }, el('b', {}, STATE[g.state]), el('small', {}, ' 완료 ' + g.pct + '%'));
          function set(st) { call({ action: 'tOpen', cls: c, act: a, state: st }).then(function () { load().then(draw); }); }
          if (g.state === 'locked') td.append(el('button', { class: 'btn small primary', on: { click: function () { set('open'); } } }, '열기'));
          else { if (g.state === 'done') td.append(el('button', { class: 'btn small', on: { click: function () { set('reopen'); } } }, '활동 중으로')); td.append(el('button', { class: 'btn small', on: { click: function () { set('locked'); } } }, '잠그기')); }
          tr.append(td);
        });
        tb.append(tr);
      });
      p.append(sysPick(draw), el('p', { class: 'note strong' }, '"열기"를 누르면 그 반 학생의 인체 모형에서 해당 기관이 활성화됩니다. 반 학생의 80% 이상이 완료하면 자동으로 "활동 끝남"이 되고, 학생은 다시 들어갈 수 있습니다.'), el('div', { class: 'scroll' }, tb));
    },
    give: function (p) {
      var list = inCls(), tb = el('table', { class: 'data ttable' }), cnt = el('b', {}, '0명 선택');
      function upd() { cnt.textContent = Object.keys(T.sel).length + '명 선택'; }
      tb.append(el('tr', {}, ['선택', '학번', '이름', '꿈', '모둠', '캐릭터', '경험치', '코인', '상태'].map(function (x) { return el('th', {}, x); })));
      list.forEach(function (s) {
        var cb = el('input', { type: 'checkbox', class: 'tcb' }); cb.checked = !!T.sel[s.id];
        cb.addEventListener('change', function () { if (cb.checked) T.sel[s.id] = 1; else delete T.sel[s.id]; upd(); });
        tb.append(el('tr', {}, el('td', {}, cb), el('td', {}, s.id), el('td', {}, s.name), el('td', {}, s.nick || '-'), el('td', {}, s.grp || '-'),
          el('td', { class: 'mini' }, s.kind ? charCanvas(lookOf(s), { stage: stageOf(s.peak), scale: 1.2 }) : '-'), el('td', { class: 'num' }, String(s.xp)), el('td', { class: 'num' }, String(s.coin || 0)),
          el('td', {}, s.locked ? '로그인 잠김' : (s.hasPw ? '' : '미가입'))));
      });
      function pick(fn) { T.sel = {}; list.forEach(function (s) { if (fn(s)) T.sel[s.id] = 1; }); draw(); }
      var grps = {}; list.forEach(function (s) { if (s.grp) grps[s.grp] = 1; });
      var quick = el('div', { class: 'row' }, el('button', { class: 'btn small', on: { click: function () { pick(function () { return true; }); } } }, '반 전체'), el('button', { class: 'btn small', on: { click: function () { pick(function () { return false; }); } } }, '선택 해제'),
        Object.keys(grps).sort().map(function (g) { return el('button', { class: 'btn small', on: { click: function () { pick(function (s) { return s.grp === g; }); } } }, g + '모둠'); }));
      function give(it) { var ids = Object.keys(T.sel); if (!ids.length) { toast('학생을 먼저 선택하세요.', 'bad'); return; } call({ action: 'tGive', ids: ids, x: it.xp, label: it.id }).then(function () { toast(it.icon + ' ' + it.name.ko + ' → ' + ids.length + '명'); load().then(draw); }); }
      p.append(el('div', { class: 'row' }, clsPick(draw), quick, cnt),
        el('div', { class: 'panel' }, el('h3', {}, '성장 아이템 (칭찬)'), el('div', { class: 'row' }, CFG.ITEMS.map(function (it) { return el('button', { class: 'btn givebtn good', on: { click: function () { give(it); } } }, it.icon + ' ' + it.name.ko + ' +' + it.xp); })),
          el('h3', {}, '디버프 이벤트 (그날 하루 캐릭터에 효과 표시)'), el('div', { class: 'row' }, CFG.DEBUFFS.map(function (it) { return el('button', { class: 'btn givebtn bad', on: { click: function () { give(it); } } }, it.icon + ' ' + it.name.ko + ' ' + it.xp); }))),
        el('div', { class: 'scroll' }, tb)); upd();
    },
    draw: function (p) {
      var items = T.data.items.slice().sort(function (a, b) { return (a.st === 'wait' ? 0 : 1) - (b.st === 'wait' ? 0 : 1) || String(b.t).localeCompare(String(a.t)); });
      var grid = el('div', { class: 'drawgrid' });
      items.forEach(function (it) {
        var owner = T.data.students.filter(function (s) { return s.id === it.owner; })[0] || {};
        var c = document.createElement('canvas'); itemPaint(c, it.slot, it.px, 5);
        var lk = lookOf(owner); lk.eq[it.slot] = it.px;
        function op(o) { if (o === 'del' && !window.confirm('이 그림을 지울까요? 코인은 돌려주지 않습니다.')) return; call({ action: 'tItem', id: it.owner, item: it.id, op: o }).then(function (r) { toast(r.ok ? '처리했습니다.' : '오류: ' + r.err, r.ok ? '' : 'bad'); load().then(draw); }); }
        grid.append(el('div', { class: 'drawcard ' + it.st },
          el('div', { class: 'row' }, c, charCanvas(lk, { stage: stageOf(owner.peak || 0), scale: 2 })),
          el('b', {}, clsLabel(String(it.cls)) + ' ' + it.name + ' (' + (it.nick || '-') + ')'), el('small', {}, SLOTN[it.slot] + ' · ' + (it.st === 'wait' ? '승인 대기' : '승인됨')),
          it.st === 'wait' ? el('div', { class: 'row' }, el('button', { class: 'btn small primary', on: { click: function () { op('ok'); } } }, '승인'), el('button', { class: 'btn small', on: { click: function () { op('no'); } } }, '거절(코인 환불)'))
            : el('button', { class: 'btn small', on: { click: function () { op('del'); } } }, '삭제')));
      });
      p.append(el('p', { class: 'note strong' }, '학생이 그린 아이템은 승인해야 캐릭터에 입을 수 있습니다. 거절하면 코인 1개를 돌려줍니다.'), items.length ? grid : el('p', { class: 'note' }, '아직 제출된 그림이 없습니다.'));
    },
    done: function (p) {
      var tb = el('table', { class: 'data ttable' }, el('tr', {}, el('th', {}, '학번'), el('th', {}, '이름'), ACTS.map(function (a) { return el('th', { title: nm(a) }, a.toUpperCase()); }), el('th', {}, '경험치')));
      inCls().forEach(function (s) { tb.append(el('tr', {}, el('td', {}, s.id), el('td', {}, s.name), ACTS.map(function (a) { var d = s.done[a]; return el('td', { class: d ? 'okc' : '' }, d ? (d.b ? '★' : '✓') : ''); }), el('td', { class: 'num' }, String(s.xp)))); });
      p.append(el('div', { class: 'row' }, clsPick(draw), el('span', { class: 'note' }, '✓ 완료 · ★ 정확하게 해결해 추가 점수 · 칸에 마우스를 올리면 활동 이름')), el('div', { class: 'scroll' }, tb));
    },
    ans: function (p) {
      var as = el('select', { class: 'tsel' }); ACTS.forEach(function (a) { as.append(el('option', { value: a }, nm(a))); }); as.value = T.act;
      as.addEventListener('change', function () { T.act = as.value; draw(); });
      var tb = el('table', { class: 'data ttable anst' }, el('tr', {}, el('th', {}, '학번'), el('th', {}, '이름'), el('th', {}, '답')));
      inCls().forEach(function (s) {
        var cell = el('td', { class: 'anscell' });
        Object.keys(s.ans).filter(function (k) { return k.indexOf(T.act + '.') === 0; }).forEach(function (k) { cell.append(el('p', {}, el('b', {}, k.split('.')[1] + ': '), s.ans[k])); });
        tb.append(el('tr', {}, el('td', {}, s.id), el('td', {}, s.name), cell));
      });
      p.append(el('div', { class: 'row' }, clsPick(draw), as), el('p', { class: 'note' }, '모든 답은 구글 시트의 "답" 시트에도 시간순으로 쌓입니다.'), el('div', { class: 'scroll' }, tb));
    },
    /* 1분 달리기 통계: ① 생리적 범위 밖 값 제외 → ② 남은 값에서 평균±2표준편차 밖 값 제외 → 반 평균 */
    run: function (p) {
      var MS = [{ k: 't', n: '체온', u: '°C', lo: 35, hi: 40, d: 2 }, { k: 'h', n: '심박수', u: '회/분', lo: 40, hi: 200, d: 1 }, { k: 'b', n: '호흡수', u: '회/분', lo: 8, hi: 60, d: 1 }];   // 범위는 js/acts/s2.js와 같게
      var list = inCls(), out = [], res = {}, sent = 0;
      var vals = {}; MS.forEach(function (m) { ['0', '1'].forEach(function (w) { vals[m.k + w] = []; }); });
      list.forEach(function (s) {
        var d = null; try { d = JSON.parse(s.ans['s2.run'] || 'null'); } catch (e) {}
        if (!d) return; sent++;
        MS.forEach(function (m) { ['0', '1'].forEach(function (w) {
          var v = Number(d[m.k + w]);
          if (!isFinite(v)) return;
          if (v < m.lo || v > m.hi) out.push([s, m, w, v, '생리적 범위(' + m.lo + '~' + m.hi + ') 밖']);
          else vals[m.k + w].push({ s: s, v: v });
        }); });
      });
      function stat(a) { var n = a.length, mean = a.reduce(function (x, y) { return x + y.v; }, 0) / (n || 1), sd = Math.sqrt(a.reduce(function (x, y) { return x + (y.v - mean) * (y.v - mean); }, 0) / (n > 1 ? n - 1 : 1)); return { n: n, mean: mean, sd: sd }; }
      MS.forEach(function (m) { ['0', '1'].forEach(function (w) {
        var a = vals[m.k + w], st = stat(a), keep = a;
        if (a.length >= 4 && st.sd > 0) keep = a.filter(function (x) { var far = Math.abs(x.v - st.mean) > 2 * st.sd; if (far) out.push([x.s, m, w, x.v, '평균 ' + st.mean.toFixed(m.d) + ' ± 2×' + st.sd.toFixed(m.d) + ' 밖']); return !far; });
        res[m.k + w] = stat(keep);
      }); });
      var tb = el('table', { class: 'data ttable runst' }, el('tr', {}, el('th', {}, '항목'), el('th', {}, '달리기 전 평균'), el('th', {}, '달리기 후 평균'), el('th', {}, '변화')));
      var charts = el('div', { class: 'runcharts' });
      MS.forEach(function (m) {
        var a = res[m.k + '0'], b = res[m.k + '1'], ok = a.n && b.n;
        tb.append(el('tr', {}, el('th', {}, m.n + ' (' + m.u + ')'), el('td', { class: 'num' }, a.n ? a.mean.toFixed(m.d) + ' (' + a.n + '명)' : '-'), el('td', { class: 'num' }, b.n ? b.mean.toFixed(m.d) + ' (' + b.n + '명)' : '-'),
          el('td', { class: 'num' }, ok ? (b.mean - a.mean >= 0 ? '+' : '') + (b.mean - a.mean).toFixed(m.d) : '-')));
        /* 막대그래프: 항목마다 단위가 달라 따로 그림. 체온은 차이가 작아 34 °C부터 그림 */
        var base = m.k === 't' ? 34 : 0, top = Math.max(a.n ? a.mean : 0, b.n ? b.mean : 0, base + 1) * (m.k === 't' ? 1.01 : 1.15), H = 160;
        function bh(v) { return (v - base) / (top - base) * H; }
        var svg = '<svg viewBox="0 0 200 220" class="runsvg"><line x1="20" y1="180" x2="190" y2="180" stroke="#3b2a2c" stroke-width="2"/>';
        [[a, '전', '#90a4ae', 50], [b, '후', '#ef5b5b', 130]].forEach(function (x) {
          if (!x[0].n) return; var hh = bh(x[0].mean);
          svg += '<rect x="' + (x[3] - 26) + '" y="' + (180 - hh) + '" width="52" height="' + hh + '" rx="6" fill="' + x[2] + '"/><text x="' + x[3] + '" y="' + (174 - hh) + '" text-anchor="middle" font-size="15" font-weight="700">' + x[0].mean.toFixed(m.d) + '</text><text x="' + x[3] + '" y="200" text-anchor="middle" font-size="14">' + x[1] + '</text>';
        });
        svg += '<text x="105" y="216" text-anchor="middle" font-size="14" font-weight="900">' + m.n + ' (' + m.u + ')</text>' + (base ? '<text x="22" y="194" font-size="10" fill="#777">' + base + ' ' + m.u + '부터</text>' : '') + '</svg>';
        charts.append(el('div', { class: 'panel', html: svg }));
      });
      var ot = el('table', { class: 'data ttable' }, el('tr', {}, el('th', {}, '학번'), el('th', {}, '이름'), el('th', {}, '항목'), el('th', {}, '값'), el('th', {}, '제외한 까닭')));
      out.forEach(function (x) { ot.append(el('tr', {}, el('td', {}, x[0].id), el('td', {}, x[0].name), el('td', {}, x[1].n + ' ' + (x[2] === '0' ? '전' : '후')), el('td', { class: 'num' }, String(x[3])), el('td', {}, x[4]))); });
      p.append(el('div', { class: 'row' }, clsPick(draw), el('span', { class: 'note' }, '입력한 학생 ' + sent + '명 / ' + list.length + '명')), charts, el('div', { class: 'scroll' }, tb),
        el('p', { class: 'note' }, '제외 기준: ① 사람 몸에서 나오기 어려운 값(생리적 범위 밖)을 먼저 빼고, ② 남은 값의 평균에서 표준편차의 2배보다 멀리 떨어진 값을 뺍니다(값이 4개 이상일 때). 값마다 따로 판단합니다.'),
        el('h3', {}, '제외한 값 (' + out.length + '개)'), out.length ? el('div', { class: 'scroll' }, ot) : el('p', { class: 'note' }, '제외한 값이 없습니다.'));
    },
    /* 공지 게시판: 학생 화면 "공지" 탭에 최신순으로 보입니다. 링크는 https:// 로 시작하는 주소만 */
    notice: function (p) {
      var title = el('input', { class: 'tinput', maxlength: '80', placeholder: '제목 (예: 3차시 활동지 안내)' });
      var body = el('textarea', { class: 'tinput ntext', rows: '4', maxlength: '600', placeholder: '내용 (줄을 바꿔 써도 됩니다)' });
      var url = el('input', { class: 'tinput', maxlength: '400', placeholder: '링크 (선택) 예: https://padlet.com/...' });
      var pick = el('div', { class: 'row' }), all = el('input', { type: 'checkbox', checked: '' }), boxes = [];
      pick.append(el('label', { class: 'chk' }, all, ' 전체 반'));
      T.classes.forEach(function (c) { var b = el('input', { type: 'checkbox' }); b._c = c; boxes.push(b); pick.append(el('label', { class: 'chk' }, b, ' ' + clsLabel(c))); });
      all.addEventListener('change', function () { if (all.checked) boxes.forEach(function (b) { b.checked = false; }); });
      boxes.forEach(function (b) { b.addEventListener('change', function () { if (b.checked) all.checked = false; }); });
      var send = el('button', { class: 'btn primary', on: { click: function () {
        if (!title.value.trim()) { toast('제목을 써 주세요.', 'bad'); return; }
        if (url.value.trim() && !/^https?:\/\//.test(url.value.trim())) { toast('링크는 https:// 로 시작해야 합니다.', 'bad'); return; }
        var cls = all.checked ? [] : boxes.filter(function (b) { return b.checked; }).map(function (b) { return b._c; });
        if (!all.checked && !cls.length) { toast('보낼 반을 골라 주세요.', 'bad'); return; }
        send.disabled = true;
        call({ action: 'tNotice', op: 'add', title: title.value, body: body.value, url: url.value, cls: cls }).then(function (r) { send.disabled = false; toast(r.ok ? '공지를 올렸습니다.' : '오류: ' + r.err, r.ok ? '' : 'bad'); if (r.ok) load().then(draw); });
      } } }, '공지 올리기');
      var list = el('div', { class: 'nlist' }), ns = T.data.notices || [];
      if (!ns.length) list.append(el('p', { class: 'note' }, '아직 올린 공지가 없습니다.'));
      ns.forEach(function (n) {
        var del = el('button', { class: 'btn small', on: { click: function () { if (!window.confirm('이 공지를 지울까요?')) return; call({ action: 'tNotice', op: 'del', nid: n.id }).then(function () { load().then(draw); }); } } }, '삭제');
        list.append(el('div', { class: 'ncard' }, el('div', { class: 'row' }, el('b', {}, n.t), el('span', { class: 'chip' }, n.cls && n.cls.length ? n.cls.map(clsLabel).join(', ') : '전체 반'), el('small', {}, n.d), del),
          n.b ? el('p', { class: 'nbody' }, n.b) : null, n.u ? el('a', { href: n.u, target: '_blank', rel: 'noopener noreferrer' }, '🔗 ' + n.u) : null));
      });
      p.append(el('div', { class: 'panel' }, el('h3', {}, '새 공지'), title, body, url, pick, send),
        el('div', { class: 'panel' }, el('h3', {}, '지난 공지 (' + ns.length + '개, 최대 40개까지 보관)'), list));
    },
    /* 호흡계 r4 모둠 의견: 학생들이 쓴 닮은 점·다른 점 중 골라 반 전체에 공유 → 학생은 끌어서 최종 정리 */
    share: function (p) {
      var NM = { sim: '닮은 점', diff: '다른 점' }, rows = [];
      var tb = el('table', { class: 'data ttable' }, el('tr', {}, el('th', {}, '공유'), el('th', {}, '모둠'), el('th', {}, '학생'), el('th', {}, '의견 (고쳐서 공유할 수 있어요)'), el('th', {}, '구분')));
      var cur = ((T.data.shares || {})[T.cls] || {}).r4 || [];
      inCls().forEach(function (s) {
        ['sim', 'diff'].forEach(function (k) {
          String((s.ans || {})['r4.' + k] || '').split('\n').map(function (x) { return x.trim(); }).filter(Boolean).forEach(function (txt) {
            var cb = el('input', { type: 'checkbox' }), ed = el('input', { class: 'tinput', value: txt, maxlength: '200' }), cat = el('select', { class: 'tsel' });
            ['sim', 'diff'].forEach(function (c) { cat.append(el('option', { value: c }, NM[c])); }); cat.value = k;
            if (cur.some(function (x) { return x.t === txt; })) cb.checked = true;
            rows.push({ cb: cb, ed: ed, cat: cat });
            tb.append(el('tr', {}, el('td', {}, cb), el('td', {}, s.grp || '-'), el('td', {}, s.name), el('td', {}, ed), el('td', {}, cat)));
          });
        });
      });
      var go = el('button', { class: 'btn primary', on: { click: function () {
        var list = rows.filter(function (r) { return r.cb.checked; }).map(function (r) { return { t: r.ed.value, c: r.cat.value }; });
        if (list.length > 20) { toast('20개까지 공유할 수 있습니다.', 'bad'); return; }
        call({ action: 'tShare', cls: T.cls, act: 'r4', list: list }).then(function (r) { toast(r.ok ? clsLabel(T.cls) + '에 ' + list.length + '개를 공유했습니다.' : '오류: ' + r.err, r.ok ? '' : 'bad'); if (r.ok) load().then(draw); });
      } } }, '고른 의견을 반에 공유');
      var now = el('ul', {}, cur.map(function (x) { return el('li', {}, '[' + NM[x.c] + '] ' + x.t); }));
      p.append(el('div', { class: 'row' }, clsPick(draw), el('span', { class: 'note' }, '호흡계 r4 "모형과 실제 비교하기"에서 모둠이 쓴 의견입니다.')),
        el('div', { class: 'panel' }, el('h3', {}, '지금 이 반에 공유된 정리 (' + cur.length + '개)'), cur.length ? now : el('p', { class: 'note' }, '아직 공유하지 않았습니다. 공유 전에는 학생들이 기본 문장으로 정리합니다.')),
        el('div', { class: 'panel' }, el('p', { class: 'note strong' }, '공유할 의견을 고르고, 필요하면 문장을 다듬고 "닮은 점/다른 점"을 정한 뒤 공유하세요. 학생은 공유된 문장을 끌어서 두 칸에 나누고, 선생님이 정한 구분과 비교해 확인합니다.'),
          rows.length ? el('div', { class: 'scroll' }, tb) : el('p', { class: 'note' }, '아직 의견을 쓴 학생이 없습니다.'), go));
    },
    admin: function (p) {
      var tb = el('table', { class: 'data ttable' }, el('tr', {}, el('th', {}, '학번'), el('th', {}, '이름'), el('th', {}, '꿈'), el('th', {}, '관리')));
      inCls().forEach(function (s) {
        tb.append(el('tr', {}, el('td', {}, s.id), el('td', {}, s.name), el('td', {}, s.nick || '-'), el('td', {},
          el('button', { class: 'btn small', on: { click: function () { if (window.confirm(s.name + ' 학생의 비밀번호를 지울까요? 로그인 잠금도 풀리고, 다음 로그인 때 새로 정합니다.')) call({ action: 'tResetPw', id: s.id }).then(function () { toast('초기화했습니다.'); load().then(draw); }); } } }, '비밀번호 초기화·잠금 해제'),
          el('button', { class: 'btn small', on: { click: function () { if (window.confirm(s.name + ' 학생의 꿈을 지울까요? 다음 로그인 때 새로 씁니다.')) call({ action: 'tResetNick', id: s.id }).then(function () { toast('초기화했습니다.'); load().then(draw); }); } } }, '꿈 다시 쓰게 하기'))));
      });
      var word = el('input', { class: 'tinput', placeholder: '초기화 라고 입력' });
      p.append(el('div', { class: 'panel' }, el('h3', {}, '학생 계정'), el('div', { class: 'row' }, clsPick(draw)), el('div', { class: 'scroll' }, tb)),
        el('div', { class: 'panel' }, el('h3', {}, '새 학년 초기화'), el('p', { class: 'note warn' }, '모든 학생의 비밀번호, 꿈, 캐릭터, 경험치, 코인, 그림, 활동 기록과 진도표가 지워집니다. 학번과 이름은 구글 시트에서 직접 바꾸세요.'),
          el('div', { class: 'row' }, word, el('button', { class: 'btn', on: { click: function () { if (word.value.trim() !== '초기화') { toast('"초기화"라고 입력해야 합니다.', 'bad'); return; } call({ action: 'tResetYear' }).then(function () { toast('초기화했습니다.'); load().then(draw); }); } } }, '전체 초기화'))));
    }
  };
  window.addEventListener('DOMContentLoaded', function () {
    var s = null; try { s = sessionStorage.getItem('tt6-t'); } catch (e) {}
    if (s) { T.pw = s; load().then(function (r) { if (r.ok) draw(); else login(); }); } else login();
  });
})();
