// สถานะเกม 1 ด่าน: เศรษฐกิจ ฝึกทหาร การต่อสู้ สกิล เอฟเฟกต์
class Game {
  constructor(lvIdx) {
    this.lvIdx = lvIdx; this.lv = LEVELS[lvIdx]; this.fac = FACTIONS[this.lv.faction];
    TEAM[1].color = this.fac.color; TEAM[1].name = this.fac.name;
    this.t = 0; this.cam = 0; this.over = null; this.shake = 0; this.vw = 960; this.kills = 0;
    this.gold = [ECON.startGold, ECON.startGold];
    this.bases = [130, WORLD - 130].map(x => ({ x, hp: BASE.hp, max: BASE.hp, shake: 0, cd: 0 }));
    this.mines = [{ x: 470 }, { x: WORLD - 470 }];
    this.mode = ['defend', 'defend'];
    this.upg = [0, 1].map(() => Object.fromEntries(Object.keys(UPGRADES).map(k => [k, 0])));
    this.queue = [[], []]; this.units = []; this.projs = []; this.parts = [];
    this.abil = Object.fromEntries(Object.keys(ABILITIES).map(k => [k, 0])); this.rage = [0, 0];
    this.ai = new AI(this, lvIdx);
    for (let i = 0; i < 2; i++) { this.spawn(0, 'miner', i * 20); this.spawn(1, this.fac.miner, i * 20); }
  }

  income(team) { return team === 1 ? this.lv.ai : 1; }
  pop(team) { return this.units.filter(u => u.team === team && !u.def.boss).length + this.queue[team].length; }
  dmgMult(team) { return Upg.mult(this, team, 'weapon') * (this.rage[team] > 0 ? 1.5 : 1); }
  speedMult(team) { return this.rage[team] > 0 ? 1.4 : 1; }
  unlocked(type) { return (UNITS[type].lv || 0) <= this.lvIdx; }

  train(team, type) {
    const d = UNITS[type];
    if (team === 0 && !this.unlocked(type)) return false;
    if (this.gold[team] < d.cost || this.pop(team) >= POP_CAP) return false;
    this.gold[team] -= d.cost; this.queue[team].push({ type, t: 0 });
    return true;
  }

  spawn(team, type, ofs = 0) {
    const b = this.bases[team], x = b.x + TEAM[team].dir * (40 + ofs);
    const u = new Unit(type, team, x, Upg.mult(this, team, 'armor'));
    this.units.push(u); this.chunks(x, GROUND - 20, TEAM[team].color, 6);
    return u;
  }

  update(dt) {
    if (this.over) return;
    this.t += dt;
    for (const k in this.abil) this.abil[k] = Math.max(0, this.abil[k] - dt);
    for (const team of [0, 1]) {
      this.rage[team] -= dt;
      this.gold[team] += ECON.passive * this.income(team) * dt;
      const q = this.queue[team][0];
      if (q && (q.t += dt) >= UNITS[q.type].time) { this.queue[team].shift(); this.spawn(team, q.type); if (team === 0) this.sfx('spawn', this.bases[0].x); }
      this.tower(team, dt);
    }
    for (const u of this.units) u.update(this, dt);
    this.units = this.units.filter(u => u.hp > 0);

    for (const p of this.projs) if ((p.t += dt) >= p.dur) this.land(p);
    this.projs = this.projs.filter(p => p.t < p.dur);
    for (const p of this.parts) {
      p.x += p.vx * dt; p.y += p.vy * dt; p.vy += (p.text || p.float ? 0 : 900) * dt; p.rot += dt * 5; p.life -= dt;
      if (!p.text && !p.float && p.y > GROUND + 30) { p.y = GROUND + 30; p.vy *= -.3; p.vx *= .6; }
    }
    this.parts = this.parts.filter(p => p.life > 0);
    for (const b of this.bases) b.shake -= dt;
    this.shake = Math.max(0, this.shake - dt * 2);

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
    if (foe) { b.cd = BASE.towerRate / (1 + l * .3); this.shoot({ x: b.x, y: GROUND - 150, team }, foe, BASE.towerDmg * (1 + l * .6), 'arrow'); }
  }

