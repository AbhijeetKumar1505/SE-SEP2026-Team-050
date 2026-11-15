import { Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { getMyMentorship } from '../../api/student'
import Loading from '../../components/Loading'
import Section from '../../components/Section'
import useFetch from '../../hooks/useFetch'
import MentorAssigned from './MentorAssigned'
import StudentWorkspace from './StudentWorkspace'

// Before the first message: the mentor's details and a draft. After it: the workspace.
export default function StudentMentorship() {
  const [data, reload] = useFetch(getMyMentorship)
  if (!data) return <Loading />

  const { mentorship: m } = data
  if (!m) {
    return (
      <>
        <h1 className="h3 mb-4">Mentorship</h1>
        <Section title="No mentor yet">
          <p className="text-muted">Once IIC assigns a mentor and they accept, you’ll find them here.</p>
          <Button as={Link} to="/student" variant="outline-primary">
            View my problem
          </Button>
        </Section>
      </>
    )
  }
  return m.reachedOutAt ? <StudentWorkspace m={m} reload={reload} /> : <MentorAssigned m={m} reload={reload} />
}
