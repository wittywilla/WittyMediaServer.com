# wittymediaserver.com

The website of [WittyMediaServer](https://github.com/wittywilla/WittyMediaServer) and every project under it: the server, its apps, its modules and its news.

It's a folder of plain files, built from this repository and from GitHub by one command, and uploaded to any web host. No database, no server program, no cookies and no trackers.

## Building and checking

You need Node.js 20 or newer, and nothing else: there are no packages to install.

| Command | What it does |
|---|---|
| `node build.mjs --preview` (`npm run preview`) | Builds the site into `site/` and shows it at http://localhost:4173 |
| `node build.mjs` (`npm run site`) | Builds `site/` and `site.zip` without showing them |
| `node build.mjs --offline` | Builds from what was fetched from GitHub last time |
| `node check.mjs` | Checks the last build's links, pictures and words. Every build runs these checks too, and fails on a problem |

`npm run build` fails on purpose: it's the web host's build command, and only the `live` branch, which holds the built site, may be published.

**Publishing** happens only from `main`: `.github/workflows/publish.yml` builds it on every push there and every hour, and puts the result on `live`. Work for the next release goes to its own branch, such as `v0.8.0-alpha`, and nothing is published from it. **[UPDATING.md](UPDATING.md)** has the whole routine: writing news, changing words, taking the pictures, and how the publishing is set up.

## What's here

| Folder or file | What it is |
|---|---|
| `content/site.json` | Sentences every page shares, and links |
| `content/look.json` | The server's layouts (experiences) and colour themes, copied by `tools/sync-look.mjs` |
| `content/news/` | News articles, one Markdown file each |
| `content/projects.json` | The projects page |
| `content/shots.json` | Which screenshots the site shows, and their captions |
| `lib/pages.mjs` | Every page |
| `lib/layout.mjs` | The frame around every page, and the pieces pages share |
| `lib/data.mjs`, `lib/github.mjs` | Gathering releases, the module catalog and the guides from GitHub, and the site's own pictures |
| `style/site.css` | The look, in the server's own design language: its tokens, themes, pill tabs, tab bar, tiles and shelves |
| `scripts/site.js` | The colour picker, the phone's More sheet, the Try it page, filters, picture viewer and the check for newer releases |
| `images/shots/`, `images/looks/` | Screenshots of the server, and Home in every layout and theme for the Try it page |
| `tools/shots/` | The scripts that take, credit and compress those pictures |
| `build.mjs` | Builds `site/` and `site.zip` |
| `check.mjs` | Checks links, pictures and words. Every build runs it |
| `content/licences.json` | The licence and credit of every work in the screenshots. A picture without one is left out of the build |

## How it's built

- **Content from GitHub.** Releases and their files, the server's changelog, the signed module catalog and the guides are fetched on each build and kept in `cache/`, so a build also works offline. Module icons are checked against the catalog's checksums.
- **The server's look.** Colours come from the server's themes, and type, spacing, shapes and motion from its design tokens; the frame borrows the app's own parts (pill tabs, a floating tab bar on phones, icon tiles, shelves). Visitors can wear any of the server's themes, and the Try it page shows Home in every layout and theme.
- **Phones first.** Every page is laid out for a phone and grows from there, works with a keyboard, and reads without JavaScript.
- **Small and private.** No outside fonts, scripts or trackers. A strict Content Security Policy allows the page to talk only to itself and, to check for newer releases, GitHub.
- **Old addresses kept.** Pages are folders with an `index.html`, so every address of the old site still works on any host.

**Working on a Mac?** Start with WittyMediaServer's [MAC-START-HERE.md](https://github.com/wittywilla/WittyMediaServer/blob/v0.8.1-alpha/MAC-START-HERE.md): what to install, what to clone, and every Mac task in order.

## Licence

Licensed under the GNU Affero General Public License v3.0 (or later): see [LICENSE](LICENSE) and [NOTICE](NOTICE). The screenshots it shows keep their own open licences, recorded in `content/licences.json`.

## Legal

wittymediaserver.com is the website of an independent open-source project. WittyMediaServer isn't associated with, sponsored by or endorsed by the makers of the formats, discs, devices or services it works with. No media comes with it. The screenshots show a test server filled with openly licensed and public-domain media, each credited in [the credits](https://github.com/wittywilla/WittyMediaServer/blob/master/docs/images/CREDITS.md). Any third-party names here only describe what it works with, and belong to their owners. It's provided “as is”, with no warranty; see [LICENSE](LICENSE). Local law applies to how you use it. This isn't legal advice.
