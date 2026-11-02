// ตรรกะหลักของแอป
const MEALS = ['🌅 เช้า', '☀️ กลางวัน', '🌙 เย็น', '🍪 ของว่าง'];
const autoMeal = () => { const h = new Date().getHours(); return h < 11 ? 0 : h < 16 ? 1 : h < 21 ? 2 : 3; };
let profile, plan, day, pending = [];

function boot() {
  profile = Profile.get(); plan = Profile.plan(profile); day = Store.day();
  $('app').hidden = false;
  $('hello').textContent = `สวัสดี ${profile.name} 👋`;
  $('dateText').textContent = new Date().toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'short' });
  $('meal').innerHTML = MEALS.map((m, i) => `<option value="${i}"${i === autoMeal() ? ' selected' : ''}>${m}</option>`).join('');
  $('foods').innerHTML = FOODS.map(([n]) => `<option value="${esc(n)}">`).join('');
  renderAll();
}
const renderAll = () => { renderHome(); renderRecent(); renderStats(); renderProfile(); };
const save = () => { Store.saveDay(day); renderHome(); renderStats(); };

// ---------- แท็บ ----------
document.querySelector('.tabs').onclick = e => {
  const b = e.target.closest('button'); if (!b) return;
  document.querySelectorAll('.tabs button').forEach(x => x.classList.toggle('on', x === b));
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.id === 'tab-' + b.dataset.tab));
  if (b.dataset.tab === 'stats') renderStats();
  scrollTo({ top: 0, behavior: 'smooth' });
};
const goTab = name => document.querySelector(`[data-tab="${name}"]`).click();

// ---------- หน้าวันนี้ ----------
function totals(items) {
  return items.reduce((t, i) => ({ kcal: t.kcal + i.kcal, p: t.p + (i.p || 0), c: t.c + (i.c || 0), f: t.f + (i.f || 0) }), { kcal: 0, p: 0, c: 0, f: 0 });
}

function renderHome(newIdx = -1) {
  const t = totals(day.items), left = plan.kcal - t.kcal;
  UI.count($('eatenNum'), t.kcal); UI.count($('targetNum'), plan.kcal); UI.count($('leftNum'), Math.abs(left));
  $('leftLabel').textContent = left >= 0 ? 'เหลือ kcal' : 'เกิน kcal';
  $('ringFg').style.strokeDashoffset = 100 - Math.min(100, t.kcal / plan.kcal * 100);
  document.querySelector('.ring-card').classList.toggle('over', left < 0);

  $('macros').innerHTML = [['p', 'โปรตีน', plan.protein], ['c', 'คาร์บ', plan.carb], ['f', 'ไขมัน', plan.fat]].map(([k, n, max]) =>
    `<div class="macro"><small>${n}</small><b>${t[k]}<span class="muted">/${max}g</span></b>
     <div class="bar"><div style="background:var(--${k})" data-w="${Math.min(100, t[k] / max * 100)}"></div></div></div>`).join('');
  requestAnimationFrame(() => $('macros').querySelectorAll('[data-w]').forEach(b => b.style.width = b.dataset.w + '%'));

  $('waterText').textContent = `${day.water}/${plan.water} แก้ว`;
  $('cups').innerHTML = Array.from({ length: plan.water }, (_, i) => `<button class="cup${i < day.water ? ' full' : ''}" data-i="${i}"></button>`).join('');

  const groups = MEALS.map((m, mi) => ({ m, list: day.items.map((it, idx) => ({ ...it, idx })).filter(it => (it.meal ?? 3) === mi) }));
  $('meals').innerHTML = day.items.length ? groups.filter(g => g.list.length).map(g =>
    `<div class="card meal"><h3>${g.m}<span>${totals(g.list).kcal} kcal</span></h3>` + g.list.map(it =>
      `<div class="item${it.idx === newIdx ? ' new' : ''}"><div class="grow">${esc(it.name)}${it.p != null ? `<small>P ${it.p} · C ${it.c} · F ${it.f}</small>` : ''}</div>
       <b>${it.kcal}</b><button class="x" data-del="${it.idx}">✕</button></div>`).join('') + '</div>').join('')
    : `<div class="card empty"><div>🍽️</div><p class="muted">ยังไม่มีบันทึกวันนี้<br>กดปุ่ม ＋ เพื่อเพิ่มอาหาร</p></div>`;
  renderStreak();
}

$('cups').onclick = e => {
  const i = e.target.dataset.i; if (i == null) return;
  day.water = +i < day.water ? +i : +i + 1; save();
  if (day.water === plan.water) { UI.toast('💧 ดื่มน้ำครบเป้าแล้ว เยี่ยม!'); UI.confetti(); }
};
$('meals').onclick = e => {
  const i = e.target.dataset.del; if (i == null) return;
  day.items.splice(i, 1); save(); UI.toast('ลบแล้ว');
};

