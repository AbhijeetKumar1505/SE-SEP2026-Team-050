import { day, delay, uid } from './mock/mockUtils'
import { db } from './mock/db'
import { session } from './mock/session'
import { EDITABLE } from '../constants/student'

// Student-side API. Mock implementation; in M3 each function becomes a fetch() with the same signature.

const me = () => db.students.find((s) => s.id === session.studentId)
const myProblem = () => db.problems.findLast((p) => p.student.roll === me().roll)
const myMentorship = () => db.mentorships.find((m) => m.student.roll === me().roll)
const isOpen = (p) => p && !['Withdrawn', 'Closed by IIC'].includes(p.status)
const fail = (message) => Promise.reject(new Error(message))

// What a student may see of their problem: never the mentor's identity before they accept, nor IIC's notes.
const view = ({ id, status, submittedAt, problem, tags, goal, guidance, closeReason }) => ({
  id,
  status,
  submittedAt,
  problem,
  tags,
  goal,
  guidance,
  closeReason,
})

export function getHome() {
  const s = me()
  const m = myMentorship()
  return delay({
    problem: myProblem() && view(myProblem()),
    mentorship: m && { reachedOut: !!m.reachedOutAt, mentor: m.mentor },
    profile: s.profile && { ...s.profile, courseCount: s.profile.courses.split(',').filter((c) => c.trim()).length },
    acceptHours: db.settings.acceptHours,
  })
}

// ---- S1: profile ----
export function getProfile() {
  const { name, roll, email, profile } = me()
  return delay({ name, roll, email, complete: !!profile, ...profile })
}

export function saveProfile({ level, cgpa, courses, careerInterest }) {
  me().profile = { level, cgpa, courses, careerInterest } // CGPA is visible to IIC only
  return delay()
}

// ---- S2 / S3: problem ----
export const getSubmitStatus = () => delay({ hasOpenProblem: isOpen(myProblem()) || !!myMentorship() })

export function submitProblem({ problem, tags, goal, guidance }) {
  const s = me()
  if (isOpen(myProblem()) || myMentorship()) return fail('You already have an open problem.')
  if (!s.profile) return fail('Complete your profile first.')
  const { level, cgpa, careerInterest, courses } = s.profile
  db.problems.push({
    id: uid(),
    student: { name: s.name, roll: s.roll, email: s.email, level, cgpa, careerInterest, courses },
    submittedAt: day(0),
    status: 'Submitted',
    problem,
    tags,
    goal,
    guidance,
  })
  return delay()
}

export function updateProblem(id, values) {
  const p = db.problems.find((x) => x.id === id)
  if (!EDITABLE.includes(p.status)) return fail('This request can’t be edited any more.')
  Object.assign(p, values)
  return delay()
}

export function withdrawProblem(id) {
  const p = db.problems.find((x) => x.id === id)
  if (!EDITABLE.includes(p.status)) return fail('This request can’t be withdrawn any more.')
  p.status = 'Withdrawn'
  return delay()
}

// ---- S4 / S5: mentorship ----
export function getMyMentorship() {
  const m = myMentorship()
  if (!m) return delay({ mentorship: null })
  const mentor = db.mentors.find((x) => x.name === m.mentor)
  const { name, headline, channel, contact, availability, timezone, expertise, experience } = mentor
  return delay({
    mentorship: {
      id: m.id,
      startedAt: m.startedAt,
      reachedOutAt: m.reachedOutAt,
      goal: m.goal,
      steps: m.steps,
      sessions: m.sessions,
      checkpointDue: m.studentCheckpointDue,
      caseOpen: db.cases.some((c) => c.id === m.caseId && c.status === 'Open'),
      topics: myProblem()?.tags ?? [],
      mentor: { name, headline, channel, contact, availability, timezone, expertise, experience },
    },
  })
}

const find = (id) => db.mentorships.find((m) => m.id === id)

export function markReachedOut(id) {
  find(id).reachedOutAt = day(0) // the mentor and IIC can see this
  return delay()
}

export function saveGoal(id, goal) {
  find(id).goal = goal
  return delay()
}

export function submitFeedback(id, progress, comment) {
  const m = find(id)
  Object.assign(m, { studentProgress: progress, studentComment: comment, studentCheckpointDue: day(db.settings.feedbackDays) })
  return delay()
}

// ---- S7: asks IIC to change or end the mentorship ----
export function openCase(id, request, reason) {
  const m = find(id)
  const caseId = `C-${String(14 + db.cases.length).padStart(3, '0')}`
  const at = new Date().toISOString()
  db.cases.push({
    id: caseId,
    type: 'Student request',
    status: 'Open',
    student: m.student.name,
    mentor: m.mentor,
    openedAt: at,
    request,
    reason,
    mentorResponse: '',
    history: [{ at, text: `Case opened by ${m.student.name}` }],
  })
  m.caseId = caseId
  return delay()
}
