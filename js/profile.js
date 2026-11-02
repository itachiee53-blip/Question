// คำนวณแผนลดน้ำหนักจากข้อมูลส่วนตัว (สูตร Mifflin-St Jeor)
const ACTIVITY = [
  [1.2, 'นั่งทำงานทั้งวัน', 'แทบไม่ได้ออกกำลังกาย'],
  [1.375, 'ขยับบ้าง', 'ออกกำลังกาย 1–3 วัน/สัปดาห์'],
  [1.55, 'แอคทีฟ', 'ออกกำลังกาย 3–5 วัน/สัปดาห์'],
  [1.725, 'สายฟิต', 'ออกกำลังกายหนัก 6–7 วัน/สัปดาห์'],
];
const PACE = [
  [0.25, 'ค่อยเป็นค่อยไป', 'ลด 0.25 kg/สัปดาห์ · ไม่หิว ทำได้ยาว'],
  [0.5, 'สมดุล (แนะนำ)', 'ลด 0.5 kg/สัปดาห์ · เห็นผลชัด'],
  [0.75, 'เร่งสปีด', 'ลด 0.75 kg/สัปดาห์ · ต้องวินัยสูง'],
];

const Profile = {
  get: () => Store.get('profile', null),
  save: p => Store.set('profile', p),

  plan(p) {
    const w = Store.get('weights', []).at(-1)?.kg || p.weight;
    const bmr = 10 * w + 6.25 * p.height - 5 * p.age + (p.sex === 'm' ? 5 : -161);
    const tdee = bmr * p.activity;
    const losing = p.goalWeight < w;
    const floor = p.sex === 'm' ? 1500 : 1200; // ไม่ต่ำกว่านี้เพื่อสุขภาพ
    const kcal = Math.round(losing ? Math.max(tdee - p.pace * 1100, floor) : tdee);
    const protein = Math.round(w * 1.8); // โปรตีนสูงช่วยรักษากล้าม อิ่มนาน
    const fat = Math.round(kcal * 0.25 / 9);
    const carb = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
    const deficit = tdee - kcal;
    const weeks = losing && deficit > 0 ? Math.ceil((w - p.goalWeight) * 7700 / (deficit * 7)) : 0;
    return {
      weight: w, bmr: Math.round(bmr), tdee: Math.round(tdee), kcal, protein, fat, carb,
      water: Math.max(6, Math.round(w * 35 / 250)), // แก้วละ 250 ml
      bmi: +(w / (p.height / 100) ** 2).toFixed(1), weeks,
    };
  },

  // บันทึกน้ำหนัก (วันเดียวกันเขียนทับ)
  logWeight(kg) {
    const w = Store.get('weights', []).filter(x => x.d !== Store.today());
    w.push({ d: Store.today(), kg }); Store.set('weights', w.slice(-365));
  },

  bmiLabel(b) {
    return b < 18.5 ? 'ผอม' : b < 23 ? 'ปกติ' : b < 25 ? 'ท้วม' : b < 30 ? 'อ้วน' : 'อ้วนมาก'; // เกณฑ์คนเอเชีย
  },
};
