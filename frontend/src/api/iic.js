import { daysSince } from '../utils/format'
import { ACTOR, db, loadOf, returnToQueue } from './mock/db'
import { delay, found, uid } from './mock/mockUtils'
import { tags } from './mock/tagData'

// Mock implementation. In M3 each function becomes a fetch() with the same signature and return shape.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const ROLL = /^\d{2}f\d{7}$/i
const OPEN = ['Reassignment needed', 'Submitted', 'Under review', 'Awaiting mentor']
const byId = (list, id) => list.find((x) => x.id === id)
const split = (s = '') => s.split(';').map((x) => x.trim()).filter(Boolean)
const log = (list, text) => list.unshift({ at: new Date().toISOString(), text })

// ---- I1 / I2: problem queue and assignment ----
export const getQueue = () =>
  delay({
    problems: db.problems
      .filter((p) => OPEN.includes(p.status))
      .toSorted((a, b) => (b.status === 'Reassignment needed') - (a.status === 'Reassignment needed') || a.submittedAt.localeCompare(b.submittedAt)),
  })

export function getProblem(id) {
  const p = byId(db.problems, id)
  if (p?.status === 'Submitted') p.status = 'Under review' // opening a problem starts the review
  return found(p, 'Problem')
}

// Deterministic ranking: shared tags (more first), active mentees (fewer first), mentor id.
const rank = (id) => {
  const p = byId(db.problems, id)
  return db.mentors
    .map((m) => ({ ...m, load: loadOf(m), shared: m.expertise.filter((t) => p.tags.includes(t)).length }))
    .filter((m) => m.status === 'Active' && m.available && m.load < m.capacity)
    .sort((a, b) => b.shared - a.shared || a.load - b.load || a.id.localeCompare(b.id))
}
export const getRecommendations = (id) => delay(rank(id).filter((m) => m.shared > 0).slice(0, 4))
export const getEligibleMentors = (id) => delay(rank(id))

export function assignMentor(id, mentorId) {
  const m = byId(db.mentors, mentorId)
  if (loadOf(m) >= m.capacity) return Promise.reject(new Error(`${m.name} is at capacity and can’t be assigned another student.`))
  const p = byId(db.problems, id)
  Object.assign(p, { status: 'Awaiting mentor', mentor: m.name, assignedBy: ACTOR, assignedAt: new Date().toISOString() })
  delete p.reassignReason
  log(db.audit, `${ACTOR} assigned ${p.student.name}’s problem to ${m.name}`)
  return delay()
}

export function closeProblem(id, reason) {
  Object.assign(byId(db.problems, id), { status: 'Closed by IIC', closeReason: reason })
  log(db.audit, `${ACTOR} closed a problem: ${reason}`)
  return delay()
}

// ---- I3: mentor pool ----
export const getMentors = () => delay(db.mentors.map((m) => ({ ...m, load: loadOf(m) })))

// "Sends" the 7-day activation email; the link is returned so the prototype can open it.
const sendActivation = (m) => {
  m.activationToken = uid()
  return { link: `/activate/${m.activationToken}` }
}

export function verifyMentor(id, expertise) {
  const m = byId(db.mentors, id)
  Object.assign(m, { status: 'Verified – not activated', expertise, verifiedBy: ACTOR, verifiedAt: new Date().toISOString() })
  log(db.audit, `${ACTOR} verified ${m.name}`)
  return delay(sendActivation(m))
}

export function resendActivation(id) {
  const m = byId(db.mentors, id)
  log(db.audit, `${ACTOR} resent the activation link to ${m.name}`)
  return delay(sendActivation(m)) // the previous link stops working
}

export function addMentor({ name, email, headline }) {
  if (db.mentors.some((m) => m.email === email)) return Promise.reject(new Error('A mentor with this email already exists.'))
  db.mentors.push({ id: uid(), name, email, headline, status: 'Pending verification', available: false, capacity: db.settings.defaultCapacity, expertise: [], experience: [] })
  return delay()
}

// Validates each row, saves the good ones, reports the rest with row number and reason.
function importRows(rows, file, validate, save) {
  const result = { file, by: ACTOR, at: new Date().toISOString(), added: 0, updated: 0, errors: [] }
  rows.forEach((r, i) => {
    const reason = validate(r)
    if (reason) result.errors.push({ row: i + 2, reason }) // row 1 is the header
    else result[save(r) ? 'updated' : 'added'] += 1 // save() returns true when it updated an existing record
  })
  log(db.audit, `${ACTOR} imported ${file}`)
  return result
}

