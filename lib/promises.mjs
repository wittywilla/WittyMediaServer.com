// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 WittyWilla and contributors
// The home page's "no catch" strip and section, from content/promises.json.
import { esc } from './util.mjs'
import { icon, ext } from './layout.mjs'

/** A strip that scrolls under the top bar and leads to the section. Still when motion is reduced. */
export function ticker(p) {
  if (!p?.promises?.length) return ''
  const run = p.promises.map((x) => `<span class="tk-item">${icon(x.icon)}${esc(x.short)}</span>`).join('')
  return `<a class="ticker" href="#no-catch" aria-label="${esc(p.title)} ${esc(p.promises.map((x) => x.short).join('. '))}. Read more.">
  <span class="tk-track" aria-hidden="true"><span class="tk-run">${run}</span><span class="tk-run">${run}</span></span>
</a>`
}

/** The section the strip leads to: every promise, said in full. */
export function section(p) {
  if (!p?.promises?.length) return ''
  return `<section class="section no-catch" id="no-catch">
  <div class="wrap">
    <div class="section-head">
      <div class="stack">
        <p class="eyebrow">${esc(p.eyebrow)}</p>
        <h2>${esc(p.title)}</h2>
        <p>${esc(p.intro)}</p>
      </div>
    </div>
    <ul class="promises">
      ${p.promises.map((x) => `<li class="promise${x.big ? ' big' : ''}">
        <span class="tile">${icon(x.icon)}</span>
        <h3>${esc(x.title)}</h3>
        <p>${esc(x.text)}</p>
        ${x.link ? `<p class="more">${ext(x.link.href, `${esc(x.link.label)}${icon(/^\//.test(x.link.href) ? 'arrow' : 'external')}`)}</p>` : ''}
      </li>`).join('\n      ')}
    </ul>
  </div>
</section>`
}
