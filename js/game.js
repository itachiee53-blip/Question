// สถานะเกม 1 ด่าน: เศรษฐกิจ ฝึกทหาร การต่อสู้ เอฟเฟกต์
class Game {
  constructor(lvIdx) {
    this.lvIdx = lvIdx; this.lv = LEVELS[lvIdx]; this.t = 0; this.cam = 0; this.over = null;
    this.gold = [ECON.startGold, ECON.startGold];
    this.bases = [130, WORLD - 130].map(x => ({ x, hp: BASE.hp, max: BASE.hp, shake: 0, cd: 0 }));
    this.mines = [{ x: 470 }, { x: WORLD - 470 }];
    this.mode = ['defend', 'defend']; this.vw = 960;
    this.upg = [0, 1].map(() => Object.fromEntries(Object.keys(UPGRADES).map(k => [k, 0])));
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
        this.units.push(new Unit(q.type, team, b.x + TEAM[team].dir * 40, Upg.mult(this, team, 'armor')));
        if (team === 0) this.sfx('spawn', b.x);
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
    const l = this.upg[team].tower;
    const foe = this.units.find(u => u.team !== team && Math.abs(u.x - b.x) < BASE.towerRange + l * 50);
    if (foe) { b.cd = BASE.towerRate / (1 + l * .3); this.shoot({ x: b.x, y: GROUND - 170, team }, foe, BASE.towerDmg * (1 + l * .6)); }
  }

  shoot(from, target, dmg) {
    const tx = target.def ? target.x : target.x, ty = target.def ? target.y - 30 : GROUND - 90;
    const dist = Math.abs(tx - from.x);
    this.sfx('shoot', from.x, .7);
    this.projs.push({ x0: from.x, y0: from.y - 40, x1: tx, y1: ty, t: 0, dur: .25 + dist / 700, arc: 20 + dist * .18, target, dmg, team: from.team });
  }

  land(p) {
    const t = p.target;
    if (t.def ? t.hp > 0 && Math.abs(t.x - p.x1) < 40 : true) { this.damage(t, p.dmg); this.sfx('thud', p.x1, .8); }
    else this.chunks(p.x1, GROUND + 10, '#9a6538', 2);
  }

  strike(u, target) {
    let dmg = u.def.dmg * Upg.mult(this, u.team, 'weapon');
    if (u.def.charge && !u.charged) { dmg *= u.def.charge; u.charged = true; this.text(target.x, (target.y || GROUND) - 90, 'ชาร์จ!', '#ffd84a'); } // ทหารม้าพุ่งชนครั้งแรกแรงพิเศษ
    this.damage(target, dmg); this.sfx(u.def.splash ? 'smash' : 'hit', u.x);
    if (u.def.splash) for (const o of this.units) if (o !== target && o.team !== u.team && Math.abs(o.x - target.x) < u.def.splash) this.damage(o, dmg * .5);
  }

  damage(t, dmg) {
    if (!t.def) { // ฐาน
      t.hp = Math.max(0, t.hp - dmg); t.shake = .15; this.sfx('boom', t.x, .7);
      this.chunks(t.x + (Math.random() - .5) * 80, GROUND - 60 - Math.random() * 100, '#8a6a4e', 3);
      return;
    }
    t.hp -= dmg; t.flash = .1;
    this.chunks(t.x, t.y - 30, TEAM[t.team].color, 3);
    if (t.hp <= 0) { t.dieX = t.x; this.chunks(t.x, t.y - 25, TEAM[t.team].color, 14); this.sfx('pop', t.x); } // แตกเป็นก้อนดินเหนียว
  }

  chunks(x, y, color, n) {
    for (let i = 0; i < n; i++) this.parts.push({ x, y, vx: (Math.random() - .5) * 320, vy: -150 - Math.random() * 280, r: 3 + Math.random() * 4, color, rot: Math.random() * 6, life: .9 + Math.random() * .6 });
  }
  text(x, y, text, color) { this.parts.push({ x, y, vx: 0, vy: -50, text, color, life: 1, rot: 0 }); }

  end(result) { this.over = result; Sfx.play(result); this.onEnd?.(result); }

  // เล่นเสียงเฉพาะเหตุการณ์ที่อยู่ในจอ (ไม่ให้เสียงรก)
  sfx(name, x, vol = 1) { if (x > this.cam - 80 && x < this.cam + this.vw + 80) Sfx.play(name, vol); }

  // วาด 3 ชั้น: ฉาก 2D (bg) → โมเดล 3D (R3) → เอฟเฟกต์ 2D (fx)
  draw(bg, fx, vw, dt) {
    this.vw = vw; this.cam = Math.max(0, Math.min(WORLD - vw, this.cam));
    R.background(bg, this.cam, vw, this.lv, this.t);
    bg.save(); bg.translate(-this.cam, 0);
    this.mines.forEach(m => R.mine(bg, m, this.t));
    this.bases.forEach(b => R.shadow(bg, b.x, GROUND - 2, 140));
    for (const u of this.units) R.shadow(bg, u.x, u.y, (u.type === 'cavalry' ? 30 : 16) * u.def.size);
    bg.restore();

    window.R3?.sync(this, dt); window.R3?.render(this.cam, vw);

    fx.clearRect(-10, -10, vw + 20, VIEW_H + 20);
    fx.save(); fx.translate(-this.cam, 0);
    this.projs.forEach(p => R.arrow(fx, p));
    this.parts.forEach(p => R.part(fx, p));
    for (const u of this.units) if (u.hp < u.maxHp) R.hpBar(fx, u.x, u.y - (u.type === 'giant' ? 160 : u.type === 'cavalry' ? 150 : 100) * (u.type === 'giant' ? 1 : u.def.size), 30, u.hp / u.maxHp, TEAM[u.team].color);
    this.bases.forEach((b, i) => R.hpBar(fx, b.x, GROUND - 330, 130, b.hp / b.max, TEAM[i].color));
    fx.restore();
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
