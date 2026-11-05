import { Button, Form, Offcanvas } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { getTags } from '../../api/tags'
import Details from '../../components/Details'
import useFetch from '../../hooks/useFetch'

// Side panel: check a mentor's credentials, set their expertise tags, verify.
export default function VerifyPanel({ mentor, onClose, onVerify }) {
  const [tags] = useFetch(getTags)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ defaultValues: { expertise: mentor.expertise } })
  const submit = async ({ expertise }) => {
    await onVerify(mentor.id, expertise)
    onClose()
  }
  return (
    <Offcanvas show placement="end" onHide={onClose}>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Verify {mentor.name}</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <Details
          items={[
            ['Background', mentor.headline || '—'],
            ['Preferred channel', mentor.channel ?? '—'],
            ['Time zone', mentor.timezone ?? '—'],
            ['Experience', mentor.experience.join('; ') || '—'],
          ]}
        />
        <Form onSubmit={handleSubmit(submit)} noValidate className="mt-4">
          <Form.Label>Expertise tags</Form.Label>
          <div className="border rounded p-2 mb-1 overflow-auto" style={{ maxHeight: 260 }}>
            {tags?.filter((t) => t.active).map((t) => (
              <Form.Check key={t.id} id={`tag-${t.id}`} label={t.name} value={t.name} {...register('expertise', { validate: (v) => v.length > 0 || 'Choose at least one tag.' })} />
            ))}
          </div>
          {errors.expertise && <div className="text-danger small">{errors.expertise.message}</div>}
          <p className="small text-muted mt-2">Verifying records your name and the time, then sends the activation link (valid for 7 days).</p>
          <Button type="submit" disabled={!tags || isSubmitting}>Verify and send activation link</Button>
        </Form>
      </Offcanvas.Body>
    </Offcanvas>
  )
}
