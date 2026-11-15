<div class="page-break"></div>

## Section 7: UI Pages

The pages follow the Figma wireframes (25 screens):

| Screens | Pages | User stories |
|---|---|---|
| A1–A4 | Log in, student sign-up, verify email, mentor activation | US-01, US-14 |
| S1–S7 | Profile, submit problem, dashboard, mentorship workspace, feedback, change or end request | US-02, US-03, US-05–US-08, US-11, US-20, US-21 |
| M1–M6 | Mentor dashboard, decline, availability and contact, mentorship workspace, log session, end mentorship | US-06, US-09–US-13 |
| I1–I7 | Problem queue, review and assign, mentor pool, registered students, monitoring, case page, settings and topic tags | US-04, US-07, US-14–US-18, US-20, US-21 |
| L1 | Programme insights | US-19 |
| AI | Problem coach (on S2), mentor fit notes (on I2) and the mentorship feedback review (I8, new) | US-03, US-04, US-08, US-17 |

### 7.1 Pages built so far

The React app (Section 1.4, F1 to F5) holds every page in the wireframes, for all four roles, plus the three AI features. Each page keeps its own sample data: the student Ananya Rao, the mentor Rahul Menon, the IIC coordinator Deepa Krishnan and, for leadership, Prof. Anand Rajan. Buttons that need the API, such as **Log in**, show a notice until the backend is connected in Milestone 3. Every page shares the student pages' design: their colours, type, cards, buttons and navigation bar, applied to the mentor, IIC and leadership pages through one shared stylesheet. All screenshots are 1440 px wide, the width of the wireframes. The account and student pages were taken on 4 November 2026, the problem coach on 6 November, and the mentor, IIC and insights pages on 7 November.

| Figure | Page | What it shows | Wireframe | Stories |
|---|---|---|---|---|
| 7.1 | Welcome | Landing page with **Get started** and **I already have an account** | — | US-01 |
| 7.2 | Log in | Institute email and password, with a link to reset a forgotten password | A1 | US-01 |
| 7.3 | Forgot password | Asks for the institute email to send a reset link to | — | US-01 |
| 7.4 | Reset password | New password, entered twice | — | US-01 |
| 7.5 | Student sign-up | Roll number and institute email; open only to students registered with the mentoring programme | A2 | US-01 |
| 7.6 | Verify your email | Where the link was sent, what to do next, and a resend button | A3 | US-01 |
| 7.7 | Complete your profile | Name and roll number from registration (read-only), programme level, CGPA (shown only to IIC), completed courses and career interest | S1 | US-02 |
| 7.8 | My mentoring problem | The request with its status tracker, description, tags and desired outcome, which the student can edit or withdraw; notifications and other states of the request | S3 | US-03, US-05 |
| 7.9 | Dashboard: mentor assigned | The mentor's expertise, experience, preferred channel, availability and contact details, an editable first message, and **I have reached out** | S4 | US-05 |
| 7.10 | Profile | The same profile fields, editable after onboarding | S1 | US-02 |
| 7.11 | Mentorship workspace | Goal, next steps, sessions, the feedback checkpoint banner and the mentor's contact card | S5 | US-06, US-11 |
| 7.12 | Feedback dialog | Progress status (no progress, some progress, goal met) and a comment, visible only to IIC | S6 | US-08 |
| 7.13 | Change or end request | Change mentor or end the mentorship, with a reason; the mentorship stays active until IIC decides | S7 | US-07 |
| 7.14 | Schedule a session | Date, time and channel for a new session in the workspace | S5 | US-11 |
| 7.15 | Mentor account activation | A welcome naming the IIC coordinator who verified the mentor, and a password to activate the account | A4 | US-14 |
| 7.16 | Mentor dashboard | Load against capacity, sessions this month and the next feedback date; IIC's capacity request; assignments to accept or decline; active mentorships | M1 | US-09, US-10 |
| 7.17 | Decline an assignment | A required reason and an optional note for IIC; the problem goes back to IIC's queue | M2 | US-09 |
| 7.18 | Availability and contact | The availability switch, preferred channel, contact details, free times and time zone; capacity and expertise, which IIC sets | M3 | US-10 |
| 7.19 | Mentorship workspace (mentor) | The feedback due date, goal, next steps, sessions to confirm or manage, and the student's details | M4 | US-06, US-11, US-12 |
| 7.20 | Log a session | Date, duration, channel and topic of a held session; nothing about what was said | M5 | US-11 |
| 7.21 | End the mentorship | A required reason and optional details for IIC | M6 | US-13 |
| 7.22 | Problem queue | Reassignment alerts pinned at the top, status filters, search, and how long each problem has waited | I1 | US-16, US-21 |
| 7.23 | Review and assign | The student's profile (CGPA for IIC only), problem, tags and guidance preferences, beside up to four ranked mentors | I2 | US-04, US-16, US-20 |
| 7.24 | Mentor pool | Mentors by status with expertise, availability and load; verify, resend link and capacity requests | I3 | US-14 |
| 7.25 | Verify a mentor | The mentor's background and experience, and the expertise tags IIC sets before the activation link is sent | I3 | US-14 |
| 7.26 | Import mentors from CSV | The required columns; invalid rows are reported with their row number and reason | I3 | US-14 |
| 7.27 | Registered students | The roster with sign-up and profile status, the last import's result, CSV import and removal | I4 | US-15 |
| 7.28 | Monitoring | Active mentorships with session counts, latest progress and flags, filter chips by flag, and open cases | I5 | US-17, US-21 |
| 7.29 | Case | The student's request, the mentor's side recorded by IIC, the decision with a reason, and the case history | I6 | US-18 |
| 7.30 | Settings and topic tags | Timing windows and default capacity, approved email domains and topic tags (tabs), and the audit log | I7 | US-01, US-03, US-21 |
| 7.31 | Programme insights | Headline figures, demand against supply by topic, outcomes of ended mentorships, topics short of mentors, and CSV export | L1 | US-19 |
| 7.32 | Problem coach (AI) | The problem form with the coach's suggested tags and what would make the problem more specific | S2 | US-03, US-20 |
| 7.33 | Mentor fit notes (AI) | Recommended mentors, each with a note on the tags they cover and miss and how their style fits | I2 | US-04 |
| 7.34 | Mentorship feedback review (AI) | A wellbeing flag for IIC to act on, the AI summary, both sides' feedback and the session dates | New | US-08, US-17 |


