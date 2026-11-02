// ตรรกะหลักของแอป
const $ = id => document.getElementById(id);
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
    `<li><span>${i.name}</span><span>${i.kcal} kcal <button data-i="${idx}">✕</button></span></li>`
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

render();
