import { DEMO_ACCOUNTS, DEMO_PASSWORD } from '../constants/demo'
import { clearToken, request, setToken } from './client'
import { db } from './mock/db'
import { delay, uid } from './mock/mockUtils'
import { session } from './mock/session'

// Login, logout, "who am I", sign-up and email verification call the Flask API. Password reset
// stays on the in-memory mock until its backend endpoint exists (Sprint 2).

const same = (a, b) => a.toLowerCase() === b.toLowerCase()
const fail = (message) => Promise.reject(new Error(message))

// The backend answers with every role, but the pages route by one role. Prefer the profile role.
const ROLE_ORDER = ['student', 'mentor', 'iic', 'leadership']

function toUser({ id, email, roles, name, roll }) {
  const role = ROLE_ORDER.find((r) => roles.includes(r)) ?? roles[0]
  return { id, email, roles, role, name: name || email, roll: roll ?? undefined }
}

// The other pages still read the mock, so point it at a demo record for the role that logged in.
// Removed with src/api/mock/ once every page calls the API.
function setMockRecord(role) {
  if (role === 'student') session.studentId = '23f1002345'
  if (role === 'mentor') session.mentorId = 'm01'
}

export async function login(email, password) {
  const { access_token: token, user: account } = await request('/api/auth/login', {
    method: 'POST',
    body: { email, password },
    auth: false,
  })
  setToken(token)
  const user = toUser(account)
  setMockRecord(user.role)
  return user
}

export async function me() {
  return toUser(await request('/api/auth/me'))
}

export async function logout() {
  try {
    await request('/api/auth/logout', { method: 'POST' })
  } finally {
    clearToken()
  }
}

// Prototype only: the header's role switcher signs in as that role's demo account.
// Removed in M3 together with the demo accounts.
export function switchDemoRole(role) {
  const account = DEMO_ACCOUNTS.find((a) => a.role === role)
  return account ? login(account.email, DEMO_PASSWORD) : fail('That demo account isn’t available.')
}

// ---- Mock: endpoint not built on the backend yet ----

// Every account as { role, record }, so password changes land on the stored record.
const accounts = () => [
  ...db.students.filter((s) => s.signedUp).map((record) => ({ role: 'student', record })),
  ...db.mentors.filter((m) => m.status === 'Active').map((record) => ({ role: 'mentor', record })),
  ...db.staff.map((record) => ({ role: record.role, record })),
]

// ---- Sign-up and email verification (US-01) ----
// The API checks the email domain and IIC's roster and emails the link; in development the email
// arrives in Mailpit (http://localhost:8025). The link is never returned to the browser.

export async function signup({ rollNumber, email, password }) {
  const d = await request('/api/auth/signup', {
    method: 'POST',
    body: { email, roll_number: rollNumber, password },
    auth: false,
  })
  return { email: d.email }
}

// Always succeeds, so nobody can probe who has signed up. Older links stop working.
export async function resendVerification(email) {
  await request('/api/auth/resend-verification', { method: 'POST', body: { email }, auth: false })
  return {}
}

// A verification link works once. In development React's StrictMode runs the page's effect twice,
// so every call for the same token shares one verification and gets the same answer (issue #10).
// A failure is forgotten, so the page can try again.
const verifications = new Map()

export function verifyEmail(token) {
  if (!verifications.has(token)) {
    const verification = verifyOnce(token).catch((error) => {
      verifications.delete(token)
      throw error
    })
    verifications.set(token, verification)
  }
  return verifications.get(token)
}

// Verifying logs the student in. 410: the link is over 24 hours old. 404: unknown or replaced by a
// newer link. 409: already used, so the account is verified and the student can log in.
async function verifyOnce(token) {
  try {
    const { access_token: accessToken, user: account } = await request('/api/auth/verify-email', {
      method: 'POST',
      body: { token },
      auth: false,
    })
    setToken(accessToken)
    const user = toUser(account)
    setMockRecord(user.role)
    return { status: 'verified', user }
  } catch (error) {
    if (error.status === 410) return { status: 'expired' }
    if (error.status === 404 || error.status === 409) return { status: 'invalid', message: error.message }
    throw error
  }
}

// ---- Password reset: still the mock, the backend has no endpoint yet ----

// Always succeeds, so nobody can probe which emails have accounts.
export function requestPasswordReset(email) {
  const account = accounts().find((a) => same(a.record.email, email))
  if (account) account.record.resetToken = uid()
  return delay(account ? { link: `/reset-password/${account.record.resetToken}` } : {})
}

export function resetPassword(token, password) {
  const account = accounts().find((a) => a.record.resetToken === token)
  if (!account) return fail('This reset link has expired.')
  account.record.password = password
  delete account.record.resetToken
  return delay()
}
