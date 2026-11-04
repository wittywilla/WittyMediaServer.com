// Two pages for people new to all this: a plain guide to media servers at /start/,
// and the legal notes at /legal/. Every fact comes from the server's README and guides.
import fs from 'node:fs'
import path from 'node:path'
import { page, pageHead, sectionHead, btn, ext, icon } from '../layout.mjs'
import { esc } from '../util.mjs'
import { inline } from '../markdown.mjs'

let root = ''
export function gather({ root: r }) { root = r }

const md = (s) => inline(s)
const has = (section) => fs.existsSync(path.join(root, 'lib', 'sections', `${section}.mjs`))
const branchOf = (d) => d.repos[d.site.repos.server]?.branch || 'master'
const onGitHub = (d, file) => `https://github.com/${d.site.repos.server}/blob/${branchOf(d)}/${file}`
/** A guide: on this site when the docs pages are built, otherwise on GitHub. guide(d, 'BACKUP.md', '#making-a-backup') */
const guide = (d, file, hash = '') => has('docs') ? `/docs/${file.replace(/\.md$/, '').toLowerCase().replace(/_/g, '-')}/${hash}` : onGitHub(d, `docs/${file}${hash}`)
const link = (href, label) => href.startsWith('/') ? `<a href="${esc(href)}">${esc(label)}</a>` : ext(href, esc(label))
const cards = (list, cols = 'three', tile = 'tile') => `<div class="grid ${cols}">
      ${list.map(([i, t, p]) => `<div class="card"><span class="${tile}">${icon(i)}</span><h3>${esc(t)}</h3><p>${md(p)}</p></div>`).join('\n      ')}
    </div>`

export function pages(d) {
  return [start(d), legal(d)]
}

