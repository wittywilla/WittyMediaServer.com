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

// The frame every page shares, and the pieces pages are built from.
import { esc, join, shortDate, longDate, isoDate } from './util.mjs'
import { inline } from './markdown.mjs'
import { icon } from './icons.mjs'

/** Set once per build by build.mjs: asset names, the inline script's hash, the data. */
export const ctx = { assets: {}, inlineHash: '', d: null, built: '' }

// Runs in the head before anything is drawn, so a visit starts in its theme: the colours, the
// browser's own bar, and each screenshot that has a version in that theme, swapped as the page
// is read so the plain one never shows first. It's the page's only inline script, and the build
// puts its hash in the Content Security Policy.
export const THEME_SCRIPT = [
  "(function(){var t,d=document.documentElement;try{t=localStorage.getItem('wms-site-theme')}catch(e){}",
  "if(!t)t=matchMedia('(prefers-color-scheme: light)').matches?'light':'default';d.dataset.theme=t;d.classList.add('js');",
  "var m=document.querySelector('meta[name=theme-color]'),b=getComputedStyle(d).getPropertyValue('--bg').trim();if(m&&b)m.content=b;",
  "if(!window.MutationObserver)return;var o=new MutationObserver(function(r){for(var i=0;i<r.length;i++)for(var n=r[i].addedNodes,j=0;j<n.length;j++){var e=n[j];",
  "if(e.tagName==='IMG'&&e.dataset.shot&&(' '+(e.dataset.themed||'')+' ').indexOf(' '+t+' ')>-1)e.src='/images/shots/'+t+'/'+e.dataset.shot+'.webp'}});",
  "o.observe(d,{childList:true,subtree:true});document.addEventListener('DOMContentLoaded',function(){o.disconnect()})})()",
].join('')

const NAV_ICONS = { '/': 'home', '/server/': 'server', '/client/': 'devices', '/remote/': 'network', '/modules/': 'puzzle', '/docs/': 'book', '/news/': 'news', '/gallery/': 'photo' }
const MORE = [
  { href: '/download/', label: 'Download', icon: 'download' },
  { href: '/start/', label: 'New to media servers?', icon: 'sparkle' },
  { href: '/faq/', label: 'Questions and answers', icon: 'list' },
  { href: '/roadmap/', label: 'Roadmap', icon: 'layers' },
  { href: '/support/', label: 'Help and taking part', icon: 'users' },
  { href: '/projects/', label: 'Every project', icon: 'layers' },
  { href: '/player/', label: 'WittyMediaPlayer', icon: 'disc' },
  { href: '/reader/', label: 'WittyReader', icon: 'book' },
]

export const brand = () => `<a class="brand" href="/" aria-label="WittyMediaServer, home"><img src="/images/icon.svg" alt="" width="34" height="34"><span>Witty<b>Media</b>Server</span></a>`

