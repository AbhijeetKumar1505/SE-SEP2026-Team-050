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
| Abhijeet Kumar | 24f2007359 | Backend Developer, Code Reviewer | Interviews M01 and S02; client session (A01); synthesis and report |
| Priyanshu Yadav | 23f1000018 | Tester, Backend Developer | Interview S05; client session (A01) |
| Saloni Puri | 23f3003439 | Product Manager, Scrum Master | Interview S04; client session (A01) |
| Shreya Pal | 21f1002298 | Tester, Frontend Developer | Interview S03; client session (A01) |
| Khushi Dhankhar | 23f3003132 | Frontend Developer, Scrum Master | Interview S01; client session (A01) |

</div>

<div class="page-break"></div>

## Contents

- Introduction
- Section 1: Users Identified
- Section 2: Stories Heard and Pain Points Analysed
- Section 3: SMART User Stories
- Section 4: Requirements Clarification
- Section 5: Assumptions and Open Questions
- Section 6: Summary and Traceability
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

**How to read this report.** Participants are identified only by ID: S = student, M = alumnus/mentor, A = client (IIC). Quotes from S01, S02, S03 and M01 are verbatim from automatic transcripts, with clarifications in [square brackets]. S04's and S05's quotes come from written transcripts supplied by their interviewers. A01 entries are the team's notes of what the client said. Pain points are labelled P-01 to P-16 so that each story can cite the evidence behind it.

<div class="page-break"></div>

## Section 1: Users Identified

We classify users by how they relate to mentoring itself:

- **Primary users** are the people the product exists for. They use it most directly and frequently, and it succeeds or fails on whether it serves them.
- **Secondary users** use it in support of the primary users, through their own interface.
- **Tertiary users** do not take part in mentoring. They oversee it: monitoring mentoring participation, analysing feedback, and managing mentor and student profiles.

| Class | User group | How they use the platform |
|---|---|---|
| **Primary** | Current IITM BS students seeking guidance | Sign up if registered with IIC, complete their profile, submit the problem they need help with, contact the mentor IIC assigns, track next steps, give feedback, ask to change mentor |
| **Secondary** | Alumni and recent-graduate mentors (volunteers) | Keep availability and contact preference current, receive assigned students, log meetings, send progress feedback |
| **Tertiary** | IIC coordinators (programme administrators; TAs during the project) | Manage the registered-student list and mentor profiles, assign a mentor to each problem from the system's recommendations, monitor participation, analyse feedback, resolve change and misconduct cases |
| **Tertiary** | IITM BS programme leadership | Read aggregate reports on participation, demand, supply and outcomes |

### 1.1 Primary users

**Students.** Students are the people the platform exists for, and every mentorship starts with one of them. All five student interviews confirmed the need, and the alumnus described the same struggle from their own student years. S01, a degree-level student planning a master's or PhD abroad, needs advice "a lot of times" but finds it only by posting in groups and hoping someone replies. S02, a graduating student choosing between a job, a startup and the family business, finds seniors only through WhatsApp groups and friends. S03, a dual-degree student aiming for a VLSI job, "could not … find the right person" who knew the domain and finds approaching unknown people online uncomfortable. S04, a Diploma-level student considering data engineering, knows nobody in that role and gets conflicting advice from online sources. S05, at the end of the Diploma, has never spoken to a senior about their career because there is "no dedicated platform" to reach one. Students will use the platform directly and repeatedly: to sign up, state the problem they need help with, contact the mentor IIC assigns, keep track of the mentorship, and give feedback. They will not search for mentors themselves.

### 1.2 Secondary users

**Alumni mentors.** Mentors are IITM BS graduates who volunteer to give back. They are working or in higher studies, may be anywhere in the world, and must not be micromanaged (A01). They use the platform directly but occasionally: to keep their availability current, see the students IIC has assigned to them, log meetings and send progress feedback. Conversations happen over the mentor's own channel, such as email or a call. M01 illustrates the role well: they already guide juniors, but only in "five minutes … in between" other commitments. Because mentors use the platform in support of the students, through their own interface, they are secondary users.

### 1.3 Tertiary users

**IIC coordinators.** IIC runs the programme rather than taking part in mentoring. It keeps the list of registered students, adds mentors each cycle, reviews every student's problem and assigns every mentor ("each mentorship needs to be approved, automatic won't work"), and plans to monitor mentorships weekly or biweekly (A01). It analyses feedback, mainly from mentors, and handles change and misconduct cases, but it never sees what is said in a mentoring conversation. TAs will play this role during the project.

**Programme leadership.** IITM BS management decides whether the mentoring programme continues and how many mentors to recruit. They use the platform's aggregate reports on participation and outcomes (PS-7) to make those decisions.

### 1.4 Other stakeholders

These groups never log in, but the platform affects them:

- **Alumni not yet volunteering.** IIC invites alumni to volunteer each cycle (A01). The demand the platform records, for example many students asking for computer-vision guidance and no mentor available, determines whom IIC approaches next.
- **Student wellbeing support.** The client noted that students sometimes come to IIC feeling overwhelmed rather than with a career question, and S03 described the stress of managing two degrees. Those cases need to reach the right support service.

**Not users:** the placement team. The client confirmed that placement is out of scope.

<div class="page-break"></div>

## Section 2: Stories Heard and Pain Points Analysed

We held two meetings with the client: a problem-statement discussion on 11 Oct 2026, and a requirements session on 15 Oct 2026 (A01), which lasted about an hour on Google Meet with all five team members present. We also ran six semi-structured user interviews on Google Meet, of 11–30 minutes each: five with students and one with an alumnus. Every interview asked about real past events ("Tell me about the last time…") rather than about features (guides in Appendix A). Each story below is written from the transcript or notes. Nothing has been added, and pain points come from what the participant described.

| ID | User group | Profile (anonymised) | Date | Mode | Duration | Interviewer |
|---|---|---|---|---|---|---|
| S01 | Student | Degree level; plans a master's or PhD abroad in neuroscience / deep learning | 12 Oct 2026 | Google Meet (recorded) | ~15–16 min | Khushi Dhankhar (23f3003132) |
| S02 | Student | Graduating; choosing between a job, a startup and the family business | 12 Oct 2026 | Google Meet (recorded) | ~11 min | Abhijeet Kumar (24f2007359) |
| M01 | Alumnus / mentor | IITM BS graduate; informally guides juniors | 13 Oct 2026 | Google Meet (recorded) | ~16 min | Abhijeet Kumar (24f2007359) |
| S03 | Student | Dual degree (BTech in ETE plus the BS in Electronic Systems); aiming for a core electronics job in VLSI | 21 Oct 2026 | Google Meet (recorded) | ~30 min | Shreya Pal (21f1002298) |
| S04 | Student | Diploma level; considering data engineering, data analytics, data science or software development | 22 Oct 2026 | Google Meet (recorded) | ~15–16 min | Saloni Puri (23f3003439) |
| S05 | Student | End of Diploma level (data science track); choosing between data science, data analysis and data engineering | 22 Oct 2026 | Google Meet (recorded) | ~15–16 min | Priyanshu Yadav (23f1000018) |
| A01 | Client (IIC) | IIC representative, IITM BS admin team | 15 Oct 2026 | Google Meet | ~1 hour | All five team members (shared notes) |

