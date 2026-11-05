// ทหารแต่ละตัว: คนงานขุดแร่ / ทหารต่อสู้
class Unit {
  constructor(type, team, x, hpMult = 1) {
    Object.assign(this, { id: Unit.n = (Unit.n || 0) + 1, type, team, x, def: UNITS[type], face: TEAM[team].dir });
    this.maxHp = this.hp = Math.round(UNITS[type].hp * hpMult);
    this.y = GROUND + 4 + Math.random() * 34; // กระจายความลึกให้ดูเป็นกองทัพ
    this.ofs = Math.random() * 70;            // ระยะเหลื่อมไม่ให้ยืนซ้อนกัน
    this.phase = Math.random() * 6; this.cd = 0; this.flash = 0; this.atkAnim = 0;
    this.state = 'toMine'; this.carry = 0; this.timer = 0;
  }

  moveTo(x, dt) {
    const dx = x - this.x;
    if (Math.abs(dx) < 3) return true;
    this.face = Math.sign(dx);
    this.x += this.face * Math.min(Math.abs(dx), this.def.speed * dt);
    this.moving = true; this.phase += dt * 11;
    return false;
  }

  update(g, dt) {
    this.cd -= dt; this.flash -= dt; this.atkAnim -= dt * 3; this.moving = false;
    if (this.pending && (this.pending.t -= dt) <= 0) { g.strike(this, this.pending.target); this.pending = null; }
    this.type === 'miner' ? this.mine(g, dt) : this.fight(g, dt);
  }

  mine(g, dt) {
    const dir = TEAM[this.team].dir, mine = g.mines[this.team], base = g.bases[this.team];
    if (this.state === 'toMine' && this.moveTo(mine.x + (this.ofs - 35) * .8, dt)) { this.state = 'mining'; this.timer = ECON.mineTime; this.face = Math.sign(mine.x - base.x) || 1; }
    else if (this.state === 'mining' && (this.timer -= dt) <= 0) {
      this.carry = Math.round(ECON.load * g.income(this.team) * Upg.mult(g, this.team, 'mine')); this.state = 'toBase';
      g.chunks(this.x + 10 * this.face, this.y - 30, '#f2c230', 3);
    } else if (this.state === 'toBase' && this.moveTo(base.x + dir * 45, dt)) {
      g.gold[this.team] += this.carry;
      if (this.team === 0) { g.text(this.x, this.y - 70, '+' + this.carry, '#ffd84a'); g.sfx('coin', this.x, .6); }
      this.carry = 0; this.state = 'toMine';
    }
  }

  fight(g, dt) {
    const dir = TEAM[this.team].dir, def = this.def, eb = g.bases[1 - this.team], home = g.bases[this.team];
    let foe = null, best = 1e9;
    for (const o of g.units) if (o.team !== this.team && o.hp > 0) { const d = Math.abs(o.x - this.x); if (d < best) { best = d; foe = o; } }
    const reach = def.range + 14 * def.size;
    let target = foe && best <= reach ? foe : Math.abs(eb.x - this.x) - 60 <= def.range ? eb : null;

    if (target) {
      this.face = Math.sign(target.x - this.x) || dir;
      if (this.cd <= 0) {
        this.cd = def.rate; this.atkAnim = 1;
        if (this.type === 'archer') g.shoot(this, target, def.dmg * Upg.mult(g, this.team, 'weapon'));
        else this.pending = { target, t: .14 }; // ตีโดนตอนเหวี่ยงสุด
      }
      return;
    }
    if (g.mode[this.team] === 'attack') return this.moveTo(eb.x - dir * (def.range * .7 + 50), dt);
    // ตั้งรับ: ยืนแนวหน้าฐาน ไล่ตีศัตรูที่บุกเข้ามาใกล้
    const line = home.x + dir * (330 - (this.type === 'archer' ? 110 : 0) - this.ofs * .6);
    if (foe && Math.abs(foe.x - line) < 260) this.moveTo(foe.x - dir * def.range * .8, dt);
    else if (this.moveTo(line, dt)) this.face = dir;
  }
}
