// ทหารแต่ละตัว: คนงานขุดแร่ / นักรบ / ยิงไกล / ฮีลเลอร์
class Unit {
  constructor(type, team, x, hpMult = 1) {
    const def = UNITS[type];
    Object.assign(this, { id: Unit.n = (Unit.n || 0) + 1, type, team, x, def, face: TEAM[team].dir });
    this.maxHp = this.hp = Math.round(def.hp * hpMult);
    this.y = GROUND + 4 + Math.random() * 34; // กระจายความลึกให้ดูเป็นกองทัพ
    this.ofs = Math.random() * 70;            // ระยะเหลื่อมไม่ให้ยืนซ้อนกัน
    this.phase = Math.random() * 6; this.cd = Math.random() * .5; this.flash = 0; this.atkAnim = 0;
    this.state = 'toMine'; this.carry = 0; this.timer = 0;
  }
  get miner() { return this.def.role === 'miner'; }
  // จังหวะเหวี่ยงจอบ 0..1 (ฟาดโดนหินตอนวนกลับ 0) · ขุด 1 รอบ = 4 ครั้ง
  swingK() { return ((ECON.mineTime - this.timer) / (ECON.mineTime / 4)) % 1; }

  moveTo(x, dt, g) {
    const dx = x - this.x;
    if (Math.abs(dx) < 3) return true;
    this.face = Math.sign(dx);
    this.x += this.face * Math.min(Math.abs(dx), this.def.speed * g.speedMult(this.team) * dt);
    this.moving = true; this.phase += dt * 11;
    return false;
  }

  update(g, dt) {
    this.cd -= dt; this.flash -= dt; this.atkAnim -= dt * 3; this.moving = false;
    if (this.pending && (this.pending.t -= dt) <= 0) { g.strike(this, this.pending.target); this.pending = null; }
    this.miner ? this.mine(g, dt) : this.def.heal ? this.support(g, dt) : this.fight(g, dt);
  }

  mine(g, dt) {
    const dir = TEAM[this.team].dir, mine = g.mines[this.team], base = g.bases[this.team];
    if (this.state === 'toMine' && this.moveTo(mine.x + (this.ofs - 35) * .8, dt, g)) { this.state = 'mining'; this.timer = ECON.mineTime; this.face = Math.sign(mine.x - base.x) || 1; }
    else if (this.state === 'mining' && ((this.prevK = this.swingK()), (this.timer -= dt) > 0)) {
      if (this.swingK() < this.prevK) { // จอบกระทบหิน: เศษหิน + ประกายทอง
        const x = this.x + 22 * this.face, y = this.y - this.def.h * .35;
        g.chunks(x, y, '#8a8078', 2); if (Math.random() < .4) g.chunks(x, y, '#f2c230', 1);
        g.sfx('tick', this.x, .25);
      }
    } else if (this.state === 'mining') {
      this.carry = Math.round(ECON.load * g.income(this.team) * Upg.mult(g, this.team, 'mine')); this.state = 'toBase';
      g.chunks(this.x + 10 * this.face, this.y - 30, '#f2c230', 3);
    } else if (this.state === 'toBase' && this.moveTo(base.x + dir * 45, dt, g)) {
      g.gold[this.team] += this.carry;
      if (this.team === 0) { g.text(this.x, this.y - 90, '+' + this.carry, '#ffd84a'); g.sfx('coin', this.x, .6); }
      this.carry = 0; this.state = 'toMine';
    }
  }

  nearestFoe(g) {
    let foe = null, best = 1e9;
    for (const o of g.units) if (o.team !== this.team && o.hp > 0) { const d = Math.abs(o.x - this.x); if (d < best) { best = d; foe = o; } }
    return [foe, best];
  }

  // จุดยืนตามคำสั่ง (บุก/ตั้งรับ) — ยิงไกลยืนหลังแนว
  holdLine(g) {
    const dir = TEAM[this.team].dir, home = g.bases[this.team], back = this.def.range > 100 ? 110 : 0;
    return home.x + dir * (330 - back - this.ofs * .6);
  }

  fight(g, dt) {
    const dir = TEAM[this.team].dir, def = this.def, eb = g.bases[1 - this.team];
    const [foe, best] = this.nearestFoe(g);
    const reach = def.range + 14 * (def.h / 90);
    const target = foe && best <= reach ? foe : Math.abs(eb.x - this.x) - 60 <= def.range ? eb : null;

    if (target) {
      this.face = Math.sign(target.x - this.x) || dir;
      if (this.cd <= 0) {
        this.cd = def.rate; this.atkAnim = 1;
        if (def.ranged) g.shoot(this, target, def.dmg * g.dmgMult(this.team), def.ranged, def.splash);
        else this.pending = { target, t: .18 }; // ตีโดนตอนเหวี่ยงสุด
      }
      return;
    }
    if (g.mode[this.team] === 'attack') return this.moveTo(eb.x - dir * (def.range * .7 + 50), dt, g);
    const line = this.holdLine(g);
    if (foe && Math.abs(foe.x - line) < 260) this.moveTo(foe.x - dir * def.range * .8, dt, g);
    else if (this.moveTo(line, dt, g)) this.face = dir;
  }

  // นักบวช: ฮีลเพื่อนที่เลือดน้อยสุดในระยะ แล้วเดินตามหลังแนวหน้า
  support(g, dt) {
    const dir = TEAM[this.team].dir, def = this.def;
    let ally = null, low = 1;
    for (const o of g.units) if (o.team === this.team && o !== this && !o.miner && o.hp < o.maxHp && Math.abs(o.x - this.x) <= def.range) {
      const k = o.hp / o.maxHp; if (k < low) { low = k; ally = o; }
    }
    if (ally && this.cd <= 0) {
      this.cd = def.rate; this.atkAnim = 1; this.face = Math.sign(ally.x - this.x) || dir;
      ally.hp = Math.min(ally.maxHp, ally.hp + def.heal); g.sparkle(ally.x, ally.y - 50, '#8dff8a'); g.sfx('heal', this.x, .5);
      return;
    }
    const front = g.units.filter(o => o.team === this.team && !o.miner && !o.def.heal).reduce((m, o) => dir > 0 ? Math.max(m, o.x) : Math.min(m, o.x), this.holdLine(g));
    if (this.moveTo(front - dir * (90 + this.ofs * .5), dt, g)) this.face = dir;
  }
}
