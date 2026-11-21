#!/usr/bin/env bash
# Set up this project to run inside WSL. Safe to run again; each step skips what is already done.
#
#   bash scripts/wsl/setup.sh
#
# Installs, without sudo:
#   - a Python 3.12 virtual environment (the version CI uses) in ~/.venvs/se-sep2026-team-050,
#     with the backend's development requirements. Set SE050_VENV to use another folder.
#   - the frontend's packages, built for Linux (npm ci replaces a node_modules made on Windows)
#   - Mailpit, a local mail catcher, as a systemd user service: the backend sends to it on
#     127.0.0.1:1025 and its inbox is at http://localhost:8025
#   - backend/.env pointing the backend at Mailpit, if there is no backend/.env yet
# Then it brings the development database up to date and adds the sample data.
#
# Start the servers afterwards with: bash scripts/wsl/dev.sh up
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
VENV="${SE050_VENV:-$HOME/.venvs/se-sep2026-team-050}"
PYTHON_VERSION=3.12
MAILPIT_VERSION=v1.33.1
MAILPIT_SHA256=84d7fe375ebef25df26758984dc0d5d5e17d8c0734cb2e77be7873b14ab51716  # from the GitHub release
BIN="$HOME/.local/bin"
UNIT_DIR="$HOME/.config/systemd/user"

step() { printf '\n==> %s\n' "$*"; }

step "Python $PYTHON_VERSION virtual environment in $VENV"
if command -v uv >/dev/null; then
  # uv downloads Python 3.12 into ~/.local/share/uv if the system has another version.
  uv venv --allow-existing --python "$PYTHON_VERSION" "$VENV"
  uv pip install --python "$VENV/bin/python" -r "$ROOT/backend/requirements-dev.txt"
else
  python3 -m venv "$VENV"  # uses the system Python, which must be 3.12 or later
  "$VENV/bin/pip" install -r "$ROOT/backend/requirements-dev.txt"
fi

step "Frontend packages for Linux"
(cd "$ROOT/frontend" && npm ci --no-audit --no-fund)

step "Mailpit $MAILPIT_VERSION"
if [ "$(uname -m)" != "x86_64" ]; then
  echo "This script downloads Mailpit for x86_64; this machine is $(uname -m). Install Mailpit by hand." >&2
  exit 1
fi
mkdir -p "$BIN" "$UNIT_DIR"
if ! "$BIN/mailpit" version 2>/dev/null | grep -q "${MAILPIT_VERSION#v}"; then
  download="$(mktemp -d)"
  trap 'rm -rf "$download"' EXIT
  curl -fsSL -o "$download/mailpit.tar.gz" \
    "https://github.com/axllent/mailpit/releases/download/$MAILPIT_VERSION/mailpit-linux-amd64.tar.gz"
  echo "$MAILPIT_SHA256  $download/mailpit.tar.gz" | sha256sum --check --quiet
  tar -xzf "$download/mailpit.tar.gz" -C "$download" mailpit
  install -m 755 "$download/mailpit" "$BIN/mailpit"
fi
cat > "$UNIT_DIR/mailpit.service" <<EOF
[Unit]
Description=Mailpit: catches the emails the mentoring platform sends in development

[Service]
ExecStart=$BIN/mailpit --smtp 127.0.0.1:1025 --listen 127.0.0.1:8025
Restart=on-failure

[Install]
WantedBy=default.target
EOF
systemctl --user daemon-reload
systemctl --user enable mailpit.service
systemctl --user restart mailpit.service

step "backend/.env"
if [ ! -f "$ROOT/backend/.env" ]; then
  cat > "$ROOT/backend/.env" <<'EOF'
# Written by scripts/wsl/setup.sh. Emails go to Mailpit; read them at http://localhost:8025.
MAIL_SUPPRESS_SEND=false
MAIL_SERVER=127.0.0.1
MAIL_PORT=1025
MAIL_USE_TLS=false
EOF
  echo "Created backend/.env (emails go to Mailpit)."
else
  echo "backend/.env already exists; left as it is. To use Mailpit it needs:"
  echo "  MAIL_SUPPRESS_SEND=false, MAIL_SERVER=127.0.0.1, MAIL_PORT=1025, MAIL_USE_TLS=false"
fi

step "Development database"
cd "$ROOT/backend"
"$VENV/bin/flask" db upgrade
"$VENV/bin/flask" seed-data

step "Done"
echo "Start the servers:  bash scripts/wsl/dev.sh up"
echo "Mailpit inbox:      http://localhost:8025"
