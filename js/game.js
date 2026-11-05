// สถานะเกม 1 ด่าน: เศรษฐกิจ ฝึกทหาร การต่อสู้ เอฟเฟกต์
class Game {
  constructor(lvIdx) {
    this.lvIdx = lvIdx; this.lv = LEVELS[lvIdx]; this.t = 0; this.cam = 0; this.over = null;
    this.gold = [ECON.startGold, ECON.startGold];
    this.bases = [130, WORLD - 130].map(x => ({ x, hp: BASE.hp, max: BASE.hp, shake: 0, cd: 0 }));
    this.mines = [{ x: 470 }, { x: WORLD - 470 }];
    this.mode = ['defend', 'defend'];
    this.queue = [[], []]; this.units = []; this.projs = []; this.parts = [];
    this.ai = new AI(this, lvIdx);
    for (const team of [0, 1]) for (let i = 0; i < 2; i++) this.units.push(new Unit('miner', team, this.bases[team].x + TEAM[team].dir * (50 + i * 20)));
  }

  income(team) { return team === 1 ? this.lv.ai : 1; }
  pop(team) { return this.units.filter(u => u.team === team).length + this.queue[team].length; }

  train(team, type) {
    const d = UNITS[type];
    if (this.gold[team] < d.cost || this.pop(team) >= POP_CAP) return false;
    this.gold[team] -= d.cost; this.queue[team].push({ type, t: 0 });
    return true;
  }

  update(dt) {
    if (this.over) return;
    this.t += dt;
    for (const team of [0, 1]) {
      this.gold[team] += ECON.passive * this.income(team) * dt;
      const q = this.queue[team][0];
      if (q && (q.t += dt) >= UNITS[q.type].time) {
        this.queue[team].shift();
        const b = this.bases[team];
        this.units.push(new Unit(q.type, team, b.x + TEAM[team].dir * 40));
        this.chunks(b.x + TEAM[team].dir * 40, GROUND - 20, TEAM[team].color, 6);
      }
      this.tower(team, dt);
    }
    for (const u of this.units) u.update(this, dt);
    this.units = this.units.filter(u => u.hp > 0);

    for (const p of this.projs) if ((p.t += dt) >= p.dur) this.land(p);
    this.projs = this.projs.filter(p => p.t < p.dur);
    for (const p of this.parts) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += (p.text ? 0 : 900) * dt; p.rot += dt * 5; p.life -= dt; if (!p.text && p.y > GROUND + 30) { p.y = GROUND + 30; p.vy *= -.3; p.vx *= .6; } }
    this.parts = this.parts.filter(p => p.life > 0);
    for (const b of this.bases) b.shake -= dt;

    this.ai.update(dt);
    if (this.bases[1].hp <= 0) this.end('win');
    else if (this.bases[0].hp <= 0) this.end('lose');
  }

  // ป้อมยิงธนูช่วยป้องกันฐาน
  tower(team, dt) {
    const b = this.bases[team];
    if ((b.cd -= dt) > 0) return;
    const foe = this.units.find(u => u.team !== team && Math.abs(u.x - b.x) < BASE.towerRange);
    if (foe) { b.cd = BASE.towerRate; this.shoot({ x: b.x, y: GROUND - 170 + 60, team }, foe, BASE.towerDmg); }
  }

  shoot(from, target, dmg) {
    const tx = target.def ? target.x : target.x, ty = target.def ? target.y - 30 : GROUND - 90;
    const dist = Math.abs(tx - from.x);
    this.projs.push({ x0: from.x, y0: from.y - 40, x1: tx, y1: ty, t: 0, dur: .25 + dist / 700, arc: 20 + dist * .18, target, dmg, team: from.team });
  }

  land(p) {
    const t = p.target;
    if (t.def ? t.hp > 0 && Math.abs(t.x - p.x1) < 40 : true) this.damage(t, p.dmg);
    else this.chunks(p.x1, GROUND + 10, '#9a6538', 2);
  }

  strike(u, target) {
    this.damage(target, u.def.dmg);
    if (u.def.splash) for (const o of this.units) if (o !== target && o.team !== u.team && Math.abs(o.x - target.x) < u.def.splash) this.damage(o, u.def.dmg * .5);
  }

  damage(t, dmg) {
    if (!t.def) { // ฐาน
      t.hp = Math.max(0, t.hp - dmg); t.shake = .15;
      this.chunks(t.x + (Math.random() - .5) * 80, GROUND - 60 - Math.random() * 100, '#8a6a4e', 3);
      return;
    }
    t.hp -= dmg; t.flash = .1;
    this.chunks(t.x, t.y - 30, TEAM[t.team].color, 3);
    if (t.hp <= 0) this.chunks(t.x, t.y - 25, TEAM[t.team].color, 14); // แตกเป็นก้อนดินเหนียว
  }

  chunks(x, y, color, n) {
    for (let i = 0; i < n; i++) this.parts.push({ x, y, vx: (Math.random() - .5) * 320, vy: -150 - Math.random() * 280, r: 3 + Math.random() * 4, color, rot: Math.random() * 6, life: .9 + Math.random() * .6 });
  }
  text(x, y, text, color) { this.parts.push({ x, y, vx: 0, vy: -50, text, color, life: 1, rot: 0 }); }

  end(result) { this.over = result; this.onEnd?.(result); }

  draw(ctx, vw) {
    this.cam = Math.max(0, Math.min(WORLD - vw, this.cam));
    R.background(ctx, this.cam, vw, this.lv, this.t);
    ctx.save(); ctx.translate(-this.cam, 0);
    this.mines.forEach(m => R.mine(ctx, m, this.t));
    this.bases.forEach((b, i) => R.base(ctx, b, i, this.t));
    [...this.units].sort((a, b) => a.y - b.y).forEach(u => R.unit(ctx, u, this.t));
    this.projs.forEach(p => R.arrow(ctx, p));
    this.parts.forEach(p => R.part(ctx, p));
    ctx.restore();
  }

  drawMini(ctx, vw) {
    const w = ctx.canvas.width, h = ctx.canvas.height, k = w / WORLD;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(this.cam * k, 0, vw * k, h);
    this.bases.forEach((b, i) => { ctx.fillStyle = TEAM[i].color; ctx.fillRect(b.x * k - 4, 3, 8, h - 6); });
    ctx.fillStyle = '#f2c230'; this.mines.forEach(m => ctx.fillRect(m.x * k - 2, h - 7, 4, 4));
    for (const u of this.units) { ctx.fillStyle = TEAM[u.team].color; ctx.fillRect(u.x * k - 1, 9, 3, 6); }
  }
}
