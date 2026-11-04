<div class="page-break"></div>

## Section 5: Scrum Meetings Schedule and Minutes

### 5.1 Meeting schedule

| Meeting | When | Length | Who | Purpose |
|---|---|---|---|---|
| Scrum meeting | `TO FILL: fixed weekdays and time (IST)`, on Google Meet | 15–20 min | All five members | Each member says what they finished, what they are doing next and what is blocking them. The board is updated during the call |
| Sprint planning | First day of each sprint: 8 Nov (Sprint 1), 23 Nov (Sprint 2), 7 Dec (final) | 45 min | All five members | Agree the sprint goal, split stories into tasks, and confirm owners and due dates in Jira |
| Sprint review and retrospective | Two days before each deadline: 6 Nov, 20 Nov, 4 Dec, 18 Dec | 30–45 min | All five members | Check each deliverable against the project statement, then agree what to keep and what to change in the next sprint |
| TA and client meetings | As arranged with the TA or IIC | 30–60 min | All five members | Progress review with the TA; requirement questions for the client |

A scrum master (Saloni Puri or Khushi Dhankhar) runs each meeting and writes the minutes. Each set of minutes records the date, the attendees, each member's done, doing and blockers, the decisions taken, and action items with an owner, a due date and a Jira issue.

### 5.2 Meetings held

| # | Date | Meeting | Attendees | Minutes |
|---|---|---|---|---|
| 1 | 11 Oct 2026 | Kick-off and client meeting 1: problem statement discussion with IIC | `TO FILL` | Summarised in the Milestone 1 report, Section 2 |
| 2 | 15 Oct 2026 | Client meeting 2: requirements session with IIC (A01) | All five members | Notes in the Milestone 1 report, Section 4 and Appendix B |
| 3 | `TO FILL` | Review meeting with the TA | All five members and the TA | Section 5.3 |
| 4 | `TO FILL` | Milestone 2 sprint planning | `TO FILL` | Section 5.4 |
| 5 | `TO FILL` | Tech stack and design | `TO FILL` | Section 5.5 |
| 6 | `TO FILL` | Milestone 2 sprint review | `TO FILL` | Section 5.6 |

### 5.3 Minutes: review meeting with the TA

**Date:** `TO FILL` · **Mode:** `TO FILL` · **Attendees:** Abhijeet Kumar, Priyanshu Yadav, Saloni Puri, Shreya Pal, Khushi Dhankhar, and the team's TA (`TO FILL: name`)

**Objective.** Discuss the problem statement, user stories, assumptions and documentation, and the steps needed to finish Milestone 1 before the deadline.

**Discussion.**

- **Introductions and roles.** Each member introduced themselves and explained their role in the team.
- **Problem statement.** The team presented the problem statement, so that the team and the TA shared one understanding of the objectives and the proposed solution.
- **User stories.** Shreya explained the student user stories and Priyanshu the mentor user stories. Abhijeet and Saloni, who prepared the documentation, answered questions about it.
- **Assumptions.** Khushi explained two assumptions the team had made about the requirements.
- **Client clarifications.** The TA asked the team to list the questions that need the client's answer and to send them to the TA, who would obtain the answers from the client.
- **Pending interviews.** A few user interviews were still pending and needed to be completed quickly, so that their findings could go into the report.
- **Report review.** The team would share the user research report with the TA before the deadline, so that the TA's feedback could be applied in time.
- **AI integration.** The TA asked whether the platform would include AI features. The team said this was still being discussed and that no AI feature had been decided.

**Decisions.** Client questions go through the TA. The report is shared with the TA before submission. No AI feature is committed for now.

| Action item | Owner | Follow-up |
|---|---|---|
| Complete the remaining user interviews | Interviewers of S03, S04, S05 | Done: S03 on 21 Oct, S04 and S05 on 22 Oct (Milestone 1 report, Appendix B) |
| Compile the questions for the client and send them to the TA | `TO FILL` | Done: eight questions compiled; the client's answers are in Milestone 1 report Section 4 (SCRUM-37) |
| Share the user research report with the TA and apply the feedback | `TO FILL` | `TO FILL: date shared and changes made` |
| Review the assumptions and user stories and update the documentation | `TO FILL` | Done: affected stories updated with the client's answers (SCRUM-37) |
| Decide whether to include an AI feature | Whole team | Open: the agreed design matches mentors deterministically (US-04), and no AI feature is scheduled |

