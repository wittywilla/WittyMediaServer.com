# SPDX-License-Identifier: AGPL-3.0-or-later
# Copyright (C) 2026 WittyWilla and contributors
# Records, in the website's content/licences.json, every work that can be seen in each picture.
#   python credits.py <server> <repo> <key>=<folder>/<name> ...
# For each picture, <name>.txt holds the words on screen and <name>.src the pictures on screen (from the
# capture scripts). A work counts as seen when its title is a line on screen, or when a picture on screen
# is of its file (a poster, a backdrop, a page, a photo). Licences come from D:/WittyDemoMedia/credits.json.
import sys, os, re, json, datetime, urllib.request

DEMO = os.environ.get('WMS_MEDIA', 'D:/WittyDemoMedia')
server, repo = sys.argv[1], sys.argv[2]
pairs = [a.split('=', 1) for a in sys.argv[3:]]

credits = json.load(open(os.path.join(DEMO, 'credits.json'), encoding='utf-8'))

def spdx(l):
    l = l.strip()
    if l.lower().startswith('public domain'): return 'Public domain'
    if l.startswith('CC0'): return 'CC0-1.0'
    m = re.match(r'CC (BY(?:-SA)?) (\d\.\d)(?: (?!and\b)([a-zA-Z]{2,3})\b)?', l)
    if m: return f"CC-{m[1]}-{m[2]}" + (f"-{m[3].upper()}" if m[3] else '')
    for a, b in [('GPL-3.0-or-later', 'GPL-3.0-or-later'), ('GPL-2.0-or-later', 'GPL-2.0-or-later'), ('GPL-3.0', 'GPL-3.0-only'), ('GPL-2.0', 'GPL-2.0-only'),
                 ('MIT', 'MIT'), ('Apache-2.0', 'Apache-2.0'), ('Zlib', 'Zlib'), ('WTFPL', 'WTFPL'), ('GNU All-Permissive', 'FSFAP')]:
        if l.startswith(a): return b
    return l

def norm(s): return re.sub(r'\s+', ' ', s.replace('’', "'").replace('‘', "'")).strip().lower()

def names(e):
    t = e['title']
    out = {t, re.sub(r'\s*\(\d{4}\)$', '', t)}
    if e['kind'] in ('tv', 'anime') and ': ' in t: out.add(t.split(': ', 1)[1])
    if e['kind'] == 'artwork': return set()
    return {norm(x) for x in out if len(x) >= 4}

FOLDER_KINDS = {'music', 'movies', 'discs', 'audiobooks'}
token = ''
def api(path):
    req = urllib.request.Request(server + '/api' + path, headers={'Authorization': 'Bearer ' + token} if token else {})
    with urllib.request.urlopen(req) as r: return json.load(r)
def login():
    global token
    req = urllib.request.Request(server + '/api/login', data=json.dumps({'name': 'sam', 'password': os.environ['WMS_PASSWORD']}).encode(), headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as r: token = json.load(r)['token']
login()
cache = {}
def path_of(kind, id):
    k = (kind, id)
    if k not in cache:
        try:
            j = api(f'/{kind}/{id}')
            p = j.get('path') or (j.get('show') or {}).get('path') or ''
        except Exception:
            p = ''
        cache[k] = os.path.relpath(p, DEMO).replace(os.sep, '/') if p.lower().startswith(DEMO.lower().replace('/', '\\')) or p.lower().startswith(DEMO.lower()) else ''
    return cache[k]

def seen_by_path(rel):
    out = []
    for e in credits:
        ep = e.get('path', '')
        if not ep: continue
        if ep == rel: out.append(e)
        elif e['kind'] in FOLDER_KINDS and rel.startswith(ep + '/'): out.append(e)
        elif e['kind'] == 'artwork':
            d = os.path.dirname(ep)
            if rel == d or rel.startswith(d + '/'): out.append(e)
    return out

today = datetime.date.today().isoformat()
lic_file = os.path.join(repo, 'content', 'licences.json')
rec = json.load(open(lic_file, encoding='utf-8'))
for key, base in pairs:
    lines = set()
    txt = base + '.txt'
    for f in ([txt] if os.path.exists(txt) else []):
        lines |= {norm(l) for l in open(f, encoding='utf-8').read().splitlines() if l.strip()}
    found = {}
    for e in credits:
        if names(e) & lines: found[e['title'] + '|' + e['source']] = e
    src = base + '.src'
    for u in (open(src, encoding='utf-8').read().split() if os.path.exists(src) else []):
        m = re.search(r'/api/(items|shows)/(\d+)/', u)
        if not m: continue
        rel = path_of(m[1], m[2])
        if rel:
            for e in seen_by_path(rel): found[e['title'] + '|' + e['source']] = e
    works = [{'title': e['title'], 'by': e['author'], 'licence': spdx(e['licence']), 'source': e['source']} for e in found.values()]
    works.sort(key=lambda w: w['title'].lower())
    works.append({'title': 'WittyMediaServer’s own interface', 'by': 'WittyMediaServer contributors', 'licence': 'Own work', 'source': 'https://github.com/wittywilla/WittyMediaServer'})
    rec['pictures'][key] = {'works': works, 'checked': today}
    bad = [w for w in works if w['licence'].lower() not in {a.lower() for a in rec['allowed']}]
    print(f'{key}: {len(works) - 1} works' + (f'  NOT ALLOWED: {[(w["title"], w["licence"]) for w in bad]}' if bad else ''))
json.dump(rec, open(lic_file, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
open(lic_file, 'a', encoding='utf-8').write('\n')
