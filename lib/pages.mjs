// Every page on the site. Each function returns { path, html }.
import { esc, join, longDate, shortDate, isoDate, size } from './util.mjs'
import { render, inline, plain } from './markdown.mjs'
import { classify, recommended } from './downloads.mjs'
import { ticker as promiseTicker, section as promiseSection } from './promises.mjs'
import {
  ctx, page, icon, ext, btn, shotImg, shotOf, windowShot, shotCard, viewer, credit, sectionHead, pageHead,
  entry, releaseSummary, moduleCard, moduleIcon, groupName, groupTag, DELIVERY,
} from './layout.mjs'

const d = () => ctx.d
const gh = (repo) => `https://github.com/${repo}`

// ======================================================================
// Home
// ======================================================================
export function home() {
  const { site, latest, news, releases, modules, shots } = d()
  const s = site.say
  const newest = news[0]
  const server = latest.server
  const versionLink = newest
    ? `<a class="version" href="/news/${newest.slug}/"><span class="pill">${newest.release ? esc(newest.release.version) : 'New'}</span>${esc(newest.title)}${icon('arrow')}</a>`
    : server ? `<a class="version" href="${server.path}"><span class="pill">${esc(server.version)}</span>The latest release${icon('arrow')}</a>` : ''

  const features = [
    ['film', 'Films and TV', 'Posters, plots and ratings, Continue watching, skip intro and instant seeking. No API key needed.', 'films'],
    ['disc', 'DVDs and Blu-rays', 'Disc images play like a disc player: intros, animated menus, scene selection, extras and the disc’s own subtitles.', 'discs'],
    ['tv', 'Live TV and channels', 'Channels made from your library in one press, a guide, tuners, IPTV and recording.', 'tv'],
    ['music', 'Music and audiobooks', 'Albums and artists, lyrics and karaoke, radio, podcasts, and books that remember your place.', 'music'],
    ['book', 'Books and comics', 'EPUB, PDF, comics and manga, with highlights, notes and a pen.', 'books'],
    ['photo', 'Photos and videos', 'A timeline, albums and an offline map, a feed of vertical videos, and creators’ videos by channel.', 'photos'],
    ['game', 'Games', 'Your own game files, played in a browser with a gamepad, keyboard or touch.', 'games'],
    ['users', 'Everyone at home', 'Who’s watching? profiles with their own progress, and Kids profiles that only show titles for their age.', 'everyone'],
  ]
  const shown = modules.filter((m) => m.latest && !m.core).slice(0, 12)
  const articles = news.slice(0, 2)
  const look = ['movies', 'tv-show-page', 'dvd-menu', 'wittytv-guide', 'music-visualizer', 'reader-comic'].filter(shotOf)

  const body = `
${promiseTicker(d().promises)}
<section class="hero">
  <div class="wrap">
    <p class="eyebrow">Self-hosted · Open source · Yours</p>
    <h1><span>Your media.</span><span class="accent">Right at home.</span></h1>
    <p class="lead">${esc(s.lead)}</p>
    <p class="sub">${esc(s.what)}</p>
    <div class="btn-row">
      ${btn('/download/', 'Download', { kind: 'primary large', iconName: 'download' })}
      ${btn('/server/', 'See what it does', { kind: 'large', iconName: 'arrow', after: true })}
    </div>
    ${versionLink}
    <div class="dots" aria-label="Runs on">${s.platforms.map((p) => `<span>${esc(p)}</span>`).join('')}</div>
    <div class="stage">${windowShot('home', { title: 'WittyMediaServer · Home', caption: 'A look inside WittyMediaServer', eager: true })}</div>
  </div>
</section>

${promiseSection(d().promises)}

<section class="section">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Everything in one place', title: 'One server for everything you keep', intro: `Point it at your folders. It finds what’s there, fetches the pictures and details, and keeps your place across every screen. ${esc(s.serverModules)}` })}
    <div class="features">
      ${features.map(([i, t, p, a]) => `<a class="f" href="/server/#${a}"><h3>${icon(i)}${esc(t)}</h3><p>${esc(p)}</p></a>`).join('\n      ')}
    </div>
    <div class="notice info mt-8">${icon('sparkle')}<p><strong>New to media servers?</strong> <a href="/start/">Start here</a>: what one is, what you need, your first hour, and the words you’ll see, in plain language.</p></div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="split">
      <div class="text">
        <p class="eyebrow">Discs, done properly</p>
        <h2>Real DVD and Blu-ray menus, in any browser</h2>
        <p>Keep your discs as images and play them the way a player would, on a phone, a laptop or the TV.</p>
        <ul class="ticks">
          <li>${icon('check')}<span>Intros, animated menus, scene selection and extras</span></li>
          <li>${icon('check')}<span>The disc’s own audio tracks, subtitles and angles</span></li>
          <li>${icon('check')}<span>DVDs, and Blu-rays including 4K and HDR</span></li>
          <li>${icon('check')}<span>Copy-protected discs are refused with a plain message. Nothing unlocks them</span></li>
        </ul>
        <div class="btn-row">${btn('/server/#discs', 'More about discs', { iconName: 'arrow', after: true })}</div>
      </div>
      ${windowShot('dvd-menu', { title: 'Sintel · DVD menu' })}
    </div>
  </div>
</section>

<section class="section tint">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Two parts, one setup', title: 'The server, and the apps that reach it', intro: 'The server holds your library, and any web browser at home can use it. The apps are optional.' })}
    <div class="grid two gap-lg duo">
      <article class="card">
        <div class="card-top"><span class="tile">${icon('server')}</span><span class="label">The server</span></div>
        <h3>WittyMediaServer</h3>
        <p>${esc(s.server)}</p>
        <p class="note">${esc(s.serverWhere)}</p>
        <div class="btn-row">
          ${btn('/server/', 'About the server', { kind: 'primary', iconName: 'arrow', after: true })}
          ${btn('/modules/', 'Browse modules', { kind: 'ghost' })}
        </div>
      </article>
      <article class="card">
        <div class="card-top"><span class="tile">${icon('devices')}</span><span class="label">The apps</span></div>
        <h3>WittyMediaClient</h3>
        <p>${esc(s.client)}</p>
        <p class="note">${esc(s.clientOptional)}</p>
        <div class="btn-row">
          ${btn('/client/', 'About the apps', { kind: 'primary', iconName: 'arrow', after: true })}
          ${btn('/download/#client', 'Get the apps', { kind: 'ghost' })}
        </div>
      </article>
    </div>
    <p class="mt-6 muted">There’s also <a href="/player/">WittyMediaPlayer</a>, for discs and files, and <a href="/reader/">WittyReader</a>, for books, PDFs and comics. ${esc(s.standalone)} <a href="/projects/">See every project</a>.</p>
  </div>
</section>

${shown.length ? `<section class="section">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Modules', title: 'Add only what you need', intro: esc(s.modules), more: '/modules/', moreLabel: `Browse all ${modules.length} modules` })}
    <div class="mod-strip">
      ${shown.map((m) => `<a href="/modules/${esc(m.id)}/">${m.icon64 ? `<img src="${m.icon64}" alt="" width="32" height="32" loading="lazy">` : icon('puzzle')}${esc(m.name)}</a>`).join('\n      ')}
    </div>
  </div>
</section>` : ''}

<section class="section">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Project updates', title: 'What’s new', more: '/news/', moreLabel: 'All news and releases' })}
    ${articles.length ? `<div class="grid two gap-lg news-cards">
      ${articles.map(articleCard).join('\n      ')}
    </div>` : ''}
    <div class="mt-8" ${liveAttrs()}>
      <p class="eyebrow plain">From GitHub releases</p>
      <div class="feed" id="home-feed">
        ${releases.slice(0, 4).map((r) => entry({ kind: 'release', item: r })).join('')}
      </div>
      <p class="live-note" aria-live="polite"></p>
    </div>
  </div>
</section>

${look.length ? `<section class="section tint">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'From the project', title: 'A look around', intro: `${esc(s.shotsNote)} ${esc(s.noMedia)}`, more: '/gallery/', moreLabel: 'View the gallery' })}
    <div class="shots three">
      ${look.map((id, i) => shotCard(id, i + 1)).join('\n      ')}
    </div>
    ${creditsLine()}
  </div>
