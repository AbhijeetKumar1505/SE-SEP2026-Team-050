import { useState } from 'react'
import { Tab, Tabs } from 'react-bootstrap'
import AuditLog from '../../components/AuditLog'
import Section from '../../components/Section'
import { useAuth } from '../../context/useAuth'
import { hoursAgo } from '../../utils/format'
import DomainList from './settings/DomainList'
import TagManager from './settings/TagManager'
import TimingForm from './settings/TimingForm'

// Sample data for this page. Each page keeps its own data until the Flask API is connected.
const TIMING = {
  acceptHours: 72,
  reminderHours: 48,
  firstSessionDays: 10,
  inactiveDays: 14,
  reassignDays: 7,
  feedbackDays: 14,
  feedbackOverdueDays: 7,
  defaultCapacity: 1,
}
const DOMAINS = ['ds.study.iitm.ac.in', 'es.study.iitm.ac.in']
const AUDIT = [
  { at: hoursAgo(50), text: 'Deepa Krishnan imported roster_nov_2026.csv' },
  { at: hoursAgo(120), text: 'Deepa Krishnan verified Rahul Menon' },
]

export default function Settings() {
  const { user } = useAuth()
  const [timing, setTiming] = useState(TIMING)
  const [domains, setDomains] = useState(DOMAINS)
  const [audit, setAudit] = useState(AUDIT)
  const log = (text) => setAudit((list) => [{ at: new Date().toISOString(), text: `${user.name} ${text}` }, ...list])

  function saveTiming(values) {
    setTiming(values)
    log('updated timing windows and capacity')
  }

  function addDomain(domain) {
    if (!domains.includes(domain)) setDomains([...domains, domain])
    log(`approved the domain ${domain}`)
  }

  function removeDomain(domain) {
    setDomains(domains.filter((d) => d !== domain))
    log(`removed the domain ${domain}`)
  }

  return (
    <>
      <h1 className="h3 mb-4">Settings &amp; topic tags</h1>
      <Tabs defaultActiveKey="timing" className="mb-3">
        <Tab eventKey="timing" title="Timing & capacity">
          <TimingForm values={timing} onSave={saveTiming} />
        </Tab>
        <Tab eventKey="domains" title="Email domains">
          <DomainList domains={domains} onAdd={addDomain} onRemove={removeDomain} />
        </Tab>
        <Tab eventKey="tags" title="Topic tags">
          <TagManager />
        </Tab>
      </Tabs>
      <Section title="Audit log">
        <AuditLog entries={audit} />
      </Section>
    </>
  )
}
