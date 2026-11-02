// ตัวช่วยแสดงผล + อนิเมชั่น
const $ = id => document.getElementById(id);
const esc = t => String(t).replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);

const UI = {
  // ตัวเลขวิ่งขึ้น
  count(el, to) {
    const from = +el.dataset.v || 0; el.dataset.v = to;
    const t0 = performance.now();
    const step = t => {
      const k = Math.min(1, (t - t0) / 700), e = 1 - (1 - k) ** 3;
      el.textContent = Math.round(from + (to - from) * e).toLocaleString();
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  },

  toast(msg) {
    const t = $('toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2200);
  },

  confetti(n = 24) {
    const colors = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ec4899'];
    for (let i = 0; i < n; i++) {
      const c = document.createElement('i');
      c.className = 'confetti';
      c.style.cssText = `left:50%;top:40%;background:${colors[i % 5]};--x:${(Math.random() - .5) * 400}px;--y:${(Math.random() - .3) * 500}px`;
      document.body.appendChild(c); setTimeout(() => c.remove(), 1000);
    }
  },

  // กราฟเส้นน้ำหนัก
  line(svg, values, goal) {
    if (values.length < 2) { svg.innerHTML = '<text x="150" y="60" text-anchor="middle" fill="currentColor" opacity=".5" font-size="12">บันทึกน้ำหนัก 2 วันขึ้นไปเพื่อดูกราฟ</text>'; return; }
    const all = [...values, goal], min = Math.min(...all) - 1, max = Math.max(...all) + 1;
    const y = v => 110 - (v - min) / (max - min) * 100;
    const pts = values.map((v, i) => `${i / (values.length - 1) * 300},${y(v)}`).join(' ');
    svg.innerHTML = `<defs><linearGradient id="grad2"><stop offset="0" stop-color="var(--a2)"/><stop offset="1" stop-color="var(--a1)"/></linearGradient></defs>
      <line class="goal" x1="0" x2="300" y1="${y(goal)}" y2="${y(goal)}"/><polyline points="${pts}"/>`;
  },
};
