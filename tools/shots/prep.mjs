// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 WittyWilla and contributors
// Fills a fresh test server for the website's pictures, from WittyDemoMedia: the owner's account, first run
// finished, saving pictures and details next to the media turned off before any library is added, the modules
// the libraries need (from the live catalogue), a library for each folder, and a second administrator, Sam,
// whose look the feature pictures use (so they can be taken while the owner's looks are being taken).
//
//   WMS_PASSWORD=<a test password> WMS_MEDIA=D:\WittyDemoMedia node prep.mjs http://127.0.0.1:19490
const server = process.argv[2] || process.env.WMS_SERVER || 'http://127.0.0.1:19490'
const PASS = process.env.WMS_PASSWORD
if (!PASS) { console.error('Set WMS_PASSWORD to the test accounts\' password.'); process.exit(1) }
const MEDIA = (process.env.WMS_MEDIA || 'D:\\WittyDemoMedia').replace(/[\\/]$/, '')
const sep = MEDIA.includes('\\') ? '\\' : '/'
let token = ''
const call = async (method, path, body) => {
  const res = await fetch(server + '/api' + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: body ? JSON.stringify(body) : undefined })
  return { status: res.status, body: await res.json().catch(() => null) }
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

console.log('setup', (await call('POST', '/setup', { name: 'owner', password: PASS, acknowledgedLegal: true })).status)
token = (await call('POST', '/login', { name: 'owner', password: PASS })).body.token
await call('POST', '/legal/acknowledge')
console.log('first run finished', (await call('POST', '/setup/complete')).status)
await call('PUT', '/settings', { saveMetadata: '0' })
const saved = (await call('GET', '/settings')).body?.saveMetadata
if (String(saved) !== '0') { console.error('saveMetadata is still on: stopping before any library is added'); process.exit(1) }

// Modules, one at a time: the store makes one change at once.
const idle = async () => { for (let i = 0; i < 300; i++) { const r = (await call('GET', '/modulestore/run')).body; const it = r?.run?.items || []; if (!r?.run || it.every((x) => !['queued', 'working'].includes(x.state))) return it; await wait(2000) } }
await call('POST', '/modulestore/check')
for (const id of ['wittyebook', 'wittypdf', 'wittycomics', 'wittyphotos', 'wittyplay', 'wittydvd', 'wittycd']) {
  await idle()
  const r = await call('POST', '/modulestore/install', { id, confirm: true, confirmOlder: true })
  console.log('module', id, r.status, JSON.stringify((await idle()).map((x) => [x.id, x.state])))
}

const have = (await call('GET', '/libraries')).body
const names = new Set((Array.isArray(have) ? have : have?.libraries || []).map((l) => l.name))
for (const [name, type, dir, extra] of [
  ['Movies', 'movies', 'Movies'], ['TV Shows', 'shows', 'TV'], ['Anime', 'anime', 'Anime'],
  ['Music', 'music', 'Music'], ['Audiobooks', 'audiobooks', 'Audiobooks'], ['Podcasts', 'podcasts', 'Podcasts'],
  ['Books', 'books', 'Books'], ['Comics', 'books', 'Comics'], ['Photos', 'photos', 'Photos'],
  ['Games', 'games', 'Games', { console: 'auto' }], ['Home Videos', 'videos', 'Home Videos'],
  ['Music Videos', 'musicvideos', 'Music Videos'], ['Discs', 'discs', 'Discs'],
]) {
  if (names.has(name)) { console.log('have', name); continue }
  const r = await call('POST', '/libraries', { name, type, paths: [MEDIA + sep + dir], ...(extra || {}) })
  console.log(name, r.status, r.status >= 300 ? JSON.stringify(r.body) : '')
}
console.log('Sam', (await call('POST', '/users', { name: 'sam', displayName: 'Sam', password: PASS, isAdmin: true, current: PASS })).status)
console.log('Next: let the scan finish, then run WittyDemoMedia/_tools/demo_channels.mjs against this server for channels and collections.')
