import { Badge } from 'react-bootstrap'

// Outlined topic chips.
export default function Tags({ tags }) {
  return (
    <div className="d-flex flex-wrap gap-1">
      {tags.map((t) => (
        <Badge key={t} bg="white" text="body-secondary" className="border fw-normal">
          {t}
        </Badge>
      ))}
    </div>
  )
}
