<style>
.cmp-figure { margin: 10pt 0 2pt; break-inside: avoid; }
.cmp-figure svg { width: 100%; height: auto; display: block; }
.cmp-caption { font-size: 8.5pt; color: #5b5b66; margin: 4pt 0 12pt; }
.cmp-detail table { font-size: 9pt; }
.cmp-detail td:first-child { width: 21%; font-weight: 600; }
</style>

## Section 1: Design of Components

This section identifies the components of the platform and describes what each one does. They come from the 21 user stories in the Milestone 1 report (Section 3) and the client's clarifications (Section 4 of that report). They follow the tech stack the team chose: a React web client and one Flask API, with SQLite for development and tests and PostgreSQL for the hosted demo.

### 1.1 Architecture overview

<div class="cmp-figure">
<svg viewBox="0 0 680 590" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, Arial, sans-serif" role="img" aria-label="Component diagram of the mentoring platform">
<defs><marker id="cmp-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#5b5b66"/></marker></defs>
<path d="M86.5,32 V20 H255.5 V32" fill="none" stroke="#5b5b66" stroke-width="1" stroke-dasharray="4 3"/>
<text x="171" y="14" font-size="9" fill="#5b5b66" text-anchor="middle">Conversations on Google Meet, email or phone (outside the platform)</text>
<rect x="10" y="32" width="153" height="36" rx="5" fill="#eef1f6" stroke="#1f4e8c"/>
<text x="86.5" y="54" font-size="11.5" font-weight="600" fill="#1d1d1f" text-anchor="middle">Student</text>
<rect x="179" y="32" width="153" height="36" rx="5" fill="#eef1f6" stroke="#1f4e8c"/>
<text x="255.5" y="54" font-size="11.5" font-weight="600" fill="#1d1d1f" text-anchor="middle">Mentor</text>
<rect x="348" y="32" width="153" height="36" rx="5" fill="#eef1f6" stroke="#1f4e8c"/>
<text x="424.5" y="54" font-size="11.5" font-weight="600" fill="#1d1d1f" text-anchor="middle">IIC coordinator</text>
<rect x="517" y="32" width="153" height="36" rx="5" fill="#eef1f6" stroke="#1f4e8c"/>
<text x="593.5" y="54" font-size="11.5" font-weight="600" fill="#1d1d1f" text-anchor="middle">Programme leadership</text>
<line x1="86.5" y1="68" x2="86.5" y2="94" stroke="#5b5b66" stroke-width="1.2" marker-end="url(#cmp-arrow)"/>
<line x1="255.5" y1="68" x2="255.5" y2="94" stroke="#5b5b66" stroke-width="1.2" marker-end="url(#cmp-arrow)"/>
<line x1="424.5" y1="68" x2="424.5" y2="94" stroke="#5b5b66" stroke-width="1.2" marker-end="url(#cmp-arrow)"/>
<line x1="593.5" y1="68" x2="593.5" y2="94" stroke="#5b5b66" stroke-width="1.2" marker-end="url(#cmp-arrow)"/>
<rect x="10" y="96" width="660" height="58" rx="6" fill="#e8f0fb" stroke="#1f4e8c" stroke-width="1.5"/>
<text x="340" y="115" font-size="12" font-weight="700" fill="#1f4e8c" text-anchor="middle">Web client: React single-page app</text>
<text x="340" y="132" font-size="10.5" fill="#1d1d1f" text-anchor="middle">Student pages · Mentor pages · IIC pages · Insights page</text>
<text x="340" y="147" font-size="9.5" fill="#5b5b66" text-anchor="middle">App shell, routing and role guards · shared UI components · API client (mock data in Milestone 2)</text>
<line x1="340" y1="156" x2="340" y2="186" stroke="#5b5b66" stroke-width="1.2" marker-start="url(#cmp-arrow)" marker-end="url(#cmp-arrow)"/>
<text x="350" y="175" font-size="9.5" fill="#5b5b66">REST requests in JSON, with a token that carries the role</text>
<rect x="10" y="188" width="660" height="312" rx="6" fill="#f7f9fc" stroke="#1f4e8c" stroke-width="1.5"/>
<text x="24" y="206" font-size="12" font-weight="700" fill="#1f4e8c">REST API: one Flask application, one module per component</text>
<text x="24" y="226" font-size="9" font-weight="700" fill="#1f4e8c" letter-spacing="0.6">PEOPLE AND ACCESS</text>
<rect x="24" y="232" width="149" height="46" rx="4" fill="#fff" stroke="#1f4e8c" stroke-width="1.2"/>
<text x="98.5" y="251" font-size="10.5" font-weight="600" fill="#1d1d1f" text-anchor="middle">Identity and access</text>
<text x="98.5" y="268" font-size="9" fill="#5b5b66" text-anchor="middle">C1 · US&#8209;01, 14</text>
<rect x="185" y="232" width="149" height="46" rx="4" fill="#fff" stroke="#1f4e8c" stroke-width="1.2"/>
<text x="259.5" y="251" font-size="10.5" font-weight="600" fill="#1d1d1f" text-anchor="middle">Students and roster</text>
<text x="259.5" y="268" font-size="9" fill="#5b5b66" text-anchor="middle">C2 · US&#8209;02, 15</text>
<rect x="346" y="232" width="149" height="46" rx="4" fill="#fff" stroke="#1f4e8c" stroke-width="1.2"/>
<text x="420.5" y="251" font-size="10.5" font-weight="600" fill="#1d1d1f" text-anchor="middle">Mentor pool</text>
<text x="420.5" y="268" font-size="9" fill="#5b5b66" text-anchor="middle">C3 · US&#8209;10, 14, 18</text>
<rect x="507" y="232" width="149" height="46" rx="4" fill="#fff" stroke="#1f4e8c" stroke-width="1.2"/>
<text x="581.5" y="251" font-size="10.5" font-weight="600" fill="#1d1d1f" text-anchor="middle">Settings and tags</text>
<text x="581.5" y="268" font-size="9" fill="#5b5b66" text-anchor="middle">C4 · US&#8209;01, 03, 21</text>
<text x="24" y="298" font-size="9" font-weight="700" fill="#0f7a6c" letter-spacing="0.6">MATCHING AND CHANGES</text>
<rect x="24" y="304" width="149" height="46" rx="4" fill="#fff" stroke="#0f7a6c" stroke-width="1.2"/>
<text x="98.5" y="323" font-size="10.5" font-weight="600" fill="#1d1d1f" text-anchor="middle">Problem intake</text>
<text x="98.5" y="340" font-size="9" fill="#5b5b66" text-anchor="middle">C5 · US&#8209;03, 05, 16, 20</text>
<rect x="185" y="304" width="149" height="46" rx="4" fill="#fff" stroke="#0f7a6c" stroke-width="1.2"/>
<text x="259.5" y="323" font-size="10.5" font-weight="600" fill="#1d1d1f" text-anchor="middle">Recommendations</text>
<text x="259.5" y="340" font-size="9" fill="#5b5b66" text-anchor="middle">C6 · US&#8209;04</text>
<rect x="346" y="304" width="149" height="46" rx="4" fill="#fff" stroke="#0f7a6c" stroke-width="1.2"/>
<text x="420.5" y="323" font-size="10.5" font-weight="600" fill="#1d1d1f" text-anchor="middle">Mentorships</text>
<text x="420.5" y="340" font-size="9" fill="#5b5b66" text-anchor="middle">C7 · US&#8209;05, 06, 09, 13, 16</text>
<rect x="507" y="304" width="149" height="46" rx="4" fill="#fff" stroke="#0f7a6c" stroke-width="1.2"/>
<text x="581.5" y="323" font-size="10.5" font-weight="600" fill="#1d1d1f" text-anchor="middle">Cases</text>
<text x="581.5" y="340" font-size="9" fill="#5b5b66" text-anchor="middle">C8 · US&#8209;07, 18</text>
<text x="24" y="370" font-size="9" font-weight="700" fill="#b25e09" letter-spacing="0.6">TRACKING</text>
<text x="507" y="370" font-size="9" font-weight="700" fill="#6a3d9a" letter-spacing="0.6">INSIGHT</text>
<rect x="24" y="376" width="149" height="46" rx="4" fill="#fff" stroke="#b25e09" stroke-width="1.2"/>
<text x="98.5" y="395" font-size="10.5" font-weight="600" fill="#1d1d1f" text-anchor="middle">Sessions</text>
<text x="98.5" y="412" font-size="9" fill="#5b5b66" text-anchor="middle">C9 · US&#8209;11</text>
<rect x="185" y="376" width="149" height="46" rx="4" fill="#fff" stroke="#b25e09" stroke-width="1.2"/>
<text x="259.5" y="395" font-size="10.5" font-weight="600" fill="#1d1d1f" text-anchor="middle">Progress feedback</text>
<text x="259.5" y="412" font-size="9" fill="#5b5b66" text-anchor="middle">C10 · US&#8209;08, 12</text>
<rect x="346" y="376" width="149" height="46" rx="4" fill="#fff" stroke="#b25e09" stroke-width="1.2"/>
<text x="420.5" y="395" font-size="10.5" font-weight="600" fill="#1d1d1f" text-anchor="middle">Monitoring and alerts</text>
<text x="420.5" y="412" font-size="9" fill="#5b5b66" text-anchor="middle">C11 · US&#8209;17, 21</text>
<rect x="507" y="376" width="149" height="46" rx="4" fill="#fff" stroke="#6a3d9a" stroke-width="1.2"/>
<text x="581.5" y="395" font-size="10.5" font-weight="600" fill="#1d1d1f" text-anchor="middle">Programme insights</text>
<text x="581.5" y="412" font-size="9" fill="#5b5b66" text-anchor="middle">C12 · US&#8209;19</text>
<text x="24" y="442" font-size="9" font-weight="700" fill="#5b5b66" letter-spacing="0.6">SHARED SERVICES</text>
<rect x="24" y="448" width="310" height="38" rx="4" fill="#fff" stroke="#5b5b66" stroke-width="1.2"/>
<text x="179" y="464" font-size="10.5" font-weight="600" fill="#1d1d1f" text-anchor="middle">Notifications</text>
<text x="179" y="479" font-size="9" fill="#5b5b66" text-anchor="middle">C13 · email and dashboard notices, used by most components</text>
<rect x="346" y="448" width="310" height="38" rx="4" fill="#fff" stroke="#5b5b66" stroke-width="1.2"/>
<text x="501" y="464" font-size="10.5" font-weight="600" fill="#1d1d1f" text-anchor="middle">Audit log</text>
<text x="501" y="479" font-size="9" fill="#5b5b66" text-anchor="middle">C14 · who did what, when and why</text>
<line x1="124" y1="486" x2="124" y2="530" stroke="#5b5b66" stroke-width="1.2" marker-end="url(#cmp-arrow)"/>
<line x1="340" y1="502" x2="340" y2="530" stroke="#5b5b66" stroke-width="1.2" marker-start="url(#cmp-arrow)" marker-end="url(#cmp-arrow)"/>
<line x1="556" y1="532" x2="556" y2="503" stroke="#5b5b66" stroke-width="1.2" marker-end="url(#cmp-arrow)"/>
<text x="563" y="521" font-size="9" fill="#5b5b66">triggers C11</text>
<rect x="24" y="532" width="200" height="46" rx="5" fill="#fff" stroke="#5b5b66" stroke-dasharray="4 3"/>
<text x="124" y="551" font-size="10.5" font-weight="600" fill="#1d1d1f" text-anchor="middle">Email provider (SMTP)</text>
<text x="124" y="567" font-size="9" fill="#5b5b66" text-anchor="middle">links, alerts and reminders</text>
<rect x="240" y="532" width="200" height="46" rx="5" fill="#fff" stroke="#5b5b66" stroke-dasharray="4 3"/>
<text x="340" y="551" font-size="10.5" font-weight="600" fill="#1d1d1f" text-anchor="middle">Database</text>
<text x="340" y="567" font-size="9" fill="#5b5b66" text-anchor="middle">SQLite locally · PostgreSQL hosted</text>
<rect x="456" y="532" width="200" height="46" rx="5" fill="#fff" stroke="#5b5b66" stroke-dasharray="4 3"/>
<text x="556" y="551" font-size="10.5" font-weight="600" fill="#1d1d1f" text-anchor="middle">Scheduler (cron)</text>
<text x="556" y="567" font-size="9" fill="#5b5b66" text-anchor="middle">runs flask run-checks daily</text>
</svg>
</div>
<p class="cmp-caption">Figure 1. Components of the platform. Users reach the API only through the web client. Dashed boxes are systems outside our code, and the dashed line at the top marks conversations, which never pass through the platform. C1–C14 are described in Section 1.3.</p>

The design follows five rules:

1. **One application, split into modules.** The API is a single Flask application with one module per component (C1–C14). Each component owns its own tables and exposes its rules through its own functions. Other components call those functions instead of writing to its tables, so each rule lives in one place.
2. **Every rule is enforced by the API.** The web client only displays data and collects input. Access control, validation, capacity checks and status changes all happen in the API, where pytest can test them.
3. **Confidential by design.** Mentoring conversations happen on Google Meet, email or phone. No component has a field for what was said (Milestone 1 report, Section 4, item 4).
4. **Predictable results.** Recommendations follow a fixed ranking rule. The timed checks take the current time as an input, so a test or a demo can run them "as of" any moment.
5. **Changeable without code.** Approved email domains, topic tags and every timing window live in one place (C4), where IIC can change them.

### 1.2 Components at a glance

| # | Component | Main responsibility | Module | Stories | Sprint |
|---|---|---|---|---|---|
| C1 | Identity and access | Sign-up, email verification, mentor activation, login and role checks | auth | US-01, US-14 | 1 |
| C2 | Students and roster | IIC's roster of registered students and each student's profile | students | US-02, US-15 | 1 |
| C3 | Mentor pool | Verified mentors, their expertise, availability and capacity | mentors | US-10, US-14, US-18 | 1 |
| C4 | Settings and tags | Topic-tag list, approved email domains and timing windows | settings | US-01, US-03, US-21 | 1–2 |
| C5 | Problem intake | Students' problems, their status, and IIC's queue | problems | US-03, US-05, US-16, US-20 | 1–2 |
| C6 | Recommendations | Up to 4 ranked mentors for a problem, with reasons | matching | US-04 | 1 |
| C7 | Mentorships | Assignment, accept or decline, goal, next steps and ending | mentorships | US-05, US-06, US-09, US-13, US-16 | 1–2 |
| C8 | Cases | Change, end and misconduct cases, decided by IIC | cases | US-07, US-18 | 2 |
| C9 | Sessions | Scheduled and logged sessions, with no content | sessions | US-11 | 2 |
| C10 | Progress feedback | Progress status from student and mentor, seen only by IIC | feedback | US-08, US-12 | 2 |
| C11 | Monitoring and alerts | IIC's monitoring view and the daily escalation checks | monitoring | US-17, US-21 | 2 |
| C12 | Programme insights | Aggregate demand, supply and outcome figures | insights | US-19 | 2 |
| C13 | Notifications | Email and dashboard notices for every event | notifications | Most stories | 1–2 |
| C14 | Audit log | Permanent record of decisions and status changes | audit | US-14, US-18 | 1–2 |

The module names are the folders under backend/app in the code. Sprint 1 is Milestone 3 and Sprint 2 is Milestone 4.

<div class="page-break"></div>

### 1.3 Backend components

<div class="cmp-detail">

#### C1 Identity and access

Lets people in, and decides what each person may do. There are four roles: student, mentor, IIC coordinator and programme leadership.

| | |
|---|---|
| Responsibilities | Student self sign-up with an institute email and roll number. Checks the email domain against C4 and the roll number against IIC's roster in C2, then sends a one-time verification link valid for 24 hours. Activates a mentor's account from the link IIC sends after verifying them (valid for 7 days). Login and logout with a token that carries the user's role. Provides the role and ownership checks that every other component uses. |
| Data it owns | User accounts: email, role, account status and a hashed password. Verification and activation links are signed and time-limited, so they are not stored. |
| Main operations | Sign up · Verify email · Activate mentor account · Log in · Log out · Get the current user |
| Rules it enforces | An email outside the approved domains is rejected and nothing is stored. No account is active until its link is used. One account per roll number, and no account for a roll number that is not on the roster. Calls without a valid token get 401; calls from the wrong role get 403. |
| Works with | C2 (roster), C3 (mentor activation), C4 (approved domains), C13 (sends the links) |
| Pages | Sign-up, login and account activation; the route guards in the app shell |

#### C2 Students and roster

Holds who may join the programme (IIC's roster) and what we know about each student.

| | |
|---|---|
| Responsibilities | IIC imports the roster from a CSV file, or adds and removes one student at a time. Each CSV row is validated: invalid rows are reported with row number and reason, and re-importing a roll number updates the record instead of duplicating it. Stores the student profile: level (BSc or BS), CGPA, completed courses and career interest. Tells C5 whether a student's profile is complete and whether they are still on the roster. |
| Data it owns | Roster entries (name, roll number, institute email); student profiles |
| Main operations | Import roster · Add or remove a roster entry · List the roster · View or update own profile |
| Rules it enforces | Name and roll number come from the roster and cannot be edited. Level accepts only BSc or BS, and CGPA must be between 0 and 10. A student removed from the roster cannot sign up or submit a new problem. CGPA is shown to IIC, not to mentors. Only IIC can change the roster. |
| Works with | C1 (sign-up check), C5 (profile complete), C14 (records imports) |
| Pages | IIC registered-students page; student profile page |

#### C3 Mentor pool

Holds the verified volunteer mentors and when they can help.

| | |
|---|---|
| Responsibilities | IIC adds mentors one at a time or from a CSV file; each starts as *Pending verification*. IIC verifies each mentor, which records who verified them and when, and triggers an activation email. Stores the mentor profile: expertise tags, experience entries (type, title and duration), mentoring style, preferred contact channel and time zone. Mentors set their availability; capacity starts at 1 and rises by 1 each time a mentor agrees to take an extra student. A mentor is removed only after an IIC decision in C8. |
| Data it owns | Mentor profiles, expertise tags, experience entries, verification record, availability and capacity |
| Main operations | Add mentor · Import mentors · Verify mentor · Resend activation link · Update own availability, channel and time zone · Accept an extra student · Remove mentor (called by C8) |
| Rules it enforces | A mentor is eligible for recommendation and assignment only when verified, activated, available, below capacity and not removed. Re-importing an email updates the existing profile. Unverified mentors are never visible to students. Only IIC can add, import, verify or remove mentors. |
| Works with | C1 (activation), C4 (topic tags), C6 and C7 (eligibility), C13, C14 |
| Pages | IIC mentor-pool page; mentor availability and contact settings |

#### C4 Settings and tags

Holds the values IIC can change without a code change.

| | |
|---|---|
| Responsibilities | The topic-tag list, used both for students' problems and for mentors' expertise; the 30-tag draft list is seed data that IIC reviews before launch. The approved email domains (@ds.study.iitm.ac.in to start with). The timing windows: reminder at 48 hours and response window of 72 hours; 7 and 10 days to a first session; 14 days to *Inactive*; 7 more days to *Reassignment needed*; a feedback checkpoint every 2 weeks; *Feedback overdue* after 7 days. The default mentor capacity of 1. |
| Data it owns | Topic tags; setting values |
| Main operations | List topic tags · Add, rename or retire a tag · View or change a setting |
| Rules it enforces | Only IIC can make changes, and each change is recorded in C14. A changed window applies from the next run of the daily checks. A tag is retired rather than deleted, so past problems and the insights report keep their topics. |
| Works with | C1 (domains), C3 and C5 (tags), C10 and C11 (windows), C12 (topics), C14 |
| Pages | Topic-tag pickers on the problem and mentor forms; IIC settings page |

#### C5 Problem intake

Takes in each student's problem and tracks it until a mentor accepts it or IIC closes it.

| | |
|---|---|
| Responsibilities | The problem form: a description of 30–1000 characters, 1–5 topic tags from the list in C4, an optional desired outcome and optional guidance preferences (US-20). The student can edit or withdraw it until a mentor is assigned. IIC's queue lists problems oldest first, with *Reassignment needed* problems at the top. Opening a problem sets it *Under review*. IIC can close a problem with a reason, for example when it is out of scope. The student sees the status at every step and is notified of each change. |
| Data it owns | Problems: description, tags, desired outcome, guidance preferences, status and timestamps |
| Main operations | Submit · Edit · Withdraw · View my problem's status · List the queue · Open for review · Close with a reason |
| Rules it enforces | The student's profile must be complete. One open problem per student, and none while the student has an active mentorship. A problem is never visible to a mentor before it is assigned to them. Guidance preferences are shown only to IIC. |
| Works with | C2 (profile and roster check), C4 (tags), C6 (recommendations), C7 (assignment), C13, C14 |
| Pages | Student problem form and dashboard; IIC problem queue |

#### C6 Recommendations

Suggests up to four suitable mentors for a problem and shows why.

| | |
|---|---|
| Responsibilities | Takes the eligible mentors from C3 and ranks them by the number of topic tags they share with the problem (most first), then by fewest active mentees, then by mentor ID so the order never changes between runs. Returns the top 4, each with the shared tags, availability and active mentees against capacity. If no eligible mentor shares a tag, it returns an empty list and IIC browses all eligible mentors instead. |
| Data it owns | None. Every result is calculated from C3, C5 and C7 when it is requested, so each test case has exactly one correct answer. |
| Main operations | Recommend mentors for a problem · List all eligible mentors |
| Rules it enforces | Unverified, unavailable, at-capacity or removed mentors never appear. No machine learning. Recommendations are shown only to IIC, never to mentors or students. |
| Works with | C3 (eligible mentors and expertise), C5 (problem tags), C7 (active mentee counts) |
| Pages | IIC assignment page |

#### C7 Mentorships

Turns IIC's choice into a working pairing and keeps its record until it ends.

| | |
|---|---|
| Responsibilities | **Assignment:** IIC assigns a recommended or any other eligible mentor. This checks capacity, raises the mentor's active count by 1, and sends the mentor the student's level, completed courses, career interest, topic tags and problem. **Response:** the mentor accepts or declines within 72 hours; a decline needs a reason, frees capacity and returns the problem to IIC's queue. **Start:** on acceptance the mentorship becomes active and the student receives the mentor's expertise, experience, preferred channel, availability, time zone and contact details, plus an editable first-message template. The student marks "I have reached out", which records the date. **Progress:** a goal for the mentorship and next steps, each open or done with a completion date. **End:** the mentor can end the mentorship with a reason, which frees capacity; IIC can end or reassign it after a decision in C8. |
| Data it owns | Assignments (problem, mentor, who assigned and when, response and reason); mentorships (start date, goal, date the student reached out, status, end reason); next steps |
| Main operations | Assign a mentor · Accept or decline · View my mentorship · Set the goal · Add or complete a next step · Mark "I have reached out" · End the mentorship |
| Rules it enforces | An assignment beyond the mentor's capacity is blocked. A student has at most one active mentorship. Contact details appear only after acceptance and only to the mentee. Only the two participants and IIC can see a mentorship. The platform never sends the first message for the student. |
| Works with | C3 (capacity), C5 (problem status), C6 (recommendations), C8 (decisions), C9 and C10 (activity), C13, C14 |
| Pages | IIC assignment page; mentor dashboard; mentorship workspace; mentor card on the student dashboard |

#### C8 Cases

Handles requests to change or end a mentorship, and concerns about misconduct, fairly.

| | |
|---|---|
| Responsibilities | A student opens a change or end request with written feedback. A student or mentor can raise a concern. While a case is open, the mentorship stays active. IIC records the other party's side, then decides: no change, reassign, end the mentorship or remove the mentor. On reassignment, the student's problem returns to IIC's queue. On removal, C3 removes the mentor and C7 ends their mentorships. Both parties are told the outcome. |
| Data it owns | Cases: type, who raised it, their submission, the other party's response, status, decision, reason, who decided and when |
| Main operations | Open a case · Record the other party's response · Decide · View the outcome of my case |
| Rules it enforces | Feedback in a change or end request is at least 30 characters. A concern never removes a mentor automatically. Every decision needs a reason, and the outcome, coordinator and time are recorded in C14. A removed mentor is never recommended or assigned again. |
| Works with | C3, C5, C7, C13, C14 |
| Pages | Student change or end request form; IIC case page |

#### C9 Sessions

Records when mentor and student meet, without recording what was said.

| | |
|---|---|
| Responsibilities | Either participant schedules a session with a date and time, a channel (Google Meet, phone, email or other) and an optional meeting link. Afterwards, either marks it held, with a duration and topic category, or cancelled. A session that was not scheduled first can be logged afterwards. The other participant confirms a held session, and IIC sees both logged and confirmed counts. An optional private note is visible only to the person who wrote it. Reminders 24 hours before a session are sent by the daily checks in C11. |
| Data it owns | Sessions: mentorship, planned time, channel, link, status, duration, topic category, who logged it, who confirmed it, private note |
| Main operations | Schedule a session · Mark held or cancelled · Log a past session · Confirm a session · List a mentorship's sessions |
| Rules it enforces | A planned session must be in the future, and a held session cannot be dated in the future. Duration is 5–240 minutes. There is no field for conversation content. Only the participants can create or change sessions; IIC sees counts and dates, never private notes. |
| Works with | C7 (participants), C11 (counts, last session, reminders) |
| Pages | Mentorship workspace |

#### C10 Progress feedback

Tells IIC whether a mentorship is helping, from both sides, without any ratings.

| | |
|---|---|
| Responsibilities | The student gives a progress status (no progress, some progress or goal met) with a comment at a checkpoint or at the end. The mentor gives a progress status with an optional comment at each checkpoint, every 2 weeks by default. Records when each checkpoint falls due, so C11 can send reminders and flag *Feedback overdue*. |
| Data it owns | Feedback entries: mentorship, author's role, progress status, comment and time |
| Main operations | Submit feedback · List a mentorship's feedback |
| Rules it enforces | Only the three progress values are accepted, and no form has a rating. Feedback is time-stamped and visible only to IIC. |
| Works with | C4 (checkpoint interval), C7 (participants), C11 (reminders and flags), C12 (outcomes) |
| Pages | Feedback forms in the mentorship workspace; IIC monitoring and case pages |

#### C11 Monitoring and alerts

Gives IIC one view of every mentorship and makes sure nothing stalls unnoticed.

| | |
|---|---|
| Responsibilities | **Monitoring view:** every active mentorship with student, mentor, start date, logged and confirmed sessions, last session date, latest progress status and flags, with a filter by flag. **Daily checks**, started by the scheduler: a reminder to the mentor 48 hours after an assignment; at 72 hours without a response the assignment expires, the mentor's capacity is freed, the problem returns to the top of IIC's queue as *Reassignment needed*, and the student sees "IIC is finding you another mentor". After acceptance, reminders to both sides at 7 days without a held session and a *First session overdue* flag at 10 days. *Inactive* after 14 days without a held session, and *Reassignment needed* 7 days after that. Feedback checkpoint reminders and *Feedback overdue* after 7 days. Reminders 24 hours before each planned session. |
| Data it owns | Flags on assignments and mentorships (type, raised and cleared times); a record of reminders sent |
| Main operations | View the monitoring table · Filter by flag · Run the daily checks (by the scheduler, or with a chosen time for tests and demos) |
| Rules it enforces | Every window comes from C4. Each reminder is sent once, so running the checks twice changes nothing. No conversation content or private notes appear in the view. |
| Works with | C4, C5, C7, C9, C10, C13, C14 |
| Pages | IIC monitoring page; alerts at the top of IIC's problem queue |

#### C12 Programme insights

Gives programme leadership the figures to plan recruitment and judge whether the programme works.

| | |
|---|---|
| Responsibilities | For a chosen date range: for each topic, the number of problems submitted, mentors available and problems still unassigned; the median time from problem submission to assignment; the number of active mentorships; and the outcomes of ended mentorships by final progress status. The report can be exported as CSV. |
| Data it owns | None. All figures are aggregates calculated from C3, C5, C7 and C10. |
| Main operations | Get the report for a date range · Export it as CSV |
| Rules it enforces | Only aggregates are shown or exported: no names or contact details. Available to the programme leadership role. |
| Works with | C3, C4 (topics), C5, C7, C10 |
| Pages | Programme insights dashboard |

#### C13 Notifications

Tells people what has happened and what they need to do.

| | |
|---|---|
| Responsibilities | Sends an email and creates a dashboard notice for each event: verification and activation links; every change to a problem's status; a new assignment; a mentor's acceptance with their details; declines and reassignments; reminders (48 hours, first session, 24 hours before a session, feedback checkpoints); case outcomes; and a mentorship ending. Each event has one template. Emails go through the SMTP provider; in development they are printed, and in tests they are captured so tests can check them. |
| Data it owns | Dashboard notices: recipient, type, link, read or unread, time |
| Main operations | List my notices · Mark a notice as read. Other components send notifications through it. |
| Rules it enforces | No notification contains conversation content. A notice is shown only to its recipient. |
| Works with | Every component that changes something a person needs to know; the email provider |
| Pages | Notice list in the app shell |

#### C14 Audit log

Keeps a permanent record of important decisions and status changes.

| | |
|---|---|
| Responsibilities | Adds an entry (who, what, when, which record and why) for roster and mentor imports, mentor verification, assignments, declines, closures, case decisions, mentor removal, mentorship endings, settings changes and the automatic escalations from C11. |
| Data it owns | Audit entries, which are only ever added |
| Main operations | Record an entry (called by other components) · View a record's history |
| Rules it enforces | Entries are never edited or deleted. Entries never contain conversation content. Only IIC can view the history. |
| Works with | C2, C3, C4, C5, C7, C8, C11 |
| Pages | History panel on the IIC case and monitoring pages |

</div>

<div class="page-break"></div>

### 1.4 Web client components

The web client is a React single-page app. Pages are grouped by role, and each group only appears to users with that role.

| # | Component | What it contains | Uses | Jira tasks |
|---|---|---|---|---|
| F1 | App shell and routing | Shared layout; navigation for each role; protected routes that send users without the right role back to login; the logged-in user and role; the notice list | C1, C13 | SCRUM-56 |
| F2 | Student pages | Sign-up, login and profile; the problem form; the dashboard with the status tracker and assigned-mentor card; the student's view of the mentorship workspace; the change or end request form | C1, C2, C5, C7, C8, C9, C10 | SCRUM-57, SCRUM-58, SCRUM-59, SCRUM-61 |
| F3 | Mentor pages | Dashboard with assignments to accept or decline; availability, contact and capacity settings; the mentor's view of the mentorship workspace; the end-mentorship dialog | C3, C7, C9, C10 | SCRUM-60, SCRUM-61 |
| F4 | IIC pages | Registered students with CSV import; the mentor pool with add, CSV import and verify; the problem queue; the assignment page with recommendations; the monitoring table; the case page; settings and topic tags | C2–C8, C11, C14 | SCRUM-62, SCRUM-63 |
| F5 | Insights page | Date-range picker, demand against supply by topic, median time to assignment, active mentorships, outcomes and CSV export | C12 | SCRUM-64 |
| F6 | API client | One file per backend component. In Milestone 2 it returns mock data in the same shape as the API, so pages need no changes when it switches to real requests in Milestone 3 | All | SCRUM-56, SCRUM-75 |

Several pages share the same building blocks, which are built once:

| Shared UI component | Used for |
|---|---|
| Status badge | Problem, assignment, mentorship, session and case statuses, and monitoring flags |
| Data table with filters | Roster, mentor pool, problem queue and monitoring table |
| CSV upload with row-error report | Roster and mentor imports |
| Reason dialog | Every action that needs a reason: decline, close, end, decide |
| Topic-tag picker | Problem form (1–5 tags) and mentor expertise |
| Form fields with validation messages | Every form; the API repeats every check |

### 1.5 Systems outside our code

| System | What it does | Notes |
|---|---|---|
| Database | Stores every component's data | SQLite for development and tests, so the project runs without a database server; PostgreSQL for the hosted demo |
| Email provider | Delivers the emails from C13 over SMTP | Needed only for the hosted demo; the provider will be chosen with hosting |
| Scheduler | Runs the daily checks in C11 | A cron job that runs the flask run-checks command |
| Google Meet, email, phone | Where mentoring conversations happen | Not connected to the platform. Students and mentors use the channel the mentor prefers. |

<div class="page-break"></div>

### 1.6 How the components work together

**Getting a mentor (Sprint 1)**

1. IIC loads the roster into C2 and adds mentors to C3, then verifies each mentor. C13 emails each mentor an activation link, and C14 records each verification.
2. A student signs up. C1 checks the email domain with C4 and the roll number with C2, then sends a verification link through C13. The student completes their profile in C2.
3. The student submits a problem in C5. It is saved as *Submitted* and appears in IIC's queue.
4. IIC opens the problem, which sets it *Under review*. C6 shows up to four ranked mentors with their shared tags and current load.
5. IIC assigns a mentor in C7. The capacity check passes, the problem becomes *Awaiting mentor*, and C13 notifies the mentor.
6. The mentor accepts in C7. The problem becomes *Mentor assigned*, and the student receives the mentor's details and a first-message template. If the mentor declines, the problem goes back to IIC's queue.
7. The student contacts the mentor on the mentor's preferred channel, outside the platform, and marks "I have reached out".

**Tracking a mentorship (Sprint 2)**

1. Student and mentor record a goal and next steps in C7.
2. They schedule and log sessions in C9. C11 sends reminders through C13 24 hours before each session.
3. At each checkpoint, both give progress feedback in C10.
4. Each week, IIC reviews the monitoring view in C11, which shows session counts, the latest progress and any flags.

**When something stalls (Sprint 2)**

1. Every day, the scheduler starts the checks in C11, which read the windows from C4.
2. An assignment with no response after 48 hours triggers a reminder. After 72 hours, C7 expires the assignment and frees the mentor's capacity, and C5 moves the problem to the top of IIC's queue as *Reassignment needed*.
3. A mentorship with no held session for 14 days is flagged *Inactive*; 7 days later it becomes *Reassignment needed*.
4. Every escalation is recorded in C14, and the people involved are told through C13.

**Changing or ending a mentorship (Sprint 2)**

1. A student asks to change or end the mentorship, or someone raises a concern. C8 opens a case, and the mentorship stays active.
2. IIC records the other side and decides, with a reason. C14 records the decision.
3. If the decision is to reassign, the problem returns to IIC's queue in C5. If it is to remove the mentor, C3 removes them and C7 ends their mentorships. Both parties are notified through C13.
4. A mentor can also end a mentorship directly in C7, giving a reason. This frees their capacity, and if they are no longer available the student is listed for reassignment.

### 1.7 Statuses each component owns

Each status belongs to one component, and only that component changes it.

| Record | Owner | Statuses |
|---|---|---|
| Mentor | C3 | *Pending verification* → *Verified* (activation link sent) → *Active*; or *Removed*. Availability is a separate setting. |
| Problem | C5 | *Submitted*, *Under review*, *Awaiting mentor*, *Mentor assigned*, *Reassignment needed*, *Closed by IIC* (with a reason), *Withdrawn* |
| Assignment | C7 | *Awaiting response* → *Accepted*, *Declined* or *Expired* (after 72 hours) |
| Mentorship | C7 | *Active* → *Ended by mentor* or *Ended by IIC* |
| Session | C9 | *Planned* → *Held* or *Cancelled*; a held session can be confirmed by the other participant |
| Case | C8 | *Under review* → *Decided* |
| Flags | C11 | *First session overdue*, *Inactive*, *Feedback overdue*, *Reassignment needed* |

### 1.8 Traceability: user stories to components

Every user story is served by at least one component, and every component serves at least one story.

| Story | Main component | Also uses |
|---|---|---|
| US-01 Sign up, checked against IIC's roster | C1 | C2, C4, C13 |
| US-02 Complete my basic profile | C2 | C1 |
| US-03 Submit the problem I need help with | C5 | C2, C4, C13 |
| US-04 See 3–4 recommended mentors | C6 | C3, C5, C7 |
| US-05 Track my request and reach out to my mentor | C5 | C7, C13 |
| US-06 Keep track of our goal and next steps | C7 | C9 |
| US-07 Ask to change or end my mentorship | C8 | C5, C7, C13 |
| US-08 Give feedback on my mentorship | C10 | C7 |
| US-09 Accept or decline assigned students | C7 | C11, C13 |
| US-10 Set availability, contact preference and capacity | C3 | C6, C7 |
| US-11 Schedule and log sessions | C9 | C11, C13 |
| US-12 Send progress feedback on my mentee | C10 | C4, C11, C13 |
| US-13 End a mentorship from my side | C7 | C3, C13, C14 |
| US-14 Add and verify mentors | C3 | C1, C13, C14 |
| US-15 Keep the roster up to date | C2 | C14 |
| US-16 Assign a mentor to each problem | C7 | C5, C6, C13, C14 |
| US-17 Monitor active mentorships | C11 | C9, C10 |
| US-18 Resolve change, termination and misconduct cases | C8 | C3, C7, C14 |
| US-19 See demand, supply and outcomes | C12 | C3, C5, C7, C10 |
| US-20 Say how I like to be guided | C5 | C3, C6 |
| US-21 Stop assignments and mentorships from stalling | C11 | C4, C5, C7, C13, C14 |

<div class="page-break"></div>
