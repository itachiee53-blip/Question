// สมองฝ่ายศัตรู: ฟาร์มแร่ → สร้างทัพตามเผ่า → อัปเกรด → บุก/ตั้งรับ + คลื่นบุกใหญ่ + บอส
class AI {
  constructor(g, lvIdx) {
    this.g = g; this.lv = LEVELS[lvIdx]; this.fac = FACTIONS[this.lv.faction]; this.idx = lvIdx;
    this.timer = 2; this.want = null;
    this.nextWave = this.lv.wave; this.warned = false; this.nextBoss = this.lv.bossAt; this.bossWarned = false;
  }

  pick() {
    let r = Math.random() * Object.values(this.fac.roster).reduce((a, b) => a + b, 0);
    for (const [k, w] of Object.entries(this.fac.roster)) if ((r -= w) <= 0) return k;
    return Object.keys(this.fac.roster)[0];
  }

  update(dt) {
    const g = this.g, t = g.t;
    // ---------- คลื่นบุกใหญ่: ส่งทหารฟรีชุดหนึ่ง แล้วสั่งบุก ----------
    if (!this.warned && t > this.nextWave - 5) { this.warned = true; g.announce('⚠️ คลื่นศัตรูกำลังมา!'); g.play('horn'); }
    if (t > this.nextWave) {
      const n = 2 + this.idx + Math.floor(t / 120);
      for (let i = 0; i < n; i++) g.spawn(1, this.pick(), i * 25);
      g.mode[1] = 'attack'; this.attackUntil = t + 20;
      this.nextWave += this.lv.wave; this.warned = false;
    }
    // ---------- บอส ----------
    if (!this.bossWarned && t > this.nextBoss - 6) { this.bossWarned = true; g.announce(`💀 ${UNITS[this.fac.boss].name} ปรากฏตัว!`, true); g.play('boss'); }
    if (t > this.nextBoss) {
      g.spawn(1, this.fac.boss); g.mode[1] = 'attack'; this.attackUntil = t + 25;
      this.nextBoss += 150; this.bossWarned = false;
    }

    if ((this.timer -= dt) > 0) return;
    this.timer = this.lv.think;
    const mine = g.units.filter(u => u.team === 1), q = g.queue[1];
    const miners = mine.filter(u => u.miner).length + q.filter(x => UNITS[x.type].role === 'miner').length;

    // 0) อัปเกรดเมื่อมีเงินเหลือ
    if (g.gold[1] > 350 && Math.random() < .25 + this.idx * .08) {
      const opts = Object.keys(UPGRADES).filter(k => Upg.cost(g, 1, k) <= g.gold[1] - 100);
      if (opts.length && Upg.buy(g, 1, opts[Math.random() * opts.length | 0])) return;
    }
    // 1) คนงานก่อน
    if (miners < 3 + this.idx) { g.train(1, this.fac.miner); return; }
    // 2) ทหารตามเผ่า (เก็บเงินรอถ้ายังไม่พอ)
    this.want ??= this.pick();
    if (g.train(1, this.want)) this.want = null;

    // 3) บุกเมื่อกำลังเหนือกว่า
    if (t < (this.attackUntil || 0)) return;
    const power = tm => g.units.filter(u => u.team === tm && !u.miner).reduce((s, u) => s + (u.def.cost || 300) * u.hp / u.maxHp, 0);
    const me = power(1), them = power(0);
    if (me > 450 + this.idx * 80 && me > them * 1.25) g.mode[1] = 'attack';
    else if (me < them * .8 || me < 200) g.mode[1] = 'defend';
  }
}
