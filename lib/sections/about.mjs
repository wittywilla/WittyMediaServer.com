// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 WittyWilla and contributors
// The pages a project keeps for people deciding and taking part: questions and
// answers, help, privacy and the roadmap. Every fact here comes from the server's
// own docs and READMEs, and the roadmap and the privacy list are fetched from them.
import { ctx, page, pageHead, sectionHead, btn, ext, icon } from '../layout.mjs'
import { esc, longDate } from '../util.mjs'
import { inline, plain, sections } from '../markdown.mjs'

/** What gather() fetched: the public roadmap and the server's list of outside services. */
const got = { roadmap: null, legal: null }

const branchOf = (d) => d.repos[d.site.repos.server]?.branch || 'master'
const gh = (d) => `https://github.com/${d.site.repos.server}`
/** A file in the server's repository, on GitHub: doc(d, 'docs/REMOTE.md#which-way-should-i-choose'). */
const doc = (d, file) => `${gh(d)}/blob/${branchOf(d)}/${file}`
/** A guide: this site's own copy when the docs section made one, otherwise GitHub's. */
const guide = (d, file) => {
  const [name, hash = ''] = file.split(/(?=#)/)
  const local = d.docs?.guides?.find((x) => x.file === name.replace(/.md$/, ''))
  return local ? `/docs/${local.slug}/${hash}` : doc(d, `docs/${file}`)
}

export async function gather({ d, gh: hub, log }) {
  const repo = d.site.repos.server
  got.roadmap = await hub.text(hub.raw(repo, branchOf(d), 'docs/ROADMAP.md'))
  if (!got.roadmap) log('  ! no docs/ROADMAP.md from GitHub: the roadmap page only links to it')
  // The same list the server shows under Settings → Legal → Privacy.
  got.legal = await hub.json(hub.raw(repo, branchOf(d), 'internal/legal/legal.json'))
  if (!got.legal?.services) log('  ! no internal/legal/legal.json from GitHub: the privacy page leaves out the list of services')
}

export function pages(d) {
  return [faq(d), support(d), privacy(d), roadmap(d)]
}

// ---------- pieces ----------

const md = (s) => inline(s)
const paras = (list) => list.map((p) => `<p>${md(p)}</p>`).join('')
const linkOut = (href, label) => href.startsWith('/') ? `<a href="${esc(href)}">${esc(label)}</a>` : ext(href, `${esc(label)}${icon('external')}`)

/** A card that's a link as a whole, like the projects page's. */
const linkCard = ({ href, iconName, title, text, go }) => `<article class="card link help-card">
  <span class="tile">${icon(iconName)}</span>
  <h3><a class="cover" href="${esc(href)}"${/^https?:/.test(href) ? ' rel="noopener"' : ''}>${esc(title)}</a></h3>
  <p>${md(text)}</p>
  <span class="go">${esc(go)}${icon(/^https?:/.test(href) ? 'external' : 'arrow')}</span>
</article>`

const jsonLd = (data) => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>\n`

// ======================================================================
// Questions and answers
// ======================================================================
function questions(d) {
  const s = d.site.say
  const g = (f) => guide(d, f)
  return [
    { id: 'basics', title: 'The basics', items: [
      { id: 'what', q: 'What is WittyMediaServer?', a: [s.server, s.serverWhere],
        more: [['The server', '/server/'], ['Getting started', g('GETTING_STARTED.md')]] },
      { id: 'free', q: 'Is it free?', a: [
        `Yes. It’s open source under the [GNU Affero General Public License v3.0 (or later)](https://www.gnu.org/licenses/agpl-3.0.html): you can use it, change it and share it, commercially or not, as long as you keep the licence, offer the source to those who use it over a network, and (please) keep its NOTICE file. Its modules, WittyModule and the module catalog are under the same licence. The apps, WittyMediaClient, WittyReader and WittyMediaPlayer, are under the [GNU GPL v3.0 (or later)](https://www.gnu.org/licenses/gpl-3.0.html). There’s no account to make and nothing to pay for.`,
        'Free keys for TMDB and TheTVDB add more details, and are optional. **WittyRelay**, shown greyed out in **Settings → Remote Access**, doesn’t exist yet: it’s planned as a free service, and nothing on your server uses it.'],
        more: [['Licence and legal', doc(d, 'README.md#licence-and-legal')], ['Ways in from away', g('REMOTE.md#which-way-should-i-choose')]] },
      { id: 'ready', q: 'Is it ready to rely on?', a: [s.alpha,
        'It stays in alpha until every planned feature is at least partly built. The roadmap shows what’s being finished, what’s still to build, and what hasn’t been tried on real hardware yet.'],
        more: [['Roadmap', '/roadmap/'], ['Backup and restore', g('BACKUP.md')]] },
      { id: 'folders', q: 'How is it different from just sharing folders?', a: [
        'A shared folder hands each device a file and leaves the rest to it. If that device can’t play the file, you’re stuck, and nothing remembers where you were.',
        'WittyMediaServer gives each title a page with its poster and details, remembers where everyone stopped, and converts what a device can’t play while you watch. It adds profiles with their own progress, Kids limits, disc menus in a browser, and channels made from your library. It can still read your media from a shared folder on another computer.'],
        more: [['What it does', '/server/'], ['Network shares', g('LIBRARIES.md#network-shares')]] },
      { id: 'who', q: 'Who makes it?', a: [
        `${d.site.ownerName}, as a project of one maintainer. It’s built in the open on GitHub, where anyone can read the code, share ideas and report problems.`],
        more: [['Help and taking part', '/support/'], ['Source code', gh(d)]] },
    ] },
    { id: 'running', title: 'Getting it running', items: [
      { id: 'computer', q: 'What computer do I need?', a: [
        'One that stays on while you watch: Windows 10 or 11, macOS 11 or newer, Linux, FreeBSD 14 or newer, or a NAS that runs Docker. FFmpeg, which converts video, comes with every download except FreeBSD on arm64, so there’s usually nothing else to install.',
        'There’s no minimum specification yet: writing one is on the roadmap. As a rough guide, a Raspberry Pi 4 or 5 converts video up to 720p, and an Intel N100 with Quick Sync up to 1080p. Files your devices play as they are, such as MP4 with H.264 and AAC, cost almost nothing on any machine.',
        'On a small machine, such as a Raspberry Pi 3, an old mini PC or a container given little memory, the server fits itself to what it finds: it keeps its own memory to about a quarter of the machine’s, does less at once, and lets a library scan wait while a video is being converted.',
        s.serverTested],
        more: [['What you need', g('GETTING_STARTED.md#what-you-need')], ['Which choice for which machine', g('TRANSCODING.md#which-choice-for-which-machine')], ['Small machines', g('HARDWARE.md#small-machines')], ['Download', '/download/']] },
      { id: 'devices', q: 'Do I install anything on my TV or phone?', a: [
        'No. Every other screen reaches the server through a web browser, with no app needed. Its pages are tested on desktop browsers. Safari and phone browsers haven’t been checked yet.',
        `WittyMediaClient is an optional app for TV boxes, phones, tablets and desktops, and it’s early. ${s.clientTested}`],
        more: [['Apps and devices', g('APPS.md')], ['The apps', '/client/']] },
      { id: 'internet', q: 'Does it need the internet, or an account?', a: [
        'No account with anyone. Your accounts live on your own server: setup makes the first one, and you add the rest of your household.',
        'It plays at home with no internet at all. The internet is used to add modules, which download signed from the official list; to fetch posters and details, using names taken from your files and folders; and to ask GitHub about updates twice a day. Each can be turned off, and setup lets you carry on without modules and add them later.'],
        more: [['What first-time setup asks', g('GETTING_STARTED.md#what-first-time-setup-asks')], ['Privacy', '/privacy/']] },
      { id: 'docker', q: 'Can I run it in Docker or on a NAS?', a: [
        'Yes. The image is `ghcr.io/wittywilla/wittymediaserver:alpha`, with your settings in a volume and your media mounted read-only. The installing guide covers Docker and a NAS step by step. The complete image hasn’t been tried for real yet: see the roadmap.'],
        more: [['Docker', g('INSTALL.md#docker')], ['A NAS', g('INSTALL.md#a-nas')]] },
    ] },
    { id: 'watching', title: 'Watching and listening', items: [
      { id: 'away', q: 'Can I watch away from home?', a: [
        'Yes, once you choose to. Until you turn on **Settings → Remote Access** and follow its steps, the server refuses every connection from outside your home network, even if your router lets it through.',
        'The recommended way is a private network such as Tailscale or NetBird: nothing is opened on your router, so the internet can’t see your server. Forwarding a port isn’t recommended. This is alpha software that hasn’t had an independent security audit, so treat every protection as a help, not a guarantee.',
        'The apps can also reach your server peer to peer, with nothing set up on the router and no account with anyone. It’s off until you turn it on in **Settings → Remote Access**, which first lists who is contacted and what they see, and only devices on the server’s list may connect. Web browsers can’t use it.'],
        more: [['Remote access', g('REMOTE.md')], ['Which way should I choose?', g('REMOTE.md#which-way-should-i-choose')], ['Peer-to-peer connections', g('P2P.md')]] },
      { id: 'formats', q: 'Which formats does it play?', a: [
        'Nearly any video, plus music, audiobooks, podcasts, EPUB, PDF, comics and photos. A file’s content decides, not its name.',
        'When a device can’t play a file as it is, the server does the least it can: it rewraps it, converts only the sound, or, when nothing simpler would play, converts the picture too. Your files aren’t changed. Which codecs you can use depends on the FFmpeg on your machine.'],
        more: [['Supported formats', g('SUPPORTED-FORMATS.md')], ['Live transcoding', g('TRANSCODING.md')]] },
      { id: 'family', q: 'Can everyone at home have their own profile?', a: [
        'Yes. Each profile keeps its own progress, favourites, settings and picture, picked from *Who’s watching?*, and a shared screen can switch profile without signing out. Kids profiles show only titles up to the age you choose, and titles with no rating stay hidden until you say otherwise.',
        'Parental controls set an age for each kind of media, collections and tags to allow or hide, switches for games, recording, downloads, watch parties and more, and screen time with bedtimes and a parents’ PIN. Age limits rely on ratings, which can be missing or wrong, so they’re a help, not a guarantee.'],
        more: [['Accounts and profiles', g('ACCOUNTS.md')], ['Kids profiles', g('ACCOUNTS.md#kids')], ['Profiles and parental controls', g('PROFILES.md')]] },
      { id: 'media', q: 'Does it come with any films, music or games?', a: [
        `${s.noMedia} It organises and streams media you already have the right to use. No games, BIOS files or cores come with it, and the project doesn’t link to them.`],
        more: [['Games', g('GAMES.md')], ['Libraries', g('LIBRARIES.md')]] },
    ] },
    { id: 'discs', title: 'Discs and copy protection', items: [
      { id: 'discs', q: 'Will it play my DVDs and Blu-rays?', a: [
        'Yes, from disc images such as `.iso` and `.img`, and from folders that hold `VIDEO_TS` or `BDMV`, with their real menus, in a browser. That’s the WittyDVD and WittyBluray modules, which you add from the store.',
        'Many commercial Blu-rays write their menus in Java. Those play their main feature directly unless you install Java on the server and turn their menus on. Retail Blu-rays haven’t been tried yet. To play straight from a drive on a Windows PC, WittyMediaPlayer can, and it can also make a disc image to add to your server.'],
        more: [['DVDs', g('DVD.md')], ['Blu-rays', g('BLURAY.md')], ['WittyMediaPlayer', '/player/']] },
      { id: 'copy-protection', q: 'What about copy protection?', a: [
        'Copy-protected media is refused, and nothing here unlocks it. A CSS-scrambled DVD or an AACS-encrypted Blu-ray is listed with a plain message and can’t be played, and BD+ is never run. Encrypted broadcasts and encrypted game files are refused too. No plugin or setting changes that.',
        'A disc without copy protection just plays.'],
        more: [['Adding DVDs', g('DVD.md#adding-dvds')], ['Adding Blu-rays', g('BLURAY.md#adding-discs')]] },
    ] },
    { id: 'updates', title: 'Modules, updates and your files', items: [
      { id: 'modules', q: 'What are modules?', a: [s.modules,
        'The server works without any of them. Only administrators add, update or remove them, and removing one leaves your media, history and settings as they are.'],
        more: [['Every module', '/modules/'], ['Modules and the store', g('MODULE-STORE.md')]] },
      { id: 'how-updates', q: 'How do updates work?', a: [
        'Twice a day the server asks GitHub for its list of releases, and puts a dot on **Settings** when there’s a newer one. Nothing about you or your library is sent, and nothing installs until an administrator presses **Update now** in **Settings → About**.',
        'Every update is checked against the project’s signing key before it’s installed, and your data folder is never written. Modules have a choice of their own: tell you, install by themselves, or look only when you ask. A release found to be unsafe is withdrawn, and a server running it says so.'],
        more: [['Updating', g('INSTALL.md#updating')], ['Module updates', g('MODULE-STORE.md#automatic-updates')]] },
      { id: 'backups', q: 'Could an update lose my data?', a: [
        'It’s alpha software, so it could, and a backup is the answer. **Settings → Backup** makes one ZIP of your server’s data and details, protected with a password. Your media files are never in it: they stay where they are.',
        'Backups haven’t been run on a real Mac or on FreeBSD yet.'],
        more: [['Backup and restore', g('BACKUP.md')]] },
      { id: 'files', q: 'Will it change my files?', a: [
        'Playing never changes a file, and uninstalling leaves your media where it is. Setup asks whether posters and details are saved beside your files or kept on the server.'],
        more: [['What is saved next to your media', g('METADATA.md#what-is-saved-next-to-your-media')], ['Uninstalling', g('UNINSTALL.md')]] },
    ] },
    { id: 'privacy', title: 'Privacy and security', items: [
      { id: 'private', q: 'Is my data private?', a: [
        'There’s no telemetry, no account with the project and no cloud. Your files, watch history, passwords and logs aren’t sent anywhere.',
        'What does leave your server is listed in **Settings → Legal → Privacy**, with what controls each one: mostly names taken from your file and folder names, sent to the details services you keep on, and the update check to GitHub.'],
        more: [['Privacy', '/privacy/'], ['Privacy and security', doc(d, 'README.md#privacy-and-security')]] },
      { id: 'report-security', q: 'How do I report a security problem?', a: [
        'Privately, with **Report a vulnerability** on the project’s GitHub security page, and never in a public issue. Only the newest release gets security fixes.'],
        more: [['Security reports', '/support/#security'], ['Security policy', doc(d, 'SECURITY.md')]] },
    ] },
    { id: 'involved', title: 'Help and taking part', items: [
      { id: 'help', q: 'Where do I get help, or suggest a feature?', a: [
        'Ask in GitHub Discussions, and share ideas in its Ideas category. Report a bug as an issue. The help page says what to include.'],
        more: [['Help and taking part', '/support/'], ['Troubleshooting', g('TROUBLESHOOTING.md')]] },
      { id: 'contribute', q: 'Can I help build it?', a: [
        'Yes. Issues and pull requests are welcome. Discs, games, readers and more are modules with repositories of their own, so you can work on one without the rest.',
        'Trying it for real helps too. A real Mac, a TV and its remote, or a retail Blu-ray are among what it hasn’t met yet.'],
        more: [['Contributing', '/support/#contribute'], ['What hasn’t met the real world', '/roadmap/#real-world']] },
    ] },
  ]
}

