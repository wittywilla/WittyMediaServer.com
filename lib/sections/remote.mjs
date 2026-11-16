// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 WittyWilla and contributors
// Reaching your server from away, peer to peer: a section for the home page and a page at /remote/.
// Every fact comes from the server's docs/REMOTE.md ("Peer-to-peer connections") and docs/P2P.md,
// and the apps' CHANGELOG for which apps have it; nothing is claimed beyond them.
import { page, pageHead, sectionHead, btn, icon } from '../layout.mjs'
import { esc } from '../util.mjs'
import { inline } from '../markdown.mjs'

const md = (s) => inline(s)
const guide = (hash = '') => `/docs/remote/${hash}`
const DESIGN = 'https://github.com/wittywilla/WittyMediaServer/blob/master/docs/P2P.md'

// How an app finds its way to the server, best first (P2P.md, "The layers").
const LAYERS = [
  ['home', 'At home', 'On your own Wi-Fi or cable, the app talks to the server as it always has. Peer to peer isn’t involved.'],
  ['network', 'Straight there', 'Over IPv6 where your connection has it, with your router asked to let it through.'],
  ['server', 'A port your router opens', 'If your router offers it (UPnP, NAT-PMP or PCP), the server asks for one port, renews it, and removes it when you turn this off.'],
  ['devices', 'Hole punching', 'Your device and your server connect to each other at the same moment, so both routers let it through. Works with most home and mobile networks.'],
  ['users', 'A community relay, last', 'Another WittyMediaServer whose owner chose to help other servers carries the connection, slowly, when nothing else works. It can’t read it.'],
]

// What protects it (REMOTE.md and P2P.md, "The security model").
const SAFETY = [
  ['lock', 'Encrypted to your server’s key', 'Whatever path it takes, the connection is encrypted and authenticated from end to end to a key only your server holds. A relay can refuse to help; it can’t read, change or pretend to be your server.'],
  ['shield', 'Only devices you approved', 'Your server keeps a list of devices that may connect. Anything else is cut off before a byte is read, and strangers never see a sign-in page to attack.'],
  ['users', 'Still a password', 'Being on the list signs nobody in. A paired device reaches the sign-in page, with the same passwords, two-factor codes and lockouts as anyone from outside.'],
  ['tv', 'Always “away”', 'A peer-to-peer connection always counts as away from home, however it arrives: the limits for viewers away from home apply, and password-free profiles don’t.'],
  ['server', 'Nothing until you turn it on', 'Off, there’s no connection, nobody is contacted and the router is asked for nothing. Turning it off closes everything and removes the port.'],
  ['list', 'Written down', 'Turning it on, each device added or removed, each invite and each refusal go in the server’s log. Removing a device cuts it off at once.'],
]

// Which apps have it (WittyMediaClient's CHANGELOG), with how far each has been tried.
const APPS = [
  ['monitor', 'Desktop app', 'macOS, Windows and Linux. The title bar says how it’s connected: direct, or through a relay.', 'Tried on a Mac against a real server, on one network. Not yet on Windows or Linux; not in the FreeBSD package yet.'],
  ['phone', 'iPhone and iPad', '**You → From away** says how the server is being reached, and the app carries on where it was when it comes back to the screen.', 'Tried in the iPhone simulator against a real server; the iPad hasn’t been tried. Never on a real device yet.'],
  ['tv', 'Apple TV', 'The same, and a TV that has never been home joins with a code it shows.', 'Tried in the simulator, including joining by a code. Never on a real Apple TV yet.'],
  ['phone', 'Android', 'Phones, tablets and TVs. **You → From away**, invite links, and **Join from away** for a device that has never been home.', 'Seen on a phone emulator: reconnected from away and played a film through the connection. Tablets, TVs, invite links and joining by a code not tried yet.'],
]

// The comparison, as REMOTE.md has it.
const COMPARE = {
  head: ['', 'Tailscale or NetBird', 'Peer to peer', 'Forwarding a port'],
  rows: [
    ['Who can reach the sign-in page', 'Devices on your private network', 'Devices on your server’s own list', '**Anyone on the internet**'],
    ['Set up on the router', 'Nothing', 'Nothing', 'A forwarded port'],
    ['An account with a company', 'Yes', 'No', 'No'],
    ['Who helps devices find each other', 'That company’s servers', 'Volunteers’ computers on a public network', 'Nobody: you give out an address'],
    ['How proven', 'Used by millions, audited', '**New in this release, never audited**', 'As old as the internet, and attacked constantly'],
    ['Works from a web browser', 'Yes', '**No: it needs the app**', 'Yes'],
    ['Works with every router', 'Nearly', 'With most. Not when both ends have a strict router and nobody offers a relay', 'If your provider gives you a real address'],
  ],
}