  aimY(t) { return t.def ? t.y - (t.def.fly || 0) - t.def.h * .45 : GROUND - 90; }

  shoot(from, target, dmg, kind = 'arrow', splash = 0) {
    const x0 = from.x + (from.face || 0) * 20, y0 = from.def ? this.aimY(from) - 10 : from.y;
    const x1 = target.x, y1 = this.aimY(target), dist = Math.abs(x1 - x0);
    const fast = kind === 'flame';
    this.sfx(kind === 'arrow' ? 'shoot' : kind === 'flame' ? 'fire' : 'whoosh', from.x, .7);
    this.projs.push({ kind, x0, y0, x1, y1, t: 0, dur: fast ? .35 : .25 + dist / 650, arc: fast ? 0 : 20 + dist * .18, target, dmg, splash, team: from.team });
  }

  land(p) {
    if (p.splash) {
      for (const o of this.units) if (o.team !== p.team && Math.abs(o.x - p.x1) < p.splash) this.damage(o, p.dmg);
      const eb = this.bases[1 - p.team]; if (Math.abs(eb.x - p.x1) < p.splash + 60) this.damage(eb, p.dmg * .6);
      this.explode(p.x1, Math.min(p.y1, GROUND), p.kind === 'flame' ? '#ff7a2a' : '#ffb03a', p.kind === 'meteor' ? 16 : 10);
      return;
    }
    const t = p.target;
    if (t.def ? t.hp > 0 && Math.abs(t.x - p.x1) < 45 : true) { this.damage(t, p.dmg); this.sfx('thud', p.x1, .8); }
    else this.chunks(p.x1, GROUND + 10, '#9a6538', 2);
  }

  strike(u, target) {
    if (target.def && target.hp <= 0) return;
    let dmg = (u.def.dmg || 0) * this.dmgMult(u.team), crit = Math.random() < .1;
    if (u.def.charge && !u.charged) { dmg *= u.def.charge; u.charged = true; crit = true; this.shake = Math.max(this.shake, .3); } // ทหารม้าพุ่งชน
    if (crit) dmg *= 1.6;
    this.damage(target, dmg, crit); this.sfx(u.def.splash ? 'smash' : 'hit', u.x);
    if (u.def.splash) { for (const o of this.units) if (o !== target && o.team !== u.team && Math.abs(o.x - target.x) < u.def.splash) this.damage(o, dmg * .5); if (u.def.boss || u.def.h > 120) this.shake = Math.max(this.shake, .25); }
  }

  damage(t, dmg, crit) {
    if (!t.def) { // ฐาน
      t.hp = Math.max(0, t.hp - dmg); t.shake = .15; this.sfx('boom', t.x, .7);
      this.chunks(t.x + (Math.random() - .5) * 80, GROUND - 60 - Math.random() * 100, '#8a8070', 3);
      return;
    }
    dmg *= 1 - (t.def.armor || 0);
    t.hp -= dmg; t.flash = .1;
    this.chunks(t.x, this.aimY(t), TEAM[t.team].color, 2);
    if (crit) this.text(t.x, this.aimY(t) - 40, Math.round(dmg) + '!', '#ffcf3a');
    if (t.hp <= 0) {
      this.chunks(t.x, this.aimY(t), TEAM[t.team].color, 12); this.sfx('pop', t.x);
      if (t.team === 1) this.kills++;
      if (t.def.boss) { this.shake = 1; this.announce(t.team === 1 ? `🎉 ล้ม${t.def.name}ได้แล้ว! +300 ทอง` : `${t.def.name}ล้มแล้ว`); if (t.team === 1) this.gold[0] += 300; }
    }
  }

