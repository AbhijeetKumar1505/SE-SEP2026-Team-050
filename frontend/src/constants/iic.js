export const PROBLEM_STATUSES = ['Reassignment needed', 'Submitted', 'Under review', 'Awaiting mentor']
export const LOW_CAPACITY = 2 // fewer recommended mentors than this suggests asking for more capacity
export const MENTOR_STATUSES = ['Pending verification', 'Verified – not activated', 'Active', 'Removed']

// Monitoring flags. hint() explains the rule using the live settings (I7).
export const FLAGS = {
  reassign: { label: 'Reassignment needed', hint: () => 'Also pinned in the problem queue' },
  firstSession: { label: 'First session overdue', hint: (s) => `${s.firstSessionDays}+ days since acceptance` },
  inactive: { label: 'Inactive', hint: (s) => `${s.inactiveDays}+ days without a held session` },
  feedback: { label: 'Feedback overdue', hint: (s) => `${s.feedbackOverdueDays}+ days past the checkpoint` },
}

export const DECISIONS = [
  { value: 'close', label: 'Close the case', hint: 'The mentorship continues.' },
  { value: 'reassign', label: 'Reassign', hint: 'The problem returns to the queue for a new mentor.' },
  {
    value: 'remove',
    label: 'Remove mentor',
    hint: 'Ended by IIC, capacity freed. Only for misconduct: ends all of this mentor’s mentorships.',
  },
]

export const TIMING_FIELDS = [
  { name: 'acceptHours', max: 720, label: 'Mentor must accept or decline within', unit: 'hours' },
  { name: 'reminderHours', max: 720, label: 'Remind the mentor after', unit: 'hours' },
  { name: 'firstSessionDays', max: 90, label: 'Flag a missing first session after', unit: 'days' },
  { name: 'inactiveDays', max: 90, label: 'Flag as inactive after no held session for', unit: 'days' },
  { name: 'reassignDays', max: 90, label: 'Reassign if still inactive after a further', unit: 'days' },
  { name: 'feedbackDays', max: 90, label: 'Progress feedback every', unit: 'days' },
  { name: 'feedbackOverdueDays', max: 90, label: 'Flag feedback overdue after', unit: 'days' },
  { name: 'defaultCapacity', max: 20, label: 'Default mentor capacity', unit: 'students' },
]
