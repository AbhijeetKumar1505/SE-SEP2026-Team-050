import { Button, Form, InputGroup, ListGroup } from 'react-bootstrap'
import { useForm } from 'react-hook-form'

// Checklist of agreed next steps. Omit onAdd for a read-only list.
export default function NextSteps({ steps, onToggle, onAdd }) {
  const { register, handleSubmit, reset } = useForm()
  const add = ({ text }) => {
    onAdd(text.trim())
    reset()
  }
  return (
    <>
      {!steps.length && <p className="text-muted">No next steps yet.</p>}
      <ListGroup variant="flush">
        {steps.map((s) => (
          <ListGroup.Item key={s.id} className="px-0">
            <Form.Check
              id={s.id}
              checked={s.done}
              onChange={() => onToggle(s.id)}
              label={s.text}
              className={s.done ? 'text-muted text-decoration-line-through' : ''}
            />
          </ListGroup.Item>
        ))}
      </ListGroup>
      {onAdd && (
        <Form onSubmit={handleSubmit(add)}>
          <InputGroup className="mt-2">
            <Form.Control placeholder="Add a next step" aria-label="New next step" {...register('text', { validate: (v) => !!v.trim() })} />
            <Button type="submit" variant="outline-primary">Add</Button>
          </InputGroup>
        </Form>
      )}
    </>
  )
}
