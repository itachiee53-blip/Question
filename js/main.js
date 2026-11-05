// หน้าจอ, การหมุนจอ, การควบคุม, ลูปเกม
const $ = id => document.getElementById(id);
const cv = $('fx'), bgc = $('bg'), ctx = cv.getContext('2d'), bg = bgc.getContext('2d'), mini = $('mini').getContext('2d');
let game = null, paused = false, scale = 1, vw = 960, lvSel = 0;
const unlocked = () => { try { return +localStorage.getItem('clay-unlock') || 0; } catch { return 0; } };
const starsOf = () => { try { return JSON.parse(localStorage.getItem('clay-stars')) || []; } catch { return []; } };
const isPortrait = () => matchMedia('(orientation: portrait)').matches;
const isTouch = matchMedia('(pointer: coarse)').matches;

// ---------- ขนาดจอ ----------
function resize() {
  const dpr = Math.min(2, devicePixelRatio || 1), w = innerWidth, h = innerHeight;
  for (const c of [cv, bgc]) { c.width = w * dpr; c.height = h * dpr; }
  scale = h / VIEW_H; vw = w / scale;
  for (const c of [ctx, bg]) c.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
  window.R3?.resize(w, h);
}
addEventListener('resize', resize); resize();

// ---------- หน้าเริ่ม ----------
function renderLevels() {
  $('levels').innerHTML = LEVELS.map((l, i) =>
    `<button class="lv${i === lvSel ? ' sel' : ''}" data-i="${i}" ${i > unlocked() ? 'disabled' : ''}>${i > unlocked() ? '🔒 ' : ''}<small>ด่าน ${i + 1} · ${FACTIONS[l.faction].name}</small>${l.name}<span class="st">${'★'.repeat(starsOf()[i] || 0)}${'☆'.repeat(3 - (starsOf()[i] || 0))}</span></button>`).join('');
}
$('levels').onclick = e => { const b = e.target.closest('.lv'); if (b && !b.disabled) { Sfx.init(); Sfx.play('click'); lvSel = +b.dataset.i; renderLevels(); } };
lvSel = Math.min(unlocked(), LEVELS.length - 1); renderLevels();

$('playBtn').onclick = () => (isTouch && !document.fullscreenElement ? ($('perm').hidden = false) : startGame(lvSel));
$('permYes').onclick = async () => {
  $('perm').hidden = true;
  try { await document.documentElement.requestFullscreen?.({ navigationUI: 'hide' }); await screen.orientation?.lock?.('landscape'); } catch {}
  startGame(lvSel); // ถ้าเครื่องไม่รองรับ (เช่น iPhone) จะมีหน้าเตือนให้หมุนจอเอง
};
$('permNo').onclick = () => { $('perm').hidden = true; startGame(lvSel); };

// ---------- โหลดโมเดล 3D ----------
$('playBtn').disabled = true; $('playBtn').textContent = 'กำลังโหลด 0%';
window.onModelProgress = k => ($('playBtn').textContent = `กำลังโหลด ${Math.round(k * 100)}%`);
window.onModelsReady = () => { $('playBtn').disabled = false; $('playBtn').textContent = '▶ เริ่มเกม'; resize(); };
window.onModelsError = () => { $('playBtn').textContent = 'โหลดโมเดลไม่สำเร็จ ลองรีเฟรช'; };
if (window.R3?.ready) window.onModelsReady();

// ---------- เริ่ม/จบเกม ----------
async function startGame(i) {
  $('playBtn').disabled = true; $('nextBtn').disabled = true;
  try { await R3.prepare(i, k => ($('playBtn').textContent = `โหลดศัตรู ${Math.round(k * 100)}%`)); } catch {}
  $('playBtn').disabled = false; $('nextBtn').disabled = false; $('playBtn').textContent = '▶ เริ่มเกม';
  game = new Game(i); paused = false; Sfx.music(true);
  game.onEnd = showEnd; game.onAnnounce = announce;
  announce(`ด่าน ${i + 1}: ${LEVELS[i].name}`, false, `ศัตรู: ${FACTIONS[LEVELS[i].faction].name}`);
  hints = i === 0 ? [[4, '⛏️ สร้างคนงานเพิ่ม = ได้ทองเร็วขึ้น'], [16, '🛡️ ตั้งรับไว้ก่อน รวมทัพให้เยอะแล้วกด ⚔️ บุก'], [32, '☄️ กดสกิลฝนดาวตกตอนศัตรูมาเป็นกลุ่ม'], [55, '🏰 อย่าลืมอัปเกรดฐานเมื่อทองเหลือ']] : [];
  document.body.classList.add('playing');
  $('start').hidden = $('end').hidden = $('pause').hidden = true; $('hud').hidden = false;
  setMode('defend'); buildShop(); $('upg').hidden = true; Sfx.init();
}

