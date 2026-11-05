// ฉากหลัง 2D แบบหลายชั้น (parallax): ท้องฟ้า → ภูเขาไกล → เนินเขา → ทุ่งหญ้า → ถนนดิน
// ต้นไม้/หิน/พร็อพเป็นโมเดล 3D อยู่ใน nature3d.js · ธีมเลือกจาก LEVELS[i].theme
const THEMES = {
  forest: {
    sky: ['#4f9fe0', '#9fd0f2', '#e6f4f0'], sun: { x: .78, y: 80, r: 38, c: '#fff4c8', glow: 'rgba(255,240,190,.55)' },
    cloud: ['#ffffff', '#d6e4f0'], haze: '#cfe6f2',
    mount: { c: '#8aa4c2', dark: '#6f88a8', snow: '#f6f9ff', h: 190, y: 255 },
    hills: [{ c: '#86b48a', p: .18, h: 70, y: 300, trees: 'pine', tc: '#5f9670' }, { c: '#6aa45a', p: .36, h: 52, y: 335, trees: 'round', tc: '#4f8c46' }],
    meadow: ['#7cb653', '#5e9a3e'], grass: ['#93cc5c', '#5b963a'],
    dirt: { top: '#b88454', mid: '#9a6a40', bot: '#5c3a22', speck: '#7a5232', stone: '#8f8478', rut: 'rgba(70,40,20,.22)' },
    motes: 'leaf', light: { sky: 0xfff1dc, ground: 0x7a5638, sun: 0xffffff, sunI: 2.2, hemiI: 1.6 },
  },
  grave: {
    sky: ['#1f1d3c', '#4b3f6e', '#9c84a8'], sun: { x: .22, y: 85, r: 30, c: '#eeeaff', glow: 'rgba(200,190,255,.35)', moon: 1 },
    cloud: ['#8f86b0', '#5d5480'], haze: '#8a7aa0',
    mount: { c: '#463f60', dark: '#363050', snow: null, h: 170, y: 260 },
    hills: [{ c: '#3f4658', p: .18, h: 64, y: 300, trees: 'dead', tc: '#2c3040' }, { c: '#3b4a44', p: .36, h: 46, y: 335, trees: 'cross', tc: '#2a3530' }],
    meadow: ['#4b5a44', '#36432f'], grass: ['#5d6c4c', '#33402c'],
    dirt: { top: '#6a5a4e', mid: '#52443a', bot: '#2a201a', speck: '#3e322a', stone: '#6e6a66', rut: 'rgba(20,10,5,.25)' },
    fog: 'rgba(190,180,225,', motes: 'firefly', light: { sky: 0xb8b0ff, ground: 0x3a3040, sun: 0xd8d0ff, sunI: 1.5, hemiI: 1.5 },
  },
  beach: {
    sky: ['#f27f5a', '#ffbd84', '#fff0cc'], sun: { x: .7, y: 150, r: 52, c: '#fff2b8', glow: 'rgba(255,200,120,.6)' },
    cloud: ['#fff3e6', '#f0b89a'], haze: '#ffd8b0',
    mount: { c: '#c08a7a', dark: '#a87064', snow: null, h: 120, y: 250 },
    sea: { y: 262, c: ['#3a8fb8', '#2a6f98'], shine: 'rgba(255,240,200,.6)' },
    hills: [{ c: '#d8b27a', p: .2, h: 26, y: 322, trees: 'palm', tc: '#5f8a4a' }, { c: '#e3c28a', p: .38, h: 22, y: 348, trees: null }],
    meadow: ['#e8cc94', '#d2ae70'], grass: ['#a8c060', '#7a9a44'],
    dirt: { top: '#d8b47e', mid: '#c49a62', bot: '#8a6438', speck: '#b08850', stone: '#a89888', rut: 'rgba(110,70,30,.2)' },
    motes: null, light: { sky: 0xffe0c0, ground: 0x9a6a40, sun: 0xffe2b8, sunI: 2.3, hemiI: 1.5 },
  },
  lava: {
    sky: ['#140c18', '#3e1828', '#b0452e'], sun: { x: .3, y: 95, r: 34, c: '#ff8a5a', glow: 'rgba(255,90,40,.4)', moon: 1 },
    cloud: ['#5a3038', '#2e1a20'], haze: '#a04030',
    mount: { c: '#3a2428', dark: '#2a181c', snow: null, h: 200, y: 262, volcano: 1 },
    hills: [{ c: '#3a2a2a', p: .18, h: 60, y: 302, trees: 'spike', tc: '#241818' }, { c: '#4a3230', p: .36, h: 44, y: 336, trees: 'dead', tc: '#2e1e1c' }],
    meadow: ['#4e3a34', '#38261f'], grass: ['#6a4a3a', '#3e2a22'],
    dirt: { top: '#5a4038', mid: '#42302a', bot: '#1e1412', speck: '#2e201c', stone: '#5a4e4a', rut: 'rgba(0,0,0,.25)', lava: 1 },
    motes: 'ember', light: { sky: 0xffb090, ground: 0x502020, sun: 0xffc0a0, sunI: 1.8, hemiI: 1.4 },
  },
};

