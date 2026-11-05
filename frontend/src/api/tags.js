import { tags } from './mock/tagData'
import { delay, uid } from './mock/mockUtils'

export const getTags = () => delay(tags)

export function addTag({ name, group }) {
  if (tags.some((t) => t.name.toLowerCase() === name.toLowerCase())) return Promise.reject(new Error('That tag already exists.'))
  tags.push({ id: uid(), name, group, problems: 0, active: true })
  return delay()
}

// Tags are retired, never deleted, so past problems and insights keep their topics.
export function setTagActive(id, active) {
  tags.find((t) => t.id === id).active = active
  return delay()
}
