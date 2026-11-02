// แบบสอบถามตอนเริ่มใช้ / แก้ไขโปรไฟล์
const choice = (field, list, cur) => '<div class="choices">' + list.map(([v, t, s]) =>
  `<button class="choice${v === cur ? ' sel' : ''}" data-f="${field}" data-v="${v}">${t}<small>${s}</small></button>`).join('') + '</div>';
const field = (id, label, val, attrs = '') =>
  `<div class="field"><label>${label}</label><input id="${id}" type="number" inputmode="decimal" value="${val ?? ''}" ${attrs}></div>`;
const num = id => parseFloat($(id).value);

const STEPS = [
  {
    html: p => `<div class="emoji">👋</div><h2>สวัสดี! มาเปลี่ยนหุ่นด้วยกัน</h2>
      <p class="muted">ตอบคำถามสั้นๆ 1 นาที เพื่อคำนวณแผนที่เหมาะกับคุณ</p>
      <div class="field"><label>ชื่อเล่น</label><input id="obName" value="${esc(p.name || '')}" placeholder="ชื่อเล่นของคุณ"></div>`,
    read: p => { p.name = $('obName').value.trim() || 'คุณ'; },
  },
  {
    html: p => `<div class="emoji">🧬</div><h2>เพศสภาพทางร่างกาย</h2><p class="muted">ใช้คำนวณการเผาผลาญพื้นฐาน</p>` +
      choice('sex', [['m', '👨 ชาย', 'Male'], ['f', '👩 หญิง', 'Female']], p.sex),
  },
  {
    html: p => `<div class="emoji">📏</div><h2>ข้อมูลร่างกาย</h2>` +
      field('obAge', 'อายุ (ปี)', p.age, 'min="12" max="90"') + field('obH', 'ส่วนสูง (cm)', p.height) + field('obW', 'น้ำหนักตอนนี้ (kg)', p.weight, 'step="0.1"'),
    read: p => {
      p.age = num('obAge'); p.height = num('obH'); p.weight = num('obW');
      if (!(p.age >= 12 && p.age <= 90)) return 'กรอกอายุ 12–90 ปี';
      if (!(p.height >= 120 && p.height <= 230)) return 'กรอกส่วนสูง 120–230 cm';
      if (!(p.weight >= 30 && p.weight <= 250)) return 'กรอกน้ำหนัก 30–250 kg';
    },
  },
  {
    html: p => {
      const h = (p.height / 100) ** 2, lo = Math.round(18.5 * h), hi = Math.round(22.9 * h);
      const bmi = (p.weight / h).toFixed(1);
      return `<div class="emoji">🎯</div><h2>น้ำหนักเป้าหมาย</h2>
        <p class="muted">BMI ตอนนี้ ${bmi} (${Profile.bmiLabel(bmi)}) · น้ำหนักสุขภาพดีของคุณคือ ${lo}–${hi} kg</p>` +
        field('obGoal', 'เป้าหมาย (kg)', p.goalWeight ?? Math.min(p.weight, hi), 'step="0.1"');
    },
    read: p => {
      p.goalWeight = num('obGoal');
      if (!(p.goalWeight >= 30 && p.goalWeight <= 250)) return 'กรอกน้ำหนักเป้าหมายให้ถูกต้อง';
    },
  },
  {
    html: p => `<div class="emoji">🏃</div><h2>ปกติขยับตัวแค่ไหน?</h2>` + choice('activity', ACTIVITY, p.activity),
  },
  {
    html: p => `<div class="emoji">⚡</div><h2>อยากลดเร็วแค่ไหน?</h2>` + choice('pace', PACE, p.pace),
  },
  {
    html: p => {
      const r = Profile.plan(p), d = new Date(Date.now() + r.weeks * 7 * 864e5);
      return `<div class="emoji">🚀</div><h2>แผนของ${esc(p.name)}พร้อมแล้ว!</h2>
        <div class="plan">
          <div><small>กินวันละ</small><b>${r.kcal}</b> kcal</div>
          <div><small>เผาผลาญ/วัน</small><b>${r.tdee}</b> kcal</div>
          <div><small>โปรตีน</small><b>${r.protein}</b> g</div>
          <div><small>น้ำ</small><b>${r.water}</b> แก้ว</div>
        </div>
        <p class="muted">${r.weeks ? `ถึง ${p.goalWeight} kg ในราว <b>${r.weeks} สัปดาห์</b> (${d.toLocaleDateString('th-TH', { month: 'short', year: 'numeric' })}) ถ้าทำตามแผน` : 'แผนนี้ช่วยรักษาน้ำหนักและสร้างหุ่นที่ดี'}
        <br>💡 กินโปรตีนให้ถึงเป้า + เวทเทรนนิ่ง จะลดไขมันโดยไม่เสียกล้าม</p>`;
    },
  },
];

const Onboard = {
  start(existing, done) {
    const p = { sex: 'm', activity: 1.375, pace: 0.5, ...existing };
    let i = 0;
    const show = () => {
      $('obStep').innerHTML = STEPS[i].html(p);
      $('obBar').style.width = (i + 1) / STEPS.length * 100 + '%';
      $('obBack').style.visibility = i ? 'visible' : 'hidden';
      $('obNext').textContent = i === STEPS.length - 1 ? 'เริ่มเลย 🚀' : 'ถัดไป';
    };
    $('obStep').onclick = e => {
      const b = e.target.closest('.choice'); if (!b) return;
      p[b.dataset.f] = isNaN(b.dataset.v) ? b.dataset.v : +b.dataset.v;
      b.parentNode.querySelectorAll('.choice').forEach(c => c.classList.toggle('sel', c === b));
    };
    $('obBack').onclick = () => { i--; show(); };
    $('obNext').onclick = () => {
      const err = STEPS[i].read?.(p); if (err) return UI.toast(err);
      if (i < STEPS.length - 1) { i++; return show(); }
      p.startWeight ??= p.weight;
      Profile.save(p);
      if (Store.get('weights', []).at(-1)?.kg !== p.weight) Profile.logWeight(p.weight);
      $('onboard').hidden = true; UI.confetti(40); done();
    };
    $('app').hidden = true; $('onboard').hidden = false; show();
  },
};
