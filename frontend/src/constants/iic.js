export const PROBLEM_STATUSES = ['Reassignment needed', 'Submitted', 'Under review', 'Awaiting mentor']
export const MENTOR_STATUSES = ['Pending verification', 'Verified – not activated', 'Active', 'Removed']

// Bootstrap colour per status (used by StatusBadge).
export const STATUS_COLOR = {
  'Reassignment needed': 'danger',
  Submitted: 'secondary',
  'Under review': 'info',
  'Awaiting mentor': 'primary',
  'Pending verification': 'warning',
  'Verified – not activated': 'info',
  Active: 'success',
  Removed: 'dark',
  'Signed up': 'success',
  'Not signed up': 'secondary',
}

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
  { value: 'remove', label: 'Remove mentor', hint: 'Ended by IIC, capacity freed. Only for misconduct: ends all of this mentor’s mentorships.' },
]

export const TIMING_FIELDS = [
  { name: 'acceptHours', label: 'Mentor must accept or decline within', unit: 'hours' },
  { name: 'reminderHours', label: 'Remind the mentor after', unit: 'hours' },
  { name: 'firstSessionDays', label: 'Flag a missing first session after', unit: 'days' },
  { name: 'inactiveDays', label: 'Flag as inactive after no held session for', unit: 'days' },
  { name: 'reassignDays', label: 'Reassign if still inactive after a further', unit: 'days' },
  { name: 'feedbackDays', label: 'Progress feedback every', unit: 'days' },
  { name: 'feedbackOverdueDays', label: 'Flag feedback overdue after', unit: 'days' },
  { name: 'defaultCapacity', label: 'Default mentor capacity', unit: 'students' },
]
