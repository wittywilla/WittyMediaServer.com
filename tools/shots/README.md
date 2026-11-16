# Taking the website's pictures

Every screenshot on the site comes from a test server built from the release's branch and filled only with the openly licensed media in `D:\WittyDemoMedia` (its own README says where each work came from). Never point it at anyone's own media.

What you need: Node.js 20 or newer, Python 3 with Pillow, and a Playwright install with its Chromium (`PLAYWRIGHT_DIR`, by default `D:\build-tools\site-audit\`). `WMS_PASSWORD` is a test password of your choosing for the test server's two accounts; it never goes in a file.

1. **Build and start a test server** from a checkout of WittyMediaServer on the release's branch, on a port other than 9797 and with a data folder of its own:

   ```bash
   go build -o ../wms-site/ ./cmd/wittymediaserver
   ```

   ```bash
   ../wms-site/wittymediaserver serve -data ../wms-site-data -listen 127.0.0.1:19490 -open-browser=false -setup-from-home -ffmpeg <ffmpeg> -ffprobe <ffprobe>
   ```

2. **Fill it.** `prep.mjs` makes the accounts, turns off saving pictures next to the media before adding any library, installs the modules and adds the libraries. When the scan has finished, add channels and collections with `WittyDemoMedia/_tools/demo_channels.mjs` (it signs in as `owner` with the demo tools' own password, so give the owner that password, or edit the call).

   ```bash
   WMS_PASSWORD=... node prep.mjs http://127.0.0.1:19490
   ```

   Then narrow the Music library to albums with real cover art. `music-library.mjs` leaves out the albums whose only picture is a waveform or nothing at all (the Mutopia MIDI, the tracker collection, the music-video singles and a few more), and the ones whose tags split them into several albums. Every album the pictures show then has its own cover:

   ```bash
   WMS_PASSWORD=... node music-library.mjs
   ```

3. **Sync the look.** From this repository, copy the release's themes and experiences into `content/look.json`:

   ```bash
   node tools/sync-look.mjs ../WittyMediaServer
   ```

4. **Take the pictures.** `looks.mjs` takes Home in every experience and theme on a computer and a phone, as the owner; `features.mjs` takes the feature pictures in Lumen and Witty, as Sam. They can run at the same time. `SKIP_EXISTING=1` carries on after a stop.

   ```bash
   WMS_PASSWORD=... node looks.mjs <scratch>/looks
   ```

   ```bash
   WMS_PASSWORD=... node features.mjs <scratch>/features
   ```

5. **Look at them** before anything else: `python sheet.py "<scratch>/features/*.png" sheet.png 4 400` makes a contact sheet. Retake anything with a first-visit dialog, a half-loaded picture or a layout fault (and fix the fault in the server first).

6. **Record the credits.** `lookseen.mjs` lists the titles and pictures each experience's Home holds; `credits.py` matches what's on screen in each picture to `WittyDemoMedia/credits.json` and writes `content/licences.json`. The build leaves out any picture with no record, or with a work under a licence that isn't allowed.

   ```bash
   WMS_PASSWORD=... node lookseen.mjs
   ```

   ```bash
   WMS_PASSWORD=... python credits.py http://127.0.0.1:19490 ../.. shots/home=<scratch>/features/home looks/desktop/lumen=lookseen/desktop/lumen ...
   ```

7. **Compress them into the site:** `python compress.py shots <scratch>/features ../..` and `python compress.py looks <scratch>/looks ../..`. Feature pictures go to `images/shots/` (1440 wide, or 780 for a phone), and looks to `images/looks/<form>/<experience>/<theme>.webp` (1280 and 520 wide).

Then build the site and check the Try it page, the gallery and the credits.
