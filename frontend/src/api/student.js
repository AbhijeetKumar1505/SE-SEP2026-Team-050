// Student-side API. Each call goes through the shared request() wrapper in client.js.
// The backend stays snake_case; this layer maps responses to the camelCase shapes the
// student pages expect, and request bodies to the backend's snake_case fields.
import { request } from './client'

// Backend status short names -> the display labels the pages render (see constants/status.js).
export const PROBLEM_STATUS = {
  submitted: 'Submitted',
  under_review: 'Under review',
  awaiting_mentor: 'Awaiting mentor',
  mentor_assigned: 'Mentor assigned',
  reassignment_needed: 'Reassignment needed',
  closed: 'Closed by IIC',
  withdrawn: 'Withdrawn',
}

// Progress feedback labels -> backend values (and back when reading).
export const PROGRESS_FEEDBACK = {
  'No progress': 'no_progress',
  'Some progress': 'some_progress',
  'Goal met': 'goal_met',
}

export const CASE_TYPE = {
  'Request a different mentor': 'change',
  'End the mentorship': 'end',
  'Report a concern': 'misconduct',
}

// Session status short names -> display labels.
export const SESSION_STATUS = {
  planned: 'Planned',
  held: 'Held',
  cancelled: 'Cancelled',
}

const problemStatusLabel = (status) => PROBLEM_STATUS[status] ?? status

const sessionStatusLabel = (status) => SESSION_STATUS[status] ?? status

const mapProblem = (p) => ({
  id: p.id,
  status: problemStatusLabel(p.status),
  submittedAt: p.submitted_at,
  problem: p.description,
  tags: p.tags,
  goal: p.desired_outcome,
  guidance: p.guidance_preferences ?? '',
  closeReason: p.close_reason,
})

const mapMentor = (mentor) => ({
  name: mentor.name,
  headline: mentor.headline,
  channel: mentor.channel,
  contact: mentor.contact,
  availability: mentor.availability,
  timezone: mentor.time_zone,
  expertise: mentor.expertise,
  experience: mentor.experience,
})

// ---- Home ----

export async function getHome() {
  const data = await request('/api/students/me/home')
  return {
    problem: data.problem ? mapProblem(data.problem) : null,
    mentorship: data.mentorship
      ? { reachedOut: !!data.mentorship.reached_out, mentor: data.mentorship.mentor }
      : null,
    profile: data.profile
      ? {
          level: data.profile.level,
          careerInterest: data.profile.career_interest,
          courseCount: data.profile.course_count,
        }
      : null,
    acceptHours: data.accept_hours,
  }
}

// ---- S1: profile ----

export async function getProfile() {
  const p = await request('/api/students/me')
  return {
    name: p.name,
    roll: p.student_number,
    email: p.email,
    complete: p.complete,
    level: p.programme,
    cgpa: p.cgpa,
    courses: p.completed_courses,
    careerInterest: p.career_interest,
  }
}

export async function saveProfile({ level, cgpa, courses, careerInterest }) {
  return request('/api/students/me', {
    method: 'PUT',
    body: { programme: level, cgpa, completed_courses: courses, career_interest: careerInterest },
  })
}

// ---- S2 / S3: problem ----

export async function getSubmitStatus() {
  return request('/api/problems/me/status')
}

export async function submitProblem({ problem, tags, goal, guidance }) {
  return request('/api/problems', {
    method: 'POST',
    body: { description: problem, tags, desired_outcome: goal, guidance_preferences: guidance },
  })
}

export async function updateProblem(id, values) {
  return request(`/api/problems/${id}`, {
    method: 'PUT',
    body: {
      description: values.problem,
      tags: values.tags,
      desired_outcome: values.goal,
      guidance_preferences: values.guidance,
    },
  })
}

export async function withdrawProblem(id) {
  return request(`/api/problems/${id}/withdraw`, { method: 'POST' })
}

// ---- S4 / S5: mentorship ----

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

export async function getMyMentorship() {
  const data = await request('/api/mentorships/me')
  if (!data.mentorship) return { mentorship: null }
  const m = data.mentorship
  return {
    mentorship: {
      id: m.id,
      startedAt: m.assigned_at,
      reachedOutAt: m.reached_out_at,
      goal: m.goal,
      steps: m.steps,
      sessions: m.sessions.map(mapSession),
      checkpointDue: m.checkpoint_due,
      caseOpen: m.case_open,
      topics: m.topics,
      mentor: mapMentor(m.mentor),
    },
  }
}

export async function markReachedOut(id) {
  return request(`/api/mentorships/${id}/reached-out`, { method: 'POST' })
}

export async function saveGoal(id, goal) {
  return request(`/api/mentorships/${id}`, { method: 'PUT', body: { goal } })
}

export async function submitFeedback(id, progress, comment) {
  return request('/api/feedback', {
    method: 'POST',
    body: { mentorship_id: id, progress_status: PROGRESS_FEEDBACK[progress], comment },
  })
}

// ---- S7: asks IIC to change or end the mentorship ----

export async function openCase(id, requestType, reason) {
  return request('/api/cases', {
    method: 'POST',
    body: { mentorship_id: id, case_type: CASE_TYPE[requestType], details: reason },
  })
}