// Who is contacted, and what they can see (REMOTE.md "What it exposes", P2P.md "Who is contacted").
const CONTACTS = [
  ['Starting points of the public IPFS network (bootstrap.libp2p.io)', 'The way into the network apps find your server on', 'Your server’s connection ID, your home’s internet address, and that it runs WittyMediaServer'],
  ['Other people’s computers that keep that network’s address book', 'Keeping your server findable, and looking it up', 'The same. One asked where your server is also sees the address of whoever asked'],
  ['Computers that dial back', 'Checking whether your server can be reached from outside', 'The addresses they were asked to try'],
  ['Relays', 'Introducing a device to your server; a community relay can carry the connection', 'Both internet addresses, when, and how much is sent. **Never what is sent**: it’s encrypted'],
  ['Your own router', 'Opening a port, if you leave that on', 'A request on your home network. Nothing leaves your home for it'],
]

const NOT_YET = [
  'Not tried across two real home routers. Hole punching is tested through a simulated firewall, and the whole path on the public network from one machine.',
  'Never on a real Apple TV, iPhone or iPad, or a real Android device: in simulators and emulators only.',
  'No independent security audit, of this or of the libraries it’s built on.',
  'Community relays need owners to offer them, and none do yet. Without one, two strict routers can’t be joined.',
  'A TV joining by a code has only met its server on one machine.',
]

const table = ({ head, rows }, caption) => `<div class="table-wrap"><table>
  <caption class="sr-only">${esc(caption)}</caption>
  <thead><tr>${head.map((h) => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead>
  <tbody>${rows.map(([first, ...rest]) => `<tr><th scope="row">${esc(first)}</th>${rest.map((c) => `<td>${md(c)}</td>`).join('')}</tr>`).join('\n  ')}</tbody>
</table></div>`

const layerList = () => `<ol class="p2p-layers">
      ${LAYERS.map(([i, t, p], n) => `<li><span class="p2p-step" aria-hidden="true">${n + 1}</span><span class="tile">${icon(i)}</span><div><h3>${esc(t)}</h3><p>${esc(p)}</p></div></li>`).join('\n      ')}
    </ol>`

/** The home page's section, right under the hero. */
export function homeRemote() {
  return `<section class="section p2p-home" aria-labelledby="p2p-home-title">
  <div class="wrap">
    <div class="p2p-panel">
      <div class="p2p-intro">
        <p class="eyebrow">New in 0.8.0-alpha · Remote access</p>
        <h2 id="p2p-home-title">Your server, from anywhere. Nothing to set up on the router.</h2>
        <p class="p2p-lead">Turn on peer-to-peer connections and the app on your phone, TV or laptop finds its own way home: <strong>no port forwarding, no rented server, and no account with anyone.</strong></p>
        <ul class="ticks">
          <li>${icon('check')}<span>Encrypted from end to end, to a key only your server holds</span></li>
          <li>${icon('check')}<span>Only devices you approved can connect, and they still sign in</span></li>
          <li>${icon('check')}<span>Always counts as away from home, with your limits for viewers away</span></li>
          <li>${icon('check')}<span>In the desktop, iPhone, iPad, Apple TV and Android apps. A browser away from home needs the app</span></li>
          <li>${icon('check')}<span>A TV that has never been home joins with a code it shows</span></li>
        </ul>
        <div class="btn-row">
          ${btn('/remote/', 'How it works', { kind: 'primary', iconName: 'arrow', after: true })}
          ${btn(guide('#turning-it-on'), 'Turn it on', { kind: 'ghost' })}
        </div>
      </div>
      <div class="p2p-path">
        <p class="eyebrow plain">How the app finds its way, best first</p>
        ${layerList()}
      </div>
    </div>
    <p class="p2p-note muted">Off until you turn it on. New in this release and never audited: if you’re happy to make an account, Tailscale is still the better-proven choice. <a href="/remote/#compare">How they compare</a>.</p>
  </div>
</section>`
}