export function importMentors(rows, file) {
  const known = tags.map((t) => t.name)
  const result = importRows(
    rows,
    file,
    (r) => {
      if (!r.name) return 'Name is missing.'
      if (!EMAIL.test(r.email)) return 'Email is not valid.'
      const unknown = split(r['expertise tags']).find((t) => !known.includes(t))
      if (unknown) return `Unknown topic tag: ${unknown}.`
    },
    (r) => {
      const data = { name: r.name, email: r.email, expertise: split(r['expertise tags']), experience: split(r.experience) }
      const existing = db.mentors.find((m) => m.email === r.email)
      if (existing) Object.assign(existing, data)
      else db.mentors.push({ id: uid(), status: 'Pending verification', headline: '', available: false, capacity: db.settings.defaultCapacity, ...data })
      return !!existing
    },
  )
  return delay(result)
}

// ---- I4: roster ----
export const getRoster = () => delay({ students: db.students, lastImport: db.lastImport })

export function importRoster(rows, file) {
  const result = importRows(
    rows,
    file,
    (r) => {
      if (!r.name) return 'Name is missing.'
      if (!ROLL.test(r['roll number'])) return 'Roll number is not valid.'
      if (!db.settings.domains.includes(r['institute email']?.split('@')[1])) return 'Email is not on an approved domain.'
    },
    (r) => {
      const existing = byId(db.students, r['roll number'])
      if (existing) Object.assign(existing, { name: r.name, email: r['institute email'] })
      else db.students.push({ id: r['roll number'], name: r.name, roll: r['roll number'], email: r['institute email'], signedUp: false, profileComplete: false })
      return !!existing
    },
  )
  db.lastImport = result
  return delay(result)
}

export function removeStudent(id, reason) {
  db.students = db.students.filter((s) => s.id !== id) // backend: blocks sign-up and new problems
  log(db.audit, `${ACTOR} removed ${id} from the roster: ${reason}`)
  return delay()
}

// ---- I5: monitoring ----
// Flags come from the live settings (I7), so changing a window changes the flags.
function summary(m) {
  const { settings } = db
  const heldSessions = m.sessions.filter((s) => s.status === 'Held')
  const last = heldSessions.map((s) => s.date).sort().at(-1) ?? null
  const flags = [
    db.problems.find((p) => p.id === m.problemId)?.status === 'Reassignment needed' && 'reassign',
    !heldSessions.length && daysSince(m.startedAt) >= settings.firstSessionDays && 'firstSession',
    daysSince(last ?? m.startedAt) >= settings.inactiveDays && 'inactive',
    daysSince(m.checkpointDue) >= settings.feedbackOverdueDays && 'feedback',
  ].filter(Boolean)
  return {
    id: m.id, student: m.student.name, mentor: m.mentor, startedAt: m.startedAt,
    logged: heldSessions.length, confirmed: heldSessions.filter((s) => s.confirmed).length,
    lastSession: last, progress: m.progress, flags, caseId: m.caseId,
  }
}

export const getMonitoring = () =>
  delay({
    rows: db.mentorships.map(summary).sort((a, b) => b.flags.length - a.flags.length), // flagged first
    cases: db.cases.filter((c) => c.status === 'Open'),
    settings: db.settings,
    dailyChecks: db.dailyChecks,
  })

// ---- I6: cases ----
export function getCase(id) {
  const m = db.mentorships.find((x) => x.caseId === id)
  const c = byId(db.cases, id)
  return found(c && { ...c, mentorship: m && summary(m) }, 'Case')
}

export function saveMentorResponse(id, text) {
  const c = byId(db.cases, id)
  c.mentorResponse = text
  log(c.history, `${ACTOR} recorded the mentor’s response`)
  return delay()
}

export function decideCase(id, { decision, reason }) {
  const c = byId(db.cases, id)
  const m = db.mentorships.find((x) => x.caseId === id)
  c.status = 'Decided'
  log(c.history, `${ACTOR} decided “${decision}”: ${reason}`)
  log(db.audit, `${ACTOR} decided case ${id} (${decision})`)
  if (m && decision === 'close') m.caseId = null
  if (m && decision === 'reassign') returnToQueue(m, `case ${id}: ${reason}`)
  if (m && decision === 'remove') {
    // Removing a mentor ends all of their mentorships.
    db.mentorships.filter((x) => x.mentor === m.mentor).forEach((x) => returnToQueue(x, `${m.mentor} was removed: ${reason}`))
    db.mentors.find((x) => x.name === m.mentor).status = 'Removed'
  }
  return delay()
}

// ---- I7: settings ----
export function getSettings() {
  const { domains, ...values } = db.settings
  return delay({ values, domains, audit: db.audit })
}

export function updateSettings(values) {
  Object.assign(db.settings, values)
  log(db.audit, `${ACTOR} updated timing windows and capacity`)
  return delay()
}

export function addDomain(domain) {
  if (!db.settings.domains.includes(domain)) db.settings.domains.push(domain)
  log(db.audit, `${ACTOR} approved the domain ${domain}`)
  return delay()
}

export function removeDomain(domain) {
  db.settings.domains = db.settings.domains.filter((d) => d !== domain)
  log(db.audit, `${ACTOR} removed the domain ${domain}`)
  return delay()
}
