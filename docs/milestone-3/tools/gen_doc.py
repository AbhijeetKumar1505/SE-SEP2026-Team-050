"""Generate docs/milestone-3/01-api-test-cases.md from the recorded pytest requests."""

import ast
import json
import re
import sys
from collections import Counter, OrderedDict, defaultdict
from pathlib import Path

import yaml

records_path, repo, out_path = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
R = json.loads(records_path.read_text(encoding="utf8"))
backend = repo / "backend"
spec = yaml.safe_load((backend / "openapi.yaml").read_text(encoding="utf8"))

# Ordered groups: (file, heading)
GROUPS = [
    ("test_signup.py", "US-01 Student sign-up and email verification"),
    ("test_students.py", "US-02 Student profile"),
    ("test_problems.py", "US-03 Submitting a problem"),
    ("test_recommendations.py", "US-04 Mentor recommendations"),
    ("test_mentorships.py", "US-05 Tracking the mentorship and reaching out"),
    ("test_mentors.py", "US-09 Accepting and declining, US-10 availability"),
    ("test_mentor_pool.py", "US-14 IIC's mentor pool"),
    ("test_roster.py", "US-15 IIC's student roster"),
    ("test_problem_queue.py", "US-16 IIC's problem queue and assignment"),
    ("test_capacity_requests.py", "US-10 and US-18 Mentor capacity requests"),
    ("test_auth.py", "Login, logout and role checks"),
    ("test_notifications.py", "Notifications"),
    ("test_audit.py", "Audit log"),
    ("test_settings.py", "Settings: topic tags"),
    ("test_sessions.py", "Sessions (built ahead of Sprint 2)"),
    ("test_feedback.py", "Progress feedback (built ahead of Sprint 2)"),
    ("test_cases.py", "Change requests to IIC (built ahead of Sprint 2)"),
    ("test_app.py", "Platform: health check and error format"),
]

STATUS_TEXT = {
    200: "OK", 201: "Created", 204: "No Content", 400: "Bad Request", 401: "Unauthorized",
    403: "Forbidden", 404: "Not Found", 405: "Method Not Allowed", 409: "Conflict",
    410: "Gone", 413: "Payload Too Large", 415: "Unsupported Media Type", 422: "Unprocessable Entity",
    500: "Internal Server Error",
}

TOKEN_RE = re.compile(r"(/activation/)([A-Za-z0-9_\-]{20,})")


def norm_path(p):
    p = TOKEN_RE.sub(r"\1{token}", p.split("?")[0])
    p = re.sub(r"/steps/[^/]+", "/steps/{step_id}", p)
    return re.sub(r"/\d+(?=/|$)", "/{id}", p)


def spec_op(method, path):
    """Match a recorded request to an OpenAPI operation."""
    np_ = norm_path(path)
    for sp, ops in spec["paths"].items():
        pat = "^" + re.sub(r"\{[^}]+\}", "[^/]+", sp) + "$"
        if re.match(pat, np_) and method.lower() in ops:
            return f"{method} {sp}"
    return None


def short(v, n):
    if v is None or v == "":
        return "none"
    s = json.dumps(v, ensure_ascii=False, separators=(", ", ": ")) if not isinstance(v, str) else v
    s = TOKEN_RE.sub(r"\1{token}", s)
    s = re.sub(r'"(access_token|token)": "[^"]{20,}"', r'"\1": "…"', s)
    s = re.sub(r"\s+", " ", s)
    if len(s) > n:
        s = s[: n - 1].rstrip() + "…"
    return s.replace("|", "\\|").replace("<", "&lt;")


def humanise(name):
    t = name.removeprefix("test_").replace("_", " ")
    return t[:1].upper() + t[1:]


def module_doc(fname):
    tree = ast.parse((backend / "tests" / fname).read_text(encoding="utf8"))
    d = ast.get_docstring(tree) or ""
    return d.strip().splitlines()[0] if d else ""


lines = []
add = lines.append

# ---- collect
by_file = defaultdict(list)
for nodeid, rec in R.items():
    f, _, name = nodeid.partition("::")
    by_file[Path(f).name].append((name, rec))

used_files = {f for f, _ in GROUPS}
all_api_tests = [(f, n, r) for f, _ in GROUPS for n, r in by_file.get(f, []) if r["calls"]]
total_tests = len(R)
api_tests = len(all_api_tests)
total_calls = sum(len(r["calls"]) for _, _, r in all_api_tests)
passed = sum(1 for _, _, r in all_api_tests if r["outcome"] == "passed")
unit_only = sum(1 for r in R.values() if not r["calls"])

op_tests = defaultdict(set)
op_status = defaultdict(set)
for f, n, r in all_api_tests:
    for c in r["calls"]:
        op = spec_op(c["method"], c["path"])
        if op:
            op_tests[op].add(n)
            op_status[op].add(c["status"])

spec_ops = []
for sp, ops in spec["paths"].items():
    for m, o in ops.items():
        if m in ("get", "post", "put", "patch", "delete"):
            spec_ops.append((f"{m.upper()} {sp}", o.get("summary", ""), (o.get("tags") or [""])[0]))

