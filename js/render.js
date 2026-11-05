// วาดทุกอย่างแบบ "ดินเหนียวการ์ตูน": ก้อนกลมมน ไล่เฉด ขอบเข้ม มีไฮไลต์มันวาว
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

  base(ctx, b, team, t, up) {
    const T = TEAM[team], d = T.dir, dmg = 1 - b.hp / b.max, stone = '#a8998a';
    ctx.save(); ctx.translate(b.x, GROUND);
    if (b.shake > 0) ctx.translate((Math.random() - .5) * 6, 0);
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(0, -4, 130, 14, 0, 0, 7); ctx.fill();

    // หอคอยข้าง 2 ข้าง
    for (const sx of [-62, 62]) {
      R.slab(ctx, sx - 26, -205, 52, 200, 14, stone);
      R.bricks(ctx, sx - 24, -200, 48, 192);
      ctx.fillStyle = T.color; ctx.strokeStyle = INK; ctx.lineWidth = 2.5; // หลังคากรวยสีทีม
      ctx.beginPath(); ctx.moveTo(sx - 34, -200); ctx.quadraticCurveTo(sx, -215, sx + 34, -200); ctx.lineTo(sx, -265); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.beginPath(); ctx.moveTo(sx - 20, -205); ctx.lineTo(sx - 4, -255); ctx.lineTo(sx - 8, -205); ctx.fill();
      R.slab(ctx, sx - 8, -170, 16, 24, [8, 8, 2, 2], '#ffd27a', 2); // หน้าต่างไฟ
      ctx.fillStyle = `rgba(255,210,122,${.15 + Math.sin(t * 3 + sx) * .05})`; ctx.beginPath(); ctx.arc(sx, -158, 22, 0, 7); ctx.fill();
    }
    // ตัวป้อมกลาง
    R.slab(ctx, -48, -165, 96, 160, 10, R.shade(stone, -.05));
    R.bricks(ctx, -46, -160, 92, 152);
    for (let i = -2; i <= 2; i++) R.slab(ctx, i * 19 - 8, -182, 16, 20, 4, stone, 2); // เชิงเทิน
    // ประตูไม้โค้ง
    R.slab(ctx, -26, -80, 52, 76, [26, 26, 2, 2], '#7a4f2a');
    ctx.strokeStyle = 'rgba(42,23,12,.5)'; ctx.lineWidth = 2;
    for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(i * 13, -72 + Math.abs(i) * 6); ctx.lineTo(i * 13, -6); ctx.stroke(); }
    R.clay(ctx, 14 * d, -40, 3, 3, '#e0c060', 0, 1);
    // ตราทีม
    R.clay(ctx, 0, -125, 20, 22, T.color);
    ctx.fillStyle = '#fff'; ctx.font = '600 20px Mitr, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(team ? '☠' : '★', 0, -124);
    // ธงโบก
    R.limb(ctx, 62 * d, -262, 62 * d, -310, '#6b4423', 4);
    ctx.fillStyle = T.color; ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(62 * d, -310);
    ctx.quadraticCurveTo(62 * d + 25 * d, -305 + Math.sin(t * 5) * 6, 62 * d + 48 * d, -298 + Math.sin(t * 5 + 1) * 4);
    ctx.quadraticCurveTo(62 * d + 24 * d, -290 + Math.sin(t * 5) * 5, 62 * d, -284); ctx.fill(); ctx.stroke();

    // อัปเกรดป้อมธนู: หน้าไม้ยักษ์บนเชิงเทิน
    if (up.tower) {
      R.slab(ctx, -14, -205, 28, 22, 6, '#7a5230', 2);
      ctx.save(); ctx.translate(0, -205); ctx.rotate(-.25 * d);
      R.limb(ctx, 0, 0, 34 * d, 0, '#5e3a20', 5);
      ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(26 * d, 0, 14, -1.4, 1.4, d < 0); ctx.stroke();
      ctx.restore();
      for (let i = 0; i < up.tower; i++) R.clay(ctx, -10 + i * 10, -230, 4, 4, '#ffd84a', 0, 1); // ดาวระดับ
    }
    // อัปเกรดกำแพง: กำแพงหินหน้าฐาน หนาขึ้นตามระดับ
    if (up.wall) {
      const wx = 110 * d, h = 40 + up.wall * 16;
      R.slab(ctx, wx - 16, -h, 32, h, 6, '#8f8273');
      R.bricks(ctx, wx - 14, -h + 4, 28, h - 6);
      for (let i = 0; i < 2; i++) R.slab(ctx, wx - 16 + i * 18, -h - 10, 14, 12, 3, '#8f8273', 2);
    }
    // รอยร้าว
    ctx.strokeStyle = 'rgba(42,23,12,.7)'; ctx.lineWidth = 2.5;
    for (let i = 0; i < dmg * 7; i++) {
      const cx = ((i * 37) % 80) - 40, cy = -150 + ((i * 53) % 120);
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + 8, cy + 12); ctx.lineTo(cx + 2, cy + 22); ctx.lineTo(cx + 10, cy + 32); ctx.stroke();
    }
    ctx.restore();
    R.hpBar(ctx, b.x, GROUND - 335, 120, b.hp / b.max, T.color);
  },

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

  unit(ctx, u, t) {
    const T = TEAM[u.team], s = u.def.size, d = u.face, type = u.type;
    const walk = u.moving ? Math.sin(u.phase) : 0, bob = Math.abs(walk) * 3, breathe = Math.sin(t * 3 + u.ofs) * .8;
    const atk = u.atkAnim > 0 ? Math.sin((1 - u.atkAnim) * Math.PI) : 0;
    const body = u.flash > 0 ? '#ffffff' : type === 'giant' ? R.shade(T.color, -.15) : T.color;
    const skin = u.flash > 0 ? '#ffffff' : type === 'giant' ? '#b59a86' : SKIN;
    ctx.save(); ctx.translate(u.x, u.y); ctx.scale(s * (1 + atk * .07), s * (1 - atk * .07));
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(0, 0, 17, 5, 0, 0, 7); ctx.fill();

    // ขา + รองเท้า
    R.limb(ctx, -5, -16, -5 + walk * 6, -4, T.dark, 7); R.limb(ctx, 5, -16, 5 - walk * 6, -4, T.dark, 7);
    R.clay(ctx, -5 + walk * 6 + 2 * d, -3, 7, 4, '#4a2e1a', 0, 1.5); R.clay(ctx, 5 - walk * 6 + 2 * d, -3, 7, 4, '#4a2e1a', 0, 1.5);

    const by = -30 - bob + breathe * .3;
    if (type === 'miner' && u.carry) { R.clay(ctx, -13 * d, by - 4, 11, 12, '#c9a25a'); R.clay(ctx, -13 * d, by - 15, 5, 3, '#f6c62e', 0, 1); }
    if (type === 'archer') R.slab(ctx, -14 * d - 4, by - 18, 8, 24, 3, '#7a5230', 1.5); // กระบอกธนู
    R.limb(ctx, -9 * d, by - 6, -12 * d, by + 8 + walk * 2, body, 6); // แขนหลัง

    // ลำตัว
    R.clay(ctx, 0, by, 14, 17, body);
    ctx.fillStyle = '#5e3a20'; ctx.fillRect(-13, by + 4, 26, 4); R.clay(ctx, 0, by + 6, 3.5, 3, '#e0c060', 0, 1); // เข็มขัด
    if (type === 'sword' || type === 'giant') R.clay(ctx, 2 * d, by - 6, 9, 8, '#c9d0d6', 0, 1.5); // เกราะอก

    // หัว
    const hx = 2 * d, hy = by - 24 + breathe * .4;
    R.clay(ctx, hx, hy, 12, 12, skin);
    ctx.fillStyle = 'rgba(255,120,120,.35)'; ctx.beginPath(); ctx.arc(hx + 7 * d, hy + 4, 3, 0, 7); ctx.fill(); // แก้มแดง
    for (const ex of [1.5, 7]) { // ตา
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(hx + ex * d, hy - 1, 3, 3.6, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#1f130b'; ctx.beginPath(); ctx.arc(hx + ex * d + d, hy - .5, 1.8, 0, 7); ctx.fill();
    }
    if (type !== 'miner') { ctx.strokeStyle = '#1f130b'; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(hx - .5 * d, hy - 7); ctx.lineTo(hx + 9 * d, hy - 5); ctx.stroke(); } // คิ้วดุ

    // หมวกตามประเภท
    if (type === 'miner') {
      R.clay(ctx, hx, hy - 8, 13, 8, '#f2c230'); ctx.fillStyle = '#f2c230'; ctx.fillRect(hx - 15, hy - 5, 30, 3);
      R.clay(ctx, hx + 8 * d, hy - 9, 3.5, 3.5, '#fff8c0', 0, 1);
    } else if (type === 'sword') {
      R.clay(ctx, hx, hy - 6, 13, 9, '#b8c0c8'); ctx.fillStyle = '#4a4f55'; ctx.fillRect(hx + 2 * d - (d < 0 ? 10 : 0), hy - 2, 10, 2);
      R.clay(ctx, hx - 5 * d, hy - 18, 4, 8, T.color, -.6 * d, 1.5); // พู่
    } else if (type === 'archer') {
      ctx.fillStyle = T.dark; ctx.strokeStyle = INK; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(hx - 13, hy); ctx.quadraticCurveTo(hx - 12, hy - 18, hx + 2 * d, hy - 16); ctx.quadraticCurveTo(hx + 14, hy - 12, hx + 13, hy - 4); ctx.quadraticCurveTo(hx, hy - 10, hx - 13, hy); ctx.fill(); ctx.stroke();
      R.clay(ctx, hx - 10 * d, hy - 16, 2.5, 8, '#f4f1e8', .7 * d, 1); // ขนนก
    } else if (type === 'giant') {
      R.clay(ctx, hx - 8, hy - 11, 3.5, 7, '#efe6d0', -.5, 1.5); R.clay(ctx, hx + 8, hy - 11, 3.5, 7, '#efe6d0', .5, 1.5); // เขา
      ctx.fillStyle = '#fff'; ctx.fillRect(hx + 3 * d - 1, hy + 6, 2, 3); ctx.fillRect(hx + 7 * d - 1, hy + 6, 2, 3); // เขี้ยว
    }

    // แขนหน้า + อาวุธ
    const sx = 9 * d, sy = by - 6, sw = (atk * 1.7 - .5) * d;
    ctx.save(); ctx.translate(sx, sy);
    if (type === 'miner') {
      ctx.rotate(u.state === 'mining' ? (Math.sin(t * 12) * .9 - .3) * d : .4 * d);
      R.limb(ctx, 0, 0, 0, 14, body, 6); R.limb(ctx, 0, 14, 0, -12, '#7a4f2a', 4);
      ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-10, -12); ctx.quadraticCurveTo(0, -18, 10, -12); ctx.stroke();
      ctx.strokeStyle = '#a7adb3'; ctx.lineWidth = 3.5; ctx.stroke();
    } else if (type === 'sword') {
      ctx.rotate(sw); R.limb(ctx, 0, 0, 8 * d, 8, body, 6);
      ctx.save(); ctx.translate(8 * d, 8); ctx.rotate(-.9 * d);
      R.slab(ctx, d > 0 ? 2 : -30, -3, 28, 6, [1, 4, 4, 1], '#dfe5ea', 1.5);
      R.slab(ctx, -2, -7, 4, 14, 2, '#8a6a2a', 1.5);
      ctx.restore();
    } else if (type === 'archer') {
      R.limb(ctx, 0, 0, 12 * d, 2, body, 6);
      ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(10 * d, 2, 16, d > 0 ? -1.2 : 1.94, d > 0 ? 1.2 : 4.34); ctx.stroke();
      ctx.strokeStyle = '#8a5a30'; ctx.lineWidth = 3; ctx.stroke();
      const pull = u.atkAnim > 0 ? 0 : 6;
      ctx.strokeStyle = '#eee'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(10 * d + Math.cos(1.2) * 16 * d, 2 - 15); ctx.lineTo((4 - pull) * d, 2); ctx.lineTo(10 * d + Math.cos(1.2) * 16 * d, 2 + 15); ctx.stroke();
    } else if (type === 'giant') {
      ctx.rotate(sw * 1.2); R.limb(ctx, 0, 0, 10 * d, 8, body, 8);
      R.limb(ctx, 10 * d, 8, 18 * d, -14, '#7a5230', 6); R.clay(ctx, 20 * d, -22, 10, 13, '#8a5a30', .4 * d);
      for (const k of [-1, 1]) R.clay(ctx, 20 * d + k * 7, -24, 2, 2, '#ccc', 0, 1);
    }
    ctx.restore();
    ctx.restore();
    if (u.hp < u.maxHp) R.hpBar(ctx, u.x, u.y - 75 * s, 30 * s, u.hp / u.maxHp, T.color);
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
