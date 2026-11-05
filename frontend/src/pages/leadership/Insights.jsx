import { useState } from 'react'
import { Button, ButtonGroup, Card, Col, Form, ListGroup, ProgressBar, Row } from 'react-bootstrap'
import { Bar, BarChart, CartesianGrid, Legend, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { getInsights } from '../../api/insights'
import DataTable from '../../components/DataTable'
import Loading from '../../components/Loading'
import Pill from '../../components/Pill'
import Section from '../../components/Section'
import { OUTCOMES, RANGES, SERIES } from '../../constants/insights'
import useFetch from '../../hooks/useFetch'
import { downloadCsv } from '../../utils/download'
import { fmtDate } from '../../utils/format'

const topicColumns = [
  { header: 'Topic', cell: (t) => t.topic },
  { header: SERIES.problems.label, cell: (t) => t.problems },
  { header: SERIES.mentors.label, cell: (t) => t.mentors },
  { header: 'Unassigned', cell: (t) => t.unassigned || '—' },
]

export default function Insights() {
  const [range, setRange] = useState(RANGES[0].value)
  const [view, setView] = useState('chart')
  const [data] = useFetch(getInsights, range)
  if (!data) return <Loading />

  const { topics, outcomes, ratioThreshold } = data
  const pct = (n) => Math.round((n / outcomes.ended) * 100)
  const change = `${data.changePct < 0 ? '−' : '+'}${Math.abs(data.changePct)}% vs previous period`
  const kpis = [
    ['Problems submitted', data.problemsSubmitted, change],
    ['Median time to assignment', `${data.medianDaysToAssignment} days`, 'From submission to mentor assigned'],
    ['Active mentorships', data.activeMentorships, `On ${fmtDate(data.asOf)}`],
    ['Still unassigned', data.stillUnassigned, 'Open problems without a mentor'],
  ]
  const shortage = topics
    .map((t) => ({ ...t, ratio: t.problems / Math.max(t.mentors, 1) }))
    .filter((t) => t.ratio >= ratioThreshold)
    .sort((a, b) => b.ratio - a.ratio)
  const exportCsv = () =>
    downloadCsv('programme-insights.csv', [
      topicColumns.map((c) => c.header),
      ...topics.map((t) => [t.topic, t.problems, t.mentors, t.unassigned]),
    ])

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
        <div>
          <h1 className="h3">Programme insights</h1>
          <p className="text-muted">Aggregates only. No names or contact details.</p>
        </div>
        <div className="d-flex gap-2">
          <Form.Select aria-label="Date range" value={range} onChange={(e) => setRange(e.target.value)}>
            {RANGES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </Form.Select>
          <Button variant="outline-primary" className="text-nowrap" onClick={exportCsv}>
            <i className="bi bi-download me-1" />
            Export CSV
          </Button>
        </div>
      </div>

      <Row className="g-3 mb-4">
        {kpis.map(([label, value, note]) => (
          <Col sm={6} lg={3} key={label}>
            <Card body className="h-100">
              <div className="small text-muted">{label}</div>
              <div className="h2 mb-0">{value}</div>
              <div className="small text-muted">{note}</div>
            </Card>
          </Col>
        ))}
      </Row>

      <Section
        title="Demand vs supply by topic"
        action={
          <ButtonGroup size="sm" aria-label="View">
            {['chart', 'table'].map((v) => (
              <Button key={v} variant={view === v ? 'primary' : 'outline-secondary'} className="text-capitalize" onClick={() => setView(v)}>
                {v}
              </Button>
            ))}
          </ButtonGroup>
        }
      >
        <p className="small text-muted">Problems submitted vs mentors available</p>
        {view === 'chart' ? (
          <div role="img" aria-label="Bar chart of problems submitted and mentors available by topic">
            <ResponsiveContainer width="100%" height={topics.length * 64 + 70}>
              <BarChart data={topics} layout="vertical" margin={{ left: 10, right: 30 }}>
                <CartesianGrid horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="topic" width={200} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                {Object.entries(SERIES).map(([key, { label, color }]) => (
                  <Bar key={key} dataKey={key} name={label} fill={color}>
                    <LabelList dataKey={key} position="right" />
                  </Bar>
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <DataTable columns={topicColumns} rows={topics} />
        )}
      </Section>

      <Row className="g-3">
        <Col lg={7}>
          <Section title="Outcomes of ended mentorships">
            <p className="small text-muted">{outcomes.ended} mentorships ended in this period, by final progress status</p>
            <ProgressBar className="mb-3">
              {OUTCOMES.map(({ key, label, tone }) => (
                <ProgressBar
                  key={key}
                  className={`bg-${tone}-subtle text-${tone}-emphasis`}
                  now={pct(outcomes[key])}
                  label={`${outcomes[key]}`}
                  aria-label={label}
                />
              ))}
            </ProgressBar>
            <ListGroup variant="flush">
              {OUTCOMES.map(({ key, label, tone }) => (
                <ListGroup.Item key={key} className="px-0 d-flex justify-content-between">
                  <Pill tone={tone}>{label}</Pill>
                  <span>
                    {outcomes[key]} · {pct(outcomes[key])}%
                  </span>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Section>
        </Col>
        <Col lg={5}>
          <Section title="Where demand outstrips supply">
            <p className="small text-muted">Topics with {ratioThreshold}+ problems per available mentor.</p>
            {shortage.length === 0 && <p className="text-muted mb-0">No topic is short of mentors in this period.</p>}
            <ListGroup variant="flush">
              {shortage.map((t) => (
                <ListGroup.Item key={t.id} className="px-0 d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{t.topic}</strong>
                    <div className="small text-muted">
                      {t.problems} problems · {t.mentors} {t.mentors === 1 ? 'mentor' : 'mentors'}
                    </div>
                  </div>
                  <Pill tone="danger">{t.ratio.toFixed(1)}×</Pill>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Section>
        </Col>
      </Row>
    </>
  )
}
