import { useState } from 'react'
import { Alert, Button, Modal } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { updateProblem, withdrawProblem } from '../../api/student'
import ConfirmModal from '../../components/ConfirmModal'
import ProblemForm from '../../components/ProblemForm'
import Section from '../../components/Section'
import StatusBadge from '../../components/StatusBadge'
import Tags from '../../components/Tags'
import { EDITABLE } from '../../constants/student'
import { fmtDate } from '../../utils/format'
import StatusTracker from './StatusTracker'

// The student's request: where it stands, what they wrote, and what they can still do with it.
export default function ProblemCard({ problem: p, acceptHours, onChange }) {
  const [modal, setModal] = useState(null) // 'edit' | 'withdraw'
  const close = () => setModal(null)
  const finished = ['Withdrawn', 'Closed by IIC'].includes(p.status)

  return (
    <Section title="Your request" action={<StatusBadge status={p.status} />}>
      <p className="small text-muted">Submitted {fmtDate(p.submittedAt)}</p>
      {!finished && <StatusTracker status={p.status} note={{ date: fmtDate(p.submittedAt), hours: acceptHours }} />}
      {p.status === 'Reassignment needed' && (
        <Alert variant="warning">
          <strong>IIC is finding you another mentor.</strong> You’ll be notified when someone accepts.
        </Alert>
      )}
      {p.status === 'Closed by IIC' && (
        <Alert variant="danger">
          <strong>Closed by IIC.</strong> {p.closeReason}
        </Alert>
      )}
      {p.status === 'Withdrawn' && <Alert variant="secondary">You withdrew this request.</Alert>}

      <div className="border-top pt-3">
        <p>{p.problem}</p>
        <div className="mb-3">
          <Tags tags={p.tags} />
        </div>
        <div className="small text-muted">What you want to achieve</div>
        <p>{p.goal}</p>
      </div>

      <div className="d-flex gap-2">
        {EDITABLE.includes(p.status) && (
          <>
            <Button variant="outline-secondary" onClick={() => setModal('edit')}>
              Edit
            </Button>
            <Button variant="outline-danger" onClick={() => setModal('withdraw')}>
              Withdraw
            </Button>
          </>
        )}
        {finished && (
          <Button as={Link} to="/student/problem/new">
            Submit a new problem
          </Button>
        )}
      </div>

      <Modal show={modal === 'edit'} onHide={close} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title as="h5">Edit your request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ProblemForm
            defaultValues={{ problem: p.problem, tags: p.tags, goal: p.goal, guidance: p.guidance ?? '' }}
            submitLabel="Save changes"
            onCancel={close}
            onSubmit={async (values) => {
              await updateProblem(p.id, values)
              close()
              onChange()
            }}
          />
        </Modal.Body>
      </Modal>
      <ConfirmModal
        show={modal === 'withdraw'}
        title="Withdraw this request?"
        submitLabel="Yes, withdraw"
        variant="danger"
        onClose={close}
        onConfirm={() => withdrawProblem(p.id).then(onChange)}
      >
        IIC will stop working on it. You can submit a new problem afterwards.
      </ConfirmModal>
    </Section>
  )
}
