# IITM BS Mentoring: frontend

Team 050, IITM BS Software Engineering project (September 2026 term), problem statement Option 2: **Student Mentoring and Career Support Platform**.

This folder is the web client for Milestone 2. It is a React single-page app with the pages for all four roles: students, mentors, IIC coordinators and programme leadership. The pages are connected and the routing between them works.

As the milestone asks, the app is **not connected to a backend yet**. Each page keeps its own sample data, so changes you make while clicking through are lost when you reload. From Milestone 3 the pages call the team's Flask REST API instead.

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

Then open **http://localhost:5173** in your browser. The app opens on the mentor dashboard.

These steps are the same on Windows, macOS and Linux. `npm install` downloads the packages into `node_modules/` and only needs to be run once.

### Other commands

| Command | What it does |
|---|---|
| `npm run dev` | Starts the development server with hot reload on port 5173 |
| `npm run build` | Builds an optimised version into `dist/` |
| `npm run preview` | Serves the `dist/` build at http://localhost:4173 (run `npm run build` first) |
| `npm run lint` | Checks the code with ESLint |

## How to explore the prototype

There is no real login until the API exists, so the app signs you in as a sample user:

- **Switch role** from the login page: `student`, `mentor`, `iic` or `leadership`.
- **Try the sign-up flow** at http://localhost:5173/welcome: *Get Started* → sign-up → *Verify your email*. The bar at the bottom of the verify page, **Open the verification link**, stands in for the link in the email. It signs in a new student, who then completes their profile and submits a problem.
- **Mentor activation:** http://localhost:5173/activate/demo shows the page a newly verified mentor opens from their email. http://localhost:5173/activate/expired shows an expired link.

A refresh logs you out (the mock session lives in memory).

## Demo accounts

All use the password `password123` (or use the shortcuts on the login page):

| Role | Email |
|---|---|
| Student | 23f1002345@ds.study.iitm.ac.in |
| Mentor | rahul.menon@example.com |
| IIC | deepa.krishnan@iitm.ac.in |
| Leadership | anand.rajan@iitm.ac.in |

### Pages

| Role | Address | Page | User stories |
|---|---|---|---|
| Public | `/welcome` | Welcome | US-01 |
| Public | `/login` | Log in (A1) | US-01 |
| Public | `/signup` | Student sign-up (A2) | US-01 |
| Public | `/verify-email` | Verify your email (A3) | US-01 |
| Public | `/forgot-password`, `/reset-password` | Password reset | US-01 |
| Public | `/activate/:token` | Mentor account activation (A4) | US-14 |
| Student | `/student/onboarding` | Complete your profile (S1) | US-02 |
| Student | `/student/problem/new` | Submit your problem, with the AI problem coach (S2) | US-03, US-20 |
| Student | `/student/problem` | My mentoring problem and its status (S3) | US-03, US-05 |
| Student | `/student` | Dashboard: mentor assigned (S4) | US-05 |
| Student | `/student/mentorship` | Mentorship workspace, feedback, change or end request (S5–S7) | US-06, US-07, US-08, US-11 |
| Student | `/student/profile` | Profile | US-02 |
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

Addresses with an id (`p1`, `r6`, `r2`, `C-014`) are sample records. You reach the others by clicking through the lists on each page. Switch to the matching role before opening an address directly.

### AI features

The three AI features show sample responses in this milestone. In every one, the user decides what to do with the suggestion.

- **Problem coach** (student, `/student/problem/new`): write a description of at least 30 characters and press **Check my problem**. It suggests topic tags and points out missing detail.
- **Mentor fit notes** (IIC, `/iic/problems/p1`): press **Explain fit with AI** to see why each recommended mentor fits. The ranking itself never changes.
- **Feedback review** (IIC, `/iic/mentorships/r2`): press **Summarise with AI**, and act on the wellbeing flag with **I'll follow up** or **Not a concern**.

## Project structure

```text
frontend/
├── index.html            Page shell that loads src/main.jsx
├── package.json          Scripts and dependencies
├── theme.css             Design tokens, applied as Bootstrap overrides
├── vite.config.js        Vite configuration
├── eslint.config.js      Lint rules
├── .prettierrc           Code formatting rules
├── public/               Static files (favicon)
└── src/
    ├── main.jsx          Entry point: router, sign-in context, global styles
    ├── App.jsx           Top-level routes
    ├── api/              Centralized layer for communication with backend and external servers, and mock data and implementations
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
- **A page sends you to a different dashboard:** the page belongs to another role. Switch role first (see above).
