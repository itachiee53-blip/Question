// แสดงผลตัวละครและป้อมด้วยโมเดล 3D (three.js) ซ้อนบนฉาก 2D
// กล้องแบบ orthographic ให้พิกัด 1 หน่วย = 1 px ของเกม → ใช้ตำแหน่งเดียวกับระบบเกมได้ตรงๆ
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { buildCastle, buildArcherTower, buildFrontWall, buildMine, buildPickaxe, buildOre, waveFlag } from './props3d.js';

// โหลดตอนเปิดเกม: ฝ่ายเรา (ป้อม/เหมืองสร้างด้วยโค้ดใน props3d.js) · โมเดลศัตรูโหลดเฉพาะด่านที่เล่น (ประหยัดเน็ต)
const COMMON = ['miner', 'sword', 'archer', 'wizard', 'horse', 'cleric', 'knight'];
const TURN = .55; // หันเฉียง 3/4 ให้เห็นหน้า
const MINE_OFS = 70; // เหมืองอยู่ถัดจากจุดยืนขุดไปทางศัตรู → คนงานหันหน้าเข้าหินพอดี
const AX = new THREE.Vector3(-1, 0, 0); // แกนยกแขน (แกนข้างลำตัวของโมเดล)
const PICK_ROT = [0, Math.PI / 2, 0];
const _q = new THREE.Quaternion(), _p = new THREE.Quaternion(), _r = new THREE.Quaternion(), _a = new THREE.Vector3();
// หมุนกระดูกรอบแกนที่กำหนดในพื้นที่ของตัวละคร
function rotAround(bone, root, axis, ang) {
  bone.parent.updateWorldMatrix(true, false);
  bone.parent.getWorldQuaternion(_p); root.getWorldQuaternion(_r);
  _p.premultiply(_r.invert());                       // parent เทียบกับตัว
  _a.copy(axis).applyQuaternion(_p.invert());        // แกนในพื้นที่ parent
  bone.quaternion.premultiply(_q.setFromAxisAngle(_a, ang));
}

