// Helpers for the in-memory mock backend (deleted together with api/mock in M3).
export const delay = (value, ms = 150) => new Promise((resolve) => setTimeout(() => resolve(structuredClone(value)), ms))
// Resolves with the item, or rejects like a 404 would.
export const found = (item, what) => (item ? delay(item) : Promise.reject(new Error(`${what} not found.`)))
export const joinReason = (reason, note) => (note ? `${reason} (${note})` : reason)
export const uid = () => Math.random().toString(36).slice(2, 9)
export const day = (offset) => new Date(Date.now() + offset * 864e5).toLocaleDateString('en-CA') // YYYY-MM-DD
export const ago = (hours) => new Date(Date.now() - hours * 36e5).toISOString()
