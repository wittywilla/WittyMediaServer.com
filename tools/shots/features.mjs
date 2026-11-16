// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 WittyWilla and contributors
// The site's feature pictures: Lumen in the Witty theme, desktop and phone, signed in as Sam.
//   node features.mjs <out> [scene,scene]
// Writes <name>.png and <name>.txt (the words on screen, for the credits).
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { createRequire } from 'node:module'
process.env.PLAYWRIGHT_BROWSERS_PATH ||= (process.env.PLAYWRIGHT_DIR || 'D:/build-tools/site-audit/') + 'browsers'
const { chromium } = createRequire(process.env.PLAYWRIGHT_DIR || 'D:/build-tools/site-audit/')('playwright')

const SERVER = process.env.WMS_SERVER || 'http://site.localhost:19490'
const [out = 'features', onlyArg] = process.argv.slice(2)
const only = onlyArg ? onlyArg.split(',') : null
mkdirSync(out, { recursive: true })
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const browser = await chromium.launch({ timeout: 180000 })
const SIZES = {
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  phone: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36' },
}
let token = ''
// Motion is reduced so pictures settle, except for the scenes that show moving light (the visualizers).
async function context(form, motion = false) {
  const ctx = await browser.newContext({ ...SIZES[form], reducedMotion: motion ? 'no-preference' : 'reduce' })
  const page = await ctx.newPage()
  page.setDefaultTimeout(90000)
  await page.goto(SERVER + '/help', { waitUntil: 'domcontentloaded' })
  if (!token) token = (await page.evaluate((pw) => fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'sam', password: pw }) }).then((r) => r.json()), process.env.WMS_PASSWORD)).token
  await page.evaluate((t) => { localStorage.setItem('wms.token', t); localStorage.setItem('wms.theme', 'default') }, token)
  const call = (method, path, body) => page.evaluate(async ([method, path, body]) => { const r = await fetch('/api' + path, { method, headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('wms.token') }, body: body ? JSON.stringify(body) : undefined }); return r.json().catch(() => null) }, [method, path, body])
  await call('PUT', `/sdui/experience?formFactor=${form === 'desktop' ? 'web' : 'phone'}&platform=web`, { experience: 'lumen' })
  await call('POST', '/legal/acknowledge')
  await page.goto(SERVER + '/', { waitUntil: 'load' }); await wait(2500)
  for (let i = 0; i < 4; i++) { const b = page.getByRole('button', { name: 'Dismiss' }).first(); if (await b.count()) { await b.click(); await wait(800) } }
  const go = async (path, settle = 3000) => {
    await page.goto(SERVER + path, { waitUntil: 'load' })
    await wait(settle)
    await page.evaluate(async () => {
      await document.fonts?.ready
      const imgs = [...document.images].filter((i) => { const r = i.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0 })
      await Promise.all(imgs.map((i) => i.complete ? 0 : new Promise((d) => { i.onload = i.onerror = d; setTimeout(d, 6000) })))
    })
    await page.mouse.move(1, 1)
  }
  const shot = async (name) => {
    await wait(500)
    await page.screenshot({ path: join(out, `${name}.png`) })
    // What can be seen: words in the viewport, and the descriptions of pictures in it.
    const seen = await page.evaluate(() => {
      const inView = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth }
      const alts = [...document.querySelectorAll('img[alt], [aria-label]')].filter(inView).map((e) => e.getAttribute('alt') || e.getAttribute('aria-label'))
      const titles = [...document.querySelectorAll('[title]')].filter(inView).map((e) => e.getAttribute('title'))
      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); const words = []
      for (let n = w.nextNode(); n; n = w.nextNode()) { const p = n.parentElement; if (p && n.nodeValue.trim() && inView(p) && getComputedStyle(p).visibility !== 'hidden') words.push(n.nodeValue.trim()) }
      return [...new Set([...words, ...alts, ...titles])].join('\n')
    })
    writeFileSync(join(out, `${name}.txt`), seen)
    const srcs = await page.evaluate(() => {
      const inView = (e) => { const r = e.getBoundingClientRect(); return r.width > 2 && r.height > 2 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth }
      const bg = [...document.querySelectorAll('*')].filter(inView).map((e) => /url\(["']?([^"')]+)/.exec(getComputedStyle(e).backgroundImage)?.[1]).filter(Boolean)
      const media = [...document.querySelectorAll('img, video, canvas[data-src]')].filter(inView).map((e) => e.currentSrc || e.src || e.poster || e.dataset.src)
      return [...new Set([...media, ...bg])].filter((u) => u && !u.startsWith('data:')).join('\n')
    })
    writeFileSync(join(out, `${name}.src`), srcs)
    console.log('shot', name)
  }
  const libs = async () => { const l = await call('GET', '/libraries'); return l.libraries || l }
  const lib = async (name) => (await libs()).find((l) => l.name === name)
  const items = async (name, q = '') => { const l = await lib(name); const r = await call('GET', `/items?library=${l.id}&limit=3000${q}`); return r.items || r }
  return { ctx, page, go, shot, call, lib, items }
}

const desktop = {
  async home(s) { await s.go('/', 4500); await s.shot('home'); await s.page.evaluate(() => scrollTo(0, 820)); await wait(2500); await s.shot('home-shelves') },
  async movies(s) { const l = await s.lib('Movies'); await s.go(`/library/${l.id}`, 5000); await s.shot('movies') },
  async film(s) { const it = (await s.items('Movies')).find((i) => /Sintel/.test(i.title)); await s.go(`/item/${it.id}`, 4000); await s.shot('film-page') },
  async tv(s) {
    const l = await s.lib('TV Shows'); await s.go(`/library/${l.id}`, 5000); await s.shot('tv-shows')
    const r = await s.call('GET', `/shows?library=${l.id}&limit=500`); const all = r.shows || r.items || r
    const es = all.find((x) => /ESOcast|Hubblecast/.test(x.title)) || all[0]
    await s.go(`/show/${es.id}`, 4000); await s.shot('tv-show-page')
  },
  async music(s) { const l = await s.lib('Music'); await s.go(`/library/${l.id}`, 5000); await s.shot('music') },
  async books(s) {
    const l = await s.lib('Books'); await s.go(`/library/${l.id}`, 5000); await s.shot('books')
    const c = await s.lib('Comics'); await s.go(`/library/${c.id}`, 5000); await s.shot('comics')
    const comic = (await s.items('Comics')).find((i) => /Pepper&Carrot 0?6\b/.test(i.title)) || (await s.items('Comics'))[0]
    await s.go(`/read/${comic.id}`, 7000); for (let i = 0; i < 3; i++) { await s.page.keyboard.press('ArrowRight'); await wait(1200) } await wait(3000); await s.shot('reader-comic')
  },
  async photos(s) { const l = await s.lib('Photos'); await s.go(`/library/${l.id}`, 7000); await s.shot('photos') },
  async games(s) {
    const l = await s.lib('Games'); await s.go(`/library/${l.id}`, 6000)
    for (let k = 0; k < 4; k++) { const d = s.page.getByRole('dialog'); if (!(await d.count())) break; console.log(await d.first().innerText()); const b = d.first().getByRole('button').filter({ hasText: /Done|Use|Save|Continue|OK|Keep|Got it/ }).first(); if (await b.count()) await b.click(); else await s.page.keyboard.press('Escape'); await wait(1500) }
    await s.go(`/library/${l.id}`, 5000); await s.shot('games')
  },
  async guide(s) { await s.go('/tv', 7000); await s.shot('wittytv-guide') },
  async look(s) { await s.go('/settings/appearance', 5000); await s.shot('settings-appearance') },
  async store(s) { await s.go('/settings/modules', 6000); await s.shot('module-store') },
  async dvd(s) {
    const it = (await s.items('Discs')).find((i) => /^Sintel$/.test(i.title)); await s.go(`/item/${it.id}`, 4000); await s.shot('dvd-item')
    const b = s.page.getByRole('button', { name: /^Play$/ }).first(); if (await b.count()) { await b.click(); await wait(35000); await s.page.mouse.move(700, 450); await wait(800); await s.shot('dvd-menu') }
  },
}
const phone = {
  async phoneHome(s) { await s.go('/', 4500); await s.shot('phone-home') },
  async phoneGuide(s) { await s.go('/tv', 7000); await s.shot('phone-guide') },
  async phoneMovies(s) { const l = await s.lib('Movies'); await s.go(`/library/${l.id}`, 5000); await s.shot('phone-movies') },
  async phoneFilm(s) { const it = (await s.items('Movies')).find((i) => /Sintel/.test(i.title)); await s.go(`/item/${it.id}`, 4000); await s.shot('phone-film') },
}
// The full player on a song with timed words (Take Me Out to the Ball Game, 1908, public domain), playing.
async function player(s, at = 42) {
  const l = await s.lib('Music')
  const song = (await s.items('Music', '&search=' + encodeURIComponent('Take Me Out'))).find((i) => /Take Me Out/.test(i.title))
  await s.go(`/album/${l.id}?album=${encodeURIComponent(song.album)}&artist=${encodeURIComponent(song.albumArtist || song.artist || '')}`, 3500)
  await s.page.getByRole('button', { name: /^Play$/ }).first().click(); await wait(5000)
  await s.page.getByRole('button', { name: /Show the full player/ }).first().click(); await wait(2000)
  await s.page.evaluate((t) => { const a = document.querySelector('audio'); if (a) a.currentTime = t }, at)
}
// Clicks the last visible button whose words or label match: karaoke's controls sit above the full player's.
const button = (s, rx) => s.page.evaluate(([src, flags]) => {
  const re = new RegExp(src, flags)
  const seen = (e) => { const r = e.getBoundingClientRect(); const c = getComputedStyle(e); return r.width > 0 && r.height > 0 && c.visibility !== 'hidden' && c.display !== 'none' }
  const all = [...document.querySelectorAll('button,[role=button],[role=radio],[role=tab],[role=option]')].filter((b) => seen(b) && (re.test(b.textContent.trim()) || re.test(b.getAttribute('aria-label') || '')))
  const b = all[all.length - 1]
  if (b) b.click()
  return !!b
}, [rx.source, rx.flags])
// A visualizer style by name: one of the first three, one chosen before, or from More.
async function style(s, name) {
  if (!(await button(s, new RegExp(`^${name}$`)))) {
    await button(s, /More visualizer styles/); await wait(1000)
    await s.page.evaluate((n) => [...document.querySelectorAll('button,[role=option],[role=menuitem],[role=radio]')].find((b) => b.textContent.trim() === n)?.click(), name)
  }
  await wait(1000); await button(s, /^Turn on$/); await wait(8000)
}
const moving = {
  async visualizers(s) {
    await player(s, 30)
    await button(s, /^Visualizer$/); await wait(1500)
    for (const [name, id] of [['Bars', 'viz-bars'], ['Waves', 'viz-waves'], ['Drift', 'viz-drift'], ['Warp Field', 'viz-warp'], ['Molten Glass', 'viz-molten'], ['Northern Veil', 'viz-veil']]) {
      await style(s, name); await s.shot(id)
    }
    await s.page.keyboard.press('Escape'); await wait(800)
  },
  // Karaoke over three styles: each is chosen in the full player, then karaoke opens with it behind the words.
  async karaoke(s) {
    await player(s, 40)
    await button(s, /^Visualizer$/); await wait(1500)
    for (const [name, id, at, voiceOff] of [['Northern Veil', 'karaoke-veil', 40], ['Molten Glass', 'karaoke-molten', 50], ['Warp Field', 'karaoke-warp', 58, true]]) {
      await style(s, name)
      await s.page.evaluate((t) => { const a = document.querySelector('audio'); if (a) a.currentTime = t }, at)
      await button(s, /^Karaoke/); await wait(6000)
      await button(s, /^Visualizer$/); await wait(5000)
      if (voiceOff) { await button(s, /^Voice off$/); await wait(1500) }
      await s.shot(id)
      if (voiceOff) await button(s, /^Reset$/)
      await button(s, /^Leave karaoke/); await wait(1500)
    }
  },
}
const movingPhone = {
  async phoneKaraoke(s) {
    await player(s, 42)
    await button(s, /^Karaoke/); await wait(6000)
    await button(s, /^Visualizer$/); await wait(6000); await s.shot('phone-karaoke')
  },
}
for (const [form, scenes, motion] of [['desktop', desktop], ['phone', phone], ['desktop', moving, true], ['phone', movingPhone, true]]) {
  const run = Object.entries(scenes).filter(([k]) => !only || only.includes(k))
  if (!run.length) continue
  const s = await context(form, motion)
  for (const [name, fn] of run) { try { await fn(s) } catch (e) { console.log('FAILED', name, e.message.split('\n')[0]) } }
  await s.ctx.close()
}
await browser.close()
