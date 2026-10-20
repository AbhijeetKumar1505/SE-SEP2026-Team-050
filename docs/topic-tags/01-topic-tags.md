<style>
@page {
  @bottom-left { content: "Team 050 · Topic tags for mentor matching · first draft for discussion, 20 Oct 2026"; font-family: "Segoe UI", Arial, sans-serif; font-size: 7.5pt; color: #8a8a96; }
  @bottom-right { content: counter(page) " / " counter(pages); font-family: "Segoe UI", Arial, sans-serif; font-size: 7.5pt; color: #8a8a96; }
}
html { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
.pb { break-before: page; height: 0; margin: 0; }
.keep { break-inside: avoid; }
.kicker { font-size: 8.5pt; letter-spacing: .12em; font-weight: 700; color: var(--accent); margin: 0 0 4pt; }
.sub { font-size: 11.5pt; color: var(--muted); margin: 0 0 14pt; }
.lead { font-size: 10.5pt; }

.rules { display: grid; grid-template-columns: repeat(4, 1fr); gap: 7pt; margin: 10pt 0 14pt; break-inside: avoid; }
.rule { border: 1px solid var(--rule); border-top: 3px solid var(--accent); border-radius: 3pt; padding: 7pt 9pt; font-size: 9pt; }
.rule b { display: block; font-size: 9.5pt; color: var(--accent); margin-bottom: 2pt; }

table.tags { font-size: 8.8pt; margin-top: 4pt; line-height: 1.3; }
table.tags th, table.tags td { padding: 2.5pt 5pt; }
table.tags td:first-child, table.tags th:first-child { width: 6mm; text-align: center; color: var(--muted); }
table.tags td:nth-child(2) { width: 30%; font-weight: 600; }
table.tags td:last-child, table.tags th:last-child { width: 17%; }
table.tags tr.grp td { background: #eef1f6; color: var(--accent); font-weight: 700; font-size: 9pt; padding-top: 5pt; text-align: left; }
.src { display: inline-block; font-size: 7.5pt; font-weight: 700; padding: 0 3pt; border-radius: 2pt; background: #e6edf7; color: #1f4e8c; margin: 0 1pt 1pt 0; white-space: nowrap; }
.src.prop { background: #fbecd2; color: #8a4a06; }
.src.chk { background: #f3dcdc; color: #8f2a2a; }
.legend { font-size: 8.5pt; color: var(--muted); margin: 0 0 6pt; }

.example { display: grid; grid-template-columns: 1.05fr 1fr; gap: 10pt; margin: 8pt 0 6pt; break-inside: avoid; }
.example > div { border: 1px solid var(--rule); border-radius: 4pt; padding: 8pt 11pt; font-size: 9.5pt; }
.example .problem { background: #f6f8fb; }
.example h4 { margin: 0 0 4pt; font-size: 10pt; color: var(--accent); }
.example p { margin: 3pt 0; }
.chip { display: inline-block; border: 1px solid #9db4d6; background: #fff; color: #1f4e8c; border-radius: 9pt; padding: 0 6pt; font-size: 8.5pt; font-weight: 600; margin: 2pt 2pt 0 0; }
.example table { margin: 2pt 0 0; font-size: 9pt; }
.example td.n { text-align: center; font-weight: 700; width: 12mm; }
.example tr.out td { color: #9a9aa4; }

.notags td:first-child { width: 32%; font-weight: 600; }
.qs td:first-child { width: 5mm; text-align: center; color: var(--muted); }
</style>

<p class="kicker">TEAM 050 · FIRST DRAFT FOR DISCUSSION</p>

# Topic tags for mentor matching

<p class="sub">A first list built from our interviews and the 15 October session notes. We would like IIC to correct it.</p>

<p class="lead">Matching works by <strong>topic tags</strong>. Students tag the problem they need help with, IIC tags each mentor with the areas they have real experience in, and the platform recommends mentors who share the most tags. Recommendations can only be as good as this list, so we would like IIC to check it before we build it into the system.</p>

<div class="rules">
<div class="rule"><b>Students</b>Pick 1–5 tags when they submit a problem, and describe it in their own words.</div>
<div class="rule"><b>Mentors</b>Tagged by IIC when added, only for areas of real experience. We suggest at most 8 tags per mentor.</div>
<div class="rule"><b>Recommendations</b>Up to 4 available mentors, ranked by shared tags, then by fewest current mentees. IIC makes the final choice.</div>
<div class="rule"><b>Gaps</b>Tags that students choose but no mentor has are reported, so IIC knows whom to invite next cycle.</div>
</div>

**Why the tags are narrow.** One student told us they wanted "not broad terms like data science … maybe a mentor for computer vision". A broad tag would match almost every mentor and tell IIC nothing. The list below therefore names specific skills, decisions and situations.

## The draft list: 28 tags in 7 groups

<p class="legend"><span class="src">S01</span> <span class="src">S02</span> student interviews · <span class="src">M01</span> alumnus interview · <span class="src">IIC</span> notes from the 15 October session ("specific industry requirements, how to improve DSA &amp; SQL skills") · <span class="src">PS</span> project problem statement · <span class="src prop">Proposed</span> not raised in our research; added to cover an obvious gap, so please keep or drop · <span class="src chk">Confirm scope</span> close to placement, which is out of scope</p>

<table class="tags">
<thead><tr><th>#</th><th>Tag</th><th>What it covers</th><th>Source</th></tr></thead>
<tbody>
<tr class="grp"><td colspan="4">Career direction</td></tr>
<tr><td>1</td><td>Choosing a career path</td><td>Deciding between a job, higher studies, a startup or a family business, and which suits the student's situation</td><td><span class="src">S01</span><span class="src">S02</span><span class="src">PS</span></td></tr>
<tr><td>2</td><td>Industry and role requirements</td><td>What a specific industry or role expects from graduates, and how to close the gap</td><td><span class="src">IIC</span><span class="src">PS</span></td></tr>
<tr class="grp"><td colspan="4">Jobs and internships (career guidance, not the placement process)</td></tr>
<tr><td>3</td><td>Finding internships</td><td>Where and how to look for internships, including research internships</td><td><span class="src">M01</span><span class="src">S01</span></td></tr>
<tr><td>4</td><td>Job search strategy</td><td>Which roles to target and how to apply beyond campus channels</td><td><span class="src">M01</span></td></tr>
<tr><td>5</td><td>Technical interview preparation</td><td>Coding, SQL and database-design rounds</td><td><span class="src">M01</span><span class="src chk">Confirm scope</span></td></tr>
<tr><td>6</td><td>Resume and portfolio</td><td>Presenting skills and projects to employers</td><td><span class="src prop">Proposed</span></td></tr>
<tr class="grp"><td colspan="4">Technical skills</td></tr>
<tr><td>7</td><td>Data structures and algorithms (DSA)</td><td>Improving DSA for interviews and projects</td><td><span class="src">IIC</span></td></tr>
<tr><td>8</td><td>SQL and database design</td><td>Querying, schema design, database rounds</td><td><span class="src">IIC</span><span class="src">M01</span></td></tr>
<tr><td>9</td><td>Python programming</td><td>Writing and structuring Python beyond coursework</td><td><span class="src">M01</span></td></tr>
<tr><td>10</td><td>Deep learning</td><td>Models, training and applying deep learning</td><td><span class="src">S01</span></td></tr>
<tr><td>11</td><td>Computer vision</td><td>Image tasks such as detection and segmentation</td><td><span class="src">S01</span></td></tr>
<tr><td>12</td><td>Speech technology</td><td>Speech recognition and processing</td><td><span class="src">S01</span></td></tr>
<tr><td>13</td><td>Natural language processing</td><td>Text-based machine learning</td><td><span class="src prop">Proposed</span></td></tr>
<tr><td>14</td><td>Data and business analytics</td><td>Analysis, dashboards and analyst roles</td><td><span class="src prop">Proposed</span></td></tr>
<tr><td>15</td><td>Web and app development</td><td>Building and deploying applications</td><td><span class="src prop">Proposed</span></td></tr>
<tr class="grp"><td colspan="4">Higher studies and research</td></tr>
<tr><td>16</td><td>Master's or PhD abroad</td><td>Choosing programmes and preparing applications</td><td><span class="src">S01</span></td></tr>
<tr><td>17</td><td>Research careers</td><td>Getting into research, research internships, what a PhD involves</td><td><span class="src">S01</span></td></tr>
<tr><td>18</td><td>GATE and higher studies in India</td><td>GATE preparation and what to focus on</td><td><span class="src">M01</span></td></tr>
<tr><td>19</td><td>Computational neuroscience</td><td>An example of a niche research area; others would be added the same way</td><td><span class="src">S01</span></td></tr>
<tr class="grp"><td colspan="4">Courses and academics</td></tr>
<tr><td>20</td><td>Choosing electives</td><td>Especially rarely taken electives, where few seniors can be found</td><td><span class="src">S01</span><span class="src">S02</span></td></tr>
<tr><td>21</td><td>Planning a term's course load</td><td>How many and which courses to take, given time and capacity</td><td><span class="src">M01</span><span class="src">S02</span></td></tr>
<tr><td>22</td><td>Getting through a difficult course</td><td>Approach, resources and notes for a hard course</td><td><span class="src">S01</span><span class="src">S02</span></td></tr>
<tr><td>23</td><td>Improving CGPA</td><td>Planning to raise grades over the coming terms</td><td><span class="src">S02</span></td></tr>
<tr class="grp"><td colspan="4">Projects</td></tr>
<tr><td>24</td><td>Stuck on a course project</td><td>Direction when a project is blocked; mentors guide rather than do the work</td><td><span class="src">M01</span></td></tr>
<tr><td>25</td><td>Niche or research project</td><td>Finding someone who has worked on a similar problem</td><td><span class="src">S01</span></td></tr>
<tr class="grp"><td colspan="4">Entrepreneurship</td></tr>
<tr><td>26</td><td>Starting a startup</td><td>Testing an idea and taking the first steps</td><td><span class="src">S02</span><span class="src">PS</span></td></tr>
<tr><td>27</td><td>Joining or growing a family business</td><td>Bringing degree skills into an existing business</td><td><span class="src">S02</span></td></tr>
<tr class="grp"><td colspan="4">Catch-all</td></tr>
<tr><td>28</td><td>Other</td><td>The student describes the need; IIC reviews it. Needs that keep recurring become new tags next cycle.</td><td>Design</td></tr>
</tbody>
</table>


<div class="keep">

## How a problem gets matched: an example

The problem below is paraphrased and anonymised from one of our student interviews. The mentors are made up.

<div class="example">
<div class="problem">
<h4>Student's problem</h4>
<p>"I'm considering the speech technology and deep learning for computer vision electives next term, but I can't find anyone who has taken them. I'd like to hear from someone who has worked in these areas before I decide."</p>
<p style="margin-top:6pt"><strong>Tags chosen:</strong><br><span class="chip">20 Choosing electives</span><span class="chip">11 Computer vision</span><span class="chip">12 Speech technology</span></p>
</div>
<div>
<h4>What IIC sees</h4>
<table>
<thead><tr><th>Mentor</th><th>Shared tags</th><th>Mentees</th></tr></thead>
<tbody>
<tr><td>Mentor A: CV engineer</td><td class="n">2</td><td>0 of 1</td></tr>
<tr><td>Mentor B: speech research</td><td class="n">1</td><td>0 of 1</td></tr>
<tr><td>Mentor C: speech + NLP</td><td class="n">1</td><td>1 of 2</td></tr>
<tr class="out"><td>Mentor D: data analyst</td><td class="n">0</td><td>not shown</td></tr>
</tbody>
</table>
<p style="font-size:8.5pt;color:var(--muted)">A ranks first with the most shared tags. B ranks above C because, with the same number of shared tags, B has fewer current mentees. IIC reads the problem and picks one of them.</p>
</div>
</div>

</div>

## Not handled through tags

<div class="notags">

| Need | What we propose |
|---|---|
| Feeling overwhelmed, or other wellbeing concerns | Not matched to a mentor. The request reaches IIC, which refers the student to the right support. Where should these go? |
| Placement portal and placement process | Out of scope, as agreed on 15 October. Tags 3–5 cover career guidance about jobs, not the placement process itself. |

</div>

## Questions for IIC

Once IIC is happy with the list, we will load it as fixed seed data. Students and mentors will choose from it, and it will be used when importing mentors.

<div class="qs">

| | |
|---|---|
| 1 | What do students most often ask IIC about that is missing from this list? |
| 2 | Should tags 3–5 (internships, job search, interview preparation) stay, given that placement is out of scope? Where is the line? |
| 3 | Should we keep or drop the four proposed tags: 6 Resume and portfolio, 13 NLP, 14 Data and business analytics, 15 Web and app development? |
| 4 | Should elective guidance be tagged by subject area, as here, or by named course from the course catalogue? |
| 5 | Should IIC be able to add, rename or retire tags each cycle? This would add one small feature to our plan. |
| 6 | For the dummy mentor database, what backgrounds do mentors typically have, so that we can tag them realistically? |

</div>

