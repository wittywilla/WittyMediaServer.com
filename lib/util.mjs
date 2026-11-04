// Small helpers every page uses: escaping, dates, sizes and file writing.
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }

/** Escapes text for HTML. Everything from GitHub or a content file goes through this. */
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c])

/** Joins the parts of a template, dropping false, null and undefined. */
export const join = (parts, sep = '') => parts.flat(Infinity).filter((p) => p !== false && p != null && p !== '').join(sep)

export const slug = (s) => String(s).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export const hash = (data, n = 10) => crypto.createHash('sha256').update(data).digest('hex').slice(0, n)

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

/** "3 November 2026". Dates are shown in UTC so a build gives the same page anywhere. */
export const longDate = (d) => {
  const t = new Date(d)
  return `${t.getUTCDate()} ${MONTHS[t.getUTCMonth()]} ${t.getUTCFullYear()}`
}

/** "3 Nov 2026" */
export const shortDate = (d) => {
  const t = new Date(d)
  return `${t.getUTCDate()} ${MONTHS[t.getUTCMonth()].slice(0, 3)} ${t.getUTCFullYear()}`
}

export const isoDate = (d) => new Date(d).toISOString().slice(0, 10)

/** "134 MB", "3.3 MB", "900 KB" */
export const size = (bytes) => {
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`
  if (bytes >= 1e7) return `${Math.round(bytes / 1e6)} MB`
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`
  return `${Math.max(1, Math.round(bytes / 1e3))} KB`
}

/** "0.6.2-alpha" from "v0.6.2-alpha" */
export const version = (tag) => String(tag).replace(/^v(?=\d)/, '')

/** Compares versions such as 0.6.2-alpha and 0.10.0-alpha the way people read them. */
export const compareVersions = (a, b) => {
  const pa = version(a).split(/[.-]/), pb = version(b).split(/[.-]/)
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const x = pa[i] ?? '', y = pb[i] ?? ''
    const nx = /^\d+$/.test(x), ny = /^\d+$/.test(y)
    if (nx && ny && +x !== +y) return +x - +y
    if (x !== y) {
      if (x === '') return 1
      if (y === '') return -1
      return x < y ? -1 : 1
    }
  }
  return 0
}

export const write = (file, data) => {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, data)
}

export const readJSON = (file, fallback) => {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return fallback }
}

/** Splits "---\nkey: value\n---\nbody" into its fields and body. Values are plain text, or JSON for lists. */
export const frontMatter = (text) => {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text)
  if (!m) return { data: {}, body: text }
  const data = {}
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(':')
    if (i < 1 || line.trimStart().startsWith('#')) continue
    const key = line.slice(0, i).trim()
    let value = line.slice(i + 1).trim()
    if (/^[[{]/.test(value)) { try { value = JSON.parse(value) } catch {} }
    else if (/^".*"$/.test(value)) value = value.slice(1, -1)
    data[key] = value
  }
  return { data, body: text.slice(m[0].length) }
}

/** Curly quotes and apostrophes for text written with straight ones, outside code. */
export const smarten = (s) => String(s)
  .replace(/(^|[\s([{—-])"/g, '$1“').replace(/"/g, '”')
  .replace(/(^|[\s([{—-])'/g, '$1‘').replace(/'/g, '’')
