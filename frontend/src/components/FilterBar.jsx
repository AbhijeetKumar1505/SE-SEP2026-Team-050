import { Button, Form } from 'react-bootstrap'

// Filter chips with counts plus a search box. Spread the result of useFilter() onto it.
export default function FilterBar({ chips, chip, setChip, counts, query, setQuery, placeholder, hints = {} }) {
  return (
    <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
      {Object.entries(chips).map(([key, { label }]) => (
        <Button key={key} size="sm" className="rounded-pill" variant={chip === key ? 'primary' : 'outline-secondary'} title={hints[key]} onClick={() => setChip(key)}>
          {label} <span className="opacity-75">{counts[key]}</span>
        </Button>
      ))}
      <Form.Control type="search" size="sm" className="w-auto ms-auto" placeholder={placeholder} aria-label={placeholder} value={query} onChange={(e) => setQuery(e.target.value)} />
    </div>
  )
}
