import { useId } from 'react'
import { Form } from 'react-bootstrap'

// Labelled input / textarea / select with an inline error. A select takes `options` and an optional `empty` placeholder.
// Spread React Hook Form's register() onto it: <Field label="x" {...register('x')} />
export default function Field({ label, error, options, empty, className = '', ...props }) {
  const id = useId() // links the label to the input
  return (
    <Form.Group controlId={id} className={`mb-3 ${className}`}>
      <Form.Label>{label}</Form.Label>
      {options ? (
        <Form.Select isInvalid={!!error} {...props}>
          {empty && <option value="">{empty}</option>}
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </Form.Select>
      ) : (
        <Form.Control isInvalid={!!error} {...props} />
      )}
      <Form.Control.Feedback type="invalid">{error?.message}</Form.Control.Feedback>
    </Form.Group>
  )
}
