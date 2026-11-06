import { plural, today } from '../utils/format'
import { db } from './mock/db'
import { delay } from './mock/mockUtils'
import { session } from './mock/session'

// To-do style notifications derived from the current data. In M3 the backend returns them.
const item = (id, text, to) => ({ id, text, to })

function forMentor() {
  const me = db.mentors.find((m) => m.id === session.mentorId)
  const waiting = db.problems.filter((p) => p.status === 'Awaiting mentor' && p.mentor === me.name)
  const requests = db.capacityRequests.filter((r) => r.mentorId === me.id && r.status === 'Pending')
  const perMentorship = db.mentorships
    .filter((m) => m.mentor === me.name)
    .flatMap((m) => [
      m.sessions.some((s) => s.status === 'Held' && !s.confirmed && s.loggedBy === 'student') &&
        item(`${m.id}-confirm`, `${m.student.name} logged a session to confirm`, `/mentor/mentorships/${m.id}`),
      m.checkpointDue <= today() && item(`${m.id}-feedback`, `Progress feedback due for ${m.student.name}`, `/mentor/mentorships/${m.id}`),
    ])
  return [
    ...waiting.map((p) => item(p.id, `${p.student.name} was assigned to you`, '/mentor')),
    ...requests.map((r) => item(r.id, `${r.by} asked you to take on one more student`, '/mentor')),
    ...perMentorship,
  ].filter(Boolean)
}

function forIic() {
  const count = (status) => db.problems.filter((p) => p.status === status).length
  const toVerify = db.mentors.filter((m) => m.status === 'Pending verification').length
  return [
    count('Reassignment needed') > 0 && item('reassign', `${plural(count('Reassignment needed'), 'problem')} to reassign`, '/iic'),
    count('Submitted') > 0 && item('new', `${plural(count('Submitted'), 'new problem')} to review`, '/iic'),
    toVerify > 0 && item('verify', `${plural(toVerify, 'mentor')} to verify`, '/iic/mentors'),
    ...db.cases.filter((c) => c.status === 'Open').map((c) => item(c.id, `Case ${c.id} is open`, `/iic/cases/${c.id}`)),
  ].filter(Boolean)
}

export const getNotifications = (role) => delay({ mentor: forMentor, iic: forIic }[role]?.() ?? [])
