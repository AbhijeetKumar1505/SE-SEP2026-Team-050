<style>
.sch-figure { margin: 10pt 0 2pt; break-inside: avoid; }
.sch-figure svg { width: 100%; height: auto; display: block; }
.sch-caption { font-size: 8.5pt; color: #5b5b66; margin: 4pt 0 12pt; }
.sch-owners table { font-size: 9pt; }
.sch-owners td:nth-child(1), .sch-owners td:nth-child(2) { white-space: nowrap; }
.sch-tasks td:first-child, .sch-tasks td:last-child { white-space: nowrap; }
</style>

<div class="page-break"></div>

## Section 4: Sprint Schedule

The schedule is built from the 21 user stories in the Milestone 1 report (Section 3). The project has one sprint per milestone. The two development sprints are Milestones 3 and 4, and each user story is built and tested in the sprint its SMART *Time-bound* field names.

### 4.1 Project scheduling tools

| Tool | What we use it for |
|---|---|
| **Jira Software** (Scrum board, project SCRUM) | Backlog, sprints, Kanban board, timeline (Gantt) and due dates. It is the single source of truth for who does what and by when |
| **GitHub** (team repository) | Code and report sources. Commit messages name the Jira issue they complete, for example *SCRUM-50* |
| **Figma** | Wireframes and click-through prototype for the UI pages (Milestone 2) |
| **Google Meet** | Scrum meetings, client meetings and user interviews |

How the Jira project is organised:

- **Epics.** There are five milestone epics (M1, M2, M5, and one for the M3 and M4 sprint submissions) and six feature epics: platform foundation, onboarding and profiles, mentor matching, mentorship tracking and feedback, changes, termination and safety, and programme insights.
- **Stories.** Each user story US-01 to US-21 is a Jira story with three sub-tasks: *Backend*, *Frontend* and *Tests*.
- **Tasks.** Design, documentation and submission work. Each task has an owner and a due date.
- **Sprints.** There are five sprints, one per milestone. Each has a sprint goal and ends on or just before the course deadline.
- **Workflow.** To Do → In Progress → In Review → Done. A task moves to *In Review* when its owner shares it with the team for review, and to *Done* once the review is finished.

### 4.2 Sprint overview

| Jira sprint | Dates (2026) | Sprint goal | Deadline |
|---|---|---|---|
| M1 – User Requirements | 11 Oct – 25 Oct | Users, user research and SMART user stories; interview video excerpt; every member's Honour Code | 25 Oct (submitted) |
| M2 – Scheduling & Design | 28 Oct – 7 Nov | Schedule in Jira; design of components, classes and database; most UI pages (frontend only); M2 report and the Milestone 1–2 ZIP | 8 Nov (team target 7 Nov) |
| M3 – Sprint 1: Matching | 8 Nov – 22 Nov | IIC-verified sign-up, student profiles, problem submission, mentor pool, mentor recommendations and IIC assignment as tested APIs (Swagger YAML and pytest); UI integrated; user feedback | 22 Nov |
| M4 – Sprint 2: Tracking | 23 Nov – 6 Dec | Goals and next steps, session logs, progress feedback, IIC monitoring, change and termination cases, and programme insights as tested APIs; UI integrated; user feedback | 6 Dec |
| M5 – Final Submission | 7 Dec – 20 Dec | Integrate, test end to end and deploy the prototype; final report, demo video, slides, code ZIP, README and the Milestone 3–5 ZIP | 20 Dec |

Every sprint follows the same pattern: a planning meeting on its first day, then design or build work, then review, then submission one day before the deadline. The two development sprints also reserve their last five days for the Swagger YAML, the API test-case document, the pytest report and a user feedback session.

### 4.3 Gantt chart

<div class="sch-figure">
<svg viewBox="0 0 680 533" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, Arial, sans-serif" role="img" aria-label="Gantt chart of the project schedule, 11 October to 20 December 2026">
<rect x="238.0" y="30" width="91.7" height="473" fill="#7a8794" fill-opacity="0.06"/>
<text x="283.8" y="40" font-size="9" font-weight="700" fill="#7a8794" text-anchor="middle">M1</text>
<rect x="341.9" y="30" width="67.2" height="473" fill="#1f4e8c" fill-opacity="0.06"/>
<text x="375.5" y="40" font-size="9" font-weight="700" fill="#1f4e8c" text-anchor="middle">M2</text>
<rect x="409.2" y="30" width="91.7" height="473" fill="#0f7a6c" fill-opacity="0.06"/>
<text x="455.0" y="40" font-size="9" font-weight="700" fill="#0f7a6c" text-anchor="middle">M3</text>
<rect x="500.8" y="30" width="85.6" height="473" fill="#b25e09" fill-opacity="0.06"/>
<text x="543.6" y="40" font-size="9" font-weight="700" fill="#b25e09" text-anchor="middle">M4</text>
<rect x="586.4" y="30" width="85.6" height="473" fill="#6a3d9a" fill-opacity="0.06"/>
<text x="629.2" y="40" font-size="9" font-weight="700" fill="#6a3d9a" text-anchor="middle">M5</text>
<line x1="244.1" y1="44" x2="244.1" y2="503" stroke="#c9ccd3" stroke-width="0.6"/>
<text x="244.1" y="24" font-size="8" fill="#5b5b66" text-anchor="middle">12 Oct</text>
<line x1="286.9" y1="44" x2="286.9" y2="503" stroke="#c9ccd3" stroke-width="0.6"/>
<text x="286.9" y="24" font-size="8" fill="#5b5b66" text-anchor="middle">19 Oct</text>
<line x1="329.7" y1="44" x2="329.7" y2="503" stroke="#c9ccd3" stroke-width="0.6"/>
<text x="329.7" y="24" font-size="8" fill="#5b5b66" text-anchor="middle">26 Oct</text>
<line x1="372.5" y1="44" x2="372.5" y2="503" stroke="#c9ccd3" stroke-width="0.6"/>
<text x="372.5" y="24" font-size="8" fill="#5b5b66" text-anchor="middle">2 Nov</text>
<line x1="415.3" y1="44" x2="415.3" y2="503" stroke="#c9ccd3" stroke-width="0.6"/>
<text x="415.3" y="24" font-size="8" fill="#5b5b66" text-anchor="middle">9 Nov</text>
<line x1="458.1" y1="44" x2="458.1" y2="503" stroke="#c9ccd3" stroke-width="0.6"/>
<text x="458.1" y="24" font-size="8" fill="#5b5b66" text-anchor="middle">16 Nov</text>
<line x1="500.8" y1="44" x2="500.8" y2="503" stroke="#c9ccd3" stroke-width="0.6"/>
<text x="500.8" y="24" font-size="8" fill="#5b5b66" text-anchor="middle">23 Nov</text>
<line x1="543.6" y1="44" x2="543.6" y2="503" stroke="#c9ccd3" stroke-width="0.6"/>
<text x="543.6" y="24" font-size="8" fill="#5b5b66" text-anchor="middle">30 Nov</text>
<line x1="586.4" y1="44" x2="586.4" y2="503" stroke="#c9ccd3" stroke-width="0.6"/>
<text x="586.4" y="24" font-size="8" fill="#5b5b66" text-anchor="middle">7 Dec</text>
<line x1="629.2" y1="44" x2="629.2" y2="503" stroke="#c9ccd3" stroke-width="0.6"/>
<text x="629.2" y="24" font-size="8" fill="#5b5b66" text-anchor="middle">14 Dec</text>
<text x="4" y="24" font-size="8" fill="#5b5b66">Weeks start on Monday</text>
<rect x="0" y="44" width="680" height="17" fill="#7a8794" fill-opacity="0.10"/>
<text x="4" y="56" font-size="9.5" font-weight="700" fill="#7a8794">M1 · User requirements</text>
<path d="M326.6,47.0 l5.5,5.5 l-5.5,5.5 l-5.5,-5.5 z" fill="#7a8794"/>
<text x="318.6" y="56" font-size="8" fill="#7a8794" text-anchor="end">due 25 Oct</text>
<text x="12" y="73" font-size="9" fill="#1d1d1f">Kick-off and client meetings</text>
<rect x="238.0" y="65" width="30.6" height="9" rx="2" fill="#7a8794" fill-opacity="0.45"/>
<text x="12" y="90" font-size="9" fill="#1d1d1f">User interviews S01–S05, M01</text>
<rect x="244.1" y="82" width="67.2" height="9" rx="2" fill="#7a8794" fill-opacity="0.45"/>
<text x="12" y="107" font-size="9" fill="#1d1d1f">Report, review and submission</text>
<rect x="286.9" y="99" width="42.8" height="9" rx="2" fill="#7a8794" fill-opacity="0.45"/>
<rect x="0" y="112" width="680" height="17" fill="#1f4e8c" fill-opacity="0.10"/>
<text x="4" y="124" font-size="9.5" font-weight="700" fill="#1f4e8c">M2 · Scheduling and design</text>
<path d="M412.2,115.0 l5.5,5.5 l-5.5,5.5 l-5.5,-5.5 z" fill="#1f4e8c"/>
<text x="404.2" y="124" font-size="8" fill="#1f4e8c" text-anchor="end">due 8 Nov</text>
<text x="12" y="141" font-size="9" fill="#1d1d1f">Tech stack (SCRUM-49)</text>
<rect x="341.9" y="133" width="30.6" height="9" rx="2" fill="#1f4e8c"/>
<text x="12" y="158" font-size="9" fill="#1d1d1f">Design of components (SCRUM-50)</text>
<rect x="341.9" y="150" width="42.8" height="9" rx="2" fill="#1f4e8c"/>
<text x="12" y="175" font-size="9" fill="#1d1d1f">Class and ER diagrams (SCRUM-51, 52)</text>
<rect x="341.9" y="167" width="42.8" height="9" rx="2" fill="#1f4e8c"/>
<text x="12" y="192" font-size="9" fill="#1d1d1f">Schedule, Gantt, minutes (SCRUM-53–55)</text>
<rect x="341.9" y="184" width="61.1" height="9" rx="2" fill="#1f4e8c"/>
<text x="12" y="209" font-size="9" fill="#1d1d1f">Frontend set-up (SCRUM-56)</text>
<rect x="341.9" y="201" width="36.7" height="9" rx="2" fill="#1f4e8c"/>
<text x="12" y="226" font-size="9" fill="#1d1d1f">UI pages (SCRUM-57–64)</text>
<rect x="372.5" y="218" width="30.6" height="9" rx="2" fill="#1f4e8c"/>
<text x="12" y="243" font-size="9" fill="#1d1d1f">Report, ZIPs, submission (SCRUM-65–68)</text>
<rect x="390.8" y="235" width="18.3" height="9" rx="2" fill="#1f4e8c"/>
<rect x="0" y="248" width="680" height="17" fill="#0f7a6c" fill-opacity="0.10"/>
<text x="4" y="260" font-size="9.5" font-weight="700" fill="#0f7a6c">M3 · Sprint 1: matching</text>
<path d="M497.8,251.0 l5.5,5.5 l-5.5,5.5 l-5.5,-5.5 z" fill="#0f7a6c"/>
<text x="489.8" y="260" font-size="8" fill="#0f7a6c" text-anchor="end">due 22 Nov</text>
<text x="12" y="277" font-size="9" fill="#1d1d1f">Backend foundation (SCRUM-69–75)</text>
<rect x="409.2" y="269" width="42.8" height="9" rx="2" fill="#0f7a6c"/>
<text x="12" y="294" font-size="9" fill="#1d1d1f">10 stories: APIs, UI, tests</text>
<rect x="421.4" y="286" width="67.2" height="9" rx="2" fill="#0f7a6c"/>
<text x="12" y="311" font-size="9" fill="#1d1d1f">Swagger, test cases, pytest (SCRUM-76–78)</text>
<rect x="464.2" y="303" width="30.6" height="9" rx="2" fill="#0f7a6c"/>
<text x="12" y="328" font-size="9" fill="#1d1d1f">User feedback, submission (SCRUM-79, 80)</text>
<rect x="482.5" y="320" width="18.3" height="9" rx="2" fill="#0f7a6c"/>
<rect x="0" y="333" width="680" height="17" fill="#b25e09" fill-opacity="0.10"/>
<text x="4" y="345" font-size="9.5" font-weight="700" fill="#b25e09">M4 · Sprint 2: tracking</text>
<path d="M583.4,336.0 l5.5,5.5 l-5.5,5.5 l-5.5,-5.5 z" fill="#b25e09"/>
<text x="575.4" y="345" font-size="8" fill="#b25e09" text-anchor="end">due 6 Dec</text>
<text x="12" y="362" font-size="9" fill="#1d1d1f">Scheduled jobs (SCRUM-170)</text>
<rect x="500.8" y="354" width="30.6" height="9" rx="2" fill="#b25e09"/>
<text x="12" y="379" font-size="9" fill="#1d1d1f">11 stories: APIs, UI, tests</text>
<rect x="500.8" y="371" width="73.4" height="9" rx="2" fill="#b25e09"/>
<text x="12" y="396" font-size="9" fill="#1d1d1f">Swagger, test cases, pytest (SCRUM-81–83)</text>
<rect x="549.7" y="388" width="24.5" height="9" rx="2" fill="#b25e09"/>
<text x="12" y="413" font-size="9" fill="#1d1d1f">User feedback, submission (SCRUM-84, 85)</text>
<rect x="568.1" y="405" width="18.3" height="9" rx="2" fill="#b25e09"/>
<rect x="0" y="418" width="680" height="17" fill="#6a3d9a" fill-opacity="0.10"/>
<text x="4" y="430" font-size="9.5" font-weight="700" fill="#6a3d9a">M5 · Final submission</text>
<path d="M668.9,421.0 l5.5,5.5 l-5.5,5.5 l-5.5,-5.5 z" fill="#6a3d9a"/>
<text x="660.9" y="430" font-size="8" fill="#6a3d9a" text-anchor="end">due 20 Dec</text>
<text x="12" y="447" font-size="9" fill="#1d1d1f">End-to-end testing, fixes (SCRUM-86)</text>
<rect x="586.4" y="439" width="36.7" height="9" rx="2" fill="#6a3d9a"/>
<text x="12" y="464" font-size="9" fill="#1d1d1f">Hosting and deployment (SCRUM-171, 87)</text>
<rect x="549.7" y="456" width="85.6" height="9" rx="2" fill="#6a3d9a"/>
<text x="12" y="481" font-size="9" fill="#1d1d1f">README, final report, slides (SCRUM-88–90)</text>
<rect x="604.8" y="473" width="48.9" height="9" rx="2" fill="#6a3d9a"/>
<text x="12" y="498" font-size="9" fill="#1d1d1f">Demo video, ZIP, submission (SCRUM-91–93)</text>
<rect x="635.3" y="490" width="36.7" height="9" rx="2" fill="#6a3d9a"/>
<line x1="0" y1="503" x2="680" y2="503" stroke="#c9ccd3" stroke-width="0.6"/>
<rect x="4" y="513" width="18" height="8" rx="2" fill="#1f4e8c"/><text x="26" y="521" font-size="8.5" fill="#5b5b66">Planned work (start to Jira due date)</text>
<rect x="200" y="513" width="18" height="8" rx="2" fill="#7a8794" fill-opacity="0.45"/><text x="222" y="521" font-size="8.5" fill="#5b5b66">Completed</text>
<path d="M290,512 l4.5,4.5 l-4.5,4.5 l-4.5,-4.5 z" fill="#5b5b66"/><text x="298" y="521" font-size="8.5" fill="#5b5b66">Milestone deadline (project statement)</text>
<rect x="470" y="512" width="18" height="10" fill="#1f4e8c" fill-opacity="0.08"/><text x="492" y="521" font-size="8.5" fill="#5b5b66">Jira sprint</text>
</svg>
</div>
<p class="sch-caption">Figure 4.1. Project schedule, 11 October to 20 December 2026. Bars run from the planned start to the due date held in Jira; shaded columns are the Jira sprints. The same plan appears on the Jira timeline (Section 6).</p>

**How to read the schedule.**

- **Milestone 1 (done).** It started with the kick-off and the first client meeting on 11 Oct. The client requirements session followed on 15 Oct, and the six user interviews ran from 12 to 22 Oct. The report was reviewed by the team and submitted before the 25 Oct deadline.
- **Milestone 2.** All design work starts together on 28 Oct, so that the component design, class diagram and ER diagram are ready by 3 Nov. The UI pages (2–6 Nov) follow the frontend set-up (due 2 Nov) and the Figma wireframes. The report, both ZIPs and the submission close the sprint on 7 Nov, one day before the deadline.
- **Milestone 3 (Sprint 1).** This sprint is two weeks long because Milestone 2 was extended. The backend foundation (project skeleton, data models from the ER diagram, authentication and roles, OpenAPI skeleton, pytest set-up, API client) is due in its first week so that story work can start by 10 Nov. Its ten stories (US-01 to US-05, US-09, US-10 and US-14 to US-16) cover everything a student needs to reach an assigned mentor.
- **Milestone 4 (Sprint 2).** Its eleven stories depend on mentorships created in Sprint 1. They are goals and next steps, sessions, feedback, ending a mentorship, monitoring, cases, insights and escalations. The scheduled job runner (SCRUM-170) comes first because reminders and escalations (US-11, US-21) use it.
- **Milestone 5.** End-to-end testing and fixes run in the first week. Hosting is decided by 6 Dec (SCRUM-171) so that the prototype is deployed by 14 Dec, before the demo video is recorded.

**Critical path.** ER diagram (3 Nov) → data models (11 Nov) → Sprint 1 stories → Sprint 2 stories → deployment → demo video. A slip in the ER diagram or the data models delays both development sprints, so these are reviewed first at each scrum meeting.

### 4.4 Tasks and owners for each sprint

Roles: **Abhijeet** Kumar (backend, code review), **Priyanshu** Yadav (backend, testing), **Saloni** Puri (product manager, scrum master), **Shreya** Pal (frontend, testing), **Khushi** Dhankhar (frontend, scrum master).

Owners for Milestone 2 are as assigned in Jira. Owners for Milestones 3 to 5 are proposed from each member's role. They are confirmed at the planning meeting that opens each sprint and then assigned in Jira. The proposal follows three rules:

- The member who builds a UI page in Milestone 2 integrates that page with the API in Milestone 3 or 4.
- A story's tests are written by someone other than its backend developer.
- Abhijeet reviews every pull request, and Priyanshu reviews Abhijeet's.

#### Milestone 1: User requirements (done)

All five members attended the client requirements session on 15 Oct. The interviews were S01 (Khushi), S02 and M01 (Abhijeet), S03 (Shreya), S04 (Saloni) and S05 (Priyanshu). Abhijeet led the synthesis and the report, which the team reviewed (SCRUM-40) and submitted before the deadline.

#### Milestone 2: Scheduling and design (28 Oct – 7 Nov)

<div class="sch-tasks">

| Jira | Task | Owner | Due |
|---|---|---|---|
| SCRUM-49 | Decide and document the tech stack | Abhijeet | 1 Nov |
| SCRUM-50 | Design of system components with descriptions | Abhijeet | 3 Nov |
| SCRUM-51 | Class diagram of the proposed system | Priyanshu | 3 Nov |
| SCRUM-52 | Database design (ER diagram) | Priyanshu | 3 Nov |
| SCRUM-53 | Sprint schedule and Gantt chart | Saloni | 5 Nov |
| SCRUM-54 | Scrum meeting schedule and minutes | Saloni | 6 Nov |
| SCRUM-55 | Screenshots of the Jira board and timeline | Saloni | 6 Nov |
| SCRUM-56 | Frontend project, routing, layout and role-based navigation | Khushi | 2 Nov |
| SCRUM-57 | UI: sign-up, login and student profile (US-01, US-02) | Shreya | 4 Nov |
| SCRUM-58 | UI: problem submission form (US-03, US-20) | Shreya | 4 Nov |
| SCRUM-59 | UI: student dashboard (US-05) | Shreya | 4 Nov |
| SCRUM-60 | UI: mentor dashboard and availability (US-09, US-10, US-13) | Khushi | 5 Nov |
| SCRUM-61 | UI: mentorship workspace (US-06, US-07, US-08, US-11, US-12) | Shreya | 5 Nov |
| SCRUM-62 | UI: IIC students, mentor pool, problem queue and assignment (US-04, US-14, US-15, US-16) | Khushi | 5 Nov |
| SCRUM-63 | UI: IIC monitoring, escalation alerts and cases (US-17, US-18, US-21) | Khushi | 5 Nov |
| SCRUM-64 | UI: programme insights dashboard (US-19) | Khushi | 6 Nov |
| SCRUM-65 | Frontend README and code ZIP | Shreya | 6 Nov |
| SCRUM-66 | Compile the Milestone 2 PDF report | Saloni | 6 Nov |
| SCRUM-67 | Build team-050-milestone-1-2.zip and pass the validity check | Abhijeet | 7 Nov |
| SCRUM-68 | Submit the Milestone 2 deliverables on the portal | Saloni | 7 Nov |

</div>

#### Milestone 3: Sprint 1, matching (8 – 22 Nov)

<div class="sch-owners">

| Story | Jira | Title | Backend | Frontend | Tests |
|---|---|---|---|---|---|
| US-01 | SCRUM-15 | Sign up with my institute email, checked against IIC's roster | Abhijeet | Shreya | Priyanshu |
| US-02 | SCRUM-16 | Complete my basic profile | Priyanshu | Shreya | Shreya |
| US-03 | SCRUM-17 | Submit the problem I need help with | Priyanshu | Shreya | Shreya |
| US-04 | SCRUM-24 | See 3–4 recommended mentors for each problem | Abhijeet | Khushi | Priyanshu |
| US-05 | SCRUM-18 | Track my request and reach out to my assigned mentor | Priyanshu | Shreya | Shreya |
| US-09 | SCRUM-19 | Accept or decline students assigned to me, with context | Priyanshu | Khushi | Shreya |
| US-10 | SCRUM-20 | Set my availability, contact preference and capacity | Priyanshu | Khushi | Shreya |
| US-14 | SCRUM-21 | Add and verify mentors before they can be assigned | Abhijeet | Khushi | Priyanshu |
| US-15 | SCRUM-22 | Keep the list of IIC-registered students up to date | Abhijeet | Khushi | Priyanshu |
| US-16 | SCRUM-23 | Assign a mentor to each student's problem | Abhijeet | Khushi | Priyanshu |

</div>

Other Sprint 1 tasks: backend skeleton (SCRUM-69), authentication and roles (SCRUM-71), audit log and notifications (SCRUM-72), OpenAPI skeleton (SCRUM-73) and the complete Swagger YAML (SCRUM-76), all Abhijeet; data models, migrations and seed data (SCRUM-70), pytest set-up and CI (SCRUM-74) and the pytest output report (SCRUM-78), all Priyanshu; frontend API client (SCRUM-75), Khushi; API test-case document (SCRUM-77), Saloni with Priyanshu and Shreya; user feedback session and Sprint 2 plan (SCRUM-79) and the Milestone 3 submission (SCRUM-80), Saloni.

#### Milestone 4: Sprint 2, tracking (23 Nov – 6 Dec)

<div class="sch-owners">

| Story | Jira | Title | Backend | Frontend | Tests |
|---|---|---|---|---|---|
| US-06 | SCRUM-25 | Keep track of our goal and next steps | Priyanshu | Shreya | Shreya |
| US-07 | SCRUM-26 | Ask to change or end my mentorship | Abhijeet | Shreya | Priyanshu |
| US-08 | SCRUM-27 | Give feedback on my mentorship | Priyanshu | Shreya | Shreya |
| US-11 | SCRUM-28 | Schedule and log sessions without recording what was said | Priyanshu | Shreya | Shreya |
| US-12 | SCRUM-29 | Send progress feedback on my mentee | Priyanshu | Shreya | Shreya |
| US-13 | SCRUM-30 | End a mentorship from my side | Priyanshu | Khushi | Shreya |
| US-17 | SCRUM-31 | Monitor active mentorships | Abhijeet | Khushi | Priyanshu |
| US-18 | SCRUM-32 | Resolve change, termination and misconduct cases fairly | Abhijeet | Khushi | Priyanshu |
| US-19 | SCRUM-33 | See demand, supply and outcomes across the programme | Abhijeet | Khushi | Priyanshu |
| US-20 | SCRUM-34 | Say how I like to be guided | Priyanshu | Shreya | Shreya |
| US-21 | SCRUM-159 | Stop assignments and mentorships from stalling | Abhijeet | Khushi | Priyanshu |

</div>

Other Sprint 2 tasks: scheduled job runner for reminders and escalations (SCRUM-170) and the complete Swagger YAML (SCRUM-81), Abhijeet; pytest output report (SCRUM-83), Priyanshu; API test-case document (SCRUM-82), Saloni with Priyanshu and Shreya; user feedback session and final-sprint plan (SCRUM-84) and the Milestone 4 submission (SCRUM-85), Saloni.

#### Milestone 5: Final submission (7 – 20 Dec)

<div class="sch-tasks">

| Jira | Task | Owner | Due |
|---|---|---|---|
| SCRUM-171 | Decide hosting and the email provider for the demo | Abhijeet | 6 Dec |
| SCRUM-86 | End-to-end testing and bug fixing across all roles | Shreya, Priyanshu (fixes by each story's owners) | 12 Dec |
| SCRUM-87 | Deploy the working prototype | Abhijeet | 14 Dec |
| SCRUM-88 | README with full set-up and run instructions | Khushi | 15 Dec |
| SCRUM-89 | Final PDF report covering all milestones | Saloni | 17 Dec |
| SCRUM-90 | Presentation slides | Khushi | 17 Dec |
| SCRUM-91 | Record the demo video | Shreya | 18 Dec |
| SCRUM-92 | Code ZIP and team-050-milestone-3-5.zip (validity check) | Abhijeet | 19 Dec |
| SCRUM-93 | Submit the Milestone 5 deliverables on the portal | Saloni | 20 Dec |

</div>