function showEnd(r) {
  Sfx.music(false);
  const win = r === 'win', last = game.lvIdx >= LEVELS.length - 1;
  if (win) try {
    localStorage.setItem('clay-unlock', Math.max(unlocked(), game.lvIdx + 1));
    const st = starsOf(); st[game.lvIdx] = Math.max(st[game.lvIdx] || 0, game.stars); localStorage.setItem('clay-stars', JSON.stringify(st));
  } catch {}
  $('endStars').textContent = win ? '★'.repeat(game.stars) + '☆'.repeat(3 - game.stars) : '';
  const newUnits = Object.values(UNITS).filter(u => u.lv === game.lvIdx + 1).map(u => u.icon + ' ' + u.name);
  const newSkill = Object.values(ABILITIES).filter(a => a.lv === game.lvIdx + 1).map(a => a.icon + ' ' + a.name);
  $('endIco').textContent = win ? '🏆' : '💥';
  $('endTitle').textContent = win ? 'ชนะแล้ว!' : 'ฐานแตก...';
  $('endText').textContent = win ? (last ? `คุณพิชิตทุกด่านแล้ว สุดยอด! (กำจัดศัตรู ${game.kills} ตัว)` : `ปลดล็อก: ${[...newUnits, ...newSkill].join(', ') || 'ด่านถัดไป'}`) : 'ลองเพิ่มคนงานให้ฟาร์มแร่เร็วขึ้น แล้วตั้งรับก่อนบุก';
  $('nextBtn').textContent = win && !last ? '▶ ด่านถัดไป' : '↻ เล่นอีกครั้ง';
  $('nextBtn').onclick = () => startGame(win && !last ? game.lvIdx + 1 : game.lvIdx);
  setTimeout(() => ($('end').hidden = false), 900);
}

function toMenu() {
  game = null; Sfx.music(false); document.body.classList.remove('playing');
  $('hud').hidden = $('end').hidden = $('pause').hidden = true; $('start').hidden = false;
  lvSel = Math.min(unlocked(), LEVELS.length - 1); renderLevels();
}
$('menuBtn').onclick = $('quitBtn').onclick = toMenu;
$('pauseBtn').onclick = () => { paused = true; $('pause').hidden = false; };
$('resumeBtn').onclick = () => { paused = false; $('pause').hidden = true; };

