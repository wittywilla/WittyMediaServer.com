---
title: WittyReader, for books on your own device
summary: Read and annotate books, PDFs and comics with no server and nothing uploaded. Its first release has installers for Windows, macOS and Linux.
date: 2026-11-02
release: wittywilla/WittyReader v0.1.1
image: reader-library
---

[WittyReader](/reader/) is for reading without a server. It has the same readers as the server's Books libraries, in an app of its own, and keeps everything on your device. 0.1.1 is its first release as a project of its own.

**Your library.** Add books with the **Add books** button, Ctrl+O, drag and drop, or your system's *Open with*. The book you're in waits at the front with your progress. Search, filter by books, PDFs or comics, and sort. Covers and titles come from the files, and adding the same file twice finds the copy you have.

**Reading.** EPUB books, PDFs, and comics and manga as CBZ. Highlight, take notes, bookmark, cite, have a page read aloud, or write with a pen that knows pressure. Export a book's notes to take them to another device, or save them as a readable Markdown summary.

**Private.** Your books, places and notes stay on the device. The only thing it asks the internet for is a dictionary look-up, and only once you turn that on. Books can't run code: EPUBs are sandboxed with scripts blocked, and PDF scripts and forms are off. A copy-protected EPUB is refused with a plain message, and nothing tries to decrypt it.

**Installing.** A setup for Windows, a `.dmg` for macOS, and a `.deb`, `.rpm` and AppImage for Linux. Installed, it opens `.epub`, `.pdf` and `.cbz` files from your system, and joins *Open with* without taking a file type from another program. Removing it asks whether to delete your library and notes too. A `.zip` is there for hosting it on your own web server instead.

**How far it's been run.** The Windows setup and uninstaller ran under Wine, not on real Windows. The Linux packages were installed, upgraded and removed in containers, not on a real desktop. The Mac version has never been run. None of the installers are code-signed yet, so Windows and macOS warn about them.
