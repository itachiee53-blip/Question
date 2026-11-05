// โมเดลฉากที่สร้างด้วยโค้ด (low-poly ให้เข้ากับตัวละคร): ปราสาท / เหมืองแร่ / อุปกรณ์ถือ
// หน่วยเป็น px ของเกม · ด้านหน้าของโมเดลหันเข้าหากล้อง (+z)
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// สุ่มแบบกำหนดเมล็ด → โมเดลออกมาเหมือนเดิมทุกครั้ง
const rng = seed => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

// ---------- เท็กซ์เจอร์ (วาดด้วย canvas ไม่ต้องโหลดไฟล์) ----------
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4;
  return t;
}

const stoneTex = canvasTex(256, 256, (g, w, h) => {
  const r = rng(7);
  g.fillStyle = '#6f6860'; g.fillRect(0, 0, w, h); // ปูน
  for (let row = 0, y = 0; y < h; row++, y += 32) {
    for (let x = row % 2 ? -32 : 0; x < w; x += 64) {
      const v = 175 + r() * 50 | 0, tint = r() * 14 - 7;
      g.fillStyle = `rgb(${v + tint},${v - 4},${v - 12 - tint})`;
      g.beginPath(); g.roundRect(x + 3, y + 3, 58, 26, 5); g.fill();
      g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(x + 6, y + 5, 50, 4);   // ขอบบนสว่าง
      g.fillStyle = 'rgba(0,0,0,.16)'; g.fillRect(x + 6, y + 23, 52, 4);        // ขอบล่างมืด
      for (let i = 0; i < 6; i++) { g.fillStyle = `rgba(0,0,0,${r() * .12})`; g.fillRect(x + 4 + r() * 52, y + 4 + r() * 22, 3, 2); }
    }
  }
});

const woodTex = canvasTex(128, 128, (g, w, h) => {
  const r = rng(3);
  for (let x = 0; x < w; x += 32) {
    const v = 120 + r() * 30 | 0;
    g.fillStyle = `rgb(${v},${v * .62 | 0},${v * .36 | 0})`; g.fillRect(x, 0, 32, h);
    g.strokeStyle = 'rgba(40,20,8,.35)'; g.lineWidth = 1.5;
    for (let i = 0; i < 4; i++) { g.beginPath(); const xx = x + 5 + r() * 22; g.moveTo(xx, 0); g.bezierCurveTo(xx + 4, h * .3, xx - 4, h * .7, xx + 2, h); g.stroke(); }
    g.fillStyle = 'rgba(30,15,5,.7)'; g.fillRect(x, 0, 2, h);
  }
});

// ---------- วัสดุ ----------
const M = {
  stone: new THREE.MeshStandardMaterial({ map: stoneTex, color: 0xf2ece2, roughness: .95 }),
  darkStone: new THREE.MeshStandardMaterial({ map: stoneTex, color: 0xb4aa9c, roughness: .95 }),
  trim: new THREE.MeshStandardMaterial({ color: 0xd8cfc0, roughness: .9, flatShading: true }),
  wood: new THREE.MeshStandardMaterial({ map: woodTex, color: 0xffffff, roughness: .9 }),
  darkWood: new THREE.MeshStandardMaterial({ color: 0x5a3820, roughness: .9, flatShading: true }),
  iron: new THREE.MeshStandardMaterial({ color: 0x4a4e54, roughness: .45, metalness: .7, flatShading: true }),
  hole: new THREE.MeshBasicMaterial({ color: 0x1c120c }),
  gold: new THREE.MeshStandardMaterial({ color: 0xffcf3a, roughness: .35, metalness: .25, emissive: 0xb07000, emissiveIntensity: .5, flatShading: true }),
  rock: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .95, flatShading: true }),
  fire: new THREE.MeshBasicMaterial({ color: 0xffb340 }),
};

