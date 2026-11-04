// A small Markdown reader for release notes, changelogs, module text and news.
// It covers what those use: headings, paragraphs, lists, quotes, code, tables,
// links, images, bold, italic and GitHub references. Raw HTML is shown as text,
// never run, because release notes come from outside this repository.
import { esc, slug, smarten } from './util.mjs'

const GH = 'https://github.com/'

/**
 * Inline Markdown to HTML.
 * opts.link(url) may rewrite link targets (relative links in a repository's docs).
 */
export function inline(text, opts = {}) {
  const out = []
  let s = String(text)
  // Pull code spans out first so nothing inside them is touched.
  const codes = []
  s = s.replace(/`([^`]+)`/g, (_, c) => `\u0000${codes.push(c) - 1}\u0000`)
  const tokens = []
  const keep = (html) => `\u0001${tokens.push(html) - 1}\u0001`
  const href = (u) => {
    u = u.trim().replace(/^<|>$/g, '')
    if (opts.link) u = opts.link(u)
    if (!/^(https?:|mailto:|\/|#)/i.test(u)) return null
    return u
  }
  // Images, then links.
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, (m, alt, u) => {
    const h = href(u)
    return h ? keep(`<img src="${esc(h)}" alt="${esc(alt)}" loading="lazy" decoding="async">`) : esc(alt)
  })
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, (m, label, u) => {
    const h = href(u)
    if (!h) return label
    const ext = /^https?:/i.test(h) && !h.startsWith('https://wittymediaserver.com')
    return keep(`<a href="${esc(h)}"${ext ? ' rel="noopener"' : ''}>`) + label + keep('</a>')
  })
  // Bare addresses, and GitHub's short references.
  s = s.replace(/(^|[\s(])(https?:\/\/[^\s)<]+[^\s)<.,;:!?'"])/g, (m, pre, u) => {
    let label = u
    const pr = /^https:\/\/github\.com\/([\w.-]+\/[\w.-]+)\/(?:pull|issues)\/(\d+)$/.exec(u)
    if (pr) label = `${pr[1].split('/')[1]}#${pr[2]}`
    const cmp = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/(compare|commits)\/(.+)$/.exec(u)
    if (cmp) label = cmp[1] === 'compare' ? `Changes ${cmp[2].replace('...', ' to ')}` : `Commits up to ${cmp[2]}`
    return pre + keep(`<a href="${esc(u)}" rel="noopener">${esc(label)}</a>`)
  })
  s = s.replace(/(^|[\s(])([\w.-]+\/[\w.-]+)#(\d+)\b/g, (m, pre, repo, n) =>
    pre + keep(`<a href="${GH}${esc(repo)}/issues/${n}" rel="noopener">${esc(repo.split('/')[1])}#${n}</a>`))
  // @names stay plain text: the site shouldn't look like it's calling anyone.
  s = s.replace(/(^|\s)@([A-Za-z0-9-]+)/g, '$1$2')

  // What's left is text. Escape it, then add emphasis.
  s = s.split(/(\u0001\d+\u0001)/).map((part) => /^\u0001\d+\u0001$/.test(part) ? part : esc(smarten(part))).join('')
  s = s.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>').replace(/__([^_]+?)__/g, '<strong>$1</strong>')
  s = s.replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\w)/g, '$1<em>$2</em>').replace(/(^|[^_\w])_([^_\s][^_]*?)_(?!\w)/g, '$1<em>$2</em>')
  s = s.replace(/~~([^~]+)~~/g, '<del>$1</del>')
  s = s.replace(/\u0001(\d+)\u0001/g, (_, i) => tokens[i])
  s = s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${esc(codes[i])}</code>`)
  out.push(s)
  return out.join('')
}

/** Markdown to plain text, for summaries and descriptions. */
export function plain(text) {
  return String(text)
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/(\*\*|__|~~)(.+?)\1/g, '$2')
    .replace(/(^|[^\w*])[*_]([^*_\s][^*_]*?)[*_](?!\w)/g, '$1$2')
    .replace(/^#+\s*/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Block Markdown to HTML.
 * opts.headingShift moves heading levels down (a release's "##" becomes h3 under the page's h2).
 * opts.link rewrites links, as for inline().
 */
export function render(md, opts = {}) {
  const lines = String(md).replace(/\r\n?/g, '\n').replace(/<!--[\s\S]*?-->/g, '').split('\n')
  const shift = opts.headingShift ?? 0
  const html = []
  const ids = new Set()
  let i = 0

  const isBlank = (l) => !l || !l.trim()
  const listItem = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/

  while (i < lines.length) {
    const line = lines[i]
    if (isBlank(line)) { i++; continue }

    // Fenced code.
    const fence = /^\s*(```|~~~)\s*([\w-]*)/.exec(line)
    if (fence) {
      const body = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith(fence[1])) body.push(lines[i++])
      i++
      const lang = fence[2] ? ` data-lang="${esc(fence[2])}"` : ''
      html.push(`<pre class="code"${lang}><code>${esc(body.join('\n'))}</code></pre>`)
      continue
    }

    // Headings.
    const h = /^(#{1,6})\s+(.*?)\s*#*\s*$/.exec(line)
    if (h) {
      const level = Math.min(6, h[1].length + shift)
      let id = slug(plain(h[2])) || 'section'
      while (ids.has(id)) id += '-'
      ids.add(id)
      html.push(`<h${level} id="${id}">${inline(h[2], opts)}</h${level}>`)
      i++
      continue
    }

    // Rules.
    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) { html.push('<hr>'); i++; continue }

    // Tables.
    if (line.includes('|') && i + 1 < lines.length && /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(lines[i + 1])) {
      const cells = (l) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim())
      const head = cells(line)
      i += 2
      const rows = []
      while (i < lines.length && lines[i].includes('|') && !isBlank(lines[i])) rows.push(cells(lines[i++]))
      html.push(`<div class="table-wrap"><table><thead><tr>${head.map((c) => `<th>${inline(c, opts)}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${inline(c, opts)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`)
      continue
    }

    // Quotes.
    if (/^\s*>/.test(line)) {
      const body = []
      while (i < lines.length && /^\s*>/.test(lines[i])) body.push(lines[i++].replace(/^\s*>\s?/, ''))
      html.push(`<blockquote>${render(body.join('\n'), opts)}</blockquote>`)
      continue
    }

    // Lists, with nesting by indent.
    if (listItem.test(line)) {
      const parse = (indent) => {
        const first = listItem.exec(lines[i])
        const ordered = /\d/.test(first[2])
        const items = []
        while (i < lines.length) {
          const m = listItem.exec(lines[i])
          if (!m || m[1].length < indent) break
          if (m[1].length > indent) { items[items.length - 1].sub.push(parse(m[1].length)); continue }
          const item = { text: [m[3]], sub: [] }
          items.push(item)
          i++
          // Continuation lines, indented under the item.
          while (i < lines.length && !isBlank(lines[i]) && !listItem.test(lines[i]) && /^\s+/.test(lines[i])) item.text.push(lines[i++].trim())
          // A blank line followed by more of the same list keeps it going.
          if (i < lines.length && isBlank(lines[i]) && i + 1 < lines.length && listItem.test(lines[i + 1]) && listItem.exec(lines[i + 1])[1].length >= indent) i++
        }
        const tag = ordered ? 'ol' : 'ul'
        return `<${tag}>${items.map((it) => `<li>${inline(it.text.join(' '), opts)}${it.sub.join('')}</li>`).join('')}</${tag}>`
      }
      html.push(parse(listItem.exec(line)[1].length))
      continue
    }

    // Paragraphs.
    const body = []
    while (i < lines.length && !isBlank(lines[i]) && !/^(#{1,6}\s|\s*```|\s*>)/.test(lines[i]) && !listItem.test(lines[i])) body.push(lines[i++].trim())
    if (body.length) html.push(`<p>${inline(body.join(' '), opts)}</p>`)
    else i++
  }
  return html.join('\n')
}

/** Splits Markdown into its "##" sections: [{ title, body }], the first with title ''. */
export function sections(md, level = 2) {
  const re = new RegExp(`^#{${level}}\\s+(.*)$`)
  const out = [{ title: '', body: [] }]
  let fenced = false
  for (const line of String(md).replace(/\r\n?/g, '\n').split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) fenced = !fenced
    const m = !fenced && re.exec(line)
    if (m) out.push({ title: m[1].trim(), body: [] })
    else out[out.length - 1].body.push(line)
  }
  return out.map((s) => ({ title: s.title, body: s.body.join('\n').trim() }))
}