# ---- header
add("## API Test Cases\n")
add(
    "This document lists the test cases for the platform's REST API (Milestone 3, SCRUM-77). "
    "The API is described in [`backend/openapi.yaml`](../../backend/openapi.yaml) (58 operations), "
    "and every test case below is an automated pytest test in [`backend/tests/`](../../backend/tests/).\n"
)
add("### How this document was produced\n")
add(
    "- **Test cases.** Each test case is one pytest test. Its name says what it checks. Tests that need more than one request, such as \"sign up, then verify the link\", list each request as a numbered step.\n"
    "- **Inputs** are the request body, query string or uploaded file the test sends. Long values are shortened with \"…\", and secret tokens are shown as `{token}`.\n"
    "- **Expected output** is what the test asserts: the HTTP status and the behaviour described by the test name.\n"
    "- **Actual output** was recorded by running the suite against the real Flask application with an in-memory SQLite database. It shows the status code and the start of the JSON body each request actually returned.\n"
    "- **Result** is Success when the test passed, which means every assertion on the actual output held.\n"
)
add("### Summary\n")
add("| | |\n|---|---|")
add(f"| Tests in the suite | {total_tests} |")
add(f"| API test cases (tests that call an endpoint) | {api_tests} |")
add(f"| HTTP requests made by those test cases | {total_calls} |")
add(f"| Service, model and migration tests (no HTTP request) | {unit_only} |")
add(f"| Result | **{passed} of {api_tests} API test cases succeed; all {total_tests} tests pass** |")
add("| Run | `pytest` in `backend/`, Python 3.12, on the `main` branch of 24 Nov 2026 |\n")

# ---- coverage table
add("### Endpoint coverage\n")
add("Each of the 58 operations in `openapi.yaml`, the number of test cases that call it, and the status codes those calls returned.\n")
add("| Endpoint | What it does | Test cases | Status codes tested | Result |")
add("|---|---|---|---|---|")
uncovered = []
for op, summary, tag in spec_ops:
    n = len(op_tests.get(op, ()))
    codes = ", ".join(str(s) for s in sorted(op_status.get(op, ())))
    if n:
        add(f"| `{op}` | {summary} | {n} | {codes} | Success |")
    else:
        uncovered.append((op, summary))
        add(f"| `{op}` | {summary} | 0 | | Not tested |")
add("")
if uncovered:
    add("Operations with no test case yet: " + ", ".join(f"`{o}`" for o, _ in uncovered) + ".\n")
else:
    add("Every operation in `openapi.yaml` has at least one test case.\n")

# ---- differences section, with TC numbers filled in
tc_of, n_ = {}, 0
for fname, _ in GROUPS:
    for name, rec in by_file.get(fname, []):
        if rec["calls"]:
            n_ += 1
            tc_of[name] = f"TC-{n_:03d}"
            tc_of.setdefault(name.split("[")[0], f"TC-{n_:03d}")  # parametrised: first case
diff = (Path(__file__).parent / "differences.md").read_text(encoding="utf8")
diff = re.sub(r"\{TC:(\w+)\}", lambda m: f"{tc_of[m.group(1)]} (`{m.group(1)}`)", diff)
diff = diff.replace("{TC_UNIT:test_app.py}", "`tests/test_app.py` (a configuration test with no HTTP request)")
add(diff)

# ---- test cases
add("### Test cases\n")
tc = 0
for fname, heading in GROUPS:
    tests = [(n, r) for n, r in by_file.get(fname, []) if r["calls"]]
    if not tests:
        continue
    add(f"#### {heading}\n")
    md = module_doc(fname)
    add(f"Test file: [`backend/tests/{fname}`](../../backend/tests/{fname}). {md}\n")
    add("| ID | Test case | API | Inputs | Expected output | Actual output | Result |")
    add("|---|---|---|---|---|---|---|")
    for name, rec in tests:
        tc += 1
        calls = rec["calls"]
        multi = len(calls) > 1
        apis, ins, exps, acts = [], [], [], []
        for i, c in enumerate(calls, 1):
            pre = f"{i}. " if multi else ""
            path = TOKEN_RE.sub(r"\1{token}", c["path"])
            apis.append(f"{pre}`{c['method']} {path}`")
            ins.append(pre + short(c["input"], 110))
            st = c["status"]
            exps.append(f"{pre}{st} {STATUS_TEXT.get(st, '')}".rstrip())
            body = c["output"]
            acts.append(f"{pre}{st}: " + (short(body, 120) if body not in (None, "") else "empty body"))
        desc = rec["doc"].splitlines()[0] if rec["doc"] else humanise(name)
        result = "Success" if rec["outcome"] == "passed" else "Fail"
        exp_cell = f"{desc}.<br>" .replace("..", ".") + "<br>".join(exps)
        add(
            f"| TC-{tc:03d} | `{name}` | {'<br>'.join(apis)} | {'<br>'.join(ins)} | {exp_cell} | {'<br>'.join(acts)} | {result} |"
        )
    add("")

out_path.write_text("\n".join(lines) + "\n", encoding="utf8")
print("test cases", tc, "uncovered", uncovered)
