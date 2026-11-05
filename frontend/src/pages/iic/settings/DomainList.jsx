import { Button, Form, ListGroup } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import Field from '../../../components/Field'
import Section from '../../../components/Section'

export default function DomainList({ domains, onAdd, onRemove }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const add = async ({ domain }) => {
    await onAdd(domain.trim().toLowerCase())
    reset()
  }
  return (
    <Section title="Approved email domains">
      <p className="small text-muted">Students can only sign up with an email on one of these domains.</p>
      <ListGroup className="mb-3">
        {domains.map((d) => (
          <ListGroup.Item key={d} className="d-flex justify-content-between align-items-center">
            {d}
            <Button variant="link" className="text-danger p-0" aria-label={`Remove ${d}`} onClick={() => onRemove(d)}>
              <i className="bi bi-x-lg" />
            </Button>
          </ListGroup.Item>
        ))}
      </ListGroup>
      <Form onSubmit={handleSubmit(add)} noValidate>
        <Field
          label="Add a domain"
          placeholder="e.g. ds.study.iitm.ac.in"
          error={errors.domain}
          {...register('domain', { required: 'Enter a domain.', pattern: { value: /^[a-z0-9-]+(\.[a-z0-9-]+)+$/i, message: 'Enter a valid domain, like ds.study.iitm.ac.in.' } })}
        />
        <Button type="submit" variant="outline-primary">Add domain</Button>
      </Form>
    </Section>
  )
}
