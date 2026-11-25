## User Feedback Report (Sprint 1)

The team demonstrated the Sprint 1 work to end users and recorded their feedback (SCRUM-79). The [interview report](02-interview-report.md) has the record of each interview. This report lists the findings, what the team decided, and the changes made. The resulting backlog is in the [Sprint 2 plan](03-sprint-2-plan.md).

### Who gave feedback

| Interview | Participant | Role in the platform |
|---|---|---|
| I-1 | Teaching assistant | Reviewer, and IIC's point of view |
| I-2 | S01 | Student |
| I-3 | M01 | Mentor |

### What was demonstrated

The demo follows one student from IIC's roster to an accepted mentorship, using the seeded demo accounts and Mailpit (http://localhost:8025) for the emails.

| Step | Who drives it | Feature and user story | Pages and endpoints |
|---|---|---|---|
| 1 | IIC | Import the roster, add a mentor and verify them (US-15, US-14) | IIC students and mentor pool pages; `POST /api/students/roster/import`, `POST /api/mentors`, `POST /api/mentors/{id}/verify` |
| 2 | Mentor | Open the activation email in Mailpit, activate the account, set availability (US-14, US-10) | `/activate/:token`, mentor profile; `PUT /api/mentors/me` |
| 3 | Student | Sign up with an institute email on the roster and verify it (US-01), complete the profile (US-02), submit a problem (US-03) | Sign-up and verify pages; `/student/profile`, `/student/problem/new` |
| 4 | IIC | Open the queue, review the problem, look at the recommended mentors and assign one (US-16, US-04) | IIC problem queue; `GET /api/problems/queue`, `GET /api/matching/problems/{id}/recommendations`, `POST /api/problems/{id}/assign` |
| 5 | Mentor, then student | The mentor accepts with the student's context, and declines a second assignment with a reason (US-09). The student sees their mentor and records that they reached out (US-05) | Mentor dashboard, student home; `POST /api/mentors/mentorships/{id}/accept`, `POST /api/mentors/mentorships/{id}/decline`, `POST /api/mentorships/{id}/reached-out` |

### Feedback received

| # | From | Feedback | Type | Decision | Change made |
|---|---|---|---|---|---|
Both end users found the Sprint 1 flow intuitive and asked for no change to it. Their findings below are what each one liked (Positive), and what they expect the platform to do next (Expectation). Every expectation is about what happens after a student and mentor are matched, which is Sprint 2's work.

**From S01 (student)**

| # | Feedback | Type | Decision | Where it goes |
|---|---|---|---|---|
| <span class="id">F-01</span> | Liked tagging the problem with narrow topics (*Computer vision*, *Speech technology*, *Research careers*) instead of a broad field. This was their main request in Milestone 1 | Positive | Keep as it is | — |
| <span class="id">F-02</span> | Liked the four-step tracker and the notice at each change: they knew IIC had the request and what was happening, instead of posting in groups and hoping for a reply | Positive | Keep as it is | — |
| <span class="id">F-03</span> | Liked the mentor page: expertise, experience, preferred channel and contact, with a first message drafted for them | Positive | Keep as it is | — |
| <span class="id">F-04</span> | Expects the mentorship to last beyond one conversation: a shared goal and next steps, and planned sessions with a reminder | Expectation | Build in Sprint 2, week 1 | US-06 (SCRUM-25), US-11 (SCRUM-28) |
| <span class="id">F-05</span> | Expects IIC to take the guidance-preferences box into account when choosing the mentor | Expectation | Build in Sprint 2 | US-20 (SCRUM-34) |
| <span class="id">F-06</span> | Expects a way to ask IIC for a different mentor if the match does not work, and to say whether the mentorship is helping | Expectation | Build in Sprint 2 | US-07 (SCRUM-26), US-08 (SCRUM-27) |

**From M01 (mentor)**

| # | Feedback | Type | Decision | Where it goes |
|---|---|---|---|---|
| <span class="id">F-07</span> | Liked seeing the student's level, courses, career interest, problem, goal and tags before accepting, so they can judge whether they can help a student they have never met | Positive | Keep as it is | — |
| <span class="id">F-08</span> | Liked controlling their own time: the availability switch, free time and time zone, and a capacity that IIC cannot exceed without asking them | Positive | Keep as it is | — |
| <span class="id">F-09</span> | Liked that declining needs only a reason from a short list, and the student goes back to the top of IIC's queue | Positive | Keep as it is | — |
| <span class="id">F-10</span> | Expects to log a short call of a few minutes as a session, without writing down what was said | Expectation | Build in Sprint 2, week 1 | US-11 (SCRUM-28) |
| <span class="id">F-11</span> | Expects to see the next steps the student marks as done, and to send IIC short progress feedback | Expectation | Build in Sprint 2, week 1 | US-06 (SCRUM-25), US-12 (SCRUM-29) |
| <span class="id">F-12</span> | Expects to end a mentorship from their side, with a reason, when the goal is met or they can no longer continue | Expectation | Build in Sprint 2 | US-13 (SCRUM-30) |

