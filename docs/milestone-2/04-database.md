<div class="landscape">

## Section 3: Database Design

The ER diagram shows the 22 tables of the database, their columns and keys, and the relationships between them. Each table belongs to one backend module (Section 1.2), and only that module writes to it.

<div class="diagram"><img src="../images/er-diagram.png" alt="ER diagram of the mentoring platform database"></div>
<p class="fig-caption">Figure 3.1. ER diagram in crow's-foot notation. PK is a primary key, FK a foreign key and UK a unique key. On the lines, || is exactly one, |o is zero or one, and o{ is zero or more.</p>

</div>

### 3.1 Tables

#### Accounts and access

| Table | What it stores | Keys and constraints | Module |
|---|---|---|---|
| USER | One row per account: email, password hash, when the email was verified, the email domain and when the account was created | id PK; email UK; email_domain_id FK to EMAIL_DOMAIN | auth |
| ROLE | The roles a user can hold, such as student, mentor or IIC coordinator | id PK; name UK | auth |
| USER_ROLE | Which user holds which role | (user_id, role_id) composite PK, each an FK | auth |
| EMAIL_VERIFICATION | Hashed verification tokens, with when each expires and when it was used | id PK; user_id FK; token_hash UK | auth |
| EMAIL_DOMAIN | The email domains allowed to register, and whether each is enabled | id PK; domain UK | settings |

#### Students and mentors

| Table | What it stores | Keys and constraints | Module |
|---|---|---|---|
| STUDENT | A student's profile: student number, name, programme and cohort | id PK; user_id FK and UK (one profile per user); student_number UK | students |
| MENTOR | A mentor's profile: name, biography and verification status | id PK; user_id FK and UK (one profile per user) | mentors |
| AVAILABILITY | The time slots a mentor offers, with their time zone | id PK; mentor_id FK | mentors |
| MENTOR_TAG | A mentor's areas of expertise | (mentor_id, topic_tag_id) composite PK, each an FK | mentors |

#### Problems and matching

| Table | What it stores | Keys and constraints | Module |
|---|---|---|---|
| TOPIC_TAG | The topic list shared by problems and mentor expertise | id PK; name UK | settings |
| PROBLEM | A student's problem: title, description, status, when it was submitted and closed, and why it was closed | id PK; student_id FK | problems |
| PROBLEM_TAG | The topic tags on each problem | (problem_id, topic_tag_id) composite PK, each an FK | problems |
| RECOMMENDATION | A mentor suggested for a problem, with a score and when it was generated | id PK; problem_id FK; mentor_id FK | matching |

#### Mentorships

| Table | What it stores | Keys and constraints | Module |
|---|---|---|---|
| MENTORSHIP | A mentor assigned to a problem: status, goal, next steps, and when it was assigned, answered and ended | id PK; problem_id FK; mentor_id FK | mentorships |
| SESSION | A session: when it was planned and held, its status and notes | id PK; mentorship_id FK | sessions |
| FEEDBACK | Feedback on a mentorship, with its author, rating, comments and time | id PK; mentorship_id FK; author_user_id FK | feedback |
| CASE_RECORD | A change, end or misconduct case: type, status, details, resolution, and when it was opened and resolved | id PK; mentorship_id FK; reporter_user_id FK | cases |

#### Monitoring, notifications and audit

| Table | What it stores | Keys and constraints | Module |
|---|---|---|---|
| TIMING_WINDOW | Each timing rule: its name, length in hours, and whether it is enabled | id PK; rule_name UK | settings |
| MONITORING_FLAG | A problem detected on a mentorship, such as *Inactive*: type, status, when it was raised and resolved | id PK; mentorship_id FK; timing_window_id FK | monitoring |
| EMAIL_TEMPLATE | One subject and body for each kind of email | id PK; template_key UK | notifications |
| NOTIFICATION | Each email sent to a user: template, status, and when it was queued and sent | id PK; recipient_user_id FK; email_template_id FK | notifications |
| AUDIT_LOG | Who did what to which record, and when | id PK; actor_user_id FK (empty for automatic actions) | audit |

Programme insights (C12) have no tables of their own. Their figures are calculated from PROBLEM, MENTOR, MENTORSHIP and FEEDBACK.

### 3.2 Relationships

| Parent | Child | Cardinality | Meaning |
|---|---|---|---|
| EMAIL_DOMAIN | USER | Zero or one to many | An account may be linked to the domain that allowed it to register |
| USER | USER_ROLE | One to many | A user can hold several roles |
| ROLE | USER_ROLE | One to many | A role is granted to many users |
| USER | EMAIL_VERIFICATION | One to many | A user can request several verification links |
| USER | STUDENT, MENTOR | One to zero or one | A user has at most one student profile and at most one mentor profile |
| STUDENT | PROBLEM | One to many | A student can submit many problems over time |
| MENTOR | AVAILABILITY | One to many | A mentor declares many time slots |
| PROBLEM, MENTOR | PROBLEM_TAG, MENTOR_TAG | Many to many, through the link tables | Tags categorise problems and describe mentor expertise |
| PROBLEM, MENTOR | RECOMMENDATION | One to many each | A recommendation links one problem to one mentor |
| PROBLEM, MENTOR | MENTORSHIP | One to many each | A mentorship links one problem to one mentor; a problem can have several over time, for example after a reassignment |
| MENTORSHIP | SESSION, FEEDBACK, CASE_RECORD, MONITORING_FLAG | One to many each | Everything that happens in a mentorship points back to it |
| USER | FEEDBACK, CASE_RECORD | One to many | The author of feedback and the reporter of a case |
| TIMING_WINDOW | MONITORING_FLAG | Zero or one to many | A flag can name the timing rule that raised it |
| USER | NOTIFICATION | One to many | Each notification has one recipient |
| EMAIL_TEMPLATE | NOTIFICATION | One to many | Each notification uses one template |
| USER | AUDIT_LOG | Zero or one to many | An entry with no user is an automatic action |

### 3.3 Design notes

- **No duplicate data.** MENTORSHIP has no student_id: the student is found through its problem. Problem tags and mentor expertise share one TOPIC_TAG list, which keeps matching consistent.
- **IIC's queue is a status, not a table.** The queue lists the problems in the statuses that need IIC (Section 1.7).
- **The audit log points at any record.** AUDIT_LOG names the record by entity_type and entity_id instead of a foreign key, so one table can record actions on every other table. Rows are only ever added (C14).
- **Rules the tables cannot express are enforced by the API.** Examples: at most one active mentorship per student, and only participants may give feedback. The daily timed checks are application code in C11; the tables only store their settings (TIMING_WINDOW) and results (MONITORING_FLAG).
