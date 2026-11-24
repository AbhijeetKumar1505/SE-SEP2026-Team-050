// The in-memory mock of the ai.js functions whose endpoints are not built yet (Sprint 2, issue #8).
// Copied from the mock-only version of src/api/ai.js; ../ai.js re-exports the functions it still needs.
import { summarise, coachProblem, fitNote } from './ai'
import { db } from './db'
import { delay, found } from './mockUtils'
import { tags } from './tagData'

// The three AI features. Mock implementation: rule-based stand-ins in mock/ai.js, with a longer delay
// like a model call. In M3 each function becomes a fetch() to the Flask API with the same signature and
// return shape. AI output only advises: the user decides what to do with it.
const AI_DELAY = 900

// S2 Problem coach: suggested tags (from IIC's active list) and hints. Only the description is sent.
export const checkProblem = (text) =>
  delay(
    coachProblem(
      text,
      tags.filter((t) => t.active).map((t) => t.name),
    ),
    AI_DELAY,
  )

// I2 mentor fit notes, as { [mentorId]: note }. They explain the ranking; they never change it.
export function explainFit(problemId, mentorIds) {
  const p = db.problems.find((x) => x.id === problemId)
  if (!p) return found(null, 'Problem')
  const notes = Object.fromEntries(
    mentorIds.map((id) => [
      id,
      fitNote(
        p,
        db.mentors.find((m) => m.id === id),
      ),
    ]),
  )
  return delay(notes, AI_DELAY)
}

// I8 summary of both sides' feedback and the session pattern.
export function summariseMentorship(id) {
  const m = db.mentorships.find((x) => x.id === id)
  if (!m) return found(null, 'Mentorship')
  const problemStatus = db.problems.find((p) => p.id === m.problemId)?.status
  return delay({ summary: summarise(m, { problemStatus, settings: db.settings }), feedbackCount: m.feedback.length }, AI_DELAY)
}
