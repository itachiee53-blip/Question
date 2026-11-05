// วาดฉากหลังและเอฟเฟกต์แบบ 2D (ตัวละคร/ป้อม/เหมืองเป็นโมเดล 3D อยู่ใน render3d.js, props3d.js)
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

  background(ctx, cam, vw, lv, t) { Scenery.draw(ctx, cam, vw, lv, t); },

  // เงาใต้ตัวละคร/ฐาน (วาดบนพื้นก่อนโมเดล 3D)
  shadow(ctx, x, y, rx) { ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(x, y, rx, rx * .28, 0, 0, 7); ctx.fill(); },

  // ประกายระยิบบนผลึกทองของเหมือง (ตำแหน่งมาจากโมเดล 3D)
  sparkles(ctx, x, sparks, t) {
    if (!sparks) return;
    ctx.fillStyle = '#fff';
    sparks.forEach((s, i) => {
      const k = (t * 1.3 + i * .77) % 3.2; if (k > .35) return;
      const sz = Math.sin(k / .35 * Math.PI) * 8;
      ctx.save(); ctx.translate(x + s.dx, GROUND - s.dy); ctx.rotate(.4);
      ctx.beginPath(); ctx.moveTo(0, -sz); ctx.lineTo(sz * .22, 0); ctx.lineTo(0, sz); ctx.lineTo(-sz * .22, 0); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-sz, 0); ctx.lineTo(0, sz * .22); ctx.lineTo(sz, 0); ctx.lineTo(0, -sz * .22); ctx.fill();
      ctx.restore();
    });
  },

  hpBar(ctx, x, y, w, k, color) {
    ctx.fillStyle = 'rgba(42,23,12,.7)'; ctx.beginPath(); ctx.roundRect(x - w / 2 - 2, y - 2, w + 4, 10, 5); ctx.fill();
    ctx.fillStyle = k > .3 ? color : '#ff7a3a'; ctx.beginPath(); ctx.roundRect(x - w / 2, y, w * Math.max(0, k), 6, 3); ctx.fill();
  },

  // กระสุนทุกชนิด: ลูกธนู / หิน / ขวาน / ลูกไฟ / อุกกาบาต / ไฟมังกร
  proj(ctx, p) {
    if (p.t < 0) return;
    const k = p.t / p.dur, x = p.x0 + (p.x1 - p.x0) * k, y = p.y0 + (p.y1 - p.y0) * k - Math.sin(k * Math.PI) * p.arc;
    const ang = Math.atan2((p.y1 - p.y0) / p.dur - Math.cos(k * Math.PI) * Math.PI * p.arc / p.dur, (p.x1 - p.x0) / p.dur);
    ctx.save(); ctx.translate(x, y);
    if (p.kind === 'arrow') {
      ctx.rotate(ang); R.limb(ctx, -12, 0, 8, 0, '#8a5a30', 2.5);
      ctx.fillStyle = '#c9d0d6'; ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(6, -4); ctx.lineTo(6, 4); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(-16, -4); ctx.lineTo(-8, 0); ctx.lineTo(-16, 4); ctx.fill();
    } else if (p.kind === 'rock') R.clay(ctx, 0, 0, 6, 5, '#8a8078', p.t * 10, 1.5);
    else if (p.kind === 'axe') { ctx.rotate(p.t * 18); R.limb(ctx, -9, 0, 9, 0, '#7a5230', 3); R.clay(ctx, 8, -4, 7, 5, '#c9d0d6', .3, 1.5); }
    else { // ไฟ: ลูกไฟเรืองแสง + หาง
      const big = p.kind === 'meteor' ? 16 : p.kind === 'flame' ? 14 : 10;
      for (let i = 4; i >= 0; i--) {
        const tx = -Math.cos(ang) * i * big * .7, ty = -Math.sin(ang) * i * big * .7;
        ctx.fillStyle = `rgba(255,${120 + i * 20},40,${.5 - i * .09})`; ctx.beginPath(); ctx.arc(tx, ty, big * (1 - i * .15), 0, 7); ctx.fill();
      }
      const g = ctx.createRadialGradient(0, 0, 1, 0, 0, big);
      g.addColorStop(0, '#fffbe0'); g.addColorStop(.4, '#ffc040'); g.addColorStop(1, 'rgba(255,80,20,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, big * 1.4, 0, 7); ctx.fill();
    }
    ctx.restore();
  },

  part(ctx, p) {
    ctx.globalAlpha = Math.min(1, p.life * 2);
    if (p.ring) { // วงคลื่นระเบิด
      const r = (1 - p.life / .4) * 90; ctx.strokeStyle = p.color; ctx.lineWidth = 6 * p.life / .4;
      ctx.beginPath(); ctx.ellipse(p.x, p.y, r, r * .45, 0, 0, 7); ctx.stroke();
    } else if (p.text) {
      ctx.font = '600 20px Mitr, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.strokeText(p.text, p.x, p.y); ctx.fillStyle = p.color; ctx.fillText(p.text, p.x, p.y);
    } else R.clay(ctx, p.x, p.y, p.r, p.r * .8, p.color, p.rot, 1.2);
    ctx.globalAlpha = 1;
  },
};
