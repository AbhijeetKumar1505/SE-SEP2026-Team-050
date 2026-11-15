<style>
.cls-table table { font-size: 9pt; }
.cls-table td:nth-child(1) { width: 14%; font-weight: 600; }
.cls-table td:nth-child(2) { width: 24%; }
.cls-table td:nth-child(3) { width: 24%; }
.cls-table td:nth-child(4) { width: 28%; }
</style>

<div class="landscape">

## Section 2: Class Diagram

The class diagram shows the main classes of the platform, the data and operations each one holds, and how they relate. It follows the workflow in Section 1.6: a student submits a problem, a mentor accepts it, and the mentorship that follows holds meetings, next steps and feedback. Cases, notifications and the audit log support it throughout.

<div class="diagram"><img src="../images/class-diagram.png" alt="UML class diagram of the mentoring platform"></div>
<p class="fig-caption">Figure 2.1. Class diagram. Hollow triangles are inheritance, filled diamonds are composition, solid lines are associations and dotted arrows are dependencies. Yellow notes are rules the diagram cannot show with lines alone.</p>

</div>

### 2.1 Classes

<div class="cls-table">

| Class | What it represents | Main attributes | Operations | Component |
|---|---|---|---|---|
| User (abstract) | The account every person signs in with | id, name, email, passwordHash (private), emailVerifiedAt | login(), verifyEmail(token) | C1 |
| Student | A registered IITM BS student | Inherited from User | submitProblem(title, description), requestMatch(problem) | C1, C5 |
| Mentor | A volunteer mentor | verificationStatus | respondToRequest(request, decision), updateAvailability() | C3, C7 |
| IICCoordinator | An IIC staff member who runs the programme | Inherited from User | reviewProblem(problem), verifyMentor(mentor), resolveCase(caseRecord) | C3, C5, C8 |
| ProgrammeManager | Programme leadership | Inherited from User | viewInsights(), configureTimingWindows() | C12 |
| StudentProfile | What the platform knows about a student | studentNumber, programme, cohort | updateProfile() | C2 |
| MentorProfile | A mentor's public profile | biography, organisation, availabilitySummary | updateProfile() | C3 |
| Experience | One entry in a mentor's work history | title, organisation, startDate, endDate | — | C3 |
| TopicTag | A subject used for problems and for mentor expertise | id, name | — | C4 |
| Problem | The help a student asks for | title, description, status, submittedAt | submit(), close(reason) | C5 |
| MatchRequest | A request to one mentor to take on a problem | status, requestedAt, respondedAt | accept() returns a Mentorship, decline(reason) | C7 |
| Mentorship | The working pairing of a student and a mentor | status, goal, startedAt, endedAt | setGoal(goal), end(reason) | C7 |
| Meeting | A mentoring session | scheduledAt, completedAt, status, notes | reschedule(dateTime), logSession(notes) | C9 |
| NextStep | An action the pair agreed on | description, dueDate, status | markComplete() | C7 |
| ProgressFeedback | Feedback on how a mentorship is going | rating, comments, submittedAt | submit() | C10 |
| Case | A change, end or misconduct case about a mentorship | type, status, details, resolution | open(), resolve(resolution) | C8 |
| Notification | A message to one user | subject, body, status, sentAt | send(), retry() | C13 |
| AuditLog | A permanent record of one action | action, entityType, entityId, createdAt | — | C14 |

</div>

### 2.2 Relationships

**Inheritance.** Student, Mentor, IICCoordinator and ProgrammeManager are each a User. They share its account data, login and email verification, and add the operations of their role.

**Composition.** A part cannot exist without its owner and is removed with it.

| Owner | Part | Multiplicity |
|---|---|---|
| Student | StudentProfile | Each student owns exactly one profile |
| Mentor | MentorProfile | Each mentor owns exactly one profile |
| MentorProfile | Experience | A profile contains zero or more entries; each entry belongs to one profile |
| Mentorship | Meeting | A mentorship includes zero or more meetings; each meeting belongs to one mentorship |
| Mentorship | NextStep | A mentorship contains zero or more next steps; each belongs to one mentorship |

**Associations.**

| From | Relationship | To | Multiplicity |
|---|---|---|---|
| Student | submits | Problem | 1 student to 0..* problems |
| IICCoordinator | reviews | Problem | 0..1 coordinator to 0..* problems |
| IICCoordinator | verifies | Mentor | 0..1 coordinator to 0..* mentors |
| Problem | categorised by | TopicTag | 0..* to 0..* |
| MentorProfile | expertise | TopicTag | 0..* to 0..* |
| Student | initiates | MatchRequest | 1 student to 0..* requests |
| MatchRequest | concerns | Problem | 0..* requests to 1 problem |
| Mentor | receives | MatchRequest | 1 mentor to 0..* requests |
| MatchRequest | creates on acceptance | Mentorship | 1 request to 0..1 mentorship |
| Student | participates in | Mentorship | 1 student to 0..* mentorships |
| Mentor | guides | Mentorship | 1 mentor to 0..* mentorships |
| Problem | addressed by | Mentorship | 1 problem to 0..* mentorships |
| User | responsible for | NextStep | 1 user to 0..* next steps |
| Mentorship | receives | ProgressFeedback | 1 mentorship to 0..* entries |
| User | authors | ProgressFeedback | 1 user to 0..* entries |
| Case | concerns | Mentorship | 0..* cases to 1 mentorship |
| User | reports | Case | 1 user to 0..* cases |
| IICCoordinator | handles | Case | 0..1 coordinator to 0..* cases |
| User | receives | Notification | 1 user to 0..* notifications |
| User | actor | AuditLog | 0..1 user to 0..* entries; an entry with no user is an automatic action |

**Dependencies.** ProgrammeManager uses Mentorship (monitors outcomes) and ProgressFeedback (analyses it) but owns neither. Programme insights are calculated from these records, as in C12.

### 2.3 Rules shown as notes

- Each match request goes to one mentor, and accepting it creates at most one mentorship.
- The student in a mentorship must own the linked problem, and the participants must be the ones in the accepted request.
- Only a student or mentor taking part in a mentorship can author its feedback.
- A case is one of three types: change, end or misconduct.

The API enforces each of these rules (Section 1.1, rule 2).
