import { DEMO_ACCOUNTS, DEMO_PASSWORD } from '../constants/demo'
import { clearToken, request, setToken } from './client'
import { db } from './mock/db'
import { delay, uid } from './mock/mockUtils'
import { session } from './mock/session'

// Login, logout and "who am I" call the Flask API. Sign-up, verification and password reset
// stay on the in-memory mock until the backend endpoints exist (a later Sprint 1 story).

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

export function signIn({ role, record }) {
  if (role === 'mentor') session.mentorId = record.id
  if (role === 'student') session.studentId = record.id
  return { id: record.id, role, name: record.name, roll: record.roll }
}

// Every account as { role, record }, so password changes land on the stored record.
const accounts = () => [
  ...db.students.filter((s) => s.signedUp).map((record) => ({ role: 'student', record })),
  ...db.mentors.filter((m) => m.status === 'Active').map((record) => ({ role: 'mentor', record })),
  ...db.staff.map((record) => ({ role: record.role, record })),
]

// Students must be on IIC's roster, with the roster's email.
export function signup({ rollNumber, email, password }) {
  const s = db.students.find((x) => same(x.roll, rollNumber))
  if (!s) return fail('This roll number isn’t registered with IIC.')
  if (!same(s.email, email)) return fail('Use the institute email registered for this roll number.')
  if (s.signedUp) return fail('An account already exists for this roll number. Log in instead.')
  Object.assign(s, { signedUp: true, verified: false, password, verifyToken: uid() })
  return delay({ email: s.email, link: `/verify-email/${s.verifyToken}` })
}

export function resendVerification(email) {
  const s = db.students.find((x) => same(x.email, email) && x.signedUp && !x.verified)
  if (!s) return fail('There is nothing to verify for this email.')
  db.expiredTokens[s.verifyToken] = s.email // the old link stops working
  s.verifyToken = uid()
  return delay({ link: `/verify-email/${s.verifyToken}` })
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

function verifyOnce(token) {
  const s = db.students.find((x) => x.verifyToken === token)
  if (s) {
    Object.assign(s, { verified: true })
    delete s.verifyToken
    return delay({ status: 'verified', user: signIn({ role: 'student', record: s }) })
  }
  const email = db.expiredTokens[token]
  return delay(email ? { status: 'expired', email } : { status: 'invalid' })
}

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
