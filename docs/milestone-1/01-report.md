<div class="title-page">

# Student Mentoring and Career Support Platform

## Milestone 1 — User Identification, User Research and SMART User Stories

**Course:** IITM BS Software Engineering, September 2026 term\
**Team:** 050\
**Problem statement:** Option 2 — Student Mentoring and Career Support Platform\
**Client:** IIC, IITM BS programme administration\
**Submission date:** 25 October 2026

| Team member | Roll number | Project roles | Contribution to Milestone 1 |
|---|---|---|---|
| Abhijeet Kumar | 24f2007359 | Backend Developer, Code Reviewer | Interviews M01 and S02, synthesis, report |
| Priyanshu Yadav | 23f1000018 | Tester, Backend Developer | `[contribution]` |
| Saloni Puri | 23f3003439 | Product Manager, Scrum Master | `[contribution]` |
| Shreya Pal | 21f1002298 | Tester, Frontend Developer | `[contribution]` |
| Khushi Dhankhar | 23f3003132 | Frontend Developer, Scrum Master | `[contribution]` |

</div>

<div class="page-break"></div>

## Contents

- Introduction
- Section 1: Users Identified
- Section 2: Stories Heard and Pain Points Analysed
- Section 3: SMART User Stories
- Section 4: Summary and Traceability
- Appendices: interview guides and consent script (A), evidence log (B), recording evidence index (C)

## Introduction

Students nearing graduation from the IITM BS Degree Program have to make decisions about jobs, higher studies, entrepreneurship and other career paths. Many of them cannot easily reach people who have recently made the same decisions. The client, IIC (the IITM BS team that runs mentoring), wants a platform that connects current students with alumni mentors. It should support verified sign-up, IIC-led matching, ongoing mentoring and programme-level insight.

The problem statement lists seven expected outcomes. Every user story in Section 3 maps to at least one of them.

| ID | Expected outcome |
|---|---|
| PS-1 | Students can create and communicate their mentoring needs and interests. |
| PS-2 | Alumni have mentoring profiles showing the areas they can guide in. |
| PS-3 | Students can discover, or be matched with, suitable mentors. |
| PS-4 | Requests, acceptance/rejection and management of mentoring relationships are supported. |
| PS-5 | Interactions and mentoring activities can be tracked. |
| PS-6 | Students, mentors and administrators each get role-appropriate functionality. |
| PS-7 | The programme gets insight into participation and effectiveness. |

**How to read this report.** Participants are identified only by ID: S = student, M = alumnus/mentor, A = client (IIC). Quotes from S01, S02 and M01 are verbatim from automatic transcripts, with clarifications in [square brackets]. A01 entries are the team's notes of what the client said. Pain points are labelled P-01 to P-13 so that each story can cite the evidence behind it.

<div class="page-break"></div>

## Section 1: Users Identified

We classify users using the definitions from the course lectures:

- **Primary users** use the product most frequently and directly; the product succeeds or fails on whether it serves them.
- **Secondary users** use it less often, or use it in support of the primary users, usually through a different interface or permission set.
- **Tertiary users** do not operate the product, but are affected by its output or influence how it is adopted.

| Class | User group | How they use the platform |
|---|---|---|
| **Primary** | Current IITM BS students seeking guidance | Sign up if registered with IIC, complete their profile, submit the problem they need help with, contact the mentor IIC assigns, track next steps, give feedback, ask to change mentor |
| **Primary** | IIC coordinators (programme administrators; TAs during the project) | Keep the registered-student list, add mentors each cycle, assign a mentor to every problem from the system's recommendations, monitor mentorships, resolve cases |
| **Secondary** | Alumni and recent-graduate mentors (volunteers) | Keep availability and contact preference current, receive assigned students, log meetings, send progress feedback |
| **Tertiary** | IITM BS programme leadership | Read aggregate reports on demand, supply and outcomes |
| **Tertiary** | Alumni not yet volunteering | Recruited each cycle based on the demand the platform reveals |
| **Tertiary** | Student wellbeing support | Receives referrals when a student's need is about wellbeing rather than career |

### 1.1 Primary users

**Students.** Students are the people the platform exists for, and every mentorship starts with one of them. All three user interviews confirmed the need. S01, a degree-level student planning a master's or PhD abroad, needs advice "a lot of times" but finds it only by posting in groups and hoping someone replies. S02, a graduating student choosing between a job, a startup and the family business, finds seniors only through WhatsApp groups and friends. M01, now an alumnus, described the same struggle from their own student years. Students use the platform directly and repeatedly: to sign up, state the problem they need help with, contact the mentor IIC assigns, keep track of the mentorship, and give feedback. They do not search for mentors themselves.

**IIC coordinators.** We first expected administrators to be tertiary users. The client session (A01) showed otherwise. Only students registered with IIC may sign up. IIC reviews every student's problem and assigns every mentor ("each mentorship needs to be approved, automatic won't work"), adds the mentor pool each cycle, and plans to monitor mentorships weekly or biweekly. That is frequent, hands-on use, so IIC coordinators are primary operational users. TAs will play this role during the project.

### 1.2 Secondary users

**Alumni mentors.** Mentors are IITM BS graduates who volunteer to give back. They are working or in higher studies, may be anywhere in the world, and must not be micromanaged (A01). They use the platform directly but occasionally: to keep their availability current, see the students IIC has assigned to them, log meetings and send progress feedback. Conversations happen over the mentor's own channel, such as email or a call. M01 illustrates the role well: they already guide juniors, but only in "five minutes … in between" other commitments. Because mentors use the platform in support of the students, through their own interface, they are secondary users.

### 1.3 Tertiary users

**Programme leadership.** IITM BS management decides whether the mentoring programme continues and how many mentors to recruit. They do not run day-to-day matching, but they consume the platform's aggregate reports (PS-7) to make those decisions.

**Alumni not yet volunteering.** IIC invites alumni to volunteer each cycle (A01). The demand the platform records, for example many students asking for computer-vision guidance and no mentor available, determines whom IIC approaches next, so these alumni are affected without using the system.

**Student wellbeing support.** The client noted that students sometimes come to IIC feeling overwhelmed rather than with a career question. Those cases need to reach the right support service, so that team is affected by the platform even though it never logs in.

**Not users:** the placement team. The client confirmed that placement is out of scope.

<div class="page-break"></div>

## Section 2: Stories Heard and Pain Points Analysed

We held two meetings with the client: a problem-statement discussion on 11 Oct 2026, and a requirements session on 15 Oct 2026 (A01). We also ran three semi-structured user interviews, of 11–17 minutes each. Every interview asked about real past events ("Tell me about the last time…") rather than about features (guides in Appendix A). Each story below is written from the transcript or notes. Nothing has been added, and pain points come from what the participant described.

| ID | User group | Profile (anonymised) | Date | Mode | Duration | Interviewer |
|---|---|---|---|---|---|---|
| S01 | Student | Degree level; plans a master's or PhD abroad in neuroscience / deep learning | `[date]` | `[mode]` | `[min]` | `[member]` |
| S02 | Student | Graduating; choosing between a job, a startup and the family business | 12 Oct 2026 | Google Meet (recorded) | ~11 min | Abhijeet Kumar (24f2007359) |
| M01 | Alumnus / mentor | IITM BS graduate; informally guides juniors | 13 Oct 2026 | Google Meet (recorded) | ~16 min | Abhijeet Kumar (24f2007359) |
| A01 | Client (IIC) | IIC representative, IITM BS admin team | 15 Oct 2026 | `[mode]` | `[min]` | `[member]` |

