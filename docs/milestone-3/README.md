# Milestone 3: Sprint 1

Due **Wednesday 25 November 2026** (extended from 22 Nov). Sprint 1 builds the ten stories that take a student from IIC's roster to an assigned mentor: US-01 to US-05, US-09, US-10 and US-14 to US-16.

## Documents

| File | Contents | Jira |
|---|---|---|
| [01-api-test-cases.md](01-api-test-cases.md) | Every API test case: the API, inputs, expected and actual output, and the result. Also each case where the actual output differed from the expected, and the fix | SCRUM-77 |
| [02-user-feedback.md](02-user-feedback.md) | The user feedback session: what was shown, who to, and what they said | SCRUM-79 |
| [03-sprint-2-plan.md](03-sprint-2-plan.md) | The Sprint 2 backlog, adjusted to the feedback | SCRUM-79 |
| [issue-log.md](issue-log.md) | Development problems, their causes and fixes | |

The PDF is built with `npm run pdf:m3` from `docs/`, and appears in `docs/milestone-3/build/`.

## Submission checklist (SCRUM-80)

| Deliverable | Where it comes from | Done |
|---|---|---|
| YAML | [`backend/openapi.yaml`](../../backend/openapi.yaml) | [ ] |
| Backend code | [`backend/`](../../backend/) | [ ] |
| Test cases | `team-050-milestone-3.pdf`, built from `01-api-test-cases.md` | [ ] |
| pytest code | [`backend/tests/`](../../backend/tests/) | [ ] |
| pytest output | The `pytest-output` artifact of the latest CI run on `main`, and Priyanshu's report (SCRUM-78) | [ ] |
| User feedback | `02-user-feedback.md`, filled in after the session | [ ] |
| Next-sprint plan | `03-sprint-2-plan.md`, updated after the session, with the same changes in Jira | [ ] |

Upload every deliverable, then press **Submit**. An upload alone is not a submission.

## Regenerating the test-case document

The tables in `01-api-test-cases.md` were produced by running the pytest suite with a small plugin. The plugin records each request the tests send and the response the API actually returned. After the tests change, run the suite again and regenerate the document, so that the actual outputs stay real. From `backend/`, with the virtual environment active:

```bash
PYTHONPATH=../docs/milestone-3/tools RECORD_OUT=records.json pytest -p record_plugin
python ../docs/milestone-3/tools/gen_doc.py records.json .. ../docs/milestone-3/01-api-test-cases.md
rm records.json
```

The "differed from expected" section is written by hand in [`tools/differences.md`](tools/differences.md). In that file, `{TC:test_name}` is replaced with the test case's number.