const internal = (href) => /^[/#]/.test(href)

/** A link; one leaving the site gets rel="noopener". */
export const ext = (href, label, cls = '') => `<a href="${esc(href)}"${cls ? ` class="${cls}"` : ''}${internal(href) ? '' : ' rel="noopener"'}>${label}</a>`

/** A whole page. */
export function page({ path, title, description, body, active, image, type = 'website', head = '', noindex = false }) {
  const { d } = ctx
  const site = d.site
  const full = path === '/' ? `${site.name}: ${site.say.tagline.replace(/\.$/, '')}` : `${title} · ${site.name}`
  const url = site.url + path
  const og = image ? `${site.url}${image}` : `${site.url}/images/brand/social.png`
  const nav = site.nav.map((n) => `<a href="${n.href}"${active === n.href ? ' aria-current="page"' : ''}>${esc(n.label)}</a>`).join('')
  const drawerLinks = site.nav.map((n) => `<a href="${n.href}"${active === n.href ? ' aria-current="page"' : ''}>${icon(NAV_ICONS[n.href] || 'arrow')}${esc(n.label)}</a>`).join('')
  const moreLinks = MORE.map((n) => `<a href="${n.href}"${active === n.href ? ' aria-current="page"' : ''}>${icon(n.icon)}${esc(n.label)}</a>`).join('')
  const csp = [
    "default-src 'self'", `script-src 'self' '${ctx.inlineHash}'`, "style-src 'self'", "img-src 'self' data:",
    "connect-src 'self' https://api.github.com https://raw.githubusercontent.com", "font-src 'self'", "base-uri 'self'",
    "form-action 'none'", "object-src 'none'", "manifest-src 'self'",
  ].join('; ')
  return `<!doctype html>
<html lang="${site.language}" data-theme="default">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta http-equiv="Content-Security-Policy" content="${csp}">
<meta name="referrer" content="strict-origin-when-cross-origin">
<title>${esc(full)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(url)}">
${noindex ? '<meta name="robots" content="noindex">\n' : ''}<meta property="og:type" content="${type}">
<meta property="og:site_name" content="${site.name}">
<meta property="og:title" content="${esc(path === '/' ? full : title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${esc(og)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0f1115">
<meta name="color-scheme" content="dark light">
<link rel="preload" href="/fonts/InterVariable.woff2" as="font" type="font/woff2" crossorigin>
<link rel="icon" href="/images/icon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="alternate" type="application/atom+xml" title="${site.name} news" href="/news/feed.xml">
<link rel="stylesheet" href="${ctx.assets.css}">
<script>${THEME_SCRIPT}</script>
<script src="${ctx.assets.js}" defer></script>
${head}</head>
<body>
<a class="skip" href="#main">Skip to the content</a>
<header class="topbar">
  <div class="wrap">
    ${brand()}
    <nav class="nav" aria-label="Main">${nav}</nav>
    <div class="tools">
      <a class="btn small primary gh-dl" href="/download/">${icon('download')}<span>Download</span></a>
      <button class="icon-btn" type="button" data-theme-btn aria-haspopup="dialog" aria-expanded="false" aria-controls="themes" aria-label="Choose a theme" title="Choose a theme">${icon('palette')}</button>
      <a class="icon-btn gh" href="https://github.com/${site.repos.server}" rel="noopener" aria-label="WittyMediaServer on GitHub" title="WittyMediaServer on GitHub">${icon('github')}</a>
      <button class="icon-btn menu-btn" type="button" aria-expanded="false" aria-controls="drawer" aria-label="Menu" data-close='${icon('close')}'>${icon('menu')}</button>
    </div>
  </div>
</header>
<div class="drawer" id="drawer">
  <nav aria-label="Main">${drawerLinks}</nav>
  <nav class="sub" aria-label="More">${moreLinks}<a href="https://github.com/${site.repos.server}" rel="noopener">${icon('github')}GitHub</a></nav>
</div>
<div class="scrim"></div>
${themePicker()}
<main id="main">
${body}
</main>
${footer()}
</body>
</html>
`
}

function themePicker() {
  const { themes, themed } = ctx.d
  const home = shotOf('home')
  // Each theme shows the server's home in it where there's a picture, and its colours where not.
  // The pictures load only when the picker first opens.
  const preview = (t) => home && themed[t.id]?.includes('home')
    ? `<img src="/images/shots/${esc(t.id)}/home.webp" alt="" width="${home.width || 1600}" height="${home.height || 1000}" loading="lazy" decoding="async">` : ''
  return `<div class="themes-pop" id="themes" role="dialog" aria-labelledby="themes-title">
  <h2 id="themes-title">Theme</h2>
  <p>The server's own themes. Pictures change to match where there's one in that theme.</p>
  <div class="swatches" role="radiogroup" aria-label="Themes">
    ${themes.map((t) => `<button type="button" class="swatch" role="radio" aria-checked="false" data-theme="${esc(t.id)}"><span class="pv"><i></i><u></u><b></b>${preview(t)}</span><span class="nm">${esc(t.name)}${icon('check')}</span></button>`).join('\n    ')}
  </div>
  <button type="button" class="btn small ghost auto" aria-pressed="false">${icon('sun')}<span>Match my device<span class="auto-now"></span></span></button>
</div>`
}

function footer() {
  const { site, latest } = ctx.d
  const s = latest.server
  return `<footer class="footer">
  <div class="wrap">
    <div class="cols">
      <div class="about">
        ${brand()}
        <p>${esc(site.say.tagline)} Self-hosted, open source and yours.</p>
        ${s ? `<p class="muted">Latest: <a href="${s.path}">${esc(s.productName)} ${esc(s.version)}</a>, ${esc(longDate(s.date))}.</p>` : ''}
        <p class="maker">Made by ${esc(site.ownerName)}. More projects and links at ${ext(site.ownerLinks, esc(new URL(site.ownerLinks).host))}</p>
      </div>
      <div>
        <h2>Products</h2>
        <ul>
          <li><a href="/server/">WittyMediaServer</a></li>
          <li><a href="/client/">WittyMediaClient</a></li>
          <li><a href="/player/">WittyMediaPlayer</a></li>
          <li><a href="/reader/">WittyReader</a></li>
          <li><a href="/modules/">Modules</a></li>
        </ul>
      </div>
      <div>
        <h2>Learn</h2>
        <ul>
          <li><a href="/start/">New to media servers?</a></li>
          <li><a href="/docs/">Docs and guides</a></li>
          <li><a href="/faq/">Questions and answers</a></li>
          <li><a href="/download/">Download</a></li>
          <li><a href="/gallery/">Gallery</a></li>
        </ul>
      </div>
      <div>
        <h2>Project</h2>
        <ul>
          <li><a href="/news/">News and releases</a></li>
          <li><a href="/roadmap/">Roadmap</a></li>
          <li><a href="/projects/">Every project</a></li>
          <li><a href="/support/">Help and taking part</a></li>
          <li>${ext(`https://github.com/${site.repos.server}`, `Source code${icon('external')}`)}</li>
          <li><a href="/news/feed.xml">News feed${icon('feed')}</a></li>
        </ul>
      </div>
      <div>
        <h2>About</h2>
        <ul>
          <li><a href="/privacy/">Privacy</a></li>
          <li><a href="/legal/">Legal notes</a></li>
          <li><a href="/credits/">Picture credits</a></li>
          <li>${ext(site.docs.security, `Security${icon('external')}`)}</li>
          <li>${ext(site.ownerLinks, `${esc(new URL(site.ownerLinks).host)}${icon('external')}`)}</li>
        </ul>
      </div>
    </div>
    <div class="base">
      <p>${esc(site.say.alpha)} ${esc(site.say.noMedia)} ${esc(site.say.encrypted)}</p>
      <p>${esc(site.say.privacy)} <a href="/privacy/">How this site handles privacy</a>. <span class="js-only"><a href="#themes" data-open-themes>Change the theme</a>.</span></p>
      <p>WittyMediaServer, its modules and ${ext(`https://github.com/${site.repos.website || 'wittywilla/wittymediaserver.com'}`, 'this website')} are open source under the ${ext('https://www.gnu.org/licenses/agpl-3.0.html', 'GNU Affero General Public License v3.0 (or later)')}, and the apps under the ${ext('https://www.gnu.org/licenses/gpl-3.0.html', 'GNU General Public License v3.0 (or later)')}. Every picture shows only openly licensed or public-domain media, ${ext(site.docs.credits, 'each credited')}.</p>
    </div>
  </div>
</footer>`
}

/** An <img> of a screenshot that follows the chosen theme. */
export function shotImg(id, { eager = false, cls = '', alt } = {}) {
  const s = ctx.d.shots.find((x) => x.id === id)
  if (!s || !s.local) return ''
  const themed = s.themeless ? [] : Object.entries(ctx.d.themed).filter(([, ids]) => ids.includes(id)).map(([t]) => t)
  return `<img src="/images/shots/${id}.webp" data-shot="${id}"${themed.length ? ` data-themed="${themed.join(' ')}"` : ''} alt="${esc(alt ?? s.alt)}" width="${s.width || 1600}" height="${s.height || 1000}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async"${cls ? ` class="${cls}"` : ''}>`
}

export const shotOf = (id) => ctx.d.shots.find((x) => x.id === id && x.local)

/** A screenshot's credit line, from its Markdown. */
export function credit(id) {
  const s = shotOf(id)
  if (!s?.credit) return ''
  return inline(s.credit.replace(/\[the list\]\(CREDITS\.md\)/g, `[the list](${s.creditsUrl})`).replace(/\]\(CREDITS\.md\)/g, `](${s.creditsUrl})`))
}

/** A screenshot in a window frame. */
export function windowShot(id, { title = 'WittyMediaServer', caption, eager = false } = {}) {
  if (!shotOf(id)) return ''
  return `<figure class="window${shotOf(id).height > shotOf(id).width ? ' portrait' : ''}">
  <div class="chrome" aria-hidden="true"><i><b></b><b></b><b></b></i><span>${esc(title)}</span></div>
  ${shotImg(id, { eager })}
  <figcaption><span>${esc(caption ?? shotOf(id).title)}</span><span class="credit">${credit(id)}</span></figcaption>
</figure>`
}

/** A screenshot card: picture, number, title and credit. Opens in the viewer. */
export function shotCard(id, n) {
  const s = shotOf(id)
  if (!s) return ''
  return `<figure class="shot${s.height > s.width ? ' portrait' : ''}" data-tags="${esc(groupTag(s.group))}">
  <a class="zoom" href="/images/shots/${id}.webp" aria-label="Show larger: ${esc(s.title)}">${shotImg(id)}</a>
  <figcaption class="cap">${n ? `<span class="n">${String(n).padStart(2, '0')} / ${esc(s.group)}</span>` : ''}<strong>${esc(s.title)}</strong>${s.credit ? `<span class="credit">${credit(id)}</span>` : ''}</figcaption>
</figure>`
}

export const groupTag = (g) => String(g).toLowerCase().replace(/[^a-z0-9]+/g, '-')

export function viewer() {
  return `<dialog class="viewer" id="viewer" aria-label="Picture">
  <div class="in">
    <div class="bar"><button type="button" class="icon-btn close" aria-label="Close">${icon('close')}</button></div>
    <figure><img src="data:," alt=""></figure>
    <figcaption aria-live="polite"></figcaption>
  </div>
  <button type="button" class="icon-btn nav-btn prev" aria-label="Previous picture">${icon('back')}</button>
  <button type="button" class="icon-btn nav-btn next" aria-label="Next picture">${icon('arrow')}</button>
</dialog>`
}

export function sectionHead({ eyebrow, title, intro, more, moreLabel, id, level = 2 }) {
  const row = !!more
  return `<div class="section-head${row ? ' row' : ''}">
  <div class="stack">
    ${eyebrow ? `<p class="eyebrow">${esc(eyebrow)}</p>` : ''}
    <h${level}${id ? ` id="${id}"` : ''}>${esc(title)}</h${level}>
    ${intro ? `<p>${intro}</p>` : ''}
  </div>
  ${more ? `<a class="more" href="${esc(more)}">${esc(moreLabel)}${icon('arrow')}</a>` : ''}
</div>`
}

export function pageHead({ eyebrow, title, lead, buttons = '', crumb, meta = '' }) {
  return `<header class="page-head">
  <div class="wrap">
    ${crumb ? `<a class="crumb" href="${esc(crumb.href)}">${icon('back')}${esc(crumb.label)}</a>` : ''}
    ${eyebrow ? `<p class="eyebrow">${esc(eyebrow)}</p>` : ''}
    <h1>${esc(title)}</h1>
    ${lead ? `<p class="lead">${lead}</p>` : ''}
    ${meta ? `<div class="meta">${meta}</div>` : ''}
    ${buttons ? `<div class="btn-row">${buttons}</div>` : ''}
  </div>
</header>`
}

export const btn = (href, label, { kind = '', iconName, external = false, after = false } = {}) => {
  // A link that once went to GitHub may now be a page here: no "leaves the site" icon then.
  if (internal(href)) { external = false; if (iconName === 'external') iconName = 'arrow' }
  const i = iconName ? icon(iconName) : ''
  return `<a class="btn${kind ? ' ' + kind : ''}" href="${esc(href)}"${external ? ' rel="noopener"' : ''}>${after ? '' : i}${esc(label)}${after ? i : ''}</a>`
}

/** What a release says in one sentence: its article, its own notes, or the changelog's first line. */
export function releaseSummary(r) {
  if (r.article?.summary) return r.article.summary
  if (r.summary) return r.summary
  if (r.changelog) {
    const first = /^[-*]\s+(.*)$/m.exec(r.changelog)?.[1] || ''
    const text = first.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/`([^`]+)`/g, '$1').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    if (text) return text.length > 220 ? text.slice(0, 217).replace(/\s+\S*$/, '') + '…' : text
  }
  return r.assets.length ? `Downloads for ${r.productName}, with its notes on GitHub.` : `Notes on GitHub.`
}

