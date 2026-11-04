# Updating the site

Everything you need to keep wittymediaserver.com current. No programming needed: you change a text file or two, run one command, and upload a ZIP.

- [What updates by itself](#what-updates-by-itself)
- [Build the site](#build-the-site)
- [Look at it before uploading](#look-at-it-before-uploading)
- [Upload it to Hostinger](#upload-it-to-hostinger)
- [Write a news article](#write-a-news-article)
- [Change the words on a page](#change-the-words-on-a-page)
- [Add or change a screenshot](#add-or-change-a-screenshot)
- [Add a project](#add-a-project)
- [When something goes wrong](#when-something-goes-wrong)
- [Going live the first time](#going-live-the-first-time)

## What updates by itself

Each build fetches these from GitHub, so you only need to build and upload:

| What | Where it comes from |
|---|---|
| Releases, their notes and download files | The GitHub releases of WittyMediaServer, WittyMediaClient, WittyMediaPlayer and WittyReader |
| What's in each server version | The server's `CHANGELOG.md` |
| Modules: names, icons, descriptions, versions | The signed catalog in WittyModuleCatalog |
| Screenshots and their credits | `docs/images/` in each repository, and its `CREDITS.md` |
| Colours and themes | The server's `themes/` folder |

The news and module pages also check GitHub when someone opens them, and show a release that's come out since your last upload. Its own page arrives with the next upload.

## Build the site

You need [Node.js](https://nodejs.org) 20 or newer, which is already on the development machine.

1. Open a terminal in this folder, `D:\projects\wittymediaserver.com`.
2. Run:

   ```bash
   node build.mjs
   ```

3. It prints what it did, ending with something like *Built 39 pages … and site.zip to upload*. Lines starting with **✗** are problems to fix before uploading; lines starting with **!** are worth a look but don't stop anything.

The finished site is in the `site` folder, and the same thing packed as `site.zip`.

No internet? `node build.mjs --offline` builds from what was fetched last time.

If the GitHub CLI is signed in (`gh auth status`), the build uses it, which lets it ask GitHub more often. Without it, it works too, up to about 60 requests an hour.

## Look at it before uploading

```bash
node build.mjs --preview
```

This builds, then shows the site at http://localhost:4173. Press **Ctrl+C** in the terminal to stop it. `node build.mjs --serve` shows the last build without building again.

## Upload it to Hostinger

1. Sign in to Hostinger and open **hPanel**.
2. Choose **Websites**, then **Dashboard** beside wittymediaserver.com, then **File manager**.
3. Open the **public_html** folder.
4. **The first time only:** delete what's in `public_html` (keep a copy if you like, with **Download**).
5. Click **Upload** (the arrow at the top right), choose **File**, and pick `site.zip` from this folder.
6. Right-click `site.zip` in the file manager, choose **Extract**, and extract into `public_html` itself (leave the folder name empty, or `.`). Say yes to replacing files.
7. Delete `site.zip` from `public_html`.
8. Open https://wittymediaserver.com and check it. A hard refresh (**Ctrl+F5**) makes sure you see the new version.

Why a ZIP rather than dragging the folder in: the site has a hidden file, `.htaccess`, that sets up the not-found page and security settings, and dragging a folder can leave hidden files behind.

Old files can stay: every page is replaced, styles and scripts have new names each time they change, and nothing links to what's left over. To tidy up now and then, delete everything in `public_html` before extracting.

## Write a news article

1. In `content/news/`, copy `_template.md` to a new file named with the date and a few words, such as `2026-11-10-new-tv-guide.md`. The words after the date become its address: `/news/new-tv-guide/`.
2. Open it in any text editor, change the lines at the top, delete `draft: true`, and write the article below the second line of dashes. The template explains each line.
3. Build, look, upload.

An article about a release links to it both ways: the release's page shows the article, and the article links to the release's notes and downloads.

To take an article down, add `draft: true` back at the top, or delete the file, then build and upload.

## Change the words on a page

- **Sentences used on several pages,** such as the one-line description of the server, the alpha warning or the platforms, are in `content/site.json`, under `say`. Change one there and every page that uses it changes.
- **Everything else on a page** is in `lib/pages.mjs`, one function per page, in plain English between the code. Search for the sentence you want to change.

Keep to the server's way of writing: plain and short, "you" and "your", sentence case, no exclamation marks. The build warns about common slips, such as "catalogue" (the site says "catalog") or "Plasma Big Screen" (it's "Plasma Bigscreen").

## Add or change a screenshot

Screenshots come from each repository's `docs/images/`. To show another one, add a line to `content/shots.json` with its file name (without `.webp`), its repository, a title, a description for people who can't see it, and its group. Its credit comes from that repository's `CREDITS.md`, or you can write one.

**In other themes:** a picture saved as `images/themes/<theme>/<name>.webp`, such as `images/themes/paper/home.webp`, replaces the usual one when a visitor picks that theme. Any picture without one stays as it is.

## Add a project

New repositories go in `content/projects.json`, which feeds the projects page. Modules in the catalog appear by themselves. Keep it in step with `docs/REPOSITORIES.md` in the server's repository.

## When something goes wrong

| What you see | What to do |
|---|---|
| `couldn't reach …, using the saved copy` | GitHub didn't answer. The build used what it fetched last time. Try again later |
| `✗ … links to /something, which isn't in the site` | A link to a page that doesn't exist. Fix the link in the file the message names |
| `✗ … names another media server` | The site never names other media servers. Reword it |
| A page looks old after uploading | Press Ctrl+F5. If it's still old, check that `site.zip` was extracted into `public_html` itself, not a folder inside it |
| The site shows Hostinger's "not found" page | `.htaccess` is missing: upload the ZIP and extract it, rather than dragging the folder |
| A new release isn't on the site | Build and upload. Until then, the news page lists it as new on GitHub |

## Going live the first time

The domain currently shows the site made with Hostinger's Website Builder. To serve these files instead:

1. In hPanel, open **Websites** and find wittymediaserver.com.
2. If it's listed as a Website Builder site, look for the option to switch it to, or connect the domain to, your **hosting plan** (the wording changes from time to time; Hostinger's chat can point to it). Your Business plan includes both.
3. Once the domain points at the hosting plan, upload the site as above.
4. Turn on **SSL** for the domain in hPanel if it isn't already, and **Force HTTPS**.
5. Check the old addresses still work: `/server`, `/client`, `/modules`, `/gallery`, `/news`, `/news/firefox-disc-playback` and `/news/release/WittyMediaServer/v0.6.2-alpha`.

Keep the Website Builder site until you're happy with the new one: switching back is the same steps in reverse.
