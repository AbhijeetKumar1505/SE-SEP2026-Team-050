import { db } from './mock/db'
import { delay, uid } from './mock/mockUtils'

// Workspace actions shared by the mentor and the student. `role` records who made the change.
// Mock implementation; in M3 each function becomes a fetch() with the same signature.

const find = (id) => db.mentorships.find((m) => m.id === id)

export function addStep(id, text) {
  find(id).steps.push({ id: uid(), text, done: false })
  return delay()
}

export function toggleStep(id, stepId) {
  const step = find(id).steps.find((s) => s.id === stepId)
  step.done = !step.done
  return delay()
}

export function deleteStep(id, stepId) {
  const m = find(id)
  m.steps = m.steps.filter((s) => s.id !== stepId)
  return delay()
}

export function addSession(id, entry, role) {
  find(id).sessions.push({ ...entry, id: uid(), loggedBy: role, confirmed: false })
  return delay()
}

export function updateSession(id, sessionId, values, role) {
  const s = find(id).sessions.find((x) => x.id === sessionId)
  const cleared = { time: undefined, link: undefined, duration: undefined, topic: undefined } // fields of the old kind
  Object.assign(s, cleared, values, { loggedBy: role, confirmed: false }) // an edit needs confirming again
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
