// ค่าตั้งของเกม (ปรับสมดุลได้ที่ไฟล์นี้ไฟล์เดียว)
const WORLD = 3200;       // ความยาวด่าน (ทางเดินเส้นตรง)
const VIEW_H = 540;       // ความสูงจอแบบตรรกะ
const GROUND = 375;       // ระดับพื้น
const POP_CAP = 26;       // จำนวนทหารสูงสุดต่อฝ่าย

const TEAM = [
  { name: 'เรา', color: '#4a7fd1', dark: '#2c4f8a', dir: 1 },
  { name: 'ศัตรู', color: '#d1544a', dark: '#8a2f28', dir: -1 }, // สีเปลี่ยนตามเผ่าศัตรูแต่ละด่าน
];

// hp เลือด · dmg ดาเมจ · range ระยะ · rate วินาที/ครั้ง · speed px/วิ · time เวลาฝึก
// model ไฟล์โมเดล · h ความสูงบนจอ · anim ชื่อท่า (atk/mine) · lv ด่านที่ปลดล็อก (ฝั่งเรา)
// พิเศษ: ranged ชนิดกระสุน · splash ระเบิดวงกว้าง · heal ฮีลเพื่อน · armor ลดดาเมจ · charge พุ่งชนครั้งแรก · fly บิน
const UNITS = {
  // ---------- ฝ่ายเรา: อาณาจักรดินเหนียว ----------
  miner:   { name: 'คนงาน', icon: '⛏️', cost: 50, time: 2, hp: 70, speed: 75, role: 'miner', model: 'miner', h: 82, anim: { mine: 'punch' } },
  sword:   { name: 'นักดาบ', icon: '🗡️', cost: 90, time: 3, hp: 170, dmg: 18, range: 36, rate: .9, speed: 85, model: 'sword', h: 92 },
  archer:  { name: 'นักธนู', icon: '🏹', cost: 120, time: 3.5, hp: 85, dmg: 14, range: 280, rate: 1.4, speed: 70, ranged: 'arrow', model: 'archer', h: 88 },
  wizard:  { name: 'พ่อมด', icon: '🔮', cost: 170, time: 4, hp: 90, dmg: 28, range: 250, rate: 2.2, speed: 65, ranged: 'fireball', splash: 70, model: 'wizard', h: 90, lv: 1 },
  cavalry: { name: 'ทหารม้า', icon: '🐎', cost: 220, time: 5, hp: 420, dmg: 26, range: 44, rate: 1.1, speed: 150, charge: 2.5, model: 'horse', h: 82, lv: 1 },
  cleric:  { name: 'นักบวช', icon: '✨', cost: 150, time: 4, hp: 110, heal: 32, range: 210, rate: 2, speed: 65, model: 'cleric', h: 90, lv: 2 },
  knight:  { name: 'อัศวินทอง', icon: '🛡️', cost: 320, time: 7, hp: 1300, dmg: 42, range: 46, rate: 1.5, speed: 48, armor: .35, splash: 35, model: 'knight', h: 122, anim: { atk: 'punch' }, lv: 3 },

  // ---------- ศัตรู ----------
  gob_miner:  { name: 'ก็อบลินขุดแร่', cost: 50, time: 2, hp: 65, speed: 80, role: 'miner', model: 'goblinf', h: 72, anim: { mine: 'punch' } },
  goblin:     { name: 'ก็อบลิน', cost: 70, time: 2.5, hp: 120, dmg: 14, range: 32, rate: .8, speed: 100, model: 'goblin', h: 78, anim: { atk: 'punch' } },
  gob_shoot:  { name: 'ก็อบลินหนังสติ๊ก', cost: 100, time: 3, hp: 70, dmg: 11, range: 250, rate: 1.4, speed: 80, ranged: 'rock', model: 'goblinf', h: 72, anim: { atk: 'shoot' } },
  slime:      { name: 'สไลม์', cost: 40, time: 1.5, hp: 55, dmg: 8, range: 28, rate: .7, speed: 115, model: 'slime', h: 38 },
  troll:      { name: 'โทรลล์ยักษ์', cost: 320, time: 7, hp: 1600, dmg: 55, range: 52, rate: 1.8, speed: 40, splash: 45, model: 'goblin', h: 160, anim: { atk: 'punch' }, boss: 1 },
  zom_miner:  { name: 'ผีดิบขุดแร่', cost: 50, time: 2, hp: 80, speed: 60, role: 'miner', model: 'zombie', h: 84, anim: { mine: 'punch' } },
  zombie:     { name: 'ผีดิบ', cost: 80, time: 2.5, hp: 240, dmg: 14, range: 32, rate: 1.2, speed: 45, model: 'zombie', h: 86, anim: { atk: 'punch' } },
  skeleton:   { name: 'โครงกระดูก', cost: 90, time: 3, hp: 120, dmg: 20, range: 38, rate: .9, speed: 90, model: 'skeleton', h: 96 },
  bat:        { name: 'ค้างคาว', cost: 70, time: 2, hp: 55, dmg: 10, range: 30, rate: .7, speed: 145, fly: 70, model: 'bat', h: 46 },
  skel_king:  { name: 'ราชาโครงกระดูก', cost: 0, time: 1, hp: 2200, dmg: 50, range: 55, rate: 1.4, speed: 55, splash: 50, model: 'skeleton', h: 170, boss: 1 },
  vik_miner:  { name: 'ไวกิ้งขุดแร่', cost: 50, time: 2, hp: 90, speed: 80, role: 'miner', model: 'vikingf', h: 86, anim: { mine: 'punch' } },
  viking:     { name: 'ไวกิ้ง', cost: 100, time: 3, hp: 210, dmg: 22, range: 36, rate: 1, speed: 85, model: 'viking', h: 94, anim: { atk: 'punch' } },
  axe:        { name: 'ไวกิ้งขว้างขวาน', cost: 120, time: 3.5, hp: 100, dmg: 17, range: 240, rate: 1.5, speed: 75, ranged: 'axe', model: 'vikingf', h: 88, anim: { atk: 'shoot' } },
  rogue:      { name: 'นักฆ่า', cost: 110, time: 3, hp: 120, dmg: 24, range: 30, rate: .6, speed: 135, model: 'rogue', h: 86 },
  dragon:     { name: 'มังกรเพลิง', cost: 0, time: 1, hp: 4500, dmg: 45, range: 170, rate: 2.4, speed: 38, splash: 110, fly: 110, ranged: 'flame', model: 'dragon', h: 190, boss: 1 },
};

