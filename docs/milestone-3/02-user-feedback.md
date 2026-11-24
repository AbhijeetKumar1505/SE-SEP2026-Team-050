## User Feedback Session (Sprint 1)

> **Status: to be filled in after the session.** Everything in a `[square-bracket]` placeholder must be replaced with what the participants actually said and did. Delete this note before submitting.

The team demonstrated the Sprint 1 features to end users and recorded their feedback (SCRUM-79). The feedback was then used to adjust the Sprint 2 backlog in Jira; the changes are in the [Sprint 2 plan](03-sprint-2-plan.md).

### Session details

| | |
|---|---|
| Date and time | [date, time] |
| Format | [Google Meet, screen shared; recorded with consent / not recorded] |
| Facilitator | Saloni Puri (Product Manager) |
| Note-taker | [name] |
| Build shown | `main` at commit [short hash], run locally with `bash scripts/wsl/start.sh` (API, web app and Mailpit) |

Participants are identified by the same IDs as in the Milestone 1 report.

| ID | Role in the demo | Who they are (from Milestone 1) |
|---|---|---|
| S01 | Student | Degree-level student planning a master's or PhD abroad |
| S02 | Student | Graduating student choosing between a job, a startup and the family business |
| M01 | Mentor | IITM BS graduate who already guides juniors informally |
| [TA name] | IIC coordinator | Teaching assistant acting as IIC |

### What was demonstrated

The demo followed one student from IIC's roster to an accepted mentorship, using the seeded demo accounts (password `Password123!`) and Mailpit at http://localhost:8025 for emails.

| Step | Who drove it | Feature and user story | Pages and endpoints |
|---|---|---|---|
| 1 | IIC | Import the roster, add a mentor and verify them (US-15, US-14) | IIC students and mentor pool pages; `POST /api/students/roster/import`, `POST /api/mentors`, `POST /api/mentors/{id}/verify` |
| 2 | Mentor | Open the activation email in Mailpit, activate the account, set availability (US-14, US-10) | `/activate/:token`, mentor profile; `PUT /api/mentors/me` |
| 3 | Student | Sign up with an institute email on the roster and verify it (US-01), complete the profile (US-02), submit a problem (US-03) | Swagger UI for sign-up; `/student/profile`, `/student/problem/new` |
| 4 | IIC | Open the queue, review the problem, look at the recommended mentors and assign one (US-16, US-04) | IIC problem queue; `GET /api/problems/queue`, `GET /api/matching/problems/{id}/recommendations`, `POST /api/problems/{id}/assign` |
| 5 | Mentor, then student | The mentor accepts with the student's context (US-09); the student sees their mentor and records that they reached out (US-05) | Mentor dashboard, student home; `POST /api/mentors/mentorships/{id}/accept`, `POST /api/mentorships/{id}/reached-out` |

### Questions asked

After each step the participant whose role it was answered:

1. Was it clear what to do next? Where did you hesitate?
2. Is anything missing that you expected to see or do here?
3. Is anything here that you would not use?

At the end, everyone answered:

4. **Students:** Would you trust the mentor IIC assigns from these recommendations? What would make you more likely to reach out?
5. **Mentor:** Does the assignment give you enough context to accept or decline quickly? Is setting availability and capacity reasonable for how much time you have?
6. **IIC:** Does the queue and the recommendation list let you assign a mentor without leaving the platform?
7. **All:** On a scale of 1 to 5, how useful would this be to you today? What is the one change that would help you most?

### Feedback received

Record each point separately, with who raised it and what the team decided. "Sprint 2 change" should name the Jira issue that was created or changed.

| # | From | Step | Feedback (their words where possible) | Type | Decision | Sprint 2 change |
|---|---|---|---|---|---|---|
| F-01 | [S01] | [3] | [feedback] | [Bug / Usability / Missing feature / Positive] | [Fix in Sprint 2 / Later / No change, because …] | [SCRUM-xxx] |
| F-02 | | | | | | |
| F-03 | | | | | | |
| F-04 | | | | | | |
| F-05 | | | | | | |
| F-06 | | | | | | |

### Ratings

| Participant | Usefulness (1–5) | The one change that would help most |
|---|---|---|
| S01 | [ ] | [ ] |
| S02 | [ ] | [ ] |
| M01 | [ ] | [ ] |
| [TA] | [ ] | [ ] |

### What we learned

[Three to five sentences summarising the themes: what worked, what confused people, and what the team will change. Refer to the feedback by its F number.]