### Interview S01: niche electives and mentoring that stops after one conversation

| | |
|---|---|
| **Interviewer** | `[member, roll no.]` |
| **Interviewee** | Anonymous degree-level student |
| **Topic** | Finding guidance for higher studies, niche courses and a niche project |
| **Recording** | Automatic transcript (team drive); consent for excerpt use to be confirmed in writing |

**Story**

The interviewee plans a master's or PhD abroad in neuroscience and deep learning. They need advice "a lot of times". When they do, they post a message in unofficial student groups or use official resources and hope someone answers: "it's not always guaranteed, I'll get help." Sometimes they have to work things out alone.

Recently they wanted to take electives in speech technology and deep learning for computer vision, but found it "very hard to find a student who had taken those courses", because few students take them. They also needed someone who had worked on a similar problem for a niche project. They could not find anyone ("it is a niche topic and not a lot of people know about it"), and reaching people beyond their own degree track was hard. They still have not found help.

They judge advice by the adviser's intentions and whether the adviser has relevant domain knowledge. If either is missing they take it "with a pinch of salt" and cross-check with others or online. They have tried mentoring a couple of times, and "every single time it ended after a single conversation", because the person did not have the domain knowledge the problem needed. Their one good experience came from a friend a term ahead, who had relevant experience and shared notes for a hard AI course. They see people posting requests for help "every day".

**Pain points**

- Requests for help posted in groups may go unanswered; there is no reliable way to reach someone.
- Almost nobody with experience of niche electives can be found.
- There is still no help for their niche project, and reaching people outside their degree track is hard.
- They have to judge an adviser's credibility themselves and cross-check the advice elsewhere.
- Every mentoring attempt ended after one conversation.
- The only good guidance came through a personal friend.

### Interview S02: advice that reflects someone else's situation

| | |
|---|---|
| **Interviewer** | Abhijeet Kumar (24f2007359) |
| **Interviewee** | Anonymous graduating student |
| **Topic** | Career choice, course planning, and how advice is found and judged |
| **Recording** | Fathom recording, 12 Oct 2026 (team drive); consent for excerpt use to be confirmed in writing |

**Story**

The interviewee is choosing between a job, starting a startup and joining the family business, "whichever is giving me a good growth in my career". At the start of the degree they found seniors through WhatsApp groups and connections made online.

When they asked about which courses to take, people answered from their own perspective even though "my condition is different, they are thinking with their perspectives". So the interviewee described their whole situation to ChatGPT and did their own analysis. They also find that some people give advice casually "for the sake of the connection", without really putting in effort, so they never follow advice blindly.

Two close friends give them good advice on courses and CGPA, and they keep going back to those friends. This term a friend suggested two easy and two hard courses; the interviewee checked the course portal's week-by-week content before deciding. Asked what would worry them about a mentoring platform, they said a mentor might be biased or "not liking my vibe", and they did not want a bad interaction to take their time or affect their mental health.

**Pain points**

- Seniors can only be found through informal channels such as WhatsApp groups and online connections.
- Advice reflects the adviser's situation rather than theirs, so they have to verify it themselves (ChatGPT, course pages).
- Some advice is given casually, without real effort.
- Useful guidance depends on two close friends.
- They worry that a biased or badly matched mentor would waste their time and affect their wellbeing. They described this as a risk, not something that has happened.

### Interview M01: helping juniors around a busy schedule

| | |
|---|---|
| **Interviewer** | Abhijeet Kumar (24f2007359) |
| **Interviewee** | Anonymous IITM BS graduate |
| **Topic** | Their own path after graduating, and how they help juniors |
| **Recording** | Fathom recording, 13 Oct 2026 (team drive); suggested excerpt ≈ 08:09–11:45; consent to be confirmed in writing |

**Story**

The interviewee has been applying for jobs since February. They have not got one through the official placement portal, but got "two, three internships" through friends. They estimate that over 2,000 degree-level students and graduates are in the program's WhatsApp groups, yet "I don't actually feel … connected with them".

They help juniors, but "not everyone, but at least the people I know and I respect". They advise juniors on how many subjects to take based on capacity and time, give basic advice on GATE, which they qualified, and help students stuck on projects. They were stuck on projects themselves as a student: "It felt like total blindness … I had to bit by bit text a whole lot of people to ask them doubts and convince them to come in to meet." Now they offer help in WhatsApp groups, but do not spoon-feed: "They themselves have to want to complete it."

On time, they said "you might not have half an hour to give someone but five minutes you can give in between": a short call, or a late-night slot when both are free. It depends on how motivated and flexible the student is.

**Pain points**

- As a student, getting help meant texting many people one by one and persuading them to meet.
- Large WhatsApp groups do not create real connections.
- Their help reaches mainly people they already know, so access depends on personal networks.
- A mentor's free time comes in short, irregular slots.
- Mentoring works only when the student brings a specific problem and puts in effort.

### Client session A01: how IIC runs mentoring today

| | |
|---|---|
| **Taken by** | `[member(s)]` |
| **Participant** | IIC representative, IITM BS admin team (the client) |
| **Date** | 15 Oct 2026 (preceded by a problem-statement meeting on 11 Oct 2026) |
| **Record** | Team notes, `docs/milestone-1/transcripts/A01.md` |

**What the client told us**

IIC supplies the mentors. They are alumni volunteers, working or in higher studies, who want to give back and must not be micromanaged. They do not register themselves: IIC asks alumni every cycle, or about twice a year. Students approach IIC asking for mentors. They register with their background, CGPA, courses and the specific problem they need help with, and they are approved. The system should then "throw available mentors" that fit. IIC approves every match ("automatic won't work"), and it is one mentor to one student. If a mentor already has a student, IIC may ask them to take another.

Mentorship is short-term, for one term or one problem, with no minimum or maximum number of meetings. Conversations are confidential and IIC does not listen in, but IIC should see how many meetings took place and get feedback, mainly from mentors, on whether progress is being made. There is no rating system. A student can ask to change mentor; IIC then hears the mentor's side. Either side can end a mentorship. One complaint does not remove a mentor, but profiles flagged for misconduct are removed. "There is no current monitoring system for students," and tracking a mentee's progress "tangibly" is the expected challenge.

**Out of scope:** placement, payments, language preference. An AI agent is optional.

**Pain points and constraints**

- Every student registration and every match needs IIC's approval, and both are handled by hand: IIC works out each student's needs and finds an available mentor itself.
- No monitoring exists, and any monitoring must not expose conversation content.
- Volunteers must not be flooded with requests ("don't trouble mentors by messaging all matching mentors").
- Mentors are recruited only periodically; when demand grows, IIC asks mentors one by one.
- Changing or ending a mentorship needs a fair process that hears both sides.

### 2.1 Consolidated pain points

The same problems came up across interviews. We grouped them into 13 pain points. **Frequency** counts the user interviews that reported a problem (out of 3; out of 1 for mentor-only problems) and notes when the client confirmed it.

