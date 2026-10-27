/* 배설계 2: 오줌이 만들어지는 과정 — 입자를 옮기며 여과·재흡수·분비 정리하고 영상으로 저장 (교과서 p213~214, 그림 6-11, 해 보기)
   입자 수: 재흡수는 포도당·아미노산 모두, 물은 대부분, 무기염류는 일부, 요소는 일부만(교과서 보충: 물 99 %, 요소 50 % 정도) */
(function () {
  var W = 440, H = 540;
  var TY = { glu: { c: '#f2c14e', r: 9, k: 'p_glu', n: 2 }, amino: { c: '#ff8a3d', r: 9, k: 'p_amino', n: 2 }, salt: { c: '#9e9e9e', r: 7, k: 'e2_salt', n: 2 },
    water: { c: '#4fc3f7', r: 7, k: 'e2_water', n: 3 }, urea: { c: '#ab47bc', r: 8, k: 'e1_urea', n: 2 }, rbc: { c: '#e53935', r: 14, k: 'e2_rbc', n: 2, big: 1 },
    prot: { c: '#43a047', r: 13, k: 'e2_prot', n: 2, big: 1 }, waste: { c: '#795548', r: 9, k: 'e2_waste', n: 0 } };
  var SMALL = ['glu', 'amino', 'salt', 'water', 'urea'];
  var REAB = { glu: 2, amino: 2, water: 2, salt: 1, urea: 1 };           // 정답 보여 줄 때 재흡수시키는 개수
  var GC = [160, 118];
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function randPos(rg) {
    if (rg === 'G') { var a = rnd(0, 6.28), r = Math.sqrt(Math.random()) * 44; return [GC[0] + r * Math.cos(a), GC[1] + r * Math.sin(a)]; }
    if (rg === 'B') { var a2 = rnd(-0.1, 3.24), r2 = rnd(68, 88); return [GC[0] + r2 * Math.cos(a2), GC[1] + r2 * Math.sin(a2)]; }
    var R = { T: [144, 178, 226, 452], C: [270, 312, 162, 452], U: [128, 192, 486, 524], OUT: [334, 430, 476, 530] }[rg];
    return [rnd(R[0], R[1]), rnd(R[2], R[3])];
  }
  function regionAt(x, y) {
    var d = Math.hypot(x - GC[0], y - GC[1]);
    if (d < 60) return 'G';
    if (d < 100 && y > GC[1] - 12) return 'B';
    if (x > 132 && x < 190 && y > 212 && y < 466) return 'T';
    if (x > 258 && x < 324 && y > 146 && y < 466) return 'C';
    if (x > 116 && x < 204 && y > 470 && y < 536) return 'U';
    return null;
  }

  function Model() {
    var cv = h('canvas', { class: 'nephcv', width: String(W), height: String(H) }), g = cv.getContext('2d'), P = [], drag = null, M = { cv: cv, mode: 'none', caption: '', bg: null, base: true };
    function place(rg, me) {
      var best = null, bd = -1;
      for (var i = 0; i < 24; i++) {                // 다른 입자와 가장 덜 겹치는 자리
        var q = randPos(rg), md = 1e9;
        P.forEach(function (o) { if (o !== me && o.rg === rg) md = Math.min(md, Math.hypot(o.tx - q[0], o.ty - q[1]) - TY[o.type].r); });
        if (md > bd) { bd = md; best = q; } if (md > 22) break;
      }
      return best;
    }
    function add(type, rg) { var p = place(rg, null), o = { type: type, rg: rg, x: p[0], y: p[1], tx: p[0], ty: p[1], start: rg, bad: false }; P.push(o); return o; }
    M.reset = function () { P = []; Object.keys(TY).forEach(function (k) { for (var i = 0; i < TY[k].n; i++) add(k, 'G'); }); };
    M.move = function (p, rg) { p.rg = rg; var q = place(rg, p); p.tx = q[0]; p.ty = q[1]; };
    M.each = function (f) { P.forEach(f); };
    M.mark = function () { P.forEach(function (p) { p.start = p.rg; p.bad = false; }); };
    M.addWaste = function () { for (var i = 0; i < 2; i++) { var o = add('waste', 'C'); o.start = 'C'; } };
    function allowed(p, to) {
      if (!to || to === p.rg) return false;
      if (M.mode === 'free') return true;
      if (M.mode === 'filter') return (p.rg === 'G' && to === 'B') || (p.rg === 'B' && to === 'G');
      if (M.mode === 'reab') return p.start === 'T' && ((p.rg === 'T' && to === 'C') || (p.rg === 'C' && to === 'T'));
      if (M.mode === 'secr') return p.start === 'C' && ((p.rg === 'C' && to === 'T') || (p.rg === 'T' && to === 'C'));
      return false;
    }
    function canPick(p) { return M.mode === 'free' || (M.mode === 'filter' && (p.rg === 'G' || p.rg === 'B')) || (M.mode === 'reab' && p.start === 'T') || (M.mode === 'secr' && p.start === 'C'); }
    function pt(e) { var b = cv.getBoundingClientRect(); return [(e.clientX - b.left) * W / b.width, (e.clientY - b.top) * H / b.height]; }
    cv.addEventListener('pointerdown', function (e) {
      if (M.mode === 'none') return;
      var q = pt(e);
      var bi = -1, bd = 1e9;
      P.forEach(function (p, i) { var d = Math.hypot(p.x - q[0], p.y - q[1]); if (canPick(p) && d < TY[p.type].r + 10 && d < bd) { bd = d; bi = i; } });
      if (bi < 0) return;
      var p = P.splice(bi, 1)[0]; P.push(p); drag = p; p.bad = false;
      try { cv.setPointerCapture(e.pointerId); } catch (er) {} e.preventDefault();
    });
    cv.addEventListener('pointermove', function (e) { if (!drag) return; var q = pt(e); drag.x = drag.tx = q[0]; drag.y = drag.ty = q[1]; });
    cv.addEventListener('pointerup', function (e) {
      if (!drag) return;
      var p = drag, q = pt(e), to = regionAt(q[0], q[1]); drag = null;
      if (allowed(p, to)) { p.rg = to; if (regionAt(q[0], q[1]) === to) { p.tx = q[0]; p.ty = q[1]; } else M.move(p, to); }
      else M.move(p, p.rg);
      M.onChange && M.onChange();
    });
    function label(txt, x, y, col) { g.font = 'bold 14px sans-serif'; g.textAlign = 'center'; g.lineWidth = 4; g.strokeStyle = '#fff'; g.strokeText(txt, x, y); g.fillStyle = col || '#3b2a2c'; g.fillText(txt, x, y); }
    function base() {
      g.lineCap = 'round';
      g.strokeStyle = '#e57373'; g.lineWidth = 22; g.beginPath(); g.moveTo(-10, 50); g.quadraticCurveTo(70, 50, 116, 80); g.stroke();
      g.beginPath(); g.moveTo(204, 80); g.quadraticCurveTo(292, 50, 292, 150); g.stroke();
      g.beginPath(); g.moveTo(292, 462); g.lineTo(292, 504); g.lineTo(440, 504); g.stroke();
      g.strokeStyle = '#fde9a8'; g.lineWidth = 34; g.lineCap = 'butt'; g.beginPath(); g.arc(GC[0], GC[1], 79, -0.12, 3.26); g.stroke();
      g.strokeStyle = '#c9a227'; g.lineWidth = 2; g.beginPath(); g.arc(GC[0], GC[1], 96, -0.12, 3.26); g.stroke(); g.beginPath(); g.arc(GC[0], GC[1], 62, -0.12, 3.26); g.stroke();
      g.fillStyle = '#fde9a8'; g.strokeStyle = '#c9a227'; g.fillRect(132, 210, 58, 256); g.strokeRect(132, 210, 58, 256);
      g.fillStyle = '#fff3b0'; g.fillRect(116, 470, 88, 64); g.strokeRect(116, 470, 88, 64);
      g.fillStyle = '#f8c9c9'; g.strokeStyle = '#e57373'; g.fillRect(258, 146, 66, 320); g.strokeRect(258, 146, 66, 320);
      g.fillStyle = '#f28b82'; g.beginPath(); g.arc(GC[0], GC[1], 58, 0, 7); g.fill();
      g.strokeStyle = '#c62828'; g.lineWidth = 3; g.beginPath(); for (var a = 0; a < 6.3; a += .3) { var r = 40 + 10 * Math.sin(a * 5); g.lineTo(GC[0] + r * Math.cos(a), GC[1] + r * Math.sin(a)); } g.stroke();
      label(t('e2_g'), GC[0], GC[1] - 64); label(t('e2_b'), 40, 214); label(t('e2_t'), 98, 330, '#7a5d00');
      label(t('e2_c'), 291, 140, '#c62828'); label(t('e2_u'), 160, 528); label(t('e2_out'), 384, 466, '#c62828'); label(t('e2_in'), 34, 50, '#c62828');
    }
    function draw() {
      g.clearRect(0, 0, W, H); g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
      if (M.bg) { var s = Math.max(W / M.bg.width, H / M.bg.height); g.drawImage(M.bg, (W - M.bg.width * s) / 2, (H - M.bg.height * s) / 2, M.bg.width * s, M.bg.height * s); }
      if (M.base) { g.save(); g.globalAlpha = M.bg ? .45 : 1; base(); g.restore(); }
      P.forEach(function (p) {
        if (p !== drag) { p.x += (p.tx - p.x) * .18; p.y += (p.ty - p.y) * .18; }
        var T0 = TY[p.type]; g.fillStyle = T0.c; g.strokeStyle = p.bad ? '#d50000' : '#3b2a2c'; g.lineWidth = p.bad ? 4 : 1.5;
        g.beginPath();
        if (p.type === 'prot') { for (var i = 0; i < 6; i++) { var a = i * 1.047; g.lineTo(p.x + T0.r * Math.cos(a), p.y + T0.r * Math.sin(a)); } g.closePath(); } else g.arc(p.x, p.y, T0.r, 0, 7);
        g.fill(); g.stroke();
        if (T0.r >= 8) { g.fillStyle = '#fff'; g.font = 'bold ' + (T0.r + 1) + 'px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(t(T0.k).charAt(0), p.x, p.y + 1); g.textBaseline = 'alphabetic'; }
      });
      if (M.caption) { g.fillStyle = 'rgba(31,42,36,.86)'; g.fillRect(0, 0, W, 34); g.fillStyle = '#fff'; g.font = 'bold 16px sans-serif'; g.textAlign = 'center'; g.fillText(M.caption, W / 2, 23); }
    }
    var timer = null;
    (function loop() { if (!cv.isConnected && timer) return; draw(); timer = setTimeout(loop, 33); })();
    M.legend = function () {
      return h('div', { class: 'plegend' }, Object.keys(TY).filter(function (k) { return k !== 'waste' || M.showWaste; }).map(function (k) {
        return h('span', { class: 'pchip' }, h('i', { style: 'background:' + TY[k].c + (k === 'prot' ? ';border-radius:3px' : '') }), h('span', { k: TY[k].k }));
      }));
    };
    M.count = function (rg, type) { return P.filter(function (p) { return p.rg === rg && (!type || p.type === type); }).length; };
    M.list = function () { return P; };
    M.reset();
    return M;
  }

  var M = null;
  function stage(box, todoK, mode, check, reveal, okK) {
    return function (ctx) {
      M.mode = mode; M.mark(); M.caption = t('e2_cap_' + mode);
      var res = h('div'), ck = btn('check', function () {
        var bad = check();
        ck.remove(); M.mode = 'none';
        if (bad) { ctx.miss(); res.append(note('e2_fix', 'warn')); }
        setTimeout(function () { reveal(); M.each(function (p) { p.bad = false; }); res.append(note(okK, 'result')); applyI18n(res); ctx.ready(); }, bad ? 1600 : 300);
        applyI18n(res);
      }, 'btn primary');
      box.append(todo(todoK), h('div', { class: 'cols wide1' }, h('div', { class: 'panel' }, M.cv), h('div', { class: 'panel' }, note('e2_' + mode + '_how', 'strong'), M.legend(), ck, res)));
    };
  }

  ACT.e2 = { id: 'e2', title: 't_e2', model: function () { return M; }, steps: [
    /* ① 여과: 토리 → 보먼주머니 */
    function (box, ctx) {
      M = Model();
      box.append(note('e2_intro'));
      stage(box, 'e2_s1_todo', 'filter', function () {
        var bad = 0; M.each(function (p) { var want = TY[p.type].big ? 'G' : 'B'; if (p.rg !== want) { p.bad = true; bad++; } });
        App.send({ action: 'answer', act: 'e2', key: 'filter', text: SMALL.map(function (k) { return t(TY[k].k) + ' ' + M.count('B', k); }).join(', ') });
        return bad;
      }, function () { M.each(function (p) { M.move(p, TY[p.type].big ? 'G' : 'B'); }); }, 'e2_filter_ok')(ctx);
    },
    /* ② 재흡수: 세뇨관 → 모세혈관 */
    function (box, ctx) {
      M.each(function (p) { M.move(p, p.rg === 'B' ? 'T' : 'C'); });
      stage(box, 'e2_s2_todo', 'reab', function () {
        var bad = 0, moved = {};
        SMALL.forEach(function (k) { moved[k] = M.count('C', k); });
        var ok = { glu: moved.glu === 2, amino: moved.amino === 2, water: moved.water >= TY.water.n - 1 && moved.water < TY.water.n, salt: moved.salt >= 1 && moved.salt < TY.salt.n, urea: moved.urea <= TY.urea.n / 2 };
        M.each(function (p) { if (p.start === 'T' && !ok[p.type]) { p.bad = true; bad++; } });
        App.send({ action: 'answer', act: 'e2', key: 'reab', text: SMALL.map(function (k) { return t(TY[k].k) + ' ' + moved[k]; }).join(', ') });
        return bad;
      }, function () {
        var left = Object.assign({}, REAB);
        M.each(function (p) { if (p.start !== 'T') return; if (left[p.type] > 0) { left[p.type]--; if (p.rg !== 'C') M.move(p, 'C'); } else if (p.rg !== 'T') M.move(p, 'T'); });
      }, 'e2_reab_ok')(ctx);
    },
    /* ③ 분비: 모세혈관 → 세뇨관 */
    function (box, ctx) {
      M.addWaste(); M.showWaste = true;
      stage(box, 'e2_s3_todo', 'secr', function () {
        var bad = 0; M.each(function (p) { if (p.start !== 'C') return; var want = p.type === 'waste' ? 'T' : 'C'; if (p.rg !== want) { p.bad = true; bad++; } });
        return bad;
      }, function () { M.each(function (p) { if (p.start === 'C') M.move(p, p.type === 'waste' ? 'T' : 'C'); }); }, 'e2_secr_ok')(ctx);
    },
    /* ④ 오줌 완성 + 확인 질문 */
    function (box, ctx) {
      M.mode = 'none'; M.caption = t('e2_cap_urine');
      M.each(function (p) { M.move(p, p.rg === 'T' ? 'U' : 'OUT'); });
      var tb = h('table', { class: 'data' }, h('tr', {}, h('th', { k: 'e2_th_sub' }), h('th', { k: 'e2_th_urine' }), h('th', { k: 'e2_th_blood' })));
      Object.keys(TY).forEach(function (k) { tb.append(h('tr', {}, h('td', { k: TY[k].k }), h('td', { dir: 'ltr' }, String(M.count('U', k))), h('td', { dir: 'ltr' }, String(M.count('OUT', k))))); });
      var q2 = h('div', {});
      var q1 = choice('e2_q1', ['e2_q1a', 'e2_q1b', 'e2_q1c'], 0, function () {
        q2.append(choice('e2_q2', ['e2_q2a', 'e2_q2b', 'e2_q2c'], 0, function () { q2.append(note('e2_s4ok', 'result')); applyI18n(q2); ctx.ready(); }, ctx.miss)); applyI18n(q2);
      }, ctx.miss);
      box.append(todo('e2_s4_todo'), h('div', { class: 'cols wide1' }, h('div', { class: 'panel' }, M.cv), h('div', { class: 'panel' }, h('h3', { k: 'e2_tb_t' }), tb, q1, q2)));
    },
    /* ⑤ 전체 과정을 영상으로 */
    function (box, ctx) {
      M.mode = 'free'; M.caption = '';
      var video = h('div', { class: 'vidout' }), rec = null, chunks = [], stopT = null;
      function initial() { M.reset(); M.each(function (p) { p.start = 'G'; }); M.caption = t('e2_cap_start'); }
      initial();
      function capBtn(k) { return btn('e2_capb_' + k, function () { M.caption = t('e2_cap_' + k); }, 'btn small'); }
      var demo = btn('e2_demo', function () {
        demo.disabled = true; M.mode = 'none'; initial();
        var Q = [
          [1200, function () { M.caption = t('e2_cap_filter'); }],
          [1400, function () { M.each(function (p) { if (!TY[p.type].big) M.move(p, 'B'); }); }],
          [2200, function () { M.caption = t('e2_cap_reab'); M.each(function (p) { M.move(p, p.rg === 'B' ? 'T' : 'C'); }); }],
          [1600, function () { var left = Object.assign({}, REAB); M.each(function (p) { if (p.rg === 'T' && left[p.type] > 0) { left[p.type]--; M.move(p, 'C'); } }); }],
          [2200, function () { M.caption = t('e2_cap_secr'); M.addWaste(); }],
          [1400, function () { M.each(function (p) { if (p.type === 'waste') M.move(p, 'T'); }); }],
          [2200, function () { M.caption = t('e2_cap_urine'); M.each(function (p) { M.move(p, p.rg === 'T' ? 'U' : 'OUT'); }); }],
          [2600, function () { demo.disabled = false; M.mode = 'free'; }]
        ];
        (function run(i) { if (i >= Q.length || !M.cv.isConnected) return; setTimeout(function () { Q[i][1](); run(i + 1); }, Q[i][0]); })(0);
      }, 'btn primary');
      var again = btn('e2_reset', function () { initial(); M.mode = 'free'; });
      /* 내 그림을 바탕으로 쓰기 */
      var file = h('input', { type: 'file', accept: 'image/*', class: 'hidden-file' });
      file.addEventListener('change', function () {
        var f = file.files && file.files[0]; if (!f) return;
        var img = new Image(); img.onload = function () { M.bg = img; baseBtn.hidden = false; }; img.src = URL.createObjectURL(f);
      });
      var pic = h('label', { class: 'btn' }, h('span', { k: 'e2_mypic' }), file);
      var baseBtn = btn('e2_basetoggle', function () { M.base = !M.base; }); baseBtn.hidden = true;
      /* 녹화: MP4가 되면 MP4, 안 되면 WebM */
      var types = ['video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm'], mime = '';
      if (window.MediaRecorder && M.cv.captureStream) for (var i = 0; i < types.length; i++) if (MediaRecorder.isTypeSupported(types[i])) { mime = types[i]; break; }
      var recBtn = btn('e2_rec', function () {
        if (rec) { rec.stop(); return; }
        chunks = []; video.innerHTML = '';
        try { rec = new MediaRecorder(M.cv.captureStream(30), { mimeType: mime }); } catch (e) { toast(t('e2_norec'), 'bad'); return; }
        rec.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
        rec.onstop = function () {
          clearTimeout(stopT); rec = null; recBtn.setAttribute('data-k', 'e2_rec'); recBtn.textContent = t('e2_rec'); recBtn.classList.remove('rec');
          var ext = mime.indexOf('mp4') >= 0 ? 'mp4' : 'webm', blob = new Blob(chunks, { type: mime.split(';')[0] }), url = URL.createObjectURL(blob);
          var a = h('a', { class: 'btn primary', href: url, download: 'excretion_' + (App.id || 'me') + '.' + ext }, h('span', { k: 'e2_save' }), ' (' + ext.toUpperCase() + ')');
          video.append(h('video', { src: url, controls: '', playsinline: '' }), a, note('e2_padlet')); applyI18n(video);
          App.send({ action: 'answer', act: 'e2', key: 'video', text: 'recorded ' + ext });
        };
        rec.start(500); recBtn.setAttribute('data-k', 'e2_stop'); recBtn.textContent = t('e2_stop'); recBtn.classList.add('rec');
        stopT = setTimeout(function () { if (rec) rec.stop(); }, 60000);
      }, 'btn primary');
      var tools = h('div', { class: 'panel' }, note('e2_s5_how', 'strong'), h('div', { class: 'row' }, demo, again),
        h('div', { class: 'row' }, ['filter', 'reab', 'secr', 'urine'].map(capBtn)), h('div', { class: 'row' }, pic, baseBtn),
        mime ? h('div', { class: 'row' }, recBtn) : note('e2_norec', 'warn'), video);
      var fin = h('div', {}, btn('finish', function () { App.send({ action: 'answer', act: 'e2', key: 'summary', text: t('e2_summary') }); ctx.finish(); }, 'btn primary big'));
      box.append(todo('e2_s5_todo'), h('div', { class: 'cols wide1' }, h('div', { class: 'panel' }, M.cv), tools), note('e2_summary', 'result'), fin);
    }
  ] };
})();
