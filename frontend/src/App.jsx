import ResetPassword from './pages/ResetPassword'
import ForgotPassword from './pages/ForgotPassword'
import Welcome from './pages/Welcome'
import Login from './pages/Login'
import Signup from './pages/Signup'
import EmailVerification from './pages/EmailVerification'
import StudentProfile from './pages/StudentProfile'
import StudentMentorshipWorkspace from './pages/StudentMentorshipWorkspace'
import StudentMentorAssigned from './pages/StudentMentorAssigned'
import { useState, useEffect } from 'react'
import './App.css'



function Navbar({ activeTab = 'problem' }) {
  return (
    <nav className="navbar">
      <div className="brand">
        <div className="brand-logo">M</div>
        <strong>IITM BS Mentoring</strong>
      </div>

      <div className="nav-links">
        <a
          href="#"
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={(e) => {
            e.preventDefault()
            window.dispatchEvent(new Event('open-dashboard'))
          }}
        >
          Dashboard
        </a>

        <a
          href="#"
          className={activeTab === 'problem' ? 'active' : ''}
          onClick={(e) => {
            e.preventDefault()
            window.dispatchEvent(new Event('open-my-problem'))
          }}
        >
          My problem
        </a>

        <a
          href="#"
          className={activeTab === 'mentorship' ? 'active' : ''}
          onClick={(e) => {
            e.preventDefault()
            window.dispatchEvent(new Event('open-mentorship'))
          }}
        >
          Mentorship
        </a>

        <a
          href="#"
          className={activeTab === 'profile' ? 'active' : ''}
          onClick={(e) => {
            e.preventDefault()
            window.dispatchEvent(new Event('open-profile'))
          }}
        >
          Profile
        </a>
      </div>

      <div className="student-info">
        <span className="notification-icon">♧ <b>2</b></span>
        <div className="avatar">AR</div>
        <div>
          <strong>Ananya Rao</strong>
          <small>Student · 23f1002345</small>
        </div>
      </div>
    </nav>
  )
}



function StatusTracker() {
  const steps = [
    { name: 'Submitted', date: '3 Nov' },
    { name: 'Under review', date: '4 Nov · IIC is reading it' },
    { name: 'Awaiting mentor', date: '5 Nov · a mentor has up to 72 h to accept' },
    { name: 'Mentor assigned', date: "You'll get their contact details" }
  ]

  return (
    <div className="status-tracker">
      {steps.map((step, index) => (
        <div className="status-step" key={step.name}>
          <div className="step-line">
            <div className={`step-circle ${
              index < 2 ? 'completed' : index === 2 ? 'current' : ''
            }`}>
              {index < 2 ? '✓' : index + 1}
            </div>
            {index !== 3 && (
              <div className={`connector ${index < 2 ? 'done' : ''}`} />
            )}
          </div>

          <h4>{step.name}</h4>
          <p>{step.date}</p>
        </div>
      ))}
    </div>
  )
}


