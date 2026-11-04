#!/usr/bin/env node
// For Hostinger's web apps, when they build from main: downloads the site that
// GitHub Actions already built (the "live" branch) and puts it in dist/.
// Nothing is built here, so no GitHub API limits or tokens are involved.
// Run by `npm run build`. To build the site yourself, use `node build.mjs`.
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = path.join(root, 'dist')
const URL_ = 'https://codeload.github.com/wittywilla/WittyMediaServer.com/tar.gz/refs/heads/live'

const res = await fetch(URL_, { headers: { 'User-Agent': 'wittymediaserver.com-fetch-live' } })
if (!res.ok) { console.error(`Couldn't download the built site (${res.status}).`); process.exit(1) }
const tar = zlib.gunzipSync(Buffer.from(await res.arrayBuffer()))

fs.rmSync(OUT, { recursive: true, force: true })
let files = 0, pax = null
const str = (b, a, n) => b.toString('utf8', a, a + n).replace(/\0.*$/s, '')
for (let at = 0; at + 512 <= tar.length;) {
  const h = tar.subarray(at, at + 512)
  if (h.every((x) => x === 0)) break
  const size = parseInt(str(h, 124, 12).trim() || '0', 8)
  const type = String.fromCharCode(h[156] || 48)
  const body = tar.subarray(at + 512, at + 512 + size)
  at += 512 + Math.ceil(size / 512) * 512
  if (type === 'g') continue
  if (type === 'x') { pax = /(?:^|\n)\d+ path=([^\n]*)/.exec(body.toString('utf8'))?.[1] || null; continue }
  const prefix = str(h, 345, 155)
  let name = pax || (prefix ? `${prefix}/${str(h, 0, 100)}` : str(h, 0, 100))
  pax = null
  // "<repo>-live/dist/…" → "…"
  const rel = name.split('/').slice(1).join('/')
  if (!rel.startsWith('dist/') || rel.includes('..')) continue
  const dest = path.join(OUT, rel.slice(5))
  if (type === '5') { fs.mkdirSync(dest, { recursive: true }); continue }
  if (type !== '0' && type !== '\0') continue
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.writeFileSync(dest, body)
  files++
}
if (!fs.existsSync(path.join(OUT, 'index.html'))) { console.error('The download had no site in it.'); process.exit(1) }
console.log(`Fetched the built site: ${files} files in dist/.`)
