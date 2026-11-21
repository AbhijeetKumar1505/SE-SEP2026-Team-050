// IIC-side API. Each call goes through the shared request() wrapper in client.js.
// The backend stays snake_case; this layer maps responses to the camelCase shapes the IIC
// pages expect, and request bodies to the backend's snake_case fields.
// Same function names, arguments and return shapes as the old mock, so no page changes.
//
// The server now owns: mentor ranking, monitoring flags, "who did it" (taken from the JWT) and
// audit logging. Routes marked TODO(backend) are not built yet: see BACKEND_CONTRACT.md.
import { camelize, snakeify } from './casing'
import { request } from './client'
import { CASE_TYPE, PROBLEM_STATUS, PROGRESS_FEEDBACK, SESSION_STATUS } from './student'

// ---- Label maps (backend value -> what the pages compare against and render) ----

const reverse = (map) => Object.fromEntries(Object.entries(map).map(([label, value]) => [value, label]))
const PROGRESS_LABEL = reverse(PROGRESS_FEEDBACK)
const CASE_TYPE_LABEL = reverse(CASE_TYPE)

const MENTOR_STATUS = {
  pending_verification: 'Pending verification',
  verified: 'Verified – not activated',
  active: 'Active',
  removed: 'Removed',
}

const CASE_STATUS = {
  open: 'Open',
  under_review: 'Open',
  decided: 'Decided',
  resolved: 'Decided',
}

// Backend flag_type -> the flag keys the monitoring page uses.
const FLAG = {
  reassignment_needed: 'reassign',
  first_session_overdue: 'firstSession',
  inactive: 'inactive',
  feedback_overdue: 'feedback',
  wellbeing: 'wellbeing',
}

const progressLabel = (value) => PROGRESS_LABEL[value] ?? value ?? null

// ---- Mappers ----

const mapProblem = (p) => ({
  id: p.id,
  status: PROBLEM_STATUS[p.status] ?? p.status,
  submittedAt: p.submitted_at,
  problem: p.description,
  tags: p.tags,
  goal: p.desired_outcome,
  guidance: p.guidance_preferences ?? '',
  closeReason: p.close_reason,
  student: camelize(p.student), // { name, roll, email, level, cgpa, careerInterest, courses }
  mentor: p.mentor, // the assigned mentor's name, if any
  assignedBy: p.assigned_by,
  assignedAt: p.assigned_at,
  reassignReason: p.reassign_reason,
  respondBy: p.respond_by,
})

const mapMentor = (m) => ({
  id: m.id,
  name: m.name,
  email: m.email,
  headline: m.headline ?? '',
  status: MENTOR_STATUS[m.status] ?? m.status,
  available: m.available,
  capacity: m.capacity,
  load: m.load,
  shared: m.shared_tags_count ?? 0, // tags shared with the problem (recommendations only)
  expertise: m.expertise ?? [],
  experience: m.experience ?? [],
  channel: m.channel,
  contact: m.contact,
  availability: m.availability,
  timezone: m.timezone ?? m.time_zone,
  capacityRequested: !!m.capacity_requested,
  verifiedBy: m.verified_by,
  verifiedAt: m.verified_at,
})

const mapImport = (r) =>
  r && {
    file: r.file,
    by: r.imported_by,
    at: r.imported_at,
    added: r.added,
    updated: r.updated,
    errors: r.errors ?? [], // [{ row, reason }]
  }

const mapRow = (r) => ({
  id: r.id,
  student: r.student,
  mentor: r.mentor,
  startedAt: r.started_at,
  logged: r.logged,
  confirmed: r.confirmed,
  lastSession: r.last_session ?? null,
  progress: progressLabel(r.progress),
  comment: r.comment,
  flags: (r.flags ?? []).map((f) => FLAG[f] ?? f),
  caseId: r.case_id ?? null,
})

const mapCase = (c) => ({
  ...camelize(c),
  type: CASE_TYPE_LABEL[c.case_type] ?? c.case_type,
  status: CASE_STATUS[c.status] ?? c.status,
  mentorship: c.mentorship ? mapRow(c.mentorship) : null,
})