function faq(d) {
  const groups = questions(d)
  const count = groups.reduce((n, g) => n + g.items.length, 0)
  const ld = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: groups.flatMap((g) => g.items).map((x) => ({
      '@type': 'Question', name: x.q,
      acceptedAnswer: { '@type': 'Answer', text: plain(x.a.join(' ')) },
    })),
  }
  const body = `
${pageHead({
    eyebrow: 'Questions', title: 'Questions and answers',
    lead: `${count} things people ask before they install it, each answered from the guides, with a link to read more.`,
    buttons: [btn('/support/', 'Ask something else', { kind: 'ghost', iconName: 'arrow', after: true })].join(''),
  })}
<section class="section">
  <div class="wrap">
    <nav class="filters faq-topics" aria-label="Topics">${groups.map((g) => `<a class="chip" href="#${g.id}">${esc(g.title)}<span class="n">${g.items.length}</span></a>`).join('')}</nav>
    ${groups.map((g) => `<section class="faq-group" aria-labelledby="${g.id}">
      <h2 id="${g.id}">${esc(g.title)}</h2>
      <div class="faq-list">
        ${g.items.map((x) => `<details class="qa" id="q-${x.id}">
          <summary>${md(x.q)}</summary>
          <div class="a">
            ${paras(x.a)}
            <p class="more">${x.more.map(([label, href]) => linkOut(href, label)).join('')}</p>
          </div>
        </details>`).join('\n        ')}
      </div>
    </section>`).join('\n    ')}
  </div>
</section>
<section class="section">
  <div class="wrap">
    <div class="cta">
      <h2>Didn’t find it?</h2>
      <p>Ask in Discussions, or look through the guides. Everything in them is also inside the app, under Help.</p>
      <div class="btn-row">${btn('/support/', 'Get help', { kind: 'primary', iconName: 'arrow', after: true })}${btn(guide(d, 'GETTING_STARTED.md'), 'Getting started guide', { iconName: guide(d, 'GETTING_STARTED.md').startsWith('/') ? 'arrow' : 'external', after: true, external: !guide(d, 'GETTING_STARTED.md').startsWith('/') })}</div>
    </div>
  </div>
</section>`
  return { path: '/faq/', html: page({ path: '/faq/', title: 'Questions and answers', description: 'Is it free, what computer it needs, watching away from home, discs and copy protection, updates and privacy: answered from the guides.', body, head: jsonLd(ld) }) }
}

