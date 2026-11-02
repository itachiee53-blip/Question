// จัดการข้อมูลใน localStorage
const Store = {
  get(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  },
  set(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  },
  dateKey(offset = 0) {
    const d = new Date(); d.setDate(d.getDate() - offset);
    return d.toLocaleDateString('sv'); // YYYY-MM-DD
  },
  today() { return this.dateKey(0); },
  // ข้อมูลรายวัน: { items: [{name,kcal,p,c,f,meal}], water: แก้ว }
  day(key = this.today()) {
    const d = this.get('day-' + key, null);
    if (Array.isArray(d)) return { items: d, water: 0 }; // รองรับข้อมูลเวอร์ชันเก่า
    return d || { items: [], water: 0 };
  },
  saveDay(d, key = this.today()) { this.set('day-' + key, d); },
};
