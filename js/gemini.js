// เรียก Gemini API (ออกแบบให้ประหยัดโทเคน)
const FOOD_SCHEMA = {
  type: 'ARRAY',
  items: {
    type: 'OBJECT',
    properties: { name: { type: 'STRING' }, kcal: { type: 'INTEGER' }, p: { type: 'INTEGER' }, c: { type: 'INTEGER' }, f: { type: 'INTEGER' } },
    required: ['name', 'kcal', 'p', 'c', 'f'],
  },
};
const FOOD_PROMPT = 'นักโภชนาการไทย: แยกอาหาร/เครื่องดื่มทีละรายการ ประเมิน kcal และโปรตีน(p) คาร์บ(c) ไขมัน(f) เป็นกรัม ' +
  'ถ้าไม่ระบุปริมาณใช้ 1 ที่มาตรฐานไทย ดูขนาดจาน/ภาชนะในรูปประกอบ ชื่อไทยสั้นพร้อมปริมาณ ไม่ใช่อาหารให้ตอบ []\n';

const Gemini = {
  async call(parts, gen) {
    if (!CONFIG.GEMINI_KEY) throw new Error('ยังไม่ได้ใส่ Gemini key (หน้า "ฉัน")');
    const model = CONFIG.GEMINI_MODEL;
    const cfg = { temperature: 0, ...gen };
    if (model.includes('2.5')) cfg.thinkingConfig = { thinkingBudget: model.includes('pro') ? 128 : 0 };
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    const body = JSON.stringify({ contents: [{ parts }], generationConfig: cfg });
    for (let i = 0; ; i++) {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': CONFIG.GEMINI_KEY }, body });
      if ((res.status === 429 || res.status >= 500) && i < 2) { await new Promise(r => setTimeout(r, 2000 * (i + 1))); continue; }
      const data = await res.json();
      if (!res.ok) throw new Error(res.status === 429 ? 'โควตา AI เต็ม ลองใหม่อีกสักครู่' : data.error?.message || 'เรียก AI ไม่สำเร็จ');
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }
  },

  // ประเมินอาหารจากข้อความ/รูป → [{name,kcal,p,c,f}]
  async estimate(text, img) {
    const cacheKey = 'ai:' + text.toLowerCase().replace(/\s+/g, ' ');
    const cache = Store.get('aiCache', {});
    if (!img && cache[cacheKey]) return cache[cacheKey]; // ข้อความเดิม → ไม่เสียโทเคน
    const parts = [{ text: FOOD_PROMPT + text }];
    if (img) parts.push({ inline_data: { mime_type: 'image/jpeg', data: img } });
    const items = JSON.parse(await this.call(parts, { maxOutputTokens: 500, responseMimeType: 'application/json', responseSchema: FOOD_SCHEMA }) || '[]');
    if (!img) {
      const keys = Object.keys(cache); if (keys.length > 200) delete cache[keys[0]];
      cache[cacheKey] = items; Store.set('aiCache', cache);
    }
    return items;
  },

  // โค้ชสรุปวันนี้ (ส่งเฉพาะตัวเลขสรุป ไม่ส่งประวัติยาว)
  async coach(summary) {
    return (await this.call([{ text: 'โค้ชลดน้ำหนักภาษาไทย เป็นกันเอง ให้กำลังใจ ตอบ 2-3 ประโยคสั้น บอกสิ่งที่ควรทำต่อวันนี้แบบเจาะจง (เช่นมื้อถัดไปกินอะไร):\n' + summary }],
      { maxOutputTokens: 200, temperature: 0.7 })).trim();
  },

  // ย่อรูปเหลือ 768px JPEG → ลดโทเคนรูป
  async shrink(file) {
    const bmp = await createImageBitmap(file);
    const s = Math.min(1, 768 / Math.max(bmp.width, bmp.height));
    const c = Object.assign(document.createElement('canvas'), { width: bmp.width * s, height: bmp.height * s });
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.75).split(',')[1];
  },
};
