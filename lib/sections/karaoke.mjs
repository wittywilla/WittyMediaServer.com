// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 WittyWilla and contributors
// Karaoke and the light shows: a band on the front page, and a page of their own at /karaoke/.
// Every claim here is in the server's guide (docs/LYRICS-KARAOKE.md and MUSIC.md): keep them in step.
import { esc } from '../util.mjs'
import { ctx, page, icon, btn, stage, shotOf, shotCard, credit, sectionHead, pageHead, viewer } from '../layout.mjs'

const GUIDE = '/docs/lyrics-karaoke/'
const VIZ_GUIDE = '/docs/music/'

const TICKS = [
  'The singer turned down by itself, in seconds, with nothing to set up',
  'Words that fill in as they’re sung, read from across the room',
  'Voice and Music sliders, the key up or down, and timing you can nudge',
  'Album art, a canvas video or a light show behind the words',
]

/** The front page's karaoke band: what it does, and karaoke on a computer and a phone. */
export function homeKaraoke() {
  if (!shotOf('karaoke-veil')) return ''
  return `<section class="section kar-home" aria-labelledby="kar-home-title">
  <div class="wrap">
    <div class="split kar-split">
      <div class="text">
        <p class="eyebrow">Karaoke night</p>
        <h2 id="kar-home-title">Any song in your library, ready to sing</h2>
        <p>Press <strong>Karaoke</strong> on a song and the words take over the screen. A version with the singer turned down is ready in seconds, made on your own server, and nothing is sent anywhere to make it.</p>
        <ul class="ticks">
          ${TICKS.map((t) => `<li>${icon('check')}<span>${esc(t)}</span></li>`).join('\n          ')}
        </ul>
        <div class="btn-row">
          ${btn('/karaoke/', 'All about karaoke', { kind: 'primary', iconName: 'arrow', after: true })}
          ${btn('/karaoke/#light-shows', 'See the light shows', { kind: 'ghost' })}
        </div>
      </div>
      <div class="kar-pic">
        ${stage('karaoke-veil', 'phone-karaoke')}
        <p class="stage-cap">Karaoke over WittyVisualizer’s Northern Veil, on a computer and a phone. ${credit('karaoke-veil')}</p>
      </div>
    </div>
  </div>
</section>`
}

// What each control does, in the guide's words.
const CONTROLS = [
  ['music', 'Voice and Music', 'A slider for how loud the singer is, and one for the band. With a separated version there’s a slider for each part: drums, bass and the rest.'],
  ['users', 'Voice off, or a guide', 'Take the singer out in one press, or keep them quietly in the background as a guide. Reset puts everything back.'],
  ['sparkle', 'Key', 'Moves the music up to six semitones either way, for the singer, without changing the speed.'],
  ['list', 'Words on time', 'Nudge the words sooner or later a tenth of a second at a time. It stays with that song, for you.'],
  ['book', 'Follow along, or Read', 'Lines that fill in as they’re sung with the next one waiting below, or every word at once to read at your own pace.'],
  ['layout', 'Behind the words', 'The album’s art, its canvas video, or any of WittyVisualizer’s light shows, chosen right there on the karaoke screen.'],
]

const STYLES = ['viz-bars', 'viz-waves', 'viz-drift', 'viz-warp', 'viz-molten', 'viz-veil']
const BEHIND = ['karaoke-veil', 'karaoke-molten', 'karaoke-warp']

