<div class="page-break"></div>

## Section 5: Scrum Meetings Schedule and Minutes

### 5.1 Meeting schedule

| Meeting | When | Length | Who | Purpose |
|---|---|---|---|---|
| Scrum meeting | 8–10 pm IST on scheduled dates, on Google Meet. In Milestone 2: 28 and 29 Oct for the design, 1 and 3 Nov for the frontend (Section 5.2) | Up to 2 hours | The members working on that part; all five for the tech stack | Agree what to build and who builds it, then report progress and blockers. The board is updated during the call |
| Sprint planning | First day of each sprint: 8 Nov (Sprint 1), 23 Nov (Sprint 2), 7 Dec (final) | 45 min | All five members | Agree the sprint goal, split stories into tasks, and confirm owners and due dates in Jira |
| Sprint review and retrospective | One or two days before each deadline: 6 Nov, 20 Nov, 4 Dec, 18 Dec | 30–45 min | All five members | Check each deliverable against the project statement, then agree what to keep and what to change in the next sprint |
| TA and client meetings | As arranged with the TA or IIC | 30–60 min | All five members | Progress review with the TA; requirement questions for the client |

Saloni Puri, who attended every Milestone 2 meeting, acts as scrum master and keeps the minutes. Each set of minutes records the date, the attendees, what was discussed, the decisions and the action items.

### 5.2 Meetings held

| # | Date | Meeting | Attendees | Minutes |
|---|---|---|---|---|
| 1 | 11 Oct 2026 | Milestone 1 kick-off and client meeting 1: problem statement discussion with IIC | All five members | Milestone 1 report, Section 2 |
| 2 | 15 Oct 2026 | Milestone 1 client meeting 2: requirements session with IIC (A01) | All five members | Milestone 1 report, Section 4 and Appendix B |
| 3 | 20 Oct 2026 | Milestone 1 review with the TA | All five members and the TA | Section 5.3 |
| 4 | 28 Oct 2026 | Scrum meeting 1: tech stack | All five members | Section 5.4 |
| 5 | 28 Oct 2026 | Scrum meeting 2: database schema, class diagram and component design | Saloni, Abhijeet, Priyanshu | Section 5.5 |
| 6 | 29 Oct 2026 | Scrum meeting 3: database schema, class diagram and component design | Saloni, Abhijeet, Priyanshu | Section 5.5 |
| 7 | 1 Nov 2026 | Scrum meeting 4: frontend | Saloni, Khushi, Shreya, Abhijeet | Section 5.6 |
| 8 | 2 Nov 2026 | Milestone 2 review with the TA | All five members and the TA | Section 5.7 |
| 9 | 3 Nov 2026 | Scrum meeting 5: frontend | Saloni, Khushi, Shreya, Abhijeet | Section 5.6 |
| 10 | 6 Nov 2026 | Milestone 2 sprint review | All five members | Section 5.9 |

### 5.3 Minutes: Milestone 1 review with the TA

**Date:** 20 Oct 2026 · **Mode:** Online (Google Meet) · **Attendees:** Abhijeet Kumar, Priyanshu Yadav, Saloni Puri, Shreya Pal, Khushi Dhankhar, and the team's TA, Priyanshu Aggarwal

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
| Compile the questions for the client and send them to the TA | Abhijeet | Done: eight questions compiled; the client's answers are in Milestone 1 report Section 4 (SCRUM-37) |
| Share the user research report with the TA and apply the feedback | Abhijeet, Saloni, Khushi | Done: shared on 25 Oct and revised to match the TA's remarks (below) |
| Review the assumptions and user stories and update the documentation | Shreya, Priyanshu | Done: affected stories updated with the client's answers (SCRUM-37) |
| Decide whether to include an AI feature | Whole team | Done: three AI features decided on 6 Nov (Section 5.8) |

**The TA's remarks on the revised report.**

- **Structure.** The five mandatory sections (identification of users, pain points, user stories, requirements clarification, and assumptions and open questions) each have their own section.
- **Cover page.** It records each member's individual contribution.
- **Client clarifications.** Section 4 maps the client's answers, such as off-platform communication, student-initiated contact and the limits of mentor verification, to design decisions.
- **Sprint 1 workload.** The report then committed 11 stories to Sprint 1. Each needs working API endpoints, a Swagger YAML and pytest tests in Milestone 3, so the TA asked the team to review the load during Milestone 2 planning. Section 4 plans ten stories for Sprint 1.
- **Honour Code.** Each of the five members downloads, signs and submits their own copy on the portal.

