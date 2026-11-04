// The server's guides at /docs/, built from docs/*.md in its repository on every build.
// Links between guides stay on the site, other files go to GitHub, and a picture
// is copied in only when content/licences.json allows it.
import fs from 'node:fs'
import path from 'node:path'
import { page, pageHead, btn, shotImg, shotOf, icon, ext } from '../layout.mjs'
import { render, inline, plain } from '../markdown.mjs'
import { licenceProblems } from '../licences.mjs'
import { esc, longDate, shortDate, isoDate } from '../util.mjs'

// The order of the hub, the sidebar and previous and next. Each group: [id, title, icon, intro, files].
const GROUPS = [
  ['start', 'Start here', 'sparkle', 'From installing to your first film, and everyone in your home signed in.',
    ['GETTING_STARTED', 'INSTALL', 'FIRST-TIME-SETUP', 'APPS', 'ACCOUNTS', 'TROUBLESHOOTING']],
  ['watch', 'Watching and listening', 'film', 'The player, and everything you can watch, hear and read on your server.',
    ['PLAYING', 'MUSIC', 'LYRICS-KARAOKE', 'BOOKS', 'PHOTOS', 'CREATOR-VIDEOS', 'SHORTS', 'COLLECTIONS']],
  ['libraries', 'Libraries', 'layers', 'Adding your folders, naming your files, and putting wrong details right.',
    ['LIBRARIES', 'MEDIA-TYPES', 'SUPPORTED-FORMATS', 'METADATA', 'FIXING-METADATA', 'METADATA-FOLDER']],
  ['discs', 'Discs', 'disc', 'DVDs and Blu-rays with their real menus, and checking a disc that won’t play.',
    ['DVD', 'BLURAY', 'DIAGNOSER']],
  ['games', 'Games', 'game', 'Your own games, streamed from the server, and the PCs you play on.',
    ['GAMES', 'GAME-RIGS']],
  ['tv', 'TV', 'tv', 'TV shows, your own channels, live TV and the guide.',
    ['TV', 'CHANNELS']],
  ['settings', 'Settings', 'palette', 'Where every setting lives, the modules you add, and how it looks.',
    ['SETTINGS', 'MODULE-STORE', 'THEMES']],
  ['server', 'Running a server', 'server', 'Reaching it from away, keeping it healthy, converting video and the command line.',
    ['REMOTE', 'BACKUP', 'REPAIR', 'TRANSCODING', 'LIBRARY-TRANSCODING', 'TDARR', 'TASKS', 'STATS', 'LOGGING', 'CONFIG', 'REFERENCE', 'UNINSTALL']],
]

// For the people working on the project, not for people running a server. Links to them go to GitHub.
const LEAVE_OUT = new Set([
  'REPOSITORIES', 'PUBLISHING', 'MODULES-CUTOVER', 'SECURITY-REVIEW', 'SECURITY-ROUTES', 'LEGAL-NOTICES-CHECKLIST', 'DESIGN',
  'ROADMAP', 'WITTYRETROARCH', 'CLIENT-API', 'GAMING-API', 'GAMING', 'MODULES', 'DVD-QUIRKS', 'BLURAY-QUIRKS',
])

