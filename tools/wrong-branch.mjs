#!/usr/bin/env node
// `npm run build` on main. Hostinger's Node.js web app runs this only when it's
// been pointed at main, which holds the site's source, not the site. Hostinger
// publishes the whole branch into public_html, so building main would put the
// source code there and leave the home page a 403. Failing here stops that:
// a failed build leaves the live site as it was.
//
// To build the site yourself, run node build.mjs.
console.error(`
This is the main branch: the site's source code, not the site.

Hostinger should deploy the "live" branch, which GitHub Actions fills with the
finished site. In hPanel, open the web app's Deployments, then Deployment
settings, set Branch to live, and click Save and redeploy.

(To build the site on your own computer, run: node build.mjs)
`)
process.exit(1)
