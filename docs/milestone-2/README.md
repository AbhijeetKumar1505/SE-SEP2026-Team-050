# Milestone 2: Scheduling and Design

**Deadline: Saturday, 7 Nov 2026** (moved from 8 Nov in the project statement; the Jira target was already 7 Nov), submitted on the Project Portal. The report is built from the numbered Markdown files in this folder; `tech-stack.md` and `wireframes/` are working documents and are not part of the PDF.

## Status

- [x] Section 1: Design of components, including who can see what (1.9)
- [x] Section 2: Class diagram embedded, described and verified (6 Nov)
- [x] Section 3: ER diagram embedded, described and verified (6 Nov)
- [x] Section 4: Sprint schedule and Gantt chart
- [x] Section 5: Scrum minutes for every meeting, the TA reviews of 20 Oct and 2 Nov, the AI decision and the 6 Nov sprint review (SCRUM-54)
- [x] Section 6: Jira timeline and board screenshots (1 Nov)
- [x] Section 7: Account and student pages (4 Nov); mentor, IIC, insights and AI pages (6 Nov)
- [x] Frontend README and code ZIP (SCRUM-65): `frontend/README.md` has the install, run and navigation instructions; `submission/frontend.zip` is built from it
- [x] `team-050-milestone-1-2.zip` built in `submission/` with the 10 required files (SCRUM-67)
- [x] Validity check passed for `team-050-milestone-1-2.zip` (upload it to the validity form and wait for the PASS email)
- [x] PDF built and proofread: no `TO FILL` or `TO CHECK` left

## Diagram review notes (SCRUM-51, SCRUM-52)

The class and ER diagrams were verified on 6 Nov and the `TO CHECK` notes removed from Sections 2 and 3. This list of where they differed from Section 1 was the input to that check. Keep it for Sprint 1, when the data models are coded (SCRUM-70).

**Class diagram (Section 2)**

1. **Who starts a match.** The diagram has `Student.requestMatch()` and the student initiating a `MatchRequest`. In Section 1 the IIC coordinator assigns a mentor (C7, US-16) and the student never sees recommendations (C6). The request should come from `IICCoordinator`. It could be renamed `Assignment`, with the statuses *Awaiting response*, *Accepted*, *Declined* and *Expired* (Section 1.7).
2. **Feedback has a rating.** `ProgressFeedback.rating` conflicts with C10, which says "no form has a rating". It should hold a progress status: no progress, some progress or goal met.
3. **Timing windows.** `ProgrammeManager.configureTimingWindows()` conflicts with C4: only IIC changes settings. Move it to `IICCoordinator`.
4. **Missing classes.** There is nothing for the roster (C2), mentor availability and capacity (C3), settings and approved domains (C4) or monitoring flags (C11).
5. **Sessions.** `Meeting` lacks the channel, duration, topic category, who logged it and who confirmed it (C9). Its notes must be private to their writer, and `logSession(notes)` should not suggest recording what was said.
6. **Profile and problem fields.** `StudentProfile` lacks level, CGPA, completed courses and career interest (C2, C7). `Problem` lacks desired outcome and guidance preferences (C5).

**ER diagram (Section 3)**

1. **Stored recommendations.** RECOMMENDATION stores a score and a time, but C6 owns no data: it calculates recommendations each time they are requested. Either drop the table or change C6 to keep a record of what IIC was shown.
2. **Feedback rating.** Same as class diagram item 2. FEEDBACK also needs the author's role.
3. **Roster.** STUDENT.user_id is a unique foreign key, but IIC imports the roster before students sign up (C2). Either user_id must allow NULL, or the roster needs its own table. STUDENT also lacks institute email, level, CGPA, completed courses and career interest.
4. **Assignment details.** MENTORSHIP has no assigned_by, decline reason, reached_out_at or end reason (C7). Its next_steps column is text, while C7 and the class diagram have next steps with their own status and completion date (a NEXT_STEP table).
5. **Mentor fields.** MENTOR lacks capacity, preferred channel, mentoring style, and who verified the mentor and when (C3).
6. **Sessions.** SESSION lacks channel, link, duration, topic category, logged_by and confirmed_by (C9). Its notes must be private to their writer.
7. **Cases.** CASE_RECORD lacks the other party's response, the decision, and who decided and when (C8).
8. **Notices.** NOTIFICATION records emails only. C13 also keeps dashboard notices with read and unread status.
9. **Problem fields.** PROBLEM lacks desired outcome and guidance preferences (C5).
10. **Verification links.** EMAIL_VERIFICATION stores token hashes, but C1 says the links are signed and time-limited and so are not stored. Pick one approach and make both say the same.
11. **Roles.** USER_ROLE lets one account hold several roles. Section 1 gives each account one role (C1). Confirm which is intended.

**Between the two diagrams.** The class diagram has MatchRequest and NextStep, which the ER diagram does not. The ER diagram has RECOMMENDATION, AVAILABILITY, MONITORING_FLAG, TIMING_WINDOW, EMAIL_DOMAIN and EMAIL_TEMPLATE, which the class diagram does not. After the fixes above, each class that holds data should have a table.

The source diagrams are in `diagrams/` (`classdia.pdf`, `ER.pdf`). The report uses PNG copies in `images/`, so re-export them after changing a diagram. Note that `User Profile and Role Diagram.pdf` is the ER description and `Student Mentor Management Class Diagram.pdf` is the class description.

## Building the PDF

Requires Node 18+ and Chrome or Edge.

```bash
cd docs
npm install
npm run pdf:m2
```

The output is written to `docs/milestone-2/build/team-050-milestone-2.pdf`. Text in `backticks` is highlighted in yellow, so placeholders are easy to spot.
