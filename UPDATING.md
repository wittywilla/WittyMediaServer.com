# Updating the site

Everything you need to keep wittymediaserver.com current. No programming needed: you change a text file or two, run one command, and upload a ZIP.

Once [publishing by itself](#publishing-by-itself) is set up, you don't build or upload at all: you write the article, and GitHub and Hostinger do the rest.

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
- [Publishing by itself](#publishing-by-itself)

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

## Publishing by itself

Once this is set up, you write an article and put it on GitHub, and a few minutes later it's on the site. New releases and modules appear by themselves too, because GitHub rebuilds the site every four hours.

How it works: each time something changes, GitHub builds the site exactly as `node build.mjs` does, runs the same checks, and stops if any line starts with **✗**. If everything is fine, it puts the finished site on a branch of the repository called `live`, which holds only the site's files. Hostinger watches that branch and copies it into `public_html`. A build that fails publishes nothing, so the site stays as it was.

**Which way to use: Git deployment.** Hostinger fetches the site from GitHub itself, so no password is kept anywhere, and hPanel lists every deployment. Uploading by FTP is there as a fallback, if Git deployment isn't available or stops working. Use one or the other, not both.

Do [Going live the first time](#going-live-the-first-time) first, so the domain shows your hosting plan.

### 1. Put the site on GitHub

The easiest way is GitHub Desktop, which is on the development machine.

1. Open **GitHub Desktop**. Choose **File**, then **Add local repository**, pick `D:\projects\wittymediaserver.com`, and click **Add repository**.
2. If the left side lists changed files, type a few words in **Summary** at the bottom left, such as "Ready to publish", and click **Commit to main**.
3. Click **Publish repository** at the top.
4. Leave the name as `wittymediaserver.com`. **Untick "Keep this code private"**, so anyone can see the site's source, as with the server. Check the owner is **wittywilla**, then click **Publish repository**.

Rather use the terminal? Create an empty public repository called `wittymediaserver.com` on github.com (**+** at the top right, then **New repository**, without a README, .gitignore or licence, since this folder has them), then run:

```bash
git remote add origin https://github.com/wittywilla/wittymediaserver.com.git
```

```bash
git push -u origin main
```

### 2. Watch the first build

1. Open https://github.com/wittywilla/wittymediaserver.com and click the **Actions** tab.
2. If GitHub asks whether to allow workflows, click the green button to allow them.
3. **Build and publish** starts by itself after the push. It takes two or three minutes. A green tick means it worked, and the repository now has a branch called `live`.
4. Click the run to see what it did. The site it built is at the bottom of the page under **Artifacts**, as `site.zip`, the same file as a build on your computer makes. It's kept for two weeks.

Nothing else needs adding on GitHub: the build uses the run's own access to GitHub.

### 3. Add it to Hostinger as a web app (recommended)

The `live` branch is shaped for Hostinger's **web apps**: a `package.json` at the top, and the finished site in `dist/`. Hostinger redeploys by itself each time GitHub publishes, including the four-hourly rebuilds.

1. In hPanel, choose **Websites**, then **Add website**, then **Web app** (Node.js), then **Import Git repository**, and connect GitHub if asked (**Only select repositories**, **WittyMediaServer.com**).
2. Choose the repository **WittyMediaServer.com**.
3. Set these, and leave the rest as they are:

   | Setting | Value |
   |---|---|
   | Branch | `live` |
   | Framework preset | Other |
   | Node.js version | 22 |
   | Root directory | empty |
   | Build command | empty (or `npm run build`, which only prints a line) |
   | Output directory | `dist` |
   | Entry file | empty |
   | Environment variables | none |

4. Click **Deploy** and wait for it to finish.
5. Connect the domain wittymediaserver.com to this web app, if it was made on a temporary address.
6. Check that **Auto-deploy** is on.

Hostinger writes its own `.htaccess` for web apps, so the site's own one (the not-found page and security headers) may be replaced. Every page still works; a missing page shows Hostinger's not-found page instead of the site's.

**Use either the web app or the Git deployment below, not both.**

### 3b. Or turn on Hostinger's Git deployment

With the web app layout, the site is in `dist/`, so set the deploy directory so that `dist/` ends up as `public_html`, or use the web app above.

1. In hPanel, choose **Websites**, then **Manage site** beside wittymediaserver.com.
2. **Empty `public_html` first.** Open **File manager**, open `public_html`, keep a copy with **Download** if you like, then delete everything inside it. Hostinger copies the site in over whatever's there.
3. Back on the site's dashboard, in the menu on the left, choose **Advanced**, then **Git**.
4. Click **Connect with GitHub**. A GitHub window opens to install Hostinger's GitHub app: choose **Only select repositories**, pick **wittymediaserver.com**, and click **Install** (it may say **Install & Authorize**).
5. Back in hPanel, choose the repository **wittymediaserver.com**. If it isn't listed, click **Refresh repositories**.
6. **Branch: `live`**. Not `main`: `main` holds the source, and `live` holds the finished site.
7. **Deploy directory:** leave it as the root, `public_html`.
8. Click **Deploy** and watch the log until it says it's completed.
9. Open https://wittymediaserver.com and press **Ctrl+F5**.
10. Check that **Auto-deployment** is on, next to the repository in hPanel. That's what makes Hostinger copy each new build by itself.

**The webhook:** with the GitHub app, Hostinger sets this up for you. GitHub tells Hostinger about each new build through the app, so the repository's **Settings → Webhooks** page on GitHub stays empty. That's normal.

**If hPanel shows an older form instead**, asking for a repository address, a branch and a directory (with an SSH key):

1. **Repository:** `https://github.com/wittywilla/wittymediaserver.com.git`. Because the repository is public, no SSH key is needed.
2. **Branch:** `live`.
3. **Directory:** leave it empty, which means `public_html`. It must be empty for the first deployment.
4. Click **Create**. In the menu beside the repository in the list, choose **Deploy**.
5. In the same menu, choose **Auto Deployment** and copy the **webhook URL** it shows.
6. On GitHub, open the repository's **Settings**, then **Webhooks**, then **Add webhook**. Paste the address into **Payload URL**, leave the rest as it is (**Just the push event**, **Active**), and click **Add webhook**.

### 4. From now on

To publish an article, write it as in [Write a news article](#write-a-news-article), then put it on GitHub:

- **In GitHub Desktop:** type a summary, click **Commit to main**, then **Push origin**.
- **Or on github.com, without the development machine:** open the repository, open `content/news`, click **Add file**, then **Create new file**. Name it like `2026-11-10-new-tv-guide.md`, paste the article (start from `_template.md`), and click **Commit changes**.

A few minutes later it's on the site. You don't build or upload anything.

To build and publish by hand, without changing anything, such as just after a release: open **Actions**, click **Build and publish** on the left, then **Run workflow**, and **Run workflow** again.

Building on your computer and the ZIP routine still work as before, for looking at changes before they go out, or if the automation isn't set up.

### Uploading by FTP instead

Only if Git deployment isn't available. The upload uses SFTP, which needs SSH access in hPanel (Hostinger includes it on Premium plans and higher).

1. In hPanel, choose **Manage site** beside wittymediaserver.com, then **SSH Access** (under **Advanced**). Turn SSH access on if it's off, and note the **IP**, **port** and **username** it shows. The password is the same as your main FTP password, unless you set one just for SSH.
2. On GitHub, open the repository's **Settings**, then **Secrets and variables**, then **Actions**. Click **New repository secret** for each of these three:

   | Name | Secret |
   |---|---|
   | `HOSTINGER_FTP_SERVER` | The IP. If the port isn't 65002, write it as `sftp://IP:port`, such as `sftp://123.45.67.89:22` |
   | `HOSTINGER_FTP_USER` | The username, such as `u123456789` |
   | `HOSTINGER_FTP_PASSWORD` | The password |

3. Run the workflow by hand (see above). Its **ftp** job uploads the site to `public_html`.
4. If that job says it couldn't find the folder, the site's folder has a longer name from where SSH starts. Open the **Variables** tab next to **Secrets**, click **New repository variable**, name it `HOSTINGER_FTP_FOLDER`, and give it the folder, such as `domains/wittymediaserver.com/public_html`. Then run it again.

From then on, each build that changes the site uploads it. To stop uploading by FTP, delete the three secrets.

Only if SFTP isn't available at all, write the server as `ftp://IP`. Plain FTP sends the password unencrypted, so avoid it if you can.

### When a run fails

GitHub sends you an email. Nothing is published from a failed run, so the site stays as it was.

1. Open the repository's **Actions** tab and click the run with the red cross.
2. Click the job with the red cross (**build**, **publish** or **ftp**), then the step with the red cross. Its last lines say what went wrong.

| What you see | What to do |
|---|---|
| Lines starting with **✗** in **Build** or **Check** | The same problems as on your computer: see [When something goes wrong](#when-something-goes-wrong). Fix the file it names and push again |
| `GitHub didn't answer` | Click **Re-run jobs**, then **Re-run failed jobs**, a little later |
| **publish** fails with `Permission denied` or `403` | Open **Settings**, then **Actions**, then **General**. Under **Workflow permissions**, choose **Read and write permissions**, click **Save**, and re-run |
| **ftp** fails with `Couldn't upload` | Check the three secrets for typos, and the folder (step 4 of [Uploading by FTP instead](#uploading-by-ftp-instead)) |
| `Nothing changed since the last publish` | Not a problem: the build found nothing new, so nothing was published |
| The run is green but the site hasn't changed | In hPanel, open **Advanced**, then **Git**. Check the branch is `live` and **Auto-deployment** is on. The **Deployments** list shows what Hostinger did; click a row for its log, or click **Redeploy** to copy the latest build now. Then press **Ctrl+F5** on the site |
| A yellow banner on **Actions** says the scheduled workflow was turned off | GitHub pauses timed runs in a repository that hasn't changed for 60 days. Click **Enable workflow**. Writing an article now and then keeps it running |
