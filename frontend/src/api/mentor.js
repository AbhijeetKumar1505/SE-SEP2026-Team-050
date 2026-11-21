// Mentor-side API. Each call goes through the shared request() wrapper in client.js.
// The backend stays snake_case; this layer maps responses to the camelCase shapes the
// mentor pages expect, and request bodies to the backend's snake_case fields.
// Same function names, arguments and return shapes as the old mock, so no page changes.
import { ApiError, request, setToken } from './client'
import { me } from './auth'
import { PROGRESS_FEEDBACK, SESSION_STATUS } from './student'

const sessionStatusLabel = (status) => SESSION_STATUS[status] ?? status

const mapSession = (s) => ({
  id: s.id,
  date: s.date,
  time: s.time,
  duration: s.duration,
  topic: s.topic,
  channel: s.channel,
  link: s.link,
  status: sessionStatusLabel(s.status),
  confirmed: s.confirmed,
  loggedBy: s.logged_by,
})

// ---- Dashboard ----

export async function getDashboard() {
  const d = await request('/api/mentors/me/dashboard')
  return {
    capacity: d.capacity,
    capacityRequest: d.capacity_request ?? null, // { id, by, from, to }
    load: d.load,
    sessionsThisMonth: d.sessions_this_month,
    confirmed: d.confirmed,
    nextCheckpoint: d.next_checkpoint
      ? {
          date: d.next_checkpoint.date,
          // The pages show the student's name; accept either a name or { name }.
          student: d.next_checkpoint.student?.name ?? d.next_checkpoint.student,
        }
      : null,
    assignments: d.assignments.map((a) => ({
      id: a.id, // the mentorship id: accept and decline use it
      assignedBy: a.assigned_by,
      assignedAt: a.assigned_at,
      tags: a.tags,
      problem: a.problem,
      goal: a.goal,
      student: a.student, // already { name, level, careerInterest, courses }; never CGPA or guidance
      deadline: a.deadline,
    })),
    mentorships: d.mentorships.map((m) => ({
      id: m.id,
      student: m.student,
      startedAt: m.started_at,
      held: m.held,
      nextSession: m.next_session ? mapSession(m.next_session) : null,
    })),
  }
}

export async function acceptAssignment(id) {
  return request(`/api/mentors/mentorships/${id}/accept`, { method: 'POST' })
}

export async function declineAssignment(id, reason, note) {
  return request(`/api/mentors/mentorships/${id}/decline`, {
    method: 'POST',
    body: { reason, note: note || null },
  })
}

export async function answerCapacityRequest(id, accept) {
  return request(`/api/mentors/capacity-requests/${id}/answer`, { method: 'POST', body: { accept } })
}

// ---- Profile ----

// The backend already uses the page's field names here.
export const getProfile = () => request('/api/mentors/me')

export async function updateProfile({ available, channel, contact, availability, timezone }) {
  return request('/api/mentors/me', {
    method: 'PUT',
    body: { available, channel, contact, availability, timezone }, // capacity & expertise are read-only
  })
}

// ---- Mentorship ----

export async function getMentorship(id) {
  const m = await request(`/api/mentors/mentorships/${id}`)
  return {
    id: m.id,
    status: m.status,
    goal: m.goal,
    steps: m.steps,
    startedAt: m.answered_at ?? m.assigned_at,
    assignedAt: m.assigned_at,
    reachedOutAt: m.reached_out_at,
    checkpointDue: m.checkpoint_due,
    topics: m.topics,
    problem: m.problem,
    student: m.student,
    mentor: m.mentor,
    sessions: m.sessions.map(mapSession),
  }
}

// Same endpoint the student uses: the server reads the role from the token.
export async function submitProgress(id, progress, comment) {
  return request('/api/feedback', {
    method: 'POST',
    body: { mentorship_id: id, progress_status: PROGRESS_FEEDBACK[progress] ?? progress, comment },
  })
}

// TODO(backend): route not built yet. Proposed: POST /api/mentors/mentorships/<id>/end
// Moves the problem back to IIC's queue (status "reassignment_needed"), audit-logs it, notifies IIC.
export async function endMentorship(id, reason, note) {
  return request(`/api/mentors/mentorships/${id}/end`, { method: 'POST', body: { reason, note: note || null } })
}

// ---- A4: account activation (public page) ----

// TODO(backend): routes not built yet. Proposed: GET and POST /api/mentors/activation/<token> (no auth).
export async function getActivation(token) {
  try {
    const d = await request(`/api/mentors/activation/${encodeURIComponent(token)}`, { auth: false })
    return d.valid ? { valid: true, name: d.name, verifiedBy: d.verified_by } : { valid: false }
  } catch (err) {
    if (err instanceof ApiError && [404, 410].includes(err.status)) return { valid: false }
    throw err
  }
}

// Sets the password, activates the account and signs the mentor in (same response as login).
export async function activateAccount(token, password) {
  const { access_token: accessToken } = await request(`/api/mentors/activation/${encodeURIComponent(token)}`, {
    method: 'POST',
    body: { password },
    auth: false,
  })
  setToken(accessToken)
  return me()
}
