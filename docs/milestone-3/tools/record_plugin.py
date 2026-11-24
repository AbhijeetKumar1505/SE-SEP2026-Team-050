"""pytest plugin: records every Flask test-client request/response per test, writes JSON."""

import json
import os

import pytest
from flask.testing import FlaskClient

RECORDS = {}
_current = {"id": None}
_orig_open = FlaskClient.open


def _summarise_input(kwargs):
    if "json" in kwargs:
        return kwargs["json"]
    data = kwargs.get("data")
    if isinstance(data, dict):
        out = {}
        for k, v in data.items():
            if isinstance(v, tuple):
                fname = v[1] if len(v) > 1 else "file"
                try:
                    content = v[0].getvalue()
                    content = content.decode("utf8", "replace") if isinstance(content, bytes) else content
                except Exception:
                    content = ""
                out[k] = {"file": fname, "content": content[:300]}
            else:
                out[k] = v
        return out
    return None


def _open(self, *args, **kwargs):
    resp = _orig_open(self, *args, **kwargs)
    if _current["id"]:
        try:
            req = resp.request
            path = req.path + (("?" + req.query_string.decode()) if req.query_string else "")
            method = req.method
        except Exception:
            path, method = str(args[0]) if args else "?", kwargs.get("method", "?")
        try:
            body = resp.get_json(silent=True)
        except Exception:
            body = None
        RECORDS[_current["id"]]["calls"].append(
            {
                "method": method,
                "path": path,
                "input": _summarise_input(kwargs),
                "status": resp.status_code,
                "output": body if body is not None else resp.get_data(as_text=True)[:200],
            }
        )
    return resp


FlaskClient.open = _open


@pytest.hookimpl(tryfirst=True)
def pytest_runtest_setup(item):
    doc = getattr(item.function, "__doc__", None)
    RECORDS[item.nodeid] = {"doc": (doc or "").strip(), "calls": [], "outcome": None}
    _current["id"] = item.nodeid


@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_makereport(item, call):
    outcome = yield
    rep = outcome.get_result()
    if item.nodeid in RECORDS and (rep.when == "call" or rep.failed):
        RECORDS[item.nodeid]["outcome"] = rep.outcome


def pytest_sessionfinish(session):
    path = os.environ.get("RECORD_OUT", "records.json")
    with open(path, "w", encoding="utf8") as f:
        json.dump(RECORDS, f, indent=1, default=str)
