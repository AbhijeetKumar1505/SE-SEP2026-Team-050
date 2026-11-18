// The one place that talks to the Flask API: base URL, the login token and errors.
// Every function in src/api/ should go through request() rather than calling fetch() itself.

const TOKEN_KEY = 'mentoring.access_token'

// Empty in development: Vite proxies /api to the Flask server (see vite.config.js).
// In production set VITE_API_URL to the API origin, without a trailing slash.
const BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const hasToken = () => !!getToken()
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

export class ApiError extends Error {
  constructor(message, { status, body } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

// Calls the API and returns the parsed JSON body (undefined for 204 No Content).
// `auth: false` is for login, which has no token yet. A 401 on a logged-in request clears the
// stored token and tells AuthContext, so a stale login does not leave the app half signed in.
export async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = auth ? getToken() : null
  if (token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError('Can’t reach the server. Check that the API is running.')
  }

  if (response.status === 204) return undefined

  const data = await response.json().catch(() => undefined)
  if (!response.ok) {
    if (response.status === 401 && token) {
      clearToken()
      window.dispatchEvent(new Event('auth:unauthorized'))
    }
    throw new ApiError(data?.message || `The request failed (${response.status}).`, {
      status: response.status,
      body: data,
    })
  }
  return data
}
