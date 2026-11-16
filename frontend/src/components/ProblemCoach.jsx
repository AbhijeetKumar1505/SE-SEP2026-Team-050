import { useState } from 'react'
import { Alert, Button } from 'react-bootstrap'
import { checkProblem } from '../api/ai'
import { PROBLEM_LIMITS as L } from '../constants/student'
import Pill from './Pill'

// S2 Problem coach (AI): suggests topic tags and points out what would make the problem clearer.
// The student decides what to keep. selected = the tags already chosen; onAdd(names) adds tags.
export default function ProblemCoach({ text, selected, onAdd }) {
  const [state, setState] = useState('idle') // 'idle' | 'checking' | 'done'
  const [result, setResult] = useState(null)
  const [checkedText, setCheckedText] = useState('')
  const [error, setError] = useState('')

  const tooShort = text.trim().length < L.descMin
  const full = selected.length >= L.tagsMax
  const notAdded = result?.tags.filter((t) => !selected.includes(t)) ?? []

  async function run() {
    setState('checking')
    setError('')
    try {
      setResult(await checkProblem(text))
      setCheckedText(text)
      setState('done')
    } catch (e) {
      setError(e.message)
      setState(result ? 'done' : 'idle')
    }
  }

  return (
    <div className="border border-primary-subtle bg-primary-subtle bg-opacity-25 rounded p-3 mb-3">
      <div className="d-flex flex-wrap align-items-start gap-3">
        <Pill tone="primary">
          <i className="bi bi-stars me-1" />
          AI
        </Pill>
        <div className="flex-grow-1">
          <strong>Problem coach</strong>
          <p className="small text-muted mb-0">
            Suggests topic tags and points out what would make your problem clearer. You decide what to keep.
          </p>
        </div>
        <Button size="sm" variant="outline-primary" disabled={tooShort || state === 'checking'} onClick={run}>
          {state === 'checking' ? 'Checking…' : state === 'done' ? 'Check again' : 'Check my problem'}
        </Button>
      </div>

      {tooShort && state === 'idle' && <p className="small text-muted mt-2 mb-0">Write at least {L.descMin} characters first.</p>}
      {error && (
        <Alert variant="danger" className="small mt-2 mb-0">
          {error}
        </Alert>
      )}

      {state === 'done' && result && (
        <div className="mt-3">
          {checkedText !== text && (
            <p className="small text-warning-emphasis">You changed your description. Check again for fresh suggestions.</p>
          )}
          <div className="small fw-semibold mb-1">Suggested tags</div>
          {result.tags.length ? (
            <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
              {result.tags.map((tag) => {
                const added = selected.includes(tag)
                return (
                  <Button
                    key={tag}
                    size="sm"
                    variant={added ? 'primary' : 'outline-primary'}
                    disabled={added || full}
                    onClick={() => onAdd([tag])}
                  >
                    <i className={`bi ${added ? 'bi-check' : 'bi-plus'} me-1`} />
                    {tag}
                  </Button>
                )
              })}
              {notAdded.length > 1 && (
                <Button size="sm" variant="link" disabled={full} onClick={() => onAdd(notAdded)}>
                  Add all suggestions
                </Button>
              )}
            </div>
          ) : (
            <p className="small text-muted">No tag stood out. Choose them from the list below.</p>
          )}
          <div className="small fw-semibold mb-1">To make it more specific</div>
          {result.hints.length ? (
            <ul className="small mb-0">
              {result.hints.map((hint) => (
                <li key={hint}>{hint}</li>
              ))}
            </ul>
          ) : (
            <p className="small text-muted mb-0">It already says what you’re aiming for, by when, and what you’ve tried.</p>
          )}
        </div>
      )}

      <p className="small text-muted mt-3 mb-0">
        Only your description is sent to the AI, never your name, roll number or CGPA. Suggestions can be wrong.
      </p>
    </div>
  )
}
