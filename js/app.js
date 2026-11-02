// ตรรกะหลักของแอป
const $ = id => document.getElementById(id);
const esc = t => String(t).replace(/[&<>"]/g, c => `&#${c.charCodeAt(0)};`);
const dayKey = 'day-' + Store.today();
let goal = Store.get('goal', 2000);
let items = Store.get(dayKey, []);

$('foods').innerHTML = FOODS.map(([n]) => `<option value="${n}">`).join('');
$('date').textContent = new Date().toLocaleDateString('th-TH', { dateStyle: 'medium' });
$('goal').value = goal;

function render() {
  const eaten = items.reduce((s, i) => s + i.kcal, 0);
  const left = goal - eaten;
  $('eaten').textContent = eaten;
  $('goalText').textContent = goal;
  $('fill').style.width = Math.min(100, eaten / goal * 100) + '%';
  document.body.classList.toggle('over', left < 0);
  $('left').textContent = left >= 0 ? `เหลืออีก ${left} kcal` : `เกินมา ${-left} kcal`;
  $('list').innerHTML = items.map((i, idx) =>
    `<li><span>${esc(i.name)}</span><span>${i.kcal} kcal <button data-i="${idx}">✕</button></span></li>`
  ).join('') || '<li class="muted">ยังไม่มีรายการ</li>';
  Store.set(dayKey, items);
}

$('search').oninput = e => {
  const f = FOODS.find(([n]) => n === e.target.value);
  if (f) $('kcal').value = f[1];
};

$('add').onclick = () => {
  const name = $('search').value.trim() || 'อาหาร';
  const qty = +$('qty').value || 1;
  const kcal = Math.round((+$('kcal').value || 0) * qty);
  if (!kcal) return $('kcal').focus();
  items.push({ name: qty === 1 ? name : `${name} ×${qty}`, kcal });
  $('search').value = $('kcal').value = ''; $('qty').value = 1;
  render();
};

$('list').onclick = e => {
  if (e.target.dataset.i) { items.splice(e.target.dataset.i, 1); render(); }
};

$('clear').onclick = () => { if (confirm('ล้างรายการวันนี้?')) { items = []; render(); } };
$('goal').onchange = e => { goal = Math.max(500, +e.target.value || 2000); Store.set('goal', goal); render(); };

// --- AI ---
$('gkey').value = Store.get('gkey', '');
$('gmodel').value = Store.get('gmodel', '');
$('gkey').onchange = e => Store.set('gkey', e.target.value.trim());
$('gmodel').onchange = e => Store.set('gmodel', e.target.value.trim() || 'gemini-2.5-flash');

async function analyze(file) {
  const text = $('aiText').value.trim();
  if (!text && !file) return $('aiText').focus();
  $('aiMsg').textContent = 'กำลังวิเคราะห์...';
  $('aiGo').disabled = true;
  try {
    const found = await Gemini.ask(text, file && await Gemini.shrink(file));
    if (!found.length) throw new Error('ไม่พบอาหาร ลองถ่ายใหม่หรือพิมพ์เพิ่ม');
    found.forEach(f => items.push({ name: '🤖 ' + f.name, kcal: Math.round(f.kcal) }));
    $('aiMsg').textContent = `เพิ่ม ${found.length} รายการ (ลบ/แก้ได้ถ้าไม่ตรง)`;
    $('aiText').value = '';
    render();
  } catch (e) {
    $('aiMsg').textContent = '⚠️ ' + e.message;
  } finally {
    $('aiGo').disabled = false; $('aiImg').value = '';
  }
}
$('aiGo').onclick = () => analyze();
$('aiImg').onchange = e => e.target.files[0] && analyze(e.target.files[0]);

render();