const Scenery = {
  cache: {},
  rand(seed) { return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646; },

  // ยอดเขา 2 แถว (สุ่มครั้งเดียวต่อธีม): แถวหลังสีจางกว่า
  peaks(th) {
    const r = this.rand(th.mount.h * 7 + 3), out = [];
    for (const row of [0, 1]) for (let x = -300 + row * 120; x < 2700; x += 160 + r() * 200) {
      const h = th.mount.h * (row ? .5 + r() * .4 : .7 + r() * .45), w = h * (1.1 + r() * .5);
      const jag = Array.from({ length: 4 }, () => (r() - .5) * .14);
      out.push({ x, h, w, row, jag, lean: (r() - .5) * .3 });
    }
    if (th.mount.volcano) { const v = out.filter(k => k.row)[4]; v.volcano = 1; v.h = th.mount.h * 1.2; v.w = v.h * 1.5; }
    return out;
  },

  // ลายพื้นถนน: ดินไล่สี + ร่องล้อ + กรวด (วาดครั้งเดียวเป็น pattern)
  ground(th) {
    const W = 512, H = VIEW_H - GROUND + 20, c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d'), d = th.dirt, r = this.rand(91);
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, d.top); gr.addColorStop(.35, d.mid); gr.addColorStop(1, d.bot);
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 900; i++) { g.fillStyle = r() < .5 ? d.speck : 'rgba(255,255,255,.06)'; g.globalAlpha = .25 + r() * .4; g.fillRect(r() * W, 14 + r() * H, 1 + r() * 3, 1 + r() * 2); }
    g.globalAlpha = 1;
    for (const y of [34, 50, 62]) { // ร่องล้อเกวียน
      g.strokeStyle = d.rut; g.lineWidth = 4 + r() * 3; g.beginPath();
      for (let x = 0; x <= W; x += 16) g.lineTo(x, y + Math.sin(x / W * Math.PI * 2 * 2) * 3);
      g.stroke();
    }
    for (let i = 0; i < 26; i++) { // ก้อนกรวด
      const x = r() * W, y = 20 + r() * (H - 30), rx = 2 + r() * 5, ry = rx * .6;
      g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(x + 1, y + 2, rx, ry, 0, 0, 7); g.fill();
      g.fillStyle = d.stone; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 7); g.fill();
      g.fillStyle = 'rgba(255,255,255,.3)'; g.beginPath(); g.ellipse(x - rx * .3, y - ry * .35, rx * .4, ry * .3, 0, 0, 7); g.fill();
    }
    if (d.lava) for (let i = 0; i < 5; i++) { // รอยแตกลาวา
      let x = r() * W, y = 30 + r() * (H - 50);
      g.strokeStyle = '#ff6a20'; g.shadowColor = '#ff4000'; g.shadowBlur = 8; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y);
      for (let k = 0; k < 6; k++) { x += 8 + r() * 14; y += (r() - .5) * 12; g.lineTo(x, y); }
      g.stroke(); g.shadowBlur = 0;
    }
    return c;
  },

  // ก้อนเมฆนุ่มๆ (เรนเดอร์ไว้ล่วงหน้า)
  cloud(th, seed) {
    const c = document.createElement('canvas'); c.width = 260; c.height = 110;
    const g = c.getContext('2d'), r = this.rand(seed);
    const blobs = Array.from({ length: 6 }, (_, i) => ({ x: 50 + i * 32 + r() * 10, y: 70 - Math.sin(i / 5 * Math.PI) * 26 - r() * 10, rr: 22 + Math.sin(i / 5 * Math.PI) * 16 + r() * 6 }));
    const gr = g.createLinearGradient(0, 20, 0, 100); gr.addColorStop(0, th.cloud[0]); gr.addColorStop(1, th.cloud[1]);
    g.fillStyle = gr;
    for (const b of blobs) { g.beginPath(); g.arc(b.x, b.y, b.rr, 0, 7); g.fill(); }
    g.fillRect(40, 70, 190, 22); g.beginPath(); g.ellipse(135, 92, 100, 8, 0, 0, 7); g.fill();
    g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(255,255,255,.35)';
    for (const b of blobs) { g.beginPath(); g.arc(b.x - b.rr * .3, b.y - b.rr * .35, b.rr * .55, 0, 7); g.fill(); }
    return c;
  },

  get(theme) {
    if (this.cache[theme]) return this.cache[theme];
    const th = THEMES[theme];
    return (this.cache[theme] = { th, peaks: this.peaks(th), ground: this.ground(th), clouds: [1, 2, 3, 4].map(i => this.cloud(th, i * 31)) });
  },

  ridge(x, h, seed) { return Math.sin(x * .0042 + seed) * h * .45 + Math.sin(x * .011 + seed * 2) * h * .22 + Math.sin(x * .023 + seed) * h * .08; },

  draw(ctx, cam, vw, lv, t) {
    const S = this.get(lv.theme), th = S.th;
    // ท้องฟ้า
    const sky = ctx.createLinearGradient(0, 0, 0, GROUND);
    sky.addColorStop(0, th.sky[0]); sky.addColorStop(.6, th.sky[1]); sky.addColorStop(1, th.sky[2]);
    ctx.fillStyle = sky; ctx.fillRect(0, 0, vw, VIEW_H);
    if (th.sun.moon) for (let i = 0; i < 60; i++) { // ดาว
      const x = (i * 197.3) % vw, y = (i * 71.7) % 220, a = .3 + .5 * Math.abs(Math.sin(t * 1.5 + i));
      ctx.fillStyle = `rgba(255,255,255,${a * (1 - y / 260)})`; ctx.fillRect(x, y, 1.6, 1.6);
    }
    // ดวงอาทิตย์/ดวงจันทร์ + แสงฟุ้ง
    const sx = vw * th.sun.x - cam * .02, sy = th.sun.y, glow = ctx.createRadialGradient(sx, sy, th.sun.r * .6, sx, sy, th.sun.r * 4);
    glow.addColorStop(0, th.sun.glow); glow.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = glow; ctx.fillRect(sx - th.sun.r * 4, sy - th.sun.r * 4, th.sun.r * 8, th.sun.r * 8);
    ctx.fillStyle = th.sun.c; ctx.beginPath(); ctx.arc(sx, sy, th.sun.r, 0, 7); ctx.fill();
    if (th.sun.moon) { ctx.fillStyle = 'rgba(0,0,0,.08)'; for (const [a, b, rr] of [[-8, -6, 7], [9, 5, 5], [-3, 12, 4]]) { ctx.beginPath(); ctx.arc(sx + a, sy + b, rr, 0, 7); ctx.fill(); } }
    // เมฆ (ลอยช้าๆ)
    for (let i = 0; i < 7; i++) {
      const img = S.clouds[i % 4], k = .55 + (i % 3) * .25, span = vw + 600;
      const x = ((i * 430 - cam * (.04 + i % 3 * .02) + t * (4 + i % 3 * 3)) % span + span) % span - 300;
      ctx.globalAlpha = .9; ctx.drawImage(img, x, 20 + (i * 53) % 130, 260 * k, 110 * k);
    }
    ctx.globalAlpha = 1;
    this.mountains(ctx, cam, vw, S, t);
    if (th.sea) this.sea(ctx, vw, th, t);
    // เนินเขา 2 ชั้น + ต้นไม้เงาบนสัน
    th.hills.forEach((h, i) => this.hill(ctx, cam, vw, h, i * 3.7 + 1, th));
    // ทุ่งหญ้าหน้าสุด (ต่อกับพื้นถนน)
    const md = ctx.createLinearGradient(0, GROUND - 60, 0, GROUND);
    md.addColorStop(0, th.meadow[0]); md.addColorStop(1, th.meadow[1]);
    ctx.fillStyle = md; ctx.beginPath(); ctx.moveTo(0, GROUND);
    for (let x = 0; x <= vw + 20; x += 20) ctx.lineTo(x, GROUND - 40 - this.ridge(x + cam * .6, 14, 9));
    ctx.lineTo(vw + 20, GROUND); ctx.fill();
    if (th.fog) for (let i = 0; i < 3; i++) { // หมอกลอยต่ำ
      const fy = GROUND - 70 + i * 22, fg = ctx.createLinearGradient(0, fy - 30, 0, fy + 30);
      fg.addColorStop(0, th.fog + '0)'); fg.addColorStop(.5, th.fog + (.22 + Math.sin(t * .5 + i) * .06) + ')'); fg.addColorStop(1, th.fog + '0)');
      ctx.fillStyle = fg; ctx.fillRect(0, fy - 30, vw, 60);
    }
    // ถนนดิน (pattern เลื่อนตามกล้อง)
    const pat = ctx.createPattern(S.ground, 'repeat-x'), off = -(cam % 512);
    ctx.save(); ctx.translate(off, GROUND - 8); ctx.fillStyle = pat; ctx.fillRect(-off, 0, vw, VIEW_H - GROUND + 20); ctx.restore();
    this.grassEdge(ctx, cam, vw, th);
    this.motes(ctx, cam, vw, th, t);
  },

  mountains(ctx, cam, vw, S, t) {
    const m = S.th.mount, span = 3000, base = m.y + 30;
    for (const row of [0, 1]) {
      const p = row ? .07 : .04, sh = ((cam * p) % span + span) % span;
      const light = row ? m.c : this.mix(m.c, S.th.haze, .35), dark = row ? m.dark : this.mix(m.dark, S.th.haze, .35);
      for (const k of S.peaks) {
        if (k.row !== row) continue;
        for (const rep of [0, span]) {
          const x = k.x - sh + rep;
          if (x + k.w < -10 || x - k.w > vw + 10) continue;
          const px = x + k.w * k.lean, py = base - k.h, J = k.jag;
          // สันเขาซ้าย-ขวาแบบหยักๆ
          const L = [[x - k.w, base], [x - k.w * .55, base - k.h * (.45 + J[0])], [x - k.w * .22, base - k.h * (.8 + J[1])], [px, py]];
          const R = [[px, py], [x + k.w * .3, base - k.h * (.72 + J[2])], [x + k.w * .62, base - k.h * (.38 + J[3])], [x + k.w, base]];
          ctx.fillStyle = light; ctx.beginPath(); ctx.moveTo(...L[0]); for (const q of [...L.slice(1), ...R.slice(1)]) ctx.lineTo(...q); ctx.fill();
          // ด้านเงา (ขวา) → ดูเป็นเหลี่ยมมีมิติ
          ctx.fillStyle = dark; ctx.beginPath(); ctx.moveTo(px, py); for (const q of R.slice(1)) ctx.lineTo(...q);
          ctx.lineTo(x + k.w * .05, base); ctx.lineTo(x + k.w * .02, base - k.h * .4); ctx.fill();
          if (m.snow && k.h > m.h * .6) { // หิมะบนยอด
            const sn = k.h * .26;
            ctx.fillStyle = m.snow; ctx.beginPath(); ctx.moveTo(px, py);
            ctx.lineTo(px + sn * .9, py + sn * .95); ctx.lineTo(px + sn * .45, py + sn * .7); ctx.lineTo(px + sn * .1, py + sn * 1.05);
            ctx.lineTo(px - sn * .35, py + sn * .75); ctx.lineTo(px - sn * .8, py + sn); ctx.fill();
            ctx.fillStyle = 'rgba(120,140,180,.35)'; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + sn * .9, py + sn * .95); ctx.lineTo(px + sn * .45, py + sn * .7); ctx.lineTo(px + sn * .1, py + sn * 1.05); ctx.fill();
          }
          if (k.volcano) this.volcano(ctx, px, py + 10, t);
        }
      }
    }
    // หมอกเชิงเขา
    const hz = ctx.createLinearGradient(0, base - 60, 0, base + 30);
    hz.addColorStop(0, 'rgba(0,0,0,0)'); hz.addColorStop(1, S.th.haze);
    ctx.globalAlpha = .55; ctx.fillStyle = hz; ctx.fillRect(0, base - 60, vw, GROUND - base + 60); ctx.globalAlpha = 1;
  },

  volcano(ctx, x, y, t) {
    const g = ctx.createRadialGradient(x, y, 2, x, y, 70); g.addColorStop(0, 'rgba(255,150,50,.9)'); g.addColorStop(1, 'rgba(255,60,20,0)');
    ctx.fillStyle = g; ctx.fillRect(x - 70, y - 70, 140, 140);
    ctx.strokeStyle = '#ff7a2a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 6, y); ctx.lineTo(x - 16, y + 50); ctx.lineTo(x - 12, y + 80); ctx.moveTo(x + 8, y); ctx.lineTo(x + 22, y + 60); ctx.stroke();
    for (let s = 0; s < 7; s++) {
      const k = (t * .12 + s / 7) % 1; ctx.fillStyle = `rgba(50,35,40,${.55 * (1 - k)})`;
      ctx.beginPath(); ctx.arc(x + Math.sin(k * 5 + s) * 14 + k * 60, y - 10 - k * 150, 12 + k * 36, 0, 7); ctx.fill();
    }
  },

  mix(a, b, k) {
    const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)), A = p(a), B = p(b);
    return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * k)).join(',')})`;
  },

  sea(ctx, vw, th, t) {
    const s = th.sea, g = ctx.createLinearGradient(0, s.y, 0, GROUND);
    g.addColorStop(0, s.c[0]); g.addColorStop(1, s.c[1]);
    ctx.fillStyle = g; ctx.fillRect(0, s.y, vw, GROUND - s.y);
    ctx.fillStyle = s.shine;
    const sx = vw * th.sun.x;
    for (let i = 0; i < 26; i++) { // แสงระยิบบนน้ำ
      const y = s.y + 4 + (i * 7) % 60, w = 30 - (y - s.y) * .2 + Math.sin(t * 2 + i) * 8;
      ctx.globalAlpha = .4 + Math.sin(t * 3 + i * 2) * .3; ctx.fillRect(sx + Math.sin(i * 3.3) * (20 + (y - s.y)), y, Math.max(4, w), 2);
    }
    ctx.globalAlpha = 1;
  },

  hill(ctx, cam, vw, h, seed, th) {
    const yAt = x => h.y - h.h * .5 - this.ridge(x + cam * h.p, h.h, seed);
    ctx.fillStyle = h.c; ctx.beginPath(); ctx.moveTo(0, GROUND);
    for (let x = 0; x <= vw + 20; x += 16) ctx.lineTo(x, yAt(x));
    ctx.lineTo(vw + 20, GROUND); ctx.fill();
    // ไฮไลต์สันเขา
    ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 3; ctx.beginPath();
    for (let x = 0; x <= vw + 20; x += 16) ctx.lineTo(x, yAt(x) + 3);
    ctx.stroke();
    if (!h.trees) return;
    const step = h.trees === 'round' ? 26 : h.trees === 'palm' ? 90 : h.trees === 'cross' ? 70 : 15, wx0 = cam * h.p;
    ctx.fillStyle = h.tc; ctx.strokeStyle = h.tc;
    for (let wx = Math.floor(wx0 / step) * step; wx < wx0 + vw + step; wx += step) {
      const n = Math.sin(wx * 12.9898 + seed) * 43758.5453, r = n - Math.floor(n);
      if (r < (h.trees === 'pine' ? .25 : .45)) continue;
      const x = wx - wx0 + (r - .5) * step * .6, y = yAt(x) + 4, s = .6 + r * .7;
      this.silhouette(ctx, h.trees, x, y, s, h.tc);
    }
  },

  silhouette(ctx, kind, x, y, s, c) {
    ctx.beginPath();
    if (kind === 'pine') { ctx.moveTo(x, y - 46 * s); ctx.lineTo(x + 11 * s, y); ctx.lineTo(x - 11 * s, y); ctx.fill(); }
    else if (kind === 'round') { ctx.arc(x, y - 22 * s, 15 * s, 0, 7); ctx.arc(x + 10 * s, y - 14 * s, 11 * s, 0, 7); ctx.fill(); ctx.fillRect(x - 2 * s, y - 10 * s, 4 * s, 12 * s); }
    else if (kind === 'spike') { ctx.moveTo(x - 6 * s, y); ctx.lineTo(x - 2 * s, y - 40 * s); ctx.lineTo(x + 6 * s, y); ctx.fill(); }
    else if (kind === 'cross') { ctx.fillRect(x - 1.5 * s, y - 24 * s, 3 * s, 24 * s); ctx.fillRect(x - 7 * s, y - 18 * s, 14 * s, 3 * s); }
    else if (kind === 'dead' || kind === 'palm') {
      ctx.lineCap = 'round'; ctx.lineWidth = 3 * s; ctx.beginPath(); ctx.moveTo(x, y);
      if (kind === 'dead') {
        ctx.lineTo(x + 2 * s, y - 40 * s); ctx.moveTo(x + 1 * s, y - 22 * s); ctx.lineTo(x - 12 * s, y - 34 * s);
        ctx.moveTo(x + 2 * s, y - 30 * s); ctx.lineTo(x + 14 * s, y - 42 * s); ctx.stroke();
      } else {
        ctx.quadraticCurveTo(x + 4 * s, y - 25 * s, x + 12 * s, y - 50 * s); ctx.stroke();
        for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; ctx.beginPath(); ctx.ellipse(x + 12 * s + Math.cos(a) * 12 * s, y - 50 * s + Math.sin(a) * 5 * s + 4 * s, 14 * s, 3.5 * s, a, 0, 7); ctx.fill(); }
      }
    }
  },

  // ขอบหญ้าระหว่างทุ่งกับถนน: แถบหญ้าหยัก + ใบหญ้า
  grassEdge(ctx, cam, vw, th) {
    const y = GROUND - 10, g = ctx.createLinearGradient(0, y - 10, 0, y + 12);
    g.addColorStop(0, th.grass[0]); g.addColorStop(1, th.grass[1]);
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, y - 6);
    for (let x = -(cam % 14); x <= vw + 14; x += 7) {
      const wx = x + cam, n = Math.sin(wx * 0.37) * 3 + Math.sin(wx * 1.7) * 2;
      ctx.lineTo(x, y + 8 + n);
    }
    ctx.lineTo(vw + 14, y - 6); ctx.fill();
    ctx.strokeStyle = th.grass[0]; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.beginPath();
    for (let x = -(cam % 9); x <= vw + 9; x += 9) {
      const wx = x + cam, n = Math.sin(wx * 7.13) * .5 + .5;
      ctx.moveTo(x, y + 2); ctx.lineTo(x + (n - .5) * 6, y - 6 - n * 7);
    }
    ctx.stroke();
    ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.fillRect(0, y + 10, vw, 6); // เงาใต้ขอบหญ้า
  },

  // ละอองบรรยากาศ: ใบไม้ปลิว / หิ่งห้อย / ประกายไฟ
  motes(ctx, cam, vw, th, t) {
    if (!th.motes) return;
    for (let i = 0; i < 18; i++) {
      const sp = vw + 100, ph = i * 1.37;
      let x, y;
      if (th.motes === 'ember') { x = ((i * 173 - cam * .5 + Math.sin(t + ph) * 30) % sp + sp) % sp - 50; y = GROUND - ((t * (20 + i % 5 * 8) + i * 40) % 340); }
      else if (th.motes === 'leaf') { x = ((i * 211 - cam * .6 + t * 30) % sp + sp) % sp - 50; y = 120 + ((t * (14 + i % 4 * 6) + i * 37) % 260); }
      else { x = ((i * 157 - cam * .6 + Math.sin(t * .7 + ph) * 40) % sp + sp) % sp - 50; y = GROUND - 30 - (i * 23 % 150) + Math.sin(t * 1.3 + ph) * 18; }
      ctx.save(); ctx.translate(x, y);
      if (th.motes === 'leaf') { ctx.rotate(t * 2 + ph); ctx.fillStyle = i % 2 ? '#e8a23a' : '#9ac24a'; ctx.beginPath(); ctx.ellipse(0, 0, 5, 2.5, 0, 0, 7); ctx.fill(); }
      else {
        const a = th.motes === 'ember' ? .5 + Math.sin(t * 6 + ph) * .4 : .4 + Math.sin(t * 3 + ph) * .5, c = th.motes === 'ember' ? '255,140,50' : '210,255,140';
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 7); g.addColorStop(0, `rgba(${c},${Math.max(0, a)})`); g.addColorStop(1, `rgba(${c},0)`);
        ctx.fillStyle = g; ctx.fillRect(-7, -7, 14, 14);
      }
      ctx.restore();
    }
  },
};
