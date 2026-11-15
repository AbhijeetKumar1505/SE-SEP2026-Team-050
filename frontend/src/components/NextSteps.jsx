import { Button, Form, InputGroup, ListGroup } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { required } from '../utils/rules'

// Checklist of agreed next steps. Omit onAdd for a read-only list; onDelete removes unchecked steps.
export default function NextSteps({ steps, onToggle, onAdd, onDelete }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()
  const add = ({ text }) => {
    onAdd(text.trim())
    reset()
  }
  return (
    <>
      {!steps.length && <p className="text-muted">No next steps yet.</p>}
      <ListGroup variant="flush">
        {steps.map((s) => (
          <ListGroup.Item key={s.id} className="px-0 d-flex justify-content-between align-items-center">
            <Form.Check
              id={s.id}
              checked={s.done}
              onChange={() => onToggle(s.id)}
              label={s.text}
              className={s.done ? 'text-muted text-decoration-line-through' : ''}
            />
            {onDelete && !s.done && (
              <Button variant="link" size="sm" className="text-danger p-0" aria-label={`Delete “${s.text}”`} onClick={() => onDelete(s.id)}>
                <i className="bi bi-trash" />
              </Button>
            )}
          </ListGroup.Item>
        ))}
      </ListGroup>
      {onAdd && (
        <Form onSubmit={handleSubmit(add)} noValidate>
          <InputGroup className="mt-2" hasValidation>
            <Form.Control
              placeholder="Add a next step"
              aria-label="New next step"
              isInvalid={!!errors.text}
              {...register('text', required('Write a next step.', 200))}
            />
            <Button type="submit" variant="outline-primary">
              Add
            </Button>
            <Form.Control.Feedback type="invalid">{errors.text?.message}</Form.Control.Feedback>
          </InputGroup>
        </Form>
      )}
    </>
  )
}