| ID | Group | Pain point | Evidence | Frequency | Confidence |
|---|---|---|---|---|---|
| P-01 | Students | Asking for help means broadcasting in groups or messaging people one by one, with no guarantee of a reply | S01, S02, M01 | 3/3 | High |
| P-02 | Students | People with experience of a niche course, topic or problem are very hard to find | S01, M01; A01 | 2/3 + client | High |
| P-03 | Students | Access to guidance depends on personal networks | S01, S02, M01 | 3/3 | High |
| P-04 | Students | Advice reflects the adviser's own situation or is given casually, so students must verify it themselves | S01, S02 | 2/3 | High |
| P-05 | Students | Guidance stops after one conversation | S01; A01 | 1/3 + client | Medium |
| P-06 | Mentors | Mentors' free time is short and irregular, and they may be in other time zones | M01; A01 | 1/1 + client | Medium |
| P-07 | Mentors | Mentoring only works when the student brings a specific problem and effort | M01; A01 | 1/1 + client | Medium |
| P-08 | Mentors | Volunteers must not be flooded with unsolicited requests or micromanaged | A01; M01 | Client | Medium |
| P-09 | IIC | Student approval and matching are done by hand | A01 | Client | Medium |
| P-10 | IIC | No visibility of whether mentorships are active or helping, and conversations must stay confidential | A01; S01 | Client + 1/3 | High |
| P-11 | All | No fair, structured way to change or end a mentorship | A01 | Client | Medium |
| P-12 | IIC | Mentor supply is recruited periodically; extra capacity is requested one mentor at a time | A01 | Client | Medium |
| P-13 | Students | Fear that a poorly matched mentor will waste time and affect wellbeing | S02; A01 | 1/3 + client | Low (anticipated) |

**What already works:** a near-peer with directly relevant experience who stays available (S01's senior; S02's two friends), and short calls that give direction rather than answers (M01).

**Observed but not carried forward:**

| Observation | Source | Reason |
|---|---|---|
| Placement portal and AI-interview problems | M01 | Placement is out of scope (client) |
| Students would pay for good matching | S01 | Volunteer programme, no payments (client) |
| Rating mentors | Our initial draft | No rating system (client) |
| Alumni-facing dashboard of student profiles | M01 suggestion | Conflicts with IIC approval and confidentiality; aggregate insight goes to leadership instead (US-19) |
| Students searching for and choosing mentors themselves | S01 suggestion; our first draft | IIC assigns every mentor. Students submit their problem instead (US-03), and topic tags keep matching specific (US-04) |
| Personality questionnaire and automated matching model | S02 suggestion | IIC assigns every mentor; the underlying concern is covered by US-20 |

**Limitations.** The sample is small: two students and one alumnus, plus the client. All three interviews ended with a question inviting feature suggestions. We did not treat those answers as evidence, and every pain point above comes from an experience the participant described. Transcripts are automatic and contain errors. Participants were recruited through our own network.

<div class="page-break"></div>

## Section 3: SMART User Stories

Each requirement is written in the format required by the course:

> As a **[type of user]**,\
> I want **[an action]**,\
> So that **[a benefit/value]**.

Each story also includes:

- **SMART check:** how the story satisfies each criterion (Specific, Measurable, Achievable, Relevant, Time-bound).
- **Acceptance criteria:** testable Given / When / Then conditions that define "done".
- **Interview evidence:** the pain points and participants behind the story. These are problems people described, never their feature requests.
- **Platform feature:** the epic and problem-statement outcome (PS-x) the story belongs to.

**Time-bound** means the sprint in which the story is built and tested: Sprint 1 = Milestone 3 (due 22 Nov 2026), Sprint 2 = Milestone 4 (due 06 Dec 2026). **Priority** uses MoSCoW. **Status** is *Validated* (required by the client or supported by two or more sources), or *Partially validated* (one source).

### Story index

| ID | Role | Title | Priority | Sprint | Status |
|---|---|---|---|---|---|
| US-01 | Student | Sign up only if I am registered with IIC | Must | 1 | Validated |
| US-02 | Student | Complete my basic profile | Must | 1 | Validated |
| US-03 | Student | Submit the problem I need help with | Must | 1 | Validated |
| US-05 | Student | Track my request and connect with my assigned mentor | Must | 1 | Validated |
| US-06 | Student | Keep track of our goal and next steps | Should | 2 | Partially validated |
| US-07 | Student | Ask to change or end my mentorship | Should | 2 | Validated |
| US-08 | Student | Give feedback on my mentorship | Should | 2 | Validated |
| US-20 | Student | Say how I like to be guided | Could | 2 | Partially validated |
| US-09 | Mentor | Hear only about students assigned to me, with context | Must | 1 | Validated |
| US-10 | Mentor | Set my availability, contact preference and capacity | Must | 1 | Validated |
| US-11 | Mentor | Log a meeting without recording what was said | Must | 2 | Validated |
| US-12 | Mentor | Send progress feedback on my mentee | Must | 2 | Validated |
| US-13 | Mentor | End a mentorship from my side | Should | 2 | Validated |
| US-14 | IIC | Add mentors to the pool | Must | 1 | Validated |
| US-15 | IIC | Keep the list of IIC-registered students up to date | Must | 1 | Validated |
| US-04 | IIC | See 3–4 recommended mentors for each problem | Must | 1 | Validated |
| US-16 | IIC | Assign a mentor to each student's problem | Must | 1 | Validated |
| US-17 | IIC | Monitor active mentorships | Must | 2 | Validated |
| US-18 | IIC | Resolve change, termination and misconduct cases | Should | 2 | Validated |
| US-19 | Leadership | See demand, supply and outcomes | Should | 2 | Partially validated |

Students do not search for or choose mentors: they submit their problem, and IIC assigns a mentor from the system's recommendations. US-04 was first written as a student story and is now an IIC story, so it is listed with the IIC stories.

<div class="page-break"></div>

### 3.1 Student stories

**US-01 — Sign up only if I am registered with IIC**\
As an IITM BS student who wants a mentor,\
I want to sign up with my roll number and institute email and have them checked against IIC's list of registered students,\
So that I can start as soon as IIC has registered me, while people IIC has not registered cannot use the platform.

| SMART check | |
|---|---|
| **S&nbsp;—&nbsp;Specific** | Sign-up with roll number and institute email, checked against the IIC registered-student list (US-15). |
| **M&nbsp;—&nbsp;Measurable** | A matching record creates the account and opens profile completion (US-02); no match creates no account and shows "You are not registered with IIC"; one account per roll number. |
| **A&nbsp;—&nbsp;Achievable** | A lookup against one imported table before the account is created. |
| **R&nbsp;—&nbsp;Relevant** | The client requires every student to be approved before taking part (A01); today IIC does this by hand (P-09). |
| **T&nbsp;—&nbsp;Time&#8209;bound** | Sprint 1, Milestone 3 (22 Nov 2026). |

*Acceptance criteria*

- Given my roll number and institute email match a record in IIC's registered-student list, when I sign up, then my account is created and I am taken to complete my profile.
- Given no record matches, when I sign up, then no account is created and I see "You are not registered with IIC. Please contact IIC to register."
- Given an account already exists for my roll number, when I try to sign up again, then I am told to log in instead.

*Interview evidence:* P-09. A01: "Students register, will have to give a lot of info, will have to be approved." Checking against IIC's own list replaces a manual approval queue: IIC approves a student by registering them (US-15).

