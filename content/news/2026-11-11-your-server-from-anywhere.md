---
title: Your server from anywhere, with nothing set up on the router
summary: WittyMediaServer 0.8.0-alpha brings peer-to-peer connections. The apps reach your server from anywhere, with no port forwarding, no rented server and no account, encrypted to your server's key and open only to devices you approved.
date: 2026-11-11
---

Reaching a media server from outside the home has always meant a choice between an account with a company, a rented server, or opening a port on your router to the whole internet. **Peer-to-peer connections**, new in 0.8.0-alpha, add a fourth way: the app on your phone, TV or laptop finds its own way to your server and connects to it directly.

**How it finds a way.** The app tries the best way first and keeps looking for a better one: at home as always; straight there over IPv6; through a port your router opens if it offers that; by hole punching, where both ends connect at the same moment so both routers let it through; and last, through a community relay, another WittyMediaServer whose owner chose to help. A relay can't read what it carries.

**Who can get in.** Everything is encrypted from end to end to a key only your server holds. Only devices on your server's own list can connect, and they still sign in with a password. A connection from away always counts as away, so your limits for viewers away from home apply.

**Which apps.** The desktop app, the iPhone, iPad and Apple TV apps, and the Android app. A web browser away from home needs the app. A TV that has never been home joins with a code it shows, typed into your server's Remote Access page.

**Honestly.** It's off until you turn it on, it's new and has never been audited, and it hasn't been tried across two real home routers yet. If you're happy to make an account, Tailscale is still the better-proven choice. If you aren't, this is much safer than forwarding a port.

[How it works](/remote/), and the [remote access guide](/docs/remote/#peer-to-peer-connections) to turn it on.