</section>` : ''}

<section class="section">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Yours', title: 'It runs on your computer, for your home', intro: 'No accounts with anyone, no telemetry and no cloud. You add only media you have the right to use: see the <a href="/legal/">legal notes</a>.' })}
    <div class="grid four">
      ${[
        ['lock', 'Your computer', 'Your library stays on hardware you own. Other screens reach it over your own network.'],
        ['shield', 'Nothing reported', 'No telemetry. It goes online for posters and details and to look for updates, and Settings → Legal → Privacy lists every outside service and what turns it off.'],
        ['puzzle', 'Signed modules', 'Every module version is signed, checked before it runs, and removable without touching your media.'],
        ['heart', 'Open source', `The server is licensed under ${s.licence}, and every project’s source is on GitHub.`],
      ].map(([i, t, p]) => `<div class="card"><span class="tile muted">${icon(i)}</span><h3>${esc(t)}</h3><p>${esc(p)}</p></div>`).join('\n      ')}
    </div>
  </div>
</section>

${cta()}
${viewer()}
<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'WittyMediaServer', applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Windows, macOS, Linux, FreeBSD', description: `${s.lead} ${s.what}`, url: site.url, license: 'https://www.apache.org/licenses/LICENSE-2.0',
    softwareVersion: server?.version, downloadUrl: `${site.url}/download/`, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  }).replace(/</g, '\\u003c')}</script>`
  return { path: '/', html: page({ path: '/', title: site.name, description: `${s.lead} ${s.what}`, body, active: '/' }) }
}

function cta() {
  const { site } = d()
  return `<section class="section">
  <div class="wrap">
    <div class="cta">
      <h2>Try it on a computer you already have</h2>
      <p>Install the server, open its page in a browser, and point it at a folder of films. Setup takes a few minutes.</p>
      <div class="btn-row">
        ${btn('/download/', 'Download', { kind: 'primary large', iconName: 'download' })}
        ${btn('/start/', 'New to media servers?', { kind: 'large', iconName: 'arrow', after: true })}
      </div>
    </div>
  </div>
</section>`
}

/** The line under pictures of the test server. */
function creditsLine() {
  return `<p class="credits-line">Every work on that server is named, with its licence, in ${ext(d().site.docs.credits, 'the credits')}.</p>`
}

function articleCard(a) {
  return `<article class="card link">
  ${a.image && shotOf(a.image) ? shotImg(a.image, { alt: '' }) : ''}
  <div class="body">
    <div class="when"><time datetime="${isoDate(a.date)}">${longDate(a.date)}</time>${a.release ? `<span class="pill mono">${esc(a.release.version)}</span>` : ''}</div>
    <h3><a class="cover" href="/news/${a.slug}/">${esc(a.title)}</a></h3>
    <p>${esc(a.summary)}</p>
    <span class="go">Read it${icon('arrow')}</span>
  </div>
</article>`
}

/** Articles and releases together, newest first. A release with its own article is left to the article. */
function mixed() {
  const { news, releases } = d()
  return [
    ...news.map((n) => ({ kind: 'article', date: n.release ? n.release.date : n.date, item: n })),
    ...releases.filter((r) => !r.article).map((r) => ({ kind: 'release', date: r.date, item: r })),
  ].sort((a, b) => String(b.date).localeCompare(String(a.date)) || (a.kind === 'article' ? -1 : 1))
}

function liveAttrs() {
  const { site, releases } = d()
  const repos = ['server', 'client', 'player', 'reader'].map((k) => site.repos[k])
  const known = releases.map((r) => `${r.repo}@${r.tag}`).join(' ')
  return `data-live-releases="${repos.join(' ')}" data-known="${esc(known)}" data-built="${ctx.built}" data-list=".feed"`
}

