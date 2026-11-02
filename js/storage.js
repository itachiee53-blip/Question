// จัดการข้อมูลใน localStorage
const Store = {
  get(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  },
  set(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  },
  today: () => new Date().toLocaleDateString('sv'), // YYYY-MM-DD
};
