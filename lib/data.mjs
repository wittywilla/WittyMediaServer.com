// Gathers everything the pages show: content files from this repository, and
// releases, the module catalog, themes and screenshots from GitHub.
import fs from 'node:fs'
import path from 'node:path'
import { frontMatter, readJSON, compareVersions, version, slug } from './util.mjs'
import { plain, sections } from './markdown.mjs'

/** Sections of a release's notes that aren't news: the site has its own pages for them. */
const SKIP_SECTIONS = /^(which file to download|what's changed|what’s changed|new contributors|full changelog|downloads?|checksums?)$/i

export async function gather({ root, gh, log }) {
  const content = path.join(root, 'content')
  const site = readJSON(path.join(content, 'site.json'))
  const projects = readJSON(path.join(content, 'projects.json'))
  const shotsCfg = readJSON(path.join(content, 'shots.json'))

  // ---- repositories: default branch and description ----
  const repoNames = new Set([...Object.values(site.repos), ...projects.projects.map((p) => p.repo), ...shotsCfg.shots.map((s) => s.repo)])
  const repos = {}
  await Promise.all([...repoNames].map(async (name) => {
    const r = await gh.repo(name)
    repos[name] = { name, branch: r?.default_branch || 'main', description: r?.description || '', exists: !!r, url: `https://github.com/${name}`, licence: r?.license?.spdx_id && r.license.spdx_id !== 'NOASSERTION' ? r.license.spdx_id : null, pushed: r?.pushed_at }
  }))

  // ---- releases ----
  const changelog = await serverChangelog(gh, site.repos.server, repos[site.repos.server]?.branch || 'master')
  const releases = []
  for (const key of ['server', 'client', 'player', 'reader']) {
    const repo = site.repos[key]
    for (const r of await gh.releases(repo)) releases.push(release(r, repo, key, changelog))
  }
  releases.sort((a, b) => b.date.localeCompare(a.date))
  const latest = {}
  for (const r of releases) if (!latest[r.product]) latest[r.product] = r

  // ---- news articles ----
  const news = []
  const newsDir = path.join(content, 'news')
  for (const f of fs.existsSync(newsDir) ? fs.readdirSync(newsDir).filter((f) => f.endsWith('.md') && !f.startsWith('_')).sort() : []) {
    const { data, body } = frontMatter(fs.readFileSync(path.join(newsDir, f), 'utf8'))
    if (data.draft === 'true' || data.draft === true) continue
    const id = data.slug || f.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '')
    const date = data.date || f.slice(0, 10)
    let rel = null
    if (data.release) {
      const [repo, tag] = String(data.release).split(/\s+/)
      rel = releases.find((r) => r.repo === repo && r.tag === tag) || null
    }
    news.push({ id, slug: slug(id), title: data.title || id, summary: data.summary || plain(body).slice(0, 200), date, body, image: data.image || null, release: rel, releaseRef: data.release || null, file: f })
  }
  // Newest first; articles on the same day follow their releases' order.
  for (const n of news) if (n.release) { n.release.article = n; n.sortKey = `${n.date}|${n.release.date}` } else n.sortKey = `${n.date}|`
  news.sort((a, b) => b.sortKey.localeCompare(a.sortKey))

  // ---- the module catalog ----
  const catalog = await gh.json(site.catalog) || await gh.json(site.catalogLive) || { modules: [] }
  const catalogBase = site.catalog.replace(/[^/]+$/, '')
  const modules = (catalog.modules || []).map((m) => {
    const versions = [...(m.versions || [])].sort((a, b) => compareVersions(b.version, a.version))
    return { ...m, versions, latest: versions[0] || null, iconUrl: m.icon?.url ? new URL(m.icon.url, catalogBase).href : null, iconSha: m.icon?.sha256 }
  }).sort((a, b) => a.name.localeCompare(b.name))

  // ---- themes, from the server's own theme files ----
  const serverRepo = site.repos.server
  const serverBranch = repos[serverRepo]?.branch || 'master'
  const themes = []
  for (const id of site.themes) {
    const t = await gh.json(gh.raw(serverRepo, serverBranch, `themes/${id}/theme.json`))
    if (t?.colors) themes.push(t)
    else log(`  ! no theme.json for ${id}`)
  }
  const tokens = await gh.json(gh.raw(serverRepo, serverBranch, 'themes/tokens.json'))

  // ---- screenshots and their credits ----
  const credits = {}
  for (const repo of new Set(shotsCfg.shots.map((s) => s.repo))) {
    const md = await gh.text(gh.raw(repo, repos[repo]?.branch || 'main', 'docs/images/CREDITS.md'))
    credits[repo] = {}
    for (const m of (md || '').matchAll(/^\|\s*`([^`]+)\.webp`\s*\|\s*(.+?)\s*\|\s*$/gm)) credits[repo][m[1]] = m[2]
  }
  const creditsUrl = (repo) => `https://github.com/${repo}/blob/${repos[repo]?.branch || 'main'}/docs/images/CREDITS.md`
  const shots = shotsCfg.shots.map((s) => ({
    ...s,
    url: gh.raw(s.repo, repos[s.repo]?.branch || 'main', `docs/images/${s.id}.webp`),
    credit: s.credit ?? credits[s.repo]?.[s.id] ?? '',
    creditsUrl: creditsUrl(s.repo),
  }))

  const themedFile = path.join(root, 'images', 'themes', 'manifest.json')
  const themed = readJSON(themedFile, { themes: {} }).themes || {}

  const promises = readJSON(path.join(content, 'promises.json'), null)

  return { site, projects, repos, releases, latest, news, catalog, modules, themes, tokens, shots, shotGroups: shotsCfg.groups, themed, changelog, promises }
}

/** The server's CHANGELOG.md as { "0.6.0-alpha": markdown }. */
async function serverChangelog(gh, repo, branch) {
  const md = await gh.text(gh.raw(repo, branch, 'CHANGELOG.md'))
  const out = {}
  for (const s of sections(md || '')) {
    const v = /^\[?v?(\d+\.\d+\.\d+[\w.-]*)\]?/.exec(s.title)
    if (v && s.body.trim()) out[v[1]] = s.body
  }
  return out
}

const PRODUCT_NAMES = { server: 'WittyMediaServer', client: 'WittyMediaClient', player: 'WittyMediaPlayer', reader: 'WittyReader' }

function release(r, repo, product, changelog) {
  const v = version(r.tag_name)
  const body = String(r.body || '').replace(/\r\n?/g, '\n')
  const parts = sections(body)
  // Notes worth showing: every section but the download table and GitHub's lists.
  const kept = parts.filter((s) => !SKIP_SECTIONS.test(s.title.replace(/[*_`]/g, '').trim()))
  const notes = kept.map((s) => (s.title ? `## ${s.title}\n\n` : '') + s.body).join('\n\n')
    .replace(/^\*\*Full Changelog\*\*:.*$/gim, '').trim()
  const prs = (parts.find((s) => /what.s changed/i.test(s.title))?.body || '')
    .split('\n').map((l) => /^\*\s+(.*?)\s+by\s+@[\w-]+\s+in\s+(https:\/\/github\.com\/\S+\/pull\/(\d+))/.exec(l)).filter(Boolean)
    .map((m) => ({ title: m[1], url: m[2], number: m[3] }))
  const compare = /\*\*Full Changelog\*\*:\s*(\S+)/.exec(body)?.[1] || null
  const first = sections(notes)[0]?.body || ''
  const summary = plain(first.split(/\n\s*\n/)[0] || '') || ''
  return {
    product, productName: PRODUCT_NAMES[product], repo, repoName: repo.split('/')[1],
    tag: r.tag_name, version: v, name: r.name && r.name !== r.tag_name ? r.name : `${PRODUCT_NAMES[product]} ${v}`,
    date: r.published_at || r.created_at, prerelease: !!r.prerelease, url: r.html_url,
    notes, summary, prs, compare,
    changelog: product === 'server' ? changelog[v] || null : null,
    assets: (r.assets || []).map((a) => ({ name: a.name, size: a.size, url: a.browser_download_url })),
    path: `/news/release/${repo.split('/')[1]}/${r.tag_name}/`,
  }
}
