"""Build vocab/index.html (artifact page) and the site root index.html.

Inputs: src.html, art/*.webp, words/<level>*.txt
Word files: '# topic' lines start a unit; other lines hold 'english|thai' pairs separated by ';'.
"""
import base64, json, pathlib, re, collections

here = pathlib.Path(__file__).parent
LEVELS = ['a1', 'a2', 'b1', 'b2', 'c1']


def load_words():
    seen = set()
    out = {}
    report = []
    for lv in LEVELS:
        units = []
        for f in sorted((here / 'words').glob(lv + '*.txt')):
            name = None
            for raw in f.read_text(encoding='utf-8').splitlines():
                line = raw.strip()
                if not line:
                    continue
                if line.startswith('#'):
                    name = line.lstrip('#').strip()
                    units.append([name, []])
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
                    units[-1][1].append([en, th])
        # merge units with the same name, then fold tiny units into their neighbour
        merged = collections.OrderedDict()
        for n, ws in units:
            merged.setdefault(n, []).extend(ws)
        units = [[n, ws] for n, ws in merged.items() if ws]
        i = 0
        while i < len(units):
            if len(units[i][1]) < 6 and len(units) > 1:
                j = i - 1 if i > 0 else i + 1
                units[j][1].extend(units[i][1])
                units.pop(i)
                continue
            i += 1
        out[lv] = units
        th_count = collections.Counter(w[1] for _, ws in units for w in ws)
        dup_th = sum(1 for c in th_count.values() if c > 1)
        report.append(f'{lv}: {sum(len(ws) for _, ws in units)} words, {len(units)} topics, {dup_th} shared Thai meanings')
    return out, report


def main():
    words, report = load_words()
    art = {p.stem: 'data:image/webp;base64,' + base64.b64encode(p.read_bytes()).decode()
           for p in sorted((here / 'art').glob('*.webp'))}
    src = (here / 'src.html').read_text(encoding='utf-8')
    for marker in ('/*ART*/{}', '/*WORDS*/{}'):
        assert marker in src, marker
    page = src.replace('/*ART*/{}', json.dumps(art)).replace('/*WORDS*/{}', json.dumps(words, ensure_ascii=False, separators=(',', ':')))
    (here / 'index.html').write_text(page, encoding='utf-8')
    head = ('<!doctype html>\n<html lang="th">\n<head>\n<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
            '<meta name="theme-color" content="#5b4636">\n'
            '<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}[hidden]{display:none!important}</style>\n'
            '</head>\n<body>\n')
    (here.parent / 'index.html').write_text(head + page + '\n</body>\n</html>\n', encoding='utf-8')
    print('\n'.join(report))
    print('total', sum(len(ws) for u in words.values() for _, ws in u), 'words ·', len(page) // 1024, 'KB')


if __name__ == '__main__':
    main()
