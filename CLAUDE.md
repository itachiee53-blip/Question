# Project notes

## UI text rule (from the owner, required)
Every button, title, label, description, toast and hint in the game must be **short and easy to read at a glance**.
- Names: 1–2 words (e.g. `มือปืน`, not `ผู้รอดชีวิต (มือปืน)`).
- Descriptions: one short phrase, about 2–5 words, numbers over sentences (e.g. `ยิงทุก 5 วิ`, `กระสุน +25%`).
- No explanations of how to play inside menus, no parentheses with extra detail, no long sentences joined with `·`.
- Changelog (`CHANGES`) entries: one short line each.
- When adding new UI text, check it against this rule before committing.

## Build
Edit `src/game.html` and `words/*.txt`, then run `python3 build.py` to regenerate `index.html`.