// ======================================================================
// New to media servers?
// ======================================================================
function start(d) {
  const s = d.site.say
  const words = [
    ['Media server', 'A program that keeps your films, shows, music and more in one place, and plays them on any screen in your home.'],
    ['Self-hosted', 'It runs on a computer you own, not on someone else’s. Nobody else holds your library.'],
    ['Library', 'One or more folders holding one kind of media, such as Movies or Music.'],
    ['Scan', 'The server looking through a library’s folders for new or changed files.'],
    ['Metadata', 'The details around a file: its poster, plot, cast, year and rating. The server looks them up for you.'],
    ['Profile', 'Each person’s own place on the server, with their own progress and favourites. Kids profiles show only titles up to the age you choose.'],
    ['Module', 'A part of the server you can add or remove, such as disc menus or games.'],
    ['Direct play', 'The file is sent as it is, with nothing converted. It’s the full quality, and it takes almost no work from the server.'],
    ['Transcoding', 'Converting a video while it plays, so a device that can’t play the original can still show it. It uses the server’s processor or graphics chip.'],
    ['Disc image', 'One file holding a whole disc, usually an `.iso`. The server plays it like a disc player, menus and all.'],
    ['NFO', 'A small text file beside a video that holds its title, plot and year.'],
    ['Remote access', 'Reaching your server from outside your home. It’s off until you turn it on.'],
    ['Alpha', 'An early version. It works, but it changes quickly and can fail or lose data.'],
  ]
  const body = `
${pageHead({
    eyebrow: 'Start here', title: 'New to media servers?',
    lead: 'A plain guide for anyone who hasn’t run one before: what a media server is, what you need, and your first hour with WittyMediaServer.',
    buttons: [btn('/download/', 'Download', { kind: 'primary', iconName: 'download' }), has('about') ? btn('/faq/', 'Questions and answers', { kind: 'ghost', iconName: 'arrow', after: true }) : ''].join(''),
  })}
<section class="section">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'The idea', title: 'Three parts, all in your home', intro: 'If you’ve used a streaming service, this will feel familiar. The difference is that the films and music are your own, and so is the computer they’re kept on.' })}
    ${cards([
      ['layers', '1. Your files', 'Films, shows, music, books and photos you already have, in folders on one computer or a NAS.'],
      ['server', '2. The server', 'WittyMediaServer runs on that computer. It sorts your files into libraries, finds posters and details, and remembers where everyone got to.'],
      ['devices', '3. Your screens', 'Phones, tablets, laptops and TVs open the server in a web browser over your home network. The apps are optional.'],
    ])}
    <p class="mt-6 muted">${esc(s.noMedia)} It doesn’t sell, rent or stream films from anywhere else: it plays what you put in its folders.</p>
  </div>
</section>
<section class="section tint">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Before you start', title: 'What you need' })}
    ${cards([
      ['monitor', 'A computer that stays on', 'Windows 10 or 11, macOS 11 or newer, Linux, FreeBSD 14 or newer, or a NAS that runs Docker. It has to be on while anyone watches.'],
      ['film', 'Your own media', 'Files you have the right to use. DVDs and Blu-rays play as disc images or folders. Encrypted discs are refused, and nothing here removes copy protection.'],
      ['devices', 'A browser on each screen', 'Nothing else to install there. The download for the server already includes FFmpeg, the program that converts video, and its database.'],
      ['network', 'Internet, now and then', 'For posters and details, for adding modules and for updates. Watching at home doesn’t depend on it, and nothing needs an account with anyone.'],
    ], 'two')}
    <div class="prose mt-8">
      <h3>How powerful a computer?</h3>
      <p>When a device can play a file as it is, the server only has to send it, which takes almost no work. When it can’t, the server converts the video as it plays, and that’s what takes real processor time. A graphics chip can do most of that work, which lets a small machine serve several people. ${link(guide(d, 'TRANSCODING.md'), 'Live transcoding')} explains the choices.</p>
    </div>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <div class="split">
      <div class="text">
        <p class="eyebrow">Step by step</p>
        <h2>Your first hour</h2>
        <ol class="steps">
          <li><strong>Download the server</strong> for the computer that holds your media, from the <a href="/download/">download page</a>.</li>
          <li><strong>Open it.</strong> On Windows and a Mac your browser opens the setup page. Elsewhere, go to <code>http://&lt;this computer&gt;:9797</code>.</li>
          <li><strong>Make your account.</strong> It looks after libraries, people and settings. Keep the password safe: forgetting it is hard to undo.</li>
          <li><strong>Choose what you want.</strong> Films, TV and music work straight away. Tick discs, games, photos or books to add their modules.</li>
          <li><strong>Add a library.</strong> Pick a kind of media, such as Movies, and the folder it’s in. Titles appear as they’re found, and posters fill in after them.</li>
          <li><strong>Press Play.</strong> Open a poster and press <strong>Play</strong>. Next time you’ll see <strong>Resume from</strong>.</li>
          <li><strong>Try another screen.</strong> Type the server’s address, such as <code>http://192.168.1.20:9797</code>, into the browser on your TV or phone. Setup’s last page shows it.</li>
          <li><strong>Add the family.</strong> Under <strong>Settings → Profiles</strong>, give each person a profile of their own.</li>
        </ol>
        <div class="btn-row">${btn(guide(d, 'GETTING_STARTED.md'), 'Getting started guide', { kind: 'primary', iconName: 'arrow', after: true, external: !has('docs') })}</div>
      </div>
      <div class="text">
        <p class="eyebrow">Worth doing first</p>
        <h2>Tidy folders get the right posters</h2>
        <p>The server finds videos in any layout, but a tidy one gets you the right titles. Keep films and shows in separate folders, put the year after a film’s title, and number episodes like <code>S02E01</code>:</p>
        <div class="prose"><pre><code>Movies/
  The Long Harbour (2001)/The Long Harbour (2001).mkv
  Paper Lanterns (2014).mp4
TV Shows/
  Night Ferry/
    Season 02/
      Night Ferry - S02E01 - The Crossing.mkv</code></pre></div>
        <p>${link(guide(d, 'LIBRARIES.md'), 'Libraries')} covers music, books, photos and every other kind.</p>
      </div>
    </div>
  </div>
</section>
<section class="section tint">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Good habits', title: 'Start safely' })}
    ${cards([
      ['copy', 'Keep backups', `A backup holds the server’s accounts, libraries and settings, not your media, so keep your own copy of your files too. See [Backup and restore](${guide(d, 'BACKUP.md')}).`],
      ['home', 'Stay at home first', `The server only answers on your home network until you turn on **Settings → Remote Access**. The safest remote access is none, so read [Remote access](${guide(d, 'REMOTE.md')}) before you change that.`],
      ['sparkle', 'Expect an alpha', s.alpha],
      ['shield', 'Read before you add', 'Modules from this project are signed and checked. A store or fork from someone else is their code on your server, so only add one you trust.'],
      ['lock', 'Only your own media', 'Add files you have the right to use, and keep the server to people you trust. The [legal notes](/legal/) say who’s responsible for what.'],
      ['heart', 'Ask when stuck', `[Troubleshooting](${guide(d, 'TROUBLESHOOTING.md')}) goes by what you’re seeing, and [Discussions on GitHub](${d.site.docs.discussions}) is the place for questions.`],
    ])}
  </div>
</section>
<section class="section">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Words you’ll see', title: 'A short glossary', intro: 'Every guide uses these the same way.' })}
    <div class="table-wrap"><table>
      <thead><tr><th>Word</th><th>What it means</th></tr></thead>
      <tbody>
        ${words.map(([w, m]) => `<tr><td><strong>${esc(w)}</strong></td><td>${md(m)}</td></tr>`).join('\n        ')}
      </tbody>
    </table></div>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <div class="cta">
      <h2>Ready when you are</h2>
      <p>Install the server, open its page in a browser, and point it at a folder of films. Setup takes a few minutes.</p>
      <div class="btn-row">
        ${btn('/download/', 'Download', { kind: 'primary large', iconName: 'download' })}
        ${btn('/server/', 'See what it does', { kind: 'large', iconName: 'arrow', after: true })}
      </div>
    </div>
  </div>
</section>`
  return { path: '/start/', html: page({ path: '/start/', title: 'New to media servers?', description: 'A plain guide to media servers for first-timers: what one is, what you need, your first hour with WittyMediaServer, and the words you’ll see.', body, active: '/start/' }) }
}