// ---------- ร้านทหาร + คำสั่ง ----------
// ---------- อัปเกรด ----------
function renderUpg() {
  if ($('upg').hidden || !game) return;
  const sig = JSON.stringify(game.upg[0]) + Object.keys(UPGRADES).map(k => game.gold[0] >= (Upg.cost(game, 0, k) ?? 1e9)).join();
  if (sig === renderUpg.sig) return; renderUpg.sig = sig; // สร้างใหม่เฉพาะตอนเปลี่ยน → ปุ่มกดติดชัวร์
  $('upg').innerHTML = Object.entries(UPGRADES).map(([k, u]) => {
    const l = game.upg[0][k], c = Upg.cost(game, 0, k);
    return `<button class="up${c == null ? ' max' : game.gold[0] < c ? ' poor' : ''}" data-k="${k}"><span class="i">${u.icon}</span>
      <div>${u.name} <span class="lvl">${'★'.repeat(l)}${'☆'.repeat(3 - l)}</span><small>${u.desc}</small></div><b>${c == null ? 'เต็ม' : '🪙' + c}</b></button>`;
  }).join('');
}
$('upgBtn').onclick = () => { Sfx.play('click'); $('upg').hidden = !$('upg').hidden; renderUpg.sig = ''; renderUpg(); };
$('upg').onclick = e => {
  const b = e.target.closest('.up'); if (!b) return;
  if (Upg.buy(game, 0, b.dataset.k)) { Sfx.play('upgrade'); game.text(game.bases[0].x, GROUND - 240, 'อัปเกรด!', '#ffd84a'); } else Sfx.play('deny');
  renderUpg();
};
const muteIcon = () => ($('muteBtn').innerHTML = `<i class="ic">${Sfx.on ? ICON.sound : ICON.mute}</i>`);
$('muteBtn').onclick = () => { Sfx.toggle(); muteIcon(); Sfx.music(!!game && Sfx.on); Sfx.play('click'); };
muteIcon();
document.querySelectorAll('[data-ic]').forEach(e => (e.innerHTML = ICON[e.dataset.ic]));
addEventListener('pointerdown', () => Sfx.init(), { once: true });
addEventListener('pointerdown', () => Sfx.ctx?.state === 'suspended' && Sfx.ctx.resume());

const PLAYER_UNITS = Object.keys(UNITS).filter(k => UNITS[k].icon);
function buildShop() {
  const pic = k => window.R3?.portraits?.[k] ? `<img src="${R3.portraits[k]}" alt="">` : `<span class="emo">${UNITS[k].icon}</span>`;
  $('shop').innerHTML = PLAYER_UNITS.map((k, i) => { const u = UNITS[k], lock = !game.unlocked(k);
    return `<button class="unit${lock ? ' lock' : ''}" data-u="${k}" title="${u.name}"><span class="pic">${pic(k)}</span><span class="cost"><i class="ic">${ICON.coin}</i>${u.cost}</span><span class="key">${i + 1}</span><span class="q" hidden></span><span class="prog"></span>${lock ? `<span class="lk"><i class="ic">${ICON.lock}</i>ด่าน ${u.lv + 1}</span>` : ''}</button>`; }).join('');
  $('skills').innerHTML = Object.entries(ABILITIES).map(([k, a]) =>
    `<button class="skill s-${k}${a.lv > game.lvIdx ? ' lock' : ''}" data-s="${k}" title="${a.name}: ${a.desc}"><i class="ic">${ICON[k]}</i><span class="cd" hidden></span>${a.lv > game.lvIdx ? `<span class="lk"><i class="ic">${ICON.lock}</i></span>` : ''}</button>`).join('');
  $('shMe').innerHTML = ICON.shield(TEAM[0].color); $('shFoe').innerHTML = ICON.shield(TEAM[1].color);
  const c = TEAM[1].color, lum = [1, 3, 5].reduce((a, i, j) => a + parseInt(c.slice(i, i + 2), 16) * [.3, .59, .11][j], 0);
  $('hpFoe').style.backgroundColor = lum < 90 ? '#c0504a' : c; // สีเผ่ามืดเกิน → ใช้แดง
}
$('skills').onclick = e => {
  const b = e.target.closest('.skill'); if (!b || !game) return;
  if (b.classList.contains('lock')) return UI_toast(`ปลดล็อกที่ด่าน ${ABILITIES[b.dataset.s].lv + 1}`);
  if (!game.useAbility(b.dataset.s)) Sfx.play('deny');
};

