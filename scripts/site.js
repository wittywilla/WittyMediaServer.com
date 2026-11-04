// wittymediaserver.com: the few things that need a script. Every page works
// without it; this adds the theme picker, the phone menu, filters, the picture
// viewer, copy buttons, and a check for anything newer on GitHub.
(() => {
  'use strict'
  const $ = (s, el = document) => el.querySelector(s)
  const $$ = (s, el = document) => [...el.querySelectorAll(s)]
  const root = document.documentElement
  const KEY = 'wms-site-theme'
  const store = {
    get: (k) => { try { return localStorage.getItem(k) } catch { return null } },
    set: (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v) } catch {} },
  }
  const session = {
    get: (k) => { try { return JSON.parse(sessionStorage.getItem(k)) } catch { return null } },
    set: (k, v) => { try { sessionStorage.setItem(k, JSON.stringify(v)) } catch {} },
  }

  // ---------- themes ----------
  const light = matchMedia('(prefers-color-scheme: light)')
  const autoTheme = () => (light.matches ? 'light' : 'default')
  const current = () => store.get(KEY) || autoTheme()

  // Screenshots taken in the chosen theme replace the house ones where they exist.
  const swapShots = (theme) => {
    for (const img of $$('img[data-shot]')) {
      const has = (img.dataset.themed || '').split(' ').includes(theme)
      const src = has ? `/images/shots/${theme}/${img.dataset.shot}.webp` : `/images/shots/${img.dataset.shot}.webp`
      if (img.getAttribute('src') !== src) img.setAttribute('src', src)
    }
  }

  const applyTheme = (theme) => {
    root.dataset.theme = theme
    const meta = $('meta[name="theme-color"]')
    if (meta) meta.content = getComputedStyle(root).getPropertyValue('--bg').trim() || meta.content
    for (const b of $$('.swatch')) b.setAttribute('aria-checked', String(b.dataset.theme === theme))
    const auto = $('.themes-pop .auto')
    if (auto) auto.disabled = !store.get(KEY)
    swapShots(theme)
  }
  applyTheme(current())
  light.addEventListener?.('change', () => { if (!store.get(KEY)) applyTheme(autoTheme()) })

  const pop = $('#themes')
  const themeBtn = $('[data-theme-btn]')
  const closePop = () => { pop?.removeAttribute('open'); themeBtn?.setAttribute('aria-expanded', 'false') }
  themeBtn?.addEventListener('click', (e) => {
    e.stopPropagation()
    const open = !pop.hasAttribute('open')
    if (open) { pop.setAttribute('open', ''); themeBtn.setAttribute('aria-expanded', 'true'); ($('.swatch[aria-checked="true"]', pop) || $('.swatch', pop))?.focus() } else closePop()
  })
  pop?.addEventListener('click', (e) => {
    e.stopPropagation()
    const sw = e.target.closest('.swatch')
    if (sw) { store.set(KEY, sw.dataset.theme); applyTheme(sw.dataset.theme) }
    if (e.target.closest('.auto')) { store.set(KEY, null); applyTheme(autoTheme()) }
  })
  pop?.addEventListener('keydown', (e) => {
    const list = $$('.swatch', pop)
    const i = list.indexOf(document.activeElement)
    if (i < 0) return
    const step = { ArrowRight: 1, ArrowDown: 2, ArrowLeft: -1, ArrowUp: -2 }[e.key]
    if (step) { e.preventDefault(); list[(i + step + list.length) % list.length].focus() }
  })
  document.addEventListener('click', closePop)
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && pop?.hasAttribute('open')) { closePop(); themeBtn?.focus() } })
  // Footer links can open the picker too.
  for (const a of $$('[data-open-themes]')) a.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); scrollTo({ top: 0 }); themeBtn?.click() })

  // ---------- the phone menu ----------
  const menuBtn = $('.menu-btn'), drawer = $('#drawer'), scrim = $('.scrim')
  const setMenu = (open) => {
    if (!drawer) return
    drawer.classList.toggle('open', open); scrim?.classList.toggle('open', open)
    menuBtn.setAttribute('aria-expanded', String(open))
    menuBtn.innerHTML = open ? menuBtn.dataset.close : menuBtn.dataset.open
    drawer.inert = !open
  }
  if (drawer) { drawer.inert = true; menuBtn.dataset.open = menuBtn.innerHTML }
  menuBtn?.addEventListener('click', () => setMenu(!drawer.classList.contains('open')))
  scrim?.addEventListener('click', () => setMenu(false))
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && drawer?.classList.contains('open')) { setMenu(false); menuBtn.focus() } })
  matchMedia('(min-width: 900px)').addEventListener?.('change', (m) => { if (m.matches) setMenu(false) })

  // ---------- copy buttons ----------
  for (const b of $$('[data-copy]')) {
    b.hidden = !navigator.clipboard
    b.addEventListener('click', async () => {
      const text = $(b.dataset.copy)?.innerText
      if (!text) return
      try {
        await navigator.clipboard.writeText(text.trim())
        const was = b.innerHTML; b.innerHTML = b.dataset.done; b.setAttribute('aria-label', 'Copied')
        setTimeout(() => { b.innerHTML = was; b.setAttribute('aria-label', 'Copy') }, 1600)
      } catch {}
    })
  }

  // ---------- filters: modules, news, gallery ----------
  for (const box of $$('[data-filter-list]')) {
    const list = $(box.dataset.filterList)
    const items = $$('[data-tags]', list)
    const chips = $$('.chip[data-value]', box)
    const input = $('input[type="search"]', box)
    const empty = $(box.dataset.empty || '#none')
    const count = $('[data-count]', box)
    const param = box.dataset.param || 'show'
    let value = new URLSearchParams(location.search).get(param) || 'all'
    if (!chips.some((c) => c.dataset.value === value)) value = 'all'
    const run = () => {
      const q = (input?.value || '').trim().toLowerCase()
      let shown = 0
      for (const it of items) {
        const ok = (value === 'all' || it.dataset.tags.split(' ').includes(value)) && (!q || (it.dataset.text || it.textContent).toLowerCase().includes(q))
        it.hidden = !ok
        if (ok) shown++
      }
      for (const c of chips) c.setAttribute('aria-pressed', String(c.dataset.value === value))
      if (empty) empty.hidden = shown > 0
      if (count) count.textContent = shown === 1 ? '1 shown' : `${shown} shown`
      // Groups whose items are all hidden hide too.
      for (const g of $$('[data-group]', list)) g.hidden = !$$('[data-tags]', g).some((x) => !x.hidden)
    }
    for (const c of chips) c.addEventListener('click', () => {
      value = c.dataset.value
      const u = new URL(location.href)
      value === 'all' ? u.searchParams.delete(param) : u.searchParams.set(param, value)
      history.replaceState(null, '', u)
      run()
    })
    input?.addEventListener('input', run)
    box.hidden = false
    run()
  }

  // ---------- downloads: point out the visitor's own system ----------
  const sysGuess = (() => {
    const ua = navigator.userAgent, p = navigator.userAgentData?.platform || navigator.platform || ''
    if (/android/i.test(ua)) return 'android'
    if (/iphone|ipad|ipod/i.test(ua)) return 'ios'
    if (/win/i.test(p) || /windows/i.test(ua)) return 'windows'
    if (/mac/i.test(p) || /mac os/i.test(ua)) return 'macos'
    if (/freebsd/i.test(ua)) return 'freebsd'
    if (/linux|x11/i.test(p + ua)) return 'linux'
    return null
  })()
  if (sysGuess) {
    for (const card of $$(`[data-system="${sysGuess}"]`)) {
      card.classList.add('mine')
      const tag = $('.yours', card); if (tag) tag.hidden = false
      card.parentElement?.prepend(card)
    }
    for (const el of $$(`[data-for-system="${sysGuess}"]`)) el.hidden = false
  }
  // Product tabs on the download page.
  const tabs = $('[data-tabs]')
  if (tabs) {
    const links = $$('a[href^="#"]', tabs)
    const panels = links.map((a) => $(a.getAttribute('href')))
    const show = (id, focus) => {
      links.forEach((a, i) => {
        const on = a.getAttribute('href') === `#${id}`
        a.setAttribute('aria-selected', String(on))
        a.tabIndex = on ? 0 : -1
        if (panels[i]) panels[i].hidden = !on
        if (on && focus) a.focus()
      })
    }
    tabs.setAttribute('role', 'tablist')
    links.forEach((a, i) => {
      a.setAttribute('role', 'tab'); panels[i]?.setAttribute('role', 'tabpanel')
      a.addEventListener('click', (e) => { e.preventDefault(); show(a.hash.slice(1)); history.replaceState(null, '', a.hash) })
      a.addEventListener('keydown', (e) => {
        const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key]
        if (d) { e.preventDefault(); show(links[(i + d + links.length) % links.length].hash.slice(1), true) }
      })
    })
    const start = location.hash.slice(1)
    show(links.some((a) => a.hash === `#${start}`) ? start : links[0].hash.slice(1))
  }

  // ---------- the picture viewer ----------
  const viewer = $('#viewer')
  if (viewer && viewer.showModal) {
    const zooms = $$('button.zoom')
    let at = 0
    const show = (i) => {
      at = (i + zooms.length) % zooms.length
      const b = zooms[at], img = $('img', b)
      $('img', viewer).src = img.currentSrc || img.src
      $('img', viewer).alt = img.alt
      $('figcaption', viewer).innerHTML = b.closest('figure')?.querySelector('.cap')?.innerHTML || ''
    }
    zooms.forEach((b, i) => b.addEventListener('click', () => { show(i); viewer.showModal() }))
    $('.prev', viewer)?.addEventListener('click', () => show(at - 1))
    $('.next', viewer)?.addEventListener('click', () => show(at + 1))
    $('.close', viewer)?.addEventListener('click', () => viewer.close())
    viewer.addEventListener('click', (e) => { if (e.target === viewer || e.target.matches('figure')) viewer.close() })
    viewer.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') show(at + 1)
      if (e.key === 'ArrowLeft') show(at - 1)
    })
    if (zooms.length < 2) $$('.nav-btn', viewer).forEach((b) => (b.hidden = true))
  } else for (const b of $$('button.zoom')) b.disabled = true

  // ---------- anything newer on GitHub? ----------
  // The pages were made when the site was last built. This asks GitHub, at most
  // every ten minutes per visit, whether a release has come out since.
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
  const day = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
  const getJSON = async (url) => {
    const hit = session.get(url)
    if (hit && Date.now() - hit.at < 600000) return hit.data
    const r = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } })
    if (!r.ok) throw new Error(r.status)
    const data = await r.json()
    session.set(url, { at: Date.now(), data })
    return data
  }
  for (const box of $$('[data-live-releases]')) {
    const repos = box.dataset.liveReleases.split(' ')
    const known = new Set((box.dataset.known || '').split(' '))
    const built = box.dataset.built
    const list = $(box.dataset.list || '.feed', box.closest('section') || document)
    const note = $('.live-note', box.closest('section') || document)
    Promise.all(repos.map((repo) => getJSON(`https://api.github.com/repos/${repo}/releases?per_page=6`).then((rs) => rs.map((r) => ({ ...r, repo })))))
      .then((all) => {
        const fresh = all.flat().filter((r) => !r.draft && !known.has(`${r.repo}@${r.tag_name}`) && r.published_at > built)
          .sort((a, b) => b.published_at.localeCompare(a.published_at))
        for (const r of fresh.reverse()) {
          const name = r.repo.split('/')[1]
          const v = r.tag_name.replace(/^v(?=\d)/, '')
          const el = document.createElement('article')
          el.className = 'entry new'
          el.dataset.tags = 'release ' + name.toLowerCase()
          el.innerHTML = `<div class="when"><span class="pill">New</span><time datetime="${esc(r.published_at)}">${esc(day(r.published_at))}</time></div>` +
            `<div><h3><a href="${esc(r.html_url)}">${esc(name)} ${esc(v)}</a></h3><p>Just published on GitHub. Its page on this site comes with the next update.</p></div>` +
            `<svg class="i arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`
          list?.prepend(el)
        }
        if (note) note.textContent = fresh.length ? `${fresh.length === 1 ? 'One release' : fresh.length + ' releases'} came out on GitHub since this page was made.` : 'Checked GitHub just now. Nothing newer.'
      })
      .catch(() => { if (note) note.textContent = '' })
  }
  const catBox = $('[data-catalog-live]')
  if (catBox) {
    getJSON(catBox.dataset.catalogLive).then((c) => {
      if (c && +c.serial > +catBox.dataset.serial) {
        catBox.hidden = false
        $('[data-catalog-msg]', catBox).textContent = `The catalog has changed since this page was made (version ${c.serial}, this page shows ${catBox.dataset.serial}). Your server's store always shows the newest.`
      }
    }).catch(() => {})
  }
})()
