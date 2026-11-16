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

  // Only names about the size of the real one are used, and the name gets one fixed width: the
  // widest of them with the cursor after it. Whatever is showing, the menu beside it never moves.
  // Measured on an invisible copy, so the real name never flickers, and again once the font has
  // loaded and whenever the window's size changes, since both change how wide a name is.
  let fits = []
  const fit = () => {
    const ghost = document.createElement('span')
    ghost.setAttribute('aria-hidden', 'true')
    ghost.className = 'brand-measure'
    box.after(ghost)
    const measure = (p, caret) => { ghost.innerHTML = html(p, text(p).length, caret); return ghost.getBoundingClientRect().width }
    const home = measure(HOME, false)
    fits = NAMES.filter((p) => measure(p, false) <= home * 1.12)
    const widest = Math.max(home, ...[HOME, ...fits].map((p) => measure(p, true)))
    const homeOnly = measure(HOME, true)
    ghost.remove()
    box.style.width = `${Math.ceil(widest)}px`
    // On a very narrow screen with no room for the wider space, it stays WittyMediaServer.
    const bar = box.closest('.wrap')
    if (bar && bar.scrollWidth > bar.clientWidth + 1) { fits = []; box.style.width = `${Math.ceil(homeOnly)}px` }
  }
  fit()
  document.fonts?.ready.then(fit)
  let pending = 0
  addEventListener('resize', () => { cancelAnimationFrame(pending); pending = requestAnimationFrame(fit) })

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
      if (!fits.length) { await sleep(HOLD_HOME); continue }
      let i
      do i = Math.floor(Math.random() * fits.length); while (fits.length > 1 && i === last)
      last = i
      const name = fits[i] // the list can change while it's showing, if the window is resized
      await morph(HOME, name)
      await sleep(HOLD_JOKE)
      await morph(name, HOME)
      show(HOME, text(HOME).length, false)
      await sleep(HOLD_HOME)
    }
  }
  loop()
})()
