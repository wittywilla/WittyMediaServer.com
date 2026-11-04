// Reads a release's file names and says what each one is for, so the download
// page can name the right file for each computer without anyone keeping a list.

const SYSTEMS = [
  { id: 'windows', name: 'Windows', icon: 'monitor', test: /windows|win(32|64)|\.msi$|setup\.exe$/i },
  { id: 'macos', name: 'macOS', icon: 'laptop', test: /macos|darwin|\.dmg$/i },
  { id: 'linux', name: 'Linux', icon: 'terminal', test: /linux|\.appimage$|\.deb$|\.rpm$|\.pacman$/i },
  { id: 'freebsd', name: 'FreeBSD', icon: 'server', test: /freebsd/i },
  { id: 'android', name: 'Android', icon: 'phone', test: /\.apk$/i },
]

const ARCH = [
  { id: 'arm64', test: /arm64|aarch64/i },
  { id: 'armv7', test: /armv7|armhf/i },
  { id: 'amd64', test: /amd64|x86_64|x64/i },
  { id: '386', test: /[-_]386[-_.]|i386|i686/i },
]

const archLabel = (sys, arch) => {
  if (sys === 'macos') return { arm64: 'Apple silicon', amd64: 'Intel' }[arch] || arch
  return { amd64: '64-bit PC (x64)', arm64: '64-bit ARM', armv7: '32-bit ARM', '386': '32-bit PC (x86)' }[arch] || 'Any'
}

// What a file is, and how far up the list it goes (lower first).
const KINDS = [
  { test: /\.msi$/i, label: 'Installer', ext: '.msi', rank: 0 },
  { test: /setup\.exe$/i, label: 'Installer', ext: '.exe', rank: 0 },
  { test: /macos.*\.pkg$/i, label: 'Installer', ext: '.pkg', rank: 0 },
  { test: /\.dmg$/i, label: 'Disk image', ext: '.dmg', rank: 0 },
  { test: /\.deb$/i, label: 'Debian, Ubuntu and relatives', ext: '.deb', rank: 0 },
  { test: /\.rpm$/i, label: 'Fedora, RHEL and relatives', ext: '.rpm', rank: 1 },
  { test: /\.pacman$/i, label: 'Arch and relatives', ext: '.pacman', rank: 2 },
  { test: /\.appimage$/i, label: 'AppImage, for any distribution', ext: '.AppImage', rank: 1 },
  { test: /freebsd.*\.pkg$/i, label: 'Package', ext: '.pkg', rank: 0 },
  { test: /\.apk$/i, label: 'App for phones, tablets and TVs', ext: '.apk', rank: 0 },
  { test: /\.zip$/i, label: 'ZIP, without installing', ext: '.zip', rank: 3 },
  { test: /\.tar\.gz$/i, label: 'Archive, without a package', ext: '.tar.gz', rank: 4 },
]

/**
 * Groups a release's files by system.
 * Returns { systems: [{ id, name, icon, files: [{ name, size, url, arch, archLabel, kind, ext, rank }] }], sums, others }.
 */
export function classify(assets) {
  const systems = new Map()
  let sums = null, sig = null
  const others = []
  for (const a of assets) {
    if (/SHA256SUMS\.txt$/i.test(a.name)) { sums = a; continue }
    if (/\.sig$|\.asc$/i.test(a.name)) { if (/SHA256SUMS/i.test(a.name)) sig = a; continue }
    const sys = SYSTEMS.find((s) => s.test.test(a.name))
    const kind = KINDS.find((k) => k.test.test(a.name))
    if (!sys || !kind) { others.push(a); continue }
    const arch = sys.id === 'android' ? 'any' : (ARCH.find((x) => x.test.test(a.name))?.id || 'any')
    if (!systems.has(sys.id)) systems.set(sys.id, { ...sys, files: [] })
    systems.get(sys.id).files.push({ ...a, arch, archLabel: sys.id === 'android' ? 'Every Android device' : archLabel(sys.id, arch), kind: kind.label, ext: kind.ext, rank: kind.rank })
  }
  const archOrder = ['amd64', 'arm64', 'armv7', '386', 'any']
  for (const s of systems.values()) {
    s.files.sort((a, b) => a.rank - b.rank || archOrder.indexOf(a.arch) - archOrder.indexOf(b.arch) || a.name.localeCompare(b.name))
    s.archs = [...new Set(s.files.map((f) => f.arch))].sort((a, b) => archOrder.indexOf(a) - archOrder.indexOf(b))
  }
  const order = SYSTEMS.map((s) => s.id)
  return { systems: [...systems.values()].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id)), sums, sig, others }
}

/** The one file most people on that system want, for each of its architectures. */
export function recommended(system) {
  const out = []
  for (const arch of system.archs) {
    const f = system.files.filter((x) => x.arch === arch).sort((a, b) => a.rank - b.rank)[0]
    if (f) out.push(f)
  }
  return out
}
