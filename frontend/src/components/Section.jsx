import { Card } from 'react-bootstrap'

// Titled card with an optional action button on the right.
export default function Section({ title, action, children }) {
  return (
    <Card className="mb-3">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <Card.Title as="h2" className="h6 mb-0">
            {title}
          </Card.Title>
          {action}
        </div>
        {children}
      </Card.Body>
    </Card>
  )
}
