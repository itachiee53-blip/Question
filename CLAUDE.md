# Project notes

## UI text rule (from the owner, required)
Every button, title, label, description, toast and hint in the game must be **short and easy to read at a glance**.
- Names: short, no extra detail in parentheses (e.g. `ผู้รอดชีวิต`, `สุนัขเฝ้ายาม` — the owner likes these; not `ผู้รอดชีวิต (มือปืน)`).
- Descriptions: one short phrase, about 2–5 words, numbers over sentences (e.g. `ยิงทุก 5 วิ`, `กระสุน +25%`).
- No explanations of how to play inside menus, no parentheses with extra detail, no long sentences joined with `·`.
- Changelog (`CHANGES`) entries: one short line each.
- When adding new UI text, check it against this rule before committing.

## Build
The site has one game and a picker page:
- `src/index.html` → `index.html`: the game picker.
- `src/zombie.html` → `zombie.html`: **Dead Words**, the zombie word game.
- `words/*.txt`: dictionary used when the player taps a word.
- Models: `assets/models` (scenery, zombies).
Run `python3 build.py` to regenerate the root pages.

## Deploy rule (from the owner, required)
The game is played from `main`. After every change: build, commit, push the working branch, open a PR to `main`, and **merge it yourself right away**. Do not ask the owner to press Merge.
