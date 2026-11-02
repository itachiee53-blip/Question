// เรียก Gemini API ให้ประเมินแคลอรี่ (ออกแบบให้ประหยัดโทเคน)
const PROMPT = 'คุณคือนักโภชนาการ ประเมินแคลอรี่อาหารแยกทีละรายการ ถ้าไม่ระบุปริมาณให้ใช้ 1 ที่มาตรฐานของไทย ตั้งชื่อภาษาไทยสั้นๆ พร้อมปริมาณ\n';
const SCHEMA = {
  type: 'ARRAY',
  items: { type: 'OBJECT', properties: { name: { type: 'STRING' }, kcal: { type: 'INTEGER' } }, required: ['name', 'kcal'] },
};

const Gemini = {
  async ask(text, img) {
    const key = Store.get('gkey', '');
    if (!key) throw new Error('ใส่ Gemini API key ในการตั้งค่าก่อน');
    const model = Store.get('gmodel', 'gemini-2.5-flash');

    // คำถามแบบข้อความซ้ำ → ใช้คำตอบเดิม ไม่เสียโทเคน
    const cacheKey = 'ai:' + text.toLowerCase();
    if (!img) { const hit = Store.get(cacheKey, null); if (hit) return hit; }

    const parts = [{ text: PROMPT + text }];
    if (img) parts.push({ inline_data: { mime_type: 'image/jpeg', data: img } });
    const gen = { temperature: 0, maxOutputTokens: 400, responseMimeType: 'application/json', responseSchema: SCHEMA };
    if (model.includes('2.5')) gen.thinkingConfig = { thinkingBudget: model.includes('pro') ? 128 : 0 };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    const body = JSON.stringify({ contents: [{ parts }], generationConfig: gen });
    for (let i = 0; ; i++) {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key }, body });
      if ((res.status === 429 || res.status >= 500) && i < 2) { await new Promise(r => setTimeout(r, 2000 * (i + 1))); continue; }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'เรียก API ไม่สำเร็จ');
      const items = JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text || '[]');
      if (!img) Store.set(cacheKey, items);
      return items;
    }
  },

  // ย่อรูปเหลือ 768px JPEG → ลดโทเคนรูปลงมาก
  async shrink(file) {
    const bmp = await createImageBitmap(file);
    const s = Math.min(1, 768 / Math.max(bmp.width, bmp.height));
    const c = Object.assign(document.createElement('canvas'), { width: bmp.width * s, height: bmp.height * s });
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.7).split(',')[1];
  },
};