  // ---------- สกิลผู้เล่น ----------
  useAbility(k) {
    if (this.abil[k] > 0 || (ABILITIES[k].lv || 0) > this.lvIdx) return false;
    this.abil[k] = ABILITIES[k].cd;
    if (k === 'rain') {
      const foes = this.units.filter(u => u.team === 1 && u.x > this.cam && u.x < this.cam + this.vw);
      for (let i = 0; i < 14; i++) {
        const x = foes.length ? foes[i % foes.length].x + (Math.random() - .5) * 60 : this.cam + Math.random() * this.vw;
        this.projs.push({ kind: 'meteor', x0: x - 260, y0: -60, x1: x, y1: GROUND + 10, t: -i * .12, dur: .7, arc: 0, dmg: 75, splash: 65, team: 0 });
      }
      this.shake = .6; this.play('meteor');
    } else if (k === 'heal') {
      for (const u of this.units) if (u.team === 0) { u.hp = Math.min(u.maxHp, u.hp + u.maxHp * .6); this.sparkle(u.x, u.y - 40, '#8dff8a'); }
      const b = this.bases[0]; b.hp = Math.min(b.max, b.hp + 250); this.play('heal');
    } else if (k === 'rage') {
      this.rage[0] = 10; for (const u of this.units) if (u.team === 0) this.sparkle(u.x, u.y - 40, '#ff5a3a'); this.play('horn');
    }
    this.announce(`${ABILITIES[k].icon} ${ABILITIES[k].name}!`);
    return true;
  }

  // ---------- เอฟเฟกต์ ----------
  chunks(x, y, color, n) {
    for (let i = 0; i < n; i++) this.parts.push({ x, y, vx: (Math.random() - .5) * 320, vy: -150 - Math.random() * 280, r: 3 + Math.random() * 4, color, rot: Math.random() * 6, life: .9 + Math.random() * .6 });
  }
  sparkle(x, y, color) { for (let i = 0; i < 6; i++) this.parts.push({ x: x + (Math.random() - .5) * 30, y, vx: 0, vy: -40 - Math.random() * 60, r: 3, color, rot: 0, life: .8, float: true }); }
  explode(x, y, color, n) {
    this.chunks(x, y, color, n); this.chunks(x, y, '#5a4030', n / 2);
    this.parts.push({ x, y, vx: 0, vy: 0, ring: 1, color, life: .4, rot: 0, float: true });
    this.shake = Math.max(this.shake, .2); this.sfx('boom', x, .5);
  }
  text(x, y, text, color) { this.parts.push({ x, y, vx: 0, vy: -50, text, color, life: 1, rot: 0 }); }
  announce(msg, big) { if (!this.demo) this.onAnnounce?.(msg, big); }

  end(result) {
    this.over = result; this.play(result);
    const k = this.bases[0].hp / this.bases[0].max;
    this.stars = result === 'win' ? (k > .7 ? 3 : k > .35 ? 2 : 1) : 0;
    this.onEnd?.(result);
  }

  // เล่นเสียงเฉพาะเหตุการณ์ที่อยู่ในจอ (ไม่ให้เสียงรก)
  play(name, vol) { if (!this.demo) Sfx.play(name, vol); }
  sfx(name, x, vol = 1) { if (!this.demo && x > this.cam - 80 && x < this.cam + this.vw + 80) Sfx.play(name, vol); }

