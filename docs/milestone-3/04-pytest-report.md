## pytest Report (Sprint 1)

The backend's automated tests are pytest tests in [`backend/tests/`](../../backend/tests/). This report gives the results of a full run (SCRUM-78). The complete output, with one line per test and the coverage of each file, is in [`build/pytest-output.txt`](build/pytest-output.txt).

### Result

| | |
|---|---|
| Tests | **373** |
| Passed | **373** |
| Failed, errors, skipped | 0 |
| Duration | 3 min 21 s |
| Line coverage of `backend/app/` | **98%** (2,903 statements, 51 not run) |
| Date | 24 Nov 2026 |

### How it was run

```text
platform: Linux (WSL2), Python 3.12.16, pytest 9.2.0, pytest-cov 7.1.0
database: SQLite in memory, a fresh one for each test (FLASK_CONFIG=testing)
command:  cd backend && pytest -o addopts="" -v --cov=app --cov-report=term-missing
```

The same suite runs in continuous integration (GitHub Actions, the "Backend Tests & Linting" check) on every pull request and every push to `main`. A pull request cannot be merged into `main` unless it passes. Each CI run keeps its output as the `pytest-output` and `coverage-report` artifacts.

### Results by test file

| Test file | What it tests | Tests | Passed |
|---|---|---|---|
| `test_signup.py` | US-01 sign-up, email verification and links | 25 | 25 |
| `test_students.py` | US-02 student profile | 14 | 14 |
| `test_problems.py` | US-03 submitting, editing and withdrawing a problem | 16 | 16 |
| `test_recommendations.py` | US-04 recommended mentors | 21 | 21 |
| `test_mentorships.py` | US-05 tracking the mentorship and reaching out | 15 | 15 |
| `test_mentors.py` | US-09 accepting and declining, US-10 availability | 17 | 17 |
| `test_capacity_requests.py` | US-10 and US-18 capacity requests | 11 | 11 |
| `test_mentor_pool.py` | US-14 adding, importing, verifying and activating mentors | 33 | 33 |
| `test_roster.py` | US-15 IIC's student roster | 29 | 29 |
| `test_problem_queue.py` | US-16 the problem queue, assignment and closing | 26 | 26 |
| `test_student_journey.py` | Across roles: problem limits, what mentors can see, notices to the student | 12 | 12 |
| `test_auth.py` | Login, logout, tokens and role checks | 36 | 36 |
| `test_notifications.py` | Dashboard notices and emails | 21 | 21 |
| `test_audit.py` | The audit log | 21 | 21 |
| `test_settings.py` | Topic tags | 11 | 11 |
| `test_sessions.py` | Sessions (built ahead of Sprint 2) | 12 | 12 |
| `test_feedback.py` | Progress feedback (built ahead of Sprint 2) | 7 | 7 |
| `test_cases.py` | Change requests to IIC (built ahead of Sprint 2) | 8 | 8 |
| `test_app.py` | The application, configuration and error format | 14 | 14 |
| `test_openapi.py` | The OpenAPI document: valid, complete and up to date | 13 | 13 |
| `test_models.py`, `test_migrations.py`, `test_seed.py`, `test_fixtures.py` | Models, migrations, sample data and test fixtures | 11 | 11 |
| **Total** | | **373** | **373** |

### Coverage by module

| Module | Statements | Not run | Coverage |
|---|---|---|---|
| `auth` (sign-up, login, roles) | 374 | 5 | 99% |
| `students` (profile, roster) | 304 | 5 | 98% |
| `problems` (problems, IIC queue) | 284 | 1 | 100% |
| `matching` (recommendations) | 80 | 1 | 99% |
| `mentors` (mentor pool, dashboard, capacity) | 553 | 17 | 97% |
| `mentorships` | 218 | 4 | 98% |
| `notifications` | 191 | 4 | 98% |
| `audit` | 83 | 1 | 99% |
| `settings` | 110 | 4 | 96% |
| `sessions`, `feedback`, `cases` (ahead of Sprint 2) | 300 | 4 | 99% |
| `monitoring`, `insights` (Sprint 2, models only) | 19 | 1 | 95% |
| Shared code (app factory, configuration, errors, OpenAPI, logging) | 387 | 4 | 99% |
| **Total** | **2,903** | **51** | **98%** |

The statements not run are mostly:
- the models' `__repr__` methods, used only when debugging;
- the command-line wrapper of `flask seed-data`, whose function is tested directly;
- the safety net that logs a failure to record an email's delivery;
- a few rare branches, such as an over-long experience entry in a mentor import, or adding back a student IIC had removed.

Each file's missing line numbers are in [`build/pytest-output.txt`](build/pytest-output.txt).

### Reproducing the run

From `backend/`, with the virtual environment active (see the [backend README](../../backend/README.md)):

```bash
pytest                         # quick: one dot per test
pytest --cov=app               # with coverage, as CI runs it
pytest -o addopts="" -v --cov=app --cov-report=term-missing   # this report's run: one line per test
```
