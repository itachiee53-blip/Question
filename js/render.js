// วาดฉากหลัง เหมือง และเอฟเฟกต์แบบ 2D (ตัวละคร/ป้อมเป็นโมเดล 3D อยู่ใน render3d.js)
const INK = 'rgba(42,23,12,.75)';
const SKIN = '#f2c7a0';

const R = {
  shade(hex, k) {
    const n = parseInt(hex.slice(1), 16), f = c => Math.max(0, Math.min(255, Math.round(c + (k > 0 ? (255 - c) * k : c * k))));
    return `rgb(${f(n >> 16)},${f(n >> 8 & 255)},${f(n & 255)})`;
  },

  // ก้อนดินเหนียว (วงรี) ใส่แสงเงา + ขอบ + ไฮไลต์
  clay(ctx, x, y, rx, ry, color, rot = 0, line = 2.2) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    const g = ctx.createRadialGradient(-rx * .35, -ry * .45, 1, 0, 0, Math.max(rx, ry) * 1.15);
    g.addColorStop(0, R.shade(color, .4)); g.addColorStop(.55, color); g.addColorStop(1, R.shade(color, -.35));
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, 7); ctx.fill();
    if (line) { ctx.strokeStyle = INK; ctx.lineWidth = line; ctx.stroke(); }
    ctx.fillStyle = 'rgba(255,255,255,.4)';
    ctx.beginPath(); ctx.ellipse(-rx * .38, -ry * .48, rx * .3, ry * .17, -.5, 0, 7); ctx.fill();
    ctx.restore();
  },

  // สี่เหลี่ยมมุมมนแบบดินเหนียว
  slab(ctx, x, y, w, h, r, color, line = 2.5) {
    const g = ctx.createLinearGradient(x, y, x + w * .3, y + h);
    g.addColorStop(0, R.shade(color, .25)); g.addColorStop(1, R.shade(color, -.25));
    ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill();
    if (line) { ctx.strokeStyle = INK; ctx.lineWidth = line; ctx.stroke(); }
  },

  // แขน/ด้ามจับแบบไส้กรอกดินเหนียว (มีขอบ)
  limb(ctx, x1, y1, x2, y2, color, w = 7) {
    ctx.lineCap = 'round';
    ctx.strokeStyle = INK; ctx.lineWidth = w + 3; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.strokeStyle = color; ctx.lineWidth = w; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.lineWidth = w * .3; ctx.beginPath(); ctx.moveTo(x1, y1 - w * .2); ctx.lineTo(x2, y2 - w * .2); ctx.stroke();
  },

  background(ctx, cam, vw, lv, t) {
    const sky = ctx.createLinearGradient(0, 0, 0, GROUND);
    sky.addColorStop(0, lv.sky[0]); sky.addColorStop(1, lv.sky[1]);
    ctx.fillStyle = sky; ctx.fillRect(0, 0, vw, VIEW_H);
    R.clay(ctx, vw * .8 - cam * .02, 70, 34, 34, '#fff3c4', 0, 0); // ดวงอาทิตย์
    for (let i = 0; i < 6; i++) {
      const x = ((i * 640 - cam * .15 + t * 6) % 3800 + 3800) % 3800 - 300, y = 50 + (i % 3) * 30;
      R.clay(ctx, x, y, 55, 18, '#ffffff', 0, 0); R.clay(ctx, x + 35, y - 10, 36, 18, '#ffffff', 0, 0);
    }
    for (const [k, h, c] of [[.25, 150, R.shade(lv.hill, -.2)], [.5, 95, lv.hill]]) {
      ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(0, GROUND);
      for (let x = 0; x <= vw + 30; x += 30) {
        const wx = x + cam * k;
        ctx.lineTo(x, GROUND - h - Math.sin(wx * .004) * h * .45 - Math.sin(wx * .011) * h * .2);
      }
      ctx.lineTo(vw, GROUND); ctx.fill();
    }
    // ต้นไม้ดินเหนียวระยะกลาง
    for (let i = 0; i < 14; i++) {
      const x = ((i * 260 - cam * .75) % 3640 + 3640) % 3640 - 100, s = .7 + (i % 3) * .2;
      R.slab(ctx, x - 4 * s, GROUND - 40 * s, 8 * s, 40 * s, 3, '#7a5230', 1.5);
      R.clay(ctx, x, GROUND - 55 * s, 22 * s, 26 * s, R.shade(lv.hill, -.1), 0, 1.5);
    }
    const g = ctx.createLinearGradient(0, GROUND - 12, 0, VIEW_H);
    g.addColorStop(0, '#b98250'); g.addColorStop(.15, '#9a6538'); g.addColorStop(1, '#4e2f1a');
    ctx.fillStyle = g; ctx.fillRect(0, GROUND - 12, vw, VIEW_H);
    ctx.fillStyle = '#7fb85a'; // ขอบหญ้า
    for (let x = -(cam % 24); x < vw; x += 24) { ctx.beginPath(); ctx.ellipse(x, GROUND - 12, 16, 6, 0, 0, 7); ctx.fill(); }
    for (let i = 0; i < 30; i++) { // ก้อนหินบนทาง
      const x = ((i * 157 - cam) % 4710 + 4710) % 4710 - 50;
      if (x < vw + 20) R.clay(ctx, x, GROUND + 50 + (i * 37 % 60), 5 + i % 4, 3 + i % 3, '#7d6a5a', 0, 1);
    }
  },

  // เงาใต้ตัวละคร/ฐาน (วาดบนพื้นก่อนโมเดล 3D)
  shadow(ctx, x, y, rx) { ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(x, y, rx, rx * .28, 0, 0, 7); ctx.fill(); },

  bricks(ctx, x, y, w, h) {
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.strokeStyle = 'rgba(42,23,12,.18)'; ctx.lineWidth = 1.5;
    for (let r = 0, yy = y + 14; yy < y + h; yy += 14, r++) {
      ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x + w, yy); ctx.stroke();
      for (let xx = x + (r % 2 ? 10 : 0); xx < x + w; xx += 20) { ctx.beginPath(); ctx.moveTo(xx, yy - 14); ctx.lineTo(xx, yy); ctx.stroke(); }
    }
    ctx.restore();
  },

  mine(ctx, m, t) {
    const x = m.x;
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(x, GROUND, 80, 10, 0, 0, 7); ctx.fill();
    R.clay(ctx, x, GROUND - 24, 72, 38, '#7d7068');
    R.clay(ctx, x - 32, GROUND - 44, 36, 30, '#958880');
    R.clay(ctx, x + 30, GROUND - 50, 32, 32, '#8a7d75');
    for (let i = 0; i < 7; i++) {
      const gx = x - 50 + i * 16, gy = GROUND - 28 - (i % 3) * 16;
      R.clay(ctx, gx, gy, 8, 7, '#f6c62e', i, 1.5);
      if ((t * 1.5 + i * .7) % 3 < .25) { ctx.fillStyle = '#fff'; ctx.save(); ctx.translate(gx, gy - 10); ctx.rotate(t); ctx.fillRect(-1, -6, 2, 12); ctx.fillRect(-6, -1, 12, 2); ctx.restore(); }
    }
  },

  hpBar(ctx, x, y, w, k, color) {
    ctx.fillStyle = 'rgba(42,23,12,.7)'; ctx.beginPath(); ctx.roundRect(x - w / 2 - 2, y - 2, w + 4, 10, 5); ctx.fill();
    ctx.fillStyle = k > .3 ? color : '#ff7a3a'; ctx.beginPath(); ctx.roundRect(x - w / 2, y, w * Math.max(0, k), 6, 3); ctx.fill();
  },

  arrow(ctx, p) {
    const k = p.t / p.dur, x = p.x0 + (p.x1 - p.x0) * k, y = p.y0 + (p.y1 - p.y0) * k - Math.sin(k * Math.PI) * p.arc;
    const ang = Math.atan2((p.y1 - p.y0) / p.dur - Math.cos(k * Math.PI) * Math.PI * p.arc / p.dur, (p.x1 - p.x0) / p.dur);
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    R.limb(ctx, -12, 0, 8, 0, '#8a5a30', 2.5);
    ctx.fillStyle = '#c9d0d6'; ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(6, -4); ctx.lineTo(6, 4); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(-16, -4); ctx.lineTo(-8, 0); ctx.lineTo(-16, 4); ctx.fill();
    ctx.restore();
  },

  part(ctx, p) {
    ctx.globalAlpha = Math.min(1, p.life * 2);
    if (p.text) {
      ctx.font = '600 20px Mitr, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.strokeText(p.text, p.x, p.y); ctx.fillStyle = p.color; ctx.fillText(p.text, p.x, p.y);
    } else R.clay(ctx, p.x, p.y, p.r, p.r * .8, p.color, p.rot, 1.2);
    ctx.globalAlpha = 1;
  },
};
