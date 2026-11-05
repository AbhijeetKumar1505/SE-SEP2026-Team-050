// Saves rows (array of arrays) as a CSV file in the browser.
export function downloadCsv(filename, rows) {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(',')).join('\n')
  const link = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })), download: filename })
  link.click()
  URL.revokeObjectURL(link.href)
}
