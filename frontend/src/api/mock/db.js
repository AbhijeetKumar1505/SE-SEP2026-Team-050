import { wellbeingCheck } from './ai'
import { ago, day, uid } from './mockUtils'

// One shared in-memory store, so what IIC does shows up for mentors and vice versa.
// Dates are relative to today, so the demo always looks current.
export const ACTOR = 'Deepa Krishnan' // the logged-in IIC coordinator
const DOMAIN = 'ds.study.iitm.ac.in'

const person = (name, roll, extra) => ({
  name,
  roll,
  email: `${roll}@${DOMAIN}`,
  level: 'BS',
  careerInterest: 'Job',
  courses: 'Programming in Python, DBMS, MAD I, PDSA, MLF',
  ...extra,
})

const problem = (id, name, roll, daysAgo, status, tags, extra) => ({
  id,
  student: { ...person(name, roll), cgpa: 8.1 }, // CGPA is for IIC only
  submittedAt: day(-daysAgo),
  status,
  tags,
  problem: 'I want to move into data engineering but I’m not sure what the role involves day to day or which tools to learn first.',
  goal: 'A 6-month learning plan and one portfolio project.',
  guidance: 'Direction first, then detailed steps',
  ...extra,
})

const mentor = (id, name, status, extra) => ({
  id,
  name,
  status,
  email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
  contact: `${name.toLowerCase().replace(' ', '.')}@example.com`,
  headline: 'Data Engineer · BS Data Science ’24',
  available: status === 'Active',
  capacity: 1,
  expertise: [],
  channel: 'Google Meet',
  timezone: 'IST (UTC+05:30)',
  availability: 'Weekday evenings',
  style: 'Direction first, then detailed steps',
  experience: ['Data Engineer · 2 years'],
  ...extra,
})

const held = (n, confirmed, lastAgo) =>
  Array.from({ length: n }, (_, i) => ({
    id: uid(),
    date: day(-lastAgo - 7 * i),
    channel: 'Google Meet',
    duration: 40,
    topic: 'Check-in',
    status: 'Held',
    confirmed: i < confirmed,
    loggedBy: i % 2 ? 'student' : 'mentor',
  }))

const mentorship = (id, name, roll, mentorName, startedAgo, sessions, checkpointIn, extra) => ({
  id,
  problemId: null,
  student: person(name, roll),
  mentor: mentorName,
  startedAt: day(-startedAgo),
  problem: 'Choosing a career path and planning my job search.',
  goal: 'Shortlist two target roles and apply to five companies.',
  checkpointDue: day(checkpointIn),
  studentCheckpointDue: day(checkpointIn),
  reachedOutAt: day(-startedAgo),
  steps: [],
  sessions,
  progress: null,
  caseId: null,
  feedback: [], // progress feedback from both sides, newest first (I8)
  wellbeingFlag: null, // set by the AI wellbeing check when a student's comment may need attention (I8)
  history: [],
  ...extra,
})

// Progress feedback, newest first, from [id, daysAgo, 'Student' | 'Mentor', progress, comment].
// Also sets each side's latest progress, which the mentor and student pages read.
const withFeedback = (...entries) => {
  const feedback = entries.map(([id, daysAgo, from, progress, comment]) => ({ id, date: day(-daysAgo), from, progress, comment }))
  const latest = (from) => feedback.find((f) => f.from === from)
  return {
    feedback,
    progress: latest('Mentor')?.progress ?? null,
    progressComment: latest('Mentor')?.comment,
    studentProgress: latest('Student')?.progress,
    studentComment: latest('Student')?.comment,
  }
}

// A wellbeing flag the AI raised when the comment arrived, not yet looked at by IIC.
const flagged = (m, feedbackId, hoursAgo) => {
  const at = ago(hoursAgo)
  const { comment } = m.feedback.find((f) => f.id === feedbackId)
  return {
    ...m,
    wellbeingFlag: { feedbackId, ...wellbeingCheck(comment), status: 'open', at },
    history: [{ at, text: 'AI flagged a feedback comment for a wellbeing check' }],
  }
}

const student = (name, roll, signedUp, profile) => ({
  id: roll,
  name,
  roll,
  email: `${roll}@${DOMAIN}`,
  signedUp,
  verified: signedUp,
  profile,
})
const profile = () => ({ level: 'BS', cgpa: 8.1, careerInterest: 'Job', courses: 'Programming in Python, DBMS, MAD I, PDSA, MLF' })

