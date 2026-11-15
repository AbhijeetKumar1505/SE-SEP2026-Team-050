import { useState } from 'react'
import { Button, Col, Form, ListGroup, Row } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import Field from '../../../components/Field'
import Section from '../../../components/Section'
import { TAGS } from '../../../constants/tags'
import { required } from '../../../utils/rules'

// Tags are retired, never deleted, so past problems and insights keep their topics.
export default function TagManager() {
  const [tags, setTags] = useState(TAGS)
  const [query, setQuery] = useState('')
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm()

  const groups = [...new Set(tags.map((t) => t.group))]
  const shown = tags.filter((t) => t.name.toLowerCase().includes(query.trim().toLowerCase()))

  function add(values) {
    const name = values.name.trim()
    if (tags.some((t) => t.name.toLowerCase() === name.toLowerCase())) return setError('name', { message: 'That tag already exists.' })
    setTags([...tags, { id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), name, group: values.group, problems: 0, active: true }])
    reset()
  }

  const toggle = (id) => setTags(tags.map((t) => (t.id === id ? { ...t, active: !t.active } : t)))

  return (
    <>
      <Section
        title="Topic tags"
        action={
          <small className="text-muted">
            {tags.length} tags in {groups.length} groups
          </small>
        }
      >
        <Form.Control
          type="search"
          placeholder="Search tags"
          aria-label="Search tags"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {groups.map((group) => {
          const list = shown.filter((t) => t.group === group)
          return (
            list.length > 0 && (
              <div key={group} className="mt-3">
                <h3 className="h6 text-muted">{group}</h3>
                <ListGroup variant="flush">
                  {list.map((t) => (
                    <ListGroup.Item key={t.id} className="px-0 d-flex justify-content-between align-items-center">
                      <span className={t.active ? '' : 'text-muted text-decoration-line-through'}>{t.name}</span>
                      <span className="d-flex align-items-center gap-3">
                        <small className="text-muted">{t.problems} problems</small>
                        <Button size="sm" variant="outline-secondary" onClick={() => toggle(t.id)}>
                          {t.active ? 'Retire' : 'Restore'}
                        </Button>
                      </span>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
            )
          )
        })}
      </Section>
      <Section title="Add a tag">
        <Form onSubmit={handleSubmit(add)} noValidate>
          <Row>
            <Col md={7}>
              <Field label="Tag name" error={errors.name} {...register('name', required('Enter a tag name.', 60))} />
            </Col>
            <Col md={5}>
              <Field label="Group" options={groups} {...register('group')} />
            </Col>
          </Row>
          <Button type="submit" variant="outline-primary">
            Add tag
          </Button>
        </Form>
      </Section>
    </>
  )
}