// ======================================================================
// The server
// ======================================================================
export function server() {
  const { site, latest } = d()
  const s = site.say
  const r = latest.server
  const sections = [
    { id: 'films', icon: 'film', eyebrow: 'Films and TV', title: 'Your films and shows, looked after', shot: 'tv-show-page',
      text: 'Posters, plots, cast and ratings arrive with no API key, and you can add free keys or your own sources for more. Everything you watch picks up where you left off, on any screen.',
      ticks: ['Continue watching, skip intro and instant seeking', 'Collections, including smart ones that fill themselves', 'Details from files beside your media, or looked up for you', 'Converts video only when a device needs it'] },
    { id: 'discs', icon: 'disc', eyebrow: 'Discs', title: 'DVDs and Blu-rays, with their real menus', shot: 'dvd-menu',
      text: 'With the WittyDVD and WittyBluray modules, disc images and folders play like a disc player: the intro, the animated menu, scene selection, extras, and the disc’s own audio and subtitles. No mounting, no ripping to files first. Blu-rays have been tested on custom-made discs, so retail discs may show problems not seen yet.',
      ticks: ['DVD images and VIDEO_TS folders, with menus, chapters and angles', 'Blu-ray images and BDMV folders, including 4K and HDR', 'Audio CD images, played gapless in an on-screen CD player', 'Copy-protected discs are refused with a plain message. Nothing unlocks them'] },
    { id: 'tv', icon: 'tv', eyebrow: 'Live TV and channels', title: 'Channels made from your own library', shot: 'wittytv-guide',
      text: 'WittyTV turns your libraries into channels in one press, with a guide that looks like real TV, and needs no extra hardware. Add the WittyTuner module for live TV and recording from network tuners and IPTV playlists. IPTV has been tested with local streams; tuners and capture cards haven’t been tried on real hardware yet.',
      ticks: ['Guide looks of its own: modern, classic, teletext and more', 'Network tuners, IPTV playlists and capture cards', 'Recording from tuner channels, with a list of what’s been recorded', 'Encrypted channels are refused, never decrypted'] },
    { id: 'music', icon: 'music', eyebrow: 'Music and audiobooks', title: 'Everything you listen to', shot: 'music-visualizer',
      text: 'Albums and artists, internet radio, podcasts you follow, and audiobooks that remember your place. Sing along with lyrics and karaoke, or watch WittyVisualizer’s light shows.',
      ticks: ['Albums, artists and playlists', 'Lyrics and karaoke', 'Podcasts, downloaded for you', 'Audiobooks that remember your place'] },
    { id: 'books', icon: 'book', eyebrow: 'Books and comics', title: 'A reader for every kind of book', shot: 'reader-comic',
      text: 'Read EPUB books, PDFs, comics and manga in the browser, with highlights, notes, definitions and a pen. Your place follows you from screen to screen.',
      ticks: ['EPUB with book view and typography', 'PDFs with selectable text, outline and search', 'Comics and manga, in either reading direction', 'Highlights, notes and handwriting'] },
    { id: 'photos', icon: 'photo', eyebrow: 'Photos and videos', title: 'Photos, and the videos people make', shot: 'photos',
      text: 'A timeline of your photos with albums and an offline map, a feed of vertical videos you swipe through, and creators’ videos grouped by who made them.',
      ticks: ['A timeline, albums and an offline map', 'RAW previews and camera details', 'Shorts in a feed you swipe through', 'Creator videos, music videos and concerts by channel'] },
    { id: 'games', icon: 'game', eyebrow: 'Games', title: 'Your own games, played in a browser', shot: 'gameplay-datastorm',
      text: 'WittyPlay runs your game files on the server and streams them to the page, so a phone or a TV can play them with a gamepad, keyboard or touch. WittyCouch plays games on a PC of your own that runs Sunshine. Neither has been tried with a real controller or a real gaming PC yet.',
      ticks: ['Games run on the server and stream to any screen', 'Gamepads, keyboards and touch controls', 'Games on your own PC through WittyCouch', 'You bring the games. None come with it'] },
  ]
  const platforms = r ? classify(r.assets).systems : []
  const body = `
${pageHead({
    eyebrow: 'The server', title: 'WittyMediaServer', lead: esc(s.server),
    buttons: [btn('/download/', 'Download', { kind: 'primary', iconName: 'download' }), btn(site.docs.gettingStarted, 'Getting started guide', { iconName: 'external', after: true, external: true }), btn(gh(site.repos.server), 'GitHub', { kind: 'ghost', iconName: 'github', external: true })].join(''),
    meta: r ? `<span class="pill mono">${esc(r.version)}</span><span>Released ${longDate(r.date)}</span><span>${esc(s.licence)}</span>` : '',
  })}
<section class="section">
  <div class="wrap">
    ${windowShot('home', { title: 'WittyMediaServer · Home', caption: 'Your libraries, on one screen', eager: true })}
    <p class="mt-6 lede">${esc(s.serverWhere)} ${esc(s.serverModules)}</p>
  </div>
</section>
<section class="section">
  <div class="wrap">
    ${sections.map((x, i) => `<div class="split${i % 2 ? ' flip' : ''}" id="${x.id}">
      <div class="text">
        <p class="eyebrow">${esc(x.eyebrow)}</p>
        <h2>${esc(x.title)}</h2>
        <p>${esc(x.text)}</p>
        <ul class="ticks">${x.ticks.map((t) => `<li>${icon('check')}<span>${esc(t)}</span></li>`).join('')}</ul>
      </div>
      ${windowShot(x.shot)}
    </div>`).join('\n    ')}
  </div>
</section>
<section class="section tint" id="everyone">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Everyone at home', title: 'One server, everyone’s own place', intro: 'Each person gets their own progress, lists and settings.' })}
    <div class="grid three">
      ${[
        ['users', 'Who’s watching?', 'Profiles with their own progress, favourites and game saves, each a tile to choose at home.'],
        ['shield', 'Kids profiles', 'Kids see only titles up to the age you choose. Titles with no rating stay hidden until you say otherwise.'],
        ['devices', 'Every screen', 'Phones, tablets, laptops and TVs with a web browser. The apps add more.'],
      ].map(([i, t, p]) => `<div class="card"><span class="tile">${icon(i)}</span><h3>${esc(t)}</h3><p>${esc(p)}</p></div>`).join('')}
    </div>
  </div>
</section>
<section class="section" id="modules">
  <div class="wrap">
    <div class="split">
      <div class="text">
        <p class="eyebrow">Modules</p>
        <h2>Start small, add what you want</h2>
        <p>${esc(s.modules)}</p>
        <ul class="ticks">
          <li>${icon('check')}<span>Signed, and checked before they run</span></li>
          <li>${icon('check')}<span>Added and updated without a restart</span></li>
          <li>${icon('check')}<span>Removing one leaves your media and history as they are</span></li>
        </ul>
        <div class="btn-row">${btn('/modules/', 'Browse modules', { kind: 'primary', iconName: 'arrow', after: true })}</div>
      </div>
      ${windowShot('module-store', { title: 'Settings · Modules' })}
    </div>
  </div>
</section>
${platforms.length ? `<section class="section tint" id="platforms">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Where it runs', title: 'Platforms and architectures', intro: `These are the files in ${esc(r.version)}. amd64 is most PCs; arm64 is Apple silicon and many small boards. ${esc(s.serverTested)}` })}
    <div class="platforms">
      ${platforms.map((p) => `<div class="card platform">
        <h3>${icon(p.icon)}${esc(p.name)}</h3>
        <p class="kinds">${esc([...new Set(p.files.map((f) => f.ext))].join(', '))}</p>
        <div class="archs">${p.archs.map((a) => `<span class="pill muted mono">${esc(a)}</span>`).join('')}</div>
      </div>`).join('\n      ')}
      <div class="card platform">
        <h3>${icon('container')}Docker</h3>
        <p class="kinds"><code>ghcr.io/wittywilla/wittymediaserver:alpha</code></p>
        <div class="archs"><span class="pill muted">Any architecture your host supports</span></div>
      </div>
    </div>
    <p class="mt-6 muted">FFmpeg comes with every download except FreeBSD on arm64, which needs <code>pkg install ffmpeg</code>. Phones, tablets and TVs need none of these: open the server’s address in a browser, or use <a href="/client/">WittyMediaClient</a>.</p>
  </div>
</section>` : ''}
<section class="section">
  <div class="wrap narrow">
    <div class="notice">${icon('sparkle')}<p>${esc(s.alpha)} ${esc(s.noMedia)} ${esc(s.encrypted)} <a href="/legal/">Legal notes</a>.</p></div>
  </div>
</section>
${cta()}`
  return { path: '/server/', html: page({ path: '/server/', title: 'The server', description: s.server, body, active: '/server/' }) }
}

