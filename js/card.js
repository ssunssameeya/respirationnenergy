/* 기관계 정리 카드: 문장 대신 경로 도식과 표로 한 장에 정리해서 그림 파일로 저장합니다. */
(function () {
  var W = 1200, PAD = 50, INK = '#3b2a2c', FONT = '"Noto Sans KR","Malgun Gothic",sans-serif';
  var COL = { dig: '#f2a900', cir: '#e53935', res: '#3f7fd6', exc: '#8e24aa', cel: '#2f7d4f' };
  function Pen(g) { this.g = g; }
  Pen.prototype = {
    font: function (sz, bold) { this.g.font = (bold ? '700 ' : '400 ') + sz + 'px ' + FONT; },
    /* 칸 안에 글자 맞추기: 크기를 줄이다가 그래도 넘치면 여러 줄 */
    text: function (s, x, y, w, sz, opt) {
      var g = this.g; opt = opt || {}; s = String(s); sz = sz || 24;
      this.font(sz, opt.bold); while (sz > (opt.min || 15) && g.measureText(s).width > w) { sz--; this.font(sz, opt.bold); }
      var lines = [], cur = '';
      if (g.measureText(s).width <= w) lines = [s];
      else { s.split(/(\s+)/).forEach(function (wd) { if (g.measureText(cur + wd).width > w && cur.trim()) { lines.push(cur.trim()); cur = wd; } else cur += wd; }); if (cur.trim()) lines.push(cur.trim());
        lines = lines.reduce(function (a, ln) { if (g.measureText(ln).width <= w) { a.push(ln); return a; } var c2 = ''; ln.split('').forEach(function (ch) { if (g.measureText(c2 + ch).width > w) { a.push(c2); c2 = ch; } else c2 += ch; }); a.push(c2); return a; }, []); }
      var lh = sz * 1.25, y0 = opt.top ? y : y - (lines.length - 1) * lh / 2;
      g.fillStyle = opt.color || INK; g.textAlign = opt.align || 'center'; g.textBaseline = 'middle';
      lines.forEach(function (ln, i) { g.fillText(ln, opt.align === 'left' ? x : x + (opt.align === 'right' ? 0 : 0), y0 + i * lh); });
      return lines.length * lh;
    },
    box: function (x, y, w, hh, label, fill, sz) {
      var g = this.g; g.fillStyle = fill || '#fff'; g.strokeStyle = INK; g.lineWidth = 3;
      g.beginPath(); if (g.roundRect) g.roundRect(x, y, w, hh, 14); else g.rect(x, y, w, hh); g.fill(); g.stroke();
      if (label) this.text(label, x + w / 2, y + hh / 2, w - 16, sz || 24, { bold: true });
    },
    arrow: function (x1, y1, x2, y2, col, wd) {
      var g = this.g, a = Math.atan2(y2 - y1, x2 - x1), hl = 14; col = col || INK; wd = wd || 4;
      g.strokeStyle = col; g.fillStyle = col; g.lineWidth = wd; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2 - hl * Math.cos(a), y2 - hl * Math.sin(a)); g.stroke();
      g.beginPath(); g.moveTo(x2, y2); g.lineTo(x2 - hl * Math.cos(a) + 7 * Math.sin(a), y2 - hl * Math.sin(a) - 7 * Math.cos(a)); g.lineTo(x2 - hl * Math.cos(a) - 7 * Math.sin(a), y2 - hl * Math.sin(a) + 7 * Math.cos(a)); g.closePath(); g.fill();
    },
    sec: function (y, label, col) {                  // 구역 제목
      var g = this.g; g.fillStyle = col; g.fillRect(PAD, y, 10, 34); this.text(label, PAD + 22, y + 17, W - 2 * PAD, 28, { bold: true, align: 'left' }); return y + 52;
    },
    /* 표: rows[0]이 제목줄. 각 칸 높이는 글자에 맞춰 늘어남 */
    table: function (x, y, widths, rows, headFill) {
      var g = this.g, self = this, yy = y;
      rows.forEach(function (r, ri) {
        var hh = 56; self.font(20, ri === 0);
        r.forEach(function (c, ci) { var n = Math.ceil(g.measureText(String(c)).width / (widths[ci] - 20)); hh = Math.max(hh, Math.min(4, n) * 26 + 22); });
        var xx = x;
        r.forEach(function (c, ci) {
          g.fillStyle = ri === 0 ? headFill : ci === 0 ? '#fbf3e6' : '#fff'; g.strokeStyle = INK; g.lineWidth = 2; g.fillRect(xx, yy, widths[ci], hh); g.strokeRect(xx, yy, widths[ci], hh);
          self.text(c, xx + widths[ci] / 2, yy + hh / 2, widths[ci] - 20, 20, { bold: ri === 0 || ci === 0, min: 19 });
          xx += widths[ci];
        });
        yy += hh;
      });
      return yy;
    },
    flow: function (y, keys, col, bw, hh) {          // 가로 경로: 상자 → 상자 → …
      var n = keys.length, gap = 34; bw = bw || Math.min(170, (W - 2 * PAD - gap * (n - 1)) / n); hh = hh || 70;
      var x0 = (W - (n * bw + (n - 1) * gap)) / 2, self = this, pos = [];
      keys.forEach(function (k, i) { var x = x0 + i * (bw + gap); self.box(x, y, bw, hh, t(k), '#fff'); pos.push(x); if (i) self.arrow(x - gap + 2, y + hh / 2, x - 2, y + hh / 2, col, 4); });
      return pos;
    }
  };
  function T(k) { return t(k); }
  /* ---------- 기관계별 그림 ---------- */
  var DRAW = {
    dig: function (p, y) {
      var c = COL.dig;
      y = p.sec(y, T('card_dig_path'), c);
      var pos = p.flow(y, ['d2_o_mouth', 'd2_o_eso', 'd2_o_stom', 'd2_o_small', 'd2_o_large', 'd2_o_anus'], c, 150, 64);
      var gy = y + 130;                              // 소화샘 → 소화관
      [[pos[0], pos[0], 'd2_o_saliv', 'j_saliva'], [pos[3] - 175, pos[3], 'card_liver_gall', 'e_bile'], [pos[3] + 25, pos[3], 'd2_o_panc', 'j_panc']].forEach(function (x) {
        p.box(x[0], gy, 150, 56, T(x[2]), '#fff3c4', 22);                       // 소화샘 상자 → 소화액이 들어가는 소화관
        p.arrow(x[0] + 75, gy, x[1] + 75 + (x[0] < x[1] ? -25 : x[0] > x[1] ? 25 : 0), y + 66, '#b07d00', 3);
        p.text(T(x[3]), x[0] + 75, gy + 76, 170, 18, { color: '#7a5d00', bold: true });
      });
      y = gy + 120;
      y = p.sec(y, T('card_dig_enz'), c);
      y = p.table(PAD, y, [150, 180, 170, 360, 240], [
        [T('card_nut'), T('d4_w_mouth'), T('d4_w_stom'), T('d4_w_small'), T('card_final')],
        [T('n_starch'), T('e_amyl') + ' (' + T('j_saliva') + ')', '-', T('e_amyl') + ' (' + T('j_panc') + '), ' + T('d4_e_small'), T('p_glu')],
        [T('n_protein'), '-', T('e_pep') + ' (' + T('j_gastric') + ')', T('e_tryp') + ' (' + T('j_panc') + '), ' + T('d4_e_small'), T('p_amino')],
        [T('n_fat'), '-', '-', T('e_lip') + ' (' + T('j_panc') + ') + ' + T('e_bile'), T('p_fatty')]
      ], '#ffe8a6') + 30;
      y = p.sec(y, T('card_dig_abs'), c);
      p.box(PAD, y, 520, 70, T('card_abs_cap'), '#fde4e4', 22); p.box(W - PAD - 520, y, 520, 70, T('card_abs_lac'), '#fff3c4', 22);
      y += 100;
      y = p.sec(y, T('card_dig_test'), c);
      return p.table(PAD, y, [200, 640, 260], [[T('card_nut'), T('d1_m_sol'), T('d1_m_col')],
        [T('n_starch'), T('d1_rs_starch'), T('c_navy')], [T('n_protein'), T('d1_rs_protein'), T('c_purple')], [T('n_fat'), T('d1_rs_fat'), T('c_red')], [T('n_sugar'), T('d1_rs_sugar'), T('c_orange')]], '#ffe8a6');
    },
    cir: function (p, y) {
      var c = COL.cir, g = p.g;
      y = p.sec(y, T('card_cir_loop'), c);
      var ly = y;                                    // 왼쪽: 순환 모식도 (js/shared.js loopSvg, 그림으로 넣기)
      p.tasks.push(function () { return new Promise(function (res) { var im = new Image(); im.onload = function () { g.drawImage(im, PAD, ly, 450, 600); res(); }; im.onerror = res; im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(loopSvg()); }); });
      var x = PAD + 520, w = W - x - PAD;
      p.box(x, y, w, 46, T('c3_sys'), '#fde4ec', 24);
      ['h_lv', 'h_ao', 'c3_bodycap', 'h_vc', 'h_ra'].forEach(function (k, i) { p.text((i + 1) + '. ' + T(k), x + 20, y + 80 + i * 40, w - 30, 22, { align: 'left' }); });
      var y2 = y + 300;
      p.box(x, y2, w, 46, T('c3_pul'), '#e3f4e7', 24);
      ['h_rv', 'h_pa', 'c3_lungcap', 'h_pv', 'h_la'].forEach(function (k, i) { p.text((i + 1) + '. ' + T(k), x + 20, y2 + 80 + i * 40, w - 30, 22, { align: 'left' }); });
      y += 620;
      y = p.sec(y, T('card_cir_ves'), c);
      y = p.table(PAD, y, [220, 290, 290, 300], [[T('card_kind'), T('c2_v_a'), T('c2_v_c'), T('c2_v_v')],
        [T('card_dir'), T('card_a_dir'), T('card_c_dir'), T('card_v_dir')],
        [T('card_wall'), T('card_a_wall'), T('card_c_wall'), T('card_v_wall')]], '#ffd6d1') + 30;
      y = p.sec(y, T('c2_blood_t'), c);
      return p.table(PAD, y, [220, 880], [[T('card_part'), T('card_role')], [T('c2_plasma'), T('c2_role_plasma')], [T('c2_rbc'), T('c2_role_rbc')], [T('c2_wbc'), T('c2_role_wbc')], [T('c2_plt'), T('c2_role_plt')]], '#ffd6d1');
    },
    res: function (p, y) {
      var c = COL.res;
      y = p.sec(y, T('card_res_path'), c);
      var pos = p.flow(y, ['r_nose', 'r_trach', 'r_bron', 'r_alv'], c, 200, 70);
      var ax = pos[3] + 100, ay = y + 110;            // 허파꽈리 ↔ 모세혈관 기체 교환
      p.box(ax - 140, ay + 40, 280, 60, T('r1_cap'), '#fde4e4', 22);
      p.arrow(ax - 40, y + 72, ax - 40, ay + 38, '#1e88e5', 4); p.text(T('c3_o2'), ax - 120, ay + 6, 140, 20, { color: '#1e88e5', bold: true });
      p.arrow(ax + 40, ay + 38, ax + 40, y + 72, '#616161', 4); p.text(T('c3_co2'), ax + 130, ay + 6, 180, 20, { color: '#616161', bold: true });
      p.text(T('card_res_ex'), PAD + 260, ay + 60, 560, 22, { align: 'center' });
      y = ay + 140;
      y = p.sec(y, T('card_res_move'), c);
      return p.table(PAD, y, [170, 150, 150, 170, 150, 170, 140], [
        ['', T('r_dia'), T('r_rib'), T('r3_vc'), T('r3_vl'), T('r3_pl'), T('card_air')],
        [T('r3_in_t'), T('r3_down2'), T('r3_up2'), T('r3_big'), T('r3_big'), T('r3_lower'), T('r3_in')],
        [T('r3_out_t'), T('r3_up2'), T('r3_down2'), T('r3_small'), T('r3_small'), T('r3_higher'), T('r3_out')]], '#d6e6fb');
    },
    exc: function (p, y) {
      var c = COL.exc;
      y = p.sec(y, T('card_exc_path'), c);
      p.flow(y, ['x_kid', 'x_pelvis', 'x_ure', 'x_blad', 'x_uret'], c, 180, 70); y += 110;
      y = p.sec(y, T('card_exc_waste'), c);
      p.flow(y, ['n_protein', 'e1_amm', 'e1_urea', 'e2_u'], c, 200, 64);
      p.text(T('e1_liver'), 600 - 8, y + 96, 200, 20, { color: '#7a5d00', bold: true }); y += 140;
      y = p.sec(y, T('card_exc_neph'), c);
      return p.table(PAD, y, [200, 360, 540], [[T('card_proc'), T('card_route'), T('card_subs')],
        [T('qz_x_filter'), T('e2_g') + ' → ' + T('e2_b'), T('card_f_subs')],
        [T('qz_x_reab'), T('e2_t') + ' → ' + T('e2_c'), T('card_r_subs')],
        [T('qz_x_secr'), T('e2_c') + ' → ' + T('e2_t'), T('card_s_subs')]], '#ead6f2');
    },
    cel: function (p, y) {
      var c = COL.cel;
      y = p.sec(y, T('card_cel_eq'), c);
      function eqRow(keys, yy) {                     // 상자 + 상자 (+ 상자)
        var bw = 230, gap = 60, x0 = (W - (keys.length * bw + (keys.length - 1) * gap)) / 2;
        keys.forEach(function (k, i) { p.box(x0 + i * (bw + gap), yy, bw, 70, T(k), k === 's1_energy' ? '#fff3c4' : '#fff'); if (i) p.text('+', x0 + i * (bw + gap) - gap / 2, yy + 35, 40, 40, { bold: true }); });
      }
      eqRow(['s1_nut', 'c3_o2'], y);
      y += 90; p.arrow(W / 2, y, W / 2, y + 50, c, 5); p.text(T('card_mito'), W / 2 + 170, y + 25, 300, 20, { color: c, bold: true }); y += 70;
      eqRow(['e2_water', 'c3_co2', 's1_energy'], y); y += 110;
      y = p.sec(y, T('card_cel_sys'), c);
      [['s3_sys_dig', 's3_role_dig'], ['s3_sys_res', 's3_role_res'], ['s3_sys_cir', 's3_role_cir'], ['s3_sys_exc', 's3_role_exc'], ['s3_sys_cel', 's3_role_cel']].forEach(function (r, i) {
        p.box(PAD, y + i * 80, 260, 64, T(r[0]), ['#fff3c4', '#d6e6fb', '#fde4e4', '#ead6f2', '#d8f0dd'][i], 24);
        p.text(T(r[1]), PAD + 290, y + i * 80 + 32, W - 2 * PAD - 300, 22, { align: 'left' });
      });
      y += 5 * 80 + 20;
      y = p.sec(y, T('s1_use_t'), c);
      var uses = ['s1_use_heat', 's1_use_brain', 's1_use_voice', 's1_use_muscle', 's1_use_grow'];
      uses.forEach(function (k, i) { p.box(PAD + i * 222, y, 200, 60, T(k), '#d8f0dd', 22); });
      return y + 80;
    }
  };
  Body.card = function (sys) {
    var me = App.me, c = document.createElement('canvas'), g;
    c.width = W; c.height = 2600; g = c.getContext('2d');          // 넉넉히 그린 뒤 내용 길이에 맞춰 자름
    g.fillStyle = '#fffaf0'; g.fillRect(0, 0, W, c.height);
    g.fillStyle = COL[sys]; g.fillRect(0, 0, W, 110);
    var p = new Pen(g); p.tasks = [];
    p.text(t('sys_' + sys) + ' ' + t('sum_card'), PAD, 56, W - 2 * PAD, 46, { bold: true, align: 'left', color: '#fff' });
    var end = DRAW[sys](p, 140) + 30;
    p.text(App.id + ' ' + me.nick + ' · ' + App.today(), PAD, end + 10, W - 2 * PAD, 20, { align: 'left', color: '#7a5230' });
    var full = c; c = document.createElement('canvas'); c.width = W; c.height = end + 50;
    c.className = 'cardimg';
    Promise.all(p.tasks.map(function (f) { return f(); })).then(function () {
      c.getContext('2d').drawImage(full, 0, 0);
      var m = h('div', { class: 'modal' }, h('div', { class: 'reward wide' }, h('h2', {}, t('sys_' + sys) + ' ' + t('sum_card')), c,
        h('div', { class: 'row' }, btn('download', function () { downloadCanvas(c, 'tunt6_' + sys + '_' + App.id + '.png'); }, 'btn primary'), btn('close', function () { m.remove(); }))));
      document.body.append(m); applyI18n(m);
    });
  };
})();
