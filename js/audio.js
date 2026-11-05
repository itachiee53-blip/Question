// เสียงเอฟเฟกต์สังเคราะห์ด้วย Web Audio (ไม่ต้องโหลดไฟล์เสียง → ไฟล์เบา เปิดเร็ว)
const Sfx = {
  ctx: null, on: (() => { try { return localStorage.getItem('clay-mute') !== '1'; } catch { return true; } })(), last: {},

  init() { if (!this.ctx) try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch {} this.ctx?.resume?.(); },
  toggle() { this.on = !this.on; if (!this.on) this.music(false); try { localStorage.setItem('clay-mute', this.on ? '0' : '1'); } catch {} return this.on; },

  tone(f, dur, type = 'sine', vol = .2, slide = 0, delay = 0) {
    const c = this.ctx, t = c.currentTime + delay, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f * slide), t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + dur);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur);
  },
  noise(dur, vol = .2, freq = 1200, delay = 0) {
    const c = this.ctx, t = c.currentTime + delay, len = c.sampleRate * dur, buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = buf; f.type = 'lowpass'; f.frequency.value = freq; g.gain.value = vol;
    s.connect(f).connect(g).connect(c.destination); s.start(t);
  },

  // ---------- เพลงประกอบ: มาร์ชยุคกลางสั้นๆ วนลูป (สร้างสดด้วยโค้ด) ----------
  music(on) {
    clearInterval(this.mTimer); this.mTimer = null;
    if (!on || !this.on || !this.ctx) return;
    const c = this.ctx, bpm = 112, step = 60 / bpm / 2; // โน้ตเขบ็ตหนึ่งชั้น
    const N = n => 220 * 2 ** (n / 12); // n = ครึ่งเสียงจาก A3
    const bass = [-12, -12, -5, -5, -9, -9, -7, -7];               // A E F G
    const mel = [0, 3, 7, 3, 5, 7, 10, 7, 12, 10, 7, 5, 3, 5, 7, null,
                 0, 3, 7, 12, 10, 7, 5, 3, 5, 3, 0, -2, 0, null, 0, null];
    let i = 0, t = c.currentTime + .1;
    const note = (f, at, dur, type, vol) => {
      const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.value = f;
      g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(vol, at + .02); g.gain.exponentialRampToValueAtTime(.001, at + dur);
      o.connect(g).connect(c.destination); o.start(at); o.stop(at + dur + .05);
    };
    this.mTimer = setInterval(() => {
      while (t < c.currentTime + .3) {
        const m = mel[i % mel.length], bar = Math.floor(i / 4) % bass.length;
        if (m != null) note(N(m), t, step * 1.6, 'triangle', .045);
        if (i % 2 === 0) note(N(bass[bar]), t, step * 1.8, 'sine', .09);
        if (i % 4 === 0) { this.tone(110, .15, 'sine', .14, .4, t - c.currentTime); }          // กลองเบส
        if (i % 4 === 2) this.noise(.08, .06, 3000, t - c.currentTime);                          // สแนร์
        if (i % 8 === 7) this.noise(.03, .03, 6000, t - c.currentTime);
        t += step; i++;
      }
    }, 100);
  },

  play(name, vol = 1) {
    if (!this.on || !this.ctx) return;
    const now = performance.now(); if (now - (this.last[name] || 0) < 60) return; // กันเสียงซ้อนรัว
    this.last[name] = now;
    const v = vol, S = this;
    ({
      hit: () => { S.noise(.08, .25 * v, 1800); S.tone(180, .08, 'square', .06 * v, .5); },       // ดาบฟัน
      smash: () => { S.noise(.25, .4 * v, 500); S.tone(90, .25, 'sine', .3 * v, .4); },          // ยักษ์ทุบ
      shoot: () => S.tone(900, .12, 'triangle', .07 * v, .4),                                      // ยิงธนู
      thud: () => S.noise(.05, .15 * v, 2500),                                                     // ลูกธนูปัก
      pop: () => { S.tone(420, .15, 'sine', .18 * v, .3); S.noise(.15, .2 * v, 900); },           // แตกเป็นดิน
      boom: () => { S.noise(.35, .35 * v, 400); S.tone(70, .3, 'sine', .3 * v, .5); },           // ฐานโดนตี
      coin: () => { S.tone(1320, .08, 'square', .05 * v); S.tone(1760, .12, 'square', .05 * v, 1, .07); },
      spawn: () => { S.tone(300, .1, 'triangle', .12 * v, 2); S.tone(600, .1, 'triangle', .1 * v, 1.5, .08); },
      click: () => S.tone(660, .05, 'triangle', .1 * v),
      deny: () => S.tone(160, .15, 'square', .08 * v),
      upgrade: () => [523, 659, 784, 1047].forEach((f, i) => S.tone(f, .18, 'triangle', .12 * v, 1, i * .08)),
      horn: () => { S.tone(220, .5, 'sawtooth', .08 * v); S.tone(330, .6, 'sawtooth', .06 * v, 1, .15); }, // สั่งบุก
      win: () => [523, 659, 784, 659, 1047].forEach((f, i) => S.tone(f, .3, 'triangle', .15, 1, i * .15)),
      lose: () => [392, 330, 262, 196].forEach((f, i) => S.tone(f, .4, 'sawtooth', .07, 1, i * .22)),
    })[name]?.();
  },
};