function RequestCard({
  description,
  setDescription,
  outcome,
  setOutcome,
  status,
  onWithdraw
}) {
  const [editing, setEditing] = useState(false)
  const [confirmWithdraw, setConfirmWithdraw] = useState(false)
  const [draftDescription, setDraftDescription] = useState(description)
  const [draftOutcome, setDraftOutcome] = useState(outcome)

  const locked = status === 'Mentor assigned' || status === 'Withdrawn'

  function saveChanges() {
    setDescription(draftDescription)
    setOutcome(draftOutcome)
    setEditing(false)
  }

  return (
    <section className="request-card">

      <div className="request-heading">
        <div>
          <h3>Your request</h3>
          <p>Submitted 3 Nov 2026</p>
        </div>

        <span className="main-status">{status}</span>
      </div>

      {status !== 'Withdrawn' && <StatusTracker />}

      {status === 'Withdrawn' ? (
        <div className="withdrawn-message">
          <h3>Request withdrawn</h3>
          <p>You have withdrawn this mentoring request.</p>
        </div>
      ) : editing ? (
        <div className="edit-form">
          <h3>Edit your mentoring request</h3>

          <label>Problem description</label>
          <textarea
            value={draftDescription}
            onChange={(e) => setDraftDescription(e.target.value)}
            rows={5}
          />

          <label>What do you want to achieve?</label>
          <textarea
            value={draftOutcome}
            onChange={(e) => setDraftOutcome(e.target.value)}
            rows={2}
          />

          <div className="request-actions">
            <button onClick={saveChanges} className="save-button">
              Save changes
            </button>

            <button
              onClick={() => setEditing(false)}
              className="edit-button"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="request-description">
            {description}
          </div>

          <div className="tags">
            <span>Data engineering</span>
            <span>SQL and database design</span>
            <span>Industry and role requirements</span>
          </div>

          <div className="outcome">
            <small>What you want to achieve</small>
            <p>{outcome}</p>
          </div>

          {!locked && (
            <div className="request-actions">
              <button
                className="edit-button"
                onClick={() => {
                  setDraftDescription(description)
                  setDraftOutcome(outcome)
                  setEditing(true)
                }}
              >
                Edit
              </button>

              <button
                className="withdraw-button"
                onClick={() => setConfirmWithdraw(true)}
              >
                Withdraw
              </button>
            </div>
          )}
        </>
      )}

      {confirmWithdraw && (
        <div className="confirmation-box">
          <h3>Withdraw this request?</h3>
          <p>
            Are you sure you want to withdraw your mentoring request?
            This action will change its status.
          </p>

          <div className="request-actions">
            <button
              className="withdraw-button"
              onClick={() => {
                onWithdraw()
                setConfirmWithdraw(false)
              }}
            >
              Yes, withdraw
            </button>

            <button
              className="edit-button"
              onClick={() => setConfirmWithdraw(false)}
            >
              Keep request
            </button>
          </div>
        </div>
      )}

    </section>
  )
}


function Notifications({ status }) {
  const notifications = [
    ...(status === 'Mentor assigned'
      ? [{
          title: 'Your mentor has accepted the assignment.',
          date: 'Just now',
          latest: true
        }]
      : status === 'Withdrawn'
      ? [{
          title: 'You withdrew your mentoring request.',
          date: 'Just now',
          latest: true
        }]
      : [{
          title: 'IIC assigned you a mentor. Waiting for them to accept.',
          date: '5 Nov',
          latest: true
        }]
    ),

    {
      title: 'IIC is reviewing your problem.',
      date: '4 Nov'
    },
    {
      title: 'We received your problem.',
      date: '3 Nov'
    }
  ]

  return (
    <section className="side-card">
      <h3>♧ &nbsp; Notifications</h3>

      {notifications.map((item, index) => (
        <div className="notification-item" key={index}>
          <span className={`notification-dot ${item.latest ? 'latest' : ''}`} />

          <div>
            <p className={item.latest ? 'notification-bold' : ''}>
              {item.title}
            </p>
            <small>{item.date}</small>
          </div>
        </div>
      ))}
    </section>
  )
}


function ProfileCard() {
  return (
    <section className="side-card profile-card">
      <div className="side-heading">
        <h3>♙ &nbsp; Your profile</h3>
        <span className="complete-badge">● Complete</span>
      </div>

      <p>BS · Job · 6 completed courses</p>
      <a href="#">Edit profile</a>
    </section>
  )
}

function OtherStates() {
  return (
    <section className="side-card other-states">
      <h3>Other states of this card</h3>

      <div className="state-box reassignment">
        <strong>◷ &nbsp; IIC is finding you another mentor</strong>
        <p>
          Shown when an assignment expires (72 h) or the problem needs
          reassignment.
        </p>
      </div>

      <div className="state-box closed">
        <strong>⚠ &nbsp; Closed by IIC</strong>
        <p>
          Reason is shown, e.g. “Placement process is out of scope —
          contact the placement cell.” You can submit a new problem.
        </p>
      </div>
    </section>
  )
}



function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome') // 'welcome', 'login', 'signup', 'emailVerification', 'profileOnboarding', 'assigned', 'workspace', 'profile', 'problem'

