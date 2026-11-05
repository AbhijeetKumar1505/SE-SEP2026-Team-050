import { Badge } from 'react-bootstrap'

// Muted label: soft background, darker text. Tones: primary, secondary, success, warning, danger.
export default function Pill({ tone = 'secondary', children }) {
  return (
    <Badge bg={`${tone}-subtle`} text={`${tone}-emphasis`} className={`border border-${tone}-subtle fw-medium`}>
      {children}
    </Badge>
  )
}
