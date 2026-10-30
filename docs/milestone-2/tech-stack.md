# Tech stack (SCRUM-49)

Decided 30 Oct 2026 · Owner: Abhijeet Kumar

## Decision

A **Flask REST API** with a **React single-page frontend** built with Vite. SQLAlchemy runs on SQLite for development and tests and on PostgreSQL for the hosted demo. Tests use **pytest**, and the **Swagger (OpenAPI) YAML** is generated from the code.

It is one application split into modules. There are no microservices. The team agreed on React for the frontend. Hosting will be decided later (see Open points).

## Why not Next.js and Supabase

We were given a recommendation for Next.js, TypeScript, Supabase, Tailwind, Vitest and Playwright. It is a sound product stack, but it does not fit how this course grades the project:

- Milestones 3 and 4 ask for the "backend code of the implemented APIs", a Swagger-compatible YAML of "the APIs created by the dev team", and pytest code for those APIs. Supabase generates its APIs from the database and enforces access with database policies. Neither is code we write, and neither can be tested with pytest.
- Vitest and Playwright are JavaScript test runners. The rubric marks pytest.
- The project statement's own example backend is Flask, which the IITM BS app-development courses teach, so every member can review and fix the API code.
- Milestone 2 asks for frontend pages without backend integration. A React app built with Vite and running on mock data does that. Next.js server features would go unused, because Flask is the server.

We keep the parts of that recommendation that fit:

| Kept | How it shows up here |
|---|---|
| React for the frontend | React with Vite, without Next.js |
| A relational database with constraints and transactions | PostgreSQL for the hosted demo; constraints declared in the SQLAlchemy models |
| One modular application, without microservices, Kubernetes, Redis, MongoDB, a vector database or LangChain | One Flask app with one blueprint per module |
| Deterministic matching that IIC confirms | US-04: most shared topic tags first, then fewest active mentees, then mentor ID |
| Authorisation enforced on the server, not by hiding buttons | Role and ownership checks on every endpoint, with tests for 401 and 403 |
| Validation of every request | marshmallow schemas on the server (in place of Zod); React Hook Form gives instant feedback in the browser |
| An audit log, and no conversation content stored | An `audit_log` table; session records have no content field (US-11) |
| Email notifications | SMTP, so Resend or any other provider works |
| Charts of aggregate data | Recharts |

## The stack

### Backend (`backend/`)

| Concern | Choice | Notes |
|---|---|---|
| Language | Python 3.12 | |
| Web framework | Flask 3 | |
| REST API, validation and OpenAPI | flask-smorest (marshmallow) | Validates each request against a schema and generates the OpenAPI document from the code. `flask openapi write --format=yaml openapi.yaml` produces the M3/M4 YAML. Serves a Swagger UI page for manual testing |
| ORM and migrations | Flask-SQLAlchemy (SQLAlchemy 2), Flask-Migrate | |
| Database | SQLite locally and in tests; PostgreSQL for the hosted demo | Same models, switched by `DATABASE_URL`. Evaluators can run the project without a database server |
| Authentication | Flask-JWT-Extended; Werkzeug password hashing | The token carries the role: student, mentor, IIC or leadership |
| Signed, expiring links | itsdangerous (ships with Flask) | Email verification, valid 24 hours (US-01); mentor activation, valid 7 days (US-14) |
| Email | Flask-Mail over SMTP | Captured in tests and printed in development. A real provider is needed only for the hosted demo |
| Timed checks | A `flask run-checks [--now <time>]` command, run by cron on the host | Escalations at 48 and 72 hours (US-21), session reminders 24 hours ahead (US-11), *Inactive* and *Feedback overdue* flags (US-12, US-17). `--now` lets us demo a 72-hour escalation in seconds |
| CSV import | Python `csv` with a marshmallow schema per row | Row-level errors for the student roster (US-15) and the mentor pool (US-14) |
| Cross-origin requests | Flask-CORS | Needed only when the frontend and the API are on different domains |
| Tests | pytest, pytest-cov, the Flask test client, openapi-spec-validator | |
| Code style | Ruff (lint and format) | |

### Frontend (`frontend/`)

| Concern | Choice | Notes |
|---|---|---|
| Framework and build | React 19 with Vite | Agreed by the team |
| Language | JavaScript (JSX) | |
| Routing | React Router | Role-based navigation and protected routes (SCRUM-56) |
| State | React context | The logged-in user and their role; no extra state library |
| UI | React-Bootstrap (Bootstrap 5) and Bootstrap Icons | Forms, tables, dialogs and alerts without custom CSS |
| Forms | React Hook Form | Field-level validation messages; the API still checks everything |
| Charts | Recharts | Programme insights dashboard (US-19) |
| API access | One `src/api/` file per backend module | Returns mock data in M2; switched to real requests in M3 without changing any page |
| Code style | ESLint and Prettier | |

