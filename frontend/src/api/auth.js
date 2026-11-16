import { DEMO_ACCOUNTS, DEMO_PASSWORD } from '../constants/demo'
import { db } from './mock/db'
import { delay, uid } from './mock/mockUtils'
import { session } from './mock/session'

// Mock implementation. In M3 each function becomes a fetch() with the same signature and return shape.
// Links that the backend would email are returned as `link`, so the prototype can open them.

const same = (a, b) => a.toLowerCase() === b.toLowerCase()
const fail = (message) => Promise.reject(new Error(message))

// Every account as { role, record }, so password changes land on the stored record.
const accounts = () => [
  ...db.students.filter((s) => s.signedUp).map((record) => ({ role: 'student', record })),
  ...db.mentors.filter((m) => m.status === 'Active').map((record) => ({ role: 'mentor', record })),
  ...db.staff.map((record) => ({ role: record.role, record })),
]

export function signIn({ role, record }) {
  if (role === 'mentor') session.mentorId = record.id
  if (role === 'student') session.studentId = record.id
  return { id: record.id, role, name: record.name, roll: record.roll }
}

export function login(email, password) {
  const account = accounts().find((a) => same(a.record.email, email))
  if (!account || (account.record.password ?? DEMO_PASSWORD) !== password) return fail('Email or password is incorrect.')
  if (account.role === 'student' && !account.record.verified) return fail('Verify your email first. Check your inbox for the link.')
  return delay(signIn(account))
}

// Prototype only: the header's role switcher signs straight in as that role's demo account.
// Removed in M3 together with the demo accounts.
export function switchDemoRole(role) {
  const { email } = DEMO_ACCOUNTS.find((a) => a.role === role)
  const account = accounts().find((a) => same(a.record.email, email))
  return account ? delay(signIn(account)) : fail('That demo account isn’t available.')
}

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

export function verifyEmail(token) {
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
