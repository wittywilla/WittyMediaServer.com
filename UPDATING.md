# Updating the site

Everything you need to keep wittymediaserver.com current. No programming needed, and nothing to build or upload: you change a file on GitHub, and a few minutes later it's on the site.

How it gets there:

1. You change something on the `main` branch: an article, a sentence, a screenshot.
2. GitHub builds the site, runs its checks, and puts the finished site on the `live` branch. A build that fails its checks publishes nothing, so the site stays as it was.
3. Hostinger sees the new `live` and deploys it to wittymediaserver.com by itself.

GitHub also rebuilds every hour, so new releases and modules appear without anyone doing anything.

- [Make a change](#make-a-change)
- [Write a news article](#write-a-news-article)
- [Change the words on a page](#change-the-words-on-a-page)
- [Add or change a screenshot](#add-or-change-a-screenshot)
- [Add a project](#add-a-project)
- [What updates by itself](#what-updates-by-itself)
- [Rebuild now, without changing anything](#rebuild-now-without-changing-anything)
- [Look at a change before it goes live](#look-at-a-change-before-it-goes-live)
- [When something goes wrong](#when-something-goes-wrong)
- [How it's set up](#how-its-set-up)

## Make a change

**On github.com,** with nothing to install:

- **To change a file:** open https://github.com/wittywilla/wittymediaserver.com, click through to the file, and click the pencil (**Edit this file**). Make the change, click **Commit changes…**, then **Commit changes** in the box that opens.
- **To add a file:** open the folder it goes in, click **Add file**, then **Create new file**. Type its name, paste what goes in it, and click **Commit changes…**, then **Commit changes**.

**Or in GitHub Desktop,** on the development machine:

1. Click **Fetch origin** at the top, then **Pull origin** if it appears, so you start from what's on GitHub.
2. Change the files in `D:\projects\wittymediaserver.com`.
3. Type a few words in **Summary** at the bottom left, click **Commit to main**, then **Push origin**.

Either way, the **Actions** tab on GitHub shows the build running. When it has a green tick, Hostinger picks it up, and the change is usually on the site within five minutes. Press **Ctrl+F5** to make sure you're seeing the newest version.

## Write a news article

1. In `content/news/`, copy `_template.md` to a new file named with the date and a few words, such as `2026-11-10-new-tv-guide.md`. The words after the date become its address: `/news/new-tv-guide/`.
2. Change the lines at the top, delete `draft: true`, and write the article below the second line of dashes. The template explains each line.
3. Commit it to `main`, as in [Make a change](#make-a-change).

An article about a release links to it both ways: the release's page shows the article, and the article links to the release's notes and downloads.

To take an article down, add `draft: true` back at the top, or delete the file, and commit that.

## Change the words on a page

- **Sentences used on several pages,** such as the one-line description of the server, the alpha warning or the platforms, are in `content/site.json`, under `say`. Change one there and every page that uses it changes.
- **Everything else on a page** is in `lib/pages.mjs`, one function per page, in plain English between the code. Search for the sentence you want to change.

Keep to the server's way of writing: plain and short, "you" and "your", sentence case, no exclamation marks. The build warns about common slips, such as "catalogue" (the site says "catalog") or "Plasma Big Screen" (it's "Plasma Bigscreen").

## Add or change a screenshot

Screenshots come from each repository's `docs/images/`. To show another one, add a line to `content/shots.json` with its file name (without `.webp`), its repository, a title, a description for people who can't see it, and its group. Its credit comes from that repository's `CREDITS.md`, or you can write one.

**In other themes:** a picture saved as `images/themes/<theme>/<name>.webp`, such as `images/themes/paper/home.webp`, replaces the usual one when a visitor picks that theme. Any picture without one stays as it is.

## Add a project

New repositories go in `content/projects.json`, which feeds the projects page. Modules in the catalog appear by themselves. Keep it in step with `docs/REPOSITORIES.md` in the server's repository.

## What updates by itself

Every build fetches these from GitHub, and GitHub builds every hour, so they need nothing from you:

| What | Where it comes from |
|---|---|
| Releases, their notes and download files | The GitHub releases of WittyMediaServer, WittyMediaClient, WittyMediaPlayer and WittyReader |
| What's in each server version | The server's `CHANGELOG.md` |
| Modules: names, icons, descriptions, versions | The signed catalog in WittyModuleCatalog |
| The logo, favicon, social picture and hero backgrounds (`images/brand`) | WittyMediaServer's genicon: run `scripts/sync-brand.sh` (its `docs/BRAND.md`) |
| The font, Inter (`fonts/`) | [rsms/inter](https://github.com/rsms/inter) releases, SIL Open Font License: replace the `.woff2` files and `Inter-OFL.txt` together |
| Screenshots and their credits | `docs/images/` in each repository, and its `CREDITS.md` |
| Colours and themes | The server's `themes/` folder |

The news and module pages also check GitHub when someone opens them, and show a release that's come out since the last build. Its own page arrives with the next build.

## Rebuild now, without changing anything

Say a release just came out and you don't want to wait for the hourly build:

1. Open https://github.com/wittywilla/wittymediaserver.com and click the **Actions** tab.
2. Click **Build and publish** on the left.
3. Click **Run workflow**, then **Run workflow** again in the box that opens.

## Look at a change before it goes live

Only needed for bigger changes. This builds the site on your computer and shows it there; nothing is uploaded or published.

You need [Node.js](https://nodejs.org) 20 or newer, which is already on the development machine.

1. Open a terminal in the repository's folder, `D:\projects\wittymediaserver.com`.
2. Run:

   ```bash
   node build.mjs --preview
   ```

3. It builds, then shows the site at http://localhost:4173. Press **Ctrl+C** in the terminal to stop it.

The build prints what it did. Lines starting with **✗** are problems to fix before committing, because GitHub's build stops on the same ones. Lines starting with **!** are worth a look but don't stop anything.

- `node build.mjs` builds without showing it. The site lands in the `site` folder, and packed as `site.zip`; you don't need either, as GitHub does the publishing.
- `node build.mjs --serve` shows the last build again without rebuilding.
- `node build.mjs --offline` builds from what was fetched last time, with no internet.

If the GitHub CLI is signed in (`gh auth status`), the build uses it, which lets it ask GitHub more often. Without it, it works too, up to about 60 requests an hour.

## When something goes wrong

**A build failed:** GitHub emails you. Nothing was published, so the site is as it was. To see why, open the **Actions** tab, click the run with the red cross, then the job with the red cross (**build**, **publish** or **ftp**), then the step with the red cross. Its last lines say what went wrong.

| What you see | What to do |
|---|---|
| `✗ … links to /something, which isn't in the site` | A link to a page that doesn't exist. Fix the link in the file the message names, and commit again |
| `✗ … names another media server` | The site never names other media servers. Reword it, and commit again |
| `! couldn't reach …, using the saved copy` | Not a problem on its own: GitHub didn't answer one request, and the build used what it fetched last time |
| The run failed with `GitHub didn't answer, so the site would be missing releases or modules` | GitHub didn't answer enough of the build's requests, so it stopped rather than publish a site with missing releases. A little later, open the failed run and click **Re-run jobs**, then **Re-run failed jobs** |
| **publish** fails with `Permission denied` or `403` | On GitHub, open the repository's **Settings**, then **Actions**, then **General**. Under **Workflow permissions**, choose **Read and write permissions**, click **Save**, and re-run |
| `Nothing changed since the last publish` | Not a problem: the build found nothing new, so nothing was published |
| The run is green but the site hasn't changed | Press **Ctrl+F5**. Still old? In hPanel, open the web app's **Deployments**: the newest row should be branch `live`, with a commit named "Site built from …". **Redeploy** pulls the latest now. If it's deployed but still old, clear Hostinger's cache: on the site's dashboard, **Advanced**, then **Cache Manager**, then **Purge all** |
| The home page says **403 Forbidden**, and https://wittymediaserver.com/build.mjs shows code | Hostinger is deploying `main` instead of `live`. See [If Hostinger deployed `main`](#if-hostinger-deployed-main) |
| A yellow banner on **Actions** says the scheduled workflow was turned off | GitHub pauses timed runs in a repository that hasn't changed for 60 days. Click **Enable workflow**. Writing an article now and then keeps it running |

## How it's set up

You don't need this day to day. It's here for when something needs setting up again.

### On GitHub

| Branch | What's on it |
|---|---|
| `main` | The site's source: this file, the articles, the words, the code. Everything you change goes here |
| `live` | The finished site, rebuilt by GitHub from `main`. **Don't edit it**: every build replaces it |

`.github/workflows/publish.yml` does the building. It runs on every change to `main`, every hour, and when you click **Run workflow**. Each run also keeps the built site for two weeks, as `site.zip` under **Artifacts** at the bottom of the run's page.

Nothing else needs adding on GitHub: the build uses the run's own access to GitHub. It needs **Read and write permissions** under **Settings**, **Actions**, **General**, **Workflow permissions**, to put the site on `live`.

### On Hostinger

wittymediaserver.com is a **Node.js web app** in hPanel, deploying the `live` branch of **wittywilla/WittyMediaServer.com** from GitHub. Its settings, under **Deployments**, then **Deployment settings**:

| Setting | Value |
|---|---|
| Framework preset | Other |
| **Branch** | **`live`** |
| Node version | 20.x |
| Root directory | `./` |
| Build command | `npm run build` (on `live` it only prints a line) |
| Package manager | npm |
| Output directory | empty |
| Entry file | empty |

Why it's this way: Hostinger publishes the whole deployed branch into `public_html`, as it is. So the branch it deploys has to be the finished site, top to bottom, and that's `live`: the site's files, plus the `package.json` Hostinger's Node.js setup asks for. Leave **Output directory** empty: `dist` or any other folder makes the build fail, because there's no such folder. Leave **Entry file** empty: the site is plain files, with no server program to start.

Don't change files in `public_html` with File Manager. Hostinger replaces everything there on every deployment, so changes go on GitHub instead.

### Setting it up again from scratch

1. If wittymediaserver.com is already a website on the hosting plan, delete it first, under **Websites**: Hostinger's Node.js setup makes a fresh place for the domain.
2. In hPanel, choose **Websites**, then **Add Website**, then **Node.js web app**, and pick the domain wittymediaserver.com.
3. Under **Import your Git repository**, click **Connect with GitHub** (it says **Continue with GitHub** if it's already connected). In the GitHub window, install Hostinger's app on **wittywilla**, choose **Only select repositories**, pick **WittyMediaServer.com**, and click **Install** (it may say **Install & Authorize**).
4. Pick **wittywilla/WittyMediaServer.com**.
5. Under **Build configuration**, change **Branch** from `main` to **`live`**. Leave everything else as Hostinger fills it in, with **Output directory** and **Entry file** empty. It should match the table above.
6. Click **Deploy**, and wait for **Deployment completed**.
7. Check it: open https://wittymediaserver.com and press **Ctrl+F5**. Then open https://wittymediaserver.com/build.mjs, which should be the site's not-found page, and a few older addresses, which should all still work: `/server`, `/client`, `/modules`, `/gallery`, `/news`, `/news/firefox-disc-playback` and `/news/release/WittyMediaServer/v0.6.2-alpha`.

From then on, Hostinger deploys each new `live` by itself. The web app's dashboard shows **Auto-deployment** while that's on.

### If Hostinger deployed `main`

`main` is the source code, not the site, so its build stops on purpose with a message saying so, and the site stays as it was. (Before that safeguard, building `main` put the source code in `public_html` and the site in `/dist/`, with a **403 Forbidden** home page.) To fix it:

1. In hPanel, open the web app for wittymediaserver.com, then **Deployments**.
2. Click **Redeploy**, or **Deployment settings**. Both open the deployment settings.
3. Change **Branch** to **`live`**. Leave everything else as it is.
4. Click **Save and redeploy**, wait for **Deployment completed**, and check the site as in step 7 above.

### Uploading by FTP instead

**Not while the web app is set up:** Hostinger would replace the upload with its own next deployment. This is only a fallback for if the site is ever a plain website on the hosting plan instead of a web app. The build's **ftp** job uploads the site over SFTP when these secrets exist, and does nothing without them.

1. In hPanel, open the site's dashboard, then **SSH Access** (under **Advanced**). Turn it on if it's off, and note the **hostname** or **IP**, **port** and **username** it shows. The password is your main FTP password, unless you set one just for SSH.
2. On GitHub, open the repository's **Settings**, then **Secrets and variables**, then **Actions**. Click **New repository secret** for each of these three:

   | Name | Secret |
   |---|---|
   | `HOSTINGER_FTP_SERVER` | The hostname or IP. If the port isn't 65002, write it as `sftp://address:port`, such as `sftp://123.45.67.89:22` |
   | `HOSTINGER_FTP_USER` | The username, such as `u123456789` |
   | `HOSTINGER_FTP_PASSWORD` | The password |

3. [Rebuild now](#rebuild-now-without-changing-anything). Its **ftp** job uploads the site to `public_html`.
4. If that job says it couldn't upload to the folder, the site's folder has a longer name from where SSH starts. Open the **Variables** tab next to **Secrets**, click **New repository variable**, name it `HOSTINGER_FTP_FOLDER`, and give it the folder, such as `domains/wittymediaserver.com/public_html`. Then run it again.

From then on, each build that changes the site uploads it. To stop, delete the three secrets. If the **ftp** job fails with `Couldn't upload`, check the secrets for typos, and the folder in step 4.

Only if SFTP isn't available at all, write the server as `ftp://address`. Plain FTP sends the password unencrypted, so avoid it if you can.
