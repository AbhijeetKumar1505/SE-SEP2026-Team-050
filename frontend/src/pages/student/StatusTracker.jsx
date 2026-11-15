import { Col, Row } from 'react-bootstrap'
import { TRACKER, TRACKER_DONE } from '../../constants/student'

// Four steps; the first `done` are ticked and the next one is highlighted.
export default function StatusTracker({ status, note }) {
  const done = TRACKER_DONE[status]
  return (
    <Row className="g-3 mb-4">
      {TRACKER.map((step, i) => (
        <Col sm={3} key={step.name}>
          <div className="d-flex align-items-center mb-2">
            <span className={`step-dot ${i < done ? 'done' : i === done ? 'current' : ''}`}>
              {i < done ? <i className="bi bi-check-lg" /> : i + 1}
            </span>
            {i < TRACKER.length - 1 && <hr className={`flex-grow-1 mx-2 my-0 ${i < done ? 'text-success opacity-100' : ''}`} />}
          </div>
          <div className="fw-semibold">{step.name}</div>
          <div className="small text-muted">{step.note(note)}</div>
        </Col>
      ))}
    </Row>
  )
}
