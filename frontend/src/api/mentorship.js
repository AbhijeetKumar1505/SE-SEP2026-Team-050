// Session actions shared by the student and mentor workspaces. Each call goes through the
// shared request() wrapper in client.js. Backend stays snake_case; this layer maps request
// bodies to backend fields and responses to the camelCase display labels the pages render.
import { request } from './client'
import { SESSION_STATUS } from './student'

const sessionStatusValue = (label) => {
  for (const [key, value] of Object.entries(SESSION_STATUS)) {
    if (value === label) return key
  }
  return label
}

const sessionBody = (entry) => {
  const { status, ...rest } = entry
  return { status: sessionStatusValue(status), ...rest }
}

// ---- Next steps ----

export async function addStep(id, text) {
  return request(`/api/mentorships/${id}/steps`, { method: 'POST', body: { text } })
}

export async function toggleStep(id, stepId) {
  return request(`/api/mentorships/${id}/steps/${stepId}/toggle`, { method: 'POST' })
}

export async function deleteStep(id, stepId) {
  return request(`/api/mentorships/${id}/steps/${stepId}`, { method: 'DELETE' })
}

// ---- Sessions ----

export async function addSession(id, entry, role) {
  void role // the server records the actor from the JWT
  return request('/api/sessions', {
    method: 'POST',
    body: { mentorship_id: id, ...sessionBody(entry) },
  })
}

export async function updateSession(id, sessionId, values, role) {
  void role // the server records the actor from the JWT
  return request(`/api/sessions/${sessionId}`, {
    method: 'PUT',
    body: sessionBody(values),
  })
}

export async function confirmSession(id, sessionId) {
  return request(`/api/sessions/${sessionId}/confirm`, { method: 'POST' })
}

export async function cancelSession(id, sessionId) {
  return request(`/api/sessions/${sessionId}/cancel`, { method: 'POST' })
}
