// ค่าตั้งของเกม (ปรับสมดุลได้ที่ไฟล์นี้ไฟล์เดียว)
const WORLD = 3200;       // ความยาวด่าน (ทางเดินเส้นตรง)
const VIEW_H = 540;       // ความสูงจอแบบตรรกะ
const GROUND = 375;       // ระดับพื้น
const POP_CAP = 24;       // จำนวนทหารสูงสุดต่อฝ่าย

const TEAM = [
  { name: 'เรา', color: '#4a7fd1', dark: '#2c4f8a', dir: 1 },
  { name: 'ศัตรู', color: '#d1544a', dark: '#8a2f28', dir: -1 },
];

// hp เลือด · dmg ดาเมจ · range ระยะตี · rate วินาที/ครั้ง · speed px/วิ · time เวลาฝึก
const UNITS = {
  miner:  { name: 'คนงาน', icon: '⛏️', cost: 50,  time: 2,   hp: 70,  dmg: 0,  range: 0,   rate: 1,   speed: 75, size: 0.85 },
  sword:  { name: 'นักดาบ', icon: '🗡️', cost: 90,  time: 3,   hp: 160, dmg: 18, range: 36,  rate: 0.9, speed: 85, size: 1 },
  archer: { name: 'นักธนู', icon: '🏹', cost: 120, time: 3.5, hp: 85,  dmg: 13, range: 280, rate: 1.4, speed: 70, size: 0.95 },
  cavalry:{ name: 'ทหารม้า', icon: '🐎', cost: 220, time: 5,   hp: 420, dmg: 26, range: 44,  rate: 1.1, speed: 150, size: 1.3, charge: 2.5 },
  giant:  { name: 'ยักษ์', icon: '🗿', cost: 320, time: 7,   hp: 1000, dmg: 55, range: 50, rate: 1.8, speed: 42, size: 1.75, splash: 40 },
};

const ECON = {
  startGold: 200,
  mineTime: 2.2,     // วินาทีที่ขุดต่อรอบ
  load: 14,          // ทองต่อรอบ
  passive: 1.5,      // ทองไหลเข้าเองต่อวินาที
};

const BASE = { hp: 1500, towerDmg: 9, towerRange: 320, towerRate: 1.5 };

// ด่าน: ai = ตัวคูณรายได้ศัตรู, think = ความถี่คิดของ AI
const LEVELS = [
  { name: 'ทุ่งดินเหนียว', ai: 0.75, think: 1.6, sky: ['#9fd3ef', '#e8f4f8'], hill: '#8bbf6a' },
  { name: 'หุบเขาแดง', ai: 1.0, think: 1.2, sky: ['#f6c28b', '#fbe6c8'], hill: '#c98b4a' },
  { name: 'ป้อมดินเผา', ai: 1.3, think: 0.9, sky: ['#7b6aa8', '#e8a7a0'], hill: '#8a5a44' },
  { name: 'ราชันย์ดินดำ', ai: 1.6, think: 0.7, sky: ['#3a3550', '#8a6a7a'], hill: '#4e3a33' },
];