// ======================================================================
// The apps (WittyMediaClient)
// ======================================================================
export function client() {
  const { site, latest } = d()
  const s = site.say
  const r = latest.client
  const systems = r ? classify(r.assets).systems : []
  const body = `
${pageHead({
    eyebrow: 'Desktop · Mobile · TV', title: 'WittyMediaClient', lead: esc(s.client),
    buttons: [btn('/download/#client', 'Download', { kind: 'primary', iconName: 'download' }), btn(gh(site.repos.client), 'GitHub', { kind: 'ghost', iconName: 'github', external: true })].join(''),
    meta: r ? `<span class="pill mono">${esc(r.version)}</span><span>Released ${longDate(r.date)}</span><span>${esc(s.licence)}</span>` : '',
  })}
<section class="section">
  <div class="wrap">
    <div class="notice info">${icon('sparkle')}<p><strong>Early days.</strong> ${esc(s.clientOptional)} ${esc(s.clientTested)} A web browser is the way to reach everything today.</p></div>
    <div class="shots three mt-8">
      ${['client-home', 'phone-home', 'phone-guide'].map((id) => shotCard(id)).join('\n      ')}
    </div>
  </div>
</section>
<section class="section">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'What it does', title: 'A dedicated app, where it helps' })}
    <div class="grid two">
      ${[
        ['network', 'Finds your server', 'Finds it on your network, or takes its address, and signs in with a code or a password. It checks the server’s identity first.'],
        ['film', 'Plays films and shows', 'With resume, on the native apps. The desktop app is a window around the server’s own pages.'],
        ['tv', 'Remote, keyboard or touch', 'Built for the sofa as much as the desk: on a TV, the arrows and OK reach everything. Real TV remotes haven’t been tried yet.'],
        ['game', 'Games on your own PC', 'Through the server’s page where it can, with the separately installed Moonlight app as the fallback. Not yet tried against a real PC from these apps.'],
      ].map(([i, t, p]) => `<div class="card"><span class="tile">${icon(i)}</span><h3>${esc(t)}</h3><p>${esc(p)}</p></div>`).join('\n      ')}
    </div>
    <p class="mt-6 muted">The Android and Apple apps say plainly when something can’t play there yet. Music, podcasts, live TV, books, photos, disc menus and games on the server need the desktop app or a browser for now. There’s no telemetry: error reports go to the server you’re connected to, and its owner can turn them off.</p>
  </div>
</section>
<section class="section tint" id="platforms">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Platforms', title: 'Where the apps run', intro: 'One desktop app covers computers, and one Android app covers phones, tablets and TVs.' })}
    <div class="platforms">
      ${systems.map((p) => `<div class="card platform">
        <h3>${icon(p.icon)}${esc(p.name)}</h3>
        <p class="kinds">${esc(p.id === 'android' ? 'Phones, tablets, Android TV, Google TV and Fire TV (Fire OS 6 and later), Android 6 and later' : [...new Set(p.files.map((f) => f.ext))].join(', '))}</p>
        <div class="archs">${p.files.map((f) => f.archLabel).filter((v, i, a) => a.indexOf(v) === i).map((a) => `<span class="pill muted">${esc(a)}</span>`).join('')}</div>
      </div>`).join('\n      ')}
      <div class="card platform">
        <h3>${icon('phone')}iPhone, iPad and Apple TV</h3>
        <p class="kinds">Written in SwiftUI, never built. Nothing to download yet: use a browser on an iPhone or iPad. Apple TV has no browser, so it can’t reach the server yet.</p>
        <div class="archs"><span class="pill warn">Not built yet</span></div>
      </div>
      <div class="card platform">
        <h3>${icon('tv')}Plasma Bigscreen</h3>
        <p class="kinds">KDE’s TV interface, with the desktop app.</p>
        <div class="archs"><span class="pill muted">With the Linux app</span></div>
      </div>
    </div>
  </div>
</section>
<section class="section">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'In the repository', title: 'Where each app lives' })}
    <div class="grid three">
      ${[
        ['monitor', 'desktop/', 'Windows, macOS, Linux, FreeBSD and Plasma Bigscreen: a window around the server’s pages, in Electron.'],
        ['phone', 'android/', 'Android TV, Google TV, Fire TV, phones and tablets: Kotlin, Compose and Media3.'],
        ['tv', 'apple/', 'Apple TV, iPhone, iPad and Mac: SwiftUI and AVPlayer.'],
      ].map(([i, t, p]) => `<div class="card"><span class="tile muted">${icon(i)}</span><h3><code>${esc(t)}</code></h3><p>${esc(p)}</p></div>`).join('')}
    </div>
  </div>
</section>
${cta()}
${viewer()}`
  return { path: '/client/', html: page({ path: '/client/', title: 'WittyMediaClient', description: s.client, body, active: '/client/' }) }
}

// ======================================================================
// WittyMediaPlayer and WittyReader
// ======================================================================
export function player() {
  const { site, latest, repos } = d()
  const r = latest.player
  const body = `
${pageHead({
    eyebrow: 'Desktop player', title: 'WittyMediaPlayer', lead: esc(site.say.player),
    buttons: [r ? btn('/download/#player', 'Download', { kind: 'primary', iconName: 'download' }) : '', btn(gh(site.repos.player), 'Follow on GitHub', { kind: r ? 'ghost' : 'primary', iconName: 'github', external: true })].join(''),
    meta: r ? `<span class="pill mono">${esc(r.version)}</span><span>Released ${longDate(r.date)}</span>` : `<span class="pill warn">No release yet</span><span>Windows only for now</span>`,
  })}
<section class="section">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'What it does', title: 'Discs and files, on your own computer', intro: 'Using the same disc engines as WittyMediaServer, with no server and no account.' })}
    <div class="grid three">
      ${[
        ['disc', 'Real disc menus', 'DVDs and Blu-rays with their own menus: arrows, Enter and the mouse work the disc’s buttons, with title, chapter and angle controls.'],
        ['film', 'Ordinary files', 'MKV, MP4, AVI, WebM, MP3, FLAC and more, with audio and subtitle choice. Subtitle files beside a video are found by themselves.'],
        ['download', 'Straight from the drive', 'Plays from a disc drive, an .iso or .img image, or a VIDEO_TS or BDMV folder, and can copy a disc to one image to keep.'],
        ['music', 'Audio CDs', 'Plays and copies CDs on a CD screen of its own, to FLAC, ALAC, MP3, AAC, Opus and more, with tags and cover art.'],
        ['sparkle', 'WittyVisualizer', 'Seventeen light shows that follow the music, with a flash limiter and a calm mode. Off until you turn it on.'],
        ['lock', 'Keeps to itself', 'No telemetry. Nothing leaves your computer unless you press a button that says so.'],
      ].map(([i, t, p]) => `<div class="card"><span class="tile">${icon(i)}</span><h3>${esc(t)}</h3><p>${esc(p)}</p></div>`).join('\n      ')}
    </div>
  </div>
</section>
<section class="section tint">
  <div class="wrap narrow">
    <h2>Not yet</h2>
    <ul class="mt-4 prose">
      <li>Blu-ray menus written in Java don’t run. The disc plays its titles instead, and the window says so.</li>
      <li>Sound is stereo with the built-in playback. Surround tracks are mixed down, unless you choose to play through the VLC libraries you’ve installed yourself.</li>
      <li>Windows only for now, on Windows 10 version 1809 or newer. Nothing in the design stops other systems.</li>
      <li>Its installer has run under Wine, not on real Windows.</li>
    </ul>
    <p class="mt-6 muted">A copy-protected disc gets a plain message, and nothing here unlocks it. Thank you to VideoLAN and the VLC contributors: if VLC is installed, the player can use its libraries as an option. They aren’t included and aren’t needed.</p>
  </div>
</section>
${cta()}`
  return { path: '/player/', html: page({ path: '/player/', title: 'WittyMediaPlayer', description: site.say.player, body, active: '/player/' }) }
}

