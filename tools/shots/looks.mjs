// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 WittyWilla and contributors
// Takes Home in each experience x theme, desktop and phone, from the website's test server.
//   node looks.mjs <out> [exp,exp] [theme,theme] [desktop,phone]
import { mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { createRequire } from 'node:module'
process.env.PLAYWRIGHT_BROWSERS_PATH ||= (process.env.PLAYWRIGHT_DIR || 'D:/build-tools/site-audit/') + 'browsers'
const { chromium } = createRequire(process.env.PLAYWRIGHT_DIR || 'D:/build-tools/site-audit/')('playwright')

const SERVER = process.env.WMS_SERVER || 'http://site.localhost:19490'
const [out = 'looks', exps, thms, forms] = process.argv.slice(2)
const EXPS = exps ? exps.split(',') : ['lumen', 'rail', 'stage', 'aero', 'classic', 'classicCable', 'classicSatellite', 'compact', 'paper', 'marquee', 'crossbar', 'bigpicture', 'dashboard', 'retro']
const THEMES = thms ? thms.split(',') : ['default', 'light', 'midnight', 'oled', 'evergreen', 'paper', 'contrast', 'cinema', 'aeroday', 'aeroaurora', 'aeromeadow', 'aerosunset', 'cable', 'satellite', 'teletext']
const FORMS = forms ? forms.split(',') : ['desktop', 'phone']
const SKIP = process.env.SKIP_EXISTING === '1'
const PATH = process.env.WMS_PATH || '/'
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

const SIZES = {
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, isMobile: false, hasTouch: false },
  phone: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36' },
}
const browser = await chromium.launch({ timeout: 180000 })
let token = ''
for (const form of FORMS) {
  const ctx = await browser.newContext({ ...SIZES[form], reducedMotion: 'reduce' })
  const page = await ctx.newPage()
  page.setDefaultTimeout(90000)
  await page.goto(SERVER + '/help', { waitUntil: 'domcontentloaded' })
  if (!token) token = (await page.evaluate((pw) => fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'owner', password: pw }) }).then((r) => r.json()), process.env.WMS_PASSWORD)).token
  await page.evaluate((t) => localStorage.setItem('wms.token', t), token)
  const call = (method, path, body) => page.evaluate(async ([method, path, body]) => { const r = await fetch('/api' + path, { method, headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('wms.token') }, body: body ? JSON.stringify(body) : undefined }); return [r.status, await r.text()] }, [method, path, body])
  await page.goto(SERVER + '/', { waitUntil: 'load' }); await wait(3000)
  for (let i = 0; i < 4; i++) { const b = page.getByRole('button', { name: 'Dismiss' }).first(); if (await b.count()) { await b.click(); await wait(800) } }
  for (const exp of EXPS) {
    const r = await call('PUT', `/sdui/experience?formFactor=${form === 'desktop' ? 'web' : form}&platform=web`, { experience: exp })
    if (r[0] >= 300) console.log('experience', exp, form, r)
    for (const theme of THEMES) {
      const dir = join(out, form, exp)
      const file = join(dir, `${theme}.png`)
      if (SKIP && existsSync(file)) continue
      mkdirSync(dir, { recursive: true })
      await page.evaluate((t) => localStorage.setItem('wms.theme', t), theme)
      await page.goto(SERVER + PATH, { waitUntil: 'load' })
      await wait(3000)
      await page.evaluate(async () => {
        await document.fonts?.ready
        const imgs = [...document.images].filter((i) => { const r = i.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0 })
        await Promise.all(imgs.map((i) => i.complete ? 0 : new Promise((d) => { i.onload = i.onerror = d; setTimeout(d, 5000) })))
      })
      await page.mouse.move(2, 2)
      await wait(600)
      await page.screenshot({ path: file })
      console.log('shot', form, exp, theme)
    }
  }
  await ctx.close()
}
await browser.close()
