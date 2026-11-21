// Key-case helpers for the API layer. The backend speaks snake_case; the pages expect camelCase.
// camelize() is for responses, snakeify() for request bodies. Both work through nested objects
// and arrays. Use them only where the keys are fixed field names: an object keyed by ids or
// names (such as { [mentorId]: note }) should be passed through untouched.

const toCamel = (key) => key.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase())
const toSnake = (key) => key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`)

const isPlainObject = (v) => v !== null && typeof v === 'object' && Object.getPrototypeOf(v) === Object.prototype

function mapKeys(value, fn) {
  if (Array.isArray(value)) return value.map((v) => mapKeys(v, fn))
  if (!isPlainObject(value)) return value
  return Object.fromEntries(Object.entries(value).map(([k, v]) => [fn(k), mapKeys(v, fn)]))
}

export const camelize = (value) => mapKeys(value, toCamel)
export const snakeify = (value) => mapKeys(value, toSnake)
