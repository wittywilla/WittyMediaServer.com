---
title: Games, live TV and a full audit
summary: Console games streamed from your server, channels made from your library, live TV, photos, remote access, and the fixes from a full code and design audit.
date: 2026-11-01
release: wittywilla/WittyMediaServer v0.5.2-alpha
image: games
---

0.5.0-alpha and 0.5.1-alpha were never published, so 0.5.2-alpha brings everything since 0.4.0-alpha. It's the biggest release so far.

**Games, played in a browser.** Add a library of console games and play them in the browser. Each game runs on the server, in a sandbox of its own, and streams to you, with a controller, a keyboard, or touch controls drawn for each console. Covers, summaries and age ratings arrive in the background, games inside archives play without unpacking them first, and your controller settings follow you between devices. You supply your own games and BIOS files, legally obtained. Encrypted games are refused.

**Games on your own PC.** WittyCouch plays the games of a PC running Sunshine, in the browser. It has been tested against a real Sunshine, but not yet on a real gaming PC with a real game.

**TV channels and live TV.** Make channels from your own library that run all the time, as on real TV, with breaks from a commercials library and a guide in the look you choose. Live TV comes through the WittyTuner module, from IPTV, network tuners, capture cards and more. Most of those drivers haven't been tried on real hardware yet, and say so. Encrypted channels are found and refused, never decrypted.

**More to keep.** WittyPhotos, with a timeline, albums and a map that needs nothing online. Libraries for vertical videos, creators' videos, music videos and concerts. Internet radio, with a directory of stations to search. Audio CD images in WittyCD, with WittyVisualizer's light shows.

**Reach it from outside your home,** if you choose. Settings, Remote Access has guided steps, HTTPS and two-factor sign-in. It's all off until you turn it on, and until then the server refuses connections from outside your home. Read the [remote access guide](https://github.com/wittywilla/WittyMediaServer/blob/v0.5.2-alpha/docs/REMOTE.md) first.

**A full audit.** Every part of the server was gone over for security, crashes, lost saves, phone layouts and error messages, and what was found is fixed. Settings, Reset starts again from a new install, keeping a copy you can bring back. Your media files aren't touched.

**Known limits.** Blu-ray Java menus are off by default and haven't been proven on retail discs. The Docker image is about 800 MB, because the game cores need it.
