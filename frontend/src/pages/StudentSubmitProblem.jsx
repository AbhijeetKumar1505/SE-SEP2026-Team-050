import { useState } from 'react'
import { TAGS } from '../constants/tags'
import { Navbar } from './StudentMyProblem'
import './StudentSubmitProblem.css'

// S2: the student describes their problem for IIC. The Problem coach (AI) suggests
// topic tags and points out what would make the problem more specific.

const MIN_LENGTH = 30
const MAX_LENGTH = 1000
const MAX_TAGS = 5

const GUIDANCE_OPTIONS = [
  'Give me direction; I’ll work out the details',
  'Short calls',
  'Detailed step-by-step guidance',
  'Written exchanges (email)'
]

const NEXT_STEPS = [
  { title: 'IIC reviews your problem', text: 'You’ll see “Under review”' },
  { title: 'IIC assigns a mentor', text: 'Picked from 3–4 recommended mentors' },
  { title: 'Your mentor accepts', text: 'They have up to 72 hours' },
  { title: 'You reach out', text: 'You get their contact details and a draft first message' }
]

const TAG_GROUPS = [...new Set(TAGS.map(tag => tag.group))]

// Stand-in for the AI until the Flask API is connected: simple keyword rules.
// The real endpoint also returns only tags from IIC's active list.
const TAG_KEYWORDS = [
  [/data engineer|pipeline|airflow|spark|etl/i, 'Data engineering'],
  [/\bsql\b|database|dbms/i, 'SQL and database design'],
  [/day to day|role involves|what the role|industry/i, 'Industry and role requirements'],
  [/career path|career options|which career/i, 'Choosing a career path'],
  [/intern/i, 'Finding internships'],
  [/job search|placement|apply(ing)? for jobs/i, 'Job search strategy'],
  [/interview/i, 'Technical interview preparation'],
  [/resume|\bcv\b|portfolio/i, 'Resume and portfolio'],
  [/\bdsa\b|algorithm|leetcode/i, 'Data structures and algorithms (DSA)'],
  [/python/i, 'Python programming'],
  [/machine learning|\bml\b|deep learning/i, 'Machine learning'],
  [/web dev|frontend|react|javascript/i, 'Web development'],
  [/master|\bms\b|m\.tech/i, 'Choosing a master’s programme'],
  [/abroad|\bgre\b|ielts|toefl/i, 'Applying abroad'],
  [/research|phd/i, 'Research opportunities'],
  [/startup|founder/i, 'Starting a startup'],
  [/burnout|exhausted|overwhelmed/i, 'Dealing with burnout'],
  [/motivat/i, 'Staying motivated'],
  [/time management|juggl|balanc/i, 'Time management']
]

const COACH_CHECKS = [
  [/engineer|analyst|scientist|developer|researcher|manager|\brole\b/i, 'Name the role or field you’re aiming for.'],
  [/month|week|year|semester|term|deadline/i, 'Add a timeframe, for example “over the next 6 months”.'],
  [/finished|completed|tried|know|learned|learnt|done|built/i, 'Say what you’ve already tried or learned, so your mentor can start from there.']
]

function checkProblem(text) {
  const tags = TAG_KEYWORDS
    .filter(([pattern]) => pattern.test(text))
    .map(([, tag]) => tag)
    .slice(0, MAX_TAGS)

  const hints = COACH_CHECKS
    .filter(([pattern]) => !pattern.test(text))
    .map(([, hint]) => hint)

  if (text.trim().length < 150) {
    hints.push('Add a little more detail. Mentors help most with a specific problem.')
  }

  return { tags, hints }
}

