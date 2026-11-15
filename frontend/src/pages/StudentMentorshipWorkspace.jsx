
import { useState } from 'react'
import './StudentMentorshipWorkspace.css'

function StudentMentorshipWorkspace() {
  const [goal, setGoal] = useState(
    'Have a 6-month data-engineering learning plan and start one portfolio pipeline project by January.'
  )

  const [editingGoal, setEditingGoal] = useState(false)
  const [goalDraft, setGoalDraft] = useState(goal)

  const [steps, setSteps] = useState([
    {
      id: 1,
      title: 'Finish the SQL window-functions practice set',
      status: 'done',
      detail: 'Done · 12 Nov · from session on 6 Nov'
    },
    {
      id: 2,
      title: 'Install Airflow locally and run the tutorial DAG',
      status: 'open',
      detail: 'Open · from session on 12 Nov'
    },
    {
      id: 3,
      title: 'Draft a project idea: load IITM course-feedback CSVs into Postgres',
      status: 'open',
      detail: 'Open · from session on 12 Nov'
    }
  ])

  const [addingStep, setAddingStep] = useState(false)
  const [newStep, setNewStep] = useState('')

  const [sessions, setSessions] = useState([
    {
      id: 1,
      date: 'Thu 20 Nov',
      time: '7:30 pm IST',
      duration: '',
      topic: 'Google Meet · meet.google.com/abc-defg-hij',
      status: 'Planned',
      confirm: false
    },
    {
      id: 2,
      date: 'Wed 12 Nov',
      time: '40 min',
      duration: '40 min',
      topic: 'Learning plan & skills · logged by Rahul',
      status: 'Held',
      confirm: true
    },
    {
      id: 3,
      date: 'Thu 6 Nov',
      time: '25 min',
      duration: '25 min',
      topic: 'Getting started · confirmed',
      status: 'Held · confirmed',
      confirm: false
    }
  ])

  const [scheduling, setScheduling] = useState(false)
  const [sessionDate, setSessionDate] = useState('')
  const [sessionTime, setSessionTime] = useState('')
  const [sessionChannel, setSessionChannel] = useState('Google Meet')

  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [feedbackProgress, setFeedbackProgress] = useState('')
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)

  const [caseOpen, setCaseOpen] = useState(false)
  const [caseType, setCaseType] = useState('Change mentor')
  const [caseReason, setCaseReason] = useState('')
  const [caseSubmitted, setCaseSubmitted] = useState(false)

  function saveGoal() {
    setGoal(goalDraft)
    setEditingGoal(false)
  }

  function toggleStep(id) {
    setSteps(current =>
      current.map(step =>
        step.id === id
          ? {
              ...step,
              status: step.status === 'done' ? 'open' : 'done',
              detail: step.status === 'done'
                ? 'Open'
                : 'Done · marked complete'
            }
          : step
      )
    )
  }

  function addStep() {
    if (!newStep.trim()) return

    setSteps(current => [
      ...current,
      {
        id: Date.now(),
        title: newStep.trim(),
        status: 'open',
        detail: 'Open · newly added'
      }
    ])

    setNewStep('')
    setAddingStep(false)
  }

  function scheduleSession() {
    if (!sessionDate || !sessionTime) return

    setSessions(current => [
      {
        id: Date.now(),
        date: sessionDate,
        time: sessionTime + ' IST',
        topic: sessionChannel,
        status: 'Planned',
        confirm: false
      },
      ...current
    ])

    setScheduling(false)
    setSessionDate('')
    setSessionTime('')
  }

  function confirmSession(id) {
    setSessions(current =>
      current.map(session =>
        session.id === id
          ? {
              ...session,
              status: 'Held · confirmed',
              confirm: false,
              topic: session.topic + ' · confirmed by you'
            }
          : session
      )
    )
  }

  function submitFeedback() {
    if (!feedback.trim()) return
    setFeedbackSubmitted(true)
    setFeedbackOpen(false)
  }

  function submitCase() {
    if (caseReason.trim().length < 30) return
    setCaseSubmitted(true)
    setCaseOpen(false)
  }

  const completedSteps = steps.filter(
    step => step.status === 'done'
  ).length

  const heldSessions = sessions.filter(
    session => session.status.startsWith('Held')
  ).length

  const confirmedSessions = sessions.filter(
    session => session.status === 'Held · confirmed'
  ).length

  return (
    <div className="workspace-page">

      {/* Navigation */}
    
<nav className="workspace-navbar">
  <div className="workspace-brand">
    <div className="workspace-logo">M</div>
    <strong>IITM BS Mentoring</strong>
  </div>

  <div className="workspace-nav-links">
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault()
        window.dispatchEvent(new Event('open-dashboard'))
      }}
    >
      Dashboard
    </a>

    <a
  href="#"
  onClick={(e) => {
    e.preventDefault()
    window.dispatchEvent(new Event('open-my-problem'))
  }}
