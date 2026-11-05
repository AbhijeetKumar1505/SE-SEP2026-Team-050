import { useId } from 'react'
import { Form } from 'react-bootstrap'

// Labelled input / textarea / select (pass `options`) with an inline error.
// Spread React Hook Form's register() onto it: <Field label="x" {...register('x')} />
export default function Field({ label, error, options, ...props }) {
  const Control = options ? Form.Select : Form.Control
  const id = useId() // links the label to the input
  return (
    <Form.Group controlId={id} className="mb-3">
      <Form.Label>{label}</Form.Label>
      <Control isInvalid={!!error} {...props}>
        {options?.map((o) => <option key={o}>{o}</option>)}
      </Control>
      <Form.Control.Feedback type="invalid">{error?.message}</Form.Control.Feedback>
    </Form.Group>
  )
}