function renderStreak() {
  let n = 0;
  for (let i = day.items.length ? 0 : 1; Store.day(Store.dateKey(i)).items.length; i++) n++;
  const el = $('streak'), old = +el.textContent;
  el.textContent = n;
  if (n > old) { el.parentNode.classList.remove('hot'); void el.offsetWidth; el.parentNode.classList.add('hot'); }
}

// ---------- โค้ช AI ----------
$('coachBtn').onclick = async () => {
  const t = totals(day.items);
  const summary = `เป้า ${plan.kcal} kcal กินแล้ว ${t.kcal} · โปรตีน ${t.p}/${plan.protein}g คาร์บ ${t.c}/${plan.carb}g ไขมัน ${t.f}/${plan.fat}g · น้ำ ${day.water}/${plan.water} แก้ว · ` +
    `เวลา ${new Date().getHours()} น. · ${profile.sex === 'm' ? 'ชาย' : 'หญิง'} ${plan.weight}kg เป้า ${profile.goalWeight}kg · กิน: ${day.items.map(i => i.name).join(', ') || 'ยังไม่ได้กิน'}`;
  const cache = Store.get('coach', {});
  if (cache.k === summary) return ($('coachText').textContent = cache.v); // ข้อมูลเดิม → ไม่ถามซ้ำ
  $('coachBtn').disabled = true; $('coachText').innerHTML = '<div class="loading"></div><div class="loading"></div>';
  try {
    const v = await Gemini.coach(summary);
    Store.set('coach', { k: summary, v }); $('coachText').textContent = v;
  } catch (err) { $('coachText').textContent = '⚠️ ' + err.message; }
  $('coachBtn').disabled = false;
};

// ---------- เพิ่มอาหารด้วย AI ----------
let photo = null;
$('aiImg').onchange = e => {
  photo = e.target.files[0]; if (!photo) return;
  $('aiPreview').src = URL.createObjectURL(photo); $('aiPreview').hidden = false;
  analyze();
};
$('aiGo').onclick = () => analyze();

async function analyze() {
  const text = $('aiText').value.trim();
  if (!text && !photo) return $('aiText').focus();
  $('aiGo').disabled = true;
  $('aiResult').innerHTML = '<div class="loading"></div><div class="loading"></div><div class="loading"></div>';
  try {
    pending = await Gemini.estimate(text, photo && await Gemini.shrink(photo));
    if (!pending.length) throw new Error('ไม่พบอาหาร ลองพิมพ์ให้ละเอียดขึ้นหรือถ่ายใหม่');
    renderPending();
  } catch (err) { $('aiResult').innerHTML = `<p class="muted">⚠️ ${esc(err.message)}</p>`; }
  $('aiGo').disabled = false;
}

function renderPending() {
  if (!pending.length) return ($('aiResult').innerHTML = '');
  $('aiResult').innerHTML = '<div class="ai-res">' + pending.map((it, i) =>
    `<div class="item new"><div class="grow">${esc(it.name)}<small>P ${it.p} · C ${it.c} · F ${it.f}</small></div>
     <b>${it.kcal}</b><button class="x" data-rm="${i}">✕</button></div>`).join('') +
    `<div class="total">รวม ${totals(pending).kcal} kcal</div><button id="aiSave" class="btn full">✅ บันทึกลง${MEALS[$('meal').value]}</button></div>`;
}

$('aiResult').onclick = e => {
  if (e.target.dataset.rm != null) { pending.splice(e.target.dataset.rm, 1); return renderPending(); }
  if (e.target.id !== 'aiSave') return;
  addItems(pending.map(it => ({ ...it, meal: +$('meal').value })));
  pending = []; photo = null; $('aiText').value = ''; $('aiImg').value = ''; $('aiPreview').hidden = true; $('aiResult').innerHTML = '';
};

// ---------- เพิ่มเอง ----------
$('search').oninput = e => { const f = FOODS.find(([n]) => n === e.target.value); if (f) $('kcal').value = f[1]; };
$('addBtn').onclick = () => {
  const kcal = Math.round(+$('kcal').value);
  if (!kcal) return $('kcal').focus();
  addItems([{ name: $('search').value.trim() || 'อาหาร', kcal, meal: +$('meal').value }]);
  $('search').value = $('kcal').value = '';
};

function addItems(list) {
  day.items.push(...list);
  const recent = Store.get('recent', []).filter(r => !list.some(l => l.name === r.name));
  Store.set('recent', [...list.map(({ meal, ...r }) => r), ...recent].slice(0, 12));
  Store.saveDay(day);
  goTab('home'); renderHome(day.items.length - 1); renderRecent(); renderStats();
  UI.toast(`➕ เพิ่ม ${totals(list).kcal} kcal`);
}

