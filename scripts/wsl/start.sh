#!/usr/bin/env bash
# Start the API, the web app and Mailpit inside WSL, and open one terminal per server that shows
# its log live: three tabs in a Windows Terminal window, or three console windows without it.
#
#   bash scripts/wsl/start.sh     stop everything with: bash scripts/wsl/stop.sh
#
# The servers run in the background as systemd user services, so closing a log terminal leaves
# its server running. Both reload when a file is saved, including from Windows. Running start.sh
# again starts only what is stopped and reopens only the logs that are closed.
# Run scripts/wsl/setup.sh once first.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
VENV="${SE050_VENV:-$HOME/.venvs/se-sep2026-team-050}"
DISTRO="${WSL_DISTRO_NAME:?Run this inside WSL.}"

if [ ! -x "$VENV/bin/flask" ]; then
  echo "No Python environment in $VENV. Run: bash scripts/wsl/setup.sh" >&2
  exit 1
fi

# Servers
systemctl --user start mailpit.service
if ! systemctl --user is-active --quiet se050-api; then
  # The stat reloader notices files saved from Windows, which inotify on /mnt does not.
  systemd-run --user --quiet --collect --unit=se050-api --working-directory="$ROOT/backend" \
    --setenv=PYTHONUNBUFFERED=1 \
    "$VENV/bin/flask" run --reload
fi
if ! systemctl --user is-active --quiet se050-web; then
  # VITE_POLL makes Vite check the files for changes, for the same reason (see vite.config.js).
  systemd-run --user --quiet --collect --unit=se050-web --working-directory="$ROOT/frontend" \
    --setenv=PATH="$PATH" --setenv=VITE_POLL=1 \
    "$(command -v npm)" run dev
fi

# Log terminals
open_log() {
  local server=$1 title=$2
  if pgrep -u "$(id -u)" -f "scripts/wsl/follow.sh $server\$" >/dev/null; then
    echo "The $title log is already open."
    return
  fi
  local command=(wsl.exe -d "$DISTRO" --cd "$ROOT" -e bash scripts/wsl/follow.sh "$server")
  if command -v wt.exe >/dev/null; then
    wt.exe -w se050 new-tab --title "$title" --suppressApplicationTitle "${command[@]}"
  else
    cmd.exe /c start "$title" "${command[@]}"
  fi
  echo "Opened the $title log."
}

open_log api "API (Flask)"
open_log web "Web app (Vite)"
open_log mail "Mailpit"

echo
for unit in se050-api se050-web mailpit; do
  printf '%-10s %s\n' "$unit" "$(systemctl --user is-active "$unit" 2>/dev/null || true)"
done
echo
echo "API:      http://localhost:5000/api/health  (Swagger UI: http://localhost:5000/api/docs/swagger)"
echo "Web app:  http://localhost:5173"
echo "Mailpit:  http://localhost:8025"
