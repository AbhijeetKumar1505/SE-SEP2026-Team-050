#!/usr/bin/env bash
# Run the development servers inside WSL as systemd user services, so they keep running in the
# background and their logs are kept. Run scripts/wsl/setup.sh once first.
#
#   bash scripts/wsl/dev.sh up                 start the API, the web app and Mailpit
#   bash scripts/wsl/dev.sh down               stop the API and the web app (Mailpit keeps running)
#   bash scripts/wsl/dev.sh restart            down, then up
#   bash scripts/wsl/dev.sh status             show what is running
#   bash scripts/wsl/dev.sh logs api|web|mail  follow a log (Ctrl+C stops following, not the server)
#
# Both servers reload when a file changes, including changes saved from Windows.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
VENV="${SE050_VENV:-$HOME/.venvs/se-sep2026-team-050}"
API=se050-api
WEB=se050-web

unit_for() {
  case "$1" in
    api) echo "$API" ;;
    web) echo "$WEB" ;;
    mail) echo mailpit ;;
    *) echo "Unknown server '$1'; use api, web or mail." >&2; exit 2 ;;
  esac
}

up() {
  if [ ! -x "$VENV/bin/flask" ]; then
    echo "No virtual environment in $VENV. Run: bash scripts/wsl/setup.sh" >&2
    exit 1
  fi
  systemctl --user start mailpit.service
  if ! systemctl --user is-active --quiet "$API"; then
    # The stat reloader notices files saved from Windows, which inotify on /mnt does not.
    systemd-run --user --quiet --collect --unit="$API" --working-directory="$ROOT/backend" \
      --setenv=PYTHONUNBUFFERED=1 \
      "$VENV/bin/flask" run --reload
  fi
  if ! systemctl --user is-active --quiet "$WEB"; then
    systemd-run --user --quiet --collect --unit="$WEB" --working-directory="$ROOT/frontend" \
      --setenv=PATH="$PATH" --setenv=VITE_POLL=1 \
      "$(command -v npm)" run dev
  fi
  status
}

down() {
  systemctl --user stop "$API" "$WEB" 2>/dev/null || true
  echo "Stopped the API and the web app. Mailpit is still running (systemctl --user stop mailpit)."
}

status() {
  for unit in "$API" "$WEB" mailpit; do
    printf '%-10s %s\n' "$unit" "$(systemctl --user is-active "$unit" 2>/dev/null || true)"
  done
  echo
  echo "API:      http://localhost:5000/api/health  (Swagger UI: http://localhost:5000/api/docs/swagger)"
  echo "Web app:  http://localhost:5173"
  echo "Mailpit:  http://localhost:8025"
}

case "${1:-}" in
  up) up ;;
  down) down ;;
  restart) down; up ;;
  status) status ;;
  logs) journalctl --user --unit "$(unit_for "${2:-api}")" --follow --output cat ;;
  *) sed -n '2,11p' "$0"; exit 2 ;;
esac
