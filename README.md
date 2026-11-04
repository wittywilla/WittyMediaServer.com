# wittymediaserver.com

The website of [WittyMediaServer](https://github.com/wittywilla/WittyMediaServer) and every project under it: the server, its apps, its modules and its news.

It's a folder of plain files, built from this repository and from GitHub by one command, and uploaded to any web host. No database, no server program, no cookies and no trackers.

```bash
node build.mjs --preview
```

builds the site into `site/` and shows it at http://localhost:4173. **[UPDATING.md](UPDATING.md)** has the whole routine: writing news, changing words, and how GitHub and Hostinger publish each change by themselves.

## What's here

| Folder or file | What it is |
|---|---|
| `content/site.json` | Sentences every page shares, links, and the themes on offer |
| `content/news/` | News articles, one Markdown file each |
| `content/projects.json` | The projects page |
| `content/shots.json` | Which screenshots the site shows, and their captions |
| `lib/pages.mjs` | Every page |
| `lib/layout.mjs` | The frame around every page, and the pieces pages share |
| `lib/data.mjs`, `lib/github.mjs` | Gathering releases, the module catalog, themes and pictures from GitHub |
| `style/site.css` | The look, built on the server's own design and themes |
| `scripts/site.js` | The theme picker, phone menu, filters, picture viewer and the check for newer releases |
| `images/themes/` | Screenshots taken in each of the server's themes |
| `build.mjs` | Builds `site/` and `site.zip` |
| `check.mjs` | Checks links, pictures and words. Every build runs it |
| `reference/text/` | The words of the old site, kept for reference |

Nothing needs installing apart from Node.js 20 or newer.

## How it's built

- **Content from GitHub.** Releases and their files, the server's changelog, the signed module catalog, screenshots and their credits, and the server's themes are fetched on each build and kept in `cache/`, so a build also works offline. Module icons are checked against the catalog's checksums.
- **The server's look.** Colours come from the server's `themes/*/theme.json`; type, spacing, shapes and motion follow its design tokens. Visitors can pick any of the server's themes, and screenshots follow where there's one in that theme.
- **Phones first.** Every page is laid out for a phone and grows from there, works with a keyboard, and reads without JavaScript.
- **Small and private.** No outside fonts, scripts or trackers. A strict Content Security Policy allows the page to talk only to itself and, to check for newer releases, GitHub.
- **Old addresses kept.** Pages are folders with an `index.html`, so every address of the old site still works on any host.

## Legal

wittymediaserver.com is the website of an independent open-source project. WittyMediaServer isn't associated with, sponsored by or endorsed by the makers of the formats, discs, devices or services it works with. No media comes with it. The screenshots show a test server filled with openly licensed and public-domain media, each credited in [the credits](https://github.com/wittywilla/WittyMediaServer/blob/master/docs/images/CREDITS.md). Any third-party names here only describe what it works with, and belong to their owners. It's provided “as is”, with no warranty; see [LICENSE](LICENSE). Local law applies to how you use it. This isn't legal advice.

Licensed under the Apache License 2.0: see [LICENSE](LICENSE) and [NOTICE](NOTICE). The screenshots it shows keep their own open licences, recorded in `content/licences.json`.