/** A row in a list of releases and articles. */
export function entry(item) {
  if (item.kind === 'article') {
    const a = item.item
    return `<article class="entry" data-tags="article${a.release ? ' ' + a.release.repoName.toLowerCase() : ''}">
  <div class="when"><time datetime="${isoDate(a.date)}">${shortDate(a.date)}</time>${a.release ? `<span class="pill mono">${esc(a.release.version)}</span>` : '<span class="pill muted">Article</span>'}</div>
  <div><h3><a href="/news/${a.slug}/">${esc(a.title)}</a></h3><p>${esc(a.summary)}</p></div>
  ${icon('arrow', 'arrow')}
</article>`
  }
  const r = item.item
  return `<article class="entry" data-tags="release ${r.repoName.toLowerCase()}">
  <div class="when"><time datetime="${isoDate(r.date)}">${shortDate(r.date)}</time><span class="pill mono${r.product === 'server' ? '' : ' muted'}">${esc(r.version)}</span></div>
  <div><h3><a href="${r.path}">${esc(r.productName)} ${esc(r.version)}</a></h3><p>${esc(releaseSummary(r))}</p></div>
  ${icon('arrow', 'arrow')}
</article>`
}

export const moduleIcon = (m, size = 56) => m.icon64 ? `<img class="ico" src="${m.icon64}" alt="" width="${size}" height="${size}" loading="lazy">` : `<span class="tile muted">${icon('puzzle')}</span>`

