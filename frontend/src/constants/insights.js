export const RANGES = [
  { value: '3m', label: 'Last 3 months' },
  { value: '6m', label: 'Last 6 months' },
  { value: '12m', label: 'Last 12 months' },
]

// The app's blue and orange (theme.css). A blue and orange pair stays distinguishable for colour-blind readers.
export const SERIES = {
  problems: { label: 'Problems submitted', color: '#245a9a' },
  mentors: { label: 'Mentors available', color: '#bd6500' },
}

export const OUTCOMES = [
  { key: 'goalMet', label: 'Goal met', tone: 'success' },
  { key: 'someProgress', label: 'Some progress', tone: 'primary' },
  { key: 'noProgress', label: 'No progress', tone: 'secondary' },
]