// ---------- ประกาศกลางจอ / คำแนะนำ ----------
let hints = [], bannerT;
function announce(msg, big, sub) {
  const b = $('banner'); b.innerHTML = msg + (sub ? `<div style="font-size:.5em;opacity:.85">${sub}</div>` : '');
  b.className = 'banner show' + (big ? ' big' : ''); clearTimeout(bannerT); bannerT = setTimeout(() => (b.className = 'banner' + (big ? ' big' : '')), 2600);
}
const UI_toast = msg => announce(msg);
$('shop').onclick = e => { const b = e.target.closest('.unit'); if (!b || !game) return; if (b.classList.contains('lock')) return UI_toast(`🔒 ${UNITS[b.dataset.u].name} ปลดล็อกที่ด่าน ${UNITS[b.dataset.u].lv + 1}`); if (game.train(0, b.dataset.u)) Sfx.play('click'); else { Sfx.play('deny'); b.animate([{ transform: 'translateX(-4px)' }, { transform: 'translateX(4px)' }, { transform: 'none' }], 200); } };
function setMode(m) { if (game && game.mode[0] !== m && m === 'attack') Sfx.play('horn'); if (game) game.mode[0] = m; document.querySelectorAll('.mode').forEach(b => b.classList.toggle('on', b.dataset.mode === m)); }
document.querySelector('.modes').onclick = e => { const b = e.target.closest('.mode'); if (b) setMode(b.dataset.mode); };

function updateHud() {
  $('gold').textContent = Math.floor(game.gold[0]);
  $('pop').textContent = `${game.pop(0)}/${POP_CAP}`;
  const q = game.queue[0];
  document.querySelectorAll('.unit').forEach(b => {
    const k = b.dataset.u, n = q.filter(x => x.type === k).length, qe = b.querySelector('.q');
    b.classList.toggle('poor', game.gold[0] < UNITS[k].cost);
    qe.hidden = !n; qe.textContent = n;
    b.querySelector('.prog').style.height = q[0]?.type === k ? q[0].t / UNITS[k].time * 100 + '%' : 0;
  });
  document.querySelectorAll('.skill').forEach(b => {
    const cd = game.abil[b.dataset.s], el = b.querySelector('.cd');
    el.hidden = !cd; el.textContent = Math.ceil(cd); b.classList.toggle('ready', !cd && !b.classList.contains('lock'));
    b.style.setProperty('--cd', cd / ABILITIES[b.dataset.s].cd);
  });
  $('hpMe').style.width = game.bases[0].hp / game.bases[0].max * 100 + '%';
  $('hpFoe').style.width = game.bases[1].hp / game.bases[1].max * 100 + '%';
  while (hints.length && game.t > hints[0][0]) announce(hints.shift()[1]);
  game.drawMini(mini, vw); renderUpg();
}

// ---------- เลื่อนกล้อง: ลากจอ / แตะแผนที่ย่อ / ปุ่มลูกศร ----------
let drag = null;
bgc.addEventListener('pointerdown', e => { drag = { x: e.clientX, cam: game?.cam }; });
addEventListener('pointermove', e => { if (drag && game) game.cam = drag.cam - (e.clientX - drag.x) / scale; });
addEventListener('pointerup', () => (drag = null));
bgc.addEventListener('wheel', e => { if (game) game.cam += (e.deltaY + e.deltaX) / scale; }, { passive: true });
$('mini').addEventListener('pointerdown', e => {
  const jump = ev => { const r = $('mini').getBoundingClientRect(), w = $('mini').width; game.cam = ((ev.clientX - r.left) / r.width * w - 20) / ((w - 40) / WORLD) - vw / 2; };
  jump(e); const mv = ev => jump(ev); addEventListener('pointermove', mv); addEventListener('pointerup', () => removeEventListener('pointermove', mv), { once: true });
});
const keys = {};
addEventListener('keydown', e => {
  keys[e.key] = true; if (e.key === 'Escape' && game) $('pauseBtn').click();
  const n = +e.key; if (game && n >= 1 && n <= PLAYER_UNITS.length) document.querySelector(`.unit[data-u="${PLAYER_UNITS[n - 1]}"]`)?.click(); // ปุ่มลัด 1-7
});
addEventListener('keyup', e => (keys[e.key] = false));

// ---------- ลูปหลัก ----------
let last = performance.now(), hudT = 0;
function loop(now) {
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  if (game) {
    const pan = (keys.ArrowRight || keys.d ? 1 : 0) - (keys.ArrowLeft || keys.a ? 1 : 0);
    game.cam += pan * 900 * dt;
    if (!paused && !(isPortrait() && isTouch)) game.update(dt);
    game.draw(bg, ctx, vw, dt);
    if ((hudT -= dt) <= 0) { hudT = .1; updateHud(); }
  }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
