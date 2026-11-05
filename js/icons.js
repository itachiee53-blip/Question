// ไอคอน SVG วาดเอง (ไม่ใช้ emoji → หน้าตาเหมือนกันทุกเครื่อง เข้ากับสไตล์เกม)
const OL = 'stroke="#2a160a" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"';
const svg = body => `<svg viewBox="0 0 48 48" aria-hidden="true">${body}</svg>`;
const ICON = {
  coin: svg(`<circle cx="24" cy="24" r="18" fill="#f2b632" ${OL}/><circle cx="24" cy="24" r="12.5" fill="#ffd45a" stroke="#c98a1c" stroke-width="2"/>
    <path d="M24 15l2.6 5.4 5.9.8-4.3 4.1 1 5.9L24 28.4l-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z" fill="#e89a1a"/><path d="M13 17a13 13 0 0 1 9-7" stroke="#fff6c8" stroke-width="3" fill="none" stroke-linecap="round"/>`),
  pop: svg(`<path d="M10 30c0-10 6-17 14-17s14 7 14 17v5H10z" fill="#9aa8b8" ${OL}/><path d="M24 13v22" stroke="#6a7686" stroke-width="3"/>
    <path d="M7 35h34v5H7z" fill="#c9d2dc" ${OL}/><path d="M16 22a9 9 0 0 1 5-6" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".7"/><path d="M24 7c-2 3-2 5 0 7 2-2 2-4 0-7z" fill="#d1544a" ${OL}/>`),
  castle: svg(`<path d="M8 40V18l4-4 4 4v6h4v-4h3v4h2v-4h3v4h4v-6l4-4 4 4v22z" fill="#d8cfc0" ${OL}/><path d="M19 40v-8a5 5 0 0 1 10 0v8z" fill="#4a2e1a" ${OL}/>
    <path d="M7 18l5-9 5 9zM31 18l5-9 5 9z" fill="#4a7fd1" ${OL}/><path d="M12 9V4l5 2-5 2" fill="#ffd45a" stroke="#2a160a" stroke-width="1.6"/>`),
  sound: svg(`<path d="M8 19h7l9-8v26l-9-8H8z" fill="#f2e6cc" ${OL}/><path d="M30 18a8 8 0 0 1 0 12M34 13a15 15 0 0 1 0 22" fill="none" stroke="#f2e6cc" stroke-width="3.4" stroke-linecap="round"/>`),
  mute: svg(`<path d="M8 19h7l9-8v26l-9-8H8z" fill="#f2e6cc" ${OL}/><path d="M30 19l10 10M40 19L30 29" stroke="#ff7a5a" stroke-width="3.6" stroke-linecap="round"/>`),
  pause: svg(`<rect x="13" y="11" width="8" height="26" rx="2.5" fill="#f2e6cc" ${OL}/><rect x="27" y="11" width="8" height="26" rx="2.5" fill="#f2e6cc" ${OL}/>`),
  rain: svg(`<path d="M40 6L18 24" stroke="#ffb340" stroke-width="7" stroke-linecap="round" opacity=".55"/><path d="M36 8L20 22" stroke="#ffe08a" stroke-width="3.5" stroke-linecap="round"/>
    <circle cx="17" cy="30" r="10" fill="#ff7a2a" ${OL}/><circle cx="15" cy="28" r="5" fill="#ffd45a"/><path d="M8 40l4-3M20 42l1-4" stroke="#ff7a2a" stroke-width="3" stroke-linecap="round"/>`),
  heal: svg(`<path d="M24 41S7 30 7 18a8.5 8.5 0 0 1 17-2 8.5 8.5 0 0 1 17 2c0 12-17 23-17 23z" fill="#5ad16a" ${OL}/><path d="M24 20v12M18 26h12" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
    <path d="M12 16a5 5 0 0 1 4-4" stroke="#d8ffd0" stroke-width="2.5" fill="none" stroke-linecap="round"/>`),
  rage: svg(`<path d="M28 4L11 27h11l-4 17 19-25H26z" fill="#ffd23a" ${OL}/><path d="M25 10l-7 11" stroke="#fff6c8" stroke-width="2.4" stroke-linecap="round"/>`),
  defend: svg(`<path d="M24 5l15 5v12c0 10-7 17-15 21C16 39 9 32 9 22V10z" fill="#4a7fd1" ${OL}/><path d="M24 9v30c6-3 11-9 11-17V13z" fill="#2f5fae"/>
    <path d="M24 5l15 5v12c0 10-7 17-15 21C16 39 9 32 9 22V10z" fill="none" ${OL}/><path d="M24 14l2.4 5 5.4.7-4 3.7 1 5.4-4.8-2.6-4.8 2.6 1-5.4-4-3.7 5.4-.7z" fill="#ffd45a" stroke="#2a160a" stroke-width="1.5"/>`),
  attack: svg(`<path d="M8 6l22 24M40 6L18 30" stroke="#2a160a" stroke-width="8" stroke-linecap="round"/><path d="M8 6l22 24M40 6L18 30" stroke="#e8eef4" stroke-width="4" stroke-linecap="round"/>
    <path d="M13 34l8-8M27 26l8 8" stroke="#2a160a" stroke-width="8" stroke-linecap="round"/><path d="M13 34l8-8M27 26l8 8" stroke="#ffc83a" stroke-width="4" stroke-linecap="round"/>
    <circle cx="12" cy="38" r="3.5" fill="#d1544a" ${OL}/><circle cx="36" cy="38" r="3.5" fill="#d1544a" ${OL}/>`),
  lock: svg(`<path d="M16 22v-6a8 8 0 0 1 16 0v6" fill="none" stroke="#2a160a" stroke-width="7"/><path d="M16 22v-6a8 8 0 0 1 16 0v6" fill="none" stroke="#c9d2dc" stroke-width="3.5"/>
    <rect x="11" y="21" width="26" height="20" rx="4" fill="#f2b632" ${OL}/><circle cx="24" cy="30" r="3" fill="#2a160a"/><path d="M24 31v5" stroke="#2a160a" stroke-width="3"/>`),
  shield: c => svg(`<path d="M24 5l15 5v12c0 10-7 17-15 21C16 39 9 32 9 22V10z" fill="${c}" ${OL}/><path d="M24 9v30c6-3 11-9 11-17V13z" fill="rgba(0,0,0,.2)"/><path d="M17 20h14M24 14v18" stroke="#ffd45a" stroke-width="3.5" stroke-linecap="round"/>`),
};
