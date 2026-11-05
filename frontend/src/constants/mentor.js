import { EMAIL, PHONE } from '../utils/rules'

export const CHANNELS = ['Google Meet', 'Phone', 'Email', 'Other']

// Placeholder and format check for the contact details, by preferred channel.
export const CONTACT = {
  'Google Meet': { hint: 'Email for the Meet invite', pattern: EMAIL },
  Phone: { hint: 'Phone number', pattern: PHONE },
  Email: { hint: 'Email address', pattern: EMAIL },
  Other: { hint: 'How students should reach you' },
}

export const PROGRESS = ['No progress', 'Some progress', 'Goal met']
export const DECLINE_REASONS = ['Outside my expertise', 'No time right now', 'Not a good fit', 'Other']
export const END_REASONS = ['No longer available', 'Goal achieved', 'Not a good fit', 'Other']
export const URGENT_HOURS = 24 // assignment badge turns red below this

// Session dialog variants: which fields (kind) and what the dialog says.
export const SESSION_FORMS = {
  schedule: { kind: 'planned', title: 'Schedule a session', submitLabel: 'Schedule session' },
  log: { kind: 'held', title: 'Log a session', submitLabel: 'Save session' },
  markHeld: { kind: 'held', title: 'Mark as held', submitLabel: 'Mark as held' },
  editPlanned: { kind: 'planned', title: 'Edit session', submitLabel: 'Save changes' },
  editHeld: { kind: 'held', title: 'Edit session', submitLabel: 'Save changes' },
}
