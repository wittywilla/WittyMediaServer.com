#!/usr/bin/env node
// SPDX-License-Identifier: AGPL-3.0-or-later
//
// WittyMediaServer.com - The website of WittyMediaServer and every project under it.
// Copyright (C) 2026 WittyWilla and contributors
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program. If not, see <https://www.gnu.org/licenses/>.

// Builds wittymediaserver.com into site/, ready to upload.
//
//   node build.mjs             fetch the latest from GitHub and build
//   node build.mjs --offline   build from what was fetched last time
//   node build.mjs --preview   build, then show it at http://localhost:4173
//   node build.mjs --serve     show the last build without building
//   node build.mjs --out D:/somewhere/site-test   build into another folder
//
// See UPDATING.md for the whole routine.
import fs from 'node:fs'
import path from 'node:path'
import http from 'node:http'
import crypto from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { GitHub } from './lib/github.mjs'
import { gather } from './lib/data.mjs'
import { ctx, THEME_SCRIPT } from './lib/layout.mjs'
import * as P from './lib/pages.mjs'
import { esc, hash, write, isoDate } from './lib/util.mjs'
import { releaseSummary } from './lib/layout.mjs'
import { check } from './check.mjs'
import { licenceProblems } from './lib/licences.mjs'

const root = path.dirname(fileURLToPath(import.meta.url))
const argv = process.argv.slice(2)
const args = new Set(argv)
// --out <folder> builds somewhere else, such as a scratch folder; its name must start with "site".
const outArg = argv.includes('--out') ? argv[argv.indexOf('--out') + 1] : null
const OUT = outArg ? path.resolve(outArg) : path.join(root, 'site')
const PORT = Number(process.env.PORT) || 4173
const log = (...a) => console.log(...a)

