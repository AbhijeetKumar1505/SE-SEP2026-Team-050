## Issue Log

The TA recommended tracking development problems formally, so the team records them as [GitHub Issues](https://github.com/AbhijeetKumar1505/SE-SEP2026-Team-050/issues?q=is%3Aissue). Each issue gives the problem, its cause, the fix and how the fix was checked, and links to the pull request that fixed it. Problems solved before we started using GitHub Issues (#15 to #23) were written up afterwards from those pull requests. Each of them says so at the top.

As of 21 November 2026 the log holds **15 issues: 10 closed and 5 open.**

### Resolved issues

| Issue | Problem and cause | Fix | Owner | Found → resolved |
|---|---|---|---|---|
| [#15](https://github.com/AbhijeetKumar1505/SE-SEP2026-Team-050/issues/15) | CI passed even when backend tests failed. The pytest step pipes into `tee`, and GitHub's default `bash -e` has no `pipefail`, so the step took the exit code of `tee`. | The job runs with `shell: bash` (`bash -eo pipefail`). PR #4 | Abhijeet Kumar | 16 Nov → 16 Nov |
| [#16](https://github.com/AbhijeetKumar1505/SE-SEP2026-Team-050/issues/16) | 9 backend tests and `flask seed-data` broke after the models were merged. Role constants were imported from the wrong module, and tests called a non-existent `/api/auth/whoami`. | Imports fixed, tests call `GET /api/auth/me`, and the files are formatted. 72 tests pass. PR #4 | Abhijeet Kumar | 16 Nov → 16 Nov |
| [#17](https://github.com/AbhijeetKumar1505/SE-SEP2026-Team-050/issues/17) | `main` wasn't protected, so changes could reach it without a review or passing CI. | The branch ruleset was turned on: pull request with 1 approval, the CI check, Copilot review, and no force-push or deletion. | Abhijeet Kumar | 16 Nov → 16 Nov |
| [#18](https://github.com/AbhijeetKumar1505/SE-SEP2026-Team-050/issues/18) | The frontend restructure (PR #3) dropped the three AI screens, the role switcher and IIC's view of student feedback. They were added while the restructure was being built and weren't carried over. | The screens were rebuilt on the new `src/api/` structure. PR #5 | Abhijeet Kumar | 16 Nov → 16 Nov |
| [#21](https://github.com/AbhijeetKumar1505/SE-SEP2026-Team-050/issues/21) | The OpenAPI tests crashed on endpoints with a URL parameter. The test helper read the path-level `parameters` list as an HTTP method. | The helper reads only HTTP methods. PR #6 | Abhijeet Kumar | 16 Nov → 16 Nov |
| [#22](https://github.com/AbhijeetKumar1505/SE-SEP2026-Team-050/issues/22) | Loading a user also loaded all of their notifications (`lazy="selectin"`), which would slow every request as notices build up. | The eager loading was removed, notices are read through a paged query, and the recipient column is indexed. PR #6 | Abhijeet Kumar | 16 Nov → 16 Nov |
| [#23](https://github.com/AbhijeetKumar1505/SE-SEP2026-Team-050/issues/23) | `pytest --cov=app.<module>` crashes inside SQLAlchemy's compiled extension. Our code isn't involved. | Closed as not planned. Workaround: measure the whole package with `--cov=app`, as CI does. | Abhijeet Kumar | 16 Nov → 21 Nov |
| [#19](https://github.com/AbhijeetKumar1505/SE-SEP2026-Team-050/issues/19) | A page refresh logged the user out, because the prototype kept the session in memory only. | The token is kept in `localStorage` and the session is restored with `GET /api/auth/me`. A 401 response signs the user out. PR #13 | Khushi Dhankhar | 16 Nov → 21 Nov |
| [#20](https://github.com/AbhijeetKumar1505/SE-SEP2026-Team-050/issues/20) | The frontend expected one `role`, but the backend returns a list of `roles`. | `toUser()` keeps the list and adds the main role, the name and the roll number. PR #13 | Khushi Dhankhar | 16 Nov → 21 Nov |
| [#7](https://github.com/AbhijeetKumar1505/SE-SEP2026-Team-050/issues/7) | CI failed on the `khushi` branch: 6 Ruff errors, and `openapi.yaml` was missing a new schema. The pre-PR checks weren't run before pushing. | `ruff check --fix`, `ruff format`, and `openapi.yaml` regenerated. 207 tests pass. PR #13 | Khushi Dhankhar | 21 Nov → 21 Nov |

### Open issues

| Issue | Problem | Next step | Owner |
|---|---|---|---|
| [#8](https://github.com/AbhijeetKumar1505/SE-SEP2026-Team-050/issues/8) | Shreya's PR #14 switches the IIC, leadership and AI pages to endpoints that aren't built yet, so those pages would show an error screen. | PR #14 stays open until the Sprint 1 IIC endpoints (SCRUM-112, 115, 118, 121) are merged. | Shreya Pal, Abhijeet Kumar |
| [#9](https://github.com/AbhijeetKumar1505/SE-SEP2026-Team-050/issues/9) | The READMEs still say only login and the notification bell use the backend. | Update both READMEs to say which pages call the API. | Khushi Dhankhar |
| [#10](https://github.com/AbhijeetKumar1505/SE-SEP2026-Team-050/issues/10) | Email verification always fails under `npm run dev`. StrictMode runs the effect twice, and the first call uses up the token. | Verify once per token in the frontend, and have the backend answer "already verified" for a reused link (SCRUM-94, SCRUM-95). | Khushi Dhankhar |
| [#11](https://github.com/AbhijeetKumar1505/SE-SEP2026-Team-050/issues/11) | `useFetch` keeps old data on screen while new data loads, and a slow, older response can overwrite a newer one. | Clear the data when the argument changes, and ignore responses that arrive after the cleanup. | Shreya Pal |
| [#12](https://github.com/AbhijeetKumar1505/SE-SEP2026-Team-050/issues/12) | A personal `opencode.json` was committed to the repository. | Stop tracking it with `git rm --cached` and add it to `.gitignore`. | Khushi Dhankhar |

### What we changed in how we work

- **CI is trustworthy and required.** A failing test now fails the check (#15), and `main` accepts changes only through a reviewed pull request that passes it (#17).
- **Run the checks before pushing.** The main README lists the backend and frontend checks to run before opening a pull request (#7).
- **Connect a page to the API only once its endpoint is merged.** That way `main` always has working pages for every role (#8).
- **Every problem becomes a GitHub Issue,** with its cause and fix, and is linked to the pull request that closes it.
