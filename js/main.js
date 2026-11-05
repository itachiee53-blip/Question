// หน้าจอ, การหมุนจอ, การควบคุม, ลูปเกม
const $ = id => document.getElementById(id);
const cv = $('game'), ctx = cv.getContext('2d'), mini = $('mini').getContext('2d');
let game = null, paused = false, scale = 1, vw = 960, lvSel = 0;
const unlocked = () => { try { return +localStorage.getItem('clay-unlock') || 0; } catch { return 0; } };
const isPortrait = () => matchMedia('(orientation: portrait)').matches;
const isTouch = matchMedia('(pointer: coarse)').matches;

// ---------- ขนาดจอ ----------
function resize() {
  const dpr = Math.min(2, devicePixelRatio || 1), w = innerWidth, h = innerHeight;
  cv.width = w * dpr; cv.height = h * dpr;
  scale = h / VIEW_H; vw = w / scale;
  ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
}
addEventListener('resize', resize); resize();

// ---------- หน้าเริ่ม ----------
function renderLevels() {
  $('levels').innerHTML = LEVELS.map((l, i) =>
    `<button class="lv${i === lvSel ? ' sel' : ''}" data-i="${i}" ${i > unlocked() ? 'disabled' : ''}>${i > unlocked() ? '🔒' : '⭐'.repeat(i + 1)}<small>ด่าน ${i + 1}</small>${l.name}</button>`).join('');
}
$('levels').onclick = e => { const b = e.target.closest('.lv'); if (b && !b.disabled) { lvSel = +b.dataset.i; renderLevels(); } };
lvSel = Math.min(unlocked(), LEVELS.length - 1); renderLevels();

$('playBtn').onclick = () => (isTouch && !document.fullscreenElement ? ($('perm').hidden = false) : startGame(lvSel));
$('permYes').onclick = async () => {
  $('perm').hidden = true;
  try { await document.documentElement.requestFullscreen?.({ navigationUI: 'hide' }); await screen.orientation?.lock?.('landscape'); } catch {}
  startGame(lvSel); // ถ้าเครื่องไม่รองรับ (เช่น iPhone) จะมีหน้าเตือนให้หมุนจอเอง
};
$('permNo').onclick = () => { $('perm').hidden = true; startGame(lvSel); };

// ---------- เริ่ม/จบเกม ----------
function startGame(i) {
  game = new Game(i); paused = false;
  game.onEnd = showEnd;
  document.body.classList.add('playing');
  $('start').hidden = $('end').hidden = $('pause').hidden = true; $('hud').hidden = false;
  setMode('defend'); buildShop(); $('upg').hidden = true; Sfx.init();
}

function showEnd(r) {
  const win = r === 'win', last = game.lvIdx >= LEVELS.length - 1;
  if (win) try { localStorage.setItem('clay-unlock', Math.max(unlocked(), game.lvIdx + 1)); } catch {}
  $('endIco').textContent = win ? '🏆' : '💥';
  $('endTitle').textContent = win ? 'ชนะแล้ว!' : 'ฐานแตก...';
  $('endText').textContent = win ? (last ? 'คุณพิชิตทุกด่านแล้ว สุดยอด!' : 'ปลดล็อกด่านถัดไปแล้ว') : 'ลองเพิ่มคนงานให้ฟาร์มแร่เร็วขึ้น แล้วตั้งรับก่อนบุก';
  $('nextBtn').textContent = win && !last ? '▶ ด่านถัดไป' : '↻ เล่นอีกครั้ง';
  $('nextBtn').onclick = () => startGame(win && !last ? game.lvIdx + 1 : game.lvIdx);
  setTimeout(() => ($('end').hidden = false), 900);
}

function toMenu() {
  game = null; document.body.classList.remove('playing');
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
$('muteBtn').onclick = () => { $('muteBtn').textContent = Sfx.toggle() ? '🔊' : '🔇'; Sfx.play('click'); };
$('muteBtn').textContent = Sfx.on ? '🔊' : '🔇';
addEventListener('pointerdown', () => Sfx.init(), { once: true });
addEventListener('pointerdown', () => Sfx.ctx?.state === 'suspended' && Sfx.ctx.resume());

function buildShop() {
  $('shop').innerHTML = Object.entries(UNITS).map(([k, u]) =>
    `<button class="unit" data-u="${k}"><span class="i">${u.icon}</span><small>🪙${u.cost}</small><span class="q" hidden></span><span class="prog"></span></button>`).join('');
}
$('shop').onclick = e => { const b = e.target.closest('.unit'); if (!b || !game) return; if (game.train(0, b.dataset.u)) Sfx.play('click'); else { Sfx.play('deny'); b.animate([{ transform: 'translateX(-4px)' }, { transform: 'translateX(4px)' }, { transform: 'none' }], 200); } };
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
    b.querySelector('.prog').style.width = q[0]?.type === k ? q[0].t / UNITS[k].time * 100 + '%' : 0;
  });
  game.drawMini(mini, vw); renderUpg();
}

// ---------- เลื่อนกล้อง: ลากจอ / แตะแผนที่ย่อ / ปุ่มลูกศร ----------
let drag = null;
cv.addEventListener('pointerdown', e => { drag = { x: e.clientX, cam: game?.cam }; });
addEventListener('pointermove', e => { if (drag && game) game.cam = drag.cam - (e.clientX - drag.x) / scale; });
addEventListener('pointerup', () => (drag = null));
cv.addEventListener('wheel', e => { if (game) game.cam += (e.deltaY + e.deltaX) / scale; }, { passive: true });
$('mini').addEventListener('pointerdown', e => {
  const jump = ev => { const r = $('mini').getBoundingClientRect(); game.cam = (ev.clientX - r.left) / r.width * WORLD - vw / 2; };
  jump(e); const mv = ev => jump(ev); addEventListener('pointermove', mv); addEventListener('pointerup', () => removeEventListener('pointermove', mv), { once: true });
});
const keys = {};
addEventListener('keydown', e => { keys[e.key] = true; if (e.key === 'Escape' && game) $('pauseBtn').click(); });
addEventListener('keyup', e => (keys[e.key] = false));

// ---------- ลูปหลัก ----------
let last = performance.now(), hudT = 0;
function loop(now) {
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  if (game) {
    const pan = (keys.ArrowRight || keys.d ? 1 : 0) - (keys.ArrowLeft || keys.a ? 1 : 0);
    game.cam += pan * 900 * dt;
    if (!paused && !(isPortrait() && isTouch)) game.update(dt);
    game.draw(ctx, vw);
    if ((hudT -= dt) <= 0) { hudT = .1; updateHud(); }
  }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
