// สมองฝ่ายศัตรู: บริหารแร่ → สร้างทัพ → ตัดสินใจบุก/ตั้งรับ
class AI {
  constructor(g, lvIdx) { this.g = g; this.lv = LEVELS[lvIdx]; this.idx = lvIdx; this.timer = 2; this.want = null; }

  update(dt) {
    if ((this.timer -= dt) > 0) return;
    this.timer = this.lv.think;
    const g = this.g, mine = g.units.filter(u => u.team === 1), q = g.queue[1];
    const count = t => mine.filter(u => u.type === t).length + q.filter(x => x.type === t).length;

    // 0) อัปเกรดฐานเมื่อมีเงินเหลือ
    if (g.gold[1] > 350 && Math.random() < .25 + this.idx * .08) {
      const opts = Object.keys(UPGRADES).filter(k => Upg.cost(g, 1, k) <= g.gold[1] - 100);
      if (opts.length && Upg.buy(g, 1, opts[Math.random() * opts.length | 0])) return;
    }
    // 1) คนงานก่อน
    if (count('miner') < 3 + this.idx) { g.train(1, 'miner'); return; }
    // 2) เลือกทหาร (เก็บเงินรอถ้ายังไม่พอ)
    if (!this.want) {
      const r = Math.random();
      this.want = this.idx > 0 && r < .1 + this.idx * .04 ? 'giant' : this.idx > 0 && r < .28 ? 'cavalry' : r < .65 ? 'sword' : 'archer';
    }
    if (g.train(1, this.want)) this.want = null;

    // 3) บุกเมื่อกำลังเหนือกว่า
    const power = t => g.units.filter(u => u.team === t && u.type !== 'miner').reduce((s, u) => s + u.def.cost * u.hp / u.def.hp, 0);
    const me = power(1), them = power(0);
    if (me > 450 + this.idx * 80 && me > them * 1.25) g.mode[1] = 'attack';
    else if (me < them * .8 || me < 200) g.mode[1] = 'defend';
  }
}