function remote(d) {
  const body = `
${pageHead({
    eyebrow: 'Remote access', title: 'Your server, from anywhere',
    lead: 'The app on your phone, TV or laptop finds its own way to your server and connects to it directly. Nothing is set up on your router, nothing is rented, and there’s no account with anyone. It’s built into the server and the apps, and it’s off until you turn it on.',
    buttons: [btn(guide('#turning-it-on'), 'Turn it on', { kind: 'primary', iconName: 'arrow', after: true }), btn(guide('#peer-to-peer-connections'), 'The guide', { iconName: 'book' }), btn(DESIGN, 'The design, for developers', { kind: 'ghost', iconName: 'external', after: true, external: true })].join(''),
    meta: '<span class="pill mono">0.8.0-alpha</span><span>Server and apps</span>',
  })}
<section class="section">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'How it works', title: 'Layers, best first', intro: 'The app tries each way in turn and uses the best that works. It keeps looking: a relayed connection is swapped for a direct one as soon as one can be made, without stopping what’s playing, and moving to another network starts the search again.' })}
    ${layerList()}
    <p class="mt-6 muted">Apps find your server through the public IPFS network’s address book, by its <strong>connection ID</strong>: a long name starting <code>12D3KooW</code>, the public half of your server’s key. They also remember where it was last time and try that first.</p>
  </div>
</section>
<section class="section tint">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Safety', title: 'Only your devices, and only encrypted', intro: 'This is a way into your home, so it’s built to keep strangers out even when they know where you are.' })}
    <div class="grid three">
      ${SAFETY.map(([i, t, p]) => `<div class="card"><span class="tile">${icon(i)}</span><h3>${esc(t)}</h3><p>${esc(p)}</p></div>`).join('\n      ')}
    </div>
  </div>
</section>
<section class="section" id="apps">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'The apps', title: 'Which apps connect this way', intro: 'Each app pairs itself while it’s at home and signed in. Later, when it can’t find the server at home, it connects peer to peer by itself, still signed in.' })}
    <div class="grid two">
      ${APPS.map(([i, t, p, tried]) => `<div class="card"><span class="tile">${icon(i)}</span><h3>${esc(t)}</h3><p>${md(p)}</p><p class="p2p-tried">${esc(tried)}</p></div>`).join('\n      ')}
    </div>
    <div class="notice info mt-8">${icon('sparkle')}<p><strong>A web browser away from home needs the app.</strong> A web page can’t make the connections this needs. At home, any browser works as before; away, use the app, or one of the <a href="${guide('#which-way-should-i-choose')}">other ways in</a>.</p></div>
  </div>
</section>
<section class="section tint" id="join">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Adding a device', title: 'At home, by a link, or by a code' })}
    <div class="grid three">
      ${[
        ['home', 'At home', 'Open the app on each phone, TV and laptop while it’s on your home network and signed in. Within a minute it adds itself to **Devices that may connect**.'],
        ['copy', 'By a link', 'For a device that isn’t at home: **Invite a device that isn’t at home** makes a link that works once, for fifteen minutes. Send it the way you’d send a password.'],
        ['tv', 'By a code a TV shows', 'A TV that has never been home chooses **Join from away** and shows eight letters and digits. Type them into your server’s Remote Access page with your password, and it finds its way and signs in.'],
      ].map(([i, t, p]) => `<div class="card"><span class="tile">${icon(i)}</span><h3>${esc(t)}</h3><p>${md(p)}</p></div>`).join('\n      ')}
    </div>
  </div>
</section>
<section class="section" id="compare">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Choosing', title: 'How it compares', intro: 'The same idea as a private network: only devices you approved can connect, and everything is encrypted between the device and your server.' })}
    ${table(COMPARE, 'Peer-to-peer connections compared with Tailscale or NetBird and with forwarding a port')}
    <p class="mt-6">${esc('Our view: if you’re happy to make an account, Tailscale is still the better choice, because it has been tested by far more people than this has. If you aren’t, this is much safer than forwarding a port, because strangers never see a sign-in page to attack.')}</p>
  </div>
</section>
<section class="section tint" id="who">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Privacy', title: 'Who it contacts, and what they see', intro: 'With it on, your server becomes one of many computers on a public network, which is how apps find it. The honest list:' })}
    ${table({ head: ['Who', 'Why', 'What they learn'], rows: CONTACTS }, 'Who peer-to-peer connections contact, and what each learns')}
    <p class="mt-6"><strong>Nobody on that network ever sees</strong> your media, your file names, your passwords, your accounts, or what you watch. Anyone who has your connection ID can look up your home’s internet address, but can’t connect with it: the server gives the ID only to signed-in accounts, and you can make a new one.</p>
  </div>
</section>
<section class="section" id="on">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Turning it on', title: 'Four steps' })}
    <ol class="p2p-steps">
      <li><strong>Lock down your accounts first.</strong> A paired device still needs a password, so make it a good one, with two-factor sign-in.</li>
      <li>On the server, open <strong>Settings → Remote Access → Peer-to-peer connections</strong>. It lists everyone who’ll be contacted. Tick the box and choose <strong>Turn on peer-to-peer connections</strong>.</li>
      <li>Open the app on each device while it’s at home and signed in. It pairs itself within a minute. Use a link or a code for devices that aren’t at home.</li>
      <li>Test it: turn off Wi-Fi on your phone and open the app on mobile data. It should connect within about half a minute the first time.</li>
    </ol>
    <p class="mt-6 muted">It works with <strong>Home network only</strong> still chosen, which keeps every other way in closed. <strong>Help other servers</strong> lets a server that can be reached from outside be a community relay for up to 16 others, 2 GiB each at most, and it sees none of what they send. With it on, the server uses about 60 to 75 MB more memory; off, next to nothing.</p>
    <div class="btn-row mt-6">${btn(guide('#peer-to-peer-connections'), 'Read the whole guide', { kind: 'primary', iconName: 'arrow', after: true })}</div>
  </div>
</section>
<section class="section tint" id="not-yet">
  <div class="wrap narrow">
    ${sectionHead({ eyebrow: 'Honestly', title: 'What hasn’t been tried yet' })}
    <ul class="p2p-notyet">
      ${NOT_YET.map((t) => `<li>${icon('sparkle')}<span>${esc(t)}</span></li>`).join('\n      ')}
    </ul>
  </div>
</section>`
  return { path: '/remote/', html: page({ path: '/remote/', title: 'Remote access', description: 'Reach your WittyMediaServer from anywhere with peer-to-peer connections: no port forwarding, no rented server and no account, encrypted to your server’s key and open only to devices you approved.', body, active: '/remote/' }) }
}

export function pages(d) {
  return [remote(d)]
}
