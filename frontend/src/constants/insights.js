export const RANGES = [
  { value: '3m', label: 'Last 3 months' },
  { value: '6m', label: 'Last 6 months' },
  { value: '12m', label: 'Last 12 months' },
]

// Blue vs orange (Okabe-Ito), chosen so the two series stay distinguishable for colour-blind readers.
export const SERIES = {
  problems: { label: 'Problems submitted', color: '#0072B2' },
  mentors: { label: 'Mentors available', color: '#E69F00' },
}

export const OUTCOMES = [
  { key: 'goalMet', label: 'Goal met', tone: 'success' },
  { key: 'someProgress', label: 'Some progress', tone: 'primary' },
  { key: 'noProgress', label: 'No progress', tone: 'secondary' },
]