### 7.2 Account pages

<div class="shot"><img src="../images/ui/welcome.png" alt="Welcome page"><p class="fig-caption">Figure 7.1. Welcome.</p></div>

<div class="shot"><img src="../images/ui/login.png" alt="Log in page"><p class="fig-caption">Figure 7.2. Log in (A1).</p></div>

<div class="shot"><img src="../images/ui/forgot-password.png" alt="Forgot password page"><p class="fig-caption">Figure 7.3. Forgot password.</p></div>

<div class="shot"><img src="../images/ui/reset-password.png" alt="Reset password page"><p class="fig-caption">Figure 7.4. Reset password.</p></div>

<div class="shot"><img src="../images/ui/signup.png" alt="Student sign-up page"><p class="fig-caption">Figure 7.5. Student sign-up (A2).</p></div>

<div class="shot"><img src="../images/ui/email-verification.png" alt="Verify your email page"><p class="fig-caption">Figure 7.6. Verify your email (A3).</p></div>

### 7.3 Student pages

<div class="shot"><img src="../images/ui/profile-onboarding.png" alt="Complete your profile page"><p class="fig-caption">Figure 7.7. Complete your profile, shown once after the email is verified (S1).</p></div>

<div class="shot"><img src="../images/ui/my-problem.png" alt="My mentoring problem page"><p class="fig-caption">Figure 7.8. My mentoring problem, before a mentor has accepted (S2, S3).</p></div>

<div class="shot"><img src="../images/ui/dashboard-mentor-assigned.png" alt="Student dashboard after a mentor is assigned"><p class="fig-caption">Figure 7.9. Dashboard after the mentor accepts (S4).</p></div>

<div class="shot"><img src="../images/ui/profile.png" alt="Student profile page"><p class="fig-caption">Figure 7.10. Profile (S1).</p></div>

<div class="shot"><img src="../images/ui/workspace.png" alt="Mentorship workspace"><p class="fig-caption">Figure 7.11. Mentorship workspace (S5).</p></div>

<div class="shot"><img src="../images/ui/workspace-feedback.png" alt="Feedback dialog over the mentorship workspace"><p class="fig-caption">Figure 7.12. Feedback dialog (S6).</p></div>

<div class="shot"><img src="../images/ui/workspace-change-or-end.png" alt="Change or end request dialog over the mentorship workspace"><p class="fig-caption">Figure 7.13. Change or end request (S7).</p></div>

<div class="shot"><img src="../images/ui/workspace-schedule.png" alt="Schedule a session form in the mentorship workspace"><p class="fig-caption">Figure 7.14. Scheduling a session in the workspace (S5).</p></div>

### 7.4 Mentor pages

<div class="shot"><img src="../images/ui/mentor-activation.png" alt="Mentor account activation page"><p class="fig-caption">Figure 7.15. Mentor account activation, opened from the link IIC sends after verifying the mentor (A4).</p></div>

