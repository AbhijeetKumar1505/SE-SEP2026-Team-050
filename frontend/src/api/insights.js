import { BASE_TOPICS, SCALE } from './mock/insightsData'
import { day, delay } from './mock/mockUtils'

// Aggregates only: no names or contact details ever reach this page.
export function getInsights(range) {
  const k = SCALE[range]
  const topics = BASE_TOPICS.map(([topic, problems, mentors, unassigned]) => ({
    id: topic,
    topic,
    problems: Math.round(problems * k),
    mentors,
    unassigned,
  }))
  const ended = Math.round(40 * k)
  const goalMet = Math.round(21 * k)
  const someProgress = Math.round(14 * k)
  return delay({
    problemsSubmitted: Math.round(142 * k),
    changePct: -18, // vs the previous period of the same length
    medianDaysToAssignment: 2.4,
    activeMentorships: 38,
    asOf: day(0),
    stillUnassigned: 9,
    topics,
    outcomes: { ended, goalMet, someProgress, noProgress: ended - goalMet - someProgress },
    ratioThreshold: 3, // "demand outstrips supply" at this many problems per available mentor
  })
}
