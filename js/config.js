// ตั้งค่า Gemini — key เก็บใน localStorage ของเครื่องนี้ (ไม่อยู่ในโค้ด เพราะ repo เป็น Public)
// ตั้ง key ได้ 2 ทาง: เปิดลิงก์ .../#key=XXXX ครั้งเดียว หรือใส่ในหน้า "ฉัน"
if (location.hash.startsWith('#key=')) {
  try { localStorage.setItem('gkey', JSON.stringify(decodeURIComponent(location.hash.slice(5)))); } catch {}
  history.replaceState(null, '', location.pathname);
}
const CONFIG = {
  get GEMINI_KEY() { try { return JSON.parse(localStorage.getItem('gkey')) || ''; } catch { return ''; } },
  GEMINI_MODEL: 'gemini-2.5-flash',
};
