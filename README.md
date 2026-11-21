# SE-SEP2026-Team-050

**Student Mentoring and Career Support Platform.** This is Option 2 of the IITM BS Software Engineering project for the September 2026 term.

The platform connects current IITM BS students with alumni and recent graduates for career guidance. Students registered with IIC sign up and describe the problem they need help with. IIC then assigns each student a mentor from the platform's recommendations. The platform also tracks mentoring activity and gives programme-level insights to administrators.

## Current status

Milestones 1 and 2 are submitted. Milestone 3 (Sprint 1) is in progress.

- **Backend** ([backend](backend/README.md)): the Flask API foundation is in place:
  - one module per component of the Milestone 2 design (C1 to C14);
  - models and migrations for all 22 tables of the ER design;
  - `flask seed-data` for sample data;
  - login, logout and `GET /api/auth/me`, with role checks;
  - the audit log and notifications (dashboard notices and emails) that the user stories record and send through;
  - the OpenAPI document with Swagger UI;
  - a pytest suite that CI runs on every pull request.

  The endpoints for each user story are built in Sprints 1 and 2.
- **Frontend** ([frontend](frontend/README.md)): a React prototype with the pages for all four roles, including the three AI features. It runs on an in-memory mock for now. In Milestone 3, each function in `frontend/src/api/` is switched to call the API.

## Team