// ======================================================================
// Help and taking part
// ======================================================================
function support(d) {
  const { site } = d
  const g = (f) => guide(d, f)
  const disc = site.docs.discussions
  const body = `
${pageHead({
    eyebrow: 'Help and taking part', title: 'Get help, and help out',
    lead: 'Everything happens in the open on GitHub: questions, ideas, bugs and changes. Here’s where each one goes.',
  })}
<section class="section">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Where to go', title: 'Pick the right place', intro: 'Ideas are discussions, so others can add to them before anything is built. Bugs are issues, so each one is tracked on its own.' })}
    <div class="grid two gap-lg">
      ${linkCard({ href: `${disc}/categories/q-a`, iconName: 'users', title: 'Ask a question', text: 'Stuck, or not sure how something works? Ask in **Q&A**, where answers stay for the next person.', go: 'Discussions, Q&A' })}
      ${linkCard({ href: `${disc}/categories/ideas`, iconName: 'sparkle', title: 'Suggest a feature', text: 'Share it in **Ideas**. Others can add to it, and it becomes an issue once it’s planned.', go: 'Discussions, Ideas' })}
      ${linkCard({ href: site.docs.issues, iconName: 'list', title: 'Report a bug', text: 'Something broken, or not doing what the guide says? Open an issue, with what’s below.', go: 'Issues' })}
      ${linkCard({ href: '#security', iconName: 'shield', title: 'Report a security problem', text: 'Privately, never in a public issue. See how below.', go: 'Security reports' })}
    </div>
    <p class="mt-6 muted">Before asking, the <a href="/faq/">questions and answers</a> and ${ext(g('TROUBLESHOOTING.md'), 'Troubleshooting')} may already have it. Every guide is also inside the app, under Help.</p>
  </div>
</section>
<section class="section tint" id="bugs">
  <div class="wrap">
    <div class="split help-split">
      <div class="text">
        <p class="eyebrow">Reporting a bug</p>
        <h2>What to include</h2>
        <p>A report someone can reproduce gets fixed. These make the difference.</p>
        <div class="btn-row">${btn(`${site.docs.issues}/new`, 'Open an issue', { kind: 'primary', iconName: 'external', after: true, external: true })}</div>
      </div>
      <ol class="steps">
        <li><strong>The version.</strong> It’s in <strong>Settings → About</strong>, with the system and how you installed it: installer, package, archive or Docker.</li>
        <li><strong>What you did, what you expected, and what happened.</strong> The exact message, if there was one.</li>
        <li><strong>The logs.</strong> Make it happen again, then go to <strong>Settings → WittyLog</strong> and press <strong>Download logs as ZIP</strong>. Leave <strong>Sanitize for sharing</strong> on: names, addresses, paths and titles become placeholders, and passwords, tokens and keys are taken out. If the server won’t start, <code>wittymediaserver logs zip</code> makes the same file.</li>
        <li><strong>For a disc or a drive,</strong> a report from <strong>Settings → WittyDiagnoser</strong>. Never attach a disc image.</li>
      </ol>
    </div>
    <p class="mt-8 muted">From ${ext(g('TROUBLESHOOTING.md#getting-help'), 'Getting help')} and ${ext(doc(d, 'CONTRIBUTING.md#guidelines'), 'Contributing')}. Nothing is ever uploaded by the server: you choose what to share.</p>
  </div>
</section>
<section class="section" id="security">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Security', title: 'Reporting a security problem', intro: 'It runs on people’s own machines and holds their accounts and their media, so reports are welcome and taken seriously.' })}
    <div class="notice">${icon('lock')}<p><strong>Please don’t put the details in a public issue.</strong> Report it privately, and it stays between you and the maintainer until a fix is out.</p></div>
    <div class="grid two gap-lg mt-8">
      <div class="card">
        <span class="tile">${icon('shield')}</span>
        <h3>How to report it</h3>
        <ol class="steps">
          <li>Open the ${ext(`${gh(d)}/security`, 'Security tab')} of the WittyMediaServer repository.</li>
          <li>Choose <strong>Report a vulnerability</strong>.</li>
        </ol>
        <p>No button? Open an issue that says only that you have a security report, with no details, and ask for a private way to send it.</p>
        <p>Include the version you tested, how to reproduce it, and what someone could do with it. Test only on servers you own.</p>
      </div>
      <div class="card">
        <span class="tile">${icon('heart')}</span>
        <h3>What to expect</h3>
        <p>This is a project of one maintainer, so these are aims, not promises:</p>
        <ul class="help-ticks">
          <li>${icon('check')}<span>A first answer within a week</span></li>
          <li>${icon('check')}<span>A fix as soon as it’s ready, sooner for anything that exposes accounts or files</span></li>
          <li>${icon('check')}<span>Credit in the changelog, if you’d like it</span></li>
        </ul>
        <p>Only the newest release gets security fixes. A problem in a module can be reported there too, if you aren’t sure where it belongs.</p>
      </div>
    </div>
    <p class="mt-6 muted">From the ${ext(doc(d, 'SECURITY.md'), 'security policy')}, which also says what counts and how to run a server safely.</p>
  </div>
</section>
<section class="section tint" id="contribute">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Contributing', title: 'Help build it', intro: 'Issues and pull requests are welcome, even if you haven’t worked on a Go or React project before.' })}
    <div class="grid three">
      <div class="card"><span class="tile">${icon('terminal')}</span><h3>Change the server</h3><p>You need Go 1.26 or newer, Node.js 22 or newer, FFmpeg and Git. Run the full tests on Linux, which on Windows means WSL.</p></div>
      <div class="card"><span class="tile">${icon('puzzle')}</span><h3>Work on a module</h3><p>Discs, games, photos, readers and tuners each live in a repository of their own. To change one, work there.</p></div>
      <div class="card"><span class="tile">${icon('book')}</span><h3>Improve the guides</h3><p>The guides in <code>docs/</code> are what people read inside the app, under Help. New settings need a line there too.</p></div>
    </div>
    <div class="split help-split mt-12">
      <div class="text">
        <h3>Sending a change</h3>
        <p>New to Git and GitHub? ${ext(g('PUBLISHING.md'), 'Publishing changes')} walks through it.</p>
      </div>
      <ol class="steps">
        <li>Fork the repository on GitHub, and clone your fork.</li>
        <li>Make a branch, such as <code>git checkout -b fix-menu-highlight</code>.</li>
        <li>Commit with a clear message, push, and open a pull request against <code>master</code>.</li>
        <li>The checks run on it by themselves.</li>
      </ol>
    </div>
    <div class="notice info mt-8">${icon('disc')}<p><strong>Two rules that never bend.</strong> Disc engines stay free of other players’ code, because they’re written from the public disc formats. And nothing may add a way around copy protection, or a hook for one. Contributions are under the GNU Affero General Public License v3.0 (or later).</p></div>
    <div class="btn-row mt-8">${btn(doc(d, 'CONTRIBUTING.md'), 'Contributing guide', { kind: 'primary', iconName: 'external', after: true, external: true })}${btn('/projects/', 'Every project', { iconName: 'arrow', after: true })}</div>
  </div>
</section>
<section class="section" id="test">
  <div class="wrap">
    <div class="cta">
      <p class="eyebrow">Trying it for real</p>
      <h2>Got the hardware it hasn’t met?</h2>
      <p>Much of it is written and tested as far as one machine allows. A real Mac, a TV and its remote, a game controller, a tuner or a retail Blu-ray would each tell it something new.</p>
      <div class="btn-row">${btn('/roadmap/#real-world', 'What hasn’t been tried', { kind: 'primary', iconName: 'arrow', after: true })}${btn(`${disc}/categories/show-and-tell`, 'Tell us how it went', { iconName: 'external', after: true, external: true })}</div>
    </div>
  </div>
</section>`
  return { path: '/support/', html: page({ path: '/support/', title: 'Help and taking part', description: 'Where to ask questions, suggest features, report bugs and security problems, and how to contribute to WittyMediaServer.', body }) }
}

