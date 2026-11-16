// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 WittyWilla and contributors
// Writes, for each experience on a computer and a phone, the titles and pictures its Home holds
// (lookseen/<form>/<exp>.txt and .src), from the server's page API, as the owner. Read-only.
import { mkdirSync, writeFileSync } from 'node:fs'
const S = (process.env.WMS_SERVER || 'http://127.0.0.1:19490') + '/api'
const exps = ['lumen', 'rail', 'stage', 'aero', 'classic', 'classicCable', 'classicSatellite', 'compact', 'paper', 'marquee', 'crossbar', 'bigpicture', 'dashboard', 'retro']
const { token } = await (await fetch(S + '/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'owner', password: process.env.WMS_PASSWORD }) })).json()
const H = { Authorization: 'Bearer ' + token }
const walk = (v, titles, srcs) => {
  if (Array.isArray(v)) return v.forEach((x) => walk(x, titles, srcs))
  if (v && typeof v === 'object') {
    for (const [k, x] of Object.entries(v)) {
      if (typeof x === 'string') {
        if (/^(title|label|text|subtitle|name)$/.test(k)) titles.add(x)
        if (/\/api\/(items|shows)\/\d+\//.test(x)) srcs.add(x)
      } else walk(x, titles, srcs)
    }
  }
}
for (const [form, ff, vp] of [['desktop', 'web', '1440x900'], ['phone', 'phone', '390x844']]) {
  mkdirSync(`lookseen/${form}`, { recursive: true })
  for (const x of exps) {
    const q = `experience=${x}&formFactor=${ff}&platform=web&catalog=6&viewport=${vp}`
    const page = await (await fetch(`${S}/sdui/pages/home?${q}`, { headers: H })).json()
    const titles = new Set(), srcs = new Set()
    walk(page, titles, srcs)
    // Rows fetch their items separately: the first page of each, as the screen would.
    const secs = []
    const find = (v) => { if (Array.isArray(v)) v.forEach(find); else if (v && typeof v === 'object') { if (v.id && (v.source || v.props?.source || v.lazy || v.more)) secs.push(v.id); Object.values(v).forEach(find) } }
    find(page)
    for (const id of [...new Set(secs)]) {
      const r = await fetch(`${S}/sdui/pages/home/sections/${encodeURIComponent(id)}/items?${q}&limit=12`, { headers: H })
      if (r.ok) walk(await r.json(), titles, srcs)
    }
    writeFileSync(`lookseen/${form}/${x}.txt`, [...titles].join('\n'))
    writeFileSync(`lookseen/${form}/${x}.src`, [...srcs].map((u) => 'http://x' + u).join('\n'))
    console.log(form, x, titles.size, srcs.size)
  }
}
