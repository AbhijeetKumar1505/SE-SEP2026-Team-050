# Milestone 1: Identify User Requirements

**Deadline: Sunday, 25 Oct 2026**, submitted on the Project Portal. Uploading a file is not enough; you must also press **Submit**.
The Milestone 1 content is also packaged into `team-050-milestone-1-2.zip`, which is submitted with Milestone 2 (01 Nov 2026). Run the course validity check on the ZIP before uploading it.

## What we submit

| Deliverable | Format | Who submits | Source in this repo |
|---|---|---|---|
| Milestone 1 report: users, user research, SMART user stories | PDF | Any one member (team deliverable) | `01-report.md`, `02-interview-guides.md`, `03-evidence-log.md`, built with `npm run pdf` |
| Part of an interview recording as proof | MP4 | Any one member | Cut from the original recordings (see below). Not committed to git. |
| Signed Honour Code | As the portal specifies | **Every member individually** | [Honour Code template](https://docs.google.com/document/d/1-9zAmt7_GTwxoaBbvuW9lMFYAQH6UyM50sDxwQ6B8W4/edit?usp=sharing) |

## How peer evaluators will mark it (30 marks)

| Criterion | Marks | Full marks require | Covered by |
|---|---|---|---|
| Identify users | 5 | All of primary, secondary and tertiary users identified | Report Section 1 |
| Interviews / observation studies | 10 | Relevant and comprehensive pain points, and appropriate features to address them | Report Section 2, Appendices A–C, video |
| User stories | 15 | Stories fully follow the SMART guidelines | Report Sections 3–4 |

The course explicitly warns against asking users directly whether a feature would be useful. The interview guides only ask about past experiences.

## Status

- [x] Users identified and justified (Section 1), and reclassified after the client session
- [x] Interview guides, consent script and note template (Appendix A)
- [x] Transcripts anonymised: `S01`, `S02` (students), `M01` (alumnus), `A01` (IIC client notes)
- [ ] **Written consent from S01, S02 and M01** to recording and excerpt use. None of the recordings captures it.
- [ ] Dates, modes, durations and interviewers for S01 and A01 (Section 2 participant table, Appendix B)
- [x] Stories heard, pain points per interview and consolidated inventory (Section 2): 13 pain points
- [x] 20 user stories linked to evidence, each with its own SMART check, plus story index, pain-point mapping and assumption review (Sections 3–4)
- [ ] Ask the client the open questions (Section 4.4), especially "diploma passout" eligibility and the missed third point
- [x] Team names, roll numbers and roles on the title page
- [ ] Each member's Milestone 1 contribution on the title page (who interviewed S01, who took the A01 notes, etc.)
- [ ] Video excerpt cut and exported as MP4 (Appendix C suggests M01 ≈ 08:09–11:45)
- [ ] PDF built and proofread (search it for leftover `[` placeholders)
- [ ] Every member has signed and submitted their own Honour Code

### Honour Code tracker

| Member | Signed | Submitted on portal |
|---|---|---|
| Abhijeet Kumar | [ ] | [ ] |
| Priyanshu Yadav | [ ] | [ ] |
| Saloni Puri | [ ] | [ ] |
| Shreya Pal | [ ] | [ ] |
| Khushi Dhankhar | [ ] | [ ] |

## Suggested plan to the deadline

| Date | Work |
|---|---|
| Fri 16 – Sat 17 Oct | Add the existing transcripts; fill gaps by interviewing more people (aim for at least 3 students, 3 alumni and 1 administrator) |
| Sun 18 – Mon 19 Oct | Code transcripts for pain points; affinity grouping (Section 2) |
| Tue 20 Oct | Link stories to evidence; revise, add or drop stories (Sections 3–4) |
| Wed 21 Oct | Cut the video excerpt; fill the evidence index |
| Thu 22 Oct | Build the PDF; whole-team review against the checklist above |
| Fri 23 – Sat 24 Oct | Fixes; everyone signs and submits their Honour Code; submit the team deliverables |
| Sun 25 Oct | Deadline (buffer only) |

## Building the PDF

Requires Node 18+ and Chrome or Edge.

```bash
cd docs
npm install
npm run pdf
```

The output is written to `docs/milestone-1/build/team-050-milestone-1.pdf`. Text in `backticks` is highlighted in the PDF, so any unfilled placeholder is easy to spot. Placeholders are written as `` `[...]` ``.

## Preparing the video evidence

- Choose 1–3 minutes from a real interview that shows the participant consenting and then describing a concrete pain point.
- Export it as **MP4**. With ffmpeg, the following cuts from 00:30 to 02:45 without re-encoding:

  ```bash
  ffmpeg -ss 00:00:30 -to 00:02:45 -i S01-original.mp4 -c copy team-050-m1-evidence.mp4
  ```

- Record the participant ID and timestamps in Appendix C so the clip matches the report.
- Never stage or re-enact an interview.

## Privacy

Raw recordings and unanonymised transcripts stay out of git (see `.gitignore`). Keep them in the team's private drive. Only anonymised transcripts go in `transcripts/`.