>
  My problem
</a>

    <a className="selected" href="#" onClick={(e) => e.preventDefault()}>
      Mentorship
    </a>

    <a
  href="#"
  onClick={(e) => {
    e.preventDefault()
    window.dispatchEvent(new Event('open-profile'))
  }}
>
  Profile
</a>
  </div>

  <div className="workspace-user">
    <span className="bell-icon">♧ <b>2</b></span>
    <div className="workspace-avatar">AR</div>
    <div>
      <strong>Ananya Rao</strong>
      <small>Student · 23f1002345</small>
    </div>
  </div>
</nav>


      <main className="workspace-container">

        {/* Page Heading */}
        <header className="workspace-heading">
          <div>
            <div className="workspace-title-row">
              <h1>Mentorship with Rahul Menon</h1>
              <span className="active-badge">● Active</span>
            </div>

            <p>Active since 6 Nov 2026 · You reached out on 6 Nov</p>
          </div>

          <div className="heading-actions">
            <button
              className="neutral-button"
              onClick={() => setFeedbackOpen(true)}
            >
              Give feedback
            </button>

            <button
              className="danger-button"
              onClick={() => setCaseOpen(true)}
            >
              Request change or end
            </button>
          </div>
        </header>

        {/* Feedback Checkpoint */}
        <section className="feedback-banner">
          <div>
            <strong>◷ &nbsp; Feedback checkpoint due by 20 Nov</strong>
            <p>
              Tell IIC whether the mentorship is helping.
              Takes a minute; Rahul won't see it.
            </p>
            {feedbackSubmitted && (
              <small className="feedback-success">
                Feedback submitted successfully.
              </small>
            )}
          </div>

          <button
            className="neutral-button"
            onClick={() => setFeedbackOpen(true)}
          >
            Give feedback
          </button>
        </section>

        <div className="workspace-grid">

          {/* Left Column */}
          <div className="workspace-left">

            {/* Goal */}
            <section className="workspace-card goal-card">
              <div className="workspace-card-heading">
                <div className="section-icon">◎</div>

                <div>
                  <h2>Goal</h2>
                  <p>Set by Ananya · visible to both of you and IIC</p>
                </div>

                <button
                  className="text-button"
                  onClick={() => {
                    setGoalDraft(goal)
                    setEditingGoal(true)
                  }}
                >
                  Edit
                </button>
              </div>

              {editingGoal ? (
                <div className="workspace-form">
                  <textarea
                    value={goalDraft}
                    onChange={e => setGoalDraft(e.target.value)}
                    rows={3}
                  />

                  <div className="form-actions">
                    <button className="primary-button" onClick={saveGoal}>
                      Save goal
                    </button>
                    <button
                      className="neutral-button"
                      onClick={() => setEditingGoal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="goal-text">{goal}</p>
              )}
            </section>

            {/* Next Steps */}
            <section className="workspace-card steps-card">
              <div className="workspace-card-heading">
                <div className="section-icon">✓</div>

                <div>
                  <h2>Next steps</h2>
                  <p>
                    Agreed at each meeting · {completedSteps} of {steps.length} done
                  </p>
                </div>

                <button
                  className="neutral-button"
                  onClick={() => setAddingStep(true)}
                >
                  Add step
                </button>
              </div>

              {addingStep && (
                <div className="add-step-form">
                  <input
                    value={newStep}
                    onChange={e => setNewStep(e.target.value)}
                    placeholder="Enter your next step"
                  />

                  <button className="primary-button" onClick={addStep}>
                    Add
                  </button>

                  <button
                    className="neutral-button"
                    onClick={() => setAddingStep(false)}
                  >
                    Cancel
                  </button>
                </div>
              )}

              <div className="step-list">
                {steps.map(step => (
                  <div className="next-step" key={step.id}>
                    <input
                      type="checkbox"
                      checked={step.status === 'done'}
                      onChange={() => toggleStep(step.id)}
                    />

                    <div>
                      <p className={step.status === 'done' ? 'step-done' : ''}>
                        {step.title}
                      </p>
                      <small>{step.detail}</small>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* Right Column */}
          <aside className="workspace-right">

            {/* Sessions */}
            <section className="workspace-card sessions-card">
              <div className="workspace-card-heading">
                <div className="section-icon">▦</div>

                <div>
                  <h2>Sessions</h2>
                  <p>
                    {heldSessions} held · {confirmedSessions} confirmed by you
                  </p>
                </div>

                <button
                  className="neutral-button"
                  onClick={() => setScheduling(true)}
                >
                  Schedule
                </button>
              </div>

              {scheduling && (
                <div className="schedule-form">
                  <h3>Schedule a session</h3>

                  <label>Date</label>
                  <input
                    type="date"
                    value={sessionDate}
                    onChange={e => setSessionDate(e.target.value)}
                  />

                  <label>Time (IST)</label>
                  <input
                    type="time"
                    value={sessionTime}
                    onChange={e => setSessionTime(e.target.value)}
                  />

                  <label>Channel</label>
                  <select
                    value={sessionChannel}
                    onChange={e => setSessionChannel(e.target.value)}
                  >
                    <option>Google Meet</option>
                    <option>Email</option>
                    <option>Phone</option>
                  </select>

                  <button
                    className="primary-button"
                    onClick={scheduleSession}
                  >
                    Save session
                  </button>

                  <button
                    className="neutral-button"
                    onClick={() => setScheduling(false)}
                  >
                    Cancel
                  </button>

                  <small>A 24-hour reminder is part of the planned workflow.</small>
                </div>
              )}

              <div className="session-list">
                {sessions.map(session => (
                  <div className="session-row" key={session.id}>
                    <div className="session-icon">▦</div>

                    <div className="session-details">
                      <strong>
                        {session.date} · {session.time}
                      </strong>
                      <small>{session.topic}</small>

                      {session.status === 'Held' && session.confirm && (
                        <button
                          className="text-button confirm-button"
                          onClick={() => confirmSession(session.id)}
                        >
                          Confirm
                        </button>
                      )}
                    </div>

                    <span className={`session-status ${
                      session.status.startsWith('Held')
                        ? 'held'
                        : 'planned'
                    }`}>
                      ● {session.status}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Confidentiality */}
            <section className="privacy-notice">
              <span>♙</span>
              <p>
                Conversations happen on Google Meet, email or phone.
                Nothing you discuss is recorded on the platform —
                only dates, durations and topics.
              </p>
            </section>

            {/* Contact */}
            <section className="workspace-card contact-card">
              <div className="workspace-card-heading">
                <div className="section-icon">▣</div>
                <div>
                  <h2>Contact Rahul</h2>
                  <p>Google Meet · weekday evenings IST</p>
                </div>
              </div>

              <p className="mentor-email">rahul.menon@example.com</p>
            </section>

          </aside>
        </div>

        
{/* Feedback Form - S6 */}
{feedbackOpen && (
  <div className="modal-overlay">
    <div className="workspace-modal feedback-modal">
      <h2>How is your mentorship going?</h2>

      <p>
        Your feedback helps IIC understand whether the mentorship
        is meeting your expectations. Rahul will not see your response.
      </p>

      <h4>How much progress have you made towards your goal?</h4>

      <div className="progress-options">
        {['No progress', 'Some progress', 'Goal met'].map(option => (
          <label
            key={option}
            className={`progress-option ${
              feedbackProgress === option ? 'selected' : ''
            }`}
          >
            <input
              type="radio"
              name="feedbackProgress"
              value={option}
              checked={feedbackProgress === option}
              onChange={e => setFeedbackProgress(e.target.value)}
            />
            {option}
          </label>
        ))}
      </div>

      <h4>Additional feedback for IIC</h4>

      <textarea
        rows={5}
        value={feedback}
        maxLength={1000}
        onChange={e => setFeedback(e.target.value)}
        placeholder="Share your experience and any challenges..."
      />

      <div className="character-count">
        {feedback.length}/1000 characters (minimum 30)
      </div>

      <p className="privacy-note">
        🔒 Your response is visible only to IIC. Rahul will not see it.
      </p>

      <div className="form-actions">
        <button
          className="primary-button"
          onClick={() => {
            if (!feedbackProgress) {
              alert('Please select your progress status.');
              return;
            }
            if (feedback.trim().length < 30) {
              alert('Please enter at least 30 characters.');
              return;
            }
            submitFeedback();
          }}
        >
          Send to IIC
        </button>

        <button
          className="neutral-button"
          onClick={() => setFeedbackOpen(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}


        
{/* Change or End Case - S7 */}
{caseOpen && (
  <div className="modal-overlay">
    <div className="workspace-modal case-modal">
      <h2>Request a change or end mentorship</h2>

      <p>
        Tell IIC why you would like to change your mentor
        or end this mentorship.
      </p>

      <h4>What would you like to do?</h4>

      <div className="case-options">
        {['Change mentor', 'End mentorship'].map(option => (
          <label
            key={option}
            className={`case-option ${
              caseType === option ? 'selected' : ''
            }`}
          >
            <input
              type="radio"
              name="caseType"
              value={option}
              checked={caseType === option}
              onChange={e => setCaseType(e.target.value)}
            />
            {option}
          </label>
        ))}
      </div>

      <h4>Reason for your request</h4>

      <textarea
        rows={5}
        value={caseReason}
        maxLength={1000}
        onChange={e => setCaseReason(e.target.value)}
        placeholder="Please explain your reason so IIC can understand your concern..."
      />

      <div className="character-count">
        {caseReason.length}/1000 characters (minimum 30)
      </div>

      <div className="case-privacy">
        Your request is confidential and visible only to IIC.
        IIC will contact Rahul separately to understand his perspective.
      </div>

      <p className="case-status-note">
        Your mentorship will remain active until IIC reviews
        and makes a decision on your request.
      </p>

      {caseSubmitted && (
        <p className="success-message">
          Your request has been submitted. Status: Under review.
        </p>
      )}

      <div className="form-actions">
        <button
          className="primary-button"
          onClick={() => {
            if (caseReason.trim().length < 30) {
              alert('Please enter at least 30 characters.');
              return;
            }
            submitCase();
          }}
          disabled={
            caseReason.trim().length < 30 ||
            caseReason.length > 1000
          }
        >
          Submit request
        </button>

        <button
          className="neutral-button"
          onClick={() => setCaseOpen(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}


{caseSubmitted && (
  <div className="case-confirmation">
    Your request has been submitted to IIC and is Under review.
    Your mentorship remains active.
  </div>
)}

      </main>
    </div>
  )
}

export default StudentMentorshipWorkspace