// ---------- ตัวช่วยสร้างรูปทรง ----------
// UV แบบฉายตามทิศของผิว → ลายอิฐขนาดเท่ากันทุกชิ้น ไม่ยืด
function boxUV(geo, size) {
  const p = geo.attributes.position, n = geo.attributes.normal, uv = geo.attributes.uv;
  for (let i = 0; i < p.count; i++) {
    const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i));
    const [u, v] = ay > ax && ay > az ? [p.getX(i), p.getZ(i)] : ax > az ? [p.getZ(i), p.getY(i)] : [p.getX(i), p.getY(i)];
    uv.setXY(i, u / size, v / size);
  }
  return geo;
}
const box = (w, h, d, x = 0, y = 0, z = 0, uv = 128) => boxUV(new THREE.BoxGeometry(w, h, d).translate(x, y, z), uv);
function cyl(rt, rb, h, seg, x = 0, y = 0, z = 0, uv = 128) {
  const g = new THREE.CylinderGeometry(rt, rb, h, seg).translate(x, y, z), a = g.attributes.uv;
  for (let i = 0; i < a.count; i++) a.setXY(i, a.getX(i) * Math.PI * 2 * rb / uv, a.getY(i) * h / uv);
  return g;
}
function arch(w, h, d, x, y, z) { // รูปประตูโค้ง
  const s = new THREE.Shape(), r = w / 2;
  s.moveTo(-r, 0); s.lineTo(-r, h - r); s.absarc(0, h - r, r, Math.PI, 0, true); s.lineTo(r, 0); s.lineTo(-r, 0);
  return boxUV(new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false, curveSegments: 10 }).translate(x, y, z), 64);
}

// รวมชิ้นที่ใช้วัสดุเดียวกันเป็น mesh เดียว (draw call น้อย เล่นมือถือลื่น)
class Kit {
  constructor() { this.parts = new Map(); }
  add(mat, ...geos) { if (!this.parts.has(mat)) this.parts.set(mat, []); this.parts.get(mat).push(...geos); return this; }
  build(group = new THREE.Group()) {
    for (const [mat, geos] of this.parts) {
      const m = new THREE.Mesh(mergeGeometries(geos.map(g => (g.index ? g.toNonIndexed() : g)).map(g => { g.deleteAttribute('color') ; return g; })), mat);
      m.frustumCulled = false; group.add(m);
    }
    return group;
  }
}

// ป้อมกลม: ฐานบาน · ตัวหอ · เชิงเทิน · ช่องธนู · หลังคากรวยสีทีม · ธง
function roundTower(kit, team, x, z, r, h) {
  kit.add(M.darkStone, cyl(r, r + 8, 26, 12, x, 13, z));
  kit.add(M.stone, cyl(r, r, h - 26, 12, x, 26 + (h - 26) / 2, z));
  kit.add(M.trim, cyl(r + 7, r, 12, 12, x, h + 6, z));
  kit.add(M.stone, cyl(r + 7, r + 7, 10, 12, x, h + 17, z));
  for (let i = 0; i < 10; i++) {
    const a = i / 10 * Math.PI * 2 + .3;
    kit.add(M.stone, box(11, 14, 9, x + Math.sin(a) * (r + 3), h + 29, z + Math.cos(a) * (r + 3)).rotateY(0));
  }
  for (const [yy, s] of [[h * .45, 1], [h * .75, .85]]) {
    kit.add(M.trim, arch(14 * s, 26 * s, 4, x, yy - 2, z + r - 2));
    kit.add(M.hole, arch(8 * s, 20 * s, 4, x, yy, z + r));
  }
  const roof = new THREE.ConeGeometry(r + 14, r * 2.1, 12).translate(x, h + 22 + r * 1.05, z);
  team.add(roof);
  kit.add(M.gold, new THREE.SphereGeometry(5, 8, 6).translate(x, h + 24 + r * 2.1, z));
  kit.add(M.darkWood, cyl(1.6, 1.6, 34, 5, x, h + 40 + r * 2.1, z));
  return { x, y: h + 52 + r * 2.1, z };
}

// ธงโบกด้วยการขยับจุดยอด
function makeFlag(color, w = 34, h = 20) {
  const geo = new THREE.PlaneGeometry(w, h, 8, 2).translate(w / 2, 0, 0);
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, side: THREE.DoubleSide, roughness: .8 }));
  m.userData.base = geo.attributes.position.array.slice(); m.frustumCulled = false;
  return m;
}
export function waveFlag(m, t) {
  const a = m.geometry.attributes.position, b = m.userData.base;
  for (let i = 0; i < a.count; i++) { const x = b[i * 3]; a.setZ(i, Math.sin(x * .2 - t * 6) * x * .12); a.setY(i, b[i * 3 + 1] - x * x * .004); }
  a.needsUpdate = true; m.geometry.computeVertexNormals();
}

