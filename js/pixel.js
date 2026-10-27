/* 픽셀 캐릭터: 32×44칸. 머리(14×12)는 모든 단계에서 같고 몸만 자랍니다.
   아이템 칸: 머리카락 16×12, 헤어 아이템 16×8 (머리에 고정) / 옷 16×14, 신발 16×4 (몸 크기에 맞춰 늘어남)
   아이템 데이터 = 16진수 글자열 ('0' 투명, '1'~'f' 팔레트 번호) */
(function () {
  var W = 32, H = 44;
  var SLOT = { hair: [16, 12], acc: [16, 8], cloth: [16, 14], shoe: [16, 4] };
  var BODY = [                                        // 단계별 몸통 너비·높이, 다리 길이
    { tw: 8, th: 4, lh: 3 }, { tw: 9, th: 5, lh: 5 }, { tw: 10, th: 7, lh: 7 }, { tw: 11, th: 9, lh: 9 }, { tw: 12, th: 10, lh: 12 }];
  var KIND = {
    f: { skin: '#f6cfae', hair: '#6b3e1f', shirt: '#ec6f98', pants: '#3f51b5', shoe: '#5d4037' },
    m: { skin: '#f2c6a0', hair: '#2b2b2b', shirt: '#2f86d6', pants: '#37474f', shoe: '#3e2723' },
    a: { skin: '#8fd46b', hair: '', shirt: '#9aa8b5', pants: '#5c6b78', shoe: '#455a64' }
  };
  function layout(stage) {
    var b = BODY[Math.max(0, Math.min(4, stage - 1))];
    var legTop = H - b.lh, torsoTop = legTop - b.th, headTop = torsoTop - 12, tx = 16 - Math.ceil(b.tw / 2);
    return { b: b, legTop: legTop, torsoTop: torsoTop, headTop: headTop, tx: tx, hx: 9 };
  }
  function grid() { var g = []; for (var y = 0; y < H; y++) { g.push(new Array(W).fill(null)); } return g; }
  function put(g, x, y, c) { if (c && x >= 0 && x < W && y >= 0 && y < H) g[y][x] = c; }
  function rect(g, x, y, w, h, c) { for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) put(g, x + i, y + j, c); }
  function pal(ch) { var n = parseInt(ch, 16); return n ? CFG.PALETTE[n] : null; }
  function stamp(g, px, sw, sh, x0, y0, w, h) {       // 아이템을 (x0,y0) 위치 w×h 크기로 찍기 (가장 가까운 칸으로 늘림)
    for (var ty = 0; ty < h; ty++) for (var tx2 = 0; tx2 < w; tx2++) {
      var sx = Math.floor(tx2 * sw / w), sy = Math.floor(ty * sh / h);
      put(g, x0 + tx2, y0 + ty, pal(px.charAt(sy * sw + sx)));
    }
  }
  function boxes(L) {                                  // 아이템이 놓일 자리
    var b = L.b;
    return {
      hair: [L.hx - 1, L.headTop - 2, 16, 12], acc: [L.hx - 1, L.headTop - 5, 16, 8],
      cloth: [L.tx - 1, L.torsoTop, b.tw + 2, b.th + b.lh - 2], shoe: [L.tx - 1, H - (b.lh >= 7 ? 3 : 2), b.tw + 2, b.lh >= 7 ? 3 : 2]
    };
  }
  function face(g, L, k, mood) {
    var x = L.hx, y = L.headTop, eye = k === 'a' ? '#111' : '#2b2b2b';
    if (mood === 'sick') {
      rect(g, x + 3, y + 6, 3, 1, eye); rect(g, x + 8, y + 6, 3, 1, eye);
      put(g, x + 5, y + 9, '#7a3b2e'); put(g, x + 6, y + 10, '#7a3b2e'); put(g, x + 7, y + 9, '#7a3b2e'); put(g, x + 8, y + 10, '#7a3b2e');
      return;
    }
    if (k === 'a') { rect(g, x + 2, y + 4, 3, 4, eye); rect(g, x + 9, y + 4, 3, 4, eye); put(g, x + 2, y + 4, '#fff'); put(g, x + 9, y + 4, '#fff'); }
    else if (mood === 'happy') { put(g, x + 3, y + 6, eye); put(g, x + 4, y + 5, eye); put(g, x + 5, y + 6, eye); put(g, x + 8, y + 6, eye); put(g, x + 9, y + 5, eye); put(g, x + 10, y + 6, eye); }
    else { rect(g, x + 3, y + 5, 2, 2, eye); rect(g, x + 9, y + 5, 2, 2, eye); put(g, x + 3, y + 5, '#fff'); put(g, x + 9, y + 5, '#fff'); }
    rect(g, x + 1, y + 8, 2, 1, '#f48fb1'); rect(g, x + 11, y + 8, 2, 1, '#f48fb1');
    if (mood === 'happy') { rect(g, x + 5, y + 9, 4, 1, '#b23b3b'); rect(g, x + 6, y + 10, 2, 1, '#b23b3b'); }
    else { put(g, x + 5, y + 9, '#8d3b3b'); rect(g, x + 6, y + 10, 2, 1, '#8d3b3b'); put(g, x + 8, y + 9, '#8d3b3b'); }
  }
  function defaultHair(g, L, k) {
    var x = L.hx, y = L.headTop, c = KIND[k].hair;
    if (k === 'a') { put(g, x + 3, y - 1, '#5aa83f'); put(g, x + 2, y - 2, '#5aa83f'); put(g, x + 2, y - 3, '#ffd54f'); put(g, x + 10, y - 1, '#5aa83f'); put(g, x + 11, y - 2, '#5aa83f'); put(g, x + 11, y - 3, '#ffd54f'); return; }
    rect(g, x, y - 1, 14, 3, c); rect(g, x - 1, y, 2, 4, c); rect(g, x + 13, y, 2, 4, c);
    if (k === 'f') { rect(g, x - 1, y + 4, 2, 7, c); rect(g, x + 13, y + 4, 2, 7, c); rect(g, x + 2, y + 2, 4, 1, c); }
    else { rect(g, x + 4, y + 2, 5, 1, c); }
  }
  function build(look, opt) {
    opt = opt || {}; look = look || {}; var k = KIND[look.kind] ? look.kind : 'm', K = KIND[k], st = opt.stage || 1, L = layout(st), b = L.b, g = grid(), eq = look.eq || {}, B = boxes(L);
    var skin = opt.mood === 'sick' ? (k === 'a' ? '#b9d9a6' : '#e6d7c8') : K.skin;
    rect(g, L.tx - 2, L.torsoTop + 1, 2, b.th, skin); rect(g, L.tx + b.tw, L.torsoTop + 1, 2, b.th, skin);          // 팔
    var lw = Math.floor(b.tw / 2) - 1;
    rect(g, L.tx, L.legTop, lw, b.lh, st === 1 ? '#ffffff' : K.pants); rect(g, L.tx + b.tw - lw, L.legTop, lw, b.lh, st === 1 ? '#ffffff' : K.pants);
    if (st === 1) rect(g, L.tx, L.legTop, b.tw, 2, '#ffffff');
    rect(g, L.tx, L.torsoTop, b.tw, b.th, K.shirt);
    if (eq.cloth) stamp(g, eq.cloth, 16, 14, B.cloth[0], B.cloth[1], B.cloth[2], B.cloth[3]);
    var sb = B.shoe; if (eq.shoe) stamp(g, eq.shoe, 16, 4, sb[0], sb[1], sb[2], sb[3]); else { rect(g, L.tx, sb[1] + sb[3] - 1, lw + 1, 1, K.shoe); rect(g, L.tx + b.tw - lw - 1, sb[1] + sb[3] - 1, lw + 1, 1, K.shoe); }
    rect(g, L.hx, L.headTop, 14, 12, skin); rect(g, L.hx - 1, L.headTop + 2, 1, 8, skin); rect(g, L.hx + 14, L.headTop + 2, 1, 8, skin);
    face(g, L, k, opt.mood);
    if (eq.hair) stamp(g, eq.hair, 16, 12, B.hair[0], B.hair[1], 16, 12); else defaultHair(g, L, k);
    if (eq.acc) stamp(g, eq.acc, 16, 8, B.acc[0], B.acc[1], 16, 8);
    if (opt.mood === 'sick') { put(g, L.hx + 15, L.headTop + 2, '#4fc3f7'); put(g, L.hx + 15, L.headTop + 3, '#4fc3f7'); put(g, L.hx - 2, L.headTop + 5, '#4fc3f7'); put(g, L.hx - 2, L.headTop + 6, '#4fc3f7'); }
    return { g: g, L: L, B: B };
  }
  function paint(canvas, g, scale) {
    canvas.width = W * scale; canvas.height = H * scale;
    var x = canvas.getContext('2d'); x.imageSmoothingEnabled = false; x.clearRect(0, 0, canvas.width, canvas.height);
    for (var j = 0; j < H; j++) for (var i = 0; i < W; i++) if (g[j][i]) { x.fillStyle = g[j][i]; x.fillRect(i * scale, j * scale, scale, scale); }
  }
  /* 캐릭터 캔버스 만들기: charCanvas({kind, eq:{hair:'..',...}}, {stage, mood:'normal|happy|sick', scale}) */
  window.charCanvas = function (look, opt) {
    opt = opt || {}; var c = document.createElement('canvas'); c.className = 'pixchar';
    paint(c, build(look, opt).g, opt.scale || 6); return c;
  };
  window.charPaint = function (canvas, look, opt) { opt = opt || {}; paint(canvas, build(look, opt).g, opt.scale || 6); };
  window.PIX = { W: W, H: H, SLOT: SLOT, layout: layout, boxes: boxes, KIND: KIND };
  /* 그리기 도구에 보여 줄 밑그림: 해당 칸 크기의 배열 (true = 몸이 있는 자리) */
  window.slotGuide = function (slot) {
    var s = SLOT[slot], w = s[0], h = s[1], m = [], y, x;
    for (y = 0; y < h; y++) { m.push(new Array(w).fill(false)); }
    if (slot === 'hair') { for (y = 2; y < 12; y++) for (x = 1; x < 15; x++) m[y][x] = true; }
    if (slot === 'acc') { for (y = 5; y < 8; y++) for (x = 1; x < 15; x++) m[y][x] = true; }
    if (slot === 'cloth') { for (y = 0; y < 6; y++) for (x = 1; x < 15; x++) m[y][x] = true; for (y = 6; y < 14; y++) for (x = 1; x < 15; x++) if (x < 7 || x > 8) m[y][x] = true; }
    if (slot === 'shoe') { for (y = 0; y < 4; y++) for (x = 1; x < 15; x++) if (x < 7 || x > 8) m[y][x] = true; }
    return m;
  };
  window.stageOf = function (peak) { var L = CFG.LEVELS, n = 1; for (var i = 0; i < L.length; i++) if (peak >= L[i].need) n = i + 1; return Math.min(n, 5); };
})();
/* 아이템 하나만 그리기 (옷장·교사 페이지) */
function itemPaint(canvas, slot, px, scale) {
  var s = PIX.SLOT[slot], w = s[0], hh = s[1]; canvas.width = w * scale; canvas.height = hh * scale; canvas.className = 'itemcv';
  var x = canvas.getContext('2d'); x.imageSmoothingEnabled = false;
  for (var i = 0; i < w * hh; i++) { var n = parseInt(px.charAt(i), 16); if (n) { x.fillStyle = CFG.PALETTE[n]; x.fillRect((i % w) * scale, Math.floor(i / w) * scale, scale, scale); } }
}

