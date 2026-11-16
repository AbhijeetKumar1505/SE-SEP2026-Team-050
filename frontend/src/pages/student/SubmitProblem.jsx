import { Alert, Button } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { getSubmitStatus, submitProblem } from '../../api/student'
import Loading from '../../components/Loading'
import ProblemForm from '../../components/ProblemForm'
import Section from '../../components/Section'
import useFetch from '../../hooks/useFetch'

// S2: one open problem at a time.
export default function SubmitProblem() {
  const navigate = useNavigate()
  const [status] = useFetch(getSubmitStatus)
  if (!status) return <Loading />

  return (
    <>
      <h1 className="h3">Share your problem</h1>
      <p className="text-muted mb-4">Tell IIC what you need help with. A mentor will be matched to your problem.</p>
      {status.hasOpenProblem ? (
        <Alert variant="info" className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <span>You already have an open problem.</span>
          <Button as={Link} to="/student" size="sm">
            View my problem
          </Button>
        </Alert>
      ) : (
        <Section title="Your problem">
          <ProblemForm
            submitLabel="Submit problem"
            onSubmit={async (values) => {
              await submitProblem(values)
              navigate('/student')
            }}
          />
        </Section>
      )}
    </>
  )
}