// ======================================================================
// Privacy
// ======================================================================
function privacy(d) {
  const { site } = d
  const g = (f) => guide(d, f)
  const legal = got.legal
  const services = Array.isArray(legal?.services) ? legal.services : []
  const onByDefault = services.filter((x) => /\bon by default/i.test(x.when || ''))
  const others = services.filter((x) => !onByDefault.includes(x))
  const row = (x) => `<div class="pv-row">
        <h4>${md(x.name)}</h4>
        <dl>
          <div><dt>Gets</dt><dd>${md(x.gets || '')}</dd></div>
          <div><dt>When</dt><dd>${md(x.when || '')}</dd></div>
          ${x.control ? `<div><dt>Controlled in</dt><dd>${md(x.control)}</dd></div>` : ''}
        </dl>
      </div>`
  // The server's own words for its privacy, as Settings → Legal → Privacy shows them.
  const said = legal?.sections?.find((x) => x.id === 'privacy')
  const body = `
${pageHead({
    eyebrow: 'Privacy', title: 'Privacy',
    lead: 'Two parts: this website, and the software you install. Neither tracks you.',
  })}
<section class="section" id="website">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'This website', title: 'No cookies, trackers or analytics', intro: 'wittymediaserver.com is a folder of plain files. There’s no database, no sign-in and nothing to type in.' })}
    <div class="features">
      <div><h3>${icon('shield')}Nothing follows you</h3><p>No cookies, no trackers, no analytics and no advertising. No fonts, scripts or pictures come from anywhere else.</p></div>
      <div><h3>${icon('palette')}Your theme stays with you</h3><p>The theme you pick is kept in your own browser, and never sent anywhere. <strong>Match my device</strong> forgets it.</p></div>
      <div><h3>${icon('github')}Checking for newer releases</h3><p>The front page, News and Modules ask GitHub whether anything came out since the site was made. GitHub then sees your address and browser, as with any visit, and its own privacy statement applies.</p></div>
      <div><h3>${icon('download')}Downloads come from GitHub</h3><p>Download buttons go straight to the project’s releases on GitHub. Links to the guides and source code go there too.</p></div>
    </div>
    <div class="grid two gap-lg mt-8">
      <div class="card">
        <h3>What your browser keeps</h3>
        <ul class="help-ticks">
          <li>${icon('check')}<span><code>wms-site-theme</code>: the theme you chose, until you choose <strong>Match my device</strong>. Nothing is kept if you never pick one.</span></li>
          <li>${icon('check')}<span>GitHub’s answers about new releases, for ten minutes, so moving between pages doesn’t ask again. They go when you close the tab.</span></li>
        </ul>
      </div>
      <div class="card">
        <h3>Without JavaScript</h3>
        <p>Every page reads without it. Then nothing is kept in your browser and GitHub is never asked. A strict security policy lets pages reach only this site and, for those checks, GitHub.</p>
        <p class="muted">Like any website, the host that serves these files may keep the usual server logs of visits.</p>
      </div>
    </div>
  </div>
</section>
<section class="section tint" id="software">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'The software', title: 'Your server is yours', intro: 'No telemetry, no accounts with anyone and no cloud. Here’s exactly what leaves a server, and when.' })}
    ${said ? `<p class="pv-lead">In the server’s own words, from <strong>Settings → Legal → Privacy</strong>:</p>
    <div class="grid two pv-said">${said.body.map((p) => `<div class="card"><p>${md(p)}</p></div>`).join('')}</div>` : `<div class="grid three">
      <div class="card"><span class="tile">${icon('server')}</span><h3>No telemetry</h3><p>No usage data, error reports or analytics go to the project or to anyone else. App errors, if an administrator turns that logging on, go only to that server.</p></div>
      <div class="card"><span class="tile">${icon('lock')}</span><h3>Nothing of yours is sent</h3><p>Your files, watch history, passwords and logs aren’t sent anywhere. Logs stay on your computer, and never contain passwords or session tokens.</p></div>
      <div class="card"><span class="tile">${icon('users')}</span><h3>No account with anyone</h3><p>Accounts live on your server. There’s no account with the project, and nothing you add is sent to it.</p></div>
    </div>
    <p class="mt-8 lede">By default, names taken from your file and folder names go to the details services you keep on, and the server asks GitHub for updates twice a day. Everything else is off until someone turns it on or uses it.</p>`}
    ${services.length ? `<div class="pv-list mt-8">
      <h3>On from the start <span class="pill muted">${onByDefault.length}</span></h3>
      <div class="pv-rows">
      ${onByDefault.map(row).join('\n      ')}
      </div>
      <details class="pv-more">
        <summary>Only when someone turns it on or uses it <span class="pill muted">${others.length}</span></summary>
        <div class="pv-rows">
        ${others.map(row).join('\n        ')}
        </div>
      </details>
      <p class="muted">This is the list your server shows in <strong>Settings → Legal → Privacy</strong>, taken from the server’s own source${legal.updated ? `, where it was last updated ${esc(longDate(legal.updated))}` : ''}.</p>
    </div>` : `<p class="mt-6">Your server lists every outside service, what it receives and what controls it, in <strong>Settings → Legal → Privacy</strong>.</p>`}
  </div>
</section>
<section class="section" id="apps">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'The apps', title: 'And the apps', level: 2 })}
    <div class="grid three">
      <div class="card"><span class="tile">${icon('devices')}</span><h3>WittyMediaClient</h3><p>No telemetry. Error reports go to the server you’re connected to, and its owner can turn them off. On the internet it insists on <code>https://</code>.</p></div>
      <div class="card"><span class="tile">${icon('disc')}</span><h3>WittyMediaPlayer</h3><p>Plays discs and files on your own computer, with no server and no account.</p></div>
      <div class="card"><span class="tile">${icon('book')}</span><h3>WittyReader</h3><p>${esc(site.say.reader)}</p></div>
    </div>
    <p class="mt-8 muted">From the ${ext(doc(d, 'README.md#privacy-and-security'), 'README')}, ${ext(g('INSTALL.md#updating'), 'Updating')}, ${ext(g('LOGGING.md'), 'Logging')} and ${ext(g('APPS.md'), 'Apps and devices')}. Want to keep your server off the internet altogether? It is, until you turn on Remote Access: see ${ext(g('REMOTE.md'), 'Remote access')}.</p>
  </div>
</section>`
  return { path: '/privacy/', html: page({ path: '/privacy/', title: 'Privacy', description: 'This website has no cookies, trackers or analytics, and WittyMediaServer has no telemetry. What each talks to, and when.', body }) }
}