export function reader() {
  const { site, latest } = d()
  const r = latest.reader
  const body = `
${pageHead({
    eyebrow: 'Desktop reader', title: 'WittyReader', lead: esc(site.say.reader),
    buttons: [r ? btn('/download/#reader', 'Download', { kind: 'primary', iconName: 'download' }) : '', btn(gh(site.repos.reader), 'GitHub', { kind: 'ghost', iconName: 'github', external: true })].join(''),
    meta: r ? `<span class="pill mono">${esc(r.version)}</span><span>Released ${longDate(r.date)}</span><span>Windows, macOS and Linux</span>` : '<span class="pill warn">No release yet</span>',
  })}
<section class="section">
  <div class="wrap">
    <div class="shots">
      ${['reader-library', 'reader-book'].map((id) => shotCard(id)).join('\n      ')}
    </div>
  </div>
</section>
<section class="section">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'What it does', title: 'The Witty readers, on their own', intro: 'The same readers as WittyMediaServer, for when you don’t run a server.' })}
    <div class="grid three">
      ${[
        ['book', 'Books, PDFs and comics', 'EPUB with WittyEbook, PDFs with WittyPDF, and comics and manga with WittyComics.'],
        ['sparkle', 'Study tools', 'Highlights, notes, bookmarks, citations, reading aloud, and a pen with pressure, from WittyInk.'],
        ['list', 'Your library', 'Continue reading, search, filters, and covers and titles taken from the files themselves.'],
        ['lock', 'On your device', 'Books, positions and notes stay with you. The only outside request is a dictionary look-up, off until you turn it on.'],
        ['shield', 'Books can’t run code', 'EPUB files are sandboxed with scripts blocked, and PDF scripts and forms are off.'],
        ['copy', 'Notes go with you', 'Export a book’s notes and import them on another device, or save a readable summary.'],
      ].map(([i, t, p]) => `<div class="card"><span class="tile">${icon(i)}</span><h3>${esc(t)}</h3><p>${esc(p)}</p></div>`).join('\n      ')}
    </div>
    <p class="mt-6 muted">There are installers for Windows, macOS and Linux, and a copy on your own web server can be installed from a phone’s browser. The Windows installer has run under Wine, not on real Windows, and the Mac version hasn’t been run on a real Mac yet. WittyReader doesn’t connect to your server: to read books that are on it, open them in a browser.</p>
  </div>
</section>
${cta()}
${viewer()}`
  return { path: '/reader/', html: page({ path: '/reader/', title: 'WittyReader', description: site.say.reader, body, active: '/reader/' }) }
}

// ======================================================================
// Every project
// ======================================================================
export function projects() {
  const { projects: P, modules, latest, repos } = d()
  const byRepo = new Set(P.projects.map((p) => p.repo.toLowerCase()))
  const fromCatalog = modules.filter((m) => !byRepo.has(String(m.repo).toLowerCase())).map((m) => ({
    name: m.name, repo: m.repo, kind: m.latest ? 'module' : 'library', page: `/modules/${m.id}/`, summary: m.summary, module: m,
  }))
  const all = [...P.projects, ...fromCatalog]
  const versionOf = (p) => {
    const key = Object.entries(d().site.repos).find(([, r]) => r === p.repo)?.[0]
    if (key && latest[key]) return latest[key].version
    return p.module?.latest?.version || null
  }
  const card = (p) => {
    const v = versionOf(p)
    const live = repos[p.repo]?.exists !== false
    return `<article class="card project link">
    ${p.module ? moduleIcon(p.module, 44) : `<span class="tile${p.kind === 'planned' ? ' muted' : ''}">${icon(p.icon || 'layers')}</span>`}
    <h3>${p.page ? `<a href="${esc(p.page)}">${esc(p.name)}</a>` : `<a href="${gh(p.repo)}" rel="noopener">${esc(p.name)}</a>`}${v ? `<span class="pill mono">${esc(v)}</span>` : p.kind === 'planned' ? '<span class="pill muted">Not started</span>' : ''}</h3>
    <p>${esc(p.say ? d().site.say[p.say] : p.summary)}</p>
    ${live ? `<div class="links"><a href="${gh(p.repo)}" rel="noopener">${esc(p.repo)}</a></div>` : ''}
  </article>`
  }
  const body = `
${pageHead({ eyebrow: 'The whole project', title: 'Every project', lead: 'WittyMediaServer is made of many projects, each with its own repository, versions and releases. Here they all are.' })}
${P.groups.map((g) => {
    const list = all.filter((p) => p.kind === g.id)
    if (!list.length) return ''
    return `<section class="section" id="${g.id}">
  <div class="wrap">
    ${sectionHead({ title: g.title, intro: esc(g.intro) })}
    <div class="grid ${g.id === 'app' ? 'two' : 'three'}">
      ${list.map(card).join('\n      ')}
    </div>
  </div>
</section>`
  }).join('\n')}`
  return { path: '/projects/', html: page({ path: '/projects/', title: 'Every project', description: 'The server, its apps, its modules and the parts they’re built from, each a project of its own.', body, active: '/projects/' }) }
}

// ======================================================================
// Modules
// ======================================================================
export function modulesPage() {
  const { site, modules, catalog } = d()
  const listed = modules
  const groups = [...new Set(listed.map((m) => m.group || 'other'))].sort((a, b) => groupName(a).localeCompare(groupName(b)))
  const count = (g) => listed.filter((m) => (m.group || 'other') === g).length
  const body = `
${pageHead({
    eyebrow: 'Module catalog', title: 'Modules', lead: esc(site.say.modules),
    buttons: [btn(site.docs.modules, 'How modules work', { iconName: 'external', after: true, external: true }), btn(gh(site.repos.catalog), 'The catalog on GitHub', { kind: 'ghost', iconName: 'github', external: true })].join(''),
    meta: `<span>${listed.length} modules</span>${catalog.generated ? `<span>Catalog updated ${longDate(catalog.generated)}</span>` : ''}`,
  })}
<section class="section">
  <div class="wrap">
    <div class="notice info">${icon('puzzle')}<p>Nothing is installed from this page. On your server, an administrator adds modules from <strong>Settings → Modules → Browse the store</strong>, which reads this same catalog.</p></div>
    <div class="notice mt-4" data-catalog-live="${esc(site.catalogLive)}" data-serial="${esc(catalog.serial ?? 0)}" hidden>${icon('sparkle')}<p data-catalog-msg></p></div>
    <div class="toolbar mt-8" data-filter-list="#mods" data-empty="#mods-none" data-param="group" hidden>
      <div class="filters" role="group" aria-label="Show">
        <button type="button" class="chip" data-value="all" aria-pressed="true">All <span class="n">${listed.length}</span></button>
        ${groups.map((g) => `<button type="button" class="chip" data-value="${esc(g)}" aria-pressed="false">${esc(groupName(g))} <span class="n">${count(g)}</span></button>`).join('')}
      </div>
      <label class="search">${icon('search')}<span class="sr-only">Search modules</span><input type="search" placeholder="Search modules" autocomplete="off"></label>
    </div>
    <h2 class="sr-only">Every module</h2>
    <div class="mods" id="mods">
      ${listed.map(moduleCard).join('\n      ')}
    </div>
    <p class="empty mt-4" id="mods-none" hidden>No module matches that. Try another word, or show all.</p>
  </div>
</section>
<section class="section tint">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'How they work', title: 'Safe to add, easy to take away' })}
    <div class="grid three">
      ${[
        ['shield', 'Signed', 'Each version’s files are listed with their checksums, and the list is signed. The server checks both before anything runs.'],
        ['lock', 'Limited', 'A module lists what it asks for, such as the network or a folder of its own. The server keeps its own list of which modules may have each, and starts their programs in a sandbox where the system has one.'],
        ['puzzle', 'Yours to remove', 'Turn a module off or remove it whenever no library or other module needs it. Your media, watch history and settings stay as they are.'],
      ].map(([i, t, p]) => `<div class="card"><span class="tile">${icon(i)}</span><h3>${esc(t)}</h3><p>${esc(p)}</p></div>`).join('')}
    </div>
    <p class="mt-6 muted">Modules work with server 0.6.0-alpha and later. Each module page says which server versions it fits.</p>
  </div>
</section>`
  return { path: '/modules/', html: page({ path: '/modules/', title: 'Modules', description: site.say.modules, body, active: '/modules/' }) }
}