/** /karaoke/: karaoke and the light shows, with pictures of each. */
export function karaokePage() {
  const { d } = ctx
  const styles = STYLES.filter(shotOf)
  const behind = BEHIND.filter(shotOf)
  const body = `
${pageHead({
    eyebrow: 'Music',
    title: 'Karaoke and light shows',
    lead: 'Turn any song in your library into karaoke, with the words big enough to read from the sofa and a light show behind them. It’s built in, it’s free, and it runs on your own server.',
    buttons: `${btn('/download/', 'Download', { kind: 'primary', iconName: 'download' })}${btn(GUIDE, 'The karaoke guide', { kind: 'ghost', iconName: 'arrow', after: true })}`,
  })}

<section class="section tight">
  <div class="wrap kar-hero">
    ${stage('karaoke-veil', 'phone-karaoke', { eager: true })}
    <p class="stage-cap">Karaoke on a computer and a phone, with WittyVisualizer’s Northern Veil behind the words. ${credit('karaoke-veil')}</p>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="split">
      <div class="text">
        <p class="eyebrow">Nothing to set up</p>
        <h2>Open karaoke, and it gets ready by itself</h2>
        <ol class="steps">
          <li><strong>A quick version, in a few seconds.</strong> The server turns down what sits in the middle of the mix, which is where most singers are, and it plays straight away.</li>
          <li><strong>A properly separated one, if you want it.</strong> Install Demucs, Spleeter or audio-separator on the server’s computer and it’s found by itself. The better version is made behind the quick one, and the sound changes over when it’s done.</li>
          <li><strong>Next time, it’s there.</strong> What was made is kept, so the song opens straight into karaoke.</li>
        </ol>
        <p class="note">Already have the parts? Stems beside a song, such as <code>Song.vocals.flac</code> or a <code>.stem.mp4</code>, are always used first.</p>
      </div>
      <div class="kar-fact card">
        <span class="tile">${icon('shield')}</span>
        <h3>Honest about the quick version</h3>
        <p>Turning down the middle of the mix can’t take a singer out completely: echoes stay, and a snare or a solo in the middle goes down too. A song that’s close to mono has nothing to separate, and the screen says so. The separated version is the real thing.</p>
      </div>
    </div>
  </div>
</section>

<section class="section tint">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'On the karaoke screen', title: 'Everything a singer reaches for' })}
    <div class="grid three">
      ${CONTROLS.map(([i, t, p]) => `<div class="card"><span class="tile">${icon(i)}</span><h3>${esc(t)}</h3><p>${esc(p)}</p></div>`).join('\n      ')}
    </div>
  </div>
</section>

${behind.length ? `<section class="section">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Behind the words', title: 'Sing over a light show', intro: 'Pick Visualizer behind the words and the effect you chose in the player plays behind them, moving with the music.' })}
    <div class="shots three">
      ${behind.map((id, i) => shotCard(id, i + 1)).join('\n      ')}
    </div>
  </div>
</section>` : ''}

${styles.length ? `<section class="section tint" id="light-shows">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'WittyVisualizer', title: 'Light shows for every song', intro: 'Press Visualizer in the full-screen player, or V, and the music turns into light. Here are six of them, on the same song.' })}
    <div class="shots three">
      ${styles.map((id, i) => shotCard(id, i + 1)).join('\n      ')}
    </div>
    <ul class="ticks mt-8">
      <li>${icon('check')}<span>Bars, Waves and Drift are soft shapes in the artwork’s colours. They don’t flash.</span></li>
      <li>${icon('check')}<span>The rest come after a notice about flashing, once, with the choice of a calm mode.</span></li>
      <li>${icon('check')}<span>WittyVisualizer is a free module from the server’s store, and it also lights up <a href="/player/">WittyMediaPlayer</a>.</span></li>
    </ul>
    <div class="btn-row mt-6">${btn('/modules/wittyvisualizer/', 'About WittyVisualizer', { iconName: 'arrow', after: true })}${btn(VIZ_GUIDE, 'The music guide', { kind: 'ghost', iconName: 'arrow', after: true })}</div>
  </div>
</section>` : ''}

<section class="section">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Where the words come from', title: 'Your lyrics first, and online only if you say so' })}
    <ol class="steps">
      <li><strong>A correction made on your server,</strong> if someone has fixed the words.</li>
      <li><strong>A file beside the song:</strong> <code>Song.lrc</code> for timed words, or <code>Song.txt</code>.</li>
      <li><strong>The song’s own tags,</strong> such as the lyrics in an MP3.</li>
      <li><strong>Online, only if the owner turns it on:</strong> LRCLIB, free and with no account. It’s told the song’s artist, title, album and length, and nothing else.</li>
    </ol>
    <p class="note mt-6">Karaoke needs timed words. No times? Open Lyrics, then Fix, then Tap along, and press Space as each line starts. Your timing is kept on the server for everyone.</p>
  </div>
</section>

${viewer()}`
  return { path: '/karaoke/', html: page({ path: '/karaoke/', title: 'Karaoke and light shows', description: 'Karaoke on any song in your library, with the singer turned down by itself and a light show behind the words. Free and built into WittyMediaServer.', body, active: '/karaoke/', image: '/images/shots/karaoke-veil.webp' }) }
}
