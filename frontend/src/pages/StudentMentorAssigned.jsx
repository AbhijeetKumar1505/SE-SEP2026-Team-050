import { useState, useEffect } from 'react'
import './StudentMentorAssigned.css'

function StudentMentorAssigned() {
  const [message, setMessage] = useState(
    "Hi Rahul, I’m Ananya, a BS student at IITM. IIC matched us for my question about moving into data engineering — I’m not sure what the role involves day to day or which tools to learn first. Could we have a short Google Meet call this week? I’m free on weekday evenings (IST). Thanks!"
  )

  const [copied, setCopied] = useState(false)
  const [reachedOut, setReachedOut] = useState(false)
  const [reachedOutDate, setReachedOutDate] = useState('')

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message)
      setCopied(true)
    } catch {
      setCopied(false)
      alert('Unable to copy automatically. Please select and copy the message.')
    }
  }

  function markReachedOut() {
    const today = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })

    setReachedOutDate(today)
    setReachedOut(true)
  }

  return (
    <div className="assigned-page">

      {/* Navigation */}
      <nav className="assigned-navbar">
        <div className="assigned-brand">
          <div className="assigned-logo">M</div>
          <strong>IITM BS Mentoring</strong>
        </div>

        <div className="assigned-nav-links">
  <a
    href="#"
    className="active"
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

  <a
    href="#"
    onClick={(e) => {
      e.preventDefault()
      window.dispatchEvent(new Event('open-mentorship'))
    }}
  >
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

        <div className="assigned-user">
          <div className="assigned-avatar">AR</div>
          <div>
            <strong>Ananya Rao</strong>
            <small>Student · 23f1002345</small>
          </div>
        </div>
      </nav>

      <main className="assigned-container">

        {/* Welcome */}
        <header className="assigned-welcome">
          <h1>Your mentor is ready</h1>
          <p>
            Rahul accepted on 6 Nov 2026. You make the first contact,
            on his preferred channel.
          </p>
        </header>

        <div className="assigned-alert">
          <strong>Mentor assigned — you reach out first</strong>
          <p>
            The platform never sends messages for you.
            Use the draft below on Google Meet chat or email.
          </p>
        </div>

        <div className="assigned-grid">

          {/* Mentor Profile */}
          <section className="mentor-profile-card">

            <div className="mentor-profile-heading">
              <div className="mentor-avatar">RM</div>

              <div>
                <h2>Rahul Menon</h2>
                <p>BS Data Science ’24 · Data Engineer at a fintech company</p>
              </div>

              <span className="verified-badge">✓ Verified by IIC</span>
            </div>

            <div className="mentor-details-grid">
              <div>
                <small>Preferred channel</small>
                <strong>Google Meet</strong>
              </div>

              <div>
                <small>Availability</small>
                <strong>Weekday evenings, Sat mornings</strong>
              </div>

              <div>
                <small>Time zone</small>
                <strong>IST (UTC+05:30)</strong>
              </div>

              <div>
                <small>Contact</small>
                <strong>rahul.menon@example.com</strong>
              </div>
            </div>

            <div className="mentor-expertise">
              <h3>Expertise</h3>
              <div className="mentor-tags">
                <span>Data engineering</span>
                <span>SQL and database design</span>
                <span>Python programming</span>
                <span>Job search strategy</span>
              </div>
            </div>

            <div className="mentor-experience">
              <h3>Experience</h3>

              <div className="experience-row">
                <span>Work</span>
                <strong>Data Engineer</strong>
                <small>2 years</small>
              </div>

              <div className="experience-row">
                <span>Internship</span>
                <strong>Analytics intern</strong>
                <small>6 months</small>
              </div>

              <div className="experience-row">
                <span>Project</span>
                <strong>Real-time pipeline with Kafka</strong>
                <small>3 months</small>
              </div>
            </div>

          </section>

          {/* First Message */}
          <section className="first-message-card">

            <h2>Your first message</h2>
            <p className="message-instruction">
              Edit it, copy it and send it yourself.
            </p>

            <label htmlFor="first-message">Message</label>

            <textarea
              id="first-message"
              value={message}
              onChange={(event) => {
                setMessage(event.target.value)
                setCopied(false)
              }}
              rows={10}
            />

            <p className="message-note">
              Includes your problem summary and his preferred channel.
            </p>

            <button
              className="copy-message-button"
              onClick={copyMessage}
            >
              {copied ? '✓ Copied!' : 'Copy message'}
            </button>

            <button
              className="reached-out-button"
              onClick={markReachedOut}
              disabled={reachedOut}
            >
              {reachedOut ? '✓ Reached out' : 'I have reached out'}
            </button>

            {reachedOut && (
              <div className="reached-out-success">
                <strong>First contact recorded!</strong>
                <p>
                  Reached out on {reachedOutDate}.
                  Rahul and IIC can see this update.
                </p>
                <button
                className="copy-message-button"
                 onClick={() => window.dispatchEvent(new Event('open-mentorship'))}
                    >
                Open Mentorship Workspace
                </button>
              </div>
            )}

            <p className="reminder-note">
              Marking this records today's date. Rahul and IIC can see it.
              If there's no first session within 7 days, both of you get
              a reminder.
            </p>

          </section>

        </div>
      </main>
    </div>
  )
}

export default StudentMentorAssigned