// เผ่าศัตรูแต่ละด่าน: roster = โอกาสที่ AI จะเลือกสร้าง
const FACTIONS = [
  { name: 'เผ่าก็อบลิน', color: '#5f9a3a', miner: 'gob_miner', roster: { goblin: .45, gob_shoot: .3, slime: .25 }, boss: 'troll' },
  { name: 'กองทัพผีดิบ', color: '#7a5aa8', miner: 'zom_miner', roster: { zombie: .35, skeleton: .4, bat: .25 }, boss: 'skel_king' },
  { name: 'โจรสลัดไวกิ้ง', color: '#d1544a', miner: 'vik_miner', roster: { viking: .4, axe: .3, rogue: .3 }, boss: 'troll' },
  { name: 'จอมมารมังกร', color: '#3a3040', miner: 'gob_miner', roster: { skeleton: .2, viking: .2, axe: .2, rogue: .15, bat: .2, troll: .05 }, boss: 'dragon' },
];

const ECON = { startGold: 200, mineTime: 2.2, load: 14, passive: 1.5 };
const BASE = { hp: 1500, towerDmg: 9, towerRange: 320, towerRate: 1.5 };

// สกิลของผู้เล่น
const ABILITIES = {
  rain: { name: 'ฝนดาวตก', icon: '☄️', cd: 35, lv: 0, desc: 'อุกกาบาตถล่มศัตรูทั้งจอ' },
  heal: { name: 'ฟื้นฟู', icon: '💚', cd: 45, lv: 1, desc: 'ฮีลทหารทั้งหมด + ซ่อมฐาน' },
  rage: { name: 'ปลุกใจ', icon: '⚡', cd: 50, lv: 2, desc: 'ทหารแรง+เร็วขึ้น 10 วิ' },
};

// ด่าน: ai = ตัวคูณรายได้ศัตรู, think = ความถี่คิดของ AI, wave = ทุกกี่วิมีคลื่นบุก, bossAt = บอสมาวินาทีที่
const LEVELS = [
  { name: 'ป่าก็อบลิน', faction: 0, ai: .8, think: 1.5, wave: 75, bossAt: 150, sky: ['#9fd3ef', '#e8f4f8'], hill: '#8bbf6a' },
  { name: 'สุสานผีดิบ', faction: 1, ai: 1.0, think: 1.2, wave: 65, bossAt: 130, sky: ['#6a5a8a', '#c9b6d6'], hill: '#5e6a5a' },
  { name: 'ฝั่งทะเลไวกิ้ง', faction: 2, ai: 1.2, think: 1, wave: 60, bossAt: 120, sky: ['#f6c28b', '#fbe6c8'], hill: '#c98b4a' },
  { name: 'รังมังกร', faction: 3, ai: 1.35, think: .8, wave: 60, bossAt: 110, sky: ['#3a3550', '#b0607a'], hill: '#4e3a33' },
];