const R3 = {
  ready: false, models: {}, units: new Map(), bases: [], mines: [],

  async load(onProgress) {
    const canvas = document.getElementById('gl');
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping; this.renderer.toneMappingExposure = 1.15;
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(0, 960, 0, -VIEW_H, -3000, 3000);
    this.scene.add(new THREE.HemisphereLight(0xfff1dc, 0x7a5638, 1.6));
    const sun = new THREE.DirectionalLight(0xffffff, 2.2); sun.position.set(-400, 700, 900); this.scene.add(sun);
    const rim = new THREE.DirectionalLight(0xffd6a0, .8); rim.position.set(500, 200, -600); this.scene.add(rim);

    this.loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
    await this.need(COMMON, onProgress);
    this.ready = true;
  },

  async need(names, onProgress) {
    const todo = [...new Set(names)].filter(n => !this.models[n]); let done = 0;
    await Promise.all(todo.map(async n => { this.models[n] = await this.loader.loadAsync(`models/${n}.glb`); onProgress?.(++done / todo.length); }));
  },

  // โหลดโมเดลเผ่าศัตรูของด่านนั้น
  prepare(lvIdx, onProgress) {
    const f = FACTIONS[LEVELS[lvIdx].faction];
    return this.need([f.miner, ...Object.keys(f.roster), f.boss].map(k => UNITS[k].model), onProgress);
  },

  resize(w, h) { this.renderer?.setPixelRatio(Math.min(2, devicePixelRatio || 1)); this.renderer?.setSize(w, h, false); },

  // โคลนโมเดล + ย้อมสีทีม (ทำวัสดุใหม่ต่อตัว เพื่อกระพริบตอนโดนตีได้)
  clone(name, team, px) {
    const src = this.models[name], obj = SkeletonUtils.clone(src.scene), col = new THREE.Color(TEAM[team].color), mats = [];
    obj.traverse(c => {
      if (!c.isMesh) return;
      c.frustumCulled = false;
      c.material = [].concat(c.material).map(m => {
        m = m.clone();
        if (m.name === 'TEAM') m.color.copy(col);
        else if (m.name === 'TEX') m.color.lerp(col, .45).multiplyScalar(2.1); // เท็กซ์เจอร์เดิมมืด → ย้อมสีทีม + เพิ่มความสว่าง
        m.roughness = .8; mats.push(m); return m;
      });
      if (c.material.length === 1) c.material = c.material[0];
    });
    obj.scale.setScalar(px);
    const mixer = new THREE.AnimationMixer(obj), acts = {};
    for (const clip of src.animations) acts[clip.name] = mixer.clipAction(clip);
    return { obj, mixer, acts, mats, cur: null };
  },

  play(part, name, { once = false, speed = 1, fade = .15 } = {}) {
    const a = part.acts[name]; if (!a) return;
    a.timeScale = speed;
    if (part.cur === name && !once) return;
    const prev = part.acts[part.cur];
    a.reset(); a.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat); a.clampWhenFinished = once; a.enabled = true;
    a.play(); if (prev && prev !== a) a.crossFadeFrom(prev, fade, false);
    part.cur = name; part.until = once ? performance.now() + a.getClip().duration / speed * 1000 : 0;
  },
  busy: part => part.until > performance.now(),

  makeUnit(u) {
    const g = new THREE.Group(), d = u.def, e = { g, parts: [], prevAtk: 0 };
    if (u.type === 'cavalry') {
      const horse = this.clone('horse', u.team, d.h), rider = this.clone('sword', u.team, d.h * .8);
      rider.obj.position.y = d.h * .42; rider.obj.position.z = -4;
      g.add(horse.obj, rider.obj); e.horse = horse; e.body = rider; e.parts.push(horse, rider);
    } else {
      const p = this.clone(d.model, u.team, d.h);
      g.add(p.obj); e.body = p; e.parts.push(p);
      if (u.miner) this.equipMiner(e, p.obj);
    }
    this.scene.add(g); this.units.set(u.id, e);
    return e;
  },

  // คนงาน: ถือจอบที่มือขวา + ก้อนแร่ตอนแบกกลับฐาน
  equipMiner(e, obj) {
    const bone = n => obj.getObjectByName(n);
    e.bones = { arm: bone('UpperArmR'), fore: bone('LowerArmR'), torso: bone('Torso'), root: obj };
    const fist = bone('FistR'); obj.updateMatrixWorld(true);
    const ws = fist.getWorldScale(new THREE.Vector3()).x / obj.scale.x; // สเกลของกระดูกเทียบกับตัว
    const pick = buildPickaxe(); pick.scale.setScalar(.5 / ws);
    pick.rotation.set(...PICK_ROT); fist.add(pick); e.pick = pick;
    const ore = buildOre(); ore.scale.setScalar(.11 / ws); fist.add(ore); ore.visible = false; e.ore = ore;
  },

  // ท่าเหวี่ยงจอบ: ยกแขนเหนือหัว → ฟาดลง (ทับท่า idle ของโมเดล)
  swing(e, k) {
    // k: 0→.65 ค่อยๆ ยกจอบขึ้นเหนือหัว · .65→1 ฟาดลงเร็ว (กระทบหินตอน k วนกลับ 0)
    e.saved = [e.bones.arm, e.bones.fore, e.bones.torso].map(b => [b, b.quaternion.clone()]);
    const up = k < .65 ? k / .65 : 1 - (k - .65) / .35;
    const ease = k < .65 ? up * up * (3 - 2 * up) : 1 - Math.pow(1 - up, 2);
    const lift = .9 + ease * 2.1;                                          // มุมยกแขนไปข้างหน้า (เรเดียน)
    rotAround(e.bones.arm, e.bones.root, AX, lift);
    rotAround(e.bones.fore, e.bones.root, AX, .15 + ease * .5);
    rotAround(e.bones.torso, e.bones.root, AX, .3 - ease * .38);
  },

  buildBases(game) {
    for (const b of this.bases) this.scene.remove(b.g);
    this.bases = game.bases.map((b, team) => {
      const d = TEAM[team].dir, c = buildCastle(TEAM[team].color), g = c.g;
      const top = buildArcherTower(TEAM[team].color); top.position.set(0, c.top, -12);          // อัปเกรดป้อมธนู
      const front = buildFrontWall(); front.position.set(175 * d, 0, 20); front.scale.x = d;    // อัปเกรดกำแพง
      g.add(top, front);
      g.rotation.y = -.3 * d; g.scale.setScalar(.8); g.position.set(b.x, -GROUND, -70);
      this.scene.add(g);
      return { g, top, front, flags: c.flags, fires: c.fires, x: b.x };
    });
    for (const m of this.mines) this.scene.remove(m.g);
    this.mines = game.mines.map((m, team) => {
      const o = buildMine(TEAM[team].dir); o.g.position.set(m.x + MINE_OFS * TEAM[team].dir, -GROUND, -60);
      this.scene.add(o.g); return o;
    });
    window.R3.sparks = this.mines.map(o => o.sparks);
  },

  reset(game) {
    for (const e of this.units.values()) this.scene.remove(e.g);
    this.units.clear(); this.buildBases(game);
  },

  sync(game, dt) {
    if (!this.ready) return;
    if (this.bases.length !== 2 || this.game !== game) { this.game = game; this.reset(game); }
    const seen = new Set();
    for (const u of game.units) {
      seen.add(u.id);
      const e = this.units.get(u.id) || this.makeUnit(u);
      e.g.position.set(u.x, -u.y + (u.def.fly ? u.def.fly + Math.sin(performance.now() / 300 + u.id) * 6 : 0), (u.y - GROUND) * 4);
      const want = u.face > 0 ? Math.PI / 2 - TURN : -Math.PI / 2 + TURN;
      e.g.rotation.y += (want - e.g.rotation.y) * Math.min(1, dt * 12);
      const A = u.def.anim || {}, atkName = A.atk || 'attack';
      const atkSpeed = () => Math.max(1, (e.body.acts[atkName]?.getClip().duration || 1) / (u.def.rate * .9));
      const attacked = u.atkAnim > e.prevAtk + .3; e.prevAtk = u.atkAnim;

      if (u.miner && u.state === 'mining') this.play(e.body, 'idle');
      else if (attacked) this.play(e.body, atkName, { once: true, speed: atkSpeed() });
      else if (!this.busy(e.body)) this.play(e.body, u.moving ? (u.carry && e.body.acts.carry ? 'carry' : 'walk') : 'idle', { speed: u.moving ? Math.min(2, u.def.speed / 80) : 1 });
      if (e.horse) this.play(e.horse, u.moving ? 'walk' : 'idle', { speed: u.moving ? 1.1 : 1 });

      const glow = u.flash > 0 ? 0x884444 : game.rage[u.team] > 0 && !u.miner ? 0x442200 : 0;
      if (glow !== e.glow) { e.glow = glow; for (const p of e.parts) for (const m of p.mats) m.emissive.setHex(glow); }
    }
    // ตัวที่ตาย: เล่นท่าล้ม แล้วจมลงดินหายไป
    for (const [id, e] of this.units) {
      if (seen.has(id)) continue;
      if (!e.dead) { e.dead = performance.now(); for (const p of e.parts) this.play(p, 'death', { once: true }); }
      const k = (performance.now() - e.dead) / 1000;
      if (k > 1.2) e.g.position.y -= dt * 60;
      if (k > 2) { this.scene.remove(e.g); this.units.delete(id); }
    }
    for (const e of this.units.values()) {
      if (e.saved) { for (const [b, q] of e.saved) b.quaternion.copy(q); e.saved = null; } // คืนท่าก่อนเหวี่ยง
      for (const p of e.parts) p.mixer.update(dt);
    }
    for (const u of game.units) { // คนงาน: เหวี่ยงจอบตามจังหวะขุด, ถือแร่ตอนเดินกลับ
      const e = this.units.get(u.id); if (!e?.pick) continue;
      if (u.state === 'mining') this.swing(e, u.swingK());
      e.pick.visible = !u.carry; e.ore.visible = !!u.carry;
    }
    const now = performance.now() / 1000;

    this.bases.forEach((B, i) => {
      const b = game.bases[i], up = game.upg[i];
      B.g.position.x = b.x + (b.shake > 0 ? (Math.random() - .5) * 8 : 0);
      B.top.visible = up.tower > 0; B.top.scale.setScalar(.75 + up.tower * .15);
      B.front.visible = up.wall > 0; B.front.scale.set(TEAM[i].dir * (.8 + up.wall * .15), .8 + up.wall * .15, 1);
      B.flags.forEach((f, j) => waveFlag(f, now + j));
      B.fires.forEach((f, j) => { const s = 1 + Math.sin(now * 17 + j * 2) * .15 + Math.sin(now * 29 + j) * .1; f.scale.set(1 / s, s, 1 / s); });
    });
    this.mines.forEach(o => o.crystals.forEach((c, j) => { const k = .5 + Math.sin(now * 2 + j * 1.7) * .5; c.children[0].material.emissiveIntensity = .35 + k * .5; }));
  },

  render(cam, vw) {
    if (!this.ready) return;
    Object.assign(this.camera, { left: cam, right: cam + vw, top: 0, bottom: -VIEW_H }); this.camera.updateProjectionMatrix();
    this.renderer.render(this.scene, this.camera);
  },
};

window.R3 = R3;
R3.load(k => window.onModelProgress?.(k)).then(() => window.onModelsReady?.()).catch(err => window.onModelsError?.(err));
