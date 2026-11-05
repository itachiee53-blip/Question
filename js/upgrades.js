// อัปเกรดฐาน: แต่ละอย่างอัปได้ 3 ขั้น (ราคาเพิ่มทุกขั้น)
const UPGRADES = {
  mine:   { name: 'เหมืองทอง', icon: '⛏️', desc: 'ทองต่อรอบ +30%',      cost: [150, 300, 500] },
  armor:  { name: 'เกราะทหาร', icon: '🛡️', desc: 'เลือดทหารใหม่ +20%',  cost: [200, 380, 600] },
  weapon: { name: 'ตีอาวุธ',   icon: '⚔️', desc: 'ดาเมจทหาร +20%',      cost: [200, 380, 600] },
  tower:  { name: 'ป้อมธนู',   icon: '🏹', desc: 'ป้อมยิงแรงและเร็วขึ้น', cost: [180, 350, 550] },
  wall:   { name: 'กำแพง',     icon: '🧱', desc: 'เลือดฐาน +600 และซ่อมฐาน', cost: [250, 450, 700] },
};

const Upg = {
  mult(g, team, key) { const l = g.upg[team][key]; return { mine: 1 + .3 * l, armor: 1 + .2 * l, weapon: 1 + .2 * l }[key] ?? 1; },
  cost(g, team, key) { return UPGRADES[key].cost[g.upg[team][key]]; }, // undefined = เต็มแล้ว

  buy(g, team, key) {
    const c = this.cost(g, team, key);
    if (c == null || g.gold[team] < c) return false;
    g.gold[team] -= c; g.upg[team][key]++;
    const b = g.bases[team];
    if (key === 'wall') { b.max += 600; b.hp = Math.min(b.max, b.hp + 600); }
    g.chunks(b.x, GROUND - 200, '#ffd84a', 16);
    return true;
  },
};