*Platform feature:* Onboarding & profiles · PS-6

---

**US-02 — Complete my basic profile**\
As a student who has just signed up,\
I want to complete a short profile with my level (BSc or BS), CGPA, completed courses and career interest,\
So that IIC and my future mentor know my academic background without asking me for it each time.

| SMART check | |
|---|---|
| **S&nbsp;—&nbsp;Specific** | A profile form with level, CGPA, completed courses and career interest (job, higher studies, entrepreneurship or other); name and roll number come from the IIC record. |
| **M&nbsp;—&nbsp;Measurable** | Level accepts only BSc or BS; CGPA must be 0–10; at least one completed course; the problem the student needs help with is not part of the profile (US-03); no problem can be submitted until the profile is complete. |
| **A&nbsp;—&nbsp;Achievable** | One form with server-side validation. |
| **R&nbsp;—&nbsp;Relevant** | The client asks students for their "background, cgpa, courses" and limits the programme to students past the Diploma level ("only for diploma passout", A01); mentors need this context before they can help (P-07). |
| **T&nbsp;—&nbsp;Time&#8209;bound** | Sprint 1, Milestone 3. |

*Acceptance criteria*

- Given I have just signed up, when I open my profile, then my name and roll number are filled in from the IIC record and cannot be edited.
- Given I choose my level, when the options are shown, then only BSc and BS are available.
- Given a required field is missing or my CGPA is outside 0–10, when I save, then nothing is saved and each invalid field is named.
- Given my profile is incomplete, when I try to submit a problem (US-03), then I am asked to complete my profile first.

*Interview evidence:* P-04, P-07. S01 plans higher studies abroad and S02 is choosing between a job, a startup and the family business; advice that ignored their situation did not help ("my condition is different"). M01 advises juniors "according to their capacity … and their time constraints", which needs that context up front.

*Platform feature:* Onboarding & profiles · PS-1

---

**US-03 — Submit the problem I need help with**\
As a student with a complete profile,\
I want to describe the specific problem I need help with, tag its topics and say what I hope to achieve,\
So that IIC can find me a mentor who has dealt with exactly that problem, instead of my posting in groups and hoping for a reply.

| SMART check | |
|---|---|
| **S&nbsp;—&nbsp;Specific** | A problem form with a description, 1–5 topic tags from a fixed list and an optional desired outcome; optional guidance preferences can be added on the same form (US-20). It goes to IIC, not to mentors. |
| **M&nbsp;—&nbsp;Measurable** | Description 30–1000 characters; 1–5 tags; one open problem per student and none while a mentorship is active; saved as *Submitted*; editable or withdrawable until a mentor is assigned; never visible to mentors before assignment. |
| **A&nbsp;—&nbsp;Achievable** | One form and a status field. |
| **R&nbsp;—&nbsp;Relevant** | The most common problem across all three interviews: no reliable way to reach the right person (P-01, P-03), especially for niche needs (P-02). The client says students must be "very specific about their requirements" (A01) and mentors must not receive unsolicited requests (P-08). |
| **T&nbsp;—&nbsp;Time&#8209;bound** | Sprint 1, Milestone 3. |

*Acceptance criteria*

- Given my profile is complete and I have no open problem or active mentorship, when I submit a description of 30–1000 characters with 1–5 topic tags, then it is saved as *Submitted* and appears in IIC's queue (US-16).
- Given I already have an open problem or an active mentorship, when I try to submit another, then I am refused ("one mentor per student").
- Given my problem has not been assigned yet, when I edit or withdraw it, then the change is saved, and a withdrawn problem leaves IIC's queue.
- Given my problem has not been assigned to a mentor, when that mentor opens their dashboard, then they cannot see it.

*Interview evidence:* P-01, P-02, P-03, P-07, P-08. S01: "put out a message and hope that someone would answer for me and it's not always guaranteed"; S01 could not find anyone for "speech technology and deep learning for computer vision". A01: "IIC is approached by students asking for mentors"; "Students need to be very specific about their requirements."

*Platform feature:* Mentor matching · PS-1, PS-4

---

**US-05 — Track my request and connect with my assigned mentor**\
As a student who has submitted a problem,\
I want to see its status and, once IIC assigns a mentor, see their expertise, experience and contact details,\
So that I know where I stand and can contact a mentor whose background I can judge, without searching through groups.

| SMART check | |
|---|---|
| **S&nbsp;—&nbsp;Specific** | A status tracker for the student's problem and, after assignment, the mentor's profile (expertise tags and experience entries) and contact details. |
| **M&nbsp;—&nbsp;Measurable** | Statuses *Submitted*, *Under review*, *Mentor assigned*, *Closed by IIC* (with reason) and *Withdrawn*; the student is notified of every change; no mentor details appear before assignment; a mentor's contact details are visible only to their assigned mentee. |
| **A&nbsp;—&nbsp;Achievable** | A status field, notifications and a read-only profile view. |
| **R&nbsp;—&nbsp;Relevant** | Students currently post and "hope that someone would answer" (P-01) and judge advice by the adviser's domain knowledge (P-04). The client says each mentor states their preferred mode of communication when they join (A01). |
| **T&nbsp;—&nbsp;Time&#8209;bound** | Sprint 1, Milestone 3. |

*Acceptance criteria*

- Given I have submitted a problem, when I open my dashboard, then I see its current status.
- Given IIC assigns a mentor, when the assignment is saved, then I am notified and can see the mentor's expertise tags, experience entries (type, title and duration), preferred contact mode and contact details.
- Given my problem has not been assigned, when I open my dashboard, then no mentor details are shown.
- Given IIC closes my problem, when the decision is saved, then I see the reason and can submit a new problem.

*Interview evidence:* P-01, P-04. S01: "it's not always guaranteed, I'll get help"; S01 judges advice by "relevant domain knowledge", and S02 found that advice "thinking with their perspectives" did not fit them. A01: "Mentor mentions primary mode of communication when added to the program (professional form is email)." Conversations then take place over that channel, so they stay confidential.

*Platform feature:* Mentor matching · PS-4

---

**US-06 — Keep track of our goal and next steps**\
As a student in an active mentorship,\
I want to record the mentorship's goal and the next steps agreed at each meeting, and mark them done,\
So that the guidance turns into action instead of ending after one conversation.

| SMART check | |
|---|---|
| **S&nbsp;—&nbsp;Specific** | A goal per mentorship and next steps per meeting, each markable as done. |
| **M&nbsp;—&nbsp;Measurable** | Each step has a status (open/done) and completion date; non-participants are denied access. |
| **A&nbsp;—&nbsp;Achievable** | Two small records linked to a mentorship. |
| **R&nbsp;—&nbsp;Relevant** | S01's mentoring always stopped after one conversation (P-05); the client has no way to see progress. |
| **T&nbsp;—&nbsp;Time&#8209;bound** | Sprint 2, Milestone 4. |

*Acceptance criteria*

- Given an active mentorship, when I set its goal, then my mentor and IIC can see it.
- Given a logged meeting (US-11), when I add next steps, then each step has a status (open or done) and a completion date.
- Given I am not part of the mentorship, when I try to read its goal or steps, then access is denied.

*Interview evidence:* P-05. S01: "every single time it ended after a single conversation." A01: "There is no current monitoring system for students."

