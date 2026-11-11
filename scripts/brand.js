// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 WittyWilla and contributors
// The name in the top bar, now and then, types itself into the kind of name
// people give their own servers ("Dave’sMediaServer"), then back again.
// WittyMediaServer stays up far longer than any joke name. Nothing moves for
// anyone who asks for reduced motion, and screen readers always hear the real
// name from the link's label.
(() => {
  'use strict'
  const box = document.querySelector('.topbar .brand > span')
  if (!box || !window.matchMedia || matchMedia('(prefers-reduced-motion: reduce)').matches) return

  // [before, highlighted, after]: the highlighted part takes the accent, as "Media" does.
  const HOME = ['Witty', 'Media', 'Server']
  const NAMES = [
    ['Dave’s', 'Media', 'Server'],
    ['Grandma’s', 'Media', 'Server'],
    ['Priya’s', 'Media', 'Server'],
    ['Mum’s', 'Media', 'Server'],
    ['Alex’s', 'Media', 'Server'],
    ['TheBasement', 'Media', 'Server'],
    ['Dorm', 'Room', 'Cinema'],
    ['Movie', 'Night', 'HQ'],
    ['The', 'Family', 'Vault'],
    ['Sam’s', 'Secret', 'Stash'],
    ['Couch', 'Cinema', ''],
    ['Binge', 'Station', ''],
    ['TheShed', 'Media', 'Server'],
    ['Nan’s', 'DVD', 'Shelf'],
    ['Not', 'Another', 'Subscription'],
  ]
  const HOLD_HOME_FIRST = 9000   // before the first change
  const HOLD_HOME = 16000        // the real name, between jokes
  const HOLD_JOKE = 2800         // a joke name
  const TYPE = 75, ERASE = 40    // ms a character

  const text = (p) => p.join('')
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
  const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

  // Shows the first n characters of a name, with "Media" (or its stand-in) in the accent.
  const html = (p, n, typing) => {
    const a = p[0].length, b = a + p[1].length
    const t = text(p).slice(0, n)
    return esc(t.slice(0, a)) + (n > a ? `<b>${esc(t.slice(a, b))}</b>` : '') + esc(t.slice(b)) + (typing ? '<i class="caret" aria-hidden="true"></i>' : '')
  }
  const show = (p, n, typing) => { box.innerHTML = html(p, n, typing) }

  // Only names that fit in about the space of the real one, so the menu beside it never jumps.
  // Measured on an invisible copy, so the real name never flickers.
  const ghost = box.cloneNode(false)
  ghost.setAttribute('aria-hidden', 'true')
  ghost.className = 'brand-measure'
  box.after(ghost)
  const measure = (p) => { ghost.innerHTML = html(p, text(p).length, false); return ghost.getBoundingClientRect().width }
  const home = measure(HOME)
  const fits = NAMES.filter((p) => measure(p) <= home * 1.12)
  ghost.remove()
  box.style.minWidth = `${Math.ceil(home)}px`
  if (!fits.length) return

  // Waits while the tab is hidden, or while someone's pointing at or focused on the name.
  const link = box.closest('a')
  let held = false
  link.addEventListener('pointerenter', () => { held = true })
  link.addEventListener('pointerleave', () => { held = false })
  link.addEventListener('focus', () => { held = true })
  link.addEventListener('blur', () => { held = false })
  const ready = async () => { while (document.hidden || held) await sleep(400) }

  // Erases back to what two names share, then types the rest.
  const morph = async (from, to) => {
    const a = text(from), b = text(to)
    let keep = 0
    while (keep < a.length && keep < b.length && a[keep] === b[keep]) keep++
    for (let n = a.length; n >= keep; n--) { show(from, n, true); await sleep(ERASE) }
    await sleep(220)
    for (let n = keep; n <= b.length; n++) { show(to, n, true); await sleep(TYPE + (Math.random() * 40 - 20)) }
  }

  let last = -1
  const loop = async () => {
    await sleep(HOLD_HOME_FIRST)
    for (;;) {
      await ready()
      let i
      do i = Math.floor(Math.random() * fits.length); while (fits.length > 1 && i === last)
      last = i
      await morph(HOME, fits[i])
      await sleep(HOLD_JOKE)
      await morph(fits[i], HOME)
      show(HOME, text(HOME).length, false)
      await sleep(HOLD_HOME)
    }
  }
  loop()
})()
