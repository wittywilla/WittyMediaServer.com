// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 WittyWilla and contributors
// Every picture the site shows must be made only of openly licensed or
// public-domain works. content/licences.json records, for each picture, every
// work that can be seen in it and its licence. A picture with no record, or with
// any work under a licence not on the allowed list, is not published.
import fs from 'node:fs'
import path from 'node:path'

/**
 * Returns { blocked: Set of picture ids (and "<theme>/<id>"), problems: [{ level, message }] }.
 * Until content/licences.json exists, nothing is blocked and each picture gets a warning.
 */
export function licenceProblems(root, shots, themes = []) {
  const file = path.join(root, 'content', 'licences.json')
  const blocked = new Set()
  const problems = []
  if (!fs.existsSync(file)) {
    problems.push({ level: 'warning', message: 'content/licences.json is missing: no picture’s licences have been recorded yet' })
    return { blocked, problems }
  }
  const rec = JSON.parse(fs.readFileSync(file, 'utf8'))
  const allowed = new Set((rec.allowed || []).map((l) => l.toLowerCase()))
  const check = (key) => {
    const p = rec.pictures?.[key]
    if (!p) return 'has no licence record in content/licences.json'
    if (!Array.isArray(p.works)) return 'lists no works'
    const bad = p.works.filter((w) => !w.licence || !allowed.has(String(w.licence).toLowerCase()))
    if (bad.length) return `shows ${bad.map((w) => `“${w.title || '?'}” (${w.licence || 'no licence'})`).join(', ')}, which isn’t on the allowed list`
    if (p.works.some((w) => !w.source && String(w.licence).toLowerCase() !== 'own work')) return 'has a work with no source to check its licence against'
    return null
  }
  for (const s of shots) {
    const why = check(s.id)
    if (why) { blocked.add(s.id); problems.push({ level: 'error', message: `picture ${s.id} left out: it ${why}` }) }
    // Pictures in other themes show the same works unless they have a record of their own.
    for (const t of themes) {
      const key = `${t}/${s.id}`
      if (!rec.pictures?.[key]) { if (why) blocked.add(key); continue }
      const whyT = check(key)
      if (whyT) { blocked.add(key); problems.push({ level: 'error', message: `picture ${key} left out: it ${whyT}` }) }
    }
  }
  return { blocked, problems }
}
