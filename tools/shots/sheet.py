# SPDX-License-Identifier: AGPL-3.0-or-later
# Copyright (C) 2026 WittyWilla and contributors
import sys, glob, os
from PIL import Image, ImageDraw
files = sorted(glob.glob(sys.argv[1]))
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 4
tw = int(sys.argv[4]) if len(sys.argv) > 4 else 480
ims = []
for f in files:
    im = Image.open(f).convert('RGB'); r = tw / im.width; ims.append((os.path.basename(f), im.resize((tw, int(im.height * r)))))
th = max(i.height for _, i in ims) + 18
rows = (len(ims) + cols - 1) // cols
sheet = Image.new('RGB', (cols * (tw + 6), rows * th), (40, 40, 40)); d = ImageDraw.Draw(sheet)
for n, (name, im) in enumerate(ims):
    x, y = (n % cols) * (tw + 6), (n // cols) * th
    sheet.paste(im, (x, y + 18)); d.text((x + 2, y + 3), name, fill=(255, 255, 255))
sheet.save(sys.argv[2])
