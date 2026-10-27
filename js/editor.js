/* 픽셀 아이템 그리기 도구 (옷장 → 새로 그리기) */
var Editor = {
  open: function (slot) {
    var sz = PIX.SLOT[slot], W = sz[0], H = sz[1], data = new Array(W * H).fill(0), color = 1, tool = 'pen', undo = [], guide = slotGuide(slot);
    var grid = h('div', { class: 'pgrid', style: 'grid-template-columns:repeat(' + W + ',1fr);aspect-ratio:' + W + '/' + H + ';width:min(100%, calc(52vh * ' + (W / H).toFixed(3) + '))' });
    for (var i = 0; i < W * H; i++) grid.append(h('i', { class: guide[Math.floor(i / W)][i % W] ? 'g' : '' }));
    var cells = grid.children, prev = h('div', { class: 'ed-prev' });
    function pxStr() { return data.map(function (n) { return n.toString(16); }).join(''); }
    function cellPaint(i) { var n = data[i]; cells[i].style.background = n ? CFG.PALETTE[n] : ''; cells[i].classList.toggle('on', !!n); }
    function refresh() { prev.innerHTML = ''; var lk = App.look(); lk.eq[slot] = pxStr(); prev.append(charCanvas(lk, { stage: App.stage(), mood: 'happy', scale: 6 })); }
    function at(e) { var r = grid.getBoundingClientRect(), x = Math.floor((e.clientX - r.left) / r.width * W), y = Math.floor((e.clientY - r.top) / r.height * H); return x >= 0 && x < W && y >= 0 && y < H ? y * W + x : -1; }
    function fill(i0, to) {
      var from = data[i0]; if (from === to) return; var st = [i0];
      while (st.length) { var i = st.pop(); if (data[i] !== from) continue; data[i] = to; cellPaint(i); var x = i % W, y = Math.floor(i / W);
        if (x > 0) st.push(i - 1); if (x < W - 1) st.push(i + 1); if (y > 0) st.push(i - W); if (y < H - 1) st.push(i + W); }
    }
    var down = false;
    grid.addEventListener('pointerdown', function (e) {
      e.preventDefault(); var i = at(e); if (i < 0) return; undo.push(data.slice()); if (undo.length > 30) undo.shift();
      if (tool === 'fill') { fill(i, color); refresh(); return; }
      down = true; grid.setPointerCapture(e.pointerId); data[i] = color; cellPaint(i);
    });
    grid.addEventListener('pointermove', function (e) { if (!down) return; var i = at(e); if (i >= 0 && data[i] !== color) { data[i] = color; cellPaint(i); } });
    function up() { if (down) { down = false; refresh(); } }
    grid.addEventListener('pointerup', up); grid.addEventListener('pointercancel', up);

    var pal = h('div', { class: 'palette' });
    CFG.PALETTE.forEach(function (c, n) {
      var b = h('button', { type: 'button', class: 'sw' + (n === 0 ? ' eraser' : ''), style: n ? 'background:' + c : '', 'aria-label': n ? c : t('ed_eraser'), 'aria-pressed': String(n === color) });
      b.addEventListener('click', function () { color = n; [].forEach.call(pal.children, function (x) { x.setAttribute('aria-pressed', x === b); }); });
      pal.append(b);
    });
    var tools = h('div', { class: 'row' });
    [['pen', 'ed_pen'], ['fill', 'ed_fill']].forEach(function (x) {
      var b = h('button', { type: 'button', class: 'btn small', k: x[1], 'aria-pressed': String(tool === x[0]) });
      b.addEventListener('click', function () { tool = x[0]; [].forEach.call(tools.querySelectorAll('[data-tool]'), function (y) { y.setAttribute('aria-pressed', y === b); }); });
      b.setAttribute('data-tool', x[0]); tools.append(b);
    });
    tools.append(btn('ed_undo', function () { if (!undo.length) return; data = undo.pop(); for (var i = 0; i < data.length; i++) cellPaint(i); refresh(); }, 'btn small'),
      btn('ed_clear', function () { undo.push(data.slice()); data.fill(0); for (var i = 0; i < data.length; i++) cellPaint(i); refresh(); }, 'btn small'));
    var msg = h('p', { class: 'formmsg' }), confirmBox = h('div', { class: 'confirm', hidden: '' });
    var submit = btn('ed_submit', function () {
      if (!data.some(function (n) { return n; })) { msg.textContent = t('ed_empty'); return; }
      confirmBox.hidden = false; submit.hidden = true;
    }, 'btn primary big');
    confirmBox.append(h('p', { class: 'note strong' }, h('span', { k: 'ed_confirm' }), h('b', { dir: 'ltr' }, ' 🪙 ' + App.st.rules.price)),
      h('div', { class: 'row' }, btn('ed_yes', function () {
        confirmBox.querySelectorAll('button').forEach(function (b) { b.disabled = true; });
        App.send({ action: 'draw', slot: slot, px: pxStr() }).then(function (r) {
          if (!r.ok) { msg.textContent = App.errMsg(r); confirmBox.querySelectorAll('button').forEach(function (b) { b.disabled = false; }); return; }
          m.remove(); toast(t('ed_sent')); App.home('closet');
        });
      }, 'btn primary'), btn('ed_no', function () { confirmBox.hidden = true; submit.hidden = false; }, 'btn')));
    var m = h('div', { class: 'modal' }, h('div', { class: 'editor' },
      h('header', { class: 'ed-head' }, h('h2', {}, h('span', { k: 'slot_' + slot }), ' · ', h('span', { k: 'item_new' })), btn('close', function () { m.remove(); }, 'btn ghost small')),
      h('div', { class: 'ed-body' }, h('div', { class: 'ed-left' }, todo('ed_todo'), grid, tools, pal), h('div', { class: 'ed-right' }, prev, note('ed_guide'), submit, confirmBox, msg))));
    document.body.append(m); applyI18n(m); refresh();
  }
};
