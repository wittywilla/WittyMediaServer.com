# SPDX-License-Identifier: AGPL-3.0-or-later
# Copyright (C) 2026 WittyWilla and contributors
# Compresses screenshots into the website: python compress.py shots <png folder> <repo>  |  python compress.py looks <looks folder> <repo>
import sys, os, glob
from PIL import Image
kind, src, repo = sys.argv[1:4]
def save(png, out, width, q):
    im = Image.open(png).convert('RGB')
    if im.width != width: im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    im.save(out, 'WEBP', quality=q, method=6)
total = 0
if kind == 'shots':
    for png in sorted(glob.glob(os.path.join(src, '*.png'))):
        name = os.path.basename(png)[:-4]
        out = os.path.join(repo, 'images', 'shots', name + '.webp')
        phone = Image.open(png).height > Image.open(png).width
        save(png, out, 780 if phone else 1440, 80)
        total += os.path.getsize(out)
else:
    for png in sorted(glob.glob(os.path.join(src, '*', '*', '*.png'))):
        form, exp, theme = os.path.normpath(png).split(os.sep)[-3:]
        out = os.path.join(repo, 'images', 'looks', form, exp, theme[:-4] + '.webp')
        save(png, out, 1280 if form == 'desktop' else 520, 72)
        total += os.path.getsize(out)
print(f'{total / 1e6:.1f} MB')
