import { BRAND } from '../constants/brand'
import '../pages/Login.css'
import './StudentLayout.css'

// Public pages outside the sign-up flow (mentor activation, logged out, not found),
// laid out like the log-in page: a top bar with the brand and one centred card.
// .student-ui gives them the student pages' heading defaults (StudentLayout.css).
export default function PublicPage({ title, intro, children }) {
  return (
    <div className="student-ui login-page">
      <nav className="login-navbar">
        <div className="login-brand">
          <div className="login-logo">M</div>
          <strong>{BRAND.name}</strong>
        </div>
      </nav>
      <main className="login-container">
        <div className="login-card">
          <div className="login-heading">
            <h1>{title}</h1>
            {intro && <p>{intro}</p>}
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}
