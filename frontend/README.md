# IITM BS Mentoring: frontend

Team 050, IITM BS Software Engineering project (September 2026 term), problem statement Option 2: **Student Mentoring and Career Support Platform**.

This folder is the web client for Milestone 2. It is a React single-page app with the pages for all four roles: students, mentors, IIC coordinators and programme leadership. The pages are connected and the routing between them works.

Pages get their data through `src/api/`, which calls the Flask REST API for everything built so far:

| Calls the API | Still uses the in-memory mock (`src/api/mock/`) |
|---|---|
| Login, logout, sign-up, email verification and the notification bell | Password reset |
| Student profile, problem, status, mentorship workspace | Monitoring, mentorship review and cases (IIC) |
| Mentor dashboard, assignments, profile and availability, activation | Domain and timing settings (IIC) |
| IIC problem queue, review, recommendations, assignment and closing | Leadership insights |
| IIC mentor pool, verification, capacity requests, roster | The AI problem coach and mentorship summary |

The mock pages work as before, with sample data that resets when you reload. Two actions say they come in Sprint 2 instead: the AI fit notes on the assignment page and ending a mentorship. When a Sprint 2 endpoint is built, its function in `src/api/` switches from the mock to the `...FromApi` version next to it.

`src/api/client.js` holds the shared API code: the base URL, the login token in `localStorage`, and error handling. In development Vite proxies `/api` to `http://127.0.0.1:5000`, so start the backend too (see [backend/README.md](../backend/README.md)). To call a different origin, copy `.env.example` to `.env` and set `VITE_API_URL`.

## Requirements

- **Node.js 20.19 or later** (or 22.12 or later). Vite 8 needs one of these. Check with `node -v`.
- **npm** (installed with Node.js).
- A modern browser (Chrome, Edge, Firefox or Safari).

## Install and run

From the folder that contains this README:

```bash
npm install
npm run dev
```

Then open **http://localhost:5173** in your browser. The app opens on the welcome page.

These steps are the same on Windows, macOS and Linux. `npm install` downloads the packages into `node_modules/` and only needs to be run once.

### Other commands

| Command | What it does |
|---|---|
| `npm run dev` | Starts the development server with hot reload on port 5173 |
| `npm run build` | Builds an optimised version into `dist/` |
| `npm run preview` | Serves the `dist/` build at http://localhost:4173 (run `npm run build` first) |
| `npm run lint` | Checks the code with ESLint |

## How to explore the prototype

Login calls the backend. Run `flask db upgrade` and `flask seed-data` in `backend/` first, then log in with a demo account below or use the shortcuts on the login page. The token is kept in `localStorage`, so a refresh keeps you signed in until you log out or the token expires.

- **Switch role** at any time with the drop-down in the header (Student, Mentor, IIC, Leadership). It signs you in as that role's demo account. It is a prototype aid and goes away with the demo accounts in Milestone 3.
- **Try the sign-up flow** at http://localhost:5173: *Get Started* → sign-up → *Check your inbox*. Use a roll number on IIC's roster that has no account yet; `flask seed-data` adds three, such as `23F1002346` with `23f1002346@ds.study.iitm.ac.in`. The verification email arrives in Mailpit at http://localhost:8025 (or the Flask log). Its link signs in the new student, who then completes their profile and submits a problem.
- **Mentor activation:** as IIC, open **Mentor pool** and verify a mentor who is *Pending verification*. The confirmation has an **open the link** shortcut to the page the mentor would open from their email. http://localhost:5173/activate/expired shows an expired link.

## Demo accounts

These are the accounts `flask seed-data` creates in the backend. All use the password `Password123!` (or use the shortcuts on the login page):

| Role | Email |
|---|---|
| Student | rahul.student@ds.study.iitm.ac.in |
| Mentor | arun.mentor@ds.study.iitm.ac.in |
| IIC | deepa.iic@ds.study.iitm.ac.in |
| Leadership | leadership@ds.study.iitm.ac.in |

Sign-up creates a real account in the backend. The password-reset pages still use the mock until their endpoint exists (SCRUM-172), so a reset there does not change the backend account.

### Pages

