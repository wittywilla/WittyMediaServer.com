---
title: DVD menus that work, and TV shows
summary: The first release on GitHub, with a DVD engine of its own, a library for TV shows, themes and downloads for ten kinds of computer.
date: 2026-10-29
release: wittywilla/WittyMediaServer v0.2.0-alpha
image: dvd-menu
---

0.2.0-alpha is the first WittyMediaServer release on GitHub. It's an alpha, so expect settings to change between versions, and keep backups.

**DVDs play like a disc player.** The DVD engine now has a name, WittyDVD. A disc image opens on its own menu, and buttons inside a title, such as a quiz on a disc, now work. An on-screen remote has the keys a disc player's remote has, and you can move it, resize it and see through it. There's an optional Insert DVD animation, with the sound of a drive. The right language plays from each audio track, the disc's own subtitles are drawn in the player, and Menu and Resume go back to the exact frame. Encrypted discs aren't decrypted.

**TV shows have a library of their own:** shows, seasons and episodes, with specials and files that hold several episodes. Details and pictures come from TheTVDB, and a show's page has Next up, Skip intro and what to watch next.

**Details are saved beside your media,** as `.nfo` files and artwork in the usual layout, so other software can read them too. An artwork picker chooses posters from your own files, TMDB or TheTVDB.

**Hardware video conversion:** Settings, Transcoding has a switch for each kind of graphics encoder. Each one is tried when the server starts, and greyed out if your machine doesn't have it.

**20 themes,** and your own as a ZIP. You can give your server a name of its own, too.

**Downloads for ten systems:** Windows, macOS, Linux and FreeBSD on the processors each runs on, and Docker images. New guides cover getting started, DVDs, TV shows, metadata, transcoding and themes.
