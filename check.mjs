#!/usr/bin/env node
// Checks the built site and the words we write, so pages stay consistent:
//   node check.mjs        check site/ as it was last built
// build.mjs runs the same checks at the end of every build.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Names that never appear on the site: other media servers. Stored encoded so
// they aren't written out in this repository either.
const NEVER = ['UGxleA==', 'SmVsbHlmaW4=', 'QW1wQ2hvcg==', 'RW1ieQ=='].map((b) => Buffer.from(b, 'base64').toString())

// How we spell things. Checked in what we write (content/ and lib/), not in
// release notes fetched from GitHub, which say what they said.
const WORDS = [
  [/Plasma Big ?Screen/g, 'Plasma Bigscreen'],
  [/\bcatalogue/gi, 'catalog'],
  [/\bBlu-Ray|\bBluray\b|\bBlu Ray\b/g, 'Blu-ray'],
  [/\bWitty ?media ?server\b(?<!WittyMediaServer)/g, 'WittyMediaServer'],
  [/\bWitty Media Client\b|\bWittymediaclient\b/g, 'WittyMediaClient'],
  [/\bDVD's\b/g, 'DVD’s (curly apostrophe)'],
  [/\bclick here\b/gi, 'a link that says where it goes'],
  [/\buser's\b|\bthe user\b/gi, '“you” and “your”'],
]

export function check({ root, out, d }) {
  const problems = []
  const err = (message) => problems.push({ level: 'error', message })
  const warn = (message) => problems.push({ level: 'warning', message })
  const rel = (f) => path.relative(root, f).replace(/\\/g, '/')

  // ---- our own words ----
  const ours = [...walk(path.join(root, 'content')), ...walk(path.join(root, 'lib'))].filter((f) => /\.(md|json|mjs)$/.test(f))
  for (const f of ours) {
    const text = fs.readFileSync(f, 'utf8')
    for (const name of NEVER) if (new RegExp(`\\b${name}\\b`, 'i').test(text)) err(`${rel(f)} names another media server`)
    for (const [re, want] of WORDS) {
      re.lastIndex = 0
      const m = re.exec(text)
      if (m) warn(`${rel(f)}: “${m[0]}”, write ${want}`)
    }
    if (f.endsWith('.md')) {
      const body = text.replace(/^---[\s\S]*?---/, '').replace(/```[\s\S]*?```/g, '').replace(/`[^`]*`/g, '')
      if (/(?<![!\[(])!(?![\[=(])/.test(body.replace(/\]\([^)]*\)/g, ''))) warn(`${rel(f)}: no exclamation marks, please`)
    }
  }

  // ---- the built pages ----
  if (!fs.existsSync(out)) { err('site/ is missing: run node build.mjs'); return problems }
  const files = walk(out)
  const have = new Set(files.map((f) => '/' + path.relative(out, f).replace(/\\/g, '/')))
  const exists = (p) => have.has(p) || have.has(p.replace(/\/?$/, '/index.html'))
  for (const f of files.filter((f) => f.endsWith('.html'))) {
    const html = fs.readFileSync(f, 'utf8')
    const where = rel(f)
    const text = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ')
    for (const name of NEVER) if (new RegExp(`\\b${name}\\b`, 'i').test(text)) err(`${where} shows the name of another media server`)
    for (const m of html.matchAll(/\s(?:href|src)="(\/[^"#?]*)/g)) {
      const p = m[1]
      if (!exists(p)) err(`${where} links to ${p}, which isn't in the site`)
    }
    for (const m of html.matchAll(/<img\b[^>]*>/g)) if (!/\salt="/.test(m[0])) err(`${where} has a picture with no description (alt)`)
    if (!/<title>[^<]+<\/title>/.test(html)) err(`${where} has no title`)
    if (!/<meta name="description" content="[^"]+"/.test(html)) warn(`${where} has no description`)
    if ((html.match(/<h1[\s>]/g) || []).length !== 1 && !where.endsWith('404.html')) warn(`${where} should have exactly one main heading`)
    if (Buffer.byteLength(html) > 200_000) warn(`${where} is ${Math.round(Buffer.byteLength(html) / 1000)} KB; pages should stay under 200 KB`)
    if (/\sstyle="/.test(html)) err(`${where} has a style attribute, which the page’s security policy blocks`)
  }
  if (d && d.releases.length === 0) warn('no releases were found: is GitHub reachable?')
  if (d && d.modules.length === 0) warn('no modules were found: is the catalog reachable?')
  return problems
}

function walk(dir) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)])
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const root = path.dirname(fileURLToPath(import.meta.url))
  const problems = check({ root, out: path.join(root, 'site') })
  for (const p of problems) console.log(`${p.level === 'error' ? '✗' : '!'} ${p.message}`)
  const errors = problems.filter((p) => p.level === 'error').length
  console.log(problems.length ? `${errors} problems, ${problems.length - errors} warnings.` : 'All good.')
  process.exitCode = errors ? 1 : 0
}
