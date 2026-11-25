## Interview Report (Sprint 1 user testing)

The team showed the Sprint 1 work to three people and recorded what each said. This section is the record of each interview. The [user feedback report](02-user-feedback.md) that follows turns them into findings and decisions, and the [Sprint 2 plan](03-sprint-2-plan.md) shows what changed in the backlog.

Participants are identified by the same IDs as in the Milestone 1 report. S01 and M01 were both interviewed in Milestone 1, so this round could check the Sprint 1 work against the problems they described then.

| Interview | Participant | Perspective | Date |
|---|---|---|---|
| I-1 | Teaching assistant | Reviewer of the project, and IIC's point of view | Minutes shared with the team on 21 Nov 2026 |
| I-2 | S01 | Student: degree-level student planning a master's or PhD abroad | 22 Nov 2026 |
| I-3 | M01 | Mentor: IITM BS graduate who already guides juniors informally | 23 Nov 2026 |

S02, who was planned for this round, was not interviewed. Their perspective is carried into the Milestone 4 session (SCRUM-84).

### I-1: Teaching assistant

**What the team showed**

- **Backend, presented by Abhijeet Kumar:** the backend setup, the data models, the OpenAPI (Swagger) setup, authentication and role-based access control, the pytest setup, and continuous integration with GitHub Actions.
- **Frontend, presented by Khushi:** how the web app's pages were being connected to the API.

**What the TA asked, and the team's answers**

| TA's question | Team's answer |
|---|---|
| What is each member responsible for? | Saloni: project management, the API documentation and compiling the report. Khushi and Shreya: the sub-tasks assigned at each scrum. Abhijeet and Priyanshu: connecting the frontend to the API as each backend component is built |
| How does the team manage version control? | Each member works on their own branch. Finished work goes into `main` through a pull request, and a reviewer is assigned |
| How does the team find and manage issues? | Mostly through internal communication |

**What the TA recommended**

1. Keep a separate branch for each member.
2. Follow the pull request review process before merging into `main`.
3. Track problems with GitHub Issues instead of only internal communication.
4. Document each issue with the solution or fix.
5. Keep the API documentation up to date, and compile the project documentation systematically.

### I-2: S01 (student), 22 Nov 2026

**What S01 saw:** the Sprint 1 flow from a student's side:
- signing up with an institute email on IIC's roster;
- completing the profile;
- submitting a problem;
- following it until a mentor accepted;
- seeing the assigned mentor and reaching out to them.

**Overall:** S01 found the flow intuitive and easy to follow without help, and their response was positive. They did not ask for any change to the Sprint 1 flow.

**What S01 liked**

- **Specific topic tags.** S01 described their problem in their own words and tagged it with narrow topics such as *Computer vision*, *Speech technology* and *Research careers*, not a broad field like data science. In Milestone 1 this was S01's main request: a mentor who has worked in their niche, not a general one.
- **Knowing where the request is.** The tracker shows four steps: *Submitted*, *Under review*, *Awaiting mentor*, *Mentor assigned*. A notice appears at each change. In Milestone 1, S01 described posting in groups and hoping someone would reply, with no guarantee of help. Here they could see that IIC had the request and what was happening to it.
- **A mentor page ready to act on.** Once the mentor accepted, S01 saw the mentor's expertise, experience, preferred channel and contact details, and a first message already drafted for them. It was clear that the student makes the first contact, and how.

**What S01 expects next.** Most of S01's expectations are for what happens after the first contact, which Sprint 2 builds:

- **A mentorship that lasts beyond one conversation.** In Milestone 1, every mentoring S01 had tried ended after a single conversation. S01 expects to:
  - agree a goal and next steps with the mentor and mark them done (US-06);
  - plan the next session, with a reminder before it (US-11).
- **Being guided the way they prefer.** S01 noticed the optional guidance-preferences box on the problem form and expects IIC to take it into account when choosing a mentor (US-20).
- **A way out if the match does not work.** S01 would rather ask IIC for a different mentor than drop out quietly (US-07). They also want a place to say whether the mentorship is helping (US-08).

### I-3: M01 (mentor), 23 Nov 2026

**What M01 saw:** the Sprint 1 flow from a mentor's side:
- activating the account from IIC's email;
- setting availability and contact details;
- reading an assigned student's request;
- accepting it, and declining another with a reason.

**Overall:** M01 found the flow intuitive and their response was positive. They did not ask for any change to the Sprint 1 flow.

**What M01 liked**

- **Context before committing.** The assignment card shows the student's level, completed courses, career interest, problem, what they hope to achieve and the topic tags, with the hours left to respond. M01 could judge whether they could help before accepting. In Milestone 1, M01 said they mostly help people they already know. The card gives them the same context about a student they have never met.
- **Control over their own time.** M01 liked these settings:
  - the *Available for new students* switch;
  - when they are free, and their time zone;
  - a capacity limit that IIC cannot go over without asking them first, and they can say no.

  In Milestone 1, M01 said they help in short, irregular slots, often late at night, so they want to decide how much they take on.
- **Declining without guilt.** A decline needs only a reason from a short list, and the student goes straight back to the top of IIC's queue, so nobody is left waiting on them.
- **The student reaches out first,** on the channel M01 chose, and sees M01's contact details only after M01 accepts.

**What M01 expects next.** Like S01, M01's expectations are about the mentorship itself, which Sprint 2 builds:

- **Logging short calls.** M01 often helps in a quick call of a few minutes. They expect to log such a session quickly and count it, without writing down what was said (US-11).
- **Seeing whether the student acts on the advice.** M01 does not spoon-feed; the student has to put in the effort. They expect to see the next steps the student marks as done (US-06), and to send IIC short progress feedback (US-12).
- **Ending a mentorship cleanly.** M01 wants to end a mentorship from their side, with a reason, when the goal is met or they can no longer continue (US-13).