*Platform feature:* Mentorship tracking & feedback · PS-5

---

**US-07 — Ask to change or end my mentorship**\
As a student whose mentorship is not working,\
I want to ask IIC to change my mentor or end the mentorship, with feedback,\
So that I can get suitable help without having to confront the mentor myself.

| SMART check | |
|---|---|
| **S&nbsp;—&nbsp;Specific** | A change or end request with written feedback that opens a case for IIC. |
| **M&nbsp;—&nbsp;Measurable** | Feedback must be at least 30 characters; the mentorship stays active until IIC decides; the student is notified of the outcome. |
| **A&nbsp;—&nbsp;Achievable** | A case record with a status. |
| **R&nbsp;—&nbsp;Relevant** | The client allows mentor changes after hearing both sides (A01); S02 fears being stuck with a badly matched mentor (P-13). |
| **T&nbsp;—&nbsp;Time&#8209;bound** | Sprint 2, Milestone 4. |

*Acceptance criteria*

- Given an active mentorship, when I submit a change or end request with feedback of at least 30 characters, then a case opens with status *Under review* and the mentorship stays active until IIC decides.
- Given IIC decides, when the decision is saved, then I am notified; if a change is granted, my problem returns to IIC's queue for a new mentor (US-16).

*Interview evidence:* P-11, P-13. A01: "Can request for mentor to be changed, needs to give feedback, IIC will approach the mentor and ask for their side of the story." S02: "I don't want this kind of suffering."

*Platform feature:* Changes, termination & safety · PS-4

---

**US-08 — Give feedback on my mentorship**\
As a student at a checkpoint or at the end of my mentorship,\
I want to tell IIC whether the mentorship is helping me,\
So that IIC can see whether mentoring is working without anyone being given a star rating.

| SMART check | |
|---|---|
| **S&nbsp;—&nbsp;Specific** | A progress status (no progress, some progress, goal met) with a comment, visible only to IIC. |
| **M&nbsp;—&nbsp;Measurable** | Only the three values are accepted; the form has no rating field; visibility is IIC-only. |
| **A&nbsp;—&nbsp;Achievable** | A short form. |
| **R&nbsp;—&nbsp;Relevant** | The client wants feedback from both sides but explicitly no ratings (A01); progress is currently invisible (P-10). |
| **T&nbsp;—&nbsp;Time&#8209;bound** | Sprint 2, Milestone 4. |

*Acceptance criteria*

- Given an active or just-ended mentorship, when I submit a progress status with a comment, then it is stored and visible only to IIC.
- Given the feedback form is shown, when I look at it, then it has no numeric or star rating of the mentor.

*Interview evidence:* P-10. A01: "No rating system"; "Mentors and students can give feedback for each other"; "There should be feedback system to check if there is progress or not."

*Platform feature:* Mentorship tracking & feedback · PS-7

---

**US-20 — Say how I like to be guided**\
As a student who worries about being matched with someone who does not suit me,\
I want to say, when I share my problem, how I prefer to be guided (for example, direction or detailed steps; short calls or written exchanges),\
So that IIC can consider fit as well as expertise when assigning a mentor for that problem.

| SMART check | |
|---|---|
| **S&nbsp;—&nbsp;Specific** | An optional multi-select of guidance preferences on the problem submission form (US-03). |
| **M&nbsp;—&nbsp;Measurable** | The field is optional and never blocks submission; preferences are saved with that problem; they are shown beside the mentor's style in the IIC assignment view (US-16) and hidden from everyone else. |
| **A&nbsp;—&nbsp;Achievable** | One extra field on the problem form. |
| **R&nbsp;—&nbsp;Relevant** | S02 worried about a mentor who is biased or "not liking my vibe" (P-13); IIC already assigns every mentor, so it can use this. |
| **T&nbsp;—&nbsp;Time&#8209;bound** | Sprint 2, Milestone 4. |

*Acceptance criteria*

- Given I am submitting or editing a problem (US-03), when I choose zero or more options from a fixed list, then they are saved with that problem.
- Given I leave the preferences empty, when I submit my problem, then it is still accepted.
- Given my problem has preferences, when IIC reviews it, then they are shown next to each recommended mentor's stated mentoring style.
- Given my problem has preferences, when other students or mentors not assigned to me view anything about me, then the preferences are not shown.

*Interview evidence:* P-13, P-04. S02: "sometimes a person could be a bias or … he was not liking my vibe … I don't want it this kind of person to take my time." Only one participant raised this, so it is a *Could* story. Preferences belong to the problem rather than the profile, because the right kind of guidance can differ from one problem to the next.

*Platform feature:* Mentor matching · PS-1, PS-3

<div class="page-break"></div>

### 3.2 Mentor stories

**US-09 — Hear only about students assigned to me, with context**\
As a volunteer mentor,\
I want to be told only about students IIC has assigned to me, together with their profile and the problem they need help with,\
So that my limited time goes to students I can actually help, without first asking basic questions.

| SMART check | |
|---|---|
| **S&nbsp;—&nbsp;Specific** | A notification and dashboard entry for each assignment, containing the student's profile and problem. |
| **M&nbsp;—&nbsp;Measurable** | Unassigned problems and recommendations never appear to mentors; the notification includes level, completed courses, career interest, topic tags and problem statement; the student's contact details are shown once assigned. |
| **A&nbsp;—&nbsp;Achievable** | A notification triggered by the assignment event. |
| **R&nbsp;—&nbsp;Relevant** | M01 needs a specific problem and won't spoon-feed (P-07); the client forbids messaging every matching mentor (P-08). |
| **T&nbsp;—&nbsp;Time&#8209;bound** | Sprint 1, Milestone 3. |

*Acceptance criteria*

- Given IIC assigns a student to me, when it is saved, then I am notified with the student's level, completed courses, career interest, topic tags and problem statement.
- Given a problem has not been assigned to me, even if I was recommended for it, when I open my dashboard, then it does not appear.
- Given a student is assigned to me, when I view them, then I see their contact details.

*Interview evidence:* P-07, P-08. M01: "I try to not spoon feed them … They themselves have to want to complete it." A01: "Don't trouble mentors by messaging all matching mentors."

*Platform feature:* Mentor matching · PS-4

---

**US-10 — Set my availability, contact preference and capacity**\
As a volunteer mentor with irregular free time,\
I want to mark myself available or unavailable, set my preferred contact mode and time zone, and agree to take an extra student when IIC asks,\
So that I am matched only when I can actually help.

| SMART check | |
|---|---|
| **S&nbsp;—&nbsp;Specific** | Availability toggle, contact mode, time zone and capacity on the mentor profile. |
| **M&nbsp;—&nbsp;Measurable** | Unavailable or at-capacity mentors are never recommended or assignable; capacity defaults to 1; accepting an IIC request raises capacity by 1; changes show to the mentee immediately. |
| **A&nbsp;—&nbsp;Achievable** | Profile fields plus a filter on recommendations. |
| **R&nbsp;—&nbsp;Relevant** | Mentor time is short and irregular (P-06); the client runs 1 mentor : 1 student and asks mentors individually for more (P-12). |
| **T&nbsp;—&nbsp;Time&#8209;bound** | Sprint 1, Milestone 3. |

*Acceptance criteria*

