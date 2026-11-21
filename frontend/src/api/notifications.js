import { request } from './client'

// The backend stores one notice per event, for the logged-in user: { id, subject, body, link, read }.
// The bell shows the unread ones and opens the page in `link`. The role is not needed: the API
// reads the user from the token.
export async function getNotifications() {
  const notices = await request('/api/notifications?unread=true&page_size=100')
  return notices.map(({ id, subject, link }) => ({ id, text: subject, to: link || '/' }))
}

export const markNotificationRead = (id) => request(`/api/notifications/${id}/read`, { method: 'POST' })
