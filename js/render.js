// วาดทุกอย่างแบบ "ดินเหนียว": ก้อนกลมมน ไล่เฉด ขอบเข้ม มีไฮไลต์
const R = {
  shade(hex, k) { // k>0 สว่างขึ้น, k<0 เข้มขึ้น
    const n = parseInt(hex.slice(1), 16), f = c => Math.max(0, Math.min(255, Math.round(c + (k > 0 ? (255 - c) * k : c * k))));
    return `rgb(${f(n >> 16)},${f(n >> 8 & 255)},${f(n & 255)})`;
  },

  clay(ctx, x, y, rx, ry, color, rot = 0) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    const g = ctx.createRadialGradient(-rx * .35, -ry * .45, 1, 0, 0, Math.max(rx, ry) * 1.1);
    g.addColorStop(0, R.shade(color, .35)); g.addColorStop(.6, color); g.addColorStop(1, R.shade(color, -.3));
    ctx.fillStyle = g; ctx.strokeStyle = 'rgba(40,20,10,.45)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.35)'; // ไฮไลต์มันวาว
    ctx.beginPath(); ctx.ellipse(-rx * .35, -ry * .45, rx * .28, ry * .16, -.5, 0, 7); ctx.fill();
    ctx.restore();
  },

  stick(ctx, x1, y1, x2, y2, color, w = 4) {
    ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  },

  background(ctx, cam, vw, lv, t) {
    const sky = ctx.createLinearGradient(0, 0, 0, GROUND);
    sky.addColorStop(0, lv.sky[0]); sky.addColorStop(1, lv.sky[1]);
    ctx.fillStyle = sky; ctx.fillRect(0, 0, vw, VIEW_H);
    // เมฆดินเหนียว (พารัลแลกซ์ช้า)
    for (let i = 0; i < 6; i++) {
      const x = ((i * 640 - cam * .15 + t * 6) % 3800 + 3800) % 3800 - 300, y = 60 + (i % 3) * 40;
      R.clay(ctx, x, y, 60, 22, '#ffffff'); R.clay(ctx, x + 40, y - 12, 40, 20, '#ffffff');
    }
    // ภูเขาไกล + ใกล้
    for (const [k, h, c] of [[.3, 140, R.shade(lv.hill, -.15)], [.6, 90, lv.hill]]) {
      ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(0, GROUND);
      for (let x = 0; x <= vw + 40; x += 40) {
        const wx = x + cam * k;
        ctx.lineTo(x, GROUND - h - Math.sin(wx * .004) * h * .45 - Math.sin(wx * .011) * h * .2);
      }
      ctx.lineTo(vw, GROUND); ctx.fill();
    }
    // พื้นดิน (ทางเดินเส้นตรง)
    const g = ctx.createLinearGradient(0, GROUND - 10, 0, VIEW_H);
    g.addColorStop(0, '#b07a4a'); g.addColorStop(.2, '#9a6538'); g.addColorStop(1, '#5e3a20');
    ctx.fillStyle = g; ctx.fillRect(0, GROUND - 10, vw, VIEW_H);
    ctx.fillStyle = 'rgba(255,255,255,.08)';
    for (let x = -(cam % 120); x < vw; x += 120) ctx.fillRect(x, GROUND + 18, 50, 4); // ลายทาง
  },

  base(ctx, b, team, t) {
    const T = TEAM[team], x = b.x, dmg = 1 - b.hp / b.max;
    ctx.save(); ctx.translate(x, GROUND);
    if (b.shake > 0) ctx.translate((Math.random() - .5) * 6, 0);
    R.clay(ctx, 0, -10, 95, 24, '#8a6a4e'); // ฐานหิน
    ctx.fillStyle = R.shade(T.color, -.1); ctx.strokeStyle = 'rgba(40,20,10,.5)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.roundRect(-60, -170, 120, 165, 18); ctx.fill(); ctx.stroke();
    for (let i = -2; i <= 2; i++) R.clay(ctx, i * 26, -175, 13, 13, T.color); // เชิงเทิน
    ctx.fillStyle = '#3b2a1e'; ctx.beginPath(); ctx.roundRect(-22, -70, 44, 65, [22, 22, 0, 0]); ctx.fill(); // ประตู
    R.clay(ctx, 0, -120, 16, 18, '#ffe9a8'); // หน้าต่างไฟ
    R.stick(ctx, 0, -190, 0, -250, '#5e3a20', 4); // ธง
    ctx.fillStyle = T.color; ctx.beginPath(); ctx.moveTo(0, -250);
    ctx.quadraticCurveTo(30 * T.dir, -245 + Math.sin(t * 4) * 5, 45 * T.dir, -238); ctx.lineTo(0, -222); ctx.fill();
    ctx.strokeStyle = 'rgba(40,20,10,.6)'; ctx.lineWidth = 2; // รอยร้าวตามความเสียหาย
    for (let i = 0; i < dmg * 6; i++) { ctx.beginPath(); ctx.moveTo(-40 + i * 16, -150 + i * 20); ctx.lineTo(-30 + i * 14, -125 + i * 18); ctx.lineTo(-44 + i * 15, -110 + i * 19); ctx.stroke(); }
    ctx.restore();
    R.hpBar(ctx, x, GROUND - 275, 110, b.hp / b.max, T.color);
  },

  mine(ctx, m, t) {
    const x = m.x;
    R.clay(ctx, x, GROUND - 22, 70, 36, '#7d7068');
    R.clay(ctx, x - 30, GROUND - 40, 34, 28, '#958880');
    R.clay(ctx, x + 28, GROUND - 46, 30, 30, '#8a7d75');
    for (let i = 0; i < 6; i++) { // ก้อนทองวิบวับ
      const gx = x - 45 + i * 18, gy = GROUND - 30 - (i % 3) * 14;
      R.clay(ctx, gx, gy, 7, 6, '#f2c230');
      if ((t * 2 + i) % 3 < .3) { ctx.fillStyle = '#fff'; ctx.fillRect(gx - 1, gy - 9, 2, 6); ctx.fillRect(gx - 4, gy - 7, 8, 2); }
    }
  },

  hpBar(ctx, x, y, w, k, color) {
    ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.beginPath(); ctx.roundRect(x - w / 2 - 2, y - 2, w + 4, 10, 5); ctx.fill();
    ctx.fillStyle = color; ctx.beginPath(); ctx.roundRect(x - w / 2, y, w * Math.max(0, k), 6, 3); ctx.fill();
  },

  unit(ctx, u, t) {
    const T = TEAM[u.team], s = u.def.size, d = u.face;
    const walk = u.moving ? Math.sin(u.phase) : 0, bob = Math.abs(walk) * 3;
    const atk = u.atkAnim > 0 ? Math.sin((1 - u.atkAnim) * Math.PI) : 0;
    const col = u.flash > 0 ? '#ffffff' : T.color;
    ctx.save(); ctx.translate(u.x, u.y); ctx.scale(s * (1 + atk * .06), s * (1 - atk * .06));
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(0, 0, 16, 5, 0, 0, 7); ctx.fill(); // เงา
    R.clay(ctx, -6 + walk * 5, -6, 6, 7, T.dark); R.clay(ctx, 6 - walk * 5, -6, 6, 7, T.dark); // ขา
    const by = -26 - bob;
    if (u.type === 'miner' && u.carry) R.clay(ctx, -12 * d, by - 2, 10, 11, '#d9b35a'); // ถุงทอง
    R.clay(ctx, 0, by, 13, 17, col); // ตัว
    R.clay(ctx, 2 * d, by - 22, 11, 11, u.flash > 0 ? '#fff' : '#f0c9a0'); // หัว
    ctx.fillStyle = '#2a1a10'; ctx.beginPath(); ctx.arc(6 * d, by - 24, 1.8, 0, 7); ctx.arc(1 * d, by - 24, 1.8, 0, 7); ctx.fill(); // ตา
    R.clay(ctx, 2 * d, by - 31, 11, 5, T.dark); // หมวก
    const hx = 10 * d, hy = by - 2, sw = (atk * 1.6 - .6) * d; // มือ + อาวุธ
    ctx.save(); ctx.translate(hx, hy);
    if (u.type === 'miner') { ctx.rotate(u.state === 'mining' ? Math.sin(t * 12) * .8 * d : -.3 * d); R.stick(ctx, 0, 0, 0, -22, '#6b4423', 3); R.stick(ctx, -8, -22, 8, -22, '#9aa0a6', 4); }
    else if (u.type === 'sword') { ctx.rotate(sw); R.stick(ctx, 0, 0, 22 * d, -14, '#d8dde2', 4); R.stick(ctx, 2 * d, 3, 4 * d, -5, '#6b4423', 4); }
    else if (u.type === 'archer') { ctx.strokeStyle = '#6b4423'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(4 * d, -4, 14, d > 0 ? -1.3 : 1.84, d > 0 ? 1.3 : 4.44); ctx.stroke(); }
    else if (u.type === 'giant') { ctx.rotate(sw * 1.2); R.clay(ctx, 14 * d, -18, 9, 16, '#7a5230', .6 * d); }
    ctx.restore();
    R.clay(ctx, hx, hy, 5, 5, '#f0c9a0');
    ctx.restore();
    if (u.hp < u.def.hp) R.hpBar(ctx, u.x, u.y - 70 * s, 30 * s, u.hp / u.def.hp, T.color);
  },

  arrow(ctx, p) {
    const k = p.t / p.dur, x = p.x0 + (p.x1 - p.x0) * k, y = p.y0 + (p.y1 - p.y0) * k - Math.sin(k * Math.PI) * p.arc;
    const ang = Math.atan2((p.y1 - p.y0) / p.dur - Math.cos(k * Math.PI) * Math.PI * p.arc / p.dur, (p.x1 - p.x0) / p.dur);
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    R.stick(ctx, -12, 0, 8, 0, '#6b4423', 2.5); ctx.fillStyle = '#9aa0a6'; ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(6, -4); ctx.lineTo(6, 4); ctx.fill();
    ctx.restore();
  },

  part(ctx, p) {
    ctx.globalAlpha = Math.min(1, p.life * 2);
    if (p.text) { ctx.fillStyle = p.color; ctx.font = '600 18px Mitr, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(p.text, p.x, p.y); }
    else R.clay(ctx, p.x, p.y, p.r, p.r * .8, p.color, p.rot);
    ctx.globalAlpha = 1;
  },
};
