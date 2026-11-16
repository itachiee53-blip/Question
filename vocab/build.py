"""Build vocab/index.html (artifact page) and the site root index.html from src.html + art/*.webp."""
import base64, json, pathlib
here = pathlib.Path(__file__).parent
art = {p.stem: 'data:image/webp;base64,' + base64.b64encode(p.read_bytes()).decode() for p in sorted((here / 'art').glob('*.webp'))}
src = (here / 'src.html').read_text(encoding='utf-8')
assert '/*ART*/{}' in src
page = src.replace('/*ART*/{}', json.dumps(art))
(here / 'index.html').write_text(page, encoding='utf-8')
head = ('<!doctype html>\n<html lang="th">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
        '<meta name="theme-color" content="#5b4636">\n'
        '<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}[hidden]{display:none!important}</style>\n'
        '</head>\n<body>\n')
(here.parent / 'index.html').write_text(head + page + '\n</body>\n</html>\n', encoding='utf-8')
print('built', len(page) // 1024, 'KB')
