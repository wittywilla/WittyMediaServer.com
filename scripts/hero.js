// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 WittyWilla and contributors
// The headline's second line goes back and forth between being at home and being
// away: a cursor erases "at home." back to its "a" and types "away, anywhere.",
// then back again. Quicker than the name in the top bar (scripts/brand.js), which
// changes only now and then. Nothing moves for anyone who asks for reduced motion,
// and screen readers hear both lines once, from the hidden label beside it.
(() => {
  'use strict'
  const box = document.querySelector('.hero h1 .hero-type')
  if (!box || !window.matchMedia || matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const LINES = ['Right at home.', 'Right away, anywhere.']
  const HOLD_FIRST = 2600 // before the first change
  const HOLD = 3200       // each line, once typed
  const TYPE = 48, ERASE = 26 // ms a character: about twice the top bar's pace

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
  const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
  const show = (s, caret) => { box.innerHTML = esc(s) + (caret ? '<i class="type-caret"></i>' : '') }

  // The taller of the two lines decides the space the headline takes at this width, so
  // nothing below it moves when a narrow screen wraps the longer one.
  const holder = box.parentElement
  const ghost = document.createElement('span')
  ghost.className = 'hero-measure'
  ghost.style.width = `${holder.getBoundingClientRect().width}px`
  holder.after(ghost)
  const fit = () => {
    ghost.style.width = `${holder.getBoundingClientRect().width}px`
    const tallest = Math.max(...LINES.map((l) => { ghost.textContent = l; return ghost.getBoundingClientRect().height }))
    box.style.minHeight = `${Math.ceil(tallest)}px`
  }
  box.style.display = 'block'
  fit()
  addEventListener('resize', fit)

  // Waits while the tab is hidden, or the headline is off screen.
  let seen = true
  if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { seen = e.isIntersecting }).observe(box)
  const ready = async () => { while (document.hidden || !seen) await sleep(400) }

  // Erases back to what the two lines share ("Right a"), then types the rest.
  const morph = async (from, to) => {
    let keep = 0
    while (keep < from.length && keep < to.length && from[keep] === to[keep]) keep++
    for (let n = from.length; n >= keep; n--) { show(from.slice(0, n), true); await sleep(ERASE) }
    await sleep(160)
    for (let n = keep; n <= to.length; n++) { show(to.slice(0, n), true); await sleep(TYPE + (Math.random() * 24 - 12)) }
  }

  const run = async () => {
    show(LINES[0], true)
    await sleep(HOLD_FIRST)
    for (let i = 0; ; i = (i + 1) % LINES.length) {
      await ready()
      await morph(LINES[i], LINES[(i + 1) % LINES.length])
      await sleep(HOLD)
    }
  }
  run()
})()
