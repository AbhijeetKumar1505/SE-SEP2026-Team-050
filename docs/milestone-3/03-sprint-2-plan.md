## Sprint 2 Plan

> **Status: draft until the feedback session.** The backlog below is the Sprint 2 scope from the Milestone 2 schedule, updated with what Sprint 1 actually delivered. Fill in "Changes from user feedback" after the session, make the same changes in Jira, and delete this note before submitting.

Sprint 2 (Milestone 4) runs from **23 November to 6 December 2026**. Its theme is **tracking**: once a student has a mentor (the end point of Sprint 1), the platform helps both sides keep the mentorship moving and gives IIC and leadership a view of it.

### What Sprint 1 delivered

- **All ten Sprint 1 stories have tested APIs:** US-01 to US-05, US-09, US-10 and US-14 to US-16. 58 operations are in `openapi.yaml`, every one has at least one test case, and the suite of 361 tests passes in CI (see the [API test cases](01-api-test-cases.md)).
- **The student, mentor and IIC pages of Sprint 1 call the API.**
- **Carried over into Sprint 2:**
  - The sign-up and password-reset pages still use the in-memory mock. Students sign up through Swagger UI for now.
  - Password reset has no endpoint yet.

### Sprint 2 backlog

The owners are those in the Milestone 2 schedule (backend / frontend / tests). "Started" means some endpoints were built in Sprint 1 ahead of time and already have tests.

| Story | Jira | Goal | Owners | Status at sprint start |
|---|---|---|---|---|
| — | SCRUM-170 | Scheduled job runner for reminders and escalations. Comes first: US-11 and US-21 depend on it | Abhijeet | To do |
| US-06 | SCRUM-25 | Keep track of our goal and next steps | Priyanshu / Shreya / Shreya | Started: goal and next-step endpoints are tested |
| US-11 | SCRUM-28 | Schedule and log sessions without recording what was said | Priyanshu / Shreya / Shreya | Started: create, edit, cancel and confirm session endpoints are tested |
| US-12 | SCRUM-29 | Send progress feedback on my mentee | Priyanshu / Shreya / Shreya | Started: `POST /api/feedback` is tested |
| US-08 | SCRUM-27 | Give feedback on my mentorship | Priyanshu / Shreya / Shreya | To do |
| US-07 | SCRUM-26 | Ask to change or end my mentorship | Abhijeet / Shreya / Priyanshu | Started: `POST /api/cases` is tested |
| US-18 | SCRUM-32 | Resolve change, termination and misconduct cases fairly | Abhijeet / Khushi / Priyanshu | Started: capacity requests are done; case resolution to do |
| US-13 | SCRUM-30 | End a mentorship from my side | Priyanshu / Khushi / Shreya | To do |
| US-17 | SCRUM-31 | Monitor active mentorships | Abhijeet / Khushi / Priyanshu | To do |
| US-21 | SCRUM-159 | Stop assignments and mentorships from stalling | Abhijeet / Khushi / Priyanshu | To do (needs SCRUM-170) |
| US-19 | SCRUM-33 | See demand, supply and outcomes across the programme | Abhijeet / Khushi / Priyanshu | To do |
| US-20 | SCRUM-34 | Say how I like to be guided | Priyanshu / Shreya / Shreya | To do |
| — | SCRUM-81 | Complete Swagger YAML for Sprint 2 | Abhijeet | To do |
| — | SCRUM-82 | API test-case document for Sprint 2 | Saloni, with Priyanshu and Shreya | To do |
| — | SCRUM-83 | pytest output report | Priyanshu | To do |
| — | SCRUM-84 | User feedback session and final-sprint plan | Saloni | To do |
| — | SCRUM-85 | Milestone 4 submission | Saloni | To do |
| (carry-over) | [new issue] | Connect the sign-up and password-reset pages to the API, and add the password-reset endpoint | [owner] | To do |

### Changes from user feedback

Each change below comes from the [user feedback session](02-user-feedback.md) and was made in Jira on [date].

| Feedback | Change to the backlog | Jira |
|---|---|---|
| [F-01] | [new story / sub-task, re-prioritised, or acceptance criteria changed] | [SCRUM-xxx] |
| [F-02] | | |

### Order of work

1. **Week 1 (23–29 Nov):** SCRUM-170 first. Then finish the started stories (US-06, US-11, US-12, US-07) and connect their pages, plus the sign-up carry-over and the feedback fixes marked "Fix in Sprint 2".
2. **Week 2 (30 Nov – 6 Dec):** US-13, US-17, US-18, US-21, US-19, US-20 and US-08. Then the Milestone 4 deliverables: YAML, test cases, pytest report, feedback session and submission, due 6 Dec.

### Risks

- **Short sprint.** Milestone 3 was extended to 25 Nov, so Sprint 2 effectively starts late. The started stories go first so that some are finished early.
- **SCRUM-170 blocks reminders and escalations.** If it slips, US-11's reminders and all of US-21 slip with it. It is reviewed at every scrum meeting.
