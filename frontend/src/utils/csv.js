// Minimal CSV reader: comma separated, no quoted commas. First line is the header.
export function parseCsv(text) {
  const [head, ...lines] = text
    .trim()
    .split(/\r?\n/)
    .map((l) => l.split(',').map((c) => c.trim()))
  const keys = head.map((h) => h.toLowerCase())
  return lines.filter((l) => l.some(Boolean)).map((l) => Object.fromEntries(keys.map((k, i) => [k, l[i] ?? ''])))
}