### 5.4 Minutes: Milestone 2 sprint planning

**Date:** `TO FILL` · **Mode:** `TO FILL` · **Attendees:** `TO FILL`

**Agenda.** Milestone 2 deliverables, sprint goal, tasks, owners and due dates.

**Decisions.**

- **Sprint goal** (as set in Jira): plan the schedule in Jira; design components, classes and database; build most UI pages (frontend only); submit the M2 report and the Milestone 1–2 ZIP by 7 Nov.
- Twenty tasks with owners and due dates (Section 4.4).
- Milestone 2 is submitted on 7 Nov, one day before the deadline. Sprint 1 therefore runs from 8 to 22 Nov, and its foundation tasks (SCRUM-69 to SCRUM-75) are due 9–14 Nov.

| Member | Done | Doing | Blockers |
|---|---|---|---|
| Abhijeet Kumar | `TO FILL` | `TO FILL` | `TO FILL` |
| Priyanshu Yadav | `TO FILL` | `TO FILL` | `TO FILL` |
| Saloni Puri | `TO FILL` | `TO FILL` | `TO FILL` |
| Shreya Pal | `TO FILL` | `TO FILL` | `TO FILL` |
| Khushi Dhankhar | `TO FILL` | `TO FILL` | `TO FILL` |

### 5.5 Minutes: tech stack and design

**Date:** `TO FILL` · **Mode:** `TO FILL` · **Attendees:** `TO FILL`

**Decisions** (recorded on 30 Oct in the tech-stack document, SCRUM-49).

- **Stack.** The team agreed on a React frontend built with Vite, and a Flask REST API with SQLAlchemy (SQLite for development and tests, PostgreSQL for the hosted demo). Tests use pytest, and the Swagger YAML is generated from the code.
- **Next.js and Supabase not adopted.** The team considered a suggested Next.js and Supabase stack and did not adopt it, because Milestones 3 and 4 grade hand-written API code, a Swagger YAML and pytest tests.
- **Hosting deferred.** Hosting and the email provider will be decided by 6 Dec (SCRUM-171).
- **Component design.** It is ready for review (SCRUM-50), and its status model feeds the class and ER diagrams (SCRUM-51, SCRUM-52).

| Member | Done | Doing | Blockers |
|---|---|---|---|
| Abhijeet Kumar | `TO FILL` | `TO FILL` | `TO FILL` |
| Priyanshu Yadav | `TO FILL` | `TO FILL` | `TO FILL` |
| Saloni Puri | `TO FILL` | `TO FILL` | `TO FILL` |
| Shreya Pal | `TO FILL` | `TO FILL` | `TO FILL` |
| Khushi Dhankhar | `TO FILL` | `TO FILL` | `TO FILL` |

### 5.6 Minutes: Milestone 2 sprint review

**Date:** `TO FILL` · **Mode:** `TO FILL` · **Attendees:** `TO FILL`

| Deliverable (project statement) | Report section | Owner | Status |
|---|---|---|---|
| Design of components | 1 | Abhijeet | `TO FILL` |
| Class diagram | 2 | Priyanshu | `TO FILL` |
| Database design diagram | 3 | Priyanshu | `TO FILL` |
| Sprint schedule | 4 | Saloni | `TO FILL` |
| Scrum meetings schedule and minutes | 5 | Saloni | `TO FILL` |
| Screenshots of the Gantt chart and Kanban board | 6 | Saloni | `TO FILL` |
| Screenshots of the frontend pages | 7 | Shreya, Khushi | `TO FILL` |
| Frontend code ZIP with README | — | Shreya | `TO FILL` |
| team-050-milestone-1-2.zip, validity check passed | — | Abhijeet | `TO FILL` |

**What went well.** `TO FILL`

**What to change in Sprint 1.** `TO FILL`

**Action items.** `TO FILL`
