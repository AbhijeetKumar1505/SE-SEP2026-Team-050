import { db, loadOf, returnToQueue } from './mock/db'
import { day, delay, found, uid } from './mock/mockUtils'
import { session } from './mock/session'

// Mock implementation. In M3 each function becomes a fetch() call with the same
// signature and return shape, so no page changes.

const me = () => db.mentors.find((m) => m.id === session.mentorId)
const mine = () => db.mentorships.filter((m) => m.mentor === me().name)
const find = (id) => db.mentorships.find((m) => m.id === id)
const held = (m) => m.sessions.filter((s) => s.status === 'Held')
const byDate = (a, b) => `${a.date}${a.time ?? ''}`.localeCompare(`${b.date}${b.time ?? ''}`)
const waiting = () => db.problems.filter((p) => p.status === 'Awaiting mentor' && p.mentor === me().name)

export function getDashboard() {
  const active = mine()
  const thisMonth = active.flatMap(held).filter((s) => s.date.startsWith(day(0).slice(0, 7)))
  const nextDue = active.toSorted((a, b) => a.checkpointDue.localeCompare(b.checkpointDue))[0]
  return delay({
    capacity: me().capacity,
    load: loadOf(me()),
    sessionsThisMonth: thisMonth.length,
    confirmed: thisMonth.filter((s) => s.confirmed).length,
    nextCheckpoint: nextDue && { date: nextDue.checkpointDue, student: nextDue.student.name },
    assignments: waiting().map(({ id, assignedBy, assignedAt, tags, problem, goal, student: s }) => ({
      id, assignedBy, assignedAt, tags, problem, goal,
      student: { name: s.name, level: s.level, careerInterest: s.careerInterest, courses: s.courses }, // never CGPA or guidance preferences
      deadline: new Date(new Date(assignedAt).getTime() + db.settings.acceptHours * 36e5).toISOString(),
    })),
    mentorships: active.map((m) => ({
      id: m.id,
      student: m.student,
      startedAt: m.startedAt,
      held: held(m).length,
      nextSession: m.sessions.filter((s) => s.status === 'Planned').toSorted(byDate)[0],
    })),
  })
}

export function acceptAssignment(id) {
  const p = db.problems.find((x) => x.id === id)
  const { name, roll, email, level, careerInterest, courses } = p.student // email is revealed only now
  p.status = 'Mentor assigned'
  db.mentorships.push({
    id: uid(), problemId: id, mentor: me().name, student: { name, roll, email, level, careerInterest, courses },
    problem: p.problem, goal: p.goal, startedAt: day(0), checkpointDue: day(db.settings.feedbackDays),
    steps: [], sessions: [], progress: null, caseId: null,
  })
  return delay()
}

export function declineAssignment(id, reason) {
  const p = db.problems.find((x) => x.id === id)
  Object.assign(p, { status: 'Reassignment needed', reassignReason: `${me().name} declined: ${reason}` }) // back to IIC's queue
  delete p.mentor
  return delay()
}

export const getProfile = () => delay(me())

export function updateProfile({ available, channel, availability, timezone }) {
  Object.assign(me(), { available, channel, availability, timezone }) // capacity & expertise are read-only
  return delay()
}

export const getMentorship = (id) => found(find(id), 'Mentorship')

export function addStep(id, text) {
  find(id).steps.push({ id: uid(), text, done: false })
  return delay()
}

export function toggleStep(id, stepId) {
  const step = find(id).steps.find((s) => s.id === stepId)
  step.done = !step.done
  return delay()
}

export function addSession(id, entry) {
  find(id).sessions.push({ ...entry, id: uid(), loggedBy: 'mentor', confirmed: false })
  return delay()
}

export function confirmSession(id, sessionId) {
  find(id).sessions.find((s) => s.id === sessionId).confirmed = true
  return delay()
}

export function cancelSession(id, sessionId) {
  find(id).sessions.find((s) => s.id === sessionId).status = 'Cancelled' // cancelled sessions don't count
  return delay()
}

export function submitProgress(id, progress) {
  const m = find(id)
  m.progress = progress // visible to IIC only
  m.checkpointDue = day(db.settings.feedbackDays)
  return delay()
}

export function endMentorship(id, reason) {
  const m = find(id)
  returnToQueue(m, `${m.mentor} ended the mentorship: ${reason}`) // backend: status "Ended by mentor", audit log, notifications
  return delay()
}

// ---- A4: account activation (public page) ----
export function getActivation(token) {
  const m = db.mentors.find((x) => x.activationToken === token && x.status === 'Verified – not activated')
  return delay(m ? { valid: true, name: m.name, verifiedBy: m.verifiedBy } : { valid: false })
}

export function activateAccount(token, password) {
  void password // the backend stores a hash; the mock ignores it
  const m = db.mentors.find((x) => x.activationToken === token)
  Object.assign(m, { status: 'Active', available: true })
  delete m.activationToken
  return delay({ id: m.id, name: m.name, role: 'mentor' })
}
