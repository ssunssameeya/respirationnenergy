/* 인체 탐험 탭: 인체 모형 하나에서 기관계 탭을 고르면 그 기관계만 강조되고, 기관을 눌러 활동에 들어갑니다. */
var BODY_SPOTS = {                                     // 활동 → 모형 위 위치(기관)와 이름표
  d1: { x: 180, y: 92, org: 'org_mouth' },   d2: { x: 228, y: 330, org: 'org_stomach' }, d3: { x: 152, y: 104, org: 'org_salivary' },
  d4: { x: 222, y: 372, org: 'org_pancreas' }, d5: { x: 185, y: 425, org: 'org_small' },
  c1: { x: 196, y: 250, org: 'org_heart' }, c2: { x: 282, y: 290, org: 'org_artery' }, c3: { x: 84, y: 330, org: 'org_vein' },
  r1: { x: 178, y: 150, org: 'org_trachea' }, r2: { x: 222, y: 225, org: 'org_lung' }, r3: { x: 180, y: 300, org: 'org_diaphragm' }, r4: { x: 130, y: 260, org: 'org_rib' },
  e1: { x: 137, y: 385, org: 'org_kidney' }, e2: { x: 223, y: 385, org: 'org_nephron' }, e3: { x: 180, y: 478, org: 'org_bladder' },
  s1: { x: 76, y: 380, org: 'org_cell' }, s2: { x: 150, y: 575, org: 'org_muscle' }, s3: { x: 180, y: 60, org: 'org_whole' }
};
function bodySVG() {
  var sk = '#f6cfae', o = 'stroke="#3b2a2c" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"';
  var ribs = ''; for (var i = 0; i < 5; i++) { var y = 175 + i * 24; ribs += '<path d="M180 ' + (y - 4) + ' Q130 ' + y + ' 108 ' + (y + 22) + ' M180 ' + (y - 4) + ' Q230 ' + y + ' 252 ' + (y + 22) + '" fill="none" stroke="#c9b9a8" stroke-width="5" stroke-linecap="round"/>'; }
  return '<svg class="bodysvg" viewBox="0 0 360 640" xmlns="http://www.w3.org/2000/svg">'
    /* 몸 */
    + '<g class="skin"><circle cx="180" cy="72" r="50" fill="' + sk + '" ' + o + '/><rect x="164" y="116" width="32" height="30" fill="' + sk + '"/>'
    + '<path d="M92 160 Q100 140 140 140 L220 140 Q260 140 268 160 L262 330 Q262 520 230 528 L130 528 Q98 520 98 330Z" fill="' + sk + '" ' + o + '/>'
    + '<path d="M92 160 Q62 170 58 220 L52 400 Q56 414 70 412 L84 250" fill="' + sk + '" ' + o + '/><path d="M268 160 Q298 170 302 220 L308 400 Q304 414 290 412 L276 250" fill="' + sk + '" ' + o + '/>'
    + '<path d="M132 526 L126 630 L168 630 L176 528 M228 526 L234 630 L192 630 L184 528" fill="' + sk + '" ' + o + '/>'
    + '<circle cx="164" cy="66" r="4" fill="#3b2a2c"/><circle cx="196" cy="66" r="4" fill="#3b2a2c"/></g>'
    /* 순환계 */
    + '<g class="sys sys-cir"><path d="M188 248 V150 M188 150 Q150 152 100 175 L70 395 M188 150 Q230 152 262 175 L292 395 M188 150 V110 M196 262 Q198 420 160 525 L150 625 M196 262 Q200 420 200 525 L210 625" fill="none" stroke="#e53935" stroke-width="5"/>'
    + '<path d="M176 252 V156 M176 156 Q140 160 106 182 L78 395 M176 156 Q222 160 254 182 L284 395 M176 156 V112 M184 268 Q186 420 150 525 L140 625 M184 268 Q190 420 190 525 L198 625" fill="none" stroke="#1e63c9" stroke-width="5"/>'
    + '<path d="M196 230 C214 214 236 232 222 252 L196 278 L172 252 C160 234 180 214 196 230Z" fill="#e53935" ' + o + '/></g>'
    /* 호흡계 */
    + '<g class="sys sys-res">' + ribs + '<path d="M168 76 L180 60 L192 76Z" fill="#f4a7a7" ' + o + '/>'
    + '<path d="M180 108 V192 M180 192 Q160 200 150 214 M180 192 Q200 200 210 214" fill="none" stroke="#b0bec5" stroke-width="10" stroke-linecap="round"/>'
    + '<path d="M170 170 Q118 168 112 230 Q108 288 126 300 Q156 302 172 290 Z" fill="#f48fb1" ' + o + '/><path d="M190 170 Q242 168 248 230 Q252 288 234 300 Q206 302 190 290 Z" fill="#f48fb1" ' + o + '/>'
    + '<path d="M108 312 Q180 272 252 312" fill="none" stroke="#8d6e63" stroke-width="7" stroke-linecap="round"/></g>'
    /* 소화계 */
    + '<g class="sys sys-dig"><ellipse cx="180" cy="94" rx="16" ry="7" fill="#e57373" ' + o + '/><ellipse cx="150" cy="102" rx="9" ry="7" fill="#ffd54f" ' + o + '/><ellipse cx="210" cy="102" rx="9" ry="7" fill="#ffd54f" ' + o + '/>'
    + '<path d="M188 100 Q192 200 214 300" fill="none" stroke="#ef9a9a" stroke-width="9" stroke-linecap="round"/>'
    + '<path d="M118 316 Q160 300 205 314 L196 356 Q150 364 122 342 Z" fill="#8d4f3a" ' + o + '/><ellipse cx="165" cy="354" rx="9" ry="7" fill="#7cb342" ' + o + '/>'
    + '<path d="M206 300 Q256 298 254 336 Q252 372 214 364 Q226 340 206 322 Z" fill="#f08a8a" ' + o + '/>'
    + '<path d="M170 372 Q200 360 240 366" fill="none" stroke="#ffca28" stroke-width="10" stroke-linecap="round"/>'
    + '<path d="M136 470 V392 H236 V466 Q228 478 186 478 V504" fill="none" stroke="#c48b5c" stroke-width="13" stroke-linejoin="round"/>'
    + '<path d="M150 404 H222 V416 H150 V428 H222 V440 H150 V452 H222" fill="none" stroke="#f3a68c" stroke-width="9" stroke-linejoin="round"/><circle cx="186" cy="507" r="4" fill="#5d4037"/></g>'
    /* 배설계 */
    + '<g class="sys sys-exc"><path d="M138 366 Q122 370 124 388 Q126 408 142 406 Q134 386 150 376 Q148 364 138 366Z" fill="#b5413b" ' + o + '/><path d="M222 366 Q238 370 236 388 Q234 408 218 406 Q226 386 210 376 Q212 364 222 366Z" fill="#b5413b" ' + o + '/>'
    + '<path d="M140 404 Q150 450 172 470 M220 404 Q210 450 188 470" fill="none" stroke="#e5a24a" stroke-width="5"/><ellipse cx="180" cy="478" rx="16" ry="12" fill="#ffcc80" ' + o + '/><path d="M180 490 V512" stroke="#e5a24a" stroke-width="5"/></g>'
    /* 세포호흡 */
    + '<g class="sys sys-cel"><circle cx="76" cy="380" r="13" fill="#b2ebf2" ' + o + '/><circle cx="76" cy="380" r="5" fill="#7e57c2"/><path d="M134 560 Q150 548 166 560 Q150 600 134 560Z" fill="#ef9a9a" ' + o + '/></g>'
    + '</svg>';
}
var Body = { sys: null };
App.draw_body = function (pane) {
  var me = App.me, open = App.st.open;
  if (!Body.sys) { Body.sys = 'dig'; for (var k in SYS) { if (SYS[k].some(function (a) { return open[a] !== 'locked' && !(me.done || {})[a]; })) { Body.sys = k; break; } } }
  var stage = h('div', { class: 'bodystage sel-' + Body.sys, html: bodySVG() });
  var tabs = h('div', { class: 'systabs' });
  Object.keys(SYS).forEach(function (k) {
    var done = SYS[k].filter(function (a) { return (me.done || {})[a]; }).length;
    tabs.append(h('button', { type: 'button', class: 'systab st-' + k, 'aria-pressed': String(Body.sys === k), on: { click: function () { Body.sys = k; App.home('body'); } } },
      h('span', { k: 'sys_' + k }), h('small', { dir: 'ltr' }, done + '/' + SYS[k].length)));
  });
  var list = h('ol', { class: 'actlist' });
  SYS[Body.sys].forEach(function (a, i) {
    var sp = BODY_SPOTS[a], st = open[a], mine = (me.done || {})[a];
    var spot = h('button', { type: 'button', class: 'bspot s-' + st + (mine ? ' mine' : ''), style: 'left:' + (sp.x / 360 * 100) + '%;top:' + (sp.y / 640 * 100) + '%', disabled: st === 'locked' ? '' : null, 'aria-label': t('t_' + a) },
      h('b', { dir: 'ltr' }, String(i + 1)), st === 'locked' ? h('span', { class: 'lock', 'aria-hidden': 'true' }, '🔒') : null);
    var go = function () { if (st !== 'locked') App.open(a); };
    spot.addEventListener('click', go); stage.append(spot);
    var li = h('li', { class: 's-' + st + (mine ? ' mine' : '') }, h('button', { type: 'button', disabled: st === 'locked' ? '' : null, on: { click: go } },
      h('span', { class: 'num', dir: 'ltr' }, String(i + 1)), h('span', { class: 'org', k: sp.org }), h('b', { k: 't_' + a }),
      h('span', { class: 'tag', k: st === 'locked' ? 'st_locked' : mine ? 'st_mine' : st === 'done' ? 'st_done' : 'st_open' })));
    list.append(li);
  });
  var sysDone = SYS[Body.sys].every(function (a) { return (me.done || {})[a]; });
  var card = btn('sum_card', function () { Body.card(Body.sys); }, 'btn primary'); if (!sysDone) { card.disabled = true; }
  pane.append(todo('todo_body'), tabs, h('div', { class: 'bodywrap' }, stage, h('aside', { class: 'bodyside' }, h('h2', { k: 'sys_' + Body.sys }), h('p', { class: 'note', k: 'sysdesc_' + Body.sys }), list, card, sysDone ? null : h('p', { class: 'hint', k: 'sum_card_hint' }))));
};
/* 기관계 정리 카드는 js/card.js (경로 도식과 표) */
