// ต้นไม้ หิน และพร็อพ 3D แบบ low-poly (สีจากจุดยอด → 1 mesh ต่อชั้น เบามาก)
// 3 ชั้น: ไกล (parallax ช้ากว่า) · หลังถนน · หน้าสุด
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const rng = seed => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const C = new THREE.Color();

// ใส่สีให้รูปทรง (สุ่มความสว่างต่อหน้าเล็กน้อย ให้ดูเป็นเหลี่ยมมีมิติ)
function paint(geo, hex, r, jit = .12) {
  geo = geo.index ? geo.toNonIndexed() : geo;
  for (const k of Object.keys(geo.attributes)) if (k !== 'position' && k !== 'normal') geo.deleteAttribute(k);
  C.set(hex); const n = geo.attributes.position.count, a = new Float32Array(n * 3);
  for (let i = 0; i < n; i += 3) { const k = 1 + (r() - .5) * jit * 2; for (let j = 0; j < 3; j++) a.set([C.r * k, C.g * k, C.b * k], (i + j) * 3); }
  geo.setAttribute('color', new THREE.BufferAttribute(a, 3));
  return geo;
}
// ขยับจุดยอดแบบสุ่ม (จุดซ้ำขยับเท่ากัน ผิวไม่ฉีก) → รูปทรงดูเป็นธรรมชาติ
function lumpy(geo, r, amt = .25) {
  const p = geo.attributes.position, cache = {}, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i); const k = `${v.x.toFixed(2)},${v.y.toFixed(2)},${v.z.toFixed(2)}`;
    cache[k] ??= [(r() - .5) * amt, (r() - .5) * amt, (r() - .5) * amt];
    p.setXYZ(i, v.x * (1 + cache[k][0]), v.y * (1 + cache[k][1]), v.z * (1 + cache[k][2]));
  }
  return geo;
}
const T = (g, x, y, z) => g.translate(x, y, z);
const blob = (r, rad, x, y, z, sy = 1) => T(lumpy(new THREE.IcosahedronGeometry(rad, 1), r).scale(1, sy, 1), x, y, z);