export function modulePage(m) {
  const { site, modules } = d()
  const v = m.latest
  const req = (m.requires || []).map((id) => modules.find((x) => x.id === id)).filter(Boolean)
  const usedBy = modules.filter((x) => (x.requires || []).includes(m.id))
  const fits = (x) => x.minServer ? `${x.minServer}${x.maxServer ? ` to ${x.maxServer}` : ' and later'}` : 'Any'
  const platformNames = (x) => Object.keys(x.platforms || {}).map((p) => p.replace('darwin', 'macOS').replace('windows', 'Windows').replace('linux', 'Linux').replace('freebsd', 'FreeBSD').replace('-', ' '))
  const PERMS = { programs: 'Other programs, such as FFmpeg', data: 'A folder of its own', network: 'The network', devices: 'This machine’s devices, such as a TV tuner' }
  const facts = [
    v && ['Version', `<span class="pill mono">${esc(v.version)}</span>${v.released ? ` <span class="muted">${longDate(v.released)}</span>` : ''}`],
    v && ['Works with', `Server ${esc(fits(v))}`],
    ['Group', esc(groupName(m.group))],
    m.publisher && ['Publisher', m.publisher.url ? ext(m.publisher.url, esc(m.publisher.name)) : esc(m.publisher.name)],
    v?.license && ['Licence', esc(v.license)],
    v?.delivery && ['How it runs', esc(DELIVERY[v.delivery] || v.delivery)],
    v?.permissions?.length && ['Asks for', `<ul>${v.permissions.map((p) => `<li>${esc(PERMS[p] || p)}</li>`).join('')}</ul>`],
    m.needs?.length && ['Needs', `<ul>${m.needs.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>`],
    req.length && ['Comes with', req.map((x) => `<a href="/modules/${x.id}/">${esc(x.name)}</a>`).join(', ')],
    usedBy.length && ['Used by', usedBy.map((x) => `<a href="/modules/${x.id}/">${esc(x.name)}</a>`).join(', ')],
    v?.platforms && ['Systems', esc(platformNames(v).join(', ') || 'Any')],
  ].filter(Boolean)
  const body = `
<header class="page-head">
  <div class="wrap">
    <a class="crumb" href="/modules/">${icon('back')}All modules</a>
    <div class="mod-head">
      ${m.icon64 ? `<img src="${m.icon64}" alt="" width="88" height="88">` : `<span class="tile">${icon('puzzle')}</span>`}
      <div class="stack tight">
        <p class="eyebrow">${esc(groupName(m.group))}</p>
        <h1>${esc(m.name)}</h1>
      </div>
    </div>
    <p class="lead">${esc(m.summary)}</p>
    <div class="btn-row">${m.repo ? btn(gh(m.repo), 'Repository', { kind: 'primary', iconName: 'github', external: true }) : ''}${m.repo && v ? btn(`${gh(m.repo)}/releases`, 'Releases', { kind: 'ghost', iconName: 'external', after: true, external: true }) : ''}</div>
  </div>
</header>
<section class="section">
  <div class="wrap layout-side">
    <div class="stack">
      <div class="prose">${render(m.description || m.summary)}</div>
      ${m.updates ? `<div class="prose"><h2>What an update to it changes</h2><p>${inline(m.updates)}</p></div>` : ''}
      ${m.stays ? `<div class="prose"><h2>What stays with the server</h2><p>${inline(m.stays)}</p></div>` : ''}
      ${m.versions?.length > 1 ? `<div class="prose"><h2>Versions</h2></div>
      <div class="table-wrap"><table><thead><tr><th>Version</th><th>Released</th><th>Works with server</th></tr></thead><tbody>
        ${m.versions.map((x) => `<tr><td><code>${esc(x.version)}</code></td><td>${x.released ? shortDate(x.released) : ''}</td><td>${esc(fits(x))}</td></tr>`).join('')}
      </tbody></table></div>` : ''}
      <div class="notice info mt-4">${icon('puzzle')}<p>${v ? `To add it, go to <strong>Settings → Modules → Browse the store</strong> on your server.` : `It comes inside the modules that use it, so there’s nothing to add.`}</p></div>
    </div>
    <aside><dl class="facts">${facts.map(([k, val]) => `<div><dt>${k}</dt><dd>${val}</dd></div>`).join('')}</dl></aside>
  </div>
</section>`
  return { path: `/modules/${m.id}/`, html: page({ path: `/modules/${m.id}/`, title: `${m.name}`, description: m.summary, body, active: '/modules/', image: m.icon64 || undefined }) }
}

// ======================================================================
// News, articles and releases
// ======================================================================
export function newsPage() {
  const { site, releases, news } = d()
  const items = mixed()
  const products = [...new Set(releases.map((r) => r.repoName))]
  const body = `
${pageHead({
    eyebrow: 'Project updates', title: 'News and releases', lead: 'Articles about what changed, and every release of the server and its apps, from GitHub.',
    buttons: btn('/news/feed.xml', 'News feed', { kind: 'ghost', iconName: 'feed' }),
  })}
<section class="section">
  <div class="wrap">
    ${news.length ? `<h2 class="sr-only">Latest articles</h2><div class="grid two gap-lg news-cards">${news.slice(0, 2).map(articleCard).join('')}</div>` : ''}
    <div class="mt-12" ${liveAttrs()}>
      <h2 class="sr-only">Everything, newest first</h2>
      <div class="toolbar" data-filter-list="#news-feed" data-empty="#news-none" data-param="show" hidden>
        <div class="filters" role="group" aria-label="Show">
          <button type="button" class="chip" data-value="all" aria-pressed="true">Everything</button>
          <button type="button" class="chip" data-value="article" aria-pressed="false">Articles</button>
          ${products.map((p) => `<button type="button" class="chip" data-value="${esc(p.toLowerCase())}" aria-pressed="false">${esc(p)}</button>`).join('')}
        </div>
      </div>
      <div class="feed" id="news-feed">
        ${items.map(entry).join('\n        ')}
      </div>
      <p class="empty mt-4" id="news-none" hidden>Nothing here yet.</p>
      <p class="live-note" aria-live="polite"></p>
    </div>
  </div>
</section>`
  return { path: '/news/', html: page({ path: '/news/', title: 'News and releases', description: 'News about WittyMediaServer, and every release of the server and its apps.', body, active: '/news/' }) }
}

