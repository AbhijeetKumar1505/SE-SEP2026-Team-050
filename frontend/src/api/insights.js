import { camelize } from './casing'
import { request } from './client'

// Aggregates only: no names or contact details ever reach this page.
// The server computes everything, including the previous-period comparison and the
// "demand outstrips supply" threshold (ratio_threshold).
// TODO(backend): GET /api/insights?range=<range>
export async function getInsights(range) {
  const d = camelize(await request(`/api/insights?range=${encodeURIComponent(range)}`))
  return {
    ...d, // problemsSubmitted, changePct, medianDaysToAssignment, activeMentorships, asOf,
    //       stillUnassigned, outcomes { ended, goalMet, someProgress, noProgress }, ratioThreshold
    topics: d.topics.map((t) => ({ ...t, id: t.id ?? t.topic })), // { id, topic, problems, mentors, unassigned }
  }
}