// ---------- ชิ้นส่วนแต่ละแบบ (คืนค่าเป็นรายการ [geo, สี, เรืองแสง?]) ----------
const P = {
  pine(r, pal) {
    const out = [[T(new THREE.CylinderGeometry(3, 5, 26, 6), 0, 13, 0), pal.trunk]];
    const n = 3 + (r() * 2 | 0);
    for (let i = 0; i < n; i++) {
      const rad = 30 - i * (22 / n), cone = new THREE.ConeGeometry(rad, 40 - i * 4, 8);
      out.push([T(lumpy(cone, r, .12), 0, 30 + i * 22, 0), pal.pine[i % pal.pine.length]]);
    }
    return out;
  },
  oak(r, pal) {
    const out = [[T(new THREE.CylinderGeometry(4, 7, 46, 6), 0, 23, 0), pal.trunk],
      [T(new THREE.CylinderGeometry(2, 3, 22, 5).rotateZ(.8), 9, 36, 0), pal.trunk]];
    const leaf = pal.leaf;
    out.push([blob(r, 30, 0, 62, 0, .85), leaf[0]], [blob(r, 22, -22, 50, 6), leaf[1]], [blob(r, 22, 22, 54, -4), leaf[1]], [blob(r, 18, 4, 82, 4), leaf[2] || leaf[0]]);
    if (pal.fruit && r() < .5) for (let i = 0; i < 5; i++) out.push([T(new THREE.IcosahedronGeometry(3, 0), (r() - .5) * 44, 46 + r() * 30, 22 + r() * 6), pal.fruit]);
    return out;
  },
  bush(r, pal) {
    const out = [[blob(r, 15, 0, 9, 0, .8), pal.leaf[0]], [blob(r, 11, -14, 6, 4, .8), pal.leaf[1]], [blob(r, 11, 13, 7, -2, .8), pal.leaf[1]]];
    if (pal.flower) for (let i = 0; i < 4; i++) out.push([T(new THREE.IcosahedronGeometry(2.4, 0), (r() - .5) * 28, 8 + r() * 10, 12), pal.flower[i % pal.flower.length]]);
    return out;
  },
  rock(r, pal) {
    const s = .7 + r() * .8;
    return [[T(lumpy(new THREE.DodecahedronGeometry(14 * s, 0), r, .35).scale(1.3, .75, 1), 0, 6 * s, 0), pal.rock],
      [T(lumpy(new THREE.DodecahedronGeometry(7 * s, 0), r, .35), 14 * s, 3 * s, 6), pal.rock2 || pal.rock]];
  },
  dead(r, pal) {
    const out = [[T(new THREE.CylinderGeometry(2.5, 6, 60, 5), 0, 30, 0), pal.dead]];
    for (let i = 0; i < 4; i++) {
      const a = (i % 2 ? 1 : -1) * (.6 + r() * .5), y = 26 + i * 9, len = 18 + r() * 12;
      out.push([new THREE.CylinderGeometry(1, 2.2, len, 4).translate(0, len / 2, 0).rotateZ(a).rotateY(r() * 3).translate(0, y, 0), pal.dead]);
    }
    return out;
  },
  palm(r, pal) {
    const out = []; let x = 0, y = 0; const lean = (r() - .5) * .5;
    for (let i = 0; i < 6; i++) { // ลำต้นโค้งเป็นปล้อง
      const seg = new THREE.CylinderGeometry(3.4 - i * .25, 4 - i * .25, 14, 6).rotateZ(-lean * i * .4).translate(x, y + 7, 0);
      out.push([seg, i % 2 ? pal.trunk : pal.trunk2]); x += Math.sin(lean * i * .4) * 14; y += 13;
    }
    for (let i = 0; i < 7; i++) { // ใบมะพร้าวห้อยลง
      const a = i / 7 * Math.PI * 2;
      const fr = new THREE.ConeGeometry(6, 44, 4).scale(1, 1, .25).translate(0, 22, 0).rotateZ(-1.9).rotateY(a).translate(x, y + 2, 0);
      out.push([fr, pal.leaf[i % 2]]);
    }
    for (let i = 0; i < 3; i++) out.push([T(new THREE.IcosahedronGeometry(3.2, 0), x + (r() - .5) * 8, y - 3, 3 + r() * 3), pal.trunk]);
    return out;
  },
  tomb(r, pal) {
    const t = r() < .5;
    const out = t
      ? [[new THREE.BoxGeometry(16, 22, 6).translate(0, 11, 0), pal.rock], [new THREE.CylinderGeometry(8, 8, 6, 8, 1, false, -Math.PI / 2, Math.PI).rotateX(Math.PI / 2).rotateY(Math.PI / 2).rotateZ(Math.PI / 2).translate(0, 22, 0), pal.rock]]
      : [[new THREE.BoxGeometry(4, 30, 4).translate(0, 15, 0), pal.rock], [new THREE.BoxGeometry(18, 4, 4).translate(0, 22, 0), pal.rock]];
    out.push([new THREE.BoxGeometry(22, 3, 12).translate(0, 1, 4), pal.rock2 || pal.rock]);
    for (const [g] of out) g.rotateZ((r() - .5) * .25);
    return out;
  },
  fence(r, pal) {
    const out = [];
    for (let i = 0; i < 4; i++) out.push([new THREE.BoxGeometry(4, 24, 4).translate(i * 22, 12, 0).rotateZ((r() - .5) * .1), pal.trunk]);
    out.push([new THREE.BoxGeometry(70, 3, 2).translate(33, 18, 2), pal.trunk], [new THREE.BoxGeometry(70, 3, 2).translate(33, 9, 2), pal.trunk]);
    return out;
  },
  barrel(r, pal) {
    return [[new THREE.CylinderGeometry(8, 8, 18, 10).translate(0, 9, 0), pal.trunk], [new THREE.CylinderGeometry(8.6, 8.6, 2, 10).translate(0, 4, 0), pal.dead], [new THREE.CylinderGeometry(8.6, 8.6, 2, 10).translate(0, 14, 0), pal.dead],
      [new THREE.BoxGeometry(18, 16, 16).rotateY(.4).translate(20, 8, -6), pal.trunk2 || pal.trunk]];
  },
  spike(r, pal) {
    const out = [];
    for (let i = 0; i < 4; i++) {
      const h = 18 + r() * 30;
      out.push([new THREE.ConeGeometry(4 + r() * 3, h, 5).translate(0, h / 2, 0).rotateZ((r() - .5) * .6).translate((r() - .5) * 18, 0, (r() - .5) * 8), pal.crystal, true]);
    }
    out.push([T(lumpy(new THREE.DodecahedronGeometry(10, 0), r, .3).scale(1.4, .5, 1), 0, 2, 0), pal.rock]);
    return out;
  },
  lavarock(r, pal) {
    return [[T(lumpy(new THREE.DodecahedronGeometry(16, 0), r, .35).scale(1.3, .7, 1), 0, 6, 0), pal.rock],
      [T(new THREE.CylinderGeometry(9, 12, 2, 8), 22, 0.5, 8), '#ff6a20', true]];
  },
  grass(r, pal) {
    const out = [];
    for (let i = 0; i < 5; i++) { const h = 8 + r() * 9; out.push([new THREE.ConeGeometry(1.6, h, 3).translate(0, h / 2, 0).rotateZ((r() - .5) * .9).translate((r() - .5) * 10, 0, (r() - .5) * 4), pal.grass[i % 2]]); }
    return out;
  },
  flower(r, pal) {
    const out = P.grass(r, pal), c = pal.flower ? pal.flower[r() * pal.flower.length | 0] : pal.grass[0];
    for (let i = 0; i < 3; i++) out.push([T(new THREE.IcosahedronGeometry(2.6, 0), (r() - .5) * 12, 12 + r() * 6, 2), c]);
    return out;
  },
  mushroom(r, pal) {
    return [[new THREE.CylinderGeometry(2.5, 3, 9, 6).translate(0, 4.5, 0), '#f3e6cc'], [new THREE.SphereGeometry(7, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2).translate(0, 8, 0), '#d83a2e'],
      [new THREE.IcosahedronGeometry(1.3, 0).translate(-2, 13, 5), '#ffffff'], [new THREE.IcosahedronGeometry(1.2, 0).translate(3, 12, 5), '#ffffff']];
  },
  skull(r, pal) {
    return [[new THREE.IcosahedronGeometry(4, 1).scale(1, .9, 1).translate(0, 4, 0), '#e8e0cc'], [new THREE.BoxGeometry(22, 2, 2).rotateY(.6).translate(8, 1, -4), '#e8e0cc']];
  },
};