const [studentEmail, setStudentEmail] = useState('')
const [verificationStatus, setVerificationStatus] = useState('pending')
const [studentProfile, setStudentProfile] = useState({})

  // My Problem screen states
  const [problemDescription, setProblemDescription] = useState(
    'I want guidance on moving into data engineering and understanding the tools and skills required for this role.'
  )

  const [desiredOutcome, setDesiredOutcome] = useState(
    'Build a clear learning roadmap and prepare for a data engineering role.'
  )

  const [problemStatus, setProblemStatus] = useState('Under review')
  

  // Navigation event listeners
  useEffect(() => {
    const openWorkspace = () => setCurrentScreen('workspace')
    const openDashboard = () => setCurrentScreen('assigned')
    const openMyProblem = () => setCurrentScreen('problem')
    const openProfile = () => setCurrentScreen('profile')

    window.addEventListener('open-mentorship', openWorkspace)
    window.addEventListener('open-dashboard', openDashboard)
    window.addEventListener('open-my-problem', openMyProblem)
    window.addEventListener('open-profile', openProfile)

    return () => {
      window.removeEventListener('open-mentorship', openWorkspace)
      window.removeEventListener('open-dashboard', openDashboard)
      window.removeEventListener('open-my-problem', openMyProblem)
      window.removeEventListener('open-profile', openProfile)
    }
  }, [])

  
return (
  <>
    {currentScreen === 'welcome' ? (
      <Welcome
        onLogin={() => setCurrentScreen('login')}
        onSignup={() => setCurrentScreen('signup')}
      />
    ) : currentScreen === 'login' ? (
      <Login
        onLogin={() => {
          alert('Backend authentication is not connected yet.')
        }}
        onSignup={() => setCurrentScreen('signup')}
        onForgotPassword={() => setCurrentScreen('forgotPassword')}
      />
      ) : currentScreen === 'forgotPassword' ? (
      <ForgotPassword
        onBackToLogin={() => setCurrentScreen('login')}
        onSubmit={({ email }) => {
          alert(
            `Password reset instructions will be sent to ${email} once the backend is connected.`
          )
        }}
      />
     ) : currentScreen === 'resetPassword' ? (
  <ResetPassword
    onBackToLogin={() => setCurrentScreen('login')}
    onReset={({ password }) => {
      alert('Password reset will be connected through Flask.')
    }}
  />
      ) : currentScreen === 'signup' ? (
  <Signup
    onLogin={() => setCurrentScreen('login')}
    onBack={() => setCurrentScreen('welcome')}
    onSubmit={({ rollNumber, email }) => {
      setStudentEmail(email)
      setVerificationStatus('pending')
      setCurrentScreen('emailVerification')
    }}
  />
  ) : currentScreen === 'emailVerification' ? (
  <EmailVerification
    email={studentEmail}
    verificationStatus={verificationStatus}
    onLogin={() => setCurrentScreen('login')}
    onResend={() => {
      alert('Email sending will be connected through Flask.')
    }}
    onContinue={() => setCurrentScreen('profileOnboarding')}
  />
  ) : currentScreen === 'profileOnboarding' ? (
  <StudentProfile
    mode="onboarding"
    studentName="Ananya Rao"
    rollNumber="23f1002345"
    initialProfile={studentProfile}
    onComplete={(profileData) => {
      setStudentProfile(profileData)
      setCurrentScreen('assigned')
    }}
    />
    ) : currentScreen === 'assigned' ? (
      <StudentMentorAssigned />
    ) : currentScreen === 'workspace' ? (
      <StudentMentorshipWorkspace />
    ) : currentScreen === 'profile' ? (
      <div className="dashboard-page">
        <Navbar activeTab="profile" />
        <StudentProfile />
      </div>
    ) : (
      <div className="dashboard-page">
        <Navbar />

        <main className="dashboard-container">
          <header className="dashboard-heading">
            <h1>My mentoring problem</h1>
            <p>Track your request and its current status.</p>
          </header>

          <div className="dashboard-grid">
            <div className="main-column">
              <RequestCard
                description={problemDescription}
                setDescription={setProblemDescription}
                outcome={desiredOutcome}
                setOutcome={setDesiredOutcome}
                status={problemStatus}
                onWithdraw={() => setProblemStatus('Withdrawn')}
              />
            </div>

            <aside className="sidebar">
              <Notifications status={problemStatus} />
              <ProfileCard />
              <OtherStates />
            </aside>
          </div>
        </main>
      </div>
    )}
  </>
)

}
export default App