### Interview S01: niche electives and mentoring that stops after one conversation

| | |
|---|---|
| **Interviewer** | Khushi Dhankhar (23f3003132) |
| **Interviewee** | Anonymous degree-level student |
| **Topic** | Finding guidance for higher studies, niche courses and a niche project |
| **Recording** | Google Meet recording and automatic transcript (team drive) |

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
| **Recording** | Fathom recording, 12 Oct 2026 (team drive) |

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
| **Recording** | Fathom recording, 13 Oct 2026 (team drive); suggested excerpt ≈ 08:09–11:45 |

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

### Interview S03: no one in the domain, and follow-up that does not survive online

| | |
|---|---|
| **Interviewer** | Shreya Pal (21f1002298) |
| **Interviewee** | Anonymous dual-degree student |
| **Topic** | Choosing a career in core electronics, and how advice is found, judged and followed |
| **Recording** | Google Meet recording, 21 Oct 2026 (team drive) |

**Story**

The interviewee studies for a BTech in electronics and telecommunication at HGGS college alongside the BS in Electronic Systems, and wants a core electronics job in VLSI. They want to know which roles exist within VLSI, such as physical design engineer, and what knowledge each one requires. When they last needed career advice, they searched Google and ChatGPT, asked their college professors, and asked one or two IITM instructors short questions in live sessions, which was informative but "not that much" help. They "could not … find the right person" with knowledge of their domain, so they asked friends working in other domains.

They do not trust guidance fully: they treat it as an opinion and research it, because some advice is "valid for some sort of people's but may not be valid for us because our … learning style does not match". Different people also pointed them to different domains ("Some say focus on software"). A senior's advice to keep their CGPA up from the start, because employers use cut-offs, while important, was difficult to follow due to lack of guidance.

At their college, faculty follow up when they meet in person, but "the continuous followup is not possible" online. A teacher advised them to prepare for GATE from the standard reference books; with two degrees, they found this hard to keep up, went back only "one or two times", and felt "bad or guilty" for not following it. They describe themselves as introverted, and approaching unknown students or seniors online feels "uncomfortable". After the recording, they added that information they found online was contradictory and hard to trust, and that guidance from trusted and experienced people would be very valuable.

**Pain points**

- Nobody with knowledge of their specific domain could be found; friends in other domains were the fallback.
- They do not know which roles exist within their field or what each requires.
- Advice conflicts, and some of it suits other people's learning style or priorities but not theirs, so they verify everything themselves.
- Follow-up works face to face but does not continue online.
- Following advice alongside other commitments is hard, and not having followed it makes going back awkward.
- Approaching unknown people online is uncomfortable.

### Interview S04: which career, which skills, in which order

| | |
|---|---|
| **Interviewer** | Saloni Puri (23f3003439) |
| **Interviewee** | Anonymous Diploma-level student |
| **Topic** | Choosing a data career, and finding and using advice |
| **Recording** | Google Meet recording; written transcript supplied by the interviewer (team drive) |

**Story**

The interviewee is interested in data engineering but unsure whether it suits them, and does not "fully understand what the day-to-day work looks like". They are also weighing data analytics, data science and software development. They have looked for guidance in online resources, videos, LinkedIn posts and conversations with other students, but "different people recommend different things": Python and SQL, cloud platforms, big-data tools or certifications. They do not personally know any data engineers, and someone "working in data science … does not necessarily mean they have practical experience in data engineering". They are "not always sure how to approach professionals on LinkedIn or whether they will respond".

They have never had structured mentorship. Most advice they get is general, and they still do not know "the order in which to learn skills". After receiving advice they look up the resources, but information from different sources "can be difficult to organise", and they are unsure whether they are following the right sequence. They judge advice by the adviser's practical experience in the role and whether it suits their current level. Under a topic the interviewer raised, they also worried whether employers treat an online degree the same as a campus one, and wanted to hear from graduates with a similar background.

**Pain points**

- They cannot tell what a role involves or which skills to learn, in which order.
- Advice from different sources conflicts, and most of it is general.
- Nobody in their network works in the role they are interested in, and a broadly similar background (data science) is not enough.
- They are unsure how to approach professionals, or whether they will reply.
- Advice turns into a list of resources rather than a sequence of next steps.
- They are unsure whether employers value the online degree. This was prompted by the interviewer's topic, and is a concern rather than something that has happened.

### Interview S05: the right field, and advice that ignored the workload

| | |
|---|---|
| **Interviewer** | Priyanshu Yadav (23f1000018) |
| **Interviewee** | Anonymous student at the end of the Diploma level |
| **Topic** | Choosing between data careers, and finding guidance from seniors |
| **Recording** | Google Meet recording; written transcript supplied by the interviewer (team drive) |

**Story**

When the interviewee joined the degree, they expected to become a data scientist or data analyst. By the end of the Diploma they had found "there are different fields: data scientist, data analyst, data engineer, and so on", and they are now unsure which to follow. They want to talk to "someone who is already working as an intern, already working, pursuing a master's, or doing a job" to understand "what the industry actually requires from students". In practice they have only searched the Internet and "never thought to interact with seniors, because there is no dedicated platform to meet or interact with them".

When they have heard from seniors, the advice related to the senior's own field: "career guidance totally depends on the context of which field you are talking about". At a house meeting, a graduate advised taking cloud-computing certifications. The interviewee followed this, then found that "continuing the degree with three to four subjects is already quite difficult to manage" and that certificates "won't have a very good impact on your CV" with a low CGPA. Online claims that "coding is dead" or "jobs are dead" add to the confusion.

**Pain points**

- They cannot tell which of several data roles to pursue, or what each requires.
- They have no way to reach seniors at all, and rely on Internet searches.
- Seniors' advice reflects the senior's own field, not the one the student wants.
- Advice they followed did not account for their course load or CGPA.
- Conflicting claims online make the choice harder.

### Client session A01: how IIC runs mentoring today

| | |
|---|---|
| **Taken by** | All five team members (shared team notes) |
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

The same problems came up across interviews. We grouped them into 16 pain points. **Frequency** is the count of user interviews that reported a problem (out of 6; out of 1 for mentor-only problems), and it is noted when the client confirmed it. **Confidence** is High when three or more interviews, or two plus the client, report the problem, or when the client listed it among its most important points; Medium for two interviews, one plus the client, or the client alone; Low when the problem was anticipated rather than experienced.