function StudentSubmitProblem() {
  const [description, setDescription] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [tagSearch, setTagSearch] = useState('')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [outcome, setOutcome] = useState('')
  const [guidance, setGuidance] = useState([])
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  // Problem coach: idle → checking → done
  const [coachStatus, setCoachStatus] = useState('idle')
  const [coachResult, setCoachResult] = useState(null)
  const [checkedText, setCheckedText] = useState('')

  const length = description.trim().length
  const tooShortForCoach = length < MIN_LENGTH
  const coachOutdated = coachStatus === 'done' && checkedText !== description

  const visibleTags = TAGS.filter(tag =>
    tag.name.toLowerCase().includes(tagSearch.trim().toLowerCase())
  )

  function toggleTag(name) {
    if (selectedTags.includes(name)) {
      setSelectedTags(selectedTags.filter(tag => tag !== name))
    } else if (selectedTags.length < MAX_TAGS) {
      setSelectedTags([...selectedTags, name])
    }
  }

  function addSuggestedTags(names) {
    const room = MAX_TAGS - selectedTags.length
    const newTags = names.filter(name => !selectedTags.includes(name)).slice(0, room)
    setSelectedTags([...selectedTags, ...newTags])
  }

  function toggleGuidance(option) {
    setGuidance(current =>
      current.includes(option)
        ? current.filter(item => item !== option)
        : [...current, option]
    )
  }

  // Only the description is sent to the AI: no name, roll number or CGPA.
  function runCoach() {
    if (tooShortForCoach) return
    const text = description
    setCoachStatus('checking')

    setTimeout(() => {
      setCoachResult(checkProblem(text))
      setCheckedText(text)
      setCoachStatus('done')
    }, 900)
  }

  function submitProblem() {
    const newErrors = {}

    if (length < MIN_LENGTH) {
      newErrors.description = `Write at least ${MIN_LENGTH} characters so IIC understands your problem.`
    }
    if (length > MAX_LENGTH) {
      newErrors.description = `Keep it under ${MAX_LENGTH} characters.`
    }
    if (selectedTags.length === 0) {
      newErrors.tags = 'Choose at least one topic tag.'
    }

    setErrors(newErrors)
    if (Object.keys(newErrors).length === 0) setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="dashboard-page">
        <Navbar activeTab="problem" />

        <main className="dashboard-container">
          <section className="request-card submit-done">
            <span className="main-status">Submitted</span>
            <h1>Your problem is with IIC</h1>
            <p>
              IIC will read it and assign a mentor who has dealt with this kind of
              problem. You can edit or withdraw it until a mentor is assigned.
            </p>

            <div className="tags">
              {selectedTags.map(tag => <span key={tag}>{tag}</span>)}
            </div>

            <div className="request-actions">
              <button
                className="save-button"
                onClick={() => window.dispatchEvent(new Event('open-my-problem'))}
              >
                View my request
              </button>
            </div>
          </section>
        </main>
      </div>
    )
  }

  return (
    <div className="dashboard-page">
      <Navbar activeTab="problem" />

      <main className="dashboard-container">
        <header className="dashboard-heading">
          <h1>Tell IIC what you need help with</h1>
          <p>
            Be specific: this becomes the agenda for your first meeting. IIC reads it
            and assigns a mentor who has dealt with this kind of problem.
          </p>
        </header>

        <div className="dashboard-grid">
          <section className="request-card submit-form">

            {/* Description */}
            <label className="submit-label" htmlFor="problem-description">
              Describe your problem
            </label>
            <textarea
              id="problem-description"
              className={`submit-textarea ${errors.description ? 'has-error' : ''}`}
              rows={5}
              maxLength={MAX_LENGTH}
              placeholder="For example: I want to move into data engineering but I’m not sure what the role involves day to day or which tools to learn first…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="submit-help">
              <span>In your own words · {MIN_LENGTH}–{MAX_LENGTH} characters</span>
              <span>{description.length} / {MAX_LENGTH}</span>
            </div>
            {errors.description && <p className="submit-error">{errors.description}</p>}

            {/* Problem coach (AI) */}
            <div className="coach-card">
              <div className="coach-heading">
                <span className="coach-badge">✦ AI</span>

                <div className="coach-intro">
                  <strong>Problem coach</strong>
                  <p>Suggests topic tags and points out what would make your problem clearer. You decide what to keep.</p>
                </div>

                <button
                  type="button"
                  className="coach-button"
                  disabled={tooShortForCoach || coachStatus === 'checking'}
                  onClick={runCoach}
                >
                  {coachStatus === 'checking'
                    ? 'Checking…'
                    : coachStatus === 'done'
                    ? 'Check again'
                    : 'Check my problem'}
                </button>
              </div>

              {tooShortForCoach && coachStatus === 'idle' && (
                <small className="coach-note">Write at least {MIN_LENGTH} characters first.</small>
              )}

              {coachStatus === 'done' && coachResult && (
                <div className="coach-results">
                  {coachOutdated && (
                    <p className="coach-outdated">You changed your description. Check again for fresh suggestions.</p>
                  )}

                  <h4>Suggested tags</h4>
                  {coachResult.tags.length > 0 ? (
                    <>
                      <div className="coach-tags">
                        {coachResult.tags.map(tag => {
                          const added = selectedTags.includes(tag)
                          return (
                            <button
                              type="button"
                              key={tag}
                              className={`coach-tag ${added ? 'added' : ''}`}
                              disabled={added || selectedTags.length >= MAX_TAGS}
                              onClick={() => addSuggestedTags([tag])}
                            >
                              {added ? '✓' : '+'} {tag}
                            </button>
                          )
                        })}
                      </div>
                      {coachResult.tags.some(tag => !selectedTags.includes(tag)) && (
                        <button
                          type="button"
                          className="coach-link"
                          disabled={selectedTags.length >= MAX_TAGS}
                          onClick={() => addSuggestedTags(coachResult.tags)}
                        >
                          Add all suggestions
                        </button>
                      )}
                    </>
                  ) : (
                    <p className="coach-empty">No tag stood out. Choose them from the list below.</p>
                  )}

                  <h4>To make it more specific</h4>
                  {coachResult.hints.length > 0 ? (
                    <ul className="coach-hints">
                      {coachResult.hints.map(hint => <li key={hint}>{hint}</li>)}
                    </ul>
                  ) : (
                    <p className="coach-empty">✓ It already says what you’re aiming for, by when, and what you’ve tried.</p>
                  )}
                </div>
              )}

              <small className="coach-privacy">
                Only your description is sent to the AI, never your name, roll number or CGPA. Suggestions can be wrong.
              </small>
            </div>

            {/* Topic tags */}
            <label className="submit-label" htmlFor="tag-search">Topic tags</label>
            <p className="submit-subtext">Choose 1–{MAX_TAGS} from IIC’s list. IIC uses them to find a mentor with matching expertise.</p>

            <div
              className={`tag-picker ${pickerOpen ? 'open' : ''} ${errors.tags ? 'has-error' : ''}`}
              onClick={() => setPickerOpen(true)}
            >
              {selectedTags.map(tag => (
                <span className="tag-chip" key={tag}>
                  {tag}
                  <button
                    type="button"
                    aria-label={`Remove ${tag}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleTag(tag)
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                id="tag-search"
                placeholder="Search tags…"
                value={tagSearch}
                onFocus={() => setPickerOpen(true)}
                onChange={(e) => setTagSearch(e.target.value)}
              />
            </div>

            {pickerOpen && (
              <div className="tag-list">
                {TAG_GROUPS.map(group => {
                  const tags = visibleTags.filter(tag => tag.group === group)
                  if (tags.length === 0) return null

                  return (
                    <div key={group}>
                      <div className="tag-group">{group}</div>
                      {tags.map(tag => {
                        const checked = selectedTags.includes(tag.name)
                        return (
                          <label key={tag.id} className={`tag-option ${checked ? 'checked' : ''}`}>
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={!checked && selectedTags.length >= MAX_TAGS}
                              onChange={() => toggleTag(tag.name)}
                            />
                            {tag.name}
                          </label>
                        )
                      })}
                    </div>
                  )
                })}
                {visibleTags.length === 0 && <p className="coach-empty tag-none">No tag matches “{tagSearch}”.</p>}
                <button type="button" className="coach-link tag-done" onClick={() => setPickerOpen(false)}>
                  Done
                </button>
              </div>
            )}

            <div className="submit-help">
              <span>{selectedTags.length} of {MAX_TAGS} selected · {TAGS.length} tags in {TAG_GROUPS.length} groups</span>
            </div>
            {errors.tags && <p className="submit-error">{errors.tags}</p>}

            {/* Desired outcome */}
            <label className="submit-label" htmlFor="problem-outcome">
              What would you like to achieve? (optional)
            </label>
            <input
              id="problem-outcome"
              className="submit-input"
              maxLength={300}
              placeholder="For example: a 6-month learning plan and one portfolio project idea"
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
            />

            {/* Guidance preferences (US-20) */}
            <label className="submit-label">How do you like to be guided? (optional)</label>
            <p className="submit-subtext">Shared only with IIC, to consider fit when assigning. Never shown to mentors.</p>
            <div className="guidance-grid">
              {GUIDANCE_OPTIONS.map(option => (
                <label key={option} className="guidance-option">
                  <input
                    type="checkbox"
                    checked={guidance.includes(option)}
                    onChange={() => toggleGuidance(option)}
                  />
                  {option}
                </label>
              ))}
            </div>

            <div className="submit-actions">
              <button
                type="button"
                className="neutral-button submit-cancel"
                onClick={() => window.dispatchEvent(new Event('open-dashboard'))}
              >
                Cancel
              </button>
              <button type="button" className="primary-button submit-primary" onClick={submitProblem}>
                Submit to IIC
              </button>
            </div>
          </section>

          <aside className="sidebar">
            <section className="side-card">
              <h3>◷ &nbsp; What happens next</h3>
              {NEXT_STEPS.map((step, index) => (
                <div className="next-step" key={step.title}>
                  <span className="next-step-number">{index + 1}</span>
                  <div>
                    <strong>{step.title}</strong>
                    <p>{step.text}</p>
                  </div>
                </div>
              ))}
            </section>

            <section className="side-card">
              <h3>⚿ &nbsp; Privacy</h3>
              <p className="privacy-text">
                Mentors only see your problem after IIC assigns them to you. You can edit
                or withdraw it until a mentor is assigned. One open problem at a time.
              </p>
            </section>
          </aside>
        </div>
      </main>
    </div>
  )
}

export default StudentSubmitProblem
