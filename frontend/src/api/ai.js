import { camelize } from './casing'
import { request } from './client'

// The three AI features. AI output only advises: the user decides what to do with it.
// The server holds the model call, so nothing but the fields below leaves the browser.
// None of these routes exist yet: see BACKEND_CONTRACT.md.

// S2 Problem coach: suggested tags (from IIC's active list) and hints. Only the description is sent;
// the server knows which tags are active.
// TODO(backend): POST /api/ai/problem-coach. The response keys must match what the mock's
// coachProblem() returned, in snake_case.
export async function checkProblem(text) {
  return camelize(await request('/api/ai/problem-coach', { method: 'POST', body: { description: text } }))
}

// I2 mentor fit notes, as { [mentorId]: note }. They explain the ranking; they never change it.
// TODO(backend): POST /api/ai/mentor-fit -> { notes: { "<mentor_id>": "..." } }
export async function explainFit(problemId, mentorIds) {
  const d = await request('/api/ai/mentor-fit', {
    method: 'POST',
    body: { problem_id: problemId, mentor_ids: mentorIds },
  })
  return d.notes // keyed by mentor id: deliberately not run through camelize()
}

// I8 summary of both sides' feedback and the session pattern.
// TODO(backend): POST /api/ai/mentorships/<id>/summary -> { summary, feedback_count }
export async function summariseMentorship(id) {
  const d = await request(`/api/ai/mentorships/${id}/summary`, { method: 'POST' })
  return { summary: d.summary, feedbackCount: d.feedback_count }
}
