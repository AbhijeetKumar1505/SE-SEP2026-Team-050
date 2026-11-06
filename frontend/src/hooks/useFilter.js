import { useState } from 'react'

// Chip + search filtering for table pages.
// chips = { key: { label, test? } } ('all' has no test); fields(row) = strings to search.
export default function useFilter(rows, chips, fields) {
  const [chip, setChip] = useState('all')
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const test = chips[chip].test ?? (() => true)
  return {
    chip,
    setChip,
    query,
    setQuery,
    counts: Object.fromEntries(Object.entries(chips).map(([k, c]) => [k, c.test ? rows.filter(c.test).length : rows.length])),
    filtered: rows.filter((r) => test(r) && fields(r).join(' ').toLowerCase().includes(q)),
  }
}

// Builds chips from a list of values: 'All' plus one chip per value.
export const chipsBy = (allLabel, values, get) => ({
  all: { label: allLabel },
  ...Object.fromEntries(values.map((v) => [v, { label: v, test: (r) => get(r) === v }])),
})