**From the TA**

| # | Feedback | Type | Decision | Change made |
|---|---|---|---|---|
| <span class="id">F-13</span> | Keep a separate branch for each member | Process | Keep doing it | Every member has their own branch (`abhijeet`, `priyanshu`, `shreya`, `khushi`, `saloni`) |
| <span class="id">F-14</span> | Follow the pull request review process before merging into `main` | Process | Keep doing it, and enforce it | Since 16 Nov, `main` is protected: a change goes in only through a pull request that passes the CI check, and a review is required. Review findings are posted on the pull request, for example the one on #28 |
| <span class="id">F-15</span> | Track problems with GitHub Issues instead of only internal communication | Process | Adopted in Sprint 1 | 15 GitHub issues, each with its cause and fix, all closed. Every new problem is opened as an issue |
| <span class="id">F-16</span> | Document each issue with its solution | Documentation | Adopted in Sprint 1 | The [issue log](issue-log.md), and each "actual output differed from expected" case in the [API test cases](01-api-test-cases.md) |
| <span class="id">F-17</span> | Keep the API documentation up to date and compile documentation systematically | Documentation | Adopted in Sprint 1 | `backend/openapi.yaml` is generated from the code and checked by a test (SCRUM-76). The milestone documents are built into one PDF with `npm run pdf:m3` |

### Keeping the Sprint 2 work within scope

Every expectation above is met by a user story already in the Milestone 1 report, so none needs a new story. The table shows what Sprint 2 builds for each one, and where it stops. The limits come from the client's clarifications in Milestone 1.

| Expectation | What Sprint 2 builds | What stays out, and why |
|---|---|---|
| F-04: keep the mentorship going | A goal for each mentorship and next steps for each meeting, each open or done with a completion date (US-06). Sessions planned with a date, time, channel (Google Meet, phone, email or other) and an optional meeting link, an email reminder 24 hours before, then marked held or cancelled (US-11) | No in-app chat, video or calendar integration. The client confirmed that conversations happen on Google Meet, email or phone |
| F-05: guidance preferences | An optional choice from a fixed list on the problem form, shown to IIC beside each recommended mentor's style (US-20) | The student still does not choose the mentor; IIC assigns every one. Only IIC sees the preferences |
| F-06: a way out, and saying whether it helps | A request to change or end the mentorship goes to IIC as a case (US-07), which IIC resolves (US-18). A progress status (no progress, some progress, goal met) with a comment, seen only by IIC (US-08) | No star ratings. IIC, not the student, picks the next mentor |
| F-10: log short calls | A held session records its duration (5 to 240 minutes, so a five-minute call counts) and a topic category. The other side confirms it, and IIC sees both counts (US-11) | No field for what was said, only an optional private note that just its author sees. Conversations stay confidential |
| F-11: next steps and progress feedback | The mentor sees the goal and next steps (US-06). A progress status every two weeks, seen only by IIC, and flagged when 7 days overdue (US-12) | No grades: the platform does not hold students' marks |
| F-12: end a mentorship | Ending with a reason (no longer available, goal achieved, not a good fit, other). The student and IIC are told, the mentor's capacity is freed, and the student is listed for reassignment if needed (US-13) | — |

### What we learned

- **Sprint 1 solves the first half of the problems these users described in Milestone 1.** S01 could not find anyone with experience in their niche, and posted in groups without knowing if anyone would reply. Narrow tags and a visible status address both (F-01, F-02). M01 mostly helped people they already knew, in short slots. The student's context and control over capacity address both (F-07 to F-09).
- **Their expectations are the second half, and Sprint 2 already plans it.** In Milestone 1, S01's mentoring always ended after one conversation, and M01 wanted the student to put in the effort. Both now expect goals, next steps, sessions and feedback (F-04, F-10, F-11). These are the first stories in Sprint 2 (US-06, US-11, US-12), and their endpoints were started in Sprint 1.
- **No expectation goes beyond the project's scope.** Each one maps to a Milestone 1 story. The client's limits stay in place: no chat or video, no record of what was said, IIC assigns every mentor (see the table above).
- **The TA's feedback was about process and documentation, not features.** The team adopted all five recommendations during Sprint 1 (F-13 to F-17), and continues them in Sprint 2.
- **One perspective is still missing.** S02 was not interviewed in this round, so the Milestone 4 session (SCRUM-84) includes a second student. It also shows S01 and M01 the Sprint 2 features, to check them against these expectations.
