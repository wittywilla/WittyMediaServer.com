// Fetching from GitHub, with everything kept in cache/ so a build works offline
// and a second build asks GitHub only "has this changed?".
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { hash, readJSON, write } from './util.mjs'

export class GitHub {
  constructor({ cacheDir, offline = false, log = console.log }) {
    this.dir = cacheDir
    this.offline = offline
    this.log = log
    this.indexFile = path.join(cacheDir, 'index.json')
    this.index = readJSON(this.indexFile, {})
    this.token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || ''
    if (!this.token && !offline) {
      // Signed in with the GitHub CLI? Then use its token: it allows far more requests.
      try { this.token = execFileSync('gh', ['auth', 'token'], { stdio: ['ignore', 'pipe', 'ignore'], timeout: 5000 }).toString().trim() } catch {}
    }
    this.fetched = 0
    this.fromCache = 0
  }

  save() { write(this.indexFile, JSON.stringify(this.index, null, 1)) }

  file(url) { return path.join(this.dir, 'files', hash(url, 24)) }

  /** Fetches a URL, or its cached copy. Returns a Buffer, or null when there's neither. */
  async get(url, { api = false } = {}) {
    const file = this.file(url)
    const cached = fs.existsSync(file)
    if (this.offline) {
      if (cached) { this.fromCache++; return fs.readFileSync(file) }
      return null
    }
    const headers = { 'User-Agent': 'wittymediaserver.com-build' }
    if (api) { headers.Accept = 'application/vnd.github+json'; headers['X-GitHub-Api-Version'] = '2022-11-28' }
    if (this.token && /^https:\/\/(api\.github\.com|raw\.githubusercontent\.com)\//.test(url)) headers.Authorization = `Bearer ${this.token}`
    const etag = this.index[url]?.etag
    if (cached && etag) headers['If-None-Match'] = etag
    try {
      const res = await fetch(url, { headers, redirect: 'follow', signal: AbortSignal.timeout(60000) })
      if (res.status === 304 && cached) { this.fromCache++; return fs.readFileSync(file) }
      if (!res.ok) {
        if (res.status !== 404) this.log(`  ! ${res.status} from ${url}${cached ? ', using the saved copy' : ''}`)
        if (res.status === 404) { delete this.index[url]; return null }
        return cached ? fs.readFileSync(file) : null
      }
      const buf = Buffer.from(await res.arrayBuffer())
      write(file, buf)
      this.index[url] = { etag: res.headers.get('etag') || undefined, at: new Date().toISOString() }
      this.fetched++
      return buf
    } catch (e) {
      this.log(`  ! couldn't reach ${url} (${e.cause?.code || e.message})${cached ? ', using the saved copy' : ''}`)
      return cached ? fs.readFileSync(file) : null
    }
  }

  async json(url) {
    const buf = await this.get(url, { api: url.startsWith('https://api.github.com/') })
    if (!buf) return null
    try { return JSON.parse(buf.toString('utf8')) } catch { return null }
  }

  async text(url) {
    const buf = await this.get(url)
    return buf ? buf.toString('utf8') : null
  }

  /** Every release of a repository, newest first, drafts left out. */
  async releases(repo) {
    const list = await this.json(`https://api.github.com/repos/${repo}/releases?per_page=50`)
    return Array.isArray(list) ? list.filter((r) => !r.draft) : []
  }

  async repo(repo) { return this.json(`https://api.github.com/repos/${repo}`) }

  raw(repo, branch, file) { return `https://raw.githubusercontent.com/${repo}/${branch}/${file}` }
}