- Given I mark myself unavailable, when IIC looks for a mentor, then I am not recommended and cannot be assigned; my current mentorship continues.
- Given my capacity is 1 and I have one active mentee, when IIC looks for a mentor, then I am not recommended and cannot be assigned.
- Given IIC asks me to take an extra student, when I accept, then my capacity rises by 1; when I decline, it is unchanged.
- Given I change my contact mode or time zone, when my mentee views the mentorship, then they see the new value.

*Interview evidence:* P-06, P-12. M01: "you might not have half an hour to give someone but five minutes you can give in between." A01: mentors "can be from all across the globe"; "If there are too many students, IIC can go back and ask mentors if they'll take another student."

*Platform feature:* Onboarding & profiles · PS-2

---

**US-11 — Log a meeting without recording what was said**\
As a mentor,\
I want to log each meeting's date, duration and topic category, without recording what we discussed,\
So that IIC can count meetings while our conversations stay confidential.

| SMART check | |
|---|---|
| **S&nbsp;—&nbsp;Specific** | A meeting log with date, duration and topic category only. |
| **M&nbsp;—&nbsp;Measurable** | Date cannot be in the future; duration is 5–240 minutes; the meeting count increases by 1; the other participant can confirm; there is no content field. |
| **A&nbsp;—&nbsp;Achievable** | One meeting record per session. |
| **R&nbsp;—&nbsp;Relevant** | The client wants meeting counts without listening to conversations (P-10). |
| **T&nbsp;—&nbsp;Time&#8209;bound** | Sprint 2, Milestone 4. |

*Acceptance criteria*

- Given an active mentorship, when either participant logs a meeting with a valid date, duration and topic category, then the meeting count increases by 1.
- Given one participant logged a meeting, when the other views it, then they can confirm it, and IIC sees both logged and confirmed counts.
- Given the meeting form is shown, when I look at it, then it has no field for conversation content; an optional private note is visible only to its author.

*Interview evidence:* P-10. A01: "IIC should have access to the count of meetings"; "Not listening to conversations, confidential."

*Platform feature:* Mentorship tracking & feedback · PS-5

---

**US-12 — Send progress feedback on my mentee**\
As a mentor,\
I want to send IIC short progress feedback on my mentee at regular checkpoints,\
So that IIC knows whether the mentorship is helping without supervising our sessions.

| SMART check | |
|---|---|
| **S&nbsp;—&nbsp;Specific** | A progress status and optional comment from the mentor at each checkpoint. |
| **M&nbsp;—&nbsp;Measurable** | One reminder per checkpoint (every 2 weeks, configurable); feedback is IIC-only and time-stamped; 7 days overdue raises a flag. |
| **A&nbsp;—&nbsp;Achievable** | A scheduled reminder plus a short form. |
| **R&nbsp;—&nbsp;Relevant** | The client named "Feedback (mainly from mentor)" and a "tracking system" as top priorities (P-10). |
| **T&nbsp;—&nbsp;Time&#8209;bound** | Sprint 2, Milestone 4. |

*Acceptance criteria*

- Given an active mentorship, when a checkpoint falls due, then I receive one reminder.
- Given I submit a progress status with an optional comment, when it is saved, then it is time-stamped and visible only to IIC.
- Given feedback is 7 days overdue, when IIC opens the monitoring view (US-17), then the mentorship is flagged *Feedback overdue*.

*Interview evidence:* P-10. A01: "Mentor will give IIC feedback"; "Expected challenge: How to track progress of a mentee. Tangibly."

*Platform feature:* Mentorship tracking & feedback · PS-7

---

**US-13 — End a mentorship from my side**\
As a volunteer mentor who can no longer continue,\
I want to end a mentorship and give a reason,\
So that the student can be reassigned quickly instead of waiting on me.

| SMART check | |
|---|---|
| **S&nbsp;—&nbsp;Specific** | An end action with a reason (no longer available, goal achieved, not a good fit, other). |
| **M&nbsp;—&nbsp;Measurable** | Status becomes *Ended by mentor*; student and IIC are notified; capacity is freed; unavailability lists the student for reassignment. |
| **A&nbsp;—&nbsp;Achievable** | One status transition plus notifications. |
| **R&nbsp;—&nbsp;Relevant** | Mentors' availability is not fixed (P-06); the client allows mentors to end from their side (P-11). |
| **T&nbsp;—&nbsp;Time&#8209;bound** | Sprint 2, Milestone 4. |

*Acceptance criteria*

- Given an active mentorship, when I end it with a reason, then its status becomes *Ended by mentor*, the student and IIC are notified, and my capacity is freed.
- Given I ended it because I am no longer available, when IIC views it, then the student is listed for reassignment.

*Interview evidence:* P-06, P-11. A01: "Mentor can terminate from their side"; "How long mentors are available is not fixed."

*Platform feature:* Changes, termination & safety · PS-4

<div class="page-break"></div>

### 3.3 IIC and leadership stories

**US-14 — Add mentors to the pool**\
As an IIC coordinator,\
I want to add volunteer mentors one at a time or from a CSV file, with their expertise, experience, mentoring style and preferred contact mode,\
So that mentors do not have to register themselves and the pool is ready at the start of each cycle.

| SMART check | |
|---|---|
| **S&nbsp;—&nbsp;Specific** | Single add and CSV import of mentor profiles. |
| **M&nbsp;—&nbsp;Measurable** | Invalid rows are reported with row number and reason and never partly saved; re-importing an email updates rather than duplicates; non-IIC users get 403. |
| **A&nbsp;—&nbsp;Achievable** | CSV parsing with row-level validation. |
| **R&nbsp;—&nbsp;Relevant** | The client recruits mentors each cycle and mentors do not self-register (P-12). |
| **T&nbsp;—&nbsp;Time&#8209;bound** | Sprint 1, Milestone 3. |

*Acceptance criteria*

- Given a CSV in the documented template, when I import it, then valid rows become mentor profiles and invalid rows are listed with row number and reason.
- Given a mentor's email already exists, when the same mentor is imported again, then the existing profile is updated, not duplicated.
- Given I am not an IIC coordinator, when I call the add or import endpoint, then I receive a 403 response.

*Interview evidence:* P-12. A01: "Mentors don't register. IIC ask after every cycle or maybe twice a year if alumni want to volunteer"; "For project, prepare a database with details of mentors."

*Platform feature:* Onboarding & profiles · PS-2

---

**US-15 — Keep the list of IIC-registered students up to date**\
As an IIC coordinator,\
I want to import and update the list of students registered with IIC (name, roll number and institute email),\
So that only those students can sign up, without my approving each account by hand.

| SMART check | |
|---|---|
| **S&nbsp;—&nbsp;Specific** | CSV import, plus single add and remove, of registered students. |
| **M&nbsp;—&nbsp;Measurable** | Invalid rows are reported with row number and reason; re-importing a roll number updates rather than duplicates; a student removed from the list cannot sign up or submit a new problem; non-IIC users get 403. |
| **A&nbsp;—&nbsp;Achievable** | CSV parsing with row-level validation, the same pattern as US-14. |
| **R&nbsp;—&nbsp;Relevant** | The client requires students to be approved before they take part (A01); checking sign-ups against IIC's own list replaces approving each one by hand (P-09). |
| **T&nbsp;—&nbsp;Time&#8209;bound** | Sprint 1, Milestone 3. |

