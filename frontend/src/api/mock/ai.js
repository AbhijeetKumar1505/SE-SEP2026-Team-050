import { PROBLEM_LIMITS } from '../../constants/student'
import { daysSince, firstName, plural, today } from '../../utils/format'

// Rule-based stand-ins for the three AI features (deleted together with api/mock in M3, when the
// Flask API calls the model). Each rule gets only what the real endpoint will send the model, listed
// per feature below: never a roll number or CGPA, and never what was discussed in a session.

const listOf = (items) => (items.length > 1 ? `${items.slice(0, -1).join(', ')} and ${items.at(-1)}` : items[0])

// ---- S2: Problem coach. Input: the problem description and IIC's active tags. ----
const TAG_KEYWORDS = [
  [/data engineer|pipeline|airflow|spark|etl/i, 'Data engineering'],
  [/\bsql\b|database|dbms/i, 'SQL and database design'],
  [/day to day|role involves|what the role|industry/i, 'Industry and role requirements'],
  [/career path|career options|which career/i, 'Choosing a career path'],
  [/intern/i, 'Finding internships'],
  [/job search|placement|apply(ing)? for jobs/i, 'Job search strategy'],
  [/interview/i, 'Technical interview preparation'],
  [/resume|\bcv\b|portfolio/i, 'Resume and portfolio'],
  [/\bdsa\b|algorithm|leetcode/i, 'Data structures and algorithms (DSA)'],
  [/python/i, 'Python programming'],
  [/machine learning|\bml\b|deep learning/i, 'Machine learning'],
  [/web dev|frontend|react|javascript/i, 'Web development'],
  [/master|\bms\b|m\.tech/i, 'Choosing a master’s programme'],
  [/abroad|\bgre\b|ielts|toefl/i, 'Applying abroad'],
  [/research|phd/i, 'Research opportunities'],
  [/startup|founder/i, 'Starting a startup'],
  [/burnout|exhausted|overwhelmed/i, 'Dealing with burnout'],
  [/motivat/i, 'Staying motivated'],
  [/time management|juggl|balanc/i, 'Time management'],
]

const COACH_CHECKS = [
  [/engineer|analyst|scientist|developer|researcher|manager|\brole\b/i, 'Name the role or field you’re aiming for.'],
  [/month|week|year|semester|term|deadline/i, 'Add a timeframe, for example “over the next 6 months”.'],
  [
    /finished|completed|tried|know|learned|learnt|done|built/i,
    'Say what you’ve already tried or learned, so your mentor can start from there.',
  ],
]

// Suggests only tags from IIC's active list, at most the form's limit.
export function coachProblem(text, activeTags) {
  const tags = TAG_KEYWORDS.filter(([pattern, tag]) => pattern.test(text) && activeTags.includes(tag))
    .map(([, tag]) => tag)
    .slice(0, PROBLEM_LIMITS.tagsMax)
  const hints = COACH_CHECKS.filter(([pattern]) => !pattern.test(text)).map(([, hint]) => hint)
  if (text.trim().length < 150) hints.push('Add a little more detail. Mentors help most with a specific problem.')
  return { tags, hints }
}

// ---- I2: mentor fit note. Input: the problem, its tags and guidance preference, and the mentor's profile. ----
// It only explains the ranking; it never reorders or picks a mentor.
const withArticle = (role) => `${/^[AEIOU]/i.test(role) ? 'an' : 'a'} ${role}`

export function fitNote(problem, mentor) {
  const first = firstName(mentor.name)
  const role = withArticle(mentor.headline.split(' · ')[0])
  const covered = mentor.expertise.filter((t) => problem.tags.includes(t))
  const missing = problem.tags.filter((t) => !mentor.expertise.includes(t))
  return [
    covered.length
      ? `${first} works as ${role} and covers ${listOf(covered)}, which this problem asks about.`
      : `${first} works as ${role} but shares no topic with this problem.`,
    missing.length ? `Not covered: ${listOf(missing)}.` : 'Covers every tag on this problem.',
    mentor.style === problem.guidance
      ? `Their style (“${mentor.style}”) matches what the student asked for.`
      : `Their style (“${mentor.style}”) differs from the student’s preference (“${problem.guidance}”).`,
  ].join(' ')
}