// ผ้าแขวนหน้าประตู: สีทีม + ตราโล่
function bannerTex(color) {
  return canvasTex(64, 128, (g, w, h) => {
    g.fillStyle = color; g.beginPath(); g.moveTo(0, 0); g.lineTo(w, 0); g.lineTo(w, h); g.lineTo(w / 2, h - 22); g.lineTo(0, h); g.fill();
    g.strokeStyle = '#f6d36a'; g.lineWidth = 4; g.stroke();
    g.fillStyle = '#f6d36a'; g.beginPath(); g.moveTo(16, 30); g.lineTo(48, 30); g.lineTo(48, 56); g.quadraticCurveTo(48, 74, 32, 82); g.quadraticCurveTo(16, 74, 16, 56); g.fill();
    g.fillStyle = color; g.fillRect(29, 36, 6, 38); g.fillRect(21, 46, 22, 6);
  });
}

// ---------- ปราสาท ----------
export function buildCastle(teamColor) {
  const kit = new Kit(), col = new THREE.Color(teamColor), g = new THREE.Group();
  const roofMat = new THREE.MeshStandardMaterial({ color: col, roughness: .7, flatShading: true });
  const teamGeos = [];
  const team = { add: geo => teamGeos.push(geo) };
  const W = 160, H = 140, D = 70, TX = 96;

  kit.add(M.darkStone, box(300, 16, 120, 0, 8, 0));                 // ฐานรากหิน
  kit.add(M.stone, box(W, H, D, 0, 16 + H / 2, -8));               // กำแพงประตู
  kit.add(M.trim, box(W + 8, 8, D + 8, 0, 16 + H + 4, -8));         // ขอบบนกำแพง
  for (let i = 0; i < 7; i++) {                                     // เชิงเทินหน้า-หลัง
    const x = -W / 2 + 10 + i * (W - 20) / 6;
    kit.add(M.stone, box(15, 16, 10, x, 16 + H + 16, D / 2 - 6), box(15, 16, 10, x, 16 + H + 16, -D / 2 - 10));
  }
  // ประตูโค้ง: กรอบหิน → ช่องมืด → บานไม้ → ซี่ลูกกรง
  kit.add(M.trim, arch(78, 104, 6, 0, 16, D / 2 - 8));
  kit.add(M.hole, arch(62, 92, 2, 0, 16, D / 2 - 2));
  kit.add(M.wood, arch(56, 70, 3, 0, 16, D / 2 - 4));
  for (let i = -2; i <= 2; i++) kit.add(M.iron, box(3, 88, 3, i * 11, 16 + 44 + 18, D / 2 + 1));
  for (const y of [50, 74, 98]) kit.add(M.iron, box(58, 3, 3, 0, y, D / 2 + 1));
  // หน้าต่างบนกำแพง
  for (const x of [-52, 52]) { kit.add(M.trim, arch(18, 30, 3, x, 108, D / 2 - 8)); kit.add(M.hole, arch(11, 22, 3, x, 111, D / 2 - 6)); }
  // คบเพลิงข้างประตู
  const fires = [];
  for (const x of [-50, 50]) {
    kit.add(M.darkWood, box(4, 16, 4, x, 80, D / 2 - 2).rotateX(0));
    kit.add(M.iron, cyl(6, 3, 7, 6, x, 90, D / 2));
    const f = new THREE.Mesh(new THREE.ConeGeometry(5, 14, 6), M.fire); f.position.set(x, 100, D / 2); f.frustumCulled = false;
    fires.push(f); g.add(f);
  }
  // ป้อมกลม 2 ข้าง
  const tops = [roundTower(kit, team, -TX, 4, 40, 175), roundTower(kit, team, TX, 4, 40, 175)];
  kit.build(g);
  const roof = new THREE.Mesh(mergeGeometries(teamGeos.map(x => x.toNonIndexed())), roofMat); roof.frustumCulled = false; g.add(roof);
  const flags = tops.map(p => { const f = makeFlag(col); f.position.set(p.x + 1, p.y + 8, p.z); g.add(f); return f; });
  // ผ้าแขวนเหนือประตู
  const ban = new THREE.Mesh(new THREE.PlaneGeometry(30, 60), new THREE.MeshStandardMaterial({ map: bannerTex(teamColor), transparent: true, alphaTest: .5, side: THREE.DoubleSide }));
  ban.position.set(0, 16 + H - 34, D / 2 - 2 + 1); g.add(ban);
  return { g, flags, fires, roofMat, top: H + 16 };
}