export const GROUP_NAMES = { discs: 'Discs', games: 'Games', tv: 'Live TV', read: 'Reading', reading: 'Reading', photos: 'Photos', listen: 'Listening', listening: 'Listening', system: 'System', video: 'Video', audio: 'Audio' }
export const groupName = (g) => GROUP_NAMES[g] || (g ? g[0].toUpperCase() + g.slice(1) : 'Other')
export const DELIVERY = { helper: 'Runs a helper program on the server', web: 'Runs in the page', program: 'A separate program', library: 'Built into other modules' }

export function moduleCard(m) {
  const v = m.latest
  const text = [m.name, m.summary, m.description, groupName(m.group), m.repo].join(' ').toLowerCase()
  return `<article class="card mod" data-tags="${esc(m.group || 'other')}${m.core ? ' core' : ''}" data-text="${esc(text)}">
  ${moduleIcon(m)}
  <div class="stack tight">
    <h3><a href="/modules/${esc(m.id)}/">${esc(m.name)}</a></h3>
    <p>${esc(m.summary)}</p>
  </div>
  <div class="tags">
    <span class="pill muted">${esc(groupName(m.group))}</span>
    ${v ? `<span class="pill mono">${esc(v.version)}</span>` : '<span class="pill muted">Comes inside others</span>'}
    ${v?.license && v.license !== 'AGPL-3.0-or-later' ? `<span class="pill warn">${esc(v.license)}</span>` : ''}
  </div>
</article>`
}

export { icon }
