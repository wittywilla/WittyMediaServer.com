---
title: WittyMediaClient’s first release of its own
summary: The apps for TVs, phones and computers now have their own project, starting with desktop installers for every system and an Android app for testing.
date: 2026-11-02
release: wittywilla/WittyMediaClient v0.2.3
image: client-home
---

WittyMediaClient is the optional app for devices where a web browser isn't the right fit. It used to live inside the server's repository. Now it's a [project of its own](/client/), and 0.2.3 is its first release there. You don't need it: any device can reach your server in a browser.

**On a computer,** it's a window around your server's own pages, so it has everything the server has. There are installers for Windows, macOS, Linux (`.deb`, `.rpm`, `.pacman` and AppImage) and FreeBSD. Each upgrades in place and removes cleanly, and asks whether to delete your settings too. They aren't code-signed yet, so Windows and macOS warn about them.

**On a TV with KDE Plasma Bigscreen,** it opens as a TV app by itself: full screen, in the server's big screen mode, with everything reachable by arrows, Enter and Back. `wittymediaclient --tv` asks for the same anywhere else.

**On Android,** one app for phones and TVs, as an `.apk` to install yourself. Films and shows play in the app's own player. Music, audiobooks and podcasts have a player that carries on with the screen off, and everything else opens the server's own page inside the app. It's signed with a key for testing, so moving to a store version later means uninstalling it first.

**How far it's been run.** This is early, so here's exactly where each one stands:

- **Linux:** installed, upgraded and removed in containers and a virtual machine.
- **FreeBSD and Plasma Bigscreen:** in virtual machines. Never on a TV or with a real remote.
- **Windows:** the setup and uninstaller ran under Wine, not on real Windows.
- **macOS:** never launched.
- **Android:** on emulators only. No real phone, TV or remote has run it yet.
- **iPhone, iPad and Apple TV:** written, but never built, as that needs a Mac. There's nothing to download yet.

Finding a server by itself hasn't been tried on a real network yet. Typing the server's address is the way that's been run.