| ID | Group | Pain point | Evidence | Frequency | Confidence |
|---|---|---|---|---|---|
| P-01 | Students | Asking for help means broadcasting in groups or messaging people one by one, with no guarantee of a reply | S01, S02, M01, S04 | 4/6 | High |
| P-02 | Students | People with experience of a niche course, topic, role or problem are very hard to find | S01, M01, S03, S04, S05; A01 | 5/6 + client | High |
| P-03 | Students | Access to guidance depends on personal networks | S01, S02, M01, S03, S04, S05 | 6/6 | High |
| P-04 | Students | Advice conflicts, is general, or reflects the adviser's own situation, so students must verify it themselves | S01, S02, S03, S04, S05 | 5/6 | High |
| P-05 | Students | Guidance stops after one conversation, and follow-up is hard to keep going online | S01, S03, S04; A01 | 3/6 + client | High |
| P-06 | Mentors | Mentors' free time is short and irregular, and they may be in other time zones | M01; A01 | 1/1 + client | Medium |
| P-07 | Mentors | Mentoring only works when the student brings a specific problem and effort | M01; A01 | 1/1 + client | Medium |
| P-08 | Mentors | Volunteers must not be flooded with unsolicited requests or micromanaged | A01; M01 | Client (top priority) | High |
| P-09 | IIC | Student approval and matching are done by hand | A01 | Client | Medium |
| P-10 | IIC | No visibility of whether mentorships are active or helping, and conversations must stay confidential | A01; S01 | Client (top priority) + 1/6 | High |
| P-11 | All | No fair, structured way to change or end a mentorship | A01 | Client | Medium |
| P-12 | IIC | Mentor supply is recruited periodically; extra capacity is requested one mentor at a time | A01 | Client | Medium |
| P-13 | Students | A mentor or advice that does not suit the student's learning style or priorities wastes their time and can affect wellbeing | S02, S03; A01 | 2/6 + client | Medium |
| P-14 | Students | Students cannot tell what a role involves, or which skills to learn in which order | S03, S04, S05 | 3/6 | High |
| P-15 | Students | Approaching unknown seniors or professionals is intimidating, especially online | S03, S04 | 2/6 | Medium |
| P-16 | Students | Unsure whether employers value the online degree; want views from graduates with the same background | S04 | 1/6 | Low (anticipated) |