### 5.4 Minutes: scrum meeting 1, tech stack

**Date:** 28 Oct 2026 · **Attendees:** Abhijeet Kumar, Priyanshu Yadav, Saloni Puri, Shreya Pal, Khushi Dhankhar

**Agenda.** The start of Milestone 2, and the tech stack for the frontend, backend, database and tests.

**Decisions** (written up on 30 Oct in the tech-stack document, SCRUM-49).

- **Stack.** A React frontend built with Vite, and a Flask REST API with SQLAlchemy (SQLite for development and tests, PostgreSQL for the hosted demo). Tests use pytest, and the Swagger YAML is generated from the code.
- **Next.js and Supabase not adopted.** The team considered a suggested Next.js and Supabase stack and did not adopt it, because Milestones 3 and 4 grade hand-written API code, a Swagger YAML and pytest tests.
- **Hosting deferred.** Hosting and the email provider will be decided by 6 Dec (SCRUM-171).

### 5.5 Minutes: scrum meetings 2 and 3, design

**Dates:** 28 and 29 Oct 2026 · **Attendees:** Saloni Puri, Abhijeet Kumar, Priyanshu Yadav

**Agenda.** The database schema, the class diagram and the component design.

**Outcome.** The two meetings produced the three design documents in this report:

- **Component design** (Abhijeet, SCRUM-50): the system's components, their responsibilities and the shared status model (Section 1).
- **Class diagram** (Priyanshu, SCRUM-51): built on that status model (Section 2).
- **ER diagram** (Priyanshu, SCRUM-52): the database schema (Section 3).

### 5.6 Minutes: scrum meetings 4 and 5, frontend

**Dates:** 1 and 3 Nov 2026 · **Attendees:** Saloni Puri, Khushi Dhankhar, Shreya Pal, Abhijeet Kumar

**Agenda.** The frontend pages: which pages to build, who builds them, and how they follow the Figma designs.

**Outcome.** Khushi built the account and student pages, and Shreya the Figma designs and the mentor, IIC and leadership pages. Both sets now run as one React app (Section 7).

### 5.7 Minutes: Milestone 2 review with the TA

**Date:** 2 Nov 2026 · **Mode:** Online (Google Meet) · **Attendees:** Abhijeet Kumar, Priyanshu Yadav, Saloni Puri, Shreya Pal, Khushi Dhankhar, and the team's TA, Priyanshu Aggarwal

**Discussion.**

- **Project flow.** Saloni explained how the team started the project and the overall project flow.
- **Frontend progress.** Khushi presented the frontend coded so far, mainly the student pages. The TA asked whether ending a mentorship is handled by the student and the mentor together. The team confirmed that it is a shared feature. The same was confirmed for goals and next steps, and for session scheduling. Only the presented pages were coded at that point; the other screens existed as Figma designs.
- **Figma designs.** Shreya presented the Figma screens. The team committed to finish the remaining designs by 6 Nov.
- **ER and class diagrams.** Priyanshu presented the ER diagram and the class diagram.
- **Report and algorithms.** Abhijeet presented the report and explained the algorithms the application uses, using the component design document.
- **AI integration.** The TA asked whether the team had decided on any AI feature. Abhijeet said the team planned an AI chatbot to help students who could not find a suitable mentor. The TA noted that an AI feature could earn additional marks.

**The TA's recommendations.**

- Make sure every user story is covered in the application.
- Include the class diagram and the ER diagram in the report.
- Include sprint information in the report.
- Add screenshots of the Kanban board.
- Include the Gantt chart for the project timeline.

