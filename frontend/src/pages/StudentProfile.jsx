
import { useState } from 'react'
import './StudentProfile.css'

function StudentProfile({
  mode = 'dashboard',
  studentName = 'Ananya Rao',
  rollNumber = '23f1002345',
  initialProfile = {},
  onComplete,
  onSave
}) {
  const isOnboarding = mode === 'onboarding'

  const [level, setLevel] = useState(initialProfile.level || 'BS')
  const [cgpa, setCgpa] = useState(initialProfile.cgpa ?? '')
  const [courses, setCourses] = useState(initialProfile.courses || '')
  const [careerInterest, setCareerInterest] = useState(
    initialProfile.careerInterest || ''
  )

  const [errors, setErrors] = useState({})
  const [saved, setSaved] = useState(false)

  function handleSave() {
    const newErrors = {}

    if (!level) {
      newErrors.level = 'Please select your programme level.'
    }

    if (
      cgpa === '' ||
      !Number.isFinite(Number(cgpa)) ||
      Number(cgpa) < 0 ||
      Number(cgpa) > 10
    ) {
      newErrors.cgpa = 'Enter a valid CGPA between 0 and 10.'
    }

    if (!courses.trim()) {
      newErrors.courses = 'Please enter at least one completed course.'
    }

    if (!careerInterest) {
      newErrors.careerInterest = 'Please select your career interest.'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      setSaved(false)
      return
    }

    const profileData = {
      level,
      cgpa: Number(cgpa),
      courses: courses.trim(),
      careerInterest
    }

    setSaved(true)

    if (isOnboarding && onComplete) {
      onComplete(profileData)
    } else if (!isOnboarding && onSave) {
      onSave(profileData)
    }
  }

  function clearSaved() {
    setSaved(false)
  }

  return (
    <div className="profile-page">

      <header className="profile-page-heading">
        <div>
          <h1>
            {isOnboarding ? 'Complete your profile' : 'Your profile'}
          </h1>

          <p>
            {isOnboarding
              ? 'Complete your academic and career information to get started with mentoring.'
              : 'Keep your academic and career information up to date to help IIC understand your mentoring needs.'}
          </p>
        </div>

        <span className="profile-status">
          {isOnboarding ? 'Profile setup' : 'Student profile'}
        </span>
      </header>

      <div className="profile-form-card">

        <div className="profile-section-heading">
          <h2>Basic information</h2>
          <p>These details are linked to your IITM BS registration.</p>
        </div>

        <div className="profile-fields-grid">

          <div className="profile-field">
            <label>Full name</label>
            <input value={studentName} readOnly />
            <small>Registered name · Read only</small>
          </div>

          <div className="profile-field">
            <label>Roll number</label>
            <input value={rollNumber} readOnly />
            <small>Registered identifier · Read only</small>
          </div>

          <div className="profile-field">
            <label>Programme level *</label>
            <select
              value={level}
              onChange={e => {
                setLevel(e.target.value)
                clearSaved()
              }}
            >
              <option value="">Select level</option>
              <option value="BSc">BSc</option>
              <option value="BS">BS</option>
            </select>

            {errors.level && (
              <small className="field-error">{errors.level}</small>
            )}
          </div>

          <div className="profile-field">
            <label>CGPA *</label>
            <input
              type="number"
              min="0"
              max="10"
              step="0.01"
              placeholder="Enter your CGPA"
              value={cgpa}
              onChange={e => {
                setCgpa(e.target.value)
                clearSaved()
              }}
            />

            <small>Visible only to IIC.</small>

            {errors.cgpa && (
              <small className="field-error">{errors.cgpa}</small>
            )}
          </div>

        </div>

        <div className="profile-divider" />

        <div className="profile-section-heading">
          <h2>Academic information</h2>
          <p>Share the courses you have completed so far.</p>
        </div>

        <div className="profile-field full-width">
          <label>Completed courses *</label>

          <textarea
            rows={3}
            value={courses}
            onChange={e => {
              setCourses(e.target.value)
              clearSaved()
            }}
            placeholder="Enter completed course names, separated by commas..."
          />

          <small>Enter at least one completed course.</small>

          {errors.courses && (
            <small className="field-error">{errors.courses}</small>
          )}
        </div>

        <div className="profile-divider" />

        <div className="profile-section-heading">
          <h2>Career interests</h2>
          <p>What kind of guidance are you looking for?</p>
        </div>

        <div className="profile-field full-width">
          <label>Primary career interest *</label>

          <select
            value={careerInterest}
            onChange={e => {
              setCareerInterest(e.target.value)
              clearSaved()
            }}
          >
            <option value="">Select your career interest</option>
            <option value="Job">Job</option>
            <option value="Higher studies">Higher studies</option>
            <option value="Entrepreneurship">Entrepreneurship</option>
            <option value="Other">Other</option>
          </select>

          {errors.careerInterest && (
            <small className="field-error">{errors.careerInterest}</small>
          )}
        </div>

        <div className="profile-privacy">
          <strong>Privacy and visibility</strong>
          <p>
            Your academic profile information helps IIC coordinate
            mentoring. Your CGPA is visible only to IIC.
          </p>
        </div>

        {saved && (
          <div className="profile-success">
            Profile saved successfully!
          </div>
        )}

        <div className="profile-form-actions">
          <button
            className="profile-save-button"
            onClick={handleSave}
          >
            {isOnboarding
              ? 'Complete profile & continue'
              : 'Save profile'}
          </button>
        </div>

      </div>
    </div>
  )
}

export default StudentProfile
