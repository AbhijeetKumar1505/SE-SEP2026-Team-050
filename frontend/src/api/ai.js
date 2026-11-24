import { camelize } from './casing'
import { request } from './client'

// Sprint 2 (issue #8): the AI features have no backend endpoints yet, so the problem coach and the mentorship summary keep the in-memory mock.
// The API versions further down are ready, named ...FromApi: once an endpoint is built, export that
// version under the page-facing name instead of the mock one.
export { checkProblem, summariseMentorship } from './mock/aiMock'

// The mock cannot explain the fit of the real mentors the assignment page lists, so it says so.
export const explainFit = () => Promise.reject(new Error('AI fit notes come in Sprint 2.'))

// The three AI features. AI output only advises: the user decides what to do with it.
// The server holds the model call, so nothing but the fields below leaves the browser.
// None of these routes exist yet: see BACKEND_CONTRACT.md.

// S2 Problem coach: suggested tags (from IIC's active list) and hints. Only the description is sent;
// the server knows which tags are active.
// TODO(backend): POST /api/ai/problem-coach. The response keys must match what the mock's
// coachProblem() returned, in snake_case.
export async function checkProblemFromApi(text) {
  return camelize(await request('/api/ai/problem-coach', { method: 'POST', body: { description: text } }))
}

// I2 mentor fit notes, as { [mentorId]: note }. They explain the ranking; they never change it.
// TODO(backend): POST /api/ai/mentor-fit -> { notes: { "<mentor_id>": "..." } }
export async function explainFitFromApi(problemId, mentorIds) {
  const d = await request('/api/ai/mentor-fit', {
    method: 'POST',
    body: { problem_id: problemId, mentor_ids: mentorIds },
  })
  return d.notes // keyed by mentor id: deliberately not run through camelize()
}

// I8 summary of both sides' feedback and the session pattern.
// TODO(backend): POST /api/ai/mentorships/<id>/summary -> { summary, feedback_count }
export async function summariseMentorshipFromApi(id) {
  const d = await request(`/api/ai/mentorships/${id}/summary`, { method: 'POST' })
  return { summary: d.summary, feedbackCount: d.feedback_count }
}
