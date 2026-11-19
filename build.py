"""Build the site: index.html (game picker), zombie.html (src/zombie.html) and checkpoint.html
(src/checkpoint.html + src/story1.js), with words/*.txt as the dictionary.

Word files: '# topic' lines start a unit; other lines hold 'english|thai' pairs separated by ';'.
3D models live in assets/models and assets/people (CC0, Quaternius) and are loaded at runtime.
"""
import collections, json, pathlib

here = pathlib.Path(__file__).parent
LEVELS = ['a1', 'a2', 'b1', 'b2', 'c1']


def meanings(th):
    """Thai alternatives are separated by spaces in the word files ('เช้า ก่อนเวลา');
    show them as 'เช้า, ก่อนเวลา'. Clarifiers in parentheses, 'ๆ' and Latin tokens stay attached."""
    if "," in th:
        return th
    out = []
    for tok in th.split():
        if out and (tok.startswith('(') or tok == 'ๆ' or out[-1].endswith(' ๆ') or tok.isascii() or out[-1].count('(') > out[-1].count(')')):
            out[-1] += ' ' + tok
        else:
            out.append(tok)
    return ', '.join(out)


def load_words():
    seen = set()
    out, report = {}, []
    for lv in LEVELS:
        units = []
        for f in sorted((here / 'words').glob(lv + '*.txt')):
            for raw in f.read_text(encoding='utf-8').splitlines():
                line = raw.strip()
                if not line:
                    continue
                if line.startswith('#'):
                    units.append([line.lstrip('#').strip(), []])
                    continue
                if not units:
                    units.append(['คำศัพท์', []])
                for item in line.split(';'):
                    if '|' not in item:
                        continue
                    en, th = (x.strip() for x in item.split('|', 1))
                    if not en or not th or '(' in en or en.lower() in seen:
                        continue
                    seen.add(en.lower())
                    units[-1][1].append([en, meanings(th)])
        merged = collections.OrderedDict()
        for n, ws in units:
            merged.setdefault(n, []).extend(ws)
        units = [[n, ws] for n, ws in merged.items() if ws]
        i = 0
        while i < len(units):  # fold tiny units into a neighbour
            if len(units[i][1]) < 6 and len(units) > 1:
                units[i - 1 if i > 0 else i + 1][1].extend(units[i][1])
                units.pop(i)
                continue
            i += 1
        out[lv] = units
        report.append(f'{lv}: {sum(len(ws) for _, ws in units)} words, {len(units)} topics')
    return out, report


def main():
    words, report = load_words()
    wj = json.dumps(words, ensure_ascii=False, separators=(',', ':'))
    # the zombie game and the checkpoint game each get their own page; index.html lets the player pick one
    zombie = (here / 'src' / 'zombie.html').read_text(encoding='utf-8')
    assert '/*WORDS*/{}' in zombie
    (here / 'zombie.html').write_text(zombie.replace('/*WORDS*/{}', wj), encoding='utf-8')
    cp = (here / 'src' / 'checkpoint.html').read_text(encoding='utf-8')
    assert '/*WORDS*/{}' in cp and '/*STORY*/' in cp
    story = (here / 'src' / 'story1.js').read_text(encoding='utf-8')
    vi = here / 'assets' / 'voice' / 'index.json'
    voice = vi.read_text(encoding='utf-8') if vi.exists() else '{}'
    assert '/*VOICE*/{}' in cp
    page = cp.replace('/*WORDS*/{}', wj).replace('/*STORY*/', story).replace('/*VOICE*/{}', voice)
    (here / 'checkpoint.html').write_text(page, encoding='utf-8')
    (here / 'index.html').write_text((here / 'src' / 'index.html').read_text(encoding='utf-8'), encoding='utf-8')
    print('\n'.join(report))
    print('total', sum(len(ws) for u in words.values() for _, ws in u), 'words ·', len(page) // 1024, 'KB')


if __name__ == '__main__':
    main()