function renderRecent() {
  const r = Store.get('recent', []);
  $('recent').innerHTML = r.length ? '<small class="muted" style="width:100%">กินบ่อย (แตะเพื่อเพิ่มเร็ว)</small>' +
    r.map((it, i) => `<button class="chip" data-r="${i}">${esc(it.name)} · ${it.kcal}</button>`).join('') : '';
}
$('recent').onclick = e => {
  const i = e.target.dataset.r; if (i == null) return;
  addItems([{ ...Store.get('recent', [])[i], meal: +$('meal').value }]);
};

// ---------- สถิติ ----------
function renderStats() {
  const ws = Store.get('weights', []), start = profile.startWeight ?? ws[0]?.kg ?? profile.weight, now = plan.weight;
  const total = start - profile.goalWeight, done = start - now;
  const pct = total > 0 ? Math.max(0, Math.min(100, done / total * 100)) : 100;
  $('goalProg').textContent = `${now} → ${profile.goalWeight} kg`;
  requestAnimationFrame(() => $('goalBar').style.width = pct + '%');
  UI.line($('weightChart'), ws.slice(-30).map(w => w.kg), profile.goalWeight);

  const days = Array.from({ length: 7 }, (_, i) => {
    const k = Store.dateKey(6 - i);
    return { k, kcal: totals(Store.day(k).items).kcal, label: new Date(k + 'T12:00').toLocaleDateString('th-TH', { weekday: 'narrow' }) };
  });
  const max = Math.max(plan.kcal * 1.2, ...days.map(d => d.kcal));
  $('week').innerHTML = `<div class="line" style="bottom:${plan.kcal / max * 130 + 18}px"></div>` + days.map(d =>
    `<div class="col"><div class="b${d.kcal > plan.kcal ? ' over' : ''}" data-h="${d.kcal / max * 130}"></div>${d.label}</div>`).join('');
  requestAnimationFrame(() => $('week').querySelectorAll('[data-h]').forEach(b => b.style.height = b.dataset.h + 'px'));

  const logged = days.filter(d => d.kcal), avg = logged.length ? Math.round(totals(logged).kcal / logged.length) : 0;
  $('statsGrid').innerHTML = [
    ['BMI', `${plan.bmi} <small>${Profile.bmiLabel(plan.bmi)}</small>`], ['ลดไปแล้ว', `${done > 0 ? '−' : ''}${Math.abs(done).toFixed(1)} kg`],
    ['เฉลี่ย 7 วัน', `${avg} kcal`], ['ถึงเป้าอีก', plan.weeks ? `~${plan.weeks} สัปดาห์` : '🎉 ถึงแล้ว'],
    ['เผาผลาญ/วัน', `${plan.tdee} kcal`], ['BMR', `${plan.bmr} kcal`],
  ].map(([k, v]) => `<div class="stat"><small>${k}</small><b>${v}</b></div>`).join('');
}

$('weightBtn').onclick = () => {
  const kg = +$('weightIn').value;
  if (!(kg >= 30 && kg <= 250)) return UI.toast('กรอกน้ำหนักให้ถูกต้อง');
  const prevMin = Math.min(...Store.get('weights', []).map(w => w.kg));
  Profile.logWeight(kg); plan = Profile.plan(profile); $('weightIn').value = '';
  renderAll();
  if (kg < prevMin) { UI.confetti(40); UI.toast('🎉 น้ำหนักต่ำสุดใหม่! เก่งมาก'); } else UI.toast('บันทึกแล้ว');
};

// ---------- โปรไฟล์ ----------
function renderProfile() {
  const p = profile;
  $('profileCard').innerHTML = `<h3>👤 ${esc(p.name)}</h3>
    <div class="stats-grid">
      <div class="stat"><small>อายุ</small><b>${p.age}</b></div><div class="stat"><small>ส่วนสูง</small><b>${p.height} cm</b></div>
      <div class="stat"><small>กิจกรรม</small><b>${ACTIVITY.find(a => a[0] === p.activity)?.[1]}</b></div>
      <div class="stat"><small>ความเร็ว</small><b>${p.pace} kg/สัปดาห์</b></div>
    </div>
    <div class="field" style="margin-top:12px"><label>Gemini API key (เก็บในเครื่องนี้)</label>
      <input id="keyIn" type="password" placeholder="วาง key ที่นี่" value="${esc(CONFIG.GEMINI_KEY)}"></div>`;
  $('keyIn').onchange = e => { Store.set('gkey', e.target.value.trim()); UI.toast('บันทึก key แล้ว'); };
}
$('editProfile').onclick = () => Onboard.start(profile, boot);
$('resetAll').onclick = () => {
  if (!confirm('ลบข้อมูลทั้งหมด (โปรไฟล์ อาหาร น้ำหนัก)?')) return;
  const key = CONFIG.GEMINI_KEY; localStorage.clear(); Store.set('gkey', key); location.reload();
};

// ---------- เริ่มแอป ----------
Profile.get() ? boot() : Onboard.start(null, boot);