  // วาด 3 ชั้น: ฉาก 2D (bg) → โมเดล 3D (R3) → เอฟเฟกต์ 2D (fx)
  draw(bg, fx, vw, dt) {
    this.vw = vw; this.cam = Math.max(0, Math.min(WORLD - vw, this.cam));
    const cam = this.cam + (this.shake > 0 ? (Math.random() - .5) * 18 * this.shake : 0);
    R.background(bg, cam, vw, this.lv, this.t);
    bg.save(); bg.translate(-cam, 0);
    this.mines.forEach((m, i) => R.shadow(bg, m.x + 70 * TEAM[i].dir, GROUND + 4, 120));
    this.bases.forEach(b => R.shadow(bg, b.x, GROUND - 2, 140));
    for (const u of this.units) R.shadow(bg, u.x, u.y, (u.type === 'cavalry' ? 30 : 16) * Math.max(.6, u.def.h / 90) * (u.def.fly ? .6 : 1));
    bg.restore();

    window.R3?.sync(this, dt); window.R3?.render(cam, vw);

    fx.clearRect(-10, -10, vw + 20, VIEW_H + 20);
    fx.save(); fx.translate(-cam, 0);
    this.mines.forEach((m, i) => R.sparkles(fx, m.x + 70 * TEAM[i].dir, window.R3?.sparks?.[i], this.t));
    this.projs.forEach(p => R.proj(fx, p));
    this.parts.forEach(p => R.part(fx, p));
    for (const u of this.units) {
      const y = u.y - (u.def.fly || 0) - u.def.h * (u.type === 'cavalry' ? 1.75 : 1.1);
      if (u.def.boss) R.hpBar(fx, u.x, y, 90, u.hp / u.maxHp, TEAM[u.team].color);
      else if (u.hp < u.maxHp) R.hpBar(fx, u.x, y, 30, u.hp / u.maxHp, TEAM[u.team].color);
      if (this.rage[u.team] > 0 && !u.miner) R.part(fx, { x: u.x, y: y - 10, text: '⚡', color: '#ffcf3a', life: 1 });
    }
    fx.restore();
  }

  // แผนที่ย่อ: ถนน · ปราสาท · เหมือง · ทหาร (ศัตรูสูงกว่า/ต่ำกว่าเส้น) · กรอบมุมกล้อง
  drawMini(ctx, vw) {
    const w = ctx.canvas.width, h = ctx.canvas.height, k = (w - 40) / WORLD, X = x => 20 + x * k, mid = h / 2 + 2;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(120,80,40,.55)'; ctx.beginPath(); ctx.roundRect(14, mid - 3, w - 28, 6, 3); ctx.fill();
    ctx.fillStyle = '#ffd45a'; this.mines.forEach((m, i) => { const x = X(m.x + 70 * TEAM[i].dir); ctx.beginPath(); ctx.moveTo(x, mid - 7); ctx.lineTo(x + 5, mid); ctx.lineTo(x, mid + 7); ctx.lineTo(x - 5, mid); ctx.fill(); });
    for (const u of this.units) {
      const s = u.def.boss ? 7 : u.miner ? 3 : 4;
      ctx.fillStyle = TEAM[u.team].color; ctx.strokeStyle = 'rgba(20,10,5,.8)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(X(u.x), mid + (u.team ? 1 : -1) * (u.miner ? 9 : 10), s, 0, 7); ctx.fill(); ctx.stroke();
    }
    this.bases.forEach((b, i) => { // ปราสาทจิ๋ว
      const x = X(b.x); ctx.fillStyle = TEAM[i].color; ctx.strokeStyle = '#2a160a'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x - 9, mid + 9); ctx.lineTo(x - 9, mid - 6); ctx.lineTo(x - 5, mid - 12); ctx.lineTo(x - 1, mid - 6); ctx.lineTo(x + 1, mid - 6); ctx.lineTo(x + 5, mid - 12); ctx.lineTo(x + 9, mid - 6); ctx.lineTo(x + 9, mid + 9); ctx.closePath(); ctx.fill(); ctx.stroke();
    });
    ctx.strokeStyle = 'rgba(255,240,200,.9)'; ctx.lineWidth = 2.5; ctx.fillStyle = 'rgba(255,240,200,.12)';
    ctx.beginPath(); ctx.roundRect(X(this.cam), 3, vw * k, h - 6, 6); ctx.fill(); ctx.stroke();
  }
}