<div class="shot"><img src="../images/ui/mentor-dashboard.png" alt="Mentor dashboard"><p class="fig-caption">Figure 7.16. Mentor dashboard with a capacity request from IIC and an assignment waiting for a response (M1).</p></div>

<div class="shot"><img src="../images/ui/mentor-decline.png" alt="Decline dialog over the mentor dashboard"><p class="fig-caption">Figure 7.17. Declining an assignment needs a reason (M2).</p></div>

<div class="shot"><img src="../images/ui/mentor-availability.png" alt="Availability and contact page"><p class="fig-caption">Figure 7.18. Availability and contact; capacity and expertise are read-only (M3).</p></div>

<div class="shot"><img src="../images/ui/mentor-workspace.png" alt="Mentor's view of the mentorship workspace"><p class="fig-caption">Figure 7.19. Mentorship workspace, mentor's view (M4).</p></div>

<div class="shot"><img src="../images/ui/mentor-log-session.png" alt="Log a session dialog"><p class="fig-caption">Figure 7.20. Logging a held session: when, how long, which channel and the topic, never what was said (M5).</p></div>

<div class="shot"><img src="../images/ui/mentor-end.png" alt="End mentorship dialog"><p class="fig-caption">Figure 7.21. Ending a mentorship needs a reason; IIC is notified (M6).</p></div>

### 7.5 IIC pages

<div class="shot"><img src="../images/ui/iic-problem-queue.png" alt="IIC problem queue"><p class="fig-caption">Figure 7.22. Problem queue, with problems that need reassignment pinned at the top (I1).</p></div>

<div class="shot"><img src="../images/ui/iic-review-assign.png" alt="Review and assign page"><p class="fig-caption">Figure 7.23. Reviewing a problem next to the recommended mentors (I2).</p></div>

<div class="shot"><img src="../images/ui/iic-mentor-pool.png" alt="Mentor pool"><p class="fig-caption">Figure 7.24. Mentor pool (I3).</p></div>

<div class="shot"><img src="../images/ui/iic-verify-mentor.png" alt="Verify mentor side panel"><p class="fig-caption">Figure 7.25. Verifying a mentor and setting their expertise tags (I3).</p></div>

<div class="shot"><img src="../images/ui/iic-import-mentors.png" alt="Import mentors from CSV dialog"><p class="fig-caption">Figure 7.26. Importing mentors from a CSV file (I3).</p></div>

<div class="shot"><img src="../images/ui/iic-roster.png" alt="Registered students page"><p class="fig-caption">Figure 7.27. Registered students, with the result of the last roster import (I4).</p></div>

<div class="shot"><img src="../images/ui/iic-monitoring.png" alt="Monitoring page"><p class="fig-caption">Figure 7.28. Monitoring active mentorships, flagged rows first (I5).</p></div>

<div class="shot"><img src="../images/ui/iic-case.png" alt="Case page"><p class="fig-caption">Figure 7.29. A change request case: the student's side, the mentor's side and IIC's decision (I6).</p></div>

<div class="shot"><img src="../images/ui/iic-settings.png" alt="Settings and topic tags page"><p class="fig-caption">Figure 7.30. Settings: timing windows and capacity, with the audit log below (I7).</p></div>

### 7.6 Programme insights

<div class="shot"><img src="../images/ui/insights.png" alt="Programme insights dashboard"><p class="fig-caption">Figure 7.31. Programme insights for leadership: aggregates only, no names or contact details (L1).</p></div>

### 7.7 AI features

The three AI features decided on 6 Nov (Section 5.8) are built as prototype screens. Until the Flask API is connected, simple rules and sample text stand in for the AI's answers.

<div class="shot"><img src="../images/ui/ai-problem-coach.png" alt="Submit your problem page with the Problem coach's suggestions"><p class="fig-caption">Figure 7.32. Problem coach on the problem form (S2): suggested tags the student can add, and what would make the problem more specific.</p></div>

<div class="shot"><img src="../images/ui/ai-mentor-fit-notes.png" alt="Review and assign page with AI notes under each recommended mentor"><p class="fig-caption">Figure 7.33. Mentor fit notes on the review and assign page (I2). The ranking is unchanged; the notes explain it.</p></div>

<div class="shot"><img src="../images/ui/ai-feedback-review.png" alt="Mentorship feedback review page with a wellbeing flag and an AI summary"><p class="fig-caption">Figure 7.34. Mentorship feedback review (I8), opened from Monitoring: a wellbeing flag for IIC to act on, the AI summary and both sides' feedback.</p></div>