const mapAudit = (e) => ({
  id: e.id,
  at: e.created_at,
  text: `${e.actor?.email ?? 'System'} ${e.action.replace(/_/g, ' ')}${e.details ? `: ${e.details}` : ''}`,
})

// ---- I1 / I2: problem queue and assignment ----

// TODO(backend): GET /api/problems/queue -> { problems: [...] }, reassignments first, then oldest first.
export async function getQueue() {
  const d = await request('/api/problems/queue')
  return { problems: d.problems.map(mapProblem) }
}

// TODO(backend): GET /api/problems/<id>. Opening a "submitted" problem moves it to "under_review".
export async function getProblem(id) {
  return mapProblem(await request(`/api/problems/${id}`))
}

// TODO(backend): GET /api/matching/problems/<id>/recommendations -> up to 4 ranked mentors.
export async function getRecommendations(id) {
  const mentors = await request(`/api/matching/problems/${id}/recommendations`)
  return mentors.map(mapMentor)
}

// TODO(backend): GET /api/matching/problems/<id>/eligible-mentors -> every assignable mentor, ranked.
export async function getEligibleMentors(id) {
  const mentors = await request(`/api/matching/problems/${id}/eligible-mentors`)
  return mentors.map(mapMentor)
}

// The server enforces one mentor per student and the mentor's capacity (409 with a message).
// TODO(backend): POST /api/problems/<id>/assign
export async function assignMentor(id, mentorId) {
  return request(`/api/problems/${id}/assign`, { method: 'POST', body: { mentor_id: mentorId } })
}

// TODO(backend): POST /api/problems/<id>/close
export async function closeProblem(id, reason) {
  return request(`/api/problems/${id}/close`, { method: 'POST', body: { reason } })
}

// ---- I3: mentor pool ----

// TODO(backend): GET /api/mentors -> every mentor, with load and capacity_requested.
export async function getMentors() {
  const mentors = await request('/api/mentors')
  return mentors.map(mapMentor)
}

// Asks an available mentor to take one more student; they answer from their dashboard.
// TODO(backend): POST /api/mentors/<id>/capacity-requests
export async function requestCapacity(mentorId) {
  return request(`/api/mentors/${mentorId}/capacity-requests`, { method: 'POST' })
}

// The server emails the 7-day activation link. In development it may also return it as
// `activation_link`, so the prototype can still open it.
// TODO(backend): POST /api/mentors/<id>/verify
export async function verifyMentor(id, expertise) {
  const d = await request(`/api/mentors/${id}/verify`, { method: 'POST', body: { expertise } })
  return { link: d?.activation_link }
}

// TODO(backend): POST /api/mentors/<id>/resend-activation. The previous link stops working.
export async function resendActivation(id) {
  const d = await request(`/api/mentors/${id}/resend-activation`, { method: 'POST' })
  return { link: d?.activation_link }
}

// TODO(backend): POST /api/mentors
export async function addMentor({ name, email, headline }) {
  return request('/api/mentors', { method: 'POST', body: { name, email, headline } })
}

// The page parses the CSV; the rows are sent as JSON and the server validates each one.
// TODO(backend): POST /api/mentors/import
export async function importMentors(rows, file) {
  const d = await request('/api/mentors/import', {
    method: 'POST',
    body: {
      file,
      rows: rows.map((r) => ({
        name: r.name,
        email: r.email,
        expertise_tags: r['expertise tags'],
        experience: r.experience,
      })),
    },
  })
  return mapImport(d)
}

// ---- I4: roster ----

// TODO(backend): GET /api/students/roster
export async function getRoster() {
  const d = await request('/api/students/roster')
  return {
    students: d.students.map((s) => ({
      id: s.id,
      name: s.name,
      roll: s.roll,
      email: s.email,
      signedUp: s.signed_up,
      profileComplete: s.profile_complete,
    })),
    lastImport: mapImport(d.last_import),
  }
}

// TODO(backend): POST /api/students/roster/import
export async function importRoster(rows, file) {
  const d = await request('/api/students/roster/import', {
    method: 'POST',
    body: {
      file,
      rows: rows.map((r) => ({
        name: r.name,
        roll_number: r['roll number'],
        institute_email: r['institute email'],
      })),
    },
  })
  return mapImport(d)
}