// ---- I8: wellbeing check, run when a student's feedback arrives. Input: the comment only. ----
// It points IIC to a comment worth reading; it never diagnoses, contacts anyone or changes the mentorship.
const WELLBEING_SIGNS = [
  [/exhaust|burn(ed|t)?[ -]?out|drained/i, 'ongoing exhaustion'],
  [/stopped enjoying|lost (all )?interest|no point|don.?t care any ?more/i, 'loss of interest'],
  [/overwhelm|can.?t cope|panic|anxious|anxiety/i, 'feeling overwhelmed'],
  [/hopeless|worthless|depress|give up on everything/i, 'low mood'],
]

// Returns { quote, why } for the first worrying sentence, or null.
export function wellbeingCheck(comment) {
  const signs = WELLBEING_SIGNS.filter(([pattern]) => pattern.test(comment))
  if (!signs.length) return null
  const sentences = comment.split(/(?<=[.!?])\s+/)
  const quote = sentences.find((s) => signs.some(([pattern]) => pattern.test(s)))
  return { quote, why: `Mentions ${listOf(signs.map(([, sign]) => sign))}.` }
}

// ---- I8: mentorship summary. Input: feedback (both sides), session dates and the mentorship's status. ----
const PROGRESS = { 'No progress': 'no progress', 'Some progress': 'some progress', 'Goal met': 'the goal as met' }
// Whole calendar days between a YYYY-MM-DD date and today (daysSince rounds by the hour).
const daysAgo = (date) => Math.round((new Date(today()) - new Date(date.slice(0, 10))) / 864e5)
const whenAgo = (date) => {
  const days = daysAgo(date)
  return days === 0 ? 'today' : days === 1 ? 'yesterday' : `${days} days ago`
}

export function summarise(m, { problemStatus, settings }) {
  const student = firstName(m.student.name)
  const mentor = firstName(m.mentor)
  const held = m.sessions.filter((s) => s.status === 'Held').toSorted((a, b) => b.date.localeCompare(a.date))
  const confirmed = held.filter((s) => s.confirmed).length
  const latest = (from) => m.feedback.find((f) => f.from === from) // feedback is newest first
  const fromStudent = latest('Student')
  const fromMentor = latest('Mentor')
  const overdue = daysSince(m.checkpointDue) - settings.feedbackOverdueDays

  const parts = [
    held.length
      ? `${plural(held.length, 'session')} held in ${plural(daysAgo(m.startedAt), 'day')}, the last ${whenAgo(held[0].date)}; ${
          confirmed === held.length ? 'all confirmed' : `${confirmed} confirmed`
        }.`
      : `No sessions logged in the ${plural(daysAgo(m.startedAt), 'day')} since the mentorship started.`,
  ]
  if (fromStudent?.progress === 'Goal met' && fromMentor?.progress === 'Goal met')
    parts.push('Both sides report the goal as met, so the mentorship looks ready to end.')
  else {
    const reports = [
      fromStudent && `${student} reports ${PROGRESS[fromStudent.progress]} (${whenAgo(fromStudent.date)})`,
      fromMentor && `${mentor} reports ${PROGRESS[fromMentor.progress]} (${whenAgo(fromMentor.date)})`,
    ].filter(Boolean)
    parts.push(reports.length ? `${reports.join('; ')}.` : 'No feedback yet.')
  }
  if (m.wellbeingFlag?.status === 'open') parts.push(`One of ${student}’s comments is flagged for a wellbeing check.`)
  if (overdue >= 0) parts.push(`${mentor}’s progress feedback is overdue.`)
  if (m.caseId) parts.push(`Case ${m.caseId} is open.`)
  if (problemStatus === 'Reassignment needed') parts.push('The problem is already back in the queue as Reassignment needed.')
  return parts.join(' ')
}
