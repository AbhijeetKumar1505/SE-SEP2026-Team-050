import { useState } from 'react'
import { Col, Form, Row } from 'react-bootstrap'
import { getTags } from '../api/tags'
import useFetch from '../hooks/useFetch'
import Loading from './Loading'
import Tags from './Tags'

// Searchable, grouped topic checkboxes with a limit. A controlled input: pass value / onChange.
export default function TagPicker({ value, onChange, max, error }) {
  const [tags] = useFetch(getTags)
  const [query, setQuery] = useState('')
  const errorText = error && <div className="text-danger small">{error.message}</div>
  if (!tags)
    return (
      <>
        <Loading />
        {errorText}
      </>
    )

  const q = query.trim().toLowerCase()
  const shown = tags.filter((t) => (t.active || value.includes(t.name)) && t.name.toLowerCase().includes(q))
  const groups = [...new Set(shown.map((t) => t.group))]
  const toggle = (name) => onChange(value.includes(name) ? value.filter((v) => v !== name) : [...value, name])

  return (
    <>
      {value.length > 0 && (
        <div className="mb-2">
          <Tags tags={value} />
        </div>
      )}
      <Form.Control
        type="search"
        placeholder="Search topics"
        aria-label="Search topics"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <Form.Text className="d-block mb-2">
        {value.length} of {max} selected
      </Form.Text>
      {groups.map((group) => (
        <div key={group} className="mb-3">
          <div className="small fw-semibold text-muted mb-1">{group}</div>
          <Row xs={1} md={2} className="g-1">
            {shown
              .filter((t) => t.group === group)
              .map((t) => (
                <Col key={t.id}>
                  <Form.Check
                    id={`topic-${t.id}`}
                    label={t.name}
                    checked={value.includes(t.name)}
                    disabled={!value.includes(t.name) && value.length >= max}
                    onChange={() => toggle(t.name)}
                  />
                </Col>
              ))}
          </Row>
        </div>
      ))}
      {errorText}
    </>
  )
}
