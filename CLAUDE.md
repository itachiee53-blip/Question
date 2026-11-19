# Project notes

## UI text rule (from the owner, required)
Every button, title, label, description, toast and hint in the game must be **short and easy to read at a glance**.
- Names: short, no extra detail in parentheses (e.g. `ผู้รอดชีวิต`, `สุนัขเฝ้ายาม` — the owner likes these; not `ผู้รอดชีวิต (มือปืน)`).
- Descriptions: one short phrase, about 2–5 words, numbers over sentences (e.g. `ยิงทุก 5 วิ`, `กระสุน +25%`).
- No explanations of how to play inside menus, no parentheses with extra detail, no long sentences joined with `·`.
- Changelog (`CHANGES`) entries: one short line each.
- When adding new UI text, check it against this rule before committing.

## Build
The game is **Last Checkpoint** (ด่านสุดท้าย): a 3D checkpoint story game for learning English.
- `src/game.html`: engine (scene, people, inspection tools, dialogue, cutscenes, saves).
- `src/story1.js`: chapter 1 (cast, 5 days, dialogue, events, endings). Inlined into the page at `/*STORY*/`.
- `words/*.txt`: dictionary used when the player taps a word.
- Models: `assets/models` (scenery, zombies) and `assets/people` (CC0 Quaternius characters; `_anims.glb` holds the shared animations).
Run `python3 build.py` to regenerate `index.html`.
Story lines: natural spoken English, and natural Thai (not word-for-word).

## Deploy rule (from the owner, required)
The game is played from `main`. After every change: build, commit, push the working branch, open a PR to `main`, and **merge it yourself right away**. Do not ask the owner to press Merge.