// ======================================================================
// Legal notes
// ======================================================================
function legal(d) {
  const s = d.site.say
  const readme = (hash) => onGitHub(d, `README.md${hash}`)
  const parts = [
    ['licence', 'The licence', [
      `WittyMediaServer is licensed under the ${ext('https://www.apache.org/licenses/LICENSE-2.0', 'Apache License 2.0')}. You can use, change and share it, commercially or not, as long as you keep the licence and the attribution in its ${ext(onGitHub(d, 'NOTICE'), 'NOTICE')} file: “This product includes WittyMediaServer, developed by WittyWilla”.`,
      `A few separate programs have licences of their own, and each is listed in the app and in ${ext(onGitHub(d, 'THIRD_PARTY_LICENSES.md'), 'THIRD_PARTY_LICENSES.md')}. Each module states its licence on <a href="/modules/">its page</a>.`,
    ]],
    ['your-media', 'Your media, your responsibility', [
      `${esc(s.noMedia)} It organises and streams media you already have the right to use. It doesn’t provide, host, own or check any of it.`,
      'Whoever runs a server, and everyone using it, is responsible for the files they add and share, and for following the laws where they and their viewers live. The authors and contributors accept no liability for media stored on, played from or shared through a server, nor for how a server is used.',
    ]],
    ['copy-protection', 'Copy protection', [
      'Copy protection is never decrypted or bypassed. CSS-scrambled DVDs and AACS-encrypted Blu-rays are refused, encrypted TV channels are refused and never recorded, and encrypted game files are refused. Each says so with a plain message.',
      'Encrypted media isn’t supported, and no module, setting or plugin changes that.',
    ]],
    ['games', 'Games', [
      'No games, and none of the system files some games need, come with this software, and the project doesn’t link to them. Use only files you’ve obtained legally.',
      'The programs that run games are separate downloads that an administrator chooses to add, each under its own licence.',
    ]],
    ['outside', 'Outside services and their content', [
      'Search results, details, artwork, podcasts, radio stations, TV channels and guides, and game details come from third parties. They aren’t created by, associated with, endorsed by or checked by the WittyMediaServer project, its contributors or affiliates. Each service’s terms apply to its data.',
      'This product uses the TMDB API but is not endorsed or certified by TMDB. TV information is provided by TheTVDB and TVmaze (CC BY-SA 4.0), movie and game facts by Wikidata (CC0) and Wikipedia (CC BY-SA 4.0), anime by AniList, definitions by the Free Dictionary API, and podcast search by the Apple Podcasts directory.',
      `Video is converted by FFmpeg, run as a separate program. The builds that come with the server are GPL-licensed, with their sources linked from ${ext(onGitHub(d, 'THIRD_PARTY_LICENSES.md'), 'THIRD_PARTY_LICENSES.md')}.`,
    ]],
    ['trademarks', 'No affiliation, and trademarks', [
      'WittyMediaServer is an independent open-source project. It isn’t affiliated with, sponsored by or endorsed by any other media software project, studio, console maker, service or rights holder, or by the makers of the formats, discs and devices it works with.',
      'Third-party names on this site and in the software only describe what it works with or where information came from, and belong to their owners. “DVD” is a trademark of DVD Format/Logo Licensing Corporation; “Blu-ray” and “Blu-ray Disc” are trademarks of the Blu-ray Disc Association. This software isn’t a licensed or certified DVD or Blu-ray product.',
    ]],
    ['warranty', 'No warranty', [
      `Provided “as is”, without warranty of any kind, as the licence says. ${esc(s.alpha)}`,
    ]],
    ['site', 'This website', [
      `wittymediaserver.com is the website of the WittyMediaServer project. ${esc(s.privacy)}${has('about') ? ' The <a href="/privacy/">privacy page</a> covers the server itself.' : ''}`,
      `${esc(s.shotsNote)} Every work shown is named, with its licence, in ${ext(d.site.docs.credits, 'the credits')}.`,
      `To report a security problem, see the ${ext(d.site.docs.security, 'security policy')}. For anything else, ${ext(d.site.docs.issues, 'open an issue')} on GitHub.`,
    ]],
  ]
  const body = `
${pageHead({
    eyebrow: 'Legal', title: 'Legal notes',
    lead: 'Plain-language notes about the software and this website. They aren’t legal advice, and local law applies to how you use it.',
    buttons: btn(readme('#licence-and-legal'), 'The README’s legal section', { kind: 'ghost', iconName: 'external', after: true, external: true }),
  })}
<section class="section">
  <div class="wrap narrow">
    <div class="notice info">${icon('shield')}<p>The app’s own <strong>Legal</strong> page, under <strong>Settings → Legal</strong> or at <code>/legal</code> on any server, has the full text, including the list of every outside service your server talks to.</p></div>
    <div class="prose mt-8">
      ${parts.map(([id, title, paras]) => `<h2 id="${id}">${esc(title)}</h2>\n      ${paras.map((p) => `<p>${p}</p>`).join('\n      ')}`).join('\n      ')}
    </div>
  </div>
</section>`
  return { path: '/legal/', html: page({ path: '/legal/', title: 'Legal notes', description: 'The licence, who is responsible for what, copy protection, games, outside services, trademarks and the warranty, in plain words.', body, active: '/legal/' }) }
}
