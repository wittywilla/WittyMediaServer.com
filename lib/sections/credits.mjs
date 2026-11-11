// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 WittyWilla and contributors
// The credits page: every picture the site can show, and every work that can be
// seen in it, with its author, licence and where that licence is stated. It reads
// content/licences.json, the same record the build checks before publishing a picture.
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { page, pageHead, sectionHead, ext } from '../layout.mjs'
import { esc } from '../util.mjs'

const FILE = fileURLToPath(new URL('../../content/licences.json', import.meta.url))

const LICENCES = {
  'cc0-1.0': ['CC0 1.0', 'https://creativecommons.org/publicdomain/zero/1.0/'],
  'cc-by-3.0': ['CC BY 3.0', 'https://creativecommons.org/licenses/by/3.0/'],
  'cc-by-4.0': ['CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/'],
  'cc-by-sa-3.0': ['CC BY-SA 3.0', 'https://creativecommons.org/licenses/by-sa/3.0/'],
  'cc-by-sa-4.0': ['CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/'],
  'public domain': ['Public domain', null],
  'own work': ['Own work, AGPL-3.0-or-later', 'https://www.gnu.org/licenses/agpl-3.0.html'],
}

/** Any other version or national port of CC BY or CC BY-SA, such as CC-BY-SA-3.0-AT or CC-BY-SA-3.0-IGO. */
function cc(id) {
  const m = /^CC-(BY(?:-SA)?)-(\d\.\d)(?:-([A-Z]+))?$/i.exec(id)
  if (!m) return null
  const [kind, ver, port] = [m[1].toUpperCase(), m[2], m[3]?.toUpperCase()]
  return [`CC ${kind} ${ver}${port ? ` ${port}` : ''}`, `https://creativecommons.org/licenses/${kind.toLowerCase()}/${ver}/${port ? `${port.toLowerCase()}/` : ''}`]
}

/** A licence's name, linked to its text: SPDX's copy for software licences. */
function licence(id) {
  const [name, href] = LICENCES[String(id).toLowerCase()] || cc(id) || [id, `https://spdx.org/licenses/${encodeURIComponent(id)}.html`]
  return href ? ext(href, esc(name)) : esc(name)
}

const source = (href) => /^https?:\/\//.test(href || '') ? ext(href, 'Source', 'src') : ''

function works(list) {
  return `<ul class="credit-works">
    ${list.map((w) => `<li><span class="t">${esc(w.title)}</span><span class="by">${esc(w.by)}</span><span class="meta"><span class="lic">${licence(w.licence)}</span>${source(w.source)}</span></li>`).join('\n    ')}
  </ul>`
}

// Every screenshot shows the project's own interface; the intro says so once, rather than every card.
const shown = (r) => r.works.filter((w) => !(String(w.licence).toLowerCase() === 'own work' && /own interface/.test(w.title)))

function picture({ id, title, note, rec, themed = [] }) {
  const list = shown(rec)
  return `<article class="credit-pic" id="pic-${esc(id.replace(/\//g, '-'))}">
  <h3>${esc(title)}</h3>
  <p class="file">${esc(note)}</p>
  ${list.length ? works(list) : '<p class="theme-note">Only the project’s own interface.</p>'}
  ${themed.map(([name, r]) => `<p class="theme-note">In the ${esc(name)} theme it shows:</p>\n  ${works(shown(r))}`).join('\n  ')}
</article>`
}

export function pages(d) {
  if (!fs.existsSync(FILE)) return []
  const rec = JSON.parse(fs.readFileSync(FILE, 'utf8'))
  const all = rec.pictures || {}
  const themeName = (t) => d.themes.find((x) => x.id === t)?.name || t
  const shotIds = new Set(d.shots.map((s) => s.id))

  // Screenshots the site shows, in the gallery's order, with any themed copy that shows something else.
  const shots = d.shots.filter((s) => all[s.id]).map((s) => picture({
    id: s.id, title: s.title, note: `${s.id}.webp, from ${s.repo.split('/')[1]}`, rec: all[s.id],
    themed: s.themeless ? [] : d.site.themes.filter((t) => all[`${t}/${s.id}`]).map((t) => [themeName(t), all[`${t}/${s.id}`]]),
  }))
  // Pictures in the guides that aren't also screenshots.
  const guides = Object.keys(all).filter((k) => !k.includes('/') && k !== 'logo' && !shotIds.has(k)).sort()
    .map((k) => picture({ id: k, title: k, note: `${k}.webp, from the guides`, rec: all[k] }))
  const icons = Object.keys(all).filter((k) => k.startsWith('icons/')).sort()
  const marks = [
    ...(all.logo ? [picture({ id: 'logo', title: 'The WittyMediaServer logo', note: 'icon.svg, icon-192.png and icon-512.png', rec: all.logo })] : []),
    // The module icons are all drawn by one script, so they share one card.
    ...(icons.length ? [picture({ id: 'icons', title: 'Module icons', note: icons.map((k) => `${k.slice(6)}.png`).join(', '), rec: { works: [...new Map(icons.flatMap((k) => all[k].works).map((w) => [w.source + w.licence, { ...w, title: 'Each module’s icon, drawn by scripts/make-icons.mjs' }])).values()] } })] : []),
  ]

  const checked = [...new Set(Object.values(all).map((p) => p.checked).filter(Boolean))].sort().pop()
  const body = `
${pageHead({ eyebrow: 'From the project', title: 'Picture credits', lead: `Every picture on this site was taken from a test server filled with openly licensed and public-domain media. Below is every work that can be seen in each one: who made it, its licence, and where that licence is stated.${checked ? ` Last checked on ${esc(checked)}.` : ''}` })}
<section class="section">
  <div class="wrap">
    <div class="prose credit-intro">
      <p>A picture is published here only when everything in it is under one of these: ${(rec.allowed || []).map((l) => licence(l)).join(', ')}. Every screenshot also shows the project’s own interface, which is its own work under the GNU Affero General Public License v3.0 (or later), as are its icons and logo.</p>
      <p>Public-domain status is usually for the United States, and may differ elsewhere. This is a licence record, not legal advice. Third-party names only describe what something is, and belong to their owners.</p>
    </div>
  </div>
</section>
${shots.length ? `<section class="section">
  <div class="wrap">
    ${sectionHead({ title: 'Screenshots', id: 'screenshots', intro: 'The pictures in the gallery and across the site, in the same order.' })}
    <div class="credit-list">
    ${shots.join('\n    ')}
    </div>
  </div>
</section>` : ''}
${guides.length ? `<section class="section">
  <div class="wrap">
    ${sectionHead({ title: 'Pictures in the guides', id: 'guides', intro: 'The other pictures the guides can show, by file name.' })}
    <div class="credit-list">
    ${guides.join('\n    ')}
    </div>
  </div>
</section>` : ''}
${marks.length ? `<section class="section">
  <div class="wrap">
    ${sectionHead({ title: 'The logo and module icons', id: 'icons', intro: 'Drawn for the project. Nothing here is another product’s logo.' })}
    <div class="credit-list">
    ${marks.join('\n    ')}
    </div>
  </div>
</section>` : ''}`
  return [{ path: '/credits/', html: page({ path: '/credits/', title: 'Picture credits', description: 'Every work seen in the pictures on this site, with its author, licence and source.', body }) }]
}
