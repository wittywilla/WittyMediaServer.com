---
title: Windows installer upgrades work again
summary: A fix for error 2613 when installing over an earlier version, and every Windows installer now tested that way before it's published.
date: 2026-11-02
release: wittywilla/WittyMediaServer v0.6.2-alpha
image: home
---

Installing 0.6.1-alpha's `.msi` over 0.6.0-alpha stopped with "The error code is 2613" and put the old version back.

The step that stops a running copy had been placed where Windows Installer doesn't allow it. It only showed when one installer version replaced another, so a fresh install worked.

**0.6.2-alpha fixes it.** Every release's Windows installer is now tested installing over the one before, for everyone, for one account and as a service, before it's published.

If 0.6.1-alpha didn't install for you, download 0.6.2-alpha and run it. Your libraries, settings and watch history stay as they are.