### Team tools

| Concern | Choice |
|---|---|
| Code and reviews | GitHub, with a protected `main` branch; the code reviewer approves each pull request before merge |
| Continuous integration | GitHub Actions runs Ruff and pytest on every pull request |
| Planning | Jira: board, timeline and sprints |
| Diagrams | draw.io or Mermaid for the class and ER diagrams |
| Hosting | Not decided yet (see Open points) |

**GenAI:** none for now. If the team adds an AI feature later, it gets its own module and endpoint, it is listed in the YAML as an integrated API, and IIC still confirms every assignment.

## How the backend is organised

```text
backend/
  app/
    __init__.py      create_app(), extensions, blueprint registration
    auth/            sign-up, email verification, login, roles      US-01
    students/        student profiles, roster import                US-02, US-15
    mentors/         mentor pool, verification, availability        US-10, US-14
    settings/        topic tags, email domains, timing windows      US-01, US-03, US-21
    problems/        submission, status, IIC queue, closure         US-03, US-05, US-16, US-20
    matching/        mentor recommendations                         US-04
    mentorships/     assignment, accept/decline, goal, next steps   US-06, US-09, US-13
    sessions/        scheduling and logging sessions                US-11
    feedback/        student and mentor feedback                    US-08, US-12
    cases/           change, end and misconduct cases               US-07, US-18
    monitoring/      flags and the timed checks                     US-17, US-21
    insights/        aggregates for leadership                      US-19
    notifications/   email templates and sending
    audit/           audit log
  migrations/
  tests/
  openapi.yaml       generated; submitted with M3 and M4
```

Each module has `routes.py` (HTTP only), `schemas.py` (marshmallow), `services.py` (business rules) and `models.py`. Business rules live in services, so pytest can test them without HTTP. Route tests cover status codes, validation errors and permissions.

## How the stack meets the course requirements

| Requirement in the project statement | How it is met |
|---|---|
| An API-based platform, with APIs for all core functions, validation, error handling and access control | flask-smorest blueprints, marshmallow validation and role checks; every error response is declared per endpoint |
| Swagger-compatible YAML listing error handling, the user-story mapping and a description of each API (M3, M4) | Generated with `flask openapi write --format=yaml`. Each endpoint's docstring names its user stories, and a pytest test checks that the file is valid OpenAPI |
| Backend code of the implemented APIs (M3, M4) | `backend/` |
| pytest code, and test cases with input, expected output and actual output (M3, M4) | The pytest suite; `pytest -v` output fills the actual-output column |
| Automated tests for business logic, API endpoints, validation, permissions and workflow transitions | Service tests (matching, capacity, status transitions, escalation timing) and route tests (401, 403, 422) |
| Records of status changes, decisions and outcomes | The audit log, plus a timestamp on every status change |
| Security and data integrity | Server-side role and ownership checks, hashed passwords, signed links, and database constraints (unique roll number, at most one active mentorship per student) |
| M2: connected frontend pages with redirection, no backend integration, and a README | A React Router app with mock data; the README covers `npm install` and `npm run dev` |
| M5: working prototype, run instructions, tools and technologies | `pip install -r requirements.txt`, `flask db upgrade`, `flask seed`, `flask run`; this document becomes the tools section |

## What this means for each sprint

- **M2 (due 7 Nov, extended from 1 Nov):** Khushi scaffolds `frontend/` with Vite, React Router and React-Bootstrap (SCRUM-56) so the other page tasks can start. Mock data uses the field names from Priyanshu's class and ER diagrams (SCRUM-51, SCRUM-52), so moving to the real API in M3 changes only `src/api/`. No backend code is due.
- **M3, Sprint 1 (8–22 Nov):** set up `backend/` in the layout above, with authentication, the Sprint 1 stories, CI on every pull request and the first YAML export.
- **M4, Sprint 2 (due 6 Dec):** the Sprint 2 stories, the `run-checks` command and the insights endpoints.
- **M5 (due 20 Dec):** hosting, seed data for the demo and the final README.

## Open points

1. **Hosting**, to be decided later; it is needed for the M5 working prototype. Options so far: the API on a Python host such as Render, behind gunicorn; the frontend as a static site on Netlify or Vercel; a managed PostgreSQL database such as Neon.
2. **Email provider for the hosted demo**, decided together with hosting. Development and tests need none.