// อัปเกรดป้อมธนู: หอสี่เหลี่ยมบนกำแพง หลังคาไม้สีทีม
export function buildArcherTower(teamColor) {
  const kit = new Kit(), g = new THREE.Group();
  kit.add(M.stone, box(56, 50, 46, 0, 25, 0));
  kit.add(M.trim, box(64, 6, 54, 0, 53, 0));
  for (const [x, z] of [[-26, 22], [26, 22], [-26, -22], [26, -22]]) kit.add(M.darkWood, box(5, 34, 5, x, 73, z));
  kit.add(M.hole, arch(10, 24, 3, -14, 14, 23), arch(10, 24, 3, 14, 14, 23));
  kit.build(g);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(48, 40, 4).rotateY(Math.PI / 4).translate(0, 108, 0),
    new THREE.MeshStandardMaterial({ color: teamColor, roughness: .7, flatShading: true }));
  g.add(roof);
  return g;
}

// อัปเกรดกำแพง: กำแพงหินขวางทาง + ขวากไม้ด้านหน้า
export function buildFrontWall() {
  const kit = new Kit(), g = new THREE.Group();
  kit.add(M.stone, box(28, 70, 150, 0, 35, 0));
  kit.add(M.trim, box(34, 6, 156, 0, 73, 0));
  for (let i = 0; i < 6; i++) kit.add(M.stone, box(12, 14, 14, 9, 83, -62 + i * 25), box(12, 14, 14, -9, 83, -62 + i * 25));
  for (let i = 0; i < 5; i++) {
    const z = -55 + i * 28;
    kit.add(M.wood, cyl(0, 3.5, 46, 5, 0, 0, 0).rotateZ(-.9).translate(30, 18, z));
    kit.add(M.wood, cyl(0, 3.5, 46, 5, 0, 0, 0).rotateZ(-.9).rotateY(.5).translate(30, 18, z + 6));
  }
  kit.build(g);
  return g;
}

// ---------- เหมืองแร่: ก้อนหินผา + สายแร่ทอง + รถเข็นแร่ ----------
function rockGeo(r, rad, sx = 1, sy = 1, sz = 1) {
  const geo = new THREE.IcosahedronGeometry(rad, 1), p = geo.attributes.position, colors = [];
  const key = v => `${v.x.toFixed(2)},${v.y.toFixed(2)},${v.z.toFixed(2)}`, cache = {}, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i); const k = key(v);
    cache[k] ??= 1 + (r() - .5) * .32; // จุดซ้ำใช้ค่าเดียวกัน → ผิวไม่แตก
    v.multiplyScalar(cache[k]); v.y = Math.max(v.y, -rad * .35);
    p.setXYZ(i, v.x * sx, v.y * sy, v.z * sz);
  }
  for (let i = 0; i < p.count; i += 3) { // สีต่อหน้า ให้ดูเป็นหินแกะสลัก
    const s = .8 + r() * .35, c = [.2 * s, .175 * s, .155 * s];
    for (let j = 0; j < 3; j++) colors.push(...c);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}

