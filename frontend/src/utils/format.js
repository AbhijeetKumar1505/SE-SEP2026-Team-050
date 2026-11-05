const toDate = (d) => new Date(d.length === 10 ? `${d}T00:00` : d)

export const fmtDate = (d) =>
  toDate(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })

export const fmtTime = (t) =>
  new Date(`1970-01-01T${t}`).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })

export const hoursLeft = (deadline) => Math.max(0, Math.ceil((new Date(deadline) - Date.now()) / 36e5))
export const today = () => new Date().toLocaleDateString('en-CA') // YYYY-MM-DD, local time
export const firstName = (name) => name.split(' ')[0]
export const daysSince = (d) => Math.max(0, Math.round((Date.now() - toDate(d)) / 864e5))
export const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`
export const fmtDateTime = (d) =>
  new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