*Acceptance criteria*

- Given a CSV in the documented template, when I import it, then valid rows are added to the registered-student list and invalid rows are listed with row number and reason.
- Given a roll number is already on the list, when it is imported again, then the record is updated, not duplicated.
- Given I remove a student from the list, when they try to sign up or submit a new problem, then they are refused with "You are not registered with IIC".
- Given I am not an IIC coordinator, when I call the import endpoint, then I receive a 403 response.

*Interview evidence:* P-09. A01: "Students register, will have to give a lot of info, will have to be approved." Open question: which identifier IIC holds for registered students (Section 4.4).

*Platform feature:* Onboarding & profiles · PS-6

---

**US-04 — See 3–4 recommended mentors for each problem**\
As an IIC coordinator reviewing a student's problem,\
I want the system to recommend 3–4 available mentors ranked by how well their expertise matches the problem, with the reasons shown,\
So that I can assign a suitable mentor quickly without checking the whole mentor pool by hand.

| SMART check | |
|---|---|
| **S&nbsp;—&nbsp;Specific** | Up to 4 recommended mentors per problem, drawn only from mentors who are available and below capacity, each with the shared topic tags and current load. |
| **M&nbsp;—&nbsp;Measurable** | The ranking is deterministic: most shared topic tags first, then fewest active mentees; at most 4 are shown, and fewer than 3 only when fewer qualify; unavailable or at-capacity mentors never appear; with no shared tag the list is empty and IIC can browse all available mentors. |
| **A&nbsp;—&nbsp;Achievable** | A simple scoring rule over mentor tags and availability; no machine learning. |
| **R&nbsp;—&nbsp;Relevant** | The client wants the system to "throw available mentors" once a student's requirements are known (A01); matching is done by hand today (P-09) and niche needs are hard to match (P-02). |
| **T&nbsp;—&nbsp;Time&#8209;bound** | Sprint 1, Milestone 3. |

*Acceptance criteria*

- Given a submitted problem, when I open it, then I see up to 4 available mentors ordered by number of shared topic tags, then by fewest active mentees.
- Given a recommendation is shown, when I look at it, then I see the shared tags, the mentor's availability and their active mentees against capacity.
- Given a mentor is unavailable or at capacity, when recommendations are generated, then they are not included.
- Given no available mentor shares a tag, when I open the problem, then the list is empty and I can browse all available mentors instead.

*Interview evidence:* P-02, P-03, P-09. A01: "IIC is approached by students asking for mentors. After understanding the student's requirements, the system should throw available mentors." S01 asked for "not broad terms like data science … maybe a mentor for computer vision", so recommendations match on specific topic tags. This story was first written for students; it now belongs to IIC because students do not choose their mentor.

*Platform feature:* Mentor matching · PS-3

---

**US-16 — Assign a mentor to each student's problem**\
As an IIC coordinator,\
I want to review each submitted problem with the student's profile, choose one of the recommended mentors (or another available mentor) and assign them,\
So that every mentorship is a deliberate pairing and mentors only hear about students assigned to them.

| SMART check | |
|---|---|
| **S&nbsp;—&nbsp;Specific** | A queue of submitted problems; each opens a review page with the student's profile, problem, guidance preferences (US-20) and recommended mentors (US-04), and an assign action. |
| **M&nbsp;—&nbsp;Measurable** | The queue is ordered oldest first; opening a problem sets it *Under review*; assigning creates a mentorship, notifies both sides and raises the mentor's active count by 1; assignment beyond capacity is blocked; closing a problem requires a reason. |
| **A&nbsp;—&nbsp;Achievable** | A queue and an assign action with a capacity check. |
| **R&nbsp;—&nbsp;Relevant** | The client insists a person approves every match ("automatic won't work", P-09) and that mentors are not flooded with requests (P-08). |
| **T&nbsp;—&nbsp;Time&#8209;bound** | Sprint 1, Milestone 3. |

*Acceptance criteria*

- Given problems have been submitted, when I open the queue, then I see them oldest first, and opening one sets its status to *Under review*.
- Given I open a problem, when the page loads, then I see the student's profile, problem, topic tags and guidance preferences (US-20) next to the recommended mentors (US-04).
- Given I assign a mentor, when I save, then a mentorship is created, the student and mentor are notified (US-05, US-09), and the mentor's active count rises by 1.
- Given the assignment would exceed the mentor's capacity, when I try to assign, then it is blocked until the mentor agrees to take an extra student (US-10).
- Given I close a problem without assigning a mentor (for example, it is out of scope), when I save, then a reason is required and the student is notified.

*Interview evidence:* P-01, P-03, P-08, P-09, P-13. A01: "Each mentorship needs to be approved. Automatic won't work"; "Mentor match will be approved by admin"; "Don't trouble mentors by messaging all matching mentors." Because IIC assigns every student a mentor, help no longer depends on someone answering a group post (P-01) or on whom a student already knows (P-03).

*Platform feature:* Mentor matching · PS-3, PS-4

---

**US-17 — Monitor active mentorships**\
As an IIC coordinator doing a weekly or biweekly check,\
I want to see every active mentorship with its meeting count, last meeting date and latest progress feedback, with inactive ones flagged,\
So that I can step in on stalled mentorships without reading any conversation.

| SMART check | |
|---|---|
| **S&nbsp;—&nbsp;Specific** | A monitoring table of active mentorships with activity and progress columns and flags. |
| **M&nbsp;—&nbsp;Measurable** | No logged meeting for 14 days (configurable) flags *Inactive*; flag filters work; no conversation content or private notes appear. |
| **A&nbsp;—&nbsp;Achievable** | An aggregation query over meetings and feedback. |
| **R&nbsp;—&nbsp;Relevant** | The client has "no current monitoring system" and plans weekly or biweekly checks (P-10); S01's mentoring stalled unnoticed (P-05). |
| **T&nbsp;—&nbsp;Time&#8209;bound** | Sprint 2, Milestone 4. |

*Acceptance criteria*

- Given there are active mentorships, when I open the monitoring view, then each row shows student, mentor, start date, logged and confirmed meetings, last meeting date and latest progress status.
- Given no meeting has been logged for 14 days, when I open the view, then that mentorship is flagged *Inactive*.
- Given I filter by a flag, when results load, then only mentorships with that flag are shown.
- Given the view is shown, when I look at it, then no conversation content or private notes appear.

*Interview evidence:* P-05, P-10. A01: "IIC will then monitor maybe weekly or biweekly"; "There is no current monitoring system for students."

*Platform feature:* Mentorship tracking & feedback · PS-5, PS-7

---

**US-18 — Resolve change, termination and misconduct cases fairly**\
As an IIC coordinator,\
I want to handle change requests, terminations and misconduct concerns as cases where I record both sides before deciding,\
So that no mentor is removed over a single complaint, and students are protected when there is real misconduct.

| SMART check | |
|---|---|
| **S&nbsp;—&nbsp;Specific** | A case page showing the submission, the other party's response and a decision form. |
| **M&nbsp;—&nbsp;Measurable** | No automatic removal on a concern; a decision requires a reason; outcome, coordinator and time are logged; a removed mentor is never recommended or assignable again. |
| **A&nbsp;—&nbsp;Achievable** | A case record with a decision and an audit entry. |
| **R&nbsp;—&nbsp;Relevant** | The client wants both sides heard and no removal over one complaint (P-11). |
| **T&nbsp;—&nbsp;Time&#8209;bound** | Sprint 2, Milestone 4. |

