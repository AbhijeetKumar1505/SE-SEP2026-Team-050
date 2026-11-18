// Topic tags. Backend stays snake_case; the tag list shape ({ id, name, group, problems, active })
// is shared with the pages as-is.
import { request } from './client'

export const getTags = () => request('/api/settings/tags')

export async function addTag({ name, group }) {
  return request('/api/settings/tags', { method: 'POST', body: { name, group } })
}

// Tags are retired, never deleted, so past problems and insights keep their topics.
export async function setTagActive(id, active) {
  return request(`/api/settings/tags/${id}`, { method: 'PUT', body: { active } })
}
