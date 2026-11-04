---
title: Better disc playback in Firefox
summary: DVD and Blu-ray pictures and menu buttons line up again in Firefox, including in the mini player.
date: 2026-11-02
release: wittywilla/WittyMediaServer v0.6.1-alpha
image: dvd-menu
---

In Firefox, disc menus, intros, trailers and films showed shifted down or cut off, and a menu's buttons no longer lined up with its picture. Edge, Chrome and the apps were not affected.

**0.6.1-alpha fixes it.** The picture is now placed in the same rectangle as the buttons, in the disc's own shape, rather than left for the browser to fit. It works at any display scaling and in the mini player.

The fix is in the server's web pages, so no module needs updating, and every module that works with 0.6.0-alpha works with this.

This version also accepts a stream link only exactly as it was given out. A different spelling of the same signature is no longer accepted.