// ---------- ชุดของแต่ละธีม ----------
const PAL = {
  forest: { trunk: '#7a4e2c', pine: ['#2f6f44', '#3c8450', '#4b9a5c'], leaf: ['#5aa040', '#4a8f36', '#6fb84c'], rock: '#8a8580', rock2: '#77726c', grass: ['#7cbc4a', '#5a9a34'], flower: ['#ffe14a', '#ff7aa0', '#ffffff', '#b38cff'], fruit: '#e8402e', dead: '#6a5040' },
  grave: { trunk: '#4a3a34', pine: ['#2c3c3e', '#34484a', '#3e5454'], leaf: ['#3c4c40', '#33423a'], rock: '#7a7884', rock2: '#5f5e6a', grass: ['#5a6848', '#3e4a32'], flower: ['#b090ff'], dead: '#4e4440' },
  beach: { trunk: '#a07848', trunk2: '#8a6438', leaf: ['#4f9a3c', '#3e8530'], rock: '#a89a8c', rock2: '#8f8274', grass: ['#9cbc54', '#7a9a3a'], flower: ['#ff6a8a', '#fff'], dead: '#5a4a3a' },
  lava: { trunk: '#3a2a26', pine: ['#2a2224'], leaf: ['#3a2a26', '#2e2220'], rock: '#3e3434', rock2: '#2e2626', grass: ['#5a3a2e', '#3e2a22'], crystal: '#ff5a2a', dead: '#2e2420' },
};
// [ชนิด, น้ำหนัก] ต่อชั้น
const MIX = {
  forest: { far: [['pine', 6], ['oak', 4]], mid: [['oak', 4], ['pine', 3], ['bush', 3], ['rock', 1], ['fence', 1], ['mushroom', 1]], front: [['grass', 5], ['flower', 3], ['rock', 1], ['mushroom', 1]] },
  grave: { far: [['dead', 5], ['pine', 4]], mid: [['dead', 3], ['tomb', 5], ['rock', 1], ['pine', 1]], front: [['grass', 5], ['rock', 2], ['skull', 1], ['flower', 1]] },
  beach: { far: [['palm', 6], ['bush', 3]], mid: [['palm', 4], ['rock', 2], ['bush', 2], ['barrel', 1]], front: [['grass', 3], ['rock', 2], ['flower', 1]] },
  lava: { far: [['dead', 4], ['spike', 3], ['rock', 3]], mid: [['lavarock', 3], ['rock', 2], ['dead', 3], ['spike', 2]], front: [['spike', 2], ['grass', 4], ['skull', 1], ['rock', 1]] },
};
const pick = (r, list) => { let s = list.reduce((a, b) => a + b[1], 0) * r(); for (const [k, w] of list) if ((s -= w) <= 0) return k; return list[0][0]; };