const slugOf = (file) => file.toLowerCase().replace(/_/g, '-')
const FENCE = /^\s*(```|~~~)/

export async function gather({ d, gh, root, log, save }) {
  const repo = d.site.repos.server
  const branch = d.repos[repo]?.branch || 'master'
  const blob = (p) => `https://github.com/${repo}/blob/${branch}/${p}`

  // Guides that are new in the repository and in no group yet still get a page.
  const listing = await gh.json(`https://api.github.com/repos/${repo}/contents/docs?ref=${branch}`)
  const grouped = new Set(GROUPS.flatMap((g) => g[4]))
  const extra = Array.isArray(listing)
    ? listing.filter((f) => f.type === 'file' && f.name.endsWith('.md')).map((f) => f.name.slice(0, -3)).filter((f) => !grouped.has(f) && !LEAVE_OUT.has(f)).sort()
    : []
  if (extra.length) log(`  ! docs: ${extra.join(', ')} ${extra.length === 1 ? 'isn’t' : 'aren’t'} in a group in lib/sections/docs.mjs yet, so ${extra.length === 1 ? 'it’s' : 'they’re'} under “More guides”`)
  const groups = GROUPS.map(([id, title, iconName, intro, files]) => ({ id, title, icon: iconName, intro, files }))
  if (extra.length) groups.push({ id: 'more', title: 'More guides', icon: 'list', intro: 'Other guides from the server’s repository.', files: extra })

  // The app's own short titles and one-line descriptions, where it has them.
  const helpTs = await gh.text(gh.raw(repo, branch, 'web/src/help/guides.ts')) || ''
  const help = {}
  for (const m of helpTs.matchAll(/\{\s*file:\s*'([^']+)',\s*title:\s*'([^']+)',\s*about:\s*'([^']+)'/g)) help[m[1]] = { title: m[2], about: m[3] }

  // Picture credits, as the screenshots use them.
  const creditsMd = await gh.text(gh.raw(repo, branch, 'docs/images/CREDITS.md')) || ''
  const credits = {}
  for (const m of creditsMd.matchAll(/^\|\s*`([^`]+)`\s*\|\s*(.+?)\s*\|\s*$/gm)) credits[m[1]] = m[2]

  // Dates come from the commits API: one small request a guide, asked only "has this changed?" next time.
  const dates = !!(gh.token || gh.offline)
  if (!dates) log('  ! docs: not signed in to GitHub, so the guides show no “last changed” dates')

  const files = groups.flatMap((g) => g.files)
  const fetched = await Promise.all(files.map(async (file) => {
    const md = await gh.text(gh.raw(repo, branch, `docs/${file}.md`))
    const commits = dates && md ? await gh.json(`https://api.github.com/repos/${repo}/commits?sha=${branch}&path=docs/${file}.md&per_page=1`) : null
    return { file, md, changed: Array.isArray(commits) ? commits[0]?.commit?.committer?.date || null : null }
  }))
  const guides = []
  for (const f of fetched) {
    if (!f.md) { log(`  ! docs: couldn’t fetch docs/${f.file}.md, left out`); continue }
    const group = groups.find((g) => g.files.includes(f.file))
    guides.push({ ...f, slug: slugOf(f.file), group })
  }
  for (const g of groups) g.guides = guides.filter((x) => x.group === g)
  const byFile = new Map(guides.map((g) => [g.file, g]))

  // ---- links ----
  const ghDocs = new RegExp(`^https://github\\.com/${repo.replace('/', '\\/')}/blob/[^/]+/(docs/[^#?]+)(#.*)?$`, 'i')
  const link = (u) => {
    const full = ghDocs.exec(u)
    if (full) return byFile.has(full[1].slice(5, -3)) ? `/docs/${byFile.get(full[1].slice(5, -3)).slug}/${full[2] || ''}` : u
    if (/^([a-z]+:|\/|#)/i.test(u)) return u
    const [p, hash = ''] = u.split(/(?=#)/)
    const target = path.posix.normalize(`docs/${p}`)
    if (target.startsWith('../')) return u
    const guide = /^docs\/([^/]+)\.md$/i.exec(target) && byFile.get(/^docs\/([^/]+)\.md$/i.exec(target)[1])
    if (guide) return `/docs/${guide.slug}/${hash}`
    return blob(target) + hash
  }

  // ---- pictures: copied in only with a licence record that allows them ----
  const names = new Set()
  for (const g of guides) for (const m of g.md.matchAll(/!\[[^\]]*\]\(\s*(?:\.\/)?images\/([^)\s]+)/g)) names.add(m[1])
  const ids = [...names].map((n) => ({ id: n.replace(/\.[a-z0-9]+$/i, ''), name: n }))
  const hasRecord = fs.existsSync(path.join(root, 'content', 'licences.json'))
  const { blocked } = hasRecord ? licenceProblems(root, ids, []) : { blocked: new Set(ids.map((x) => x.id)) }
  const pictures = {}
  let copied = 0
  await Promise.all(ids.map(async ({ id, name }) => {
    const pic = { name, github: blob(`docs/images/${name}`), credit: credits[name] || null }
    pictures[name] = pic
    if (blocked.has(id)) return
    const shot = shotOf(id)
    if (shot && shot.repo === repo) { pic.shot = id; copied++; return }
    const buf = await gh.get(gh.raw(repo, branch, `docs/images/${name}`))
    if (!buf) return
    save(`docs/images/${name}`, buf)
    Object.assign(pic, { src: `/docs/images/${name}`, ...imageSize(buf) })
    copied++
  }))
  const leftOut = ids.length - copied
  if (leftOut) log(`  ! docs: ${leftOut} of ${ids.length} pictures in the guides ${hasRecord ? 'aren’t allowed by' : 'can’t be checked without'} content/licences.json, so they link to GitHub`)

  for (const g of guides) Object.assign(g, guidePage(g, { link, pictures, help: help[g.file], blob, branch, repo, creditsUrl: blob('docs/images/CREDITS.md') }))
  d.docs = { groups: groups.filter((g) => g.guides.length), guides, repo, branch }
  log(`  docs: ${guides.length} guides, ${copied} pictures.`)
}

/** Works out one guide's title, lead, table of contents and body. */
function guidePage(g, { link, pictures, help, blob, branch, repo, creditsUrl }) {
  let md = g.md.replace(/\r\n?/g, '\n').replace(/<!--[\s\S]*?-->/g, '')
  const lines = md.split('\n')

  // Its own "# Title" and first paragraph become the page's head.
  let i = lines.findIndex((l) => l.trim())
  let title = g.file
  if (/^#\s+/.test(lines[i] || '')) { title = plain(lines[i].replace(/^#\s+/, '').trim()); lines.splice(i, 1) }
  while (i < lines.length && !lines[i].trim()) i++
  let lead = ''
  if (i < lines.length && !/^(#|\s*[-*+]\s|\s*\d+[.)]\s|\s*```|\s*>|\s*\|)/.test(lines[i])) {
    const start = i
    while (i < lines.length && lines[i].trim()) i++
    lead = lines.splice(start, i - start).join(' ')
  }
  // Its list of links to its own headings is the table of contents the page already shows.
  const firstH2 = lines.findIndex((l) => /^##\s/.test(l))
  for (let j = 0; j < (firstH2 < 0 ? lines.length : firstH2); j++) {
    if (!/^\s*[-*+]\s+\[[^\]]+\]\(#[^)]+\)\s*$/.test(lines[j])) continue
    let k = j
    while (k < lines.length && /^\s*[-*+]\s+\[[^\]]+\]\(#[^)]+\)\s*$/.test(lines[k])) k++
    lines.splice(j, k - j)
    break
  }

  // Code blocks indented under a list item stay inside that item.
  const held = []
  for (let j = 0; j < lines.length; j++) {
    const m = /^(\s{2,})(```|~~~)/.exec(lines[j])
    if (!m) { if (FENCE.test(lines[j])) { j++; while (j < lines.length && !FENCE.test(lines[j])) j++ } continue }
    let end = j + 1
    while (end < lines.length && !lines[end].trim().startsWith(m[2])) end++
    const code = lines.slice(j + 1, end).map((l) => l.startsWith(m[1]) ? l.slice(m[1].length) : l.trimStart()).join('\n')
    let prev = j - 1
    while (prev >= 0 && !lines[prev].trim()) prev--
    if (prev >= 0 && (/^\s*([-*+]|\d+[.)])\s/.test(lines[prev]) || /^\s+\S/.test(lines[prev]))) {
      lines.splice(prev + 1, end + 1 - (prev + 1), `${m[1]}\u0004${held.push(code) - 1}\u0004`)
      j = prev + 1
    } else {
      for (let k = j; k <= Math.min(end, lines.length - 1); k++) lines[k] = lines[k].startsWith(m[1]) ? lines[k].slice(m[1].length) : lines[k].trimStart()
      j = end
    }
  }

  // Pictures: a figure when allowed, otherwise a link to see it on GitHub.
  const pics = []
  let fenced = false
  for (let j = 0; j < lines.length; j++) {
    if (FENCE.test(lines[j])) { fenced = !fenced; continue }
    if (fenced) continue
    lines[j] = lines[j].replace(/!\[([^\]]*)\]\(\s*([^)\s]+)(?:\s+"[^"]*")?\s*\)/g, (all, alt, u) => {
      const name = /^(?:\.\/)?images\/(.+)$/.exec(u)?.[1]
      if (!name || !pictures[name]) return all
      return `\u0003${pics.push({ alt, pic: pictures[name] }) - 1}\u0003`
    })
  }
  // A picture on a line of its own keeps only an italic line under it as its caption;
  // the text after that is a paragraph of its own.
  for (let j = 0; j < lines.length - 1; j++) {
    if (!/^\u0003\d+\u0003\s*$/.test(lines[j]) || !lines[j + 1].trim()) continue
    const cap = /^\s*([*_]).+\1\s*$/.test(lines[j + 1])
    if (cap && (j + 2 >= lines.length || !lines[j + 2].trim())) continue
    lines.splice(j + (cap ? 2 : 1), 0, '')
  }

  let html = render(lines.join('\n'), { link })

  // Heading ids as GitHub makes them, so links to a part of a guide keep working.
  const seen = new Map()
  const toc = []
  html = html.replace(/<h([2-6]) id="[^"]*">([\s\S]*?)<\/h\1>/g, (all, level, inner) => {
    const text = decode(inner.replace(/<[^>]+>/g, '')).trim()
    let id = ghSlug(text) || 'section'
    const n = seen.get(id)
    seen.set(id, (n ?? -1) + 1)
    if (n != null) id = `${id}-${n + 1}`
    if (level === '2') toc.push({ id, html: inner.replace(/<\/?a\b[^>]*>/g, '') })
    return `<h${level} id="${id}">${inner}<a class="h-anchor" href="#${id}" aria-hidden="true" tabindex="-1">#</a></h${level}>`
  })

  // Copy buttons on code, which scripts/site.js runs.
  let n = 0
  const codebox = (pre) => {
    const id = `code-${++n}`
    return `<div class="codebox">${pre.replace(/^<pre\b/, `<pre id="${id}"`)}<button class="icon-btn copy" type="button" data-copy="#${id}" data-done='${icon('check')}' aria-label="Copy" hidden>${icon('copy')}</button></div>`
  }
  html = html.replace(/<pre class="code"[^>]*><code>[\s\S]*?<\/code><\/pre>/g, codebox)
  html = html.replace(/\s*\u0004(\d+)\u0004/g, (all, k) => codebox(`<pre class="code"><code>${esc(held[k])}</code></pre>`))

  // A picture that starts a paragraph is a figure, and the rest of the paragraph its caption.
  const picture = ({ alt, pic }, alone, caption = '') => {
    if (pic.shot || pic.src) {
      const img = pic.shot
        ? shotImg(pic.shot, { alt })
        : `<img src="${esc(pic.src)}" alt="${esc(alt)}"${pic.width ? ` width="${pic.width}" height="${pic.height}"` : ''} loading="lazy" decoding="async">`
      if (!alone) return img
      const same = (a, b) => plain(a).replace(/\W+/g, '').toLowerCase() === decode(b.replace(/<[^>]+>/g, '')).replace(/\W+/g, '').toLowerCase()
      const credit = pic.credit && !same(pic.credit, caption) ? inline(pic.credit.replace(/\]\(CREDITS\.md\)/g, `](${creditsUrl})`), { link }) : ''
      return `<figure class="doc-fig">${img}${caption || credit ? `<figcaption>${caption ? `<span>${caption}</span>` : ''}${credit ? `<span class="credit">${credit}</span>` : ''}</figcaption>` : ''}</figure>`
    }
    const a = `<a href="${esc(pic.github)}" rel="noopener">${icon('photo')}<span>${alt ? `Picture: ${esc(alt)}` : 'A picture'}</span><span class="go">See it on GitHub${icon('external')}</span></a>`
    return alone ? `<div class="doc-pic">${a}${caption ? `<p>${caption}</p>` : ''}</div>` : a.replace('<a ', '<a class="doc-pic-inline" ')
  }
  html = html.replace(/<p>\u0003(\d+)\u0003\s*([^\u0003]*?)<\/p>/g, (all, k, rest) => picture(pics[k], true, rest.trim()))
  html = html.replace(/\u0003(\d+)\u0003/g, (all, k) => picture(pics[k], false))

  const t = help?.title || title
  return {
    title: t,
    h1: title,
    about: help?.about || firstSentence(plain(lead)),
    lead: lead ? inline(lead, { link }) : '',
    description: clip(plain(lead) || help?.about || t, 160),
    html,
    toc,
    github: blob(`docs/${g.file}.md`),
    edit: `https://github.com/${repo}/edit/${branch}/docs/${g.file}.md`,
  }
}

export function pages(d) {
  if (!d.docs?.guides.length) return []
  const { guides } = d.docs
  return [hub(d), ...guides.map((g, i) => guide(d, g, guides[i - 1], guides[i + 1]))]
}

function hub(d) {
  const { groups, guides } = d.docs
  const start = guides.find((g) => g.file === 'GETTING_STARTED')
  const install = guides.find((g) => g.file === 'INSTALL')
  const body = `
${pageHead({
    eyebrow: 'Docs',
    title: 'Guides to WittyMediaServer',
    lead: 'Installing it, setting it up, adding your media and keeping your server running. The same guides are inside the app, under Help.',
    buttons: [start && btn(`/docs/${start.slug}/`, 'Getting started', { kind: 'primary', iconName: 'arrow', after: true }), install && btn(`/docs/${install.slug}/`, 'Installing', { iconName: 'download' })].filter(Boolean).join(''),
  })}
<nav class="docs-jump" aria-label="Groups of guides">
  <div class="wrap">
    ${groups.map((g) => `<a class="chip" href="#${g.id}">${icon(g.icon)}${esc(g.title)}</a>`).join('\n    ')}
  </div>
</nav>
<div class="wrap docs-hub">
  ${groups.map((g) => `<section class="docs-group" aria-labelledby="${g.id}">
    <div class="docs-group-head">
      <span class="tile">${icon(g.icon)}</span>
      <div class="stack tight">
        <h2 id="${g.id}">${esc(g.title)}</h2>
        <p>${esc(g.intro)}</p>
      </div>
    </div>
    <div class="grid three">
      ${g.guides.map((x) => `<a class="card doc-card" href="/docs/${x.slug}/">
        <h3>${esc(x.title)}</h3>
        <p>${esc(x.about)}</p>
        <span class="go">Read${x.changed ? ` <span class="muted">· changed ${esc(shortDate(x.changed))}</span>` : ''}${icon('arrow')}</span>
      </a>`).join('\n      ')}
    </div>
  </section>`).join('\n  ')}
  <p class="docs-foot muted">These guides are made from the ${ext(`https://github.com/${d.docs.repo}/tree/${d.docs.branch}/docs`, 'server’s repository')} each time the site is built. Spotted something wrong or unclear? ${ext(d.site.docs.issues, 'Tell us on GitHub')}.</p>
</div>`
  return { path: '/docs/', html: page({ path: '/docs/', title: 'Docs', description: 'Guides to installing, setting up and running WittyMediaServer, from your first film to remote access, backups and the command line.', body, active: '/docs/' }) }
}

function sidebar(d, current) {
  return d.docs.groups.map((g) => `<div class="docs-nav-group">
      <h2>${esc(g.title)}</h2>
      <ul>${g.guides.map((x) => `<li><a href="/docs/${x.slug}/"${x === current ? ' aria-current="page"' : ''}>${esc(x.title)}</a></li>`).join('')}</ul>
    </div>`).join('\n    ')
}

const tocList = (g) => `<ol>${g.toc.map((t) => `<li><a href="#${t.id}">${t.html}</a></li>`).join('')}</ol>`

function guide(d, g, prev, next) {
  const path = `/docs/${g.slug}/`
  const toc = g.toc.length > 1
  const body = `
<div class="wrap docs-layout${toc ? ' has-toc' : ''}">
  <nav class="docs-side" aria-label="Guides">
    <a class="docs-all" href="/docs/">${icon('back')}All guides</a>
    ${sidebar(d, g)}
  </nav>
  <article class="doc">
    <details class="docs-menu">
      <summary>${icon('menu')}<span>Guides</span><span class="here">${esc(g.group.title)}</span></summary>
      <nav aria-label="Guides">
        <a class="docs-all" href="/docs/">${icon('back')}All guides</a>
        ${sidebar(d, g)}
      </nav>
    </details>
    <header class="doc-head">
      <p class="eyebrow"><a href="/docs/">Docs</a><span aria-hidden="true">/</span><a href="/docs/#${g.group.id}">${esc(g.group.title)}</a></p>
      <h1>${esc(g.h1)}</h1>
      ${g.lead ? `<p class="lead">${g.lead}</p>` : ''}
      <div class="meta">
        ${g.changed ? `<span>Changed <time datetime="${isoDate(g.changed)}">${esc(longDate(g.changed))}</time></span>` : ''}
        ${ext(g.edit, `${icon('github')}Edit on GitHub`)}
      </div>
    </header>
    ${toc ? `<details class="doc-toc-small">
      <summary>${icon('list')}On this page</summary>
      <nav aria-label="On this page">${tocList(g)}</nav>
    </details>` : ''}
    <div class="prose doc-body">
${g.html}
    </div>
    <nav class="doc-pager" aria-label="Previous and next guides">
      ${prev ? `<a class="card prev" href="/docs/${prev.slug}/" rel="prev"><span class="label">${icon('back')}Previous</span><strong>${esc(prev.title)}</strong></a>` : '<span></span>'}
      ${next ? `<a class="card next" href="/docs/${next.slug}/" rel="next"><span class="label">Next${icon('arrow')}</span><strong>${esc(next.title)}</strong></a>` : ''}
    </nav>
    <p class="doc-foot muted">Made from ${ext(g.github, `docs/${esc(g.file)}.md`)} in the server’s repository. ${ext(g.edit, 'Suggest a change')} or ${ext(d.site.docs.issues, 'tell us what’s unclear')}.</p>
  </article>
  ${toc ? `<aside class="doc-toc" aria-labelledby="toc-title">
    <h2 id="toc-title">On this page</h2>
    <nav aria-label="On this page">${tocList(g)}</nav>
  </aside>` : ''}
</div>`
  return { path, html: page({ path, title: g.title, description: g.description, body, active: '/docs/', type: 'article' }) }
}

// ---------- helpers ----------

/** A heading's anchor as GitHub writes it: lower case, punctuation gone, each space a hyphen. */
const ghSlug = (s) => s.toLowerCase().replace(/[^\p{L}\p{M}\p{N}\p{Pc} -]/gu, '').replace(/ /g, '-')

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'" }
const decode = (s) => s.replace(/&(amp|lt|gt|quot|#39);/g, (all, e) => ENT[e])

const firstSentence = (s) => (/^.*?[.!?](?=\s|$)/.exec(s)?.[0] || s)
const clip = (s, n) => s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s

/** Width and height from a WebP or PNG file's header, so pictures keep their space while loading. */
function imageSize(b) {
  try {
    if (b.toString('ascii', 1, 4) === 'PNG') return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) }
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
