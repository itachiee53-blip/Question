"""Generate the recorded voice lines for Last Checkpoint.

  node tools/voice_lines.js > /tmp/lines.json
  python3 tools/make_voices.py /tmp/lines.json <models dir>

Needs `pip install piper-tts` and ffmpeg. Voices (all free to use, from rhasspy/piper-voices on Hugging Face):
  en_US-joe-medium (CC0), en_US-john-medium, en_US-norman-medium, en_US-bryce-medium, en_US-kristin-medium (public domain),
  en_GB-cori-medium (CC BY 4.0), en_US-libritts_r-medium (CC BY 4.0, many speakers; LNN = speaker id).
Writes assets/voice/<n>.mp3 and assets/voice/index.json ("who|english" -> n).
Names the player types are not in the recordings, so the lines are recorded without them.
"""
import json, os, re, subprocess, sys, tempfile, wave
from piper import PiperVoice
from piper.config import SynthesisConfig

CAST = {
    'carter': 'joe', 'min': 'cori', 'diaz': 'kristin', 'radio': 'bryce', '': 'norman',
    'me_m': 'norman', 'me_f': 'L64',
    'rossi': 'john', 'Antonio Rossi': 'john', 'sunhee': 'L0', 'Sun-hee Park': 'L0', 'maria': 'L80', 'Maria Torres': 'L80',
    'elena': 'L56', 'Dr. Elena Ward': 'L56', 'jae': 'L148',
    'Daniel Reyes': 'L52', 'Grace Okafor': 'L208', 'Marcus Bell': 'L48', 'Lena Novak': 'L184', 'Hassan Ali': 'L136',
    'Tom Hughes': 'L24', 'Victor Kane': 'L168', 'Ruth Abara': 'L236', 'Priya Nair': 'L12', 'Father Michael': 'L8',
    'Sofia Marin': 'L192', 'Leo': 'L36', 'Nadia Hassan': 'L224', 'Omar Farouk': 'L116', 'Hana Kowalski': 'L40',
    'Min-jun Park': 'L156', 'Paul Grant': 'L124', 'Jack Doyle': 'L44', 'Ben Torres': 'L88', 'Samuel Okoye': 'L132',
}
MODELS = {'joe': 'en_US-joe-medium', 'john': 'en_US-john-medium', 'norman': 'en_US-norman-medium', 'bryce': 'en_US-bryce-medium',
          'kristin': 'en_US-kristin-medium', 'cori': 'en_GB-cori-medium'}


def spoken(en):
    """Text as recorded: no player-chosen names, no stage directions."""
    t = re.sub(r'\*[^*]*\*', '', en)
    t = t.replace("{S}'s", 'her')
    # a sentence whose point is the name ("Her name is {S}.") is dropped whole
    t = ' '.join(x for x in re.split(r'(?<=[.!?])\s+', t) if not re.search(r'name (?:is|was)\s*\{[PS]\}', x))
    t = re.sub(r',\s*\{[PS]\}', '', t)
    t = re.sub(r'\{[PS]\}\s*[,:]\s*', '', t)
    t = t.replace('{P}', '').replace('{S}', '')
    t = re.sub(r'\s+([,.!?])', r'\1', t)
    t = re.sub(r'([,:])\s*([.!?])', r'\2', t)
    t = re.sub(r'\s{2,}', ' ', t).strip(' ,')
    t = re.sub(r'^([.!?]\s*)+', '', t)
    t = re.sub(r'\.{4,}', '...', t)
    t = re.sub(r'([.!?]\s+)([a-z])', lambda m: m.group(1) + m.group(2).upper(), t)
    return t if re.search('[A-Za-z]', t) else ''


def main():
    lines, mdir = json.load(open(sys.argv[1])), sys.argv[2]
    root = os.path.join(os.path.dirname(__file__), '..', 'assets', 'voice')
    os.makedirs(root, exist_ok=True)
    loaded = {}

    def voice(v):
        key = 'libritts' if v.startswith('L') else v
        if key not in loaded:
            loaded[key] = PiperVoice.load(os.path.join(mdir, (MODELS.get(v) or 'en_US-libritts_r-medium') + '.onnx'))
        return loaded[key], (SynthesisConfig(speaker_id=int(v[1:])) if v.startswith('L') else None)

    jobs = []
    for l in lines:
        whos = ['me_m', 'me_f'] if l['who'] == 'me' else [l['who']]
        for w in whos:
            jobs.append((w, l['en']))
    index, n = {}, 0
    for who, en in jobs:
        text = spoken(en)
        if not text:
            continue
        v = CAST.get(who)
        if not v:
            print('no voice for', repr(who), file=sys.stderr)
            continue
        model, cfg = voice(v)
        with tempfile.NamedTemporaryFile(suffix='.wav') as tmp:
            with wave.open(tmp.name, 'wb') as wf:
                model.synthesize_wav(text, wf, syn_config=cfg)
            af = 'loudnorm=I=-16:TP=-1.5:LRA=11'
            if who == 'radio':
                af = 'highpass=f=350,lowpass=f=3000,acompressor,' + af
            out = os.path.join(root, f'{n}.mp3')
            subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', tmp.name, '-af', af, '-ac', '1', '-ar', '22050', '-b:a', '40k', out], check=True)
        index[f'{who}|{en}'] = n
        n += 1
    json.dump(index, open(os.path.join(root, 'index.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
    print(n, 'lines')


if __name__ == '__main__':
    main()