*Acceptance criteria*

- Given a student or mentor raises a concern or change request, when I open the case, then I see their submission and can record the other party's response.
- Given a misconduct concern is raised, when it is saved, then the mentor is not removed automatically; removal needs a coordinator decision.
- Given I decide to reassign, end, or remove a mentor, when I save, then a reason is required and the outcome, coordinator and time are logged.
- Given a mentor is removed, when IIC looks for a mentor, then that mentor is not recommended or assignable and has no active mentorships.

*Interview evidence:* P-11. A01: "One feedback from a student won't cause a mentor to be removed. A lot of other questions will be asked"; "When a profile is flagged for misconduct, profiles will be removed."

*Platform feature:* Changes, termination & safety · PS-6

---

**US-19 — See demand, supply and outcomes across the programme**\
As an IITM BS programme manager,\
I want a report, for a chosen period, of student demand by topic against mentor supply, time to assign a mentor, active mentorships and progress outcomes,\
So that I can decide which expertise to recruit next cycle and judge whether the programme is working.

| SMART check | |
|---|---|
| **S&nbsp;—&nbsp;Specific** | One report covering demand vs supply by topic, time to assignment, active mentorships and outcomes. |
| **M&nbsp;—&nbsp;Measurable** | Per-topic counts for the chosen range; median time from problem submission to assignment; outcomes by progress status; CSV export contains aggregates only. |
| **A&nbsp;—&nbsp;Achievable** | Aggregation queries over existing records. |
| **R&nbsp;—&nbsp;Relevant** | Queries to IIC cluster around specific topics (P-02) and mentors are recruited periodically (P-12); PS-7 asks for programme insight. |
| **T&nbsp;—&nbsp;Time&#8209;bound** | Sprint 2, Milestone 4. |

*Acceptance criteria*

- Given a date range, when I open the report, then each topic shows the number of problems submitted, mentors available and problems still unassigned.
- Given mentors were assigned in the range, when I view the report, then it shows the median time from problem submission to assignment.
- Given mentorships ended in the range, when I view outcomes, then it shows counts by final progress status.
- Given I export the report, when the CSV downloads, then it contains only aggregates, with no names or contact details.

*Interview evidence:* P-02, P-12. A01: "Most common queries asked to IIC are about specific industry requirements, how to improve DSA & SQL skills"; mentors are recruited "after every cycle". Programme leadership has not been interviewed directly, so this story is partially validated.

*Platform feature:* Programme insights · PS-7

<div class="page-break"></div>

## Section 4: Summary and Traceability

### 4.1 Story count

| Role | Stories | Share | Sprint 1 | Sprint 2 |
|---|---|---|---|---|
| Student | 8 | 40% | 4 | 4 |
| Mentor | 5 | 25% | 2 | 3 |
| IIC coordinator | 6 | 30% | 4 | 2 |
| Programme leadership | 1 | 5% | 0 | 1 |
| **Total** | **20** | **100%** | **10** | **10** |

By priority: 13 Must, 6 Should, 1 Could.

### 4.2 Pain point to story mapping

Every pain point leads to at least one story, and every story traces back to at least one pain point.

| Pain point from the research | Sources | Stories that address it |
|---|---|---|
| P-01 No reliable way to reach someone who can help | S01, S02, M01 | US-03, US-05, US-16 |
| P-02 Niche expertise is hard to find | S01, M01, A01 | US-03, US-04, US-19 |
| P-03 Access depends on personal networks | S01, S02, M01 | US-03, US-04, US-16 |
| P-04 Advice doesn't fit the student's situation | S01, S02 | US-02, US-05, US-20 |
| P-05 Guidance stops after one conversation | S01, A01 | US-06, US-17 |
| P-06 Mentors' time is short and irregular | M01, A01 | US-10, US-13 |
| P-07 Students arrive without a specific problem | M01, A01 | US-02, US-03, US-09 |
| P-08 Volunteers must not be flooded or micromanaged | A01, M01 | US-03, US-09, US-16 |
| P-09 Student approval and matching are done by hand | A01 | US-01, US-04, US-15, US-16 |
| P-10 No visibility of progress; conversations confidential | A01, S01 | US-08, US-11, US-12, US-17 |
| P-11 No fair way to change or end a mentorship | A01 | US-07, US-13, US-18 |
| P-12 Mentor supply is limited and periodic | A01 | US-10, US-14, US-19 |
| P-13 Fear of a bad match | S02, A01 | US-07, US-16, US-20 |

### 4.3 What the research changed

| Assumption we started with | Result | Basis |
|---|---|---|
| Students struggle to find people with relevant experience | **Validated** | S01, S02, M01; client confirms demand |
| Any IITM BS student can sign up | **Contradicted**: only students registered with IIC, at BSc or BS level | A01 |
| Students search for and choose their own mentor | **Contradicted**: students submit their problem; IIC assigns a mentor from the system's recommendations | A01 |
| Broad career categories are enough for matching | **Contradicted**: needs are niche and specific | S01, A01 |
| Students' good guidance comes from people they already know | **Validated** | S01, S02, M01 |
| Students value seeing mentors' concrete experience | **Validated**, shown once a mentor is assigned (US-05) | S01, S02; M01 suggestion |
| Mentoring relationships tend not to last | **Partially validated** | S01; A01 has no monitoring today |
| Mentors create their own profiles | **Contradicted**: IIC adds mentors | A01 |
| Mentors accept or decline student requests | **Contradicted**: IIC assigns every mentor | A01 |
| A mentor can take several students | **Contradicted**: 1:1 by default, more only on request | A01 |
| Students rate mentors | **Contradicted**: no rating system | A01 |
| Administrators are tertiary users | **Contradicted**: IIC uses the platform frequently, so primary | A01 |
| Students would pay for mentoring | **Out of scope**: volunteer programme | S01 vs A01 |
| Programme leadership needs demand and supply insight | **Hypothesis**: leadership not interviewed | Inferred from A01 and PS-7 |

### 4.4 Open questions for the client

1. "Only for diploma passout": we read this as students at BSc or BS level only (US-02). Is that right, and does it restrict mentors too?
2. The notes list three "important" points but the third was missed. What was it?
3. Which student details may a mentor see? For example, CGPA. Which feedback may each side see?
4. Should meeting counts be logged by one side and confirmed by the other (our proposal, US-11), or captured another way?
5. Which measurable outcomes show progress? The notes mention grades. Will grades exist in the dummy database?
6. Defaults for us to confirm: progress checkpoint every 2 weeks; "inactive" after 14 days with no logged meeting; capacity 1 mentee per mentor.
7. Can a mentor refuse a student IIC has assigned to them, or is consent assumed when they volunteer?
8. What should happen when a student's need is about wellbeing rather than career?
9. Would IIC find it useful to see a student's stated guidance preferences, and a mentor's mentoring style, when assigning a mentor (US-20)?
10. Which identifier does IIC hold for registered students (roll number, institute email or both), so that sign-up can be checked against it (US-01, US-15)?
11. Once a mentor is assigned, should the student and mentor talk over the mentor's stated contact mode (our current design, US-05), or should the platform also offer messaging?
