import { camelize } from './casing'
import { request } from './client'

// Sprint 2 (issue #8): the leadership insights have no backend endpoints yet, so they keep the in-memory mock.
// The API versions further down are ready, named ...FromApi: once an endpoint is built, export that
// version under the page-facing name instead of the mock one.
export { getInsights } from './mock/insightsMock'

// Aggregates only: no names or contact details ever reach this page.
// The server computes everything, including the previous-period comparison and the
// "demand outstrips supply" threshold (ratio_threshold).
// TODO(backend): GET /api/insights?range=<range>
export async function getInsightsFromApi(range) {
  const d = camelize(await request(`/api/insights?range=${encodeURIComponent(range)}`))
  return {
    ...d, // problemsSubmitted, changePct, medianDaysToAssignment, activeMentorships, asOf,
    //       stillUnassigned, outcomes { ended, goalMet, someProgress, noProgress }, ratioThreshold
    topics: d.topics.map((t) => ({ ...t, id: t.id ?? t.topic })), // { id, topic, problems, mentors, unassigned }
  }
}