// Blocks sign-up and new problems for that student.
// TODO(backend): POST /api/students/roster/<id>/remove
export async function removeStudent(id, reason) {
  return request(`/api/students/roster/${encodeURIComponent(id)}/remove`, { method: 'POST', body: { reason } })
}

// ---- I5: monitoring ----

// Flags are computed on the server from the live timing windows (I7).
// TODO(backend): GET /api/monitoring -> { rows, cases, settings, daily_checks }, flagged rows first.
export async function getMonitoring() {
  const d = await request('/api/monitoring')
  return {
    rows: d.rows.map(mapRow),
    cases: d.cases.map(mapCase),
    settings: camelize(d.settings),
    dailyChecks: camelize(d.daily_checks),
  }
}

// ---- I8: one mentorship's feedback from both sides, with the AI wellbeing flag ----

// Dates and durations only: IIC never sees what was discussed.
// TODO(backend): GET /api/monitoring/mentorships/<id>/review
export async function getMentorshipReview(id) {
  const m = await request(`/api/monitoring/mentorships/${id}/review`)
  return {
    id: m.id,
    student: m.student,
    mentor: m.mentor,
    startedAt: m.started_at,
    caseId: m.case_id ?? null,
    sessions: m.sessions.map((s) => ({
      id: s.id,
      date: s.date,
      duration: s.duration,
      status: SESSION_STATUS[s.status] ?? s.status,
      confirmed: s.confirmed,
    })),
    feedback: m.feedback.map((f) => ({
      id: f.id,
      date: f.date,
      from: f.from,
      progress: progressLabel(f.progress),
      comment: f.comment,
    })),
    flag: camelize(m.flag) ?? null,
    history: camelize(m.history),
  }
}

// IIC's answer to the flag: 'reviewed' (will follow up) or 'dismissed' (not a concern).
// The AI never contacts anyone or changes the mentorship.
// TODO(backend): POST /api/monitoring/mentorships/<id>/wellbeing-flag/resolve
export async function resolveWellbeingFlag(id, outcome) {
  return request(`/api/monitoring/mentorships/${id}/wellbeing-flag/resolve`, { method: 'POST', body: { outcome } })
}

// ---- I6: cases ----

// The server has POST /api/cases only; reading and deciding a case are not built yet.
// TODO(backend): GET /api/cases/<id> (adds mentor_response, history and a mentorship summary).
export async function getCase(id) {
  return mapCase(await request(`/api/cases/${id}`))
}

// TODO(backend): PUT /api/cases/<id>/mentor-response
export async function saveMentorResponse(id, text) {
  return request(`/api/cases/${id}/mentor-response`, { method: 'PUT', body: { text } })
}

// decision is 'close', 'reassign' or 'remove'. The server applies the consequences
// (return to queue, remove the mentor and end their mentorships) and writes the audit entry.
// TODO(backend): POST /api/cases/<id>/decide
export async function decideCase(id, { decision, reason }) {
  return request(`/api/cases/${id}/decide`, { method: 'POST', body: { decision, reason } })
}

// ---- I7: settings ----

// TODO(backend): GET /api/settings/timing and /api/settings/domains. The audit log route exists.
export async function getSettings() {
  const [values, domains, audit] = await Promise.all([
    request('/api/settings/timing'),
    request('/api/settings/domains'),
    request('/api/audit?page_size=50'),
  ])
  return { values: camelize(values), domains, audit: audit.map(mapAudit) }
}

// TODO(backend): PUT /api/settings/timing
export async function updateSettings(values) {
  return request('/api/settings/timing', { method: 'PUT', body: snakeify(values) })
}

// TODO(backend): POST /api/settings/domains
export async function addDomain(domain) {
  return request('/api/settings/domains', { method: 'POST', body: { domain } })
}

// TODO(backend): DELETE /api/settings/domains/<domain>
export async function removeDomain(domain) {
  return request(`/api/settings/domains/${encodeURIComponent(domain)}`, { method: 'DELETE' })
}