// ======================================================================
// Roadmap, from docs/ROADMAP.md
// ======================================================================

/** The tables in a piece of Markdown, and the plain lines around them. */
function blocks(md) {
  const out = { text: [], tables: [] }
  const lines = String(md).split('\n')
  const cells = (l) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim())
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i]
    if (l.includes('|') && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1] || '')) {
      const head = cells(l)
      const rows = []
      for (i += 2; i < lines.length && lines[i].includes('|'); i++) rows.push(cells(lines[i]))
      out.tables.push({ head, rows })
      continue
    }
    if (l.trim() && !/^\s*(---+|<\/?sub>|<sub>.*<\/sub>)\s*$/.test(l)) out.text.push(l.trim())
  }
  return out
}

/** "Not started. Best built with real networks" → a state and the rest of what it says. */
function state(text) {
  const t = String(text).trim()
  const kind = /in progress/i.test(t) ? 'doing' : /^(not |designed|written, and never)/i.test(t) ? 'todo' : 'part'
  const m = /^([^.]{1,40})\.\s+(.+)$/.exec(t)
  return m ? { kind, label: m[1], note: m[2] } : { kind, label: t, note: '' }
}

function roadmap(d) {
  const { site, latest } = d
  const file = doc(d, 'docs/ROADMAP.md')
  // Links in the roadmap are relative to docs/: to this site's guide when there is one.
  const link = (u) => /^(https?:|mailto:|#|\/)/.test(u) ? u : /^[\w-]+\.md(#|$)/.test(u) ? guide(d, u) : new URL(u, `${gh(d)}/blob/${branchOf(d)}/docs/`).href
  const md2 = (s) => inline(s, { link })
  const parts = got.roadmap ? sections(got.roadmap).filter((x) => x.title) : []

  const stateCell = (text) => {
    const st = state(text)
    return `<span class="rm-state ${st.kind}">${md2(st.label)}</span>${st.note ? `<span class="rm-note">${md2(st.note)}</span>` : ''}`
  }
  const table = (t, { waiting = false } = {}) => `<ul class="rm-items">
      ${t.rows.map((r) => `<li class="rm-item">
        <div class="what">${md2(r[0] || '')}</div>
        <div class="st">${waiting ? `<span class="rm-wait">${icon('search')}<span><span class="sr-only">Waiting for: </span>${md2(r[1] || '')}</span></span>` : stateCell(r[1] || '')}</div>
      </li>`).join('\n      ')}
    </ul>`

  let total = 0
  const steps = parts.map((p) => {
    const real = /real world/i.test(p.title)
    const now = /^finishing/i.test(p.title)
    const id = real ? 'real-world' : now ? 'now' : /still to build/i.test(p.title) ? 'to-build' : p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const subs = sections(p.body, 3)
    const top = blocks(subs[0].body)
    const groups = subs.slice(1).map((s) => ({ title: s.title, ...blocks(s.body) }))
    const n = [...top.tables, ...groups.flatMap((x) => x.tables)].reduce((a, t) => a + t.rows.length, 0)
    total += real ? 0 : n
    const label = now ? 'Now' : real ? 'Waiting on hardware' : 'Still to build'
    return `<li class="rm-step${now ? ' now' : ''}" id="${id}">
    <div class="rm-mark" aria-hidden="true">${icon(now ? 'sparkle' : real ? 'search' : 'layers')}</div>
    <div class="rm-body">
      <p class="eyebrow plain">${esc(label)} · ${n} ${n === 1 ? 'item' : 'items'}</p>
      <h2>${md2(p.title)}</h2>
      ${top.text.map((t) => `<p class="rm-intro">${md2(t)}</p>`).join('')}
      ${top.tables.map((t) => table(t, { waiting: real })).join('')}
      ${groups.map((x) => `<div class="rm-group">
        <h3>${md2(x.title)} <span class="pill muted">${x.tables.reduce((a, t) => a + t.rows.length, 0)}</span></h3>
        ${x.text.map((t) => `<p class="rm-intro">${md2(t)}</p>`).join('')}
        ${x.tables.map((t) => table(t, { waiting: real })).join('')}
      </div>`).join('')}
    </div>
  </li>`
  })
  const v = latest.server?.version
  const body = `
${pageHead({
    eyebrow: 'Roadmap', title: 'Where it’s going',
    lead: 'What’s being finished now, what’s still to build, and what hasn’t met the real world yet. Taken from the project’s own roadmap each time this site is made.',
    meta: [v ? `<span class="pill mono">${esc(v)}</span><span>The newest release</span>` : '', `<span>Made ${esc(longDate(ctx.built || new Date()))}</span>`].join(''),
    buttons: [btn(file, 'The roadmap on GitHub', { iconName: 'external', after: true, external: true }), btn(`${site.docs.discussions}/categories/ideas`, 'Suggest a feature', { kind: 'ghost', iconName: 'sparkle', external: true })].join(''),
  })}
<section class="section">
  <div class="wrap">
    <div class="notice info">${icon('sparkle')}<p><strong>A long alpha, on purpose.</strong> WittyMediaServer stays in alpha until every planned feature is at least partly built. Only then does it move to beta. Nothing here has a date, and plans can change.</p></div>
    ${parts.length ? `<ol class="rm-timeline mt-12">
  ${steps.join('\n  ')}
  <li class="rm-step end" id="beta">
    <div class="rm-mark" aria-hidden="true">${icon('check')}</div>
    <div class="rm-body">
      <p class="eyebrow plain">Then</p>
      <h2>Beta</h2>
      <p class="rm-intro">Once all ${total} of those are at least partly built. What has already landed is in the ${ext(site.docs.changelog, 'changelog')} and on the <a href="/news/">news</a> page.</p>
    </div>
  </li>
</ol>` : `<p class="mt-8 lede">The roadmap couldn’t be fetched for this build. ${ext(file, 'Read it on GitHub')}.</p>`}
  </div>
</section>`
  return { path: '/roadmap/', html: page({ path: '/roadmap/', title: 'Roadmap', description: 'What’s being finished, what’s still to build and what hasn’t been tried on real hardware, from WittyMediaServer’s own roadmap.', body }) }
}
