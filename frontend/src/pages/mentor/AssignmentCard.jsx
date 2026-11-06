import { Button, Card } from 'react-bootstrap'
import Details from '../../components/Details'
import Pill from '../../components/Pill'
import Tags from '../../components/Tags'
import { URGENT_HOURS } from '../../constants/mentor'
import { firstName, fmtDate, hoursLeft } from '../../utils/format'

// One IIC assignment waiting for accept / decline. Never shows CGPA or guidance preferences.
export default function AssignmentCard({ assignment: a, onAccept, onDecline }) {
  const left = hoursLeft(a.deadline)
  const { student } = a
  return (
    <Card className="mb-3">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h3 className="h5 mb-0">{student.name}</h3>
            <small className="text-muted">
              Assigned by {a.assignedBy} · {fmtDate(a.assignedAt)}
            </small>
          </div>
          <Pill tone={left <= URGENT_HOURS ? 'danger' : 'secondary'}>{left} h left to respond</Pill>
        </div>
        <Details
          items={[
            ['Level', student.level],
            ['Career interest', student.careerInterest],
            ['Completed courses', student.courses],
            ['Problem', a.problem],
            ['Hopes to achieve', a.goal],
          ]}
        />
        <div className="my-3">
          <Tags tags={a.tags} />
        </div>
        <p className="small text-muted">If you accept, {firstName(student.name)} gets your contact details.</p>
        <div className="d-flex gap-2">
          <Button onClick={onAccept}>Accept</Button>
          <Button variant="outline-danger" onClick={onDecline}>
            Decline
          </Button>
        </div>
      </Card.Body>
    </Card>
  )
}