| Role | Address | Page | User stories |
|---|---|---|---|
| Public | `/` | Welcome | US-01 |
| Public | `/login` | Log in (A1) | US-01 |
| Public | `/signup` | Student sign-up (A2) | US-01 |
| Public | `/verify-email`, `/verify-email/:token` | Verify your email (A3) | US-01 |
| Public | `/forgot-password`, `/reset-password/:token` | Password reset | US-01 |
| Public | `/activate/:token` | Mentor account activation (A4) | US-14 |
| Student | `/student/profile` | Profile; a new student completes it first (S1) | US-02 |
| Student | `/student/problem/new` | Submit your problem, with the AI problem coach (S2) | US-03, US-20 |
| Student | `/student` | My mentoring problem, its status and the assigned mentor (S3, S4) | US-03, US-05 |
| Student | `/student/mentorship` | Mentorship workspace, feedback, change or end request (S5–S7) | US-06, US-07, US-08, US-11 |
| Mentor | `/mentor` | Dashboard: assignments to accept or decline, active mentorships (M1, M2) | US-09, US-10 |
| Mentor | `/mentor/availability` | Availability and contact (M3) | US-10 |
| Mentor | `/mentor/mentorships/r6` | Mentorship workspace: log a session, progress feedback, end (M4–M6) | US-06, US-11, US-12, US-13 |
| IIC | `/iic` | Problem queue (I1) | US-16, US-21 |
| IIC | `/iic/problems/p1` | Review and assign, with AI mentor fit notes (I2) | US-04, US-16, US-20 |
| IIC | `/iic/mentors` | Mentor pool: add, import, verify (I3) | US-14 |
| IIC | `/iic/students` | Registered students (I4) | US-15 |
| IIC | `/iic/monitoring` | Monitoring (I5) | US-17, US-21 |
| IIC | `/iic/mentorships/r2` | Mentorship feedback review with the AI summary and wellbeing flag (I8) | US-08, US-17 |
| IIC | `/iic/cases/C-014` | Case: change, end or misconduct (I6) | US-07, US-18 |
| IIC | `/iic/settings` | Settings, topic tags and audit log (I7) | US-01, US-03, US-21 |
| Leadership | `/leadership` | Programme insights (L1) | US-19 |

Addresses with an id (`p1`, `r6`, `r2`, `C-014`) are sample records. Since a refresh logs you out, reach them by clicking through the lists on each page.

### AI features

The three AI calls are in `src/api/ai.js`. Until the API calls a model (Sprint 2), rule-based stand-ins in `src/api/mock/ai.js` answer the problem coach and the summary, and the fit notes say they come in Sprint 2. In every feature, the user decides what to do with the suggestion.

- **Problem coach** (Student → **Submit a new problem**): write a description of at least 30 characters and press **Check my problem**. It suggests topic tags from IIC's list, which you can add with one click, and points out missing detail. The demo student already has an open problem, so withdraw it on **My problem** first.
- **Mentor fit notes** (IIC → **Problem queue** → **Open**): press **Explain fit with AI** to see why each recommended mentor fits. The ranking itself never changes.
- **Feedback review** (IIC → **Monitoring** → **Open** on Sneha Pillai's row, or the bell): read both sides' feedback, press **Summarise with AI**, and act on the wellbeing flag with **I'll follow up** or **Not a concern**. New student feedback is checked when it is sent, so a worrying comment raises a new flag for IIC.

## Project structure

```text
frontend/
├── index.html            Page shell that loads src/main.jsx
├── package.json          Scripts and dependencies
├── vite.config.js        Vite configuration
├── eslint.config.js      Lint rules
├── .prettierrc           Code formatting rules
├── public/               Static files (favicon)
└── src/
    ├── main.jsx          Entry point: router, sign-in context, global styles
    ├── App.jsx           Top-level routes
    ├── theme.css         Design tokens, applied as Bootstrap overrides
    ├── api/              All calls to the backend (ai.js holds the three AI features); mock/ answers the Sprint 2 ones for now
    ├── routes/           Routes for each role (account, student, mentor, IIC, leadership)
    ├── pages/            One component per screen; auth/, student/, mentor/, iic/ and leadership/ hold those roles' pages
    ├── components/       Shared layout and UI pieces (layouts, tables, modals, badges)
    ├── context/          Signed-in user (sample users until the API exists)
    ├── constants/        Labels, statuses, navigation links and the topic-tag list
    ├── hooks/            Shared hooks
    └── utils/            Date formatting, CSV and download helpers
```

## Tech stack

React 19, Vite 8, React Router 7, React Bootstrap 2 (Bootstrap 5 and Bootstrap Icons), React Hook Form and Recharts. ESLint 9 and Prettier keep the code consistent.

## Troubleshooting

- **`npm install` fails or Vite will not start:** check `node -v`. Versions older than 20.19 are not supported.
- **Port 5173 is already in use:** Vite picks the next free port and prints it in the terminal. Open that address instead.
- **A page sends you to a different dashboard:** the page belongs to another role. Switch role with the drop-down in the header first.
- **You land on the login page after typing an address:** a refresh logs you out. Log in again and use the app's links.