| Action item | Owner | Follow-up |
|---|---|---|
| Finish the remaining Figma designs by 6 Nov | Shreya | Done: all 25 screens are in the Figma file, each with a notes card |
| Build the features beyond the pages already coded | Khushi, Shreya | Done for Milestone 2: the mentor, IIC and leadership pages and the problem submission form are coded (Section 7) |
| Plan the AI feature | Whole team | Done: decided on 6 Nov (Section 5.8) |
| Check that every user story is covered in the application and the report | Abhijeet | Section 7 maps each group of screens to its user stories |
| Add the class and ER diagrams, sprint information, the Kanban board and the Gantt chart to the report | Saloni, Abhijeet | Done: Section 2 (class diagram), Section 3 (ER diagram), Section 4 (sprints and the Gantt chart) and Section 6 (Jira timeline and Kanban board) |

### 5.8 Decision after the review: AI features

**Date:** 6 Nov 2026 · **Decided by:** the whole team

The team compared possible AI features with the Milestone 1 findings and the design decisions already made. It chose three features in place of the chatbot mentioned at the review. In all three, IIC still assigns every mentor and the AI only suggests.

| Feature | Page | Used by | What the AI does | Safeguards |
|---|---|---|---|---|
| Problem coach | Submit your problem (S2) | Student | Suggests 1–5 topic tags from IIC's active list and points out missing detail: the target role, a timeframe, what the student has already tried | The student chooses what to keep. Only the description is sent, never the name, roll number or CGPA |
| Mentor fit notes | Review and assign (I2) | IIC | Writes a short note on each recommended mentor: the tags they cover and miss, and whether their style matches the student's guidance preference | The ranking stays deterministic (US-04); the notes only explain it and never reorder or pick a mentor |
| Feedback review | Mentorship feedback (I8), opened from Monitoring | IIC | Summarises both sides' progress feedback and the session pattern, and flags comments that may need a wellbeing check | Reads feedback comments and session dates only, since sessions never record what was discussed. It never contacts anyone or changes the mentorship; IIC records "I'll follow up" or "Not a concern" |

**Why these features.**

- They address pain points from the Milestone 1 interviews. Mentors need a specific problem (P-07), and good topic tags help IIC find niche expertise (P-02) without matching by hand (P-09). The feedback review supports IIC's monitoring (P-10).
- They keep the decisions recorded in Milestone 1: IIC assigns every mentor, and the matching rule uses no machine learning.
- A general career chatbot would give the kind of generic advice students said they had to verify themselves (P-04).

**Next steps.** The screens are built as prototypes with sample data (Section 7). The user stories, Jira tasks and the choice of AI provider follow in Sprint 2; the API key stays on the Flask backend.

### 5.9 Minutes: Milestone 2 sprint review

**Date:** 6 Nov 2026 · **Mode:** Online (Google Meet) · **Attendees:** Abhijeet Kumar, Priyanshu Yadav, Saloni Puri, Shreya Pal, Khushi Dhankhar

| Deliverable (project statement) | Report section | Owner | Status |
|---|---|---|---|
| Design of components | 1 | Abhijeet | Done |
| Class diagram | 2 | Priyanshu | Done, verified |
| Database design diagram | 3 | Priyanshu | Done, verified |
| Sprint schedule | 4 | Saloni | Done |
| Scrum meetings schedule and minutes | 5 | Saloni | Done |
| Screenshots of the Gantt chart and Kanban board | 6 | Saloni | Done |
| Screenshots of the frontend pages | 7 | Shreya, Khushi | Done |
| Frontend code ZIP with README | — | Shreya | Done |
| team-050-milestone-1-2.zip, validity check passed | — | Abhijeet | Done |

**What went well.**

- Every Milestone 2 deliverable was ready at this review, a day before the team's 7 Nov target.
- The design took two meetings (28 and 29 Oct), and the class and ER diagrams were verified against the component design.
- All the TA's recommendations from 2 Nov are in the report, and every Figma screen now exists as a page, along with the three AI features.

**What to change in Sprint 1.**

- Agree one approach before coding. The student pages and the mentor and IIC pages were built in different ways and had to be merged.
- Check each page against its Figma notes while building it, not at the end.

**Action items.**

| Action item | Owner | Due |
|---|---|---|
| Submit the Milestone 2 deliverables on the portal (SCRUM-68) | Saloni | 7 Nov |
| Start the backend foundation (SCRUM-69 to SCRUM-75) | Abhijeet, Priyanshu, Khushi | 9–14 Nov |
| Write user stories and Jira tasks for the three AI features, and choose the AI provider | Whole team | 23 Nov (Sprint 2 planning) |
