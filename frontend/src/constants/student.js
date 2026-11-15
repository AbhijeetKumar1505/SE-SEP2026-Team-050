export const LEVELS = ['BSc', 'BS']
export const INTERESTS = ['Job', 'Higher studies', 'Entrepreneurship', 'Other']
export const PROBLEM_LIMITS = { descMin: 30, descMax: 1000, goalMax: 300, guidanceMax: 300, tagsMax: 5 }
export const EDITABLE = ['Submitted', 'Under review', 'Awaiting mentor'] // a student can edit or withdraw until a mentor accepts
export const CASE_TYPES = ['Request a different mentor', 'End the mentorship', 'Report a concern']

// Status tracker: how many steps are done for each status, and the caption under each step.
export const TRACKER_DONE = { Submitted: 1, 'Under review': 2, 'Awaiting mentor': 3, 'Reassignment needed': 2, 'Mentor assigned': 4 }
export const TRACKER = [
  { name: 'Submitted', note: ({ date }) => date },
  { name: 'Under review', note: () => 'IIC is reading it' },
  { name: 'Awaiting mentor', note: ({ hours }) => `A mentor has up to ${hours} h to accept` },
  { name: 'Mentor assigned', note: () => 'You’ll get their contact details' },
]

export const firstMessage = ({ mentor, student, topics, channel }) =>
  `Hi ${mentor}, I’m ${student}, a BS student at IITM. IIC matched us for my question about ${topics}. Could we have a short ${channel} call this week? Thanks!`
