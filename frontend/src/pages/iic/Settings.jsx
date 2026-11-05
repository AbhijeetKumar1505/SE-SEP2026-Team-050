import { Tab, Tabs } from 'react-bootstrap'
import { addDomain, getSettings, removeDomain, updateSettings } from '../../api/iic'
import AuditLog from '../../components/AuditLog'
import Loading from '../../components/Loading'
import Section from '../../components/Section'
import useFetch from '../../hooks/useFetch'
import DomainList from './settings/DomainList'
import TagManager from './settings/TagManager'
import TimingForm from './settings/TimingForm'

export default function Settings() {
  const [data, reload] = useFetch(getSettings)
  if (!data) return <Loading />

  const then = (request) => request.then(reload)
  return (
    <>
      <h1 className="h3 mb-4">Settings &amp; topic tags</h1>
      <Tabs defaultActiveKey="timing" className="mb-3">
        <Tab eventKey="timing" title="Timing & capacity">
          <TimingForm values={data.values} onSave={(v) => then(updateSettings(v))} />
        </Tab>
        <Tab eventKey="domains" title="Email domains">
          <DomainList domains={data.domains} onAdd={(d) => then(addDomain(d))} onRemove={(d) => then(removeDomain(d))} />
        </Tab>
        <Tab eventKey="tags" title="Topic tags">
          <TagManager />
        </Tab>
      </Tabs>
      <Section title="Audit log">
        <AuditLog entries={data.audit} />
      </Section>
    </>
  )
}