export function buildMine(dir) {
  const r = rng(11), g = new THREE.Group(), kit = new Kit(), rocks = [];
  // ก้อนหินกองกันเป็นผา (ยอดสูงด้านหลัง)
  for (const [x, y, z, rad, sx, sy] of [[0, 0, -30, 62, 1.25, 1], [-52, 0, 0, 40, 1.1, .85], [48, 0, -6, 44, 1, .9], [-14, 48, -40, 42, .9, 1.1], [24, 30, 10, 30, 1, .8], [-80, 0, 18, 22, 1.2, .7], [84, 0, 14, 20, 1.1, .8]]) {
    const geo = rockGeo(r, rad, sx, sy, 1).translate(x, y + rad * .3, z); rocks.push(geo);
  }
  const rock = new THREE.Mesh(mergeGeometries(rocks.map(x => x.toNonIndexed())), M.rock); rock.frustumCulled = false; g.add(rock);
  // ผลึกทอง ปักออกจากผิวหิน (เก็บตำแหน่งไว้ทำประกายระยิบ)
  const sparks = [], crystals = [];
  const spots = [[-30, 50, 26], [-6, 70, 22], [20, 46, 34], [38, 66, 18], [-50, 30, 34], [56, 28, 34], [0, 104, -6], [-26, 92, -2], [32, 86, -4], [6, 26, 46], [-70, 14, 34], [72, 16, 30]];
  for (const [x, y, z] of spots) {
    const cl = new THREE.Group(), mat = M.gold.clone();
    for (let i = 0; i < 3; i++) {
      const h = 10 + r() * 12;
      const c = new THREE.Mesh(new THREE.OctahedronGeometry(1, 0).scale(5 + r() * 3, h * .8, 5 + r() * 3), mat);
      c.rotation.set((r() - .5) * 1.2, r() * 3, (r() - .5) * 1.4); c.position.set((r() - .5) * 8, 0, (r() - .5) * 4);
      cl.add(c);
    }
    cl.position.set(x, y, z); cl.rotation.z = -x * .006; g.add(cl); crystals.push(cl);
    sparks.push({ dx: x, dy: y + 6 });
  }
  // ไม้ค้ำปากอุโมงค์เหมือง (ด้านไกลจากฐาน)
  const ex = 0;
  kit.add(M.hole, arch(44, 54, 2, ex, 0, 40));
  kit.add(M.wood, box(7, 58, 7, ex - 25, 29, 44, 40), box(7, 58, 7, ex + 25, 29, 44, 40), box(64, 8, 9, ex, 60, 44, 40));
  // รางและรถเข็นแร่
  const cx = 64;
  kit.add(M.darkWood, box(110, 3, 4, cx, 1.5, 54), box(110, 3, 4, cx, 1.5, 70));
  for (let i = 0; i < 6; i++) kit.add(M.wood, box(6, 3, 26, cx - 50 + i * 20, 1, 62, 40));
  kit.add(M.wood, box(40, 18, 24, cx, 17, 62, 30), box(44, 3, 28, cx, 27, 62, 30));
  kit.add(M.iron, box(46, 3, 3, cx, 24, 75), box(46, 3, 3, cx, 12, 75));
  for (const [x, z] of [[-13, 50], [13, 50], [-13, 75], [13, 75]]) kit.add(M.iron, cyl(6, 6, 3, 10, 0, 0, 0).rotateX(Math.PI / 2).translate(cx + x, 7, z));
  // แร่ทองล้นรถ + กระจายบนพื้น
  for (let i = 0; i < 9; i++) kit.add(M.gold, new THREE.DodecahedronGeometry(4 + r() * 3, 0).translate(cx - 14 + r() * 28, 29 + r() * 6, 54 + r() * 16));
  for (let i = 0; i < 8; i++) kit.add(M.gold, new THREE.DodecahedronGeometry(2.5 + r() * 2, 0).translate(-90 + r() * 180, 2, 30 + r() * 40));
  // จอบปักหิน
  const pick = buildPickaxe(); pick.scale.setScalar(44); pick.position.set(-58, 40, 28); pick.rotation.set(.2, .3, 2.4); g.add(pick);
  kit.build(g);
  g.scale.set(1.25 * dir, 1.25, 1.25); // ขยาย + กลับด้านให้รถเข็นอยู่ฝั่งไกลจากฐาน
  for (const s of sparks) { s.dx *= 1.25 * dir; s.dy *= 1.25; }
  return { g, sparks, crystals };
}

// ---------- จอบขุดแร่ (ยาว 1 หน่วย ด้ามตามแกน +y ด้ามจับอยู่ที่จุดกำเนิด) ----------
let pickGeo;
export function buildPickaxe() {
  if (!pickGeo) {
    const handle = cyl(.035, .045, 1, 6, 0, .38, 0, 1);
    const head = new THREE.TorusGeometry(.36, .045, 5, 10, 1.9).rotateZ(Math.PI / 2 - .95).translate(0, .52, 0);
    const tips = [new THREE.ConeGeometry(.045, .14, 5).rotateZ(-2.52).translate(.3, .72, 0),
      new THREE.ConeGeometry(.045, .14, 5).rotateZ(2.52).translate(-.3, .72, 0)];
    const collar = new THREE.BoxGeometry(.1, .12, .1).translate(0, .86, 0);
    const n = g => g.toNonIndexed();
    pickGeo = { wood: mergeGeometries([n(handle)]), iron: mergeGeometries([n(head), ...tips.map(n), n(collar)].map(g => { for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k); return g; })) };
  }
  const g = new THREE.Group();
  for (const [k, mat] of [['wood', M.darkWood], ['iron', M.iron]]) { const m = new THREE.Mesh(pickGeo[k], mat); m.frustumCulled = false; g.add(m); }
  return g;
}

// ก้อนแร่ทองที่คนงานถือกลับฐาน
export function buildOre() {
  const m = new THREE.Mesh(new THREE.DodecahedronGeometry(1, 0).scale(1, .8, .9), M.gold); m.frustumCulled = false;
  return m;
}