export function articlePage(a) {
  const { site } = d()
  const r = a.release
  const body = `
<header class="page-head">
  <div class="wrap narrow">
    <a class="crumb" href="/news/">${icon('back')}All news</a>
    <p class="eyebrow">${r ? `${esc(r.productName)} ${esc(r.version)}` : 'Article'}</p>
    <h1>${esc(a.title)}</h1>
    <p class="lead">${esc(a.summary)}</p>
    <div class="meta"><time datetime="${isoDate(a.date)}">${longDate(a.date)}</time></div>
  </div>
</header>
<section class="section">
  <div class="wrap narrow">
    ${a.image && shotOf(a.image) ? windowShot(a.image, { eager: true }) + '<div class="mt-8"></div>' : ''}
    <div class="prose">${render(a.body)}</div>
    <div class="btn-row mt-8">
      ${r ? btn(r.path, `${r.productName} ${r.version}: notes and downloads`, { kind: 'primary', iconName: 'arrow', after: true }) : ''}
      ${btn('/news/', 'More news', { kind: 'ghost' })}
    </div>
  </div>
</section>`
  return { path: `/news/${a.slug}/`, html: page({ path: `/news/${a.slug}/`, title: a.title, description: a.summary, body, active: '/news/', type: 'article', image: a.image && shotOf(a.image) ? `/images/shots/${a.image}.webp` : undefined }) }
}

export function releasePage(r) {
  const { site, releases } = d()
  const files = classify(r.assets)
  const sameProduct = releases.filter((x) => x.repo === r.repo)
  const i = sameProduct.indexOf(r)
  const newer = sameProduct[i - 1], older = sameProduct[i + 1]
  const latestOfProduct = sameProduct[0] === r
  const link = (u) => (u.startsWith('http') || u.startsWith('#') || u.startsWith('/')) ? u : `https://github.com/${r.repo}/blob/${r.tag}/${u.replace(/^\.\//, '')}`
  const notes = r.notes ? render(r.notes, { headingShift: 1, link }) : ''
  const changes = r.changelog ? render(r.changelog, { headingShift: 1, link: (u) => (u.startsWith('http') || u.startsWith('#')) ? u : `https://github.com/${r.repo}/blob/${r.tag}/${u.startsWith('docs/') || u.includes('/') ? u : 'docs/' + u}` }) : ''
  const body = `
<header class="page-head">
  <div class="wrap">
    <a class="crumb" href="/news/">${icon('back')}All news</a>
    <p class="eyebrow">Release${r.prerelease ? ' · Alpha' : ''}</p>
    <h1>${esc(r.productName)} ${esc(r.version)}</h1>
    <p class="lead">${esc(releaseSummary(r))}</p>
    <div class="meta"><time datetime="${isoDate(r.date)}">${longDate(r.date)}</time>${latestOfProduct ? '<span class="pill ok">Latest</span>' : '<span class="pill muted">Older version</span>'}<a href="${esc(r.url)}" rel="noopener">On GitHub</a></div>
  </div>
</header>
<section class="section">
  <div class="wrap layout-side">
    <div class="stack">
      <h2 class="sr-only">Release notes</h2>
      ${r.article ? `<a class="card link" href="/news/${r.article.slug}/"><span class="label eyebrow plain">Article</span><h3>${esc(r.article.title)}</h3><p>${esc(r.article.summary)}</p><span class="go">Read it${icon('arrow')}</span></a>` : ''}
      ${notes ? `<div class="prose">${notes}</div>` : ''}
      ${changes ? `<div class="prose"><h2>Everything in this version</h2>${changes}</div>` : ''}
      ${r.prs.length ? `<div class="prose"><h2>Pull requests</h2><ul>${r.prs.map((p) => `<li><a href="${esc(p.url)}" rel="noopener">${esc(p.title)}</a> <span class="muted">#${esc(p.number)}</span></li>`).join('')}</ul></div>` : ''}
      ${!notes && !changes && !r.prs.length && !r.article ? `<p class="muted">This release has no notes of its own. ${r.compare ? `${ext(r.compare, 'See every change on GitHub')}.` : ''}</p>` : ''}
      <div class="btn-row mt-4">
        ${newer ? btn(newer.path, `Newer: ${newer.version}`, { kind: 'ghost', iconName: 'back' }) : ''}
        ${older ? btn(older.path, `Older: ${older.version}`, { kind: 'ghost', iconName: 'arrow', after: true }) : ''}
        ${r.compare ? btn(r.compare, 'Every change', { kind: 'ghost', iconName: 'external', after: true, external: true }) : ''}
      </div>
    </div>
    <aside class="stack">
      <h2 class="sr-only">Downloads</h2>
      ${files.systems.length ? `<div class="card sys">
        <div class="card-top"><span class="tile">${icon('download')}</span><h3>Downloads</h3></div>
        <div class="files">
          ${files.systems.map((s) => recommended(s).slice(0, s.id === 'linux' ? 2 : 2).map((f) => fileLink(f, s.name)).join('')).join('\n          ')}
        </div>
        <details class="more-files"><summary>All ${r.assets.length} files</summary><div class="files">${r.assets.map((a) => `<a class="file" href="${esc(a.url)}" rel="noopener"><span class="what">${esc(a.name)}</span><span class="detail">${size(a.size)}</span>${icon('download')}</a>`).join('')}</div></details>
        ${latestOfProduct ? '' : `<p class="muted">An older version. <a href="/download/">The latest is on the download page</a>.</p>`}
      </div>` : ''}
    </aside>
  </div>
</section>`
  return { path: r.path, html: page({ path: r.path, title: `${r.productName} ${r.version}`, description: releaseSummary(r), body, active: '/news/', type: 'article' }) }
}

function fileLink(f, sysName, primary = false) {
  return `<a class="file${primary ? ' primary' : ''}" href="${esc(f.url)}" rel="noopener"><span class="what">${esc(sysName)} · ${esc(f.kind)}</span><span class="detail">${esc(f.archLabel)} · ${size(f.size)}</span>${icon('download')}</a>`
}