async function build() {
  const t0 = Date.now()
  const gh = new GitHub({ cacheDir: path.join(root, 'cache'), offline: args.has('--offline'), log })
  log(args.has('--offline') ? 'Building from saved copies (offline).' : `Fetching from GitHub${gh.token ? ' (signed in)' : ''}…`)
  const d = await gather({ root, gh, log })
  ctx.d = d
  ctx.built = new Date().toISOString()

  // A fresh site/ each time, so nothing old is left to upload.
  if (!/^site/.test(path.basename(OUT)) || OUT === root) throw new Error(`refusing to clear ${OUT}: an output folder's name starts with "site"`)
  fs.rmSync(OUT, { recursive: true, force: true })
  fs.mkdirSync(OUT, { recursive: true })

  // ---- pictures ----
  // The family's icons, social picture and backgrounds, drawn by WittyMediaServer's genicon
  // into images/brand (scripts/sync-brand.sh), so the site shows the same marks as the apps.
  const brandDir = path.join(root, 'images', 'brand')
  for (const f of fs.readdirSync(brandDir)) write(path.join(OUT, 'images', 'brand', f), fs.readFileSync(path.join(brandDir, f)))
  for (const [from, to] of [['icon.svg', 'images/icon.svg'], ['icon-192.png', 'images/icon-192.png'], ['icon-512.png', 'images/icon-512.png'], ['favicon.ico', 'favicon.ico'], ['apple-touch-icon.png', 'apple-touch-icon.png'], ['icon-192.png', 'favicon.png']]) {
    fs.copyFileSync(path.join(brandDir, from), path.join(OUT, to))
  }

  // Inter, the site's font, served from the site itself (the security policy allows fonts from 'self' only).
  for (const f of fs.readdirSync(path.join(root, 'fonts'))) write(path.join(OUT, 'fonts', f), fs.readFileSync(path.join(root, 'fonts', f)))

  // Only openly licensed and public-domain media is ever shown: see content/licences.json.
  const licence = licenceProblems(root, d.shots, d.site.themes)
  for (const s of d.shots) {
    if (licence.blocked.has(s.id)) continue
    const buf = await gh.get(s.url)
    if (!buf) { log(`  ! no picture ${s.repo} ${s.id}`); continue }
    write(path.join(OUT, 'images', 'shots', `${s.id}.webp`), buf)
    Object.assign(s, webpSize(buf), { local: true })
  }
  // Pictures in each theme, from images/themes/<theme>/<id>.webp in this repository.
  const themed = {}
  const themesDir = path.join(root, 'images', 'themes')
  for (const t of d.site.themes) {
    const dir = path.join(themesDir, t)
    if (!fs.existsSync(dir)) continue
    for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.webp'))) {
      const id = f.slice(0, -5)
      const base = d.shots.find((s) => s.id === id && s.local)
      if (!base || base.themeless || licence.blocked.has(`${t}/${id}`)) continue
      // A themed picture replaces the plain one in place, so it must be the same shape.
      const dim = webpSize(fs.readFileSync(path.join(dir, f)))
      if (base.width && (dim.width * base.height !== dim.height * base.width)) { log(`  ! images/themes/${t}/${f} is ${dim.width}×${dim.height}, not the shape of the plain one (${base.width}×${base.height}), left out`); continue }
      fs.mkdirSync(path.join(OUT, 'images', 'shots', t), { recursive: true })
      fs.copyFileSync(path.join(dir, f), path.join(OUT, 'images', 'shots', t, f))
      ;(themed[t] ||= []).push(id)
    }
  }
  d.themed = themed

  // Module icons, checked against the catalog's checksums.
  for (const m of d.modules) {
    if (!m.iconUrl) continue
    const buf = await gh.get(m.iconUrl)
    if (!buf) continue
    if (m.iconSha && crypto.createHash('sha256').update(buf).digest('hex') !== m.iconSha) { log(`  ! ${m.id}'s icon doesn't match the catalog, left out`); continue }
    const ext = path.extname(new URL(m.iconUrl).pathname) || '.png'
    write(path.join(OUT, 'images', 'modules', `${m.id}${ext}`), buf)
    m.icon64 = `/images/modules/${m.id}${ext}`
  }

  // ---- styles and script, named by their contents so browsers can keep them ----
  // site.css first, then each section's own stylesheet.
  const styles = ['site.css', ...fs.readdirSync(path.join(root, 'style')).filter((f) => f.endsWith('.css') && f !== 'site.css').sort()]
  const css = themesCSS(d.themes) + '\n' + styles.map((f) => fs.readFileSync(path.join(root, 'style', f), 'utf8')).join('\n')
  const cssMin = css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\n\s*\n+/g, '\n').replace(/^\s+/gm, '')
  // site.js first, then any other script in scripts/, each kept in its own scope.
  const scripts = ['site.js', ...fs.readdirSync(path.join(root, 'scripts')).filter((f) => f.endsWith('.js') && f !== 'site.js').sort()]
  const js = scripts.map((f) => fs.readFileSync(path.join(root, 'scripts', f), 'utf8')).join('\n;\n')
  ctx.assets.css = `/assets/site.${hash(cssMin)}.css`
  ctx.assets.js = `/assets/site.${hash(js)}.js`
  write(path.join(OUT, ctx.assets.css), cssMin)
  write(path.join(OUT, ctx.assets.js), js)
  ctx.inlineHash = 'sha256-' + crypto.createHash('sha256').update(THEME_SCRIPT).digest('base64')

  // ---- sections: lib/sections/*.mjs add pages of their own ----
  // Each may export gather({ d, gh, root, out, log, save }) to fetch what it needs,
  // and pages(d) returning [{ path, html }] made with lib/layout.mjs's page().
  const sectionsDir = path.join(root, 'lib', 'sections')
  const sections = []
  for (const f of fs.existsSync(sectionsDir) ? fs.readdirSync(sectionsDir).filter((f) => f.endsWith('.mjs')).sort() : []) {
    const mod = await import(pathToFileURL(path.join(sectionsDir, f)).href)
    sections.push(mod)
    if (mod.gather) await mod.gather({ d, gh, root, out: OUT, log, save: (rel, data) => write(path.join(OUT, rel), data) })
  }

  // ---- pages ----
  const pages = [
    P.home(), P.server(), P.client(), P.player(), P.reader(), P.projects(),
    P.modulesPage(), ...d.modules.map(P.modulePage),
    P.newsPage(), ...d.news.map(P.articlePage), ...d.releases.map(P.releasePage),
    P.download(), P.gallery(), P.notFound(),
    ...sections.flatMap((mod) => mod.pages ? mod.pages(d) : []),
  ]
  for (const p of pages) write(path.join(OUT, p.file || path.join(p.path, 'index.html')), p.html)

  // ---- feed, sitemap and the files hosts look for ----
  write(path.join(OUT, 'news', 'feed.xml'), feed(d))
  const listed = pages.filter((p) => !p.file)
  write(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${listed.map((p) => `  <url><loc>${esc(d.site.url + p.path)}</loc></url>`).join('\n')}\n</urlset>\n`)
  write(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${d.site.url}/sitemap.xml\n`)
  write(path.join(OUT, 'site.webmanifest'), JSON.stringify({ name: d.site.name, short_name: 'WittyMediaServer', start_url: '/', display: 'browser', background_color: '#0f1115', theme_color: '#0f1115', icons: [{ src: '/images/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/images/icon-512.png', sizes: '512x512', type: 'image/png' }, { src: '/images/brand/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }] }, null, 1))
  write(path.join(OUT, '.htaccess'), HTACCESS)

  gh.save()

  // ---- checks ----
  const problems = [...licence.problems, ...check({ root, out: OUT, d })]
  for (const p of problems) log(`  ${p.level === 'error' ? '✗' : '!'} ${p.message}`)

  // ---- the ZIP to upload ----
  const zip = outArg ? OUT + '.zip' : path.join(root, 'site.zip')
  fs.rmSync(zip, { force: true })
  if (!args.has('--no-zip')) {
    // Windows' own tar makes ZIPs; elsewhere, zip does.
    const win = process.platform === 'win32'
    try {
      if (win) execFileSync(path.join(process.env.SystemRoot || 'C:/Windows', 'System32', 'tar.exe'), ['-a', '-c', '-f', zip, '-C', OUT, '.'], { stdio: 'ignore' })
      else execFileSync('zip', ['-q', '-r', zip, '.'], { cwd: OUT, stdio: 'ignore' })
    } catch { log('  ! couldn’t make site.zip; upload the site folder instead') }
  }

  const size = dirSize(OUT)
  log(`Built ${pages.length} pages, ${d.releases.length} releases, ${d.modules.length} modules, ${d.shots.filter((s) => s.local).length} pictures${Object.keys(themed).length ? ` (and ${Object.values(themed).flat().length} in other themes)` : ''}.`)
  log(`${(size / 1e6).toFixed(1)} MB in ${outArg ? OUT : 'site/'}${fs.existsSync(zip) ? ', and site.zip to upload' : ''}. GitHub: ${gh.fetched} fetched, ${gh.fromCache} unchanged. ${((Date.now() - t0) / 1000).toFixed(1)} s.`)
  const errors = problems.filter((p) => p.level === 'error').length
  if (errors) { log(`${errors} problem${errors === 1 ? '' : 's'} to fix before uploading.`); process.exitCode = 1 }
}

// ---------- helpers ----------

const VARS = {
  bg: '--bg', bg2: '--bg-2', bg3: '--bg-3', bg4: '--bg-4', fg: '--fg', fg2: '--fg-2', fg3: '--fg-3',
  accent: '--accent', accentHover: '--accent-2', accentFg: '--accent-fg', accentText: '--accent-text', brandAccent: '--brand-accent',
  danger: '--danger', ok: '--ok', warn: '--warn', border: '--border', borderStrong: '--border-strong', controlLine: '--control-line',
  hover: '--hover', pressed: '--pressed', accentSoft: '--accent-soft', accentLine: '--accent-line', okSoft: '--ok-soft', warnSoft: '--warn-soft',
  dangerSoft: '--danger-soft', focus: '--focus', onImage: '--on-image', scrim: '--scrim', overlay: '--overlay',
}
const rgb = (hex) => { const h = String(hex).replace('#', ''); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).join(' ') }

/** The server's themes as CSS: the house theme for :root, each one for [data-theme]. */
function themesCSS(themes) {
  const out = ['/* Generated from WittyMediaServer\'s themes/<id>/theme.json. */']
  for (const t of themes) {
    const light = t.scheme === 'light'
    const lines = Object.entries(VARS).filter(([k]) => t.colors[k]).map(([k, v]) => `  ${v}: ${t.colors[k]};`)
    lines.push(`  --bg-rgb: ${rgb(t.colors.bg)};`, `  --accent-rgb: ${rgb(t.colors.accent)};`, `  --radius: ${t.radius ?? 10}px;`, `  color-scheme: ${t.scheme || 'dark'};`)
    lines.push(light
      ? '  --shadow: 0 12px 32px rgb(20 25 40 / .14);\n  --card-shadow: 0 10px 24px rgb(20 25 40 / .12);\n  --glow: rgb(var(--accent-rgb) / .16);'
      : '  --shadow: 0 10px 30px rgb(0 0 0 / .45);\n  --card-shadow: 0 10px 24px rgb(0 0 0 / .5);\n  --glow: rgb(var(--accent-rgb) / .22);')
    const sel = t.id === 'default' ? `:root, :root[data-theme="default"]` : `:root[data-theme="${t.id}"]`
    out.push(`${sel} {\n${lines.join('\n')}\n}`)
    const c = t.colors
    out.push(`.swatch[data-theme="${t.id}"] .pv { background: ${c.bg}; } .swatch[data-theme="${t.id}"] .pv i { background: ${c.fg}; } .swatch[data-theme="${t.id}"] .pv u { background: ${c.fg2}; } .swatch[data-theme="${t.id}"] .pv b { background: ${c.accent}; }`)
  }
  return out.join('\n')
}

/** Width and height from a WebP file's header. */
function webpSize(b) {
  try {
    const type = b.toString('ascii', 12, 16)
    if (type === 'VP8X') return { width: 1 + b.readUIntLE(24, 3), height: 1 + b.readUIntLE(27, 3) }
    if (type === 'VP8 ') return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff }
    if (type === 'VP8L') {
      const b0 = b[21], b1 = b[22], b2 = b[23], b3 = b[24]
      return { width: 1 + (((b1 & 0x3f) << 8) | b0), height: 1 + (((b3 & 0xf) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6)) }
    }
  } catch {}
  return {}
}

function feed(d) {
  const items = [
    ...d.news.map((n) => ({ id: `${d.site.url}/news/${n.slug}/`, title: n.title, date: n.date, summary: n.summary })),
    ...d.releases.map((r) => ({ id: d.site.url + r.path, title: `${r.productName} ${r.version}`, date: r.date, summary: releaseSummary(r) })),
  ].sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 40)
  const when = (x) => new Date(x).toISOString()
  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>WittyMediaServer news</title>
  <subtitle>Articles and releases from the WittyMediaServer project.</subtitle>
  <link href="${d.site.url}/news/feed.xml" rel="self"/>
  <link href="${d.site.url}/news/"/>
  <id>${d.site.url}/news/</id>
  <updated>${when(items[0]?.date || Date.now())}</updated>
  <author><name>${esc(d.site.ownerName)}</name></author>
${items.map((i) => `  <entry>
    <title>${esc(i.title)}</title>
    <link href="${esc(i.id)}"/>
    <id>${esc(i.id)}</id>
    <updated>${when(i.date)}</updated>
    <summary>${esc(i.summary)}</summary>
  </entry>`).join('\n')}
</feed>
`
}

function dirSize(dir) {
  let n = 0
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) n += e.isDirectory() ? dirSize(path.join(dir, e.name)) : fs.statSync(path.join(dir, e.name)).size
  return n
}

const HTACCESS = `# wittymediaserver.com, for Hostinger (Apache or LiteSpeed). Made by build.mjs.
ErrorDocument 404 /404.html
Options -Indexes
# Never serve a .git folder, should a deployment leave one behind.
RedirectMatch 404 /\\.git
DirectoryIndex index.html

<IfModule mod_mime.c>
  AddType application/manifest+json .webmanifest
  AddType image/webp .webp
  AddType image/svg+xml .svg
</IfModule>
<Files "feed.xml">
  ForceType application/atom+xml
</Files>

<IfModule mod_headers.c>
  Header always set X-Content-Type-Options "nosniff"
  Header always set X-Frame-Options "DENY"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=(), usb=()"
  Header always set Cross-Origin-Opener-Policy "same-origin"
  # Styles and scripts are named by their contents, so they can be kept for a year.
  <FilesMatch "\\.(css|js)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
  <FilesMatch "\\.(webp|png|svg)$">
    Header set Cache-Control "public, max-age=604800"
  </FilesMatch>
  <FilesMatch "\\.(html|xml|webmanifest)$">
    Header set Cache-Control "no-cache"
  </FilesMatch>
</IfModule>

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css text/plain application/javascript text/javascript application/json application/manifest+json application/atom+xml application/xml image/svg+xml
</IfModule>
`

function serve() {
  const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.xml': 'application/xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.txt': 'text/plain' }
  http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname)
    let file = path.join(OUT, p)
    if (!file.startsWith(OUT)) { res.writeHead(403).end(); return }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
      if (!p.endsWith('/')) { res.writeHead(301, { Location: p + '/' }).end(); return }
      file = path.join(file, 'index.html')
    }
    if (!fs.existsSync(file)) { res.writeHead(404, { 'Content-Type': types['.html'] }); fs.createReadStream(path.join(OUT, '404.html')).pipe(res); return }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' })
    fs.createReadStream(file).pipe(res)
  }).listen(PORT, '127.0.0.1', () => log(`Showing site/ at http://localhost:${PORT}  (Ctrl+C to stop)`))
}

// Last, so everything above is defined before it runs.
if (args.has('--serve')) serve()
else { await build(); if (args.has('--preview')) serve() }
