// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 WittyWilla and contributors
// Points the website test server's Music library at albums with real cover art only.
import fs from 'node:fs'
import path from 'node:path'
const S = (process.env.WMS_SERVER || 'http://127.0.0.1:19490') + '/api'
const ROOT = path.win32.normalize(process.env.WMS_MUSIC || 'D:/WittyDemoMedia/Music')
const LEAVE = new Set([
  'Cinnamon Chasers/Singles (from the music video)', 'FONTANO/Singles (from the music video)', 'Tes Elations/Singles (from the music video)', 'Tora/Singles (from the music video)',
  'The Mod Archive/Tracker', 'BachJS (Mutopia MIDI)/MIDI', 'BeethovenLv (Mutopia MIDI)/MIDI', 'ChopinFF (Mutopia MIDI)/MIDI', 'DebussyC (Mutopia MIDI)/MIDI',
  'JoplinS (Mutopia MIDI)/MIDI', 'MozartWA (Mutopia MIDI)/MIDI', 'SatieE (Mutopia MIDI)/MIDI',
  'Kevin MacLeod/Oddities', 'Ludwig van Beethoven/Moonlight Sonata', 'Ludwig van Beethoven/Symphony No. 5', 'MonoCulture/Smoke and Mirrors',
  'Seetyca/die comoedia von der zeit', 'Thomas Park with Joshua Shaffer/Words and Music About Generative',
  'Digi Hartatak/Ambient Minimal', 'Digi Hartatak/Elevator Music',
  // Their tags split one album into several (see the server issue on album grouping).
  'MonoCulture/The Animal Economy', 'monophonic/2.5 beats',
])
const keep = []
for (const artist of fs.readdirSync(ROOT)) {
  if (artist === 'Playlists') continue
  for (const album of fs.readdirSync(path.join(ROOT, artist), { withFileTypes: true }).filter((e) => e.isDirectory())) {
    const key = `${artist}/${album.name}`
    if (!LEAVE.has(key)) keep.push(path.win32.join(ROOT, artist, album.name))
  }
}
const { token } = await (await fetch(S + '/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'owner', password: process.env.WMS_PASSWORD }) })).json()
const H = { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }
const libs = await (await fetch(S + '/libraries', { headers: H })).json()
const lib = (libs.libraries || libs).find((l) => l.name === 'Music')
const body = { ...lib, paths: keep }
const r = await fetch(`${S}/libraries/${lib.id}`, { method: 'PUT', headers: H, body: JSON.stringify(body) })
console.log('albums kept', keep.length, 'left out', LEAVE.size, 'PUT', r.status, (await r.text()).slice(0, 200))
const scan = await fetch(`${S}/libraries/${lib.id}/scan`, { method: 'POST', headers: H })
console.log('scan', scan.status)