const litMat = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: .9 });
const glowMat = new THREE.MeshBasicMaterial({ vertexColors: true });

function layer(theme, which, items) {
  const r = rng({ far: 5, mid: 17, front: 29 }[which] + theme.length * 101), pal = PAL[theme], lit = [], glow = [];
  for (const it of items) {
    const kind = it.kind || pick(r, MIX[theme][which]);
    const m = new THREE.Matrix4().compose(new THREE.Vector3(it.x, it.y, it.z), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), (r() - .5) * 1.2), new THREE.Vector3().setScalar(it.s));
    for (const [geo, col, gl] of P[kind](r, pal)) (gl ? glow : lit).push(paint(geo, col, r).applyMatrix4(m));
  }
  const g = new THREE.Group();
  for (const [list, mat] of [[lit, litMat], [glow, glowMat]]) if (list.length) { const mesh = new THREE.Mesh(mergeGeometries(list), mat); mesh.frustumCulled = false; g.add(mesh); }
  return g;
}

// สร้างฉากทั้งด่าน · keep = ช่วง x ที่ห้ามวางของชั้นกลาง (ปราสาท/เหมือง)
export function buildNature(theme, world, keep) {
  const r = rng(77 + theme.length), layers = [];
  const free = x => !keep.some(([a, b]) => x > a && x < b);
  // ชั้นไกล: แนวต้นไม้หนาแน่น เลื่อนช้ากว่าโลก (p = .8)
  const far = [];
  for (let x = -100; x < world * .8 + 1400; x += 38 + r() * 46) far.push({ x, y: -GROUND + 36 + r() * 10, z: -900 - r() * 60, s: .55 + r() * .3 });
  layers.push({ g: layer(theme, 'far', far), p: .8 });
  // ชั้นกลาง: หลังถนน
  const mid = [];
  for (let x = 0; x < world; x += 70 + r() * 110) if (free(x)) mid.push({ x, y: -GROUND + 6 + r() * 6, z: -300 - r() * 120, s: .85 + r() * .45 });
  layers.push({ g: layer(theme, 'mid', mid), p: 1 });
  // ชั้นหน้า: หญ้า ดอกไม้ ก้อนหิน ใกล้ขอบล่างจอ
  const front = [];
  for (let x = 0; x < world; x += 50 + r() * 90) front.push({ x, y: -GROUND - 60 - r() * 70, z: 600, s: .9 + r() * .6 });
  layers.push({ g: layer(theme, 'front', front), p: 1 });
  return layers;
}
