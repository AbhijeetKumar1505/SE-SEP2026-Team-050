## Sprint 2 Plan

Sprint 2 (Milestone 4) runs from **23 November to 6 December 2026**. Its theme is **tracking**: once a student has a mentor (the end point of Sprint 1), the platform helps both sides keep the mentorship moving and gives IIC and leadership a view of it.

### What Sprint 1 delivered

- **All ten Sprint 1 stories have tested APIs:** US-01 to US-05, US-09, US-10 and US-14 to US-16. 58 operations are in `openapi.yaml`, every one has at least one test case, and the suite of 373 tests passes in CI (see the [API test cases](01-api-test-cases.md)).
- **The student, mentor and IIC pages of Sprint 1 call the API,** including sign-up and email verification.
- **Carried over into Sprint 2:** password reset has no endpoint yet, and its pages still use the in-memory mock (SCRUM-172).

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
| (carry-over) | SCRUM-172 | Add the password-reset endpoint and connect its pages | To be assigned at sprint planning | To do |

### Changes from user feedback

Each change below comes from the [user feedback report](02-user-feedback.md) and was made in Jira on 24 Nov 2026.

| Feedback | Change to the backlog | Jira |
|---|---|---|
| F-04, F-10, F-11: S01 and M01 expect goals, next steps, sessions and progress feedback | US-06, US-11 and US-12 stay first, in week 1. Each story now lists the user's expectation, to check in the Milestone 4 demo | SCRUM-25, SCRUM-28, SCRUM-29 |
| F-05, F-06, F-12: guidance preferences, a way to change mentor, feedback on the mentorship, ending from the mentor's side | Kept in the backlog as planned. Each story now lists the user's expectation, to check in the Milestone 4 demo | SCRUM-34, SCRUM-26, SCRUM-27, SCRUM-30 |
| Every expectation stays within the Milestone 1 scope (see the scope table in the feedback report) | No new story: no chat or video, no record of what was said, and IIC still assigns every mentor | — |
| F-01 to F-03, F-07 to F-09: what S01 and M01 liked in Sprint 1 | None: kept as it is | — |
| F-13 to F-17: the TA's process and documentation recommendations | None needed: all five were adopted in Sprint 1, and every Sprint 2 story follows them (its own branch, a reviewed pull request, a GitHub issue for each problem, the issue log, the generated YAML) | — |
| S02 was not interviewed in Sprint 1, and S01 and M01 should see their expectations built | The Milestone 4 feedback session includes S02, and shows S01 and M01 the Sprint 2 features | SCRUM-84 |
| Password reset was not finished in Sprint 1 | Carried over as its own task | SCRUM-172 |

### Order of work

1. **Week 1 (23–29 Nov):** SCRUM-170 first. Then finish the started stories (US-06, US-11, US-12, US-07) and connect their pages, plus the password-reset carry-over (SCRUM-172).
2. **Week 2 (30 Nov – 6 Dec):** US-13, US-17, US-18, US-21, US-19, US-20 and US-08. Then the Milestone 4 deliverables: YAML, test cases, pytest report, feedback session and submission, due 6 Dec.

### Risks

- **Short sprint.** Milestone 3 was extended to 25 Nov, so Sprint 2 effectively starts late. The started stories go first so that some are finished early.
- **SCRUM-170 blocks reminders and escalations.** If it slips, US-11's reminders and all of US-21 slip with it. It is reviewed at every scrum meeting.