| Member | Roll number | GitHub | Roles |
|---|---|---|---|
| Abhijeet Kumar | 24f2007359 | [@AbhijeetKumar1505](https://github.com/AbhijeetKumar1505) | Backend Developer, Code Reviewer |
| Priyanshu Yadav | 23f1000018 | [@priyanshuyadav705](https://github.com/priyanshuyadav705) | Tester, Backend Developer |
| Saloni Puri | 23f3003439 | [@23f3003439](https://github.com/23f3003439) | Product Manager, Scrum Master |
| Shreya Pal | 21f1002298 | [@shreya-pal](https://github.com/shreya-pal) | Tester, Frontend Developer |
| Khushi Dhankhar | 23f3003132 | [@23f3003132](https://github.com/23f3003132) | Frontend Developer, Scrum Master |

## Milestones

| Milestone | Focus | Deadline | Status | Docs |
|---|---|---|---|---|
| 1 | Identify user requirements | 25 Oct 2026 | Submitted | [docs/milestone-1](docs/milestone-1/README.md) |
| 2 | Scheduling and design (submitted with `team-050-milestone-1-2.zip`) | 07 Nov 2026 | Submitted | [docs/milestone-2](docs/milestone-2/README.md) |
| 3 | Sprint 1: API endpoints, test cases, user testing | 22 Nov 2026 | In progress | |
| 4 | Sprint 2: API endpoints, test cases, user testing | 06 Dec 2026 | Not started | |
| 5 | Final report and working prototype (submitted with `team-050-milestone-3-5.zip`) | 20 Dec 2026 | Not started | |

## Quick start

You need **Python 3.12 or later** and **Node.js 20.19 or later**. The backend and frontend READMEs have the full details.

**Backend.** From `backend/`, create and activate a virtual environment, then:

```bash
pip install -r requirements-dev.txt
flask db upgrade
flask seed-data
flask run
```

- The API runs at http://127.0.0.1:5000, and Swagger UI at http://127.0.0.1:5000/api/docs/swagger.
- `flask seed-data` fills the database with sample users, mentors, problems and mentorships, and you can run it more than once. The accounts it creates are listed in `app/seed.py`. For your own login, use `flask create-user EMAIL --role ROLE`.

**Frontend.** From `frontend/`:

```bash
npm install
npm run dev
```

The app runs at http://localhost:5173. Login and the notification bell call the backend (Vite proxies `/api` to port 5000, so keep Flask running); the other pages still use the mock. Its README lists the demo accounts and how to reach every page.

**Running in WSL (optional, on Windows).** WSL runs the project on Linux, as CI does, and adds [Mailpit](https://mailpit.axllent.org) to catch the emails the backend sends. From the repository folder inside WSL:

```bash
bash scripts/wsl/setup.sh    # once, and safe to repeat
bash scripts/wsl/dev.sh up   # starts the API, the web app and Mailpit in the background
```

- **What the setup installs:** a Python 3.12 environment in `~/.venvs/se-sep2026-team-050`, the frontend packages for Linux, Mailpit, and a `backend/.env` that sends emails to Mailpit. It also upgrades and seeds the database. It needs no `sudo`.
- **The servers keep running after you close the terminal.** `dev.sh status` shows them, `dev.sh logs api` (or `web` or `mail`) follows a log, and `dev.sh down` stops them. Both reload when you save a file, including from Windows.
- **Emails:** open http://localhost:8025 to read them and click their links, such as the sign-up verification link.
- **Running `flask` or `pytest` yourself:** first activate the environment with `source ~/.venvs/se-sep2026-team-050/bin/activate`.
- **If downloads time out,** WSL's DNS may be broken. Check with `getent hosts pypi.org`.

## Repository layout

| Folder | What it holds |
|---|---|
| [backend](backend/README.md) | Flask REST API, one module per component. Its README explains how to set it up, run it and test it, and how to add an endpoint |
| [frontend](frontend/README.md) | React web client. Its README explains how to install and run it, and lists every page |
| [docs](docs) | Report sources (Markdown) and the built PDFs for each milestone, plus the [topic-tag list](docs/topic-tags/01-topic-tags.md). Rebuild a PDF from `docs/` with `npm install`, then `npm run pdf` (Milestone 1) or `npm run pdf:m2` (Milestone 2) |
| [.github/workflows](.github/workflows/ci.yml) | Continuous integration (see below) |

## Tech stack

- **Backend:** Python 3.12, Flask 3.1, flask-smorest (OpenAPI and Swagger UI), SQLAlchemy 2 with Flask-Migrate, Flask-JWT-Extended, pytest and Ruff. Development uses SQLite. The reasons for each choice are in [docs/milestone-2/tech-stack.md](docs/milestone-2/tech-stack.md).
- **Frontend:** React 19, Vite 8, React Router 7, React Bootstrap 2, React Hook Form and Recharts, with ESLint and Prettier.

## Project tracking

Backlog, sprints and tasks are tracked in Jira on the [SCRUM board](https://youmat.atlassian.net/jira/software/projects/SCRUM/boards/1).

- There is one sprint per milestone (M1–M5).
- Each user story, US-01 to US-21, is a Jira story with backend, frontend and test sub-tasks.
- Issues move from **To Do** to **In Progress** to **In Review** (pull request open) to **Done** (merged into `main`).

## Working on the code

- **Branches.** Each member works on their own branch (`abhijeet`, `priyanshu`, `shreya`, `khushi`) or on a feature branch named after its Jira issues, such as `feature/scrum-70-74-models-and-ci`. Update your branch from `main` before starting new work: `git pull origin main`.
- **Pull requests.** `main` is protected, so every change goes in through a pull request. A pull request can be merged only after:
  - the **Backend Tests & Linting** check passes;
  - it has one approving review.

  Abhijeet reviews and merges. Copilot also reviews each pull request automatically. Put the Jira keys (for example `SCRUM-97`) in the pull request's title or description.
- **Continuous integration.** [`ci.yml`](.github/workflows/ci.yml) runs on every push to `main` and on every pull request into `main`:
  - It runs Ruff and the pytest suite with coverage.
  - The pytest output and the coverage report are saved as artifacts, for the sprint submissions.
- **Checks to run before opening a pull request.** CI checks only the backend, so run the frontend checks yourself.

  | Part | Commands |
  |---|---|
  | Backend (from `backend/`) | `ruff check .`, `ruff format --check .` and `pytest`. If you changed an endpoint, also run `flask openapi write --format=yaml openapi.yaml` and commit the result |
  | Frontend (from `frontend/`) | `npm run lint` and `npm run build`, then click through the pages you changed |
