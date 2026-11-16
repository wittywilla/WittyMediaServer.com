// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 WittyWilla and contributors
// The front page's "free" band and "where can I use it?": everything is free, and the places the
// server runs and the screens that reach it. The icons are the site's own line drawings, not
// anyone's logo, and the names are said only to describe what it works with.
import { esc } from '../util.mjs'
import { icon } from '../layout.mjs'

// Everything there is, said once: the band names every kind of media so nobody wonders which part costs.
const EVERYTHING = ['films', 'shows', 'DVDs and Blu-rays', 'music', 'live TV', 'books and comics', 'photos', 'games']

/** The free band: one big word, and what it covers. */
export function freeBand() {
  return `<section class="section tight free-band-wrap" aria-labelledby="free-title">
  <div class="wrap">
    <div class="free-band">
      <p class="free-word" id="free-title" aria-label="Free">Free</p>
      <div class="free-text">
        <h2>Every feature, every screen, for everyone.</h2>
        <p>Your ${EVERYTHING.slice(0, -1).map(esc).join(', ')} and ${esc(EVERYTHING[EVERYTHING.length - 1])}, at home and away. Nothing is behind a paywall, and nothing ever will be.</p>
      </div>
    </div>
  </div>
</section>`
}

// Where the server runs, and the screens that reach it. Status words stay plain and true: the
// browser needs nothing, the apps are optional.
const SERVER = [
  ['monitor', 'Windows', 'Windows 10 and 11', '/docs/install/'],
  ['laptop', 'macOS', 'macOS 11 and newer', '/docs/macos/'],
  ['terminal', 'Linux', 'Most Linux computers', '/docs/install/'],
  ['server', 'FreeBSD', 'FreeBSD 14 and newer', '/docs/install/'],
  ['container', 'Docker and NAS', 'Any NAS or server that runs Docker', '/docs/docker/'],
]
const SCREENS = [
  ['devices', 'Any web browser', 'Computers, phones, tablets and TVs with a browser. Nothing to install', 'No app needed', '/docs/apps/'],
  ['phone', 'Android', 'Phones, tablets, Android TV, Google TV and Fire TV', 'App', '/client/'],
  ['tv', 'Apple', 'iPhone, iPad and Apple TV', 'App', '/client/'],
  ['laptop', 'Desktop', 'Windows, macOS, Linux and Plasma Bigscreen', 'App', '/client/'],
]
const NAS = [['Synology', 'docker-synology'], ['QNAP', 'docker-qnap'], ['Unraid', 'docker-unraid'], ['TrueNAS', 'docker-truenas'], ['ASUSTOR', 'docker-asustor'], ['UGREEN', 'docker-ugreen'], ['Docker on Linux', 'docker-linux']]

const card = ([ic, name, what, tag, href]) => `<a class="where-card" href="${href}">
        <span class="tile">${icon(ic)}</span>
        <span class="where-text"><strong>${esc(name)}</strong><span>${esc(what)}</span></span>
        ${tag ? `<span class="pill${tag === 'App' ? ' muted' : ''}">${esc(tag)}</span>` : ''}
      </a>`

/** Where can I use it: the server's systems, the screens, and the NAS guides. */
export function wherePlatforms() {
  return `<section class="section where" aria-labelledby="where-title">
  <div class="wrap">
    <div class="section-head">
      <div class="stack">
        <p class="eyebrow">Everywhere you are</p>
        <h2 id="where-title">Where can I use WittyMediaServer?</h2>
        <p>The server runs on a computer you already have. Every other screen reaches it in a web browser, or with an optional app.</p>
      </div>
    </div>
    <h3 class="where-h">The server runs on</h3>
    <div class="where-grid">
      ${SERVER.map(([ic, name, what, href]) => card([ic, name, what, '', href])).join('\n      ')}
    </div>
    <h3 class="where-h">Watch, listen and read on</h3>
    <div class="where-grid">
      ${SCREENS.map(card).join('\n      ')}
    </div>
    <div class="where-nas">
      <span class="where-nas-label">Step-by-step NAS guides</span>
      ${NAS.map(([n, slug]) => `<a class="chip" href="/docs/${slug}/">${esc(n)}</a>`).join('\n      ')}
    </div>
    <p class="where-legal">Windows, macOS, Linux, FreeBSD, Docker, Android, Google TV, Fire TV, iPhone, iPad, Apple TV, Plasma Bigscreen, Synology, QNAP, Unraid, TrueNAS, ASUSTOR and UGREEN are trademarks of their owners, named only to say what WittyMediaServer works with. WittyMediaServer is an independent open-source project: it isn’t affiliated with, sponsored by or endorsed by any of them, and has no official partnership with them. The icons are this site’s own drawings, not their logos. See the <a href="/legal/">legal notes</a>.</p>
  </div>
</section>`
}