**What already works:** a near-peer with directly relevant experience who stays available (S01's senior; S02's two friends); short calls that give direction rather than answers (M01); and follow-up from someone the student meets regularly (S03's college faculty).

**Observed but not carried forward:**

| Observation | Source | Reason |
|---|---|---|
| Placement portal, AI-interview and college placement-criteria problems | M01, S03 | Placement is out of scope (client) |
| Paying for good matching, or knowing whether sessions are paid | S01, S04 | Volunteer programme, no payments (client) |
| Rating mentors | Our initial draft | No rating system (client) |
| Alumni-facing dashboard of student profiles | M01 suggestion | Conflicts with IIC approval and confidentiality; aggregate insight goes to leadership instead (US-19) |
| Students searching for and choosing mentors themselves, with filters by role, skills and education | S01, S04 suggestions; our first draft | IIC assigns every mentor. Students submit their problem instead (US-03), and role-specific topic tags keep matching specific (US-04) |
| Personality questionnaire and automated matching model | S02 suggestion | IIC assigns every mentor; the underlying concern is covered by US-20 |
| Career roadmaps and flowcharts of the options in each domain | S03, S04, S05 suggestions | Not built as a content library. The underlying problem (P-14) is met by a mentor from that role and the goal and next steps they agree (US-06) |
| Mentoring from the first or second year of the degree | S05 suggestion | The client limits the programme to students past Diploma level (Section 5.3, question 1) |
| Stress and motivation while managing two degrees | S03 | A wellbeing need rather than a career one; IIC refers these cases (Section 5.3, question 2) |

**Limitations.** The sample is still small: five students and one alumnus, plus the client. Every interview included a question inviting feature suggestions; we did not treat those answers as evidence, and every pain point above comes from an experience the participant described. Transcripts S01, S02, S03 and M01 are automatic and contain errors. S04's and S05's transcripts were written up by their interviewers. Participants were recruited through our own network.

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

**Time-bound** means the sprint in which the story is built and tested: Sprint 1 = Milestone 3 (due 22 Nov 2026), Sprint 2 = Milestone 4 (due 06 Dec 2026). **Priority** uses MoSCoW. **Status** is *Validated* (required by the client, including the client's clarifications in Section 4, or supported by two or more sources), or *Partially validated* (one source).

### Story index

| ID | Role | Title | Priority | Sprint | Status |
|---|---|---|---|---|---|
| US-01 | Student | Sign up with my institute email, checked against IIC's roster | Must | 1 | Validated |
| US-02 | Student | Complete my basic profile | Must | 1 | Validated |
| US-03 | Student | Submit the problem I need help with | Must | 1 | Validated |
| US-05 | Student | Track my request and reach out to my assigned mentor | Must | 1 | Validated |
| US-06 | Student | Keep track of our goal and next steps | Should | 2 | Validated |
| US-07 | Student | Ask to change or end my mentorship | Should | 2 | Validated |
| US-08 | Student | Give feedback on my mentorship | Should | 2 | Validated |
| US-20 | Student | Say how I like to be guided | Could | 2 | Validated |
| US-09 | Mentor | Accept or decline students assigned to me, with context | Must | 1 | Validated |
| US-10 | Mentor | Set my availability, contact preference and capacity | Must | 1 | Validated |
| US-11 | Mentor | Schedule and log sessions without recording what was said | Must | 2 | Validated |
| US-12 | Mentor | Send progress feedback on my mentee | Must | 2 | Validated |
| US-13 | Mentor | End a mentorship from my side | Should | 2 | Validated |
| US-14 | IIC | Add and verify mentors before they can be assigned | Must | 1 | Validated |
| US-15 | IIC | Keep the list of IIC-registered students up to date | Must | 1 | Validated |
| US-04 | IIC | See 3–4 recommended mentors for each problem | Must | 1 | Validated |
| US-16 | IIC | Assign a mentor to each student's problem | Must | 1 | Validated |
| US-17 | IIC | Monitor active mentorships | Must | 2 | Validated |
| US-21 | IIC | Stop assignments and mentorships from stalling | Must | 2 | Validated |
| US-18 | IIC | Resolve change, termination and misconduct cases | Should | 2 | Validated |
| US-19 | Leadership | See demand, supply and outcomes | Should | 2 | Partially validated |

Students do not search for or choose mentors: they submit their problem, and IIC assigns a mentor from the system's recommendations. US-04 was first written as a student story and is now an IIC story, so it is listed with the IIC stories.

<div class="page-break"></div>

### 3.1 Student stories

**US-01 — Sign up with my institute email, checked against IIC's roster**\
As an IITM BS student who wants a mentor,\
I want to sign up with my institute email and roll number, confirm the email, and be checked against IIC's roster of programme participants,\
So that I can start as soon as IIC has registered me, while people outside the programme cannot use the platform.

| SMART check | |
|---|---|
| **S&nbsp;—&nbsp;Specific** | Self sign-up with an institute email on an approved domain (@ds.study.iitm.ac.in) and a roll number, a one-time email verification link, and a check against IIC's roster (US-15). There is no connection to institute databases. |
| **M&nbsp;—&nbsp;Measurable** | Emails outside the approved domains are rejected and nothing is stored; no account is active until the link is used; links expire after 24 hours; a roll number not on the roster creates no account; one account per roll number. |
| **A&nbsp;—&nbsp;Achievable** | A domain check, a roster lookup and a signed, time-limited link; no external integration. |
| **R&nbsp;—&nbsp;Relevant** | The client restricts access to eligible students in the programme and lets us validate against an approved roster or email domain (Section 4, items 1 and 7); today IIC approves students by hand (P-09). |
| **T&nbsp;—&nbsp;Time&#8209;bound** | Sprint 1, Milestone 3 (22 Nov 2026). |

*Acceptance criteria*

- Given an email on an approved domain and a roll number on IIC's roster, when I sign up, then a verification link is sent to that email and no account is active until I use it.
- Given I open the link within 24 hours, when it loads, then my account is activated and I am taken to complete my profile.
- Given my email is not on an approved domain, when I sign up, then I see "Use your IITM BS institute email" and nothing is stored.
- Given my roll number is not on IIC's roster, when I sign up, then no account is created and I see "You are not registered with IIC. Please contact IIC to register."
- Given an account already exists for my roll number, when I try to sign up again, then I am told to log in instead.

*Interview evidence:* P-09. A01: "Students register, will have to give a lot of info, will have to be approved." We chose self sign-up with email verification over invite links (Section 4, item 7): IIC approves a student simply by putting them on the roster (US-15), nobody has to send invitations, and the whole flow can be tested with a seeded roster.

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

*Interview evidence:* P-04, P-07. S01 plans higher studies abroad and S02 is choosing between a job, a startup and the family business; advice that ignored their situation did not help ("my condition is different"). M01 advises juniors "according to their capacity … and their time constraints", which needs that context up front. S04 wants advice to "match my current level". S05 followed a graduate's advice to take cloud certifications, then found it did not fit their course load or CGPA.

*Platform feature:* Onboarding & profiles · PS-1

---

**US-03 — Submit the problem I need help with**\
As a student with a complete profile,\
I want to describe the specific problem I need help with, tag its topics and say what I hope to achieve,\
So that IIC can find me a mentor who has dealt with exactly that problem, instead of my posting in groups and hoping for a reply.

| SMART check | |
|---|---|
| **S&nbsp;—&nbsp;Specific** | A problem form with a description in the student's own words (the agenda for the first meeting), 1–5 topic tags chosen from a predefined drop-down list (Section 4, item 2) and an optional desired outcome; optional guidance preferences can be added on the same form (US-20). It goes to IIC, not to mentors. |
| **M&nbsp;—&nbsp;Measurable** | Description 30–1000 characters; 1–5 tags; one open problem per student and none while a mentorship is active; saved as *Submitted*; editable or withdrawable until a mentor is assigned; never visible to mentors before assignment. |
| **A&nbsp;—&nbsp;Achievable** | One form and a status field. |
| **R&nbsp;—&nbsp;Relevant** | The most common problems across the interviews: no reliable way to reach the right person (P-01, P-03), especially for niche needs and specific roles (P-02, P-14), without approaching strangers (P-15). The client says students must be "very specific about their requirements" (A01) and mentors must not receive unsolicited requests (P-08). |
| **T&nbsp;—&nbsp;Time&#8209;bound** | Sprint 1, Milestone 3. |

*Acceptance criteria*

- Given my profile is complete and I have no open problem or active mentorship, when I submit a description of 30–1000 characters with 1–5 topic tags, then it is saved as *Submitted* and appears in IIC's queue (US-16).
- Given I already have an open problem or an active mentorship, when I try to submit another, then I am refused ("one mentor per student").
- Given my problem has not been assigned yet, when I edit or withdraw it, then the change is saved, and a withdrawn problem leaves IIC's queue.
- Given my problem has not been assigned to a mentor, when that mentor opens their dashboard, then they cannot see it.

*Interview evidence:* P-01, P-02, P-03, P-07, P-08, P-14, P-15. S01: "put out a message and hope that someone would answer for me and it's not always guaranteed"; S01 could not find anyone for "speech technology and deep learning for computer vision". S04 is "not always sure how to approach professionals on LinkedIn or whether they will respond". A01: "IIC is approached by students asking for mentors"; "Students need to be very specific about their requirements."

*Platform feature:* Mentor matching · PS-1, PS-4

---

**US-05 — Track my request and reach out to my assigned mentor**\
As a student who has submitted a problem,\
I want to see its status and, once a mentor has accepted, get their verified contact details, availability and a first message I can edit,\
So that I can make the first contact the way my mentor prefers, without searching through groups or writing to a stranger from scratch.

| SMART check | |
|---|---|
| **S&nbsp;—&nbsp;Specific** | A status tracker for the student's problem. After the mentor accepts (US-09): an email and dashboard notice with the mentor's profile, preferred channel, availability, time zone and contact details; an editable first-message template that includes the problem summary; and an "I have reached out" action. |
| **M&nbsp;—&nbsp;Measurable** | Statuses *Submitted*, *Under review*, *Awaiting mentor*, *Mentor assigned*, *Reassignment needed*, *Closed by IIC* (with reason) and *Withdrawn*; the student is notified of every change; mentor contact details appear only after acceptance and only to the mentee; marking "I have reached out" records the date. |
| **A&nbsp;—&nbsp;Achievable** | A status field, notifications, a text template and one timestamp. |
| **R&nbsp;—&nbsp;Relevant** | The client expects the student to make the first contact, respecting the mentor's availability and preferred channel (Section 4, item 3). Students currently post and "hope that someone would answer" (P-01), find approaching strangers uncomfortable (P-15), and judge advice by the adviser's domain knowledge (P-04, P-16). |
| **T&nbsp;—&nbsp;Time&#8209;bound** | Sprint 1, Milestone 3. |

*Acceptance criteria*

- Given I have submitted a problem, when I open my dashboard, then I see its current status.
- Given my assigned mentor accepts, when the acceptance is saved, then I receive an email and can see the mentor's expertise tags, experience entries (type, title and duration), preferred channel, availability, time zone and contact details.
- Given a mentor has accepted, when I open the first-message template, then it contains my problem summary and the mentor's preferred channel, and I can edit and copy it; the platform does not send it for me.
- Given I mark "I have reached out", when I save, then the date is recorded and my mentor and IIC can see it.
- Given no mentor has accepted my problem yet, when I open my dashboard, then no mentor contact details are shown.
- Given IIC closes my problem, when the decision is saved, then I see the reason and can submit a new problem.

*Interview evidence:* P-01, P-04, P-15, P-16. S01: "it's not always guaranteed, I'll get help"; S03 finds "directly approaching them" uncomfortable, so the template gives the student a ready, specific first message to a mentor who already expects them. S01 judges advice by "relevant domain knowledge", and S02 found that advice "thinking with their perspectives" did not fit them. A01: "Mentor mentions primary mode of communication when added to the program (professional form is email)." Conversations then take place over that channel, outside the platform (Section 4, item 4). S04 wants to hear from graduates with a similar background; every mentor is an IITM BS graduate, and their experience is shown once they accept.

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
| **R&nbsp;—&nbsp;Relevant** | S01's mentoring always stopped after one conversation, and S03's follow-up did not continue online (P-05); S04 could not turn advice into an ordered sequence of steps (P-14); the client has no way to see progress. |
| **T&nbsp;—&nbsp;Time&#8209;bound** | Sprint 2, Milestone 4. |

*Acceptance criteria*

- Given an active mentorship, when I set its goal, then my mentor and IIC can see it.
- Given a logged meeting (US-11), when I add next steps, then each step has a status (open or done) and a completion date.
- Given I am not part of the mentorship, when I try to read its goal or steps, then access is denied.

*Interview evidence:* P-05, P-14. S01: "every single time it ended after a single conversation." S03: "the continuous followup is not possible." S04: "I am not always sure whether I am following the right sequence." A01: "There is no current monitoring system for students."

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
| **R&nbsp;—&nbsp;Relevant** | S02 worried about a mentor who is biased or "not liking my vibe", and S03 found that advice suited to others' learning style did not suit theirs (P-13); IIC already assigns every mentor, so it can use this. |
| **T&nbsp;—&nbsp;Time&#8209;bound** | Sprint 2, Milestone 4. |

*Acceptance criteria*

- Given I am submitting or editing a problem (US-03), when I choose zero or more options from a fixed list, then they are saved with that problem.
- Given I leave the preferences empty, when I submit my problem, then it is still accepted.
- Given my problem has preferences, when IIC reviews it, then they are shown next to each recommended mentor's stated mentoring style.
- Given my problem has preferences, when other students or mentors not assigned to me view anything about me, then the preferences are not shown.

*Interview evidence:* P-13, P-04. S02: "sometimes a person could be a bias or … he was not liking my vibe … I don't want it this kind of person to take my time." S03: some opinions "may not be valid for us because our teaching style or our learning style does not match". Two participants raised this, but the client has not yet said whether it would use preferences, so it stays a *Could* story. Preferences belong to the problem rather than the profile, because the right kind of guidance can differ from one problem to the next.

*Platform feature:* Mentor matching · PS-1, PS-3

<div class="page-break"></div>

### 3.2 Mentor stories

**US-09 — Accept or decline students assigned to me, with context**\
As a volunteer mentor,\
I want to be told only about students IIC has assigned to me, with their profile and problem, and to accept or decline each assignment within 3 days,\
So that my limited time goes to students I can actually help, and no student is left waiting on me.

| SMART check | |
|---|---|
| **S&nbsp;—&nbsp;Specific** | An email and dashboard entry for each assignment, containing the student's profile and problem, with Accept and Decline actions. |
| **M&nbsp;—&nbsp;Measurable** | Unassigned problems and recommendations never appear to mentors; the notification includes level, completed courses, career interest, topic tags and problem statement; the mentor can respond for 72 hours; declining requires a reason and returns the problem to IIC's queue; after accepting, the mentor sees the student's institute email and is told the student will make first contact. |
| **A&nbsp;—&nbsp;Achievable** | A notification and one state transition with a deadline. |
| **R&nbsp;—&nbsp;Relevant** | M01 needs a specific problem and won't spoon-feed (P-07); the client forbids messaging every matching mentor (P-08) and requires that a request a mentor does not accept never stays stalled (Section 4, item 5). |
| **T&nbsp;—&nbsp;Time&#8209;bound** | Sprint 1, Milestone 3. |

*Acceptance criteria*

- Given IIC assigns a student to me, when it is saved, then I am notified by email and on my dashboard with the student's level, completed courses, career interest, topic tags and problem statement.
- Given a problem has not been assigned to me, even if I was recommended for it, when I open my dashboard, then it does not appear.
- Given an assignment is waiting for me, when I accept it, then the mentorship becomes active, the student is notified (US-05), and I am told the student will contact me on my preferred channel.
- Given an assignment is waiting for me, when I decline it with a reason, then the problem returns to IIC's queue and my capacity is freed.
- Given I have not responded within 72 hours, when the window closes, then the escalation in US-21 applies.

*Interview evidence:* P-07, P-08. M01: "I try to not spoon feed them … They themselves have to want to complete it." A01: "Don't trouble mentors by messaging all matching mentors." Letting a mentor decline also answers our earlier question about whether a volunteer can refuse an assignment.

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

**US-11 — Schedule and log sessions without recording what was said**\
As a mentor,\
I want my mentee and me to record each planned session's date, time and external channel, and afterwards mark it held or cancelled with its duration and topic category,\
So that we both know when we are meeting and IIC can count sessions while our conversations stay confidential.

| SMART check | |
|---|---|
| **S&nbsp;—&nbsp;Specific** | A session record with a planned date and time, a channel (Google Meet, phone, email or other) and an optional meeting link; afterwards a status of held or cancelled, a duration and a topic category. Either participant can create or update it. |
| **M&nbsp;—&nbsp;Measurable** | A planned session must be in the future; a held session cannot be dated in the future; duration is 5–240 minutes; each held session raises the session count by 1; the other participant can confirm it; both get one email reminder 24 hours before a planned session; there is no field for what was discussed. |
| **A&nbsp;—&nbsp;Achievable** | One session record with a status, and one scheduled reminder; no calendar integration. |
| **R&nbsp;—&nbsp;Relevant** | The client defines the platform's job as discovery, matching, session scheduling and tracking completion and feedback, and says confidentiality means storing only session logs and milestone feedback (Section 4, item 4); IIC wants meeting counts (P-10). |
| **T&nbsp;—&nbsp;Time&#8209;bound** | Sprint 2, Milestone 4. |

*Acceptance criteria*

- Given an active mentorship, when either of us schedules a session with a future date, time and channel, then both of us see it and receive an email reminder 24 hours before it.
- Given a scheduled session has passed, when either of us marks it held with a duration and topic category, then the session count increases by 1; marking it cancelled does not.
- Given we met without scheduling first, when either of us logs a past session directly, then it counts in the same way.
- Given one participant marked a session held, when the other views it, then they can confirm it, and IIC sees both logged and confirmed counts.
- Given the session form is shown, when I look at it, then it has no field for conversation content; an optional private note is visible only to its author.

*Interview evidence:* P-10. A01: "IIC should have access to the count of meetings"; "Not listening to conversations, confidential." The sessions themselves happen on Google Meet, email or phone, never inside the platform (Section 4, item 4).

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

**US-14 — Add and verify mentors before they can be assigned**\
As an IIC coordinator,\
I want to add volunteer mentors one at a time or from a CSV file, verify each one's credentials, and then invite them to activate their account,\
So that mentors do not have to register themselves and no unverified mentor is ever recommended to me or seen by a student.

| SMART check | |
|---|---|
| **S&nbsp;—&nbsp;Specific** | Single add and CSV import of mentor profiles (expertise tags, experience, mentoring style, preferred channel) in a *Pending verification* state; a Verify action per mentor; an activation link sent to each verified mentor. |
| **M&nbsp;—&nbsp;Measurable** | Imported mentors start as *Pending verification*; only verified mentors who have activated their account are recommended, assignable or visible to students; verification records the coordinator and time; activation links expire after 7 days and can be resent; invalid rows are reported with row number and reason and never partly saved; re-importing an email updates rather than duplicates; non-IIC users get 403. |
| **A&nbsp;—&nbsp;Achievable** | CSV parsing with row-level validation, a status field, and the same signed-link mechanism as US-01. |
| **R&nbsp;—&nbsp;Relevant** | The client requires that no mentor is assigned or visible until IIC has verified their credentials (Section 4, item 6); IIC recruits mentors itself each cycle, and mentors do not self-register (P-12). |
| **T&nbsp;—&nbsp;Time&#8209;bound** | Sprint 1, Milestone 3. |

*Acceptance criteria*

- Given a CSV in the documented template, when I import it, then valid rows become mentor profiles in *Pending verification* and invalid rows are listed with row number and reason.
- Given a mentor is *Pending verification*, when recommendations are generated or a student uses the platform, then that mentor does not appear and cannot be assigned.
- Given I verify a mentor, when I save, then my name and the time are recorded and the mentor is emailed an activation link valid for 7 days.
- Given a verified mentor activates their account and sets their availability (US-10), when recommendations are next generated, then they can appear.
- Given a mentor's email already exists, when the same mentor is imported again, then the existing profile is updated, not duplicated.
- Given I am not an IIC coordinator, when I call the add, import or verify endpoint, then I receive a 403 response.

*Interview evidence:* P-12. A01: "Mentors don't register. IIC ask after every cycle or maybe twice a year if alumni want to volunteer"; "For project, prepare a database with details of mentors." We chose import by IIC followed by verification and invitation, rather than self-registration into a pending queue, because IIC already recruits mentors itself (Section 4, item 6).

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

*Interview evidence:* P-09. A01: "Students register, will have to give a lot of info, will have to be approved." The client confirmed that there is no sync with institute databases and that a roster or email domain may be used (Section 4, item 1), so the roster holds roll number and institute email.

*Platform feature:* Onboarding & profiles · PS-6

---

**US-04 — See 3–4 recommended mentors for each problem**\
As an IIC coordinator reviewing a student's problem,\
I want the system to recommend 3–4 available mentors ranked by how well their expertise matches the problem, with the reasons shown,\
So that I can assign a suitable mentor quickly without checking the whole mentor pool by hand.

| SMART check | |
|---|---|
| **S&nbsp;—&nbsp;Specific** | Up to 4 recommended mentors per problem, drawn only from verified, activated mentors who are available and below capacity, each with the shared topic tags and current load. |
| **M&nbsp;—&nbsp;Measurable** | The ranking is deterministic: most shared topic tags first, then fewest active mentees; at most 4 are shown, and fewer than 3 only when fewer qualify; unverified, unavailable or at-capacity mentors never appear; with no shared tag the list is empty and IIC can browse all available mentors. |
| **A&nbsp;—&nbsp;Achievable** | A simple scoring rule over mentor tags and availability; no machine learning. |
| **R&nbsp;—&nbsp;Relevant** | The client wants the system to "throw available mentors" once a student's requirements are known (A01) and leaves the ranking logic to us, as long as IIC keeps final oversight and workload stays fair (Section 4, item 8); matching is done by hand today (P-09) and niche needs are hard to match (P-02). |
| **T&nbsp;—&nbsp;Time&#8209;bound** | Sprint 1, Milestone 3. |

*Acceptance criteria*

- Given a submitted problem, when I open it, then I see up to 4 available mentors ordered by number of shared topic tags, then by fewest active mentees.
- Given a recommendation is shown, when I look at it, then I see the shared tags, the mentor's availability and their active mentees against capacity.
- Given a mentor is unverified, unavailable or at capacity, when recommendations are generated, then they are not included.
- Given no available mentor shares a tag, when I open the problem, then the list is empty and I can browse all available mentors instead.

*Interview evidence:* P-02, P-03, P-09, P-14. A01: "IIC is approached by students asking for mentors. After understanding the student's requirements, the system should throw available mentors." S01 asked for "not broad terms like data science … maybe a mentor for computer vision", and S04 found that someone in data science may not have "practical experience in data engineering", so recommendations match on specific topic and role tags (P-14). S05: "I would like to approach someone who is already in the field I am willing to go into." This story was first written for students; it now belongs to IIC because students do not choose their mentor.

*Platform feature:* Mentor matching · PS-3

---

**US-16 — Assign a mentor to each student's problem**\
As an IIC coordinator,\
I want to review each submitted problem with the student's profile, choose one of the recommended mentors (or another available mentor) and assign them,\
So that every mentorship is a deliberate pairing and mentors only hear about students assigned to them.

| SMART check | |
|---|---|
| **S&nbsp;—&nbsp;Specific** | A queue of submitted problems; each opens a review page with the student's profile, problem, guidance preferences (US-20) and recommended mentors (US-04), and an assign action. |
| **M&nbsp;—&nbsp;Measurable** | The queue is ordered oldest first; opening a problem sets it *Under review*; assigning creates a pending assignment, asks the mentor to accept (US-09) and raises the mentor's active count by 1; assignment beyond capacity is blocked; closing a problem requires a reason. |
| **A&nbsp;—&nbsp;Achievable** | A queue and an assign action with a capacity check. |
| **R&nbsp;—&nbsp;Relevant** | The client insists a person approves every match ("automatic won't work", P-09) and that mentors are not flooded with requests (P-08). |
| **T&nbsp;—&nbsp;Time&#8209;bound** | Sprint 1, Milestone 3. |

*Acceptance criteria*

- Given problems have been submitted, when I open the queue, then I see them oldest first, and opening one sets its status to *Under review*.
- Given I open a problem, when the page loads, then I see the student's profile, problem, topic tags and guidance preferences (US-20) next to the recommended mentors (US-04).
- Given I assign a mentor, when I save, then the mentor is asked to accept (US-09), the student sees *Awaiting mentor* (US-05), and the mentor's active count rises by 1.
- Given the assignment would exceed the mentor's capacity, when I try to assign, then it is blocked until the mentor agrees to take an extra student (US-10).
- Given I close a problem without assigning a mentor (for example, it is out of scope), when I save, then a reason is required and the student is notified.

*Interview evidence:* P-01, P-03, P-08, P-09, P-13, P-15. A01: "Each mentorship needs to be approved. Automatic won't work"; "Mentor match will be approved by admin"; "Don't trouble mentors by messaging all matching mentors." Because IIC assigns every student a mentor, help no longer depends on someone answering a group post (P-01) or on whom a student already knows (P-03), and no student has to approach a stranger (P-15).

*Platform feature:* Mentor matching · PS-3, PS-4

---

**US-17 — Monitor active mentorships**\
As an IIC coordinator doing a weekly or biweekly check,\
I want to see every active mentorship with its meeting count, last meeting date and latest progress feedback, with inactive ones flagged,\
So that I can step in on stalled mentorships without reading any conversation.

| SMART check | |
|---|---|
| **S&nbsp;—&nbsp;Specific** | A monitoring table of active mentorships with activity and progress columns and flags. |
| **M&nbsp;—&nbsp;Measurable** | No held session for 14 days (configurable) flags *Inactive*; the escalation flags from US-21 appear in the same view; flag filters work; no conversation content or private notes appear. |
| **A&nbsp;—&nbsp;Achievable** | An aggregation query over meetings and feedback. |
| **R&nbsp;—&nbsp;Relevant** | The client has "no current monitoring system" and plans weekly or biweekly checks (P-10); S01's mentoring stalled unnoticed (P-05). |
| **T&nbsp;—&nbsp;Time&#8209;bound** | Sprint 2, Milestone 4. |

*Acceptance criteria*

- Given there are active mentorships, when I open the monitoring view, then each row shows student, mentor, start date, logged and confirmed meetings, last meeting date and latest progress status.
- Given no meeting has been logged for 14 days, when I open the view, then that mentorship is flagged *Inactive*.
- Given an assignment or mentorship is flagged by the escalation rules (US-21), when I open the view, then it is listed at the top with its flag.
- Given I filter by a flag, when results load, then only mentorships with that flag are shown.
- Given the view is shown, when I look at it, then no conversation content or private notes appear.

*Interview evidence:* P-05, P-10. A01: "IIC will then monitor maybe weekly or biweekly"; "There is no current monitoring system for students."

*Platform feature:* Mentorship tracking & feedback · PS-5, PS-7

---

**US-21 — Stop assignments and mentorships from stalling**\
As an IIC coordinator,\
I want assignments and mentorships that stall to trigger automatic reminders and then a *Reassignment needed* alert on my dashboard,\
So that no student is left waiting indefinitely on a mentor who has not responded or has gone quiet.

| SMART check | |
|---|---|
| **S&nbsp;—&nbsp;Specific** | Timed rules on every pending assignment and active mentorship, checked daily, which send reminders and then raise flags on the IIC dashboard. |
| **M&nbsp;—&nbsp;Measurable** | A mentor who has not accepted or declined gets one reminder at 48 hours; at 72 hours the assignment becomes *Reassignment needed*, the mentor's capacity is freed, and the problem returns to the top of IIC's queue; after acceptance, both sides are reminded at 7 days without a held session and the mentorship is flagged *First session overdue* at 10 days; a mentorship flagged *Inactive* (US-17) with still no session 7 days later becomes *Reassignment needed*; IIC can change every window. |
| **A&nbsp;—&nbsp;Achievable** | A daily scheduled job comparing timestamps; tested by moving the clock. |
| **R&nbsp;—&nbsp;Relevant** | The client requires that students are never left in limbo when a mentor is inactive or does not accept within a reasonable window (Section 4, item 5); S01's mentoring stopped after one conversation without anyone noticing (P-05), and students today get no guaranteed reply (P-01). |
| **T&nbsp;—&nbsp;Time&#8209;bound** | Sprint 2, Milestone 4. |

*Acceptance criteria*

- Given an assignment has had no response for 48 hours, when the daily check runs, then the mentor receives one reminder email.
- Given an assignment has had no response for 72 hours, when the check runs, then it becomes *Reassignment needed*, appears at the top of IIC's queue with an alert, the student sees "IIC is finding you another mentor", and the mentor can no longer accept it.
- Given a mentor accepted but no session has been held for 7 days, when the check runs, then the student is reminded to reach out and the mentor is reminded to watch for contact; at 10 days the mentorship is flagged *First session overdue*.
- Given a mentorship flagged *Inactive* has had no session 7 days later, when the check runs, then it is flagged *Reassignment needed*.
- Given IIC changes a window, when the next check runs, then the new value is used.

*Interview evidence:* P-01, P-05. S01: "every single time it ended after a single conversation." A01: "If the mentor is not available, a new mentor may be assigned." The exact windows are our design decision (Section 4, item 5) and an open question for the client (Section 5.3).

*Platform feature:* Mentorship tracking & feedback · PS-4, PS-5

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

## Section 4: Requirements Clarification

After our interviews, the client clarified eight points through the course team. Each sets a client policy. Where the client left the workflow, UI or algorithm to us, the table records our design decision and why we made it. These decisions are built into the stories in Section 3.

<div class="clarify">

| # | Topic | Client policy | Our design decision | Why | Stories |
|---|---|---|---|---|---|
| 1 | Student profile and data | No live sync or API link with institute databases. Students register and complete their profile on the platform. Validation against an approved roster or the email domain @ds.study.iitm.ac.in is allowed. | One short profile, all fields mandatory: level, CGPA, completed courses and career interest. Name and roll number come from IIC's roster and cannot be edited. The problem and guidance preferences are collected per problem, not in the profile. A problem can be submitted only once the profile is complete. | The smallest profile that gives a mentor the context M01 and S04 asked for (P-07), entered once and reused for every problem. | US-01, US-02, US-15 |
| 2 | Problem submission and tags | Both structured topic tags and a short description in the student's own words are required. | 1–5 tags chosen from a predefined drop-down list (the topic-tag list, currently 30 tags), plus a 30–1000 character description that sets the agenda for the first meeting and an optional desired outcome. No automatic tag suggestion in Sprints 1–2. | A fixed list gives deterministic matching and exact test cases. An AI tag suggestion could be added later as a helper. | US-03, US-04 |
| 3 | Who starts the conversation | Once an assignment is final, the student makes the first contact, respecting the mentor's availability and preferred channel. | When the mentor accepts, the student gets an email with the mentor's verified contact details, channel, availability and time zone, plus an editable first-message template that includes their problem summary. The student marks "I have reached out", and the mentor is told to expect contact. | Lowers the barrier of approaching a stranger (P-15) and gives IIC a timestamp for escalation. | US-05, US-09 |
| 4 | In-app communication | Definitive: no in-app chat or video. Conversations happen on Google Meet, email or phone. The platform handles discovery, matching, session scheduling and tracking completion and feedback. Confidentiality means the platform stores only session logs and milestone feedback. | No messaging of any kind. Sessions are scheduled as records (date, time, channel, optional link) with a 24-hour email reminder, then marked held or cancelled. No form has a field for conversation content. | Matches the policy exactly and keeps confidentiality by design (P-10). | US-05, US-06, US-08, US-11, US-12 |
| 5 | Mentor non-response | A student must not be left in limbo if a mentor is inactive or does not accept within a reasonable window. | The mentor accepts or declines within 72 hours, with a reminder at 48 hours. With no response, the assignment becomes *Reassignment needed* and returns to the top of IIC's queue with an alert. After acceptance: reminders at 7 days without a held session, *First session overdue* at 10 days. An *Inactive* mentorship (14 days) with no session 7 days later becomes *Reassignment needed*. IIC can change every window. | Reminders first, so busy volunteers get a chance; then a visible, automatic hand-back, so no request waits indefinitely (P-01, P-05). | US-09, US-17, US-21 |
| 6 | Mentor onboarding | No mentor may be assigned or visible until IIC has verified their credentials. | IIC adds mentors (one at a time or by CSV) in *Pending verification*, verifies each one, and only then sends an activation link. There is no self-registration. | IIC already recruits mentors itself each cycle (A01), so one verification step in its own workflow is simpler than a separate self-registration queue. | US-14, US-04, US-10 |
| 7 | Student access | Access is limited to eligible IITM BS students in the mentoring programme. | Self sign-up with an institute email on an approved domain, a one-time verification link (24 hours), and a check against IIC's roster. | No invitations to send by hand; realistic for students; testable end to end with a seeded roster. | US-01, US-15 |
| 8 | Mentor recommendation | The IIC coordinator keeps final oversight of pairings and fair workload. Showing recommended mentors streamlines the work. | Candidates are verified, activated, available mentors below capacity. They are ranked by number of shared topic tags, then by fewest active mentees. The top 4 are shown with the shared tags and current load as reasons, and IIC can still browse every eligible mentor. | Explainable at a glance, spreads workload fairly, and has a single correct answer for each test case. | US-04, US-16 |

</div>

<div class="page-break"></div>

## Section 5: Assumptions and Open Questions

### 5.1 What the research and the client changed

| Assumption we started with | Result | Basis |
|---|---|---|
| Students struggle to find people with relevant experience | **Validated** | S01, S02, M01, S03, S04, S05; client confirms demand |
| Any IITM BS student can sign up | **Contradicted**: only students on IIC's roster, with a verified institute email, at BSc or BS level | A01; clarifications 1, 7 |
| Students search for and choose their own mentor | **Contradicted**: students submit their problem; IIC assigns a mentor from the system's recommendations | A01 |
| Broad career categories are enough for matching | **Contradicted**: needs are niche and specific | S01, A01 |
| Students' good guidance comes from people they already know | **Validated** | S01, S02, M01, S03 |
| Students value seeing mentors' concrete experience | **Validated**, shown once a mentor is assigned (US-05) | S01, S02, S04; M01 suggestion |
| Mentoring relationships tend not to last | **Validated** | S01, S03, S04; A01 has no monitoring today |
| Mentors create their own profiles | **Contradicted**: IIC adds and verifies mentors before they can be assigned or seen | A01; clarification 6 |
| Mentors accept or decline student requests | **Changed**: students never send requests; IIC assigns, and the mentor accepts or declines within 72 hours | A01; clarification 5 |
| A mentor can take several students | **Contradicted**: 1:1 by default, more only on request | A01 |
| Students rate mentors | **Contradicted**: no rating system | A01 |
| The platform hosts mentoring conversations | **Contradicted**: no in-app chat or video; conversations happen on Google Meet, email or phone | Clarification 4 |
| The mentor makes the first contact | **Contradicted**: the student reaches out first, on the mentor's preferred channel | Clarification 3 |
| Administrators are tertiary users | **Kept**: IIC works in the platform weekly, but it oversees mentoring rather than taking part in it | A01 |
| Students would pay for mentoring | **Out of scope**: volunteer programme | S01, S04 vs A01 |
| Students mainly need someone to answer a question | **Partially contradicted**: they also need to know what a role involves and what to learn first | S03, S04, S05 |
| Programme leadership needs demand and supply insight | **Hypothesis**: leadership not interviewed | Inferred from A01 and PS-7 |

### 5.2 Design assumptions

Where neither the research nor the client settles a detail, we have made these assumptions. Each is a configurable default where possible, and we will check them in user testing during Sprints 1 and 2.

| Area | Assumption | Stories |
|---|---|---|
| Email domains | @ds.study.iitm.ac.in is the approved domain; IIC can add others in configuration | US-01 |
| What a mentor sees | Level, completed courses, career interest, topic tags and the problem. CGPA is visible to IIC only, because most problems do not need it. | US-02, US-09 |
| Who sees feedback | Progress feedback from either side is visible to IIC only | US-08, US-12 |
| Counting sessions | One side logs a session and the other confirms it; IIC sees both counts | US-11 |
| Measuring progress | The agreed goal and next steps, held sessions, and the three-level progress status. Grades are not used, as the dummy database will not contain them. | US-06, US-08, US-12, US-19 |
| Defaults | Progress checkpoint every 2 weeks; *Inactive* after 14 days without a held session; capacity of 1 mentee per mentor; the escalation windows in Section 4, item 5. All can be changed by IIC. | US-10, US-12, US-17, US-21 |
| Scheduling | Scheduling means a session record and an email reminder; there is no calendar integration | US-11 |
| Guidance preferences | Shown to IIC next to each mentor's stated style, never to other users | US-20 |
| Topic tags | The 30-tag draft list is seed data that IIC reviews before launch | US-03, US-04 |

### 5.3 Open questions for the client

The clarifications answered three of our earlier questions: whether a mentor can refuse an assignment (yes, they accept or decline, item 5), which identifier sign-up is checked against (roster or email domain, item 1), and whether the platform should offer messaging (no, item 4). We turned several others into the design assumptions above. These remain open:

1. "Only for diploma passout": we read this as students at BSc or BS level only (US-02). Is that right, and does it restrict mentors too? Two interviewees (S04 at Diploma level, S05 just finishing it) described the same needs, and S05 said IIC support today reaches mainly final-year students.
2. What should happen when a student's need is about wellbeing rather than career? Our current design lets IIC close the problem with a referral as the reason (US-16).
3. Is @ds.study.iitm.ac.in the only approved domain, or should students of the BS in Electronic Systems (one of our interviewees, S03) sign up with another domain?
4. Are our escalation windows reasonable: 72 hours to accept, 10 days to a first session, and 7 days after an *Inactive* flag before reassignment?
5. Roughly how many students and mentors take part in each cycle, so that we can judge whether manual assignment keeps up?

## Section 6: Summary and Traceability

### 6.1 Story count

| Role | Stories | Share | Sprint 1 | Sprint 2 |
|---|---|---|---|---|
| Student | 8 | 38% | 4 | 4 |
| Mentor | 5 | 24% | 2 | 3 |
| IIC coordinator | 7 | 33% | 4 | 3 |
| Programme leadership | 1 | 5% | 0 | 1 |
| **Total** | **21** | **100%** | **10** | **11** |

By priority: 14 Must, 6 Should, 1 Could.

### 6.2 Pain point to story mapping

Every pain point leads to at least one story, and every story traces back to at least one pain point.

| Pain point from the research | Sources | Stories that address it |
|---|---|---|
| P-01 No reliable way to reach someone who can help | S01, S02, M01, S04 | US-03, US-05, US-16, US-21 |
| P-02 Niche expertise is hard to find | S01, M01, S03, S04, S05, A01 | US-03, US-04, US-19 |
| P-03 Access depends on personal networks | S01, S02, M01, S03, S04, S05 | US-03, US-04, US-16 |
| P-04 Advice conflicts or doesn't fit the student's situation | S01, S02, S03, S04, S05 | US-02, US-05, US-20 |
| P-05 Guidance stops after one conversation | S01, S03, S04, A01 | US-06, US-17, US-21 |
| P-06 Mentors' time is short and irregular | M01, A01 | US-09, US-10, US-13 |
| P-07 Students arrive without a specific problem | M01, A01 | US-02, US-03, US-09 |
| P-08 Volunteers must not be flooded or micromanaged | A01, M01 | US-03, US-09, US-16 |
| P-09 Student approval and matching are done by hand | A01 | US-01, US-04, US-15, US-16 |
| P-10 No visibility of progress; conversations confidential | A01, S01 | US-08, US-11, US-12, US-17, US-21 |
| P-11 No fair way to change or end a mentorship | A01 | US-07, US-13, US-18 |
| P-12 Mentor supply is limited and periodic | A01 | US-10, US-14, US-19 |
| P-13 Mentor or advice doesn't suit the student | S02, S03, A01 | US-07, US-16, US-20 |
| P-14 Unclear what a role involves or what to learn first | S03, S04, S05 | US-03, US-04, US-06 |
| P-15 Approaching strangers is intimidating | S03, S04 | US-03, US-05, US-09, US-16 |
| P-16 Unsure how employers view the online degree | S04 | US-05 |
