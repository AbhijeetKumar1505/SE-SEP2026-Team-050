"""Logging setup: one readable format, and one line per request."""

import logging
import time

from flask import g, request

LOG_FORMAT = "%(asctime)s %(levelname)s %(name)s: %(message)s"


def configure_logging(app) -> None:
    level = getattr(logging, str(app.config.get("LOG_LEVEL", "INFO")).upper(), logging.INFO)
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter(LOG_FORMAT))
    app.logger.handlers = [handler]
    app.logger.setLevel(level)
    app.logger.propagate = False

    @app.before_request
    def start_timer():
        g.request_started = time.perf_counter()

    @app.after_request
    def log_request(response):
        started = g.pop("request_started", None)
        elapsed = (time.perf_counter() - started) * 1000 if started else 0
        app.logger.info("%s %s -> %s (%.0f ms)", request.method, request.path, response.status_code, elapsed)
        return response