// ======================================================================
// Download
// ======================================================================
export function download() {
  const { site, latest } = d()
  const panel = (key, r, title, intro, extra = '') => {
    if (!r) return `<div id="${key}" class="stack">
      <div class="card"><span class="tile muted">${icon('download')}</span><h3>${esc(title)} has no release yet</h3><p>${intro}</p><div class="btn-row">${btn(gh(site.repos[key]), 'Follow it on GitHub', { kind: 'primary', iconName: 'github', external: true })}</div></div>
    </div>`
    const c = classify(r.assets)
    return `<div id="${key}" class="stack">
      <div class="section-head row">
        <div class="stack tight"><h2>${esc(title)} ${esc(r.version)}</h2><p>${intro} Released ${longDate(r.date)}. <a href="${r.path}">What’s new in it</a>.</p></div>
      </div>
      <div class="systems">
        ${c.systems.map((s) => {
          const rec = recommended(s)
          const rest = s.files.filter((f) => !rec.includes(f))
          return `<div class="card sys" data-system="${s.id}">
          <div class="card-top"><span class="tile">${icon(s.icon)}</span><h3>${esc(s.name)}</h3><span class="pill ok yours" hidden>Your system</span></div>
          <div class="files">${rec.map((f, i) => fileLink(f, s.name, i === 0)).join('')}</div>
          ${rest.length ? `<details class="more-files"><summary>${rest.length} more ${rest.length === 1 ? 'file' : 'files'}</summary><div class="files">${rest.map((f) => fileLink(f, s.name)).join('')}</div></details>` : ''}
        </div>`
        }).join('\n        ')}
        ${extra}
      </div>
      <p class="muted">${c.sums ? `Checksums: ${ext(c.sums.url, esc(c.sums.name))}${c.sig ? `, signed in ${ext(c.sig.url, esc(c.sig.name))}` : ''}. ` : ''}Every file is also on ${ext(r.url, 'the release’s GitHub page')}.</p>
    </div>`
  }
  const docker = `<div class="card sys" data-system="docker">
    <div class="card-top"><span class="tile">${icon('container')}</span><h3>Docker</h3></div>
    <p>On a NAS or any machine that runs containers. Change the media line to your own folder.</p>
    <div class="codebox"><pre id="docker-cmd"><code>docker run -d --name wittymediaserver --restart unless-stopped \\
  -p 9797:9797 \\
  -v wms-config:/config \\
  -v /path/to/movies:/media/movies:ro \\
  ghcr.io/wittywilla/wittymediaserver:alpha</code></pre><button class="icon-btn copy" type="button" data-copy="#docker-cmd" data-done='${icon('check')}' aria-label="Copy" hidden>${icon('copy')}</button></div>
    <p class="muted">${ext(site.docs.docker, 'Docker Compose and NAS setup')}</p>
  </div>`
  const body = `
${pageHead({ eyebrow: 'Download', title: 'Get WittyMediaServer', lead: esc(site.say.serverWhere) })}
<section class="section">
  <div class="wrap">
    <nav class="tabs" data-tabs aria-label="Products">
      <a href="#server">${icon('server')}Server</a>
      <a href="#client">${icon('devices')}Apps</a>
      <a href="#reader">${icon('book')}WittyReader</a>
      <a href="#player">${icon('disc')}WittyMediaPlayer</a>
    </nav>
    <div class="stack">
      ${panel('server', latest.server, 'WittyMediaServer', 'For the computer that holds your media.', docker)}
      ${panel('client', latest.client, 'WittyMediaClient', `${esc(site.say.clientOptional)} ${esc(site.say.clientTested)}`)}
      ${panel('reader', latest.reader, 'WittyReader', `${esc(site.say.readerShort)} No server needed.`)}
      ${panel('player', latest.player, 'WittyMediaPlayer', `${esc(site.say.playerShort)} No server needed.`)}
    </div>
  </div>
</section>
<section class="section tint">
  <div class="wrap">
    <div class="split">
      <div class="text">
        <p class="eyebrow">After installing</p>
        <h2>From download to your first film</h2>
        <ol class="steps">
          <li><strong>Open it.</strong> On Windows and a Mac, open WittyMediaServer and your browser opens its setup page. On Linux, FreeBSD and Docker it runs in the background: go to <code>http://&lt;this computer&gt;:9797</code>.</li>
          <li><strong>Make your account.</strong> The first account looks after libraries, people and settings. From another device, setup asks for a code that the server shows when it starts.</li>
          <li><strong>Choose what you want.</strong> Films, TV and music work straight away. Tick discs, games, photos or books, and their modules download, which needs an internet connection.</li>
          <li><strong>Add a folder.</strong> Point a library at your films or shows, and it finds what’s there.</li>
          <li><strong>Watch anywhere.</strong> Open the server’s address, such as <code>http://192.168.1.20:9797</code>, on any screen in your home. Setup’s last page shows it.</li>
        </ol>
        <div class="btn-row">${btn(site.docs.gettingStarted, 'Getting started guide', { kind: 'primary', iconName: 'external', after: true, external: true })}${btn(site.docs.install, 'Every way to install', { kind: 'ghost', iconName: 'external', after: true, external: true })}</div>
      </div>
      ${windowShot('setup-01-welcome', { title: 'WittyMediaServer · Setup' })}
    </div>
  </div>
</section>
<section class="section">
  <div class="wrap narrow stack">
    <div class="notice">${icon('sparkle')}<p><strong>This is an alpha.</strong> ${esc(site.say.alpha.replace(/^Alpha software: /, ''))} ${esc(site.say.serverTested)}</p></div>
    <div class="notice info">${icon('shield')}<p>The downloads aren’t code-signed yet, so Windows and macOS warn about them. On Windows, choose <em>More info</em>, then <em>Run anyway</em>. On a Mac, right-click the server’s installer, choose <em>Open</em>, and <em>Open</em> again. For the apps, use <em>Open Anyway</em> in <em>System Settings → Privacy &amp; Security</em>.</p></div>
    <div class="notice info">${icon('shield')}<p>${esc(site.say.noMedia)} It’s licensed under ${ext(`https://github.com/${site.repos.server}/blob/master/LICENSE`, esc(site.say.licence))} and comes “as is”, with no warranty. Add only media you have the right to use. <a href="/legal/">The legal notes</a> have the rest. New to all this? <a href="/start/">Start here</a>.</p></div>
  </div>
</section>`
  return { path: '/download/', html: page({ path: '/download/', title: 'Download', description: 'Download WittyMediaServer for Windows, macOS, Linux, FreeBSD or Docker, and its apps.', body, active: '/download/' }) }
}

// ======================================================================
// Gallery
// ======================================================================
export function gallery() {
  const { site, shots, shotGroups } = d()
  const local = shots.filter((s) => s.local)
  const groups = shotGroups.filter((g) => local.some((s) => s.group === g))
  const body = `
${pageHead({ eyebrow: 'From the project', title: 'Gallery', lead: `${esc(site.say.shotsNote)} ${esc(site.say.noMedia)} Choose a theme at the top to see the server in it.` })}
<section class="section">
  <div class="wrap">
    <div class="toolbar" data-filter-list="#gallery" data-empty="#gallery-none" data-param="show" hidden>
      <div class="filters" role="group" aria-label="Show">
        <button type="button" class="chip" data-value="all" aria-pressed="true">All</button>
        ${groups.map((g) => `<button type="button" class="chip" data-value="${groupTag(g)}" aria-pressed="false">${esc(g)}</button>`).join('')}
      </div>
    </div>
    <div class="shots three" id="gallery">
      ${local.map((s, i) => shotCard(s.id, i + 1)).join('\n      ')}
    </div>
    <p class="empty" id="gallery-none" hidden>No pictures here.</p>
    ${creditsLine()}
  </div>
</section>
${viewer()}`
  return { path: '/gallery/', html: page({ path: '/gallery/', title: 'Gallery', description: `${site.say.shotsNote} ${site.say.noMedia}`, body, active: '/gallery/' }) }
}

// ======================================================================
// Not found
// ======================================================================
export function notFound() {
  const body = `
<section class="notfound">
  <div class="wrap narrow">
    <p class="code" aria-hidden="true">404</p>
    <h1 class="mt-4">That page isn’t here</h1>
    <p class="mt-4 muted">It may have moved when the site was rebuilt. These are the places most people look for.</p>
    <div class="btn-row center mt-8">
      ${btn('/', 'Home', { kind: 'primary', iconName: 'home' })}
      ${btn('/download/', 'Download', { iconName: 'download' })}
      ${btn('/news/', 'News', { kind: 'ghost' })}
      ${btn('/modules/', 'Modules', { kind: 'ghost' })}
    </div>
  </div>
</section>`
  return { path: '/404.html', file: '404.html', html: page({ path: '/404.html', title: 'Page not found', description: 'That page isn’t here.', body, noindex: true }) }
}
