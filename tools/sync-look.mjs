#!/usr/bin/env node
// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 WittyWilla and contributors
// Copies the server's themes and experiences into content/look.json, from a checkout of
// WittyMediaServer on the branch the screenshots were taken from, so the site's colours and
// the Try it page always match its pictures.
//
//   node tools/sync-look.mjs ../WittyMediaServer
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const server = path.resolve(process.argv[2] || path.join(root, '..', 'WittyMediaServer'))
const themesDir = path.join(server, 'themes')
const expDir = path.join(server, 'pkg', 'sdui', 'experiences')
if (!fs.existsSync(themesDir) || !fs.existsSync(expDir)) {
  console.error(`No themes/ or pkg/sdui/experiences/ in ${server}: give the path to a WittyMediaServer checkout.`)
  process.exit(1)
}
const read = (f) => JSON.parse(fs.readFileSync(f, 'utf8'))
const pick = (o, keys) => Object.fromEntries(keys.filter((k) => o[k] !== undefined).map((k) => [k, o[k]]))

// A theme's backdrop, as the site can draw it: the first gradient of its scene, when there's more than one colour in it.
const backdrop = (scene) => {
  const g = scene?.layers?.find((l) => l.type === 'gradient')
  if (!g?.stops?.length || new Set(g.stops.map((s) => s.color.toLowerCase())).size < 2) return undefined
  return `linear-gradient(${g.angle ?? 180}deg, ${g.stops.map((s) => `${s.color} ${s.at}%`).join(', ')})`
}

const themes = fs.readdirSync(themesDir, { withFileTypes: true }).filter((e) => e.isDirectory() && fs.existsSync(path.join(themesDir, e.name, 'theme.json')))
  .map((e) => read(path.join(themesDir, e.name, 'theme.json')))
  .map((t) => ({ ...pick(t, ['id', 'name', 'description', 'scheme', 'colors', 'radius']), backdrop: backdrop(t.scene) }))
const experiences = fs.readdirSync(expDir).filter((f) => f.endsWith('.json')).map((f) => read(path.join(expDir, f)))
  .sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
  .map((x) => pick(x, ['id', 'order', 'name', 'tagline', 'icon', 'description', 'theme', 'nav', 'pages', 'effects', 'shape', 'type', 'density']))

// The house theme first, then the others in the server's own order: dark, light, and the looks that came with the experiences.
const ORDER = ['default', 'light', 'midnight', 'oled', 'evergreen', 'cinema', 'paper', 'contrast', 'aeroday', 'aeroaurora', 'aeromeadow', 'aerosunset', 'cable', 'satellite', 'teletext']
themes.sort((a, b) => (ORDER.indexOf(a.id) + 1 || 99) - (ORDER.indexOf(b.id) + 1 || 99))

let version = ''
try { version = /^\s*##\s*\[?v?([\d.]+[-\w.]*)/m.exec(fs.readFileSync(path.join(server, 'CHANGELOG.md'), 'utf8'))?.[1] || '' } catch { /* no changelog */ }
const out = {
  $comment: 'Made by tools/sync-look.mjs from WittyMediaServer\'s themes/*/theme.json and pkg/sdui/experiences/*.json. Don\'t edit by hand: run the tool again after taking new pictures.',
  server: version,
  themes,
  experiences,
}
fs.writeFileSync(path.join(root, 'content', 'look.json'), JSON.stringify(out, null, 1) + '\n')
console.log(`content/look.json: ${themes.length} themes, ${experiences.length} experiences.`)