export const db = {
  settings: {
    acceptHours: 72,
    reminderHours: 48,
    firstSessionDays: 10,
    inactiveDays: 14,
    reassignDays: 7,
    feedbackDays: 14,
    feedbackOverdueDays: 7,
    defaultCapacity: 1,
    domains: [DOMAIN, 'es.study.iitm.ac.in'],
  },
  audit: [
    { at: ago(50), text: `${ACTOR} imported roster_nov_2026.csv` },
    { at: ago(120), text: `${ACTOR} verified Rahul Menon` },
  ],
  dailyChecks: { lastRun: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(), reminders: 3 },

  problems: [
    problem('p1', 'Karan Mehta', '22f3001876', 9, 'Reassignment needed', ['SQL and database design', 'Data engineering'], {
      reassignReason: 'the assigned mentor didn’t respond within 72 h.',
    }),
    problem('p2', 'Sneha Pillai', '23f2000451', 7, 'Reassignment needed', ['Machine learning', 'Python programming'], {
      reassignReason: 'the mentorship has been inactive for 14 days.',
    }),
    problem('p3', 'Ananya Rao', '23f1002345', 3, 'Submitted', [
      'Data engineering',
      'SQL and database design',
      'Industry and role requirements',
    ]),
    problem('p4', 'Rohit Verma', '23f1004420', 2, 'Submitted', ['Job search strategy', 'Resume and portfolio']),
    problem('p5', 'Fatima Khan', '22f1000932', 2, 'Under review', ['Technical interview preparation', 'Finding internships']),
    problem('p6', 'Vikram Das', '23f3002201', 1, 'Submitted', ['Machine learning', 'Choosing a master’s programme']),
    problem('p7', 'Neha Joshi', '21f1005567', 1, 'Awaiting mentor', ['Choosing a career path', 'Job search strategy'], {
      mentor: 'Rahul Menon',
      assignedBy: ACTOR,
      assignedAt: ago(30),
    }),
  ],

  mentors: [
    mentor('m01', 'Rahul Menon', 'Active', {
      capacity: 3,
      expertise: ['Data engineering', 'SQL and database design', 'Python programming', 'Job search strategy'],
      experience: ['Data Engineer · 2 years', 'Analytics intern · 6 months', 'Real-time pipeline with Kafka · 3 months'],
    }),
    mentor('m02', 'Priya Natarajan', 'Active', {
      capacity: 2,
      headline: 'Analytics Engineer · BS Data Science ’23',
      timezone: 'UTC-4',
      availability: 'Weekends',
      style: 'Detailed step-by-step, written',
      expertise: ['Data engineering', 'Machine learning', 'Technical interview preparation'],
    }),
    mentor('m03', 'Arjun Shah', 'Active', {
      capacity: 2,
      available: false,
      headline: 'Data Platform Lead · BS Data Science ’22',
      expertise: ['Data engineering', 'Python programming'],
    }),
    mentor('m04', 'Meera Iyer', 'Active', {
      capacity: 3,
      headline: 'Backend Developer · BS Data Science ’24',
      availability: 'Flexible',
      expertise: ['Job search strategy', 'Resume and portfolio', 'Finding internships', 'SQL and database design'],
    }),
    mentor('m05', 'Manoj Pillai', 'Active', { expertise: ['Machine learning'] }),
    mentor('m06', 'Imran Qureshi', 'Verified – not activated', { expertise: ['Web development'] }),
    mentor('m07', 'Lakshmi Rao', 'Pending verification', {
      headline: 'Graduated · BS Data Science ’22',
      channel: 'Email',
      timezone: 'UTC+01:00',
      experience: ['Research, PhD student at TU Munich · 2 years'],
    }),
    mentor('m08', 'Sameer Kulkarni', 'Pending verification'),
    mentor('m09', 'Nisha George', 'Pending verification'),
    mentor('m10', 'Vivek Anand', 'Removed'),
  ],

  mentorships: [
    mentorship('r1', 'Karan Mehta', '22f3001876', 'Meera Iyer', 20, [], 4, { problemId: 'p1' }),
    flagged(
      mentorship('r2', 'Sneha Pillai', '23f2000451', 'Arjun Shah', 34, held(1, 1, 20), 3, {
        problemId: 'p2',
        ...withFeedback(
          ['f3', 4, 'Mentor', 'Some progress', 'Sneha hasn’t replied to my last two messages.'],
          [
            'f2',
            6,
            'Student',
            'No progress',
            'I’ve fallen behind because exams and my internship hours piled up. Honestly I’m exhausted all the time and I’ve stopped enjoying any of this.',
          ],
          ['f1', 16, 'Mentor', 'Some progress', 'First call went well. We agreed on a Python refresher before starting ML.'],
        ),
      }),
      'f2',
      140,
    ),
    mentorship('r3', 'Fatima Khan', '22f1000932', 'Priya Natarajan', 26, held(3, 2, 10), -9, {
      caseId: 'C-014',
      ...withFeedback(
        ['f2', 12, 'Student', 'Some progress', 'Useful advice, but our call times keep clashing and we have rescheduled twice.'],
        ['f1', 19, 'Mentor', 'Some progress', 'Good start on the portfolio plan. I travel a lot next month, so calls may move.'],
      ),
    }),
    mentorship('r4', 'Vikram Das', '23f3002201', 'Manoj Pillai', 11, [], 3),
    mentorship(
      'r6',
      'Karthik Subramanian',
      '22f3001234',
      'Rahul Menon',
      25,
      [
        {
          id: 's1',
          date: day(-20),
          channel: 'Google Meet',
          duration: 40,
          topic: 'Getting started',
          status: 'Held',
          confirmed: true,
          loggedBy: 'mentor',
        },
        {
          id: 's2',
          date: day(-10),
          channel: 'Google Meet',
          duration: 40,
          topic: 'Learning plan and skills',
          status: 'Held',
          confirmed: false,
          loggedBy: 'student',
        },
        { id: 's3', date: day(7), time: '20:00', channel: 'Google Meet', status: 'Planned', loggedBy: 'mentor' },
      ],
      3,
      {
        ...withFeedback(['f1', 9, 'Mentor', 'Some progress', 'Karthik finished the SQL practice set and is setting up Airflow.']),
        steps: [
          { id: 't1', text: 'Finish the SQL window-functions practice set', done: true },
          { id: 't2', text: 'Install Airflow locally and run the tutorial DAG', done: false },
        ],
      },
    ),
    mentorship(
      'r7',
      'Rohan Gupta',
      '21f2000078',
      'Meera Iyer',
      35,
      held(5, 5, 1),
      5,
      withFeedback(
        ['f2', 2, 'Student', 'Goal met', 'I got the internship offer I was preparing for. Thank you!'],
        ['f1', 3, 'Mentor', 'Goal met', 'Rohan cleared both interview rounds.'],
      ),
    ),
  ],

  students: [
    student('Ananya Rao', '23f1002345', true, profile()),
    student('Karan Mehta', '22f3001876', true, profile()),
    student('Rohit Verma', '23f1004420', true, null),
    student('Fatima Khan', '22f1000932', true, profile()),
    student('Aditya Nair', '24f1000876', false, null),
    student('Meghna Bose', '23f3004512', false, null),
  ],
  staff: [
    { id: 'i01', role: 'iic', name: 'Deepa Krishnan', email: 'deepa.krishnan@iitm.ac.in' },
    { id: 'l01', role: 'leadership', name: 'Prof. Anand Rajan', email: 'anand.rajan@iitm.ac.in' },
  ],
  expiredTokens: {}, // email-verification links that were replaced: token -> email
  lastImport: {
    file: 'roster_nov_2026.csv',
    by: ACTOR,
    at: ago(50),
    added: 310,
    updated: 0,
    errors: [
      { row: 14, reason: 'Roll number is not valid (letter O instead of 0).' },
      { row: 31, reason: 'Email is not on an approved domain.' },
    ],
  },

  capacityRequests: [{ id: 'cr1', mentorId: 'm01', by: ACTOR, at: ago(20), status: 'Pending' }],

  cases: [
    {
      id: 'C-014',
      type: 'Change request',
      status: 'Open',
      student: 'Fatima Khan',
      mentor: 'Priya Natarajan',
      openedAt: ago(30),
      request: 'Change my mentor',
      reason: 'Our call times keep clashing and Priya is travelling next month, so we can’t keep a regular schedule.',
      mentorResponse: '',
      history: [
        { at: ago(30), text: 'Case opened by Fatima Khan' },
        { at: ago(120), text: 'System flagged feedback overdue' },
        { at: ago(600), text: 'Priya Natarajan accepted the assignment' },
      ],
    },
  ],
}

// A mentor's load = active mentorships + assignments waiting for their answer.
export const loadOf = (m) =>
  db.mentorships.filter((x) => x.mentor === m.name).length +
  db.problems.filter((p) => p.status === 'Awaiting mentor' && p.mentor === m.name).length

// A mentorship ended early: its problem goes back to IIC's queue.
export function returnToQueue(m, reason) {
  db.mentorships = db.mentorships.filter((x) => x !== m)
  const p = db.problems.find((x) => x.id === m.problemId)
  if (p) {
    Object.assign(p, { status: 'Reassignment needed', reassignReason: reason })
    delete p.mentor
  }
}
