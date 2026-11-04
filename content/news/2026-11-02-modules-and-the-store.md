---
title: Modules of their own, with a signed store
summary: Every module moves out of the server into a project of its own, with a store to find them in. Real installers, help inside the app, and what to know before you update.
date: 2026-11-02
release: wittywilla/WittyMediaServer v0.6.0-alpha
image: module-store
---

0.6.0-alpha changes how a server is put together. The server no longer carries any module's code. Discs, games, live TV, photos, the readers and the rest are modules you add from a store, and each is a project of its own, with its own repository, changelog and releases.

## What that means for your server

- **It starts with what it needs.** A new server is fully usable with no modules at all. A page whose module is missing says so and offers to add it, and first-time setup asks which ones you want.
- **No restarts.** Adding, updating, removing or turning off a module needs no new server and no restart.
- **Checked before it runs.** Every module is listed in a signed catalog, and checked against its signature before anything runs. Each runs as a program of its own in a sandbox, or in your browser.
- **Updates on their own schedule.** A fix to the DVD engine or a game core no longer waits for a server release. **Update all modules** updates everything in the right order, one failure doesn't stop the rest, and it can all be taken back.

## The store

It's in Settings, Modules. Search by name or description, browse by category, and filter by what's installed, what has updates, publisher and system. Each module has a page with what it does, screenshots, what's new, what it asks to be allowed to do, and which servers it fits. A failed install says what happened and what to try, with that module's own log beside it. The [module store guide](https://github.com/wittywilla/WittyMediaServer/blob/v0.6.0-alpha/docs/MODULE-STORE.md) has the details.

You can add a store someone else runs, after a plain warning that nobody here has reviewed it. Its key is pinned, so a change is refused, and everything from it is labelled. On a Mac and on FreeBSD a module is held to limits rather than a full sandbox, and Settings says so. The Mac sandbox hasn't been run on a real Mac yet.

## Before you update

Most of these come from a security review. [Config file and folders](https://github.com/wittywilla/WittyMediaServer/blob/v0.6.0-alpha/docs/CONFIG.md) explains each setting named here.

- **Modules from before this release can't run.** The store offers the current version of each.
- **Scripts that run `wms` need the new name, `wittymediaserver`.** `wms.json`, your `WMS_` settings and your data folders haven't moved.
- **Setting up from another device needs the setup code,** from the server's console, `docker logs` or `setup-code.txt` in the data folder.
- **A playlist from the internet can only hold web streams.** Add RTSP, RTMP, SRT, UDP and DASH channels as single streams instead.
- **Custom game cores need `WMS_GAMING_CUSTOM_CORES=1`** on the machine, and the Java for Blu-ray menus is set in the config file.
- **Themes can't load images or fonts from other sites.** Put them in the theme's ZIP.

## Installing, and help

There are real installers now: an `.msi` for Windows, a `.pkg` for macOS and FreeBSD, and a `.deb` and `.rpm` for Linux, each with a background service. They take over from a copy that 0.5.2-alpha or older installed, keeping your library. Uninstalling asks whether to keep your library, accounts and settings, and never touches your media.

Every guide is now inside the app, under **Help**, with search. It works with no internet connection.

## Also in this release

A rebuilt WittyTV guide with themes of its own, and a new front page for music with lyrics and karaoke. Much less delay in games, and smarter game libraries. One dialog to edit any title's details, and a way to fix wrong matches. Library transcoding, encrypted backups you can restore, and repair tools that work when the server won't start. Eight new themes, with a way to make your own without code.

## What hasn't been run yet

- **Windows:** the `.msi` was tested under Wine, not on a real Windows machine.
- **macOS:** never built or run here.
- **FreeBSD:** in virtual machines only.
- **Apps:** Android on emulators only. iOS and tvOS have never been built.
- **Game delay** was measured with the server and browser on one machine.

Since then, 0.6.1-alpha fixed [disc playback in Firefox](/news/firefox-disc-playback/) and 0.6.2-alpha fixed [installing over an earlier version on Windows](/news/windows-installer-update/).